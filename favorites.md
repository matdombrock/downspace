# Favorites

Favorites let you mark notes for quick access. The feature is entirely front-end — no API changes, no server-side state. All data lives in the same `localStorage` blob as the other settings (`downspace-settings` under the key `favorites`).

## Usage

### Toggle favorite

With a note open in view mode, click the star button in the header action bar. A filled star (▲) means the note is favorited; an outline star (☆) means it's not.

### Filter sidebar to favorites

Click the star button in the sidebar footer (bottom bar) to toggle the "Favorites" filter. When active, the sidebar tree is pruned to show only favorited notes while preserving the directory hierarchy — directories that contain no favorites are hidden. The button is highlighted with the accent color while the filter is active.

Click the button again to return to the full tree.

## Data model

Favorites are stored as an array of note file paths in the settings blob:

```json
{
  "favorites": ["Recipes/Pasta.md", "Welcome.md"],
  "theme": "dark",
  ...
}
```

The paths are relative to the `notes/` directory and always end in `.md`.

## Handling renames and deletes

Since favorites reference notes by their filesystem path, any operation that changes a note's path must also update the favorites list. The following helpers in `client/src/lib/settings.ts` keep things in sync:

### Note rename

**`updateFavoritePath(oldPath, newPath)`** — iterates over the favorites array and replaces any entry that exactly matches `oldPath` with `newPath`.

Called from `handleRenameNote` (rename from header) and `handleRenameNoteInline` (rename from sidebar context menu), after the API move succeeds.

### Note delete

**`removeFavorite(path)`** — removes the exact path from the array via `splice`.

Called from `handleDelete` (delete from header) and `handleDeleteNoteInline` (delete from sidebar context menu), after the API delete succeeds.

### Directory rename

**`updateFavoritesPrefix(oldPrefix, newPrefix)`** — iterates over all favorites and checks if each path equals `oldPrefix` or starts with `oldPrefix + '/'` (e.g. `"Recipes"` or `"Recipes/Pasta.md"`). If so, it replaces the old prefix with the new one, producing e.g. `"Cooking/Pasta.md"`.

This handles every note inside a renamed directory in a single pass.

### Directory delete

**`removeFavoritesWithPrefix(prefix)`** — filters out any favorite whose path equals `prefix` or starts with `prefix + '/'`.

This cleans up all notes that lived under a deleted directory.

### Refresh

After every update, `App.svelte` refreshes its local `favorites` state from localStorage so the UI (the header star and sidebar filter) reacts immediately.

## Files involved

| File | Role |
|------|------|
| `client/src/lib/settings.ts` | `favorites` field on the `Settings` interface, all CRUD helpers |
| `client/src/App.svelte` | Star button in header, wiring rename/delete handlers to update favorites |
| `client/src/lib/Sidebar.svelte` | `showFavorites` filter, footer star button, `filterFavorites()` tree pruner |
