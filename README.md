# downspace

A self-hosted, single-user note-taking app that stores notes as plain markdown files on disk. No database, no cloud, no lock-in — just your notes as `.md` files.

## Why

Most note-taking apps either live in the cloud, require a database, or lock your notes in a proprietary format. downspace takes the opposite approach:

- **Notes are plain markdown files** — open them in any editor, use `grep`, version control with git, sync with rsync.
- **No database** — the filesystem *is* the database. The app reads and writes `.md` files directly.
- **Self-hosted** — runs on any machine with Node.js. No external services.
- **Single-user** — no accounts, no auth, no multi-user overhead. Just you and your notes.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, TypeScript, Express |
| Frontend | Svelte 5 (SPA), Vite |
| Editor | CodeMirror 6 with optional Vim keybindings |
| Rendering | marked (markdown → HTML) |
| Icons | Font Awesome 6 (free) |

## Features

- **Notes** — create, edit, rename, delete, copy to clipboard. Stored as `.md` files in `notes/`.
- **Directories** — organize notes in directories. Create, rename, delete recursively.
- **File browser** — sidebar tree of all files. `.md` files open in-app; other files (images, PDFs, etc.) open in a new tab via `/f/`.
- **Search** — full-text and filename search with debounced input (300ms). Results sortable by relevance (filename prefix > substring > content match) or by date.
- **View / Edit modes** — view renders markdown via `marked`; edit uses CodeMirror 6 with syntax highlighting, line numbers, bracket matching, code folding, and optional Vim keybindings.
- **Internal links** — `[Pasta](Recipes/Pasta)` navigates within the app. URL updates via `pushState`. Back/forward browser buttons work.
- **Image support** — `![bot](/f/boticon2.png)` serves files from the `notes/` directory via the `/f/` prefix.
- **File upload** — drag or select files into any directory via the sidebar.
- **10 themes** — Light, Dark, Dark Modern, Dark OLED, Gruvbox, Everforest, Catppuccin, Nord, Tokyo Night, Dracula.
- **Settings** — toggle Vim mode, toggle file icons, change sort order. Settings are stored as a single JSON blob in `localStorage`. Export and import settings.
- **Resizable sidebar** — drag the divider to resize. Width is remembered in settings.
- **Responsive** — hamburger sidebar on mobile, scrollable header actions.
- **SPA routing** — direct URLs like `/Recipes/Pasta` load the correct note. Static files at `/f/...` don't conflict with the SPA router.

## Getting Started

### Prerequisites

- Node.js 20+

### Install

```bash
git clone <repo-url> downspace
cd downspace
npm run install:all
```

### Development

Starts both the Express server (with `tsx watch` for auto-restart) and the Vite dev server (with HMR):

```bash
npm run dev
```

The app is available at `http://localhost:5173` (Vite dev server proxies API requests to Express on port 3000).

### Production Build

```bash
npm run build
npm start
```

This builds the SPA to `client/dist/` and serves it (along with the API) from the Express server on port 3000. Visit `http://localhost:3000`.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Express server port |
| `NOTES` | `./notes` | Path to the notes directory |

## Project Structure

```
downspace/
├── client/              # Svelte 5 SPA
│   ├── src/
│   │   ├── App.svelte           # Main app component
│   │   ├── main.ts              # Entry point
│   │   └── lib/
│   │       ├── Sidebar.svelte   # File browser sidebar
│   │       ├── NoteViewer.svelte # Markdown rendered view
│   │       ├── NoteEditor.svelte # CodeMirror editor
│   │       ├── TreeDir.svelte   # Recursive directory tree
│   │       ├── ThemeToggle.svelte
│   │       ├── api.ts           # API client
│   │       ├── types.ts         # Shared types
│   │       ├── themes.ts        # Theme definitions
│   │       └── settings.ts      # Settings persistence
│   ├── index.html
│   └── vite.config.ts
├── server/              # Express API server
│   └── src/
│       └── index.ts             # API routes + static serving
├── notes/               # Your markdown notes (created on first run)
├── scripts/
│   └── dev.js           # Dev server launcher (concurrent)
├── package.json         # Root workspace scripts
└── plan.md
```

## API

All API endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tree` | Get the full directory/file tree |
| `GET` | `/api/note?path=...` | Get note content and metadata |
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

Static files (images, attachments) are served under `/f/` — e.g. `/f/boticon2.png` serves `notes/boticon2.png`.

## Path Scheme

| URL | Serves |
|-----|--------|
| `/` | SPA (home) |
| `/Recipes/Pasta` | SPA → loads `notes/Recipes/Pasta.md` |
| `/f/boticon2.png` | Static file from `notes/boticon2.png` |
| `/f/Recipes/photo.jpg` | Static file from `notes/Recipes/photo.jpg` |
| `/api/note?path=x.md` | Note content as JSON |

The `/f/` prefix prevents conflicts between the SPA router (which catches all paths for client-side routing) and static file serving. See [`static-file-paths.md`](./static-file-paths.md) for details.

## License

GPL
