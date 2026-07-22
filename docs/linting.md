# Linting

The project uses three layers of static analysis. Each catches a different class of problems.

## Layers

| Layer | Tool | Scope | Catches |
|---|---|---|---|
| Code style & correctness | ESLint | `.ts` and `.svelte` files | Unused variables, `any` types, banned patterns, a11y mistakes |
| Type errors in components | `svelte-check` | `.svelte` `<script>` blocks | Type mismatches inside Svelte files |
| Compiler warnings | Vite build | Svelte templates | Missing ARIA roles, deprecation notes |

## Scripts (all run from `client/`)

```sh
npm run lint          # ESLint — style & correctness
npm run lint:fix      # ESLint with auto-fix
```

There is no `svelte-check` script yet. The Svelte language server in your editor covers type checking for `.svelte` files during development.

## ESLint configuration

Config file: [`eslint.config.js`](../client/eslint.config.js) (flat config).

Key inclusions:

- **`typescript-eslint`** — TypeScript-aware rules (`recommended` preset).
- **`eslint-plugin-svelte`** — Svelte-specific rules (`flat/recommended` preset), including accessibility checks for template markup.
- **`globals`** — `browser` and `node` global variables so `window`, `document`, `process` etc. are recognised.

Custom overrides:

| Rule | Level | Notes |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | warn | `argsIgnorePattern: '^_'` — prefix unused params with `_` |
| `svelte/no-at-html-tags` | off | `{@html}` is intentional for rendered markdown |

## Deprecated API suppression

When a TypeScript type definition marks an API as `@deprecated` (e.g. `document.execCommand`), the compiler or LSP flags its usage. To suppress on a single call site:

```ts
// @ts-expect-error — description of why it's still needed
legacyApi();
```

This is preferred over disabling the deprecation rule globally, because it documents each trade-off explicitly.

## Adding new rules

```sh
cd client
npm install -D eslint-plugin-<name>
```

Then add the plugin and its config preset to `eslint.config.js`:

```js
import plugin from 'eslint-plugin-<name>';

export default tseslint.config(
  ...existingConfigs,
  plugin.configs['flat/recommended'],
  // or manual rules:
  { rules: { 'plugin/rule': 'error' } },
);
```

## Common patterns

### Fixing `Unexpected any`

```ts
// Bad
catch (e: any) { error = e.message; }

// Good
catch (e: unknown) {
  error = e instanceof Error ? e.message : String(e);
}
```

### Fixing stale `svelte-ignore`

If a `<!-- svelte-ignore ... -->` comment no longer suppresses any warning, remove it. The linter (`svelte/no-unused-svelte-ignore`) will flag stale comments.

### Fixing `Any` on element dataset hacks

```ts
// Bad
(fileInput as any)._uploadDir = dirPath;

// Good
fileInput.dataset.uploadDir = dirPath;
```
