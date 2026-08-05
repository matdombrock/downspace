import { registerAction } from '../src/lib/actions';

/** Fallback for browsers without the async Clipboard API. */
function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

registerAction({
  id: 'copy-html',
  title: 'Copy as HTML',
  description: 'Copy the rendered note as HTML to the clipboard',
  icon: 'fa-clipboard',
  keywords: ['copy', 'html', 'clipboard', 'paste'],
  async run({ note }) {
    if (!note) throw new Error('No note is open');
    const viewer = document.querySelector('[data-note-viewer]');
    if (!viewer) throw new Error('No note is open');

    // Rendered content minus scripts; make local image URLs absolute so the
    // pasted HTML works outside the app.
    const html = viewer.innerHTML
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<script\b[^>]*\/>/gi, '')
      .replace(/src="\/(f\/[^"]+)"/g, (m, p: string) => `src="${window.location.origin}/${p}"`);

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(html);
    } else {
      fallbackCopy(html);
    }
  },
});
