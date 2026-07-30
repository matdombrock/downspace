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
git clone <repo-url> downspace
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

## API

All endpoints prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
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
