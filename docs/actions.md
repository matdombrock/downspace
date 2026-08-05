# Actions

Actions are front-end tools that run against the app — typically against the
currently open note, but they can also operate on the whole notebook. They
are plain TypeScript files that may manipulate the page directly or call the
internal API (via `client/src/lib/api.ts`). Everything is client-side: no
server changes are needed to add an action.

The system consists of three parts:

- **`client/actions/*.ts`** — one file per action. Each file registers
  itself as an action.
- **`client/src/lib/actions.ts`** — the registry. Keeps track of all
  registered actions and auto-loads every file in `client/actions/`.
- **`client/src/lib/ActionPicker.svelte`** — the UI. A wrench button in the
  header opens an overlay with a searchable list of actions.

## How it works

1. On app startup, `App.svelte` calls `loadActions()`, which imports **every**
   `.ts` file in `client/actions/` via Vite's `import.meta.glob`. Dropping a
   new file into that directory is all it takes to make a new action
   available.
2. Each action file calls `registerAction(...)` at module load time to
   register itself with the registry.
3. When a note is open in view mode, the header action bar shows a wrench
   button (right after the delete button). Clicking it opens the **action
   picker**: an overlay listing all actions with a search box.
4. Picking an action runs its `run(ctx)` function with the current context
   (`{ note }`). The picker closes and any error the action throws is shown
   in the app's error bar.

### The registry API

Defined in `client/src/lib/actions.ts`:

| Function | Description |
|----------|-------------|
| `registerAction(action)` | Registers an action. Duplicate ids are ignored with a console warning. |
| `getActions()` | All registered actions, sorted by title. |
| `loadActions()` | Imports every file in `client/actions/` (see below). |

`loadActions()` uses a **non-eager** glob (`import.meta.glob`, dynamic
imports at call time). The action files import `registerAction` from this
module, so importing them eagerly at module evaluation would create an
import cycle; the dynamic imports run only after the registry module is
fully evaluated.

## Writing an action

Create a new file in `client/actions/` (e.g. `client/actions/myAction.ts`):

```ts
import { registerAction } from '../src/lib/actions';

registerAction({
  id: 'my-action',
  title: 'My Action',
  description: 'What it does',
  icon: 'fa-bolt',            // Font Awesome class (optional)
  keywords: ['search terms'], // extra searchable terms (optional)
  async run({ note }) {
    if (!note) throw new Error('No note is open');
    // do something with note.content / note.path, call api.ts, etc.
  },
});
```

### The `Action` interface

| Field         | Type                          | Description                              |
|---------------|-------------------------------|------------------------------------------|
| `id`          | `string`                      | Unique id (duplicates are ignored with a warning) |
| `title`       | `string`                      | Display name in the picker               |
| `description` | `string` (optional)           | Shown under the title                    |
| `icon`        | `string` (optional)           | Font Awesome class, e.g. `fa-file-pdf`   |
| `keywords`    | `string[]` (optional)         | Extra search terms                       |
| `run`         | `(ctx) => void \| Promise<void>` | Executed when the action is picked    |

### The context

`run` receives an `ActionContext` — currently `{ note }` where `note` is the
open note (`Note | null`, matching the viewer's `note`). If the action
throws, the error is shown in the app's error bar. The context is defined
in `client/src/lib/actions.ts` and can be extended as actions need more
(e.g. the file tree or a refresh callback).

## The picker

The action picker (`client/src/lib/ActionPicker.svelte`) is a modal overlay:

- **Search** matches the title, description and keywords, case-insensitively.
- **Keyboard**: `↑`/`↓` navigate the highlighted item, `Enter` runs it,
  `Esc` closes. The search box is focused on open.
- Clicking an action runs it; clicking the backdrop or pressing `Esc`
  dismisses the overlay without running anything.

The picker is rendered by `App.svelte` and only reachable while a note is
open in view mode (the wrench lives in that button group), so actions always
run with a note available — though `run` should still guard against `null`.

## Example: export to PDF

`client/actions/exportPdf.ts` exports the current note to a clean PDF via
the browser's print dialog. It is the reference implementation for what an
action can do.

How it works:

1. Finds the rendered note content in the DOM via the `data-note-viewer`
   attribute on the NoteViewer content element and takes its `innerHTML`.
   Math (KaTeX), mermaid diagrams and images are already rendered there, so
   the PDF **cannot drift** from what the viewer shows — nothing is
   re-rendered.
2. Cleans the HTML: strips raw `<script>` tags from the note content (the
   viewer re-executes them; the print window shouldn't) and rewrites local
   `/f/...` image URLs to absolute URLs so the print window can load them.
3. Opens a new window **synchronously** — before any `await`, so the popup
   blocker doesn't treat it as a non-user-initiated popup — and writes a
   self-contained document into it.
4. The document uses a **fixed light stylesheet**, deliberately independent
   of the app theme: white background, dark text, light code/table/alert
   styling. The PDF always looks like a clean document, even when the app is
   in a dark theme. KaTeX and Font Awesome stylesheets are linked via Vite
   `?url` imports.
5. The print window prints itself on `load` (so images and fonts are ready)
   and closes itself after the print dialog (`afterprint`).

### Design rationale

- **Live rendered HTML, not a re-render.** Earlier versions re-ran the
  markdown pipeline (marked + KaTeX + mermaid) inside the action. That
  duplicated the viewer's rendering logic, which silently drifted when the
  viewer changed. Reading the live `innerHTML` keeps the PDF and the viewer
  in lockstep by construction.
- **New window, not same-page printing.** A self-contained document gives
  full control of the output (the fixed light stylesheet), and avoids
  printing the app's chrome. Same-page printing would inherit the app's
  theme — including a dark background in dark themes — and would need
  print CSS that every future layout feature could leak through.
- **One deliberate contract.** The only coupling between the action and the
  app is the `data-note-viewer` attribute — semantic, not a layout class.

### Known caveats

- Raw-HTML `<iframe>` embeds in a note (e.g. a YouTube embed) print blank:
  the print window is a fresh browsing context, so the embed re-instantiates
  and typically doesn't render.
- Mermaid diagrams rendered while a dark theme is active carry their dark
  colors into the light document (the diagram's theme is baked into the
  SVG at render time in the viewer).

## Files involved

| File | Role |
|------|------|
| `client/actions/*.ts` | One file per action; self-registers via `registerAction` |
| `client/src/lib/actions.ts` | Registry: `registerAction`, `getActions`, `loadActions`, `Action`/`ActionContext` types |
| `client/src/lib/ActionPicker.svelte` | Overlay UI: search, list, keyboard navigation |
| `client/src/App.svelte` | Wrench button, loads actions on mount, runs the picked action |
| `client/src/lib/NoteViewer.svelte` | `data-note-viewer` attribute on the rendered content (the export action's DOM contract) |

## Notes

- The glob pattern in `loadActions()` is `*.ts` (flat files). Change it to
  `**/*.ts` if nested action directories are wanted.
- Action files are included in `client/tsconfig.json` so the editor
  typechecks them; `npm run lint` currently only covers `src/`.
