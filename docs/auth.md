# Authentication

Downspace is single-user, so there are no accounts. Auth is one shared bearer
token: when the server has `AUTH_TOKEN` set, every `/api/*` route and `/exec`
requires that token. When it is unset, auth is off and the app behaves exactly
as it did before (convenient for `npm run dev` on localhost).

## Server

| Env | Effect |
|-----|--------|
| `AUTH_TOKEN` | The required token. Whitespace-trimmed; empty/unset disables auth. |
| `TRUST_PROXY` | Set to `1` behind a reverse proxy so `req.ip` is the real client IP. |

- `authGuard` middleware is mounted with `app.use('/api', authGuard)` after the
  two public auth routes, and passed explicitly to `app.post('/exec', authGuard, ...)`.
- Tokens are compared with `crypto.timingSafeEqual` via `safeEqual()`;
  mismatched lengths still perform one comparison so timing does not reveal a
  prefix match.
- Static assets (`/`, `/f/`, the SPA bundle) stay public so the login modal can
  load. They contain no note content.

### Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/login` | public | Body `{ "token": "..." }`. Returns `{ ok: true, required: bool }` or 401/429. |
| `GET` | `/api/session` | public | `{ authenticated, required }` — lets the SPA decide whether to show the login modal. |
| everything else under `/api/*`, plus `/exec` | — | required | 401 `{ "error": "unauthorized" }` without a valid token. |

`AUTH_TOKEN` is accepted from either header:

```
Authorization: Bearer <token>
X-Auth-Token: <token>
```

### Rate limiting

`/api/login` allows 10 failures per IP per 15 minutes. The counter is an
in-memory `Map`, so it resets on restart and does not survive multiple
instances. Enough for a single-user box; not a general-purpose solution.

## Browser

The token lives in `localStorage` under the key `downspace_token`.

1. On mount, `App.svelte` calls `fetchSession()`.
2. If `required && !authenticated`, `Login.svelte` renders as an overlay and
   content loading is skipped.
3. On submit, `login()` posts the token to `/api/login`; on success it is
   stored and the page reloads.
4. Any 401 from `authFetch()` clears the token and dispatches the
   `downspace:auth-required` event, which re-opens the modal ("session expired").

### The fetch interceptor

Note scripts are the reason this is not just an `api.ts` concern. Notes embed
arbitrary `<script>` blocks that call the API directly — see
`notes/tools/t.md` and `notes/tools/shell.md`, which do `fetch('/exec', ...)`.

`installFetchInterceptor()` (called from `client/src/main.ts`, before the app
mounts) patches `window.fetch`:

- adds `Authorization: Bearer <token>` when a token exists,
- only for same-origin URLs (`/`, `./`, `../`, or same `origin`),
- and only when the caller has not already set `Authorization`.

Result: every existing and future note script authenticates without edits, and
third-party URLs are never sent the token.

`client/src/lib/api.ts` routes through `authFetch()` (including
`uploadFiles()`, which bypasses the shared `request()` helper) so the app shell
also reacts to 401s.

### Globals

`window.downspace` is exposed for note scripts:

| Member | Description |
|--------|-------------|
| `token()` | Current token or `null`. |
| `login(token)` | Validate and store a token; returns `Promise<boolean>`. |
| `logout()` | Clear the token and reload. |
| `requireAuth()` | Open the login modal from script. |

Because `localStorage` is origin-wide, a note script can read the token. That is
accepted: notes are trusted, first-party content.

## CLI / scripts outside the browser

Nothing is automatic — send the header yourself:

```bash
curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"command":"ls"}' https://notes.example.com/exec
```

## Deployment notes

- Always terminate TLS in front of the app (Caddy, Traefik, nginx). The token
  is a plain bearer credential.
- `container/run.sh` forwards `AUTH_TOKEN` into the container when it is set;
  `TRUST_PROXY=1` is worth setting behind a proxy.
- Rotating the token = change `AUTH_TOKEN` and restart. Existing browsers get a
  401 on the next request and are prompted to log in again.
- `POST /exec` runs arbitrary shell commands in the notes directory as the
  server user. Treat the token as equivalent to shell access on that host.
