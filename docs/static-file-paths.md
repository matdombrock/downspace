# Static File Paths

Markdown notes can reference static files (images, etc.) using markdown image syntax:

```markdown
![bot](/f/boticon2.png)
```

All static files served from the `notes/` directory are accessible under the `/f/` URL prefix.

## Why `/f/`?

Serving files at root (e.g. `/boticon2.png`) would conflict with the SPA router. The Express server has a catch-all route that serves `index.html` for any unmatched path so that the SPA can handle client-side routing (e.g. `/x`, `/Recipes/Pasta`). If we also served the notes directory at root, two problems arise:

1. **`.md` files get served as raw text** — A request to `/x.md` would return the markdown source instead of the SPA, breaking note loading.
2. **Vite dev server SPA fallback** — In development mode, Vite's built-in SPA fallback catches any request that doesn't match a known asset and serves `index.html`. A middleware added before Vite's fallback can't intercept in time, so `/boticon2.png` returns the SPA HTML instead of the image.

Using a dedicated prefix `/f/` avoids both issues:

- The Express `/f` static route is registered before the SPA catch-all, taking priority.
- The SPA catch-all explicitly skips `/f` paths.
- The Vite dev server proxies `/f` requests to Express alongside `/api`.

This gives us a clean, predictable path scheme:

| Path | Serves |
|------|--------|
| `/x` | SPA (client-side loads note) |
| `/Recipes/Pasta` | SPA (client-side loads note) |
| `/f/boticon2.png` | Static file from `notes/boticon2.png` |
| `/f/Recipes/photo.jpg` | Static file from `notes/Recipes/photo.jpg` |
| `/api/note?path=x.md` | Note content as JSON |
