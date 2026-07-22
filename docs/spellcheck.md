# Spell Check

The editor has a toggle for spell check in Settings → Editor. Whether it works depends on your browser.

## Browser support

Spell check on `contenteditable` elements (which CodeMirror uses) varies by browser:

| Browser | Works? |
|---------|--------|
| Chrome (desktop + Android) | ✅ Yes |
| Edge | ✅ Yes |
| Safari | ✅ Yes |
| Firefox (desktop) | ⚠️ Inconsistent |
| Firefox (mobile / Android) | ❌ No |

## Why it doesn't work on some browsers

CodeMirror renders the editor as a `contenteditable` HTML element. The browser's native spellcheck service runs on this element, but not all browsers support spellcheck on `contenteditable`:

- **Firefox Mobile / Android** uses the Android system spellcheck service, which does not interact with `contenteditable` elements. This is a browser limitation and cannot be worked around at the application level.
- **Firefox Desktop** has had intermittent support across versions — it may or may not work depending on the Firefox release.

## Under the hood

When spell check is enabled, the editor sets these attributes on the content element to override CodeMirror's defaults:

```
spellcheck="true"
lang="en"
autocorrect="on"
autocapitalize="on"
writingsuggestions="true"
translate="yes"
```

When disabled, only `spellcheck="false"` is set (CodeMirror's defaults handle the rest).
