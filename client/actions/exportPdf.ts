import { registerAction } from '../src/lib/actions';
import katexCss from 'katex/dist/katex.min.css?url';
import faCss from '@fortawesome/fontawesome-free/css/all.min.css?url';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildDocument(title: string, bodyHtml: string): string {
  // Fixed light stylesheet — deliberately independent of the app theme so
  // the PDF always looks like a clean document.
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="${katexCss}">
<link rel="stylesheet" href="${faCss}">
<style>
  @page { margin: 2cm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1a1a1a;
    background: #ffffff;
    line-height: 1.7;
    font-size: 14px;
  }
  .pdf-content { max-width: 100%; }
  .pdf-content h1 { font-size: 1.8em; margin: 0.5em 0 0.3em; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.3em; }
  .pdf-content h2 { font-size: 1.5em; margin: 0.5em 0 0.3em; }
  .pdf-content h3 { font-size: 1.25em; margin: 0.5em 0 0.3em; }
  .pdf-content h4 { font-size: 1.1em; margin: 0.5em 0 0.3em; }
  .pdf-content p { margin: 0.5em 0; }
  .pdf-content ul, .pdf-content ol { margin: 0.5em 0; padding-left: 1.5em; }
  .pdf-content li { margin: 0.2em 0; }
  .pdf-content code {
    font-family: 'SF Mono', 'Fira Code', 'Roboto Mono', monospace;
    background: #f5f5f5;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 0.9em;
  }
  .pdf-content pre {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.5em 0;
    break-inside: avoid;
  }
  .pdf-content pre code { background: none; padding: 0; }
  .pdf-content blockquote {
    border-left: 3px solid #4a90d9;
    padding-left: 12px;
    margin: 0.5em 0;
    color: #666666;
  }
  .pdf-content table { border-collapse: collapse; margin: 0.5em 0; width: 100%; break-inside: avoid; }
  .pdf-content th, .pdf-content td { border: 1px solid #e0e0e0; padding: 6px 10px; text-align: left; }
  .pdf-content th { background: #f5f5f5; }
  .pdf-content hr { border: none; border-top: 1px solid #e0e0e0; margin: 1em 0; }
  .pdf-content img { max-width: 100%; }
  .pdf-content a { color: #357abd; }
  .math-display { overflow-x: auto; margin: 0.5em 0; }
  .mermaid { text-align: center; margin: 1em 0; break-inside: avoid; }
  .alert {
    border-left: 4px solid #4a90d9;
    background: #f5f5f5;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 16px 0;
    break-inside: avoid;
  }
  .alert > :first-child { margin-top: 0; }
  .alert > :last-child { margin-bottom: 0; }
  .alert-label { display: block; font-size: 0.9em; margin-bottom: 4px; }
  .alert-label i { margin-right: 6px; }
  .alert-body > :first-child { margin-top: 0; }
  .alert-body > :last-child { margin-bottom: 0; }
  .alert-note { border-color: #58a6ff; } .alert-note .alert-label { color: #58a6ff; }
  .alert-tip { border-color: #3fb950; } .alert-tip .alert-label { color: #3fb950; }
  .alert-important { border-color: #a371f7; } .alert-important .alert-label { color: #a371f7; }
  .alert-warning { border-color: #d29922; } .alert-warning .alert-label { color: #d29922; }
  .alert-caution { border-color: #f85149; } .alert-caution .alert-label { color: #f85149; }
</style>
</head>
<body>
<main class="pdf-content">
${bodyHtml}
</main>
<script>
  window.addEventListener('load', function () {
    window.focus();
    window.print();
    window.addEventListener('afterprint', function () { window.close(); });
  });
</script>
</body>
</html>`;
}

registerAction({
  id: 'export-pdf',
  title: 'Export to PDF',
  description: 'Export the current note to a clean PDF',
  icon: 'fa-file-pdf',
  keywords: ['print', 'download'],
  run({ note }) {
    const viewer = document.querySelector('[data-note-viewer]');
    if (!viewer) throw new Error('No note is open');

    // Use the live rendered HTML (math, mermaid, alerts already rendered) —
    // no re-rendering, so the PDF can't drift from what the viewer shows.
    const html = viewer.innerHTML
      // Note content can contain raw <script> tags (the viewer re-executes
      // them); don't execute them again in the print window.
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<script\b[^>]*\/>/gi, '')
      // Local image URLs are relative to the app; make them absolute so the
      // print window can load them.
      .replace(/src="\/(f\/[^"]+)"/g, (m, p: string) => `src="${window.location.origin}/${p}"`);

    // Open the print window synchronously (within the click's user gesture)
    // so popup blockers don't interfere.
    const win = window.open('', '_blank');
    if (!win) throw new Error('Could not open the print window (popup blocked?)');

    win.document.open();
    win.document.write(buildDocument(note?.title || 'Note', html));
    win.document.close();
  },
});
