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

- **Notes**: create, edit, rename, delete, copy to clipboard — stored as `.md` files in `notes/`
- **Directories**: organize notes in subdirectories, rename, delete recursively
- **File browser**: sidebar shows all files — `.md` files open in-app, other files open in a new tab via `/f/`
- **Search**: full text and filename search with 300ms debounce, sortable results (chronological / alphabetical)
- **View / Edit mode**: view renders markdown with `marked`, edit uses CodeMirror 6 with vim keybindings, syntax highlighting, line numbers, bracket matching, folding
- **Editor settings**: toggle vim mode on/off, toggle file icons in sidebar — from settings panel
- **Internal links**: `[Pasta](Recipes/Pasta)` navigates within the app, URL updates via pushState
- **Image support**: `![bot](/f/boticon2.png)` serves files from the notes directory at `/f/` prefix
- **10 themes**: Light, Dark, Dark Modern, Dark OLED, Gruvbox, Everforest, Catppuccin, Nord, Tokyo Night, Dracula — themes section collapsible in settings
- **Theme setting export/import**: clear, export (`downspace.settings.json`), and import settings via settings panel
- **Collapse all**: one-click collapse of all expanded directories in the sidebar
- **Resizable sidebar**: drag handle on desktop, width remembered in settings
- **Settings consolidation**: all settings stored in a single `downspace-settings` JSON blob in localStorage
- **Mobile support**: responsive layout with hamburger sidebar, scrollable header actions

