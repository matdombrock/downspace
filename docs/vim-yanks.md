# Vim Yank → System Clipboard

When Vim mode is enabled in the editor, all yank operations (`y`, `Y`, `yy`, visual `y`, etc.) also copy the selected text to the system clipboard. This means you can yank text in the editor and paste it into any other application with `Ctrl+V` / `Cmd+V`.

## How it works

The `@replit/codemirror-vim` library already has built-in support for the `"+` register — yanking to `"+y` writes to `navigator.clipboard`. The patch in `NoteEditor.svelte` extends this to the default (unnamed) register:

1. **`setupClipboardYank()`** wraps the vim register controller's `pushText` method.
2. After the original `pushText` runs, if the operation was a `'yank'` **without an explicit register**, the text is also written to `navigator.clipboard`.
3. The patch runs once (guarded by a `clipboardYankPatched` flag).

## Behaviour

| Action | Register | Clipboard? |
|---|---|---|
| `y`, `Y`, `yy`, `yiw` etc. | unnamed (`""`) | ✅ |
| `"+y` (explicit clipboard register) | `+` | ✅ (handled by library) |
| `"ay`, `"by` (explicit named register) | `a`, `b`, … | ❌ |

When an explicit register is specified (e.g. `"ay`), the text goes only to that register — it is **not** copied to the system clipboard. This matches the principle that explicit register usage means the user wants to manage storage manually.
