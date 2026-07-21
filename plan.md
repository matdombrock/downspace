# downspace

A self-hosted, single-user note-taking app that stores notes as plain markdown files.

## Stack

- Node.js / TypeScript
- Express (API + static serving)
- Svelte 5 (SPA frontend)
- CodeMirror 6 (editor with vim keybindings)
- marked (markdown rendering)
- Font Awesome (icons)

## Features

- **Notes**: create, edit, rename, delete — stored as `.md` files in `notes/`
- **Directories**: organize notes in subdirectories, rename, delete recursively
- **File browser**: sidebar shows all files — `.md` files open in-app, other files open in a new tab via `/f/`
- **View / Edit mode**: view renders markdown with `marked`, edit uses CodeMirror 6 with vim keybindings, syntax highlighting, line numbers
- **Internal links**: `[Pasta](Recipes/Pasta)` navigates within the app
- **Image support**: `![bot](/f/boticon2.png)` serves files from the notes directory at `/f/`
- **Multiple themes**: Light, Dark, Dark Modern, Dark OLED — selectable in sidebar settings
- **Mobile support**: responsive layout with hamburger sidebar

