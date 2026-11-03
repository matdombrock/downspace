# downspace

Self-hosted, single-user note-taking app. Notes are plain markdown files on disk.

Obsidian notes but:
- Less bloat
- More cool

## AI Usage Disclaimer

- This project contains LLM output. 
- I have a deep love for programming and have been doing it professionally for over a decade. 
    - Long before AI was capable of doing it for us. 
- Downspace is a labor of love and a project that I use personally every day. 
- The goal is to build a stable, maintainable, open source tool that can be used for years to come.  

For more info, feel free to check out my personal [AI Usage Policy](https://matdombrock.com/tools.html). 

## Stack

- Backend: Node.js, TypeScript, Express
- Frontend: Svelte 5 (SPA), Vite
- Editor: CodeMirror 6 (optional Vim keybindings)
- Rendering: marked (markdown → HTML)
- Icons: Font Awesome 6

## Getting Started

### Prerequisites

Node.js 20+

### Install

```bash
git clone https://github.com/matdombrock/downspace.git
cd downspace
npm run install:all
```

### Development

```bash
npm run dev
```

App at `http://localhost:5173` (Vite dev server proxies API requests to Express on port 3000).

### Production Build

```bash
npm run build
npm start
```

Builds the SPA to `client/dist/`. Express serves it on port 3000.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Express server port |
| `NOTES` | `./notes` | Path to the notes directory |
| `AUTH_TOKEN` | _(unset)_ | Bearer token required on every `/api/*` and `/exec` request. Unset = auth disabled |
| `TRUST_PROXY` | _(unset)_ | Set to `1` behind a reverse proxy so `req.ip` is the client IP (login rate limiting) |

### Authentication

Downspace is single-user, so auth is a single shared bearer token rather than accounts.
Set `AUTH_TOKEN` to a long random string and the server locks every API route and `/exec`:

```bash
AUTH_TOKEN="$(openssl rand -hex 32)" npm start
```

The browser stores the token in `localStorage` under `downspace_token`. On load the SPA asks
`GET /api/session`; if a token is required and missing it shows the login modal, which posts to
`POST /api/login` and then reloads. The login endpoint is rate limited to 10 attempts per 15
minutes per IP (in memory, reset on restart).

`client/src/main.ts` installs a `window.fetch` interceptor that adds
`Authorization: Bearer <token>` to same-origin requests, so `<script>` blocks embedded in notes
(including the tools in `notes/tools/`) keep calling `fetch('/exec')` with no changes.

For scripts and terminals, pass the header yourself:

```bash
curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"command":"ls"}' http://localhost:3000/exec
```

`X-Auth-Token: <token>` is accepted as an alternative header. To log out in the browser, clear
localStorage or run `window.downspace.logout()`. See [docs/auth.md](docs/auth.md) for details.

**Serving on a public host**: put HTTPS in front of the app (Caddy, Traefik, nginx). Over plain
HTTP the token travels in cleartext.

## API

All endpoints prefixed with `/api`, except `/exec`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/login` | Exchange a token for confirmation (public, rate limited) |
| `GET` | `/api/session` | `{ authenticated, required }` for the SPA login gate (public) |
| `GET` | `/api/tree` | Full directory/file tree |
| `GET` | `/api/note?path=...` | Note content and metadata |
| `POST` | `/api/note` | Create or update a note |
| `DELETE` | `/api/note?path=...` | Delete a note |
| `POST` | `/api/note/move` | Rename or move a note |
| `POST` | `/api/directory` | Create a directory |
| `DELETE` | `/api/directory?path=...` | Delete a directory recursively |
| `POST` | `/api/directory/move` | Rename or move a directory |
| `DELETE` | `/api/file?path=...` | Delete a non-markdown file |
| `POST` | `/api/file/move` | Rename or move a non-markdown file |
| `POST` | `/api/upload?dir=...` | Upload files (multipart) |
| `GET` | `/api/search?q=...&mode=fulltext\|filename` | Search notes |
| `POST` | `/exec` | Run a shell command in the notes directory (body: `{ "command": "..." }`; returns `stdout`, `stderr`, `exitCode`; 30s timeout) |

Static files served under `/f/` — `/f/boticon2.png` serves `notes/boticon2.png`.

## Path Scheme

| URL | Serves |
|-----|--------|
| `/` | SPA (home) |
| `/Recipes/Pasta` | SPA → loads `notes/Recipes/Pasta.md` |
| `/f/boticon2.png` | Static file from `notes/boticon2.png` |
| `/f/Recipes/photo.jpg` | Static file from `notes/Recipes/photo.jpg` |
| `/api/note?path=x.md` | Note content as JSON |

The `/f/` prefix prevents conflicts between the SPA router and static file serving.

## License

GPL
