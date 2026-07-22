# Drag & Drop

Notes and files can be moved between directories via drag and drop. Directories themselves are not draggable (they serve as drop targets).

## Implementation

Uses [Sortable.js](https://sortablejs.github.io/Sortable/) via a Svelte `use:sortable` action.

### How it works

- Every `.tree-children` container (inside a directory) and the root `.sidebar-tree` container is initialized as a Sortable instance.
- All instances share the same `group: 'notes'` so items can be dragged between any directory and the root.
- `sort: false` prevents reordering within the same directory (the tree sorts alphabetically on reload).
- `filter: '.tree-item'` excludes directory items from being draggable — they are valid drop targets but can't be dragged themselves.
- `animation: 150` provides smooth visual feedback during drag.

### Move lifecycle

1. User starts dragging a note or file row.
2. Sortable creates a drag ghost and shows a placeholder in the target container.
3. When dropped in a different container, `onEnd` fires.
4. If `evt.from !== evt.to`, the `onMove` callback is called with the source path and target directory path.
5. The callback calls `moveNote` or `moveFile` API, then `onUpload()` to reload the tree.

### Key files

| File | Role |
|---|---|
| `src/lib/sortable.ts` | Svelte `use:sortable` action — creates/destroys Sortable instances |
| `src/lib/TreeDir.svelte` | Applies `use:sortable` to `.tree-children`, provides `handleMove` |
| `src/lib/Sidebar.svelte` | Applies `use:sortable` to `.sidebar-tree` (root), provides `handleRootMove` |

### Data attributes

- `data-path` on note/file rows — the item's full path (used to determine the source on drop).
- `data-dir-path` on container elements — set automatically by the action (`dirPath` option), used to determine the target directory on drop.
- `data-path` is set by the template; `data-dir-path` is set by the action.

### Desktop vs mobile

Sortable.js handles both transparently — no separate touch handling needed.

### Visual feedback

- `.sortable-ghost` — placeholder shown at the insertion point (opacity reduced).
- `.sortable-drag` — cloned element that follows the cursor (slightly transparent).

### Conflict with long-press context menus

The root-level note/file rows in Sidebar use `onLongPressStart` (500ms hold for context menu). Sortable's touch handling uses a default 0ms delay on these elements since they have no `delay` option set. This means a touch-and-hold will initiate Sortable drag after a very short delay, which may interfere with the context menu.

To mitigate: if Sortable starts dragging (the element moves), the long-press timer for that element is cancelled naturally because `touchmove` fires and the existing `onLongPressMove` handler clears the timer.
