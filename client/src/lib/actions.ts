import type { Note } from './types';

/**
 * Context passed to an action's `run` function. Currently carries the note
 * that is open in the viewer (or null). Extend as actions need more — e.g.
 * the file tree, a refresh callback, or API helpers.
 */
export interface ActionContext {
  note: Note | null;
}

/**
 * A registered action. `id` must be unique. `run` receives the action
 * context and may be async; any thrown error is surfaced in the app's
 * error bar.
 */
export interface Action {
  id: string;
  title: string;
  description?: string;
  icon?: string; // Font Awesome class, e.g. 'fa-file-pdf'
  keywords?: string[]; // extra search terms
  run: (ctx: ActionContext) => void | Promise<void>;
}

const actions = new Map<string, Action>();

/**
 * Register an action. Called at the top level of every file in
 * `client/actions/`. Duplicate ids are ignored with a warning.
 */
export function registerAction(action: Action): void {
  if (actions.has(action.id)) {
    console.warn(`[actions] duplicate action id "${action.id}" — ignoring`);
    return;
  }
  actions.set(action.id, action);
}

/** All registered actions, sorted by title. */
export function getActions(): Action[] {
  return [...actions.values()].sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Auto-load every action file in `client/actions/`. Files register
 * themselves as a side effect of being imported. Uses a non-eager glob so
 * the dynamic imports run at call time — after this module is fully
 * evaluated — avoiding an import cycle (action files import
 * `registerAction` from this module).
 */
export async function loadActions(): Promise<void> {
  const modules = import.meta.glob('../../actions/*.ts');
  await Promise.all(Object.values(modules).map((load) => load()));
}
