# GFM Alerts

When the Markdown flavor is set to **GFM** (GitHub Flavored Markdown), the viewer renders GitHub-style alert blocks. These are blockquotes whose first line is `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, or `[!CAUTION]`.

## Syntax

```
> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.
```

## Rendering

Each alert type renders with a colored left border, icon, and bold label:

| Type | Color | Icon |
|------|-------|------|
| Note | Blue | `fa-circle-info` |
| Tip | Green | `fa-lightbulb` |
| Important | Purple | `fa-circle-exclamation` |
| Warning | Yellow | `fa-triangle-exclamation` |
| Caution | Red | `fa-circle-exclamation` |

## Multi-paragraph alerts

Standard markdown blockquote rules apply — a blank line with a `>` continues the blockquote and keeps the content inside the same alert:

```
> [!NOTE]
> First paragraph.
>
> Second paragraph.
```

## Inline content

The marker can be on the same line as content:

```
> [!TIP] This tip starts right here.
> And continues on the next line.
```

## Regular blockquotes

A blockquote that doesn't start with one of the recognized markers renders as a normal `<blockquote>`. The alert feature only activates for the exact `[!NOTE/TIP/IMPORTANT/WARNING/CAUTION]` patterns.

## Implementation

The feature is implemented as a custom `marked.Renderer.blockquote` override in `client/src/lib/NoteViewer.svelte`. When a blockquote's first text token matches the `[!...]` pattern, the marker is stripped from the token stream and the remaining content is rendered inside a `<div class="alert alert-{type}">` with an inline label and icon.

The renderer also respects the GFM flavor setting — the feature is only active (both flavor and alerts) when `markdownFlavor` is set to `'gfm'`.

See also: [`spellcheck.md`](./spellcheck.md) for browser spellcheck support.
