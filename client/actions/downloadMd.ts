import { registerAction } from '../src/lib/actions';

registerAction({
  id: 'download-md',
  title: 'Download as .md',
  description: 'Download the current note as a Markdown file',
  icon: 'fa-download',
  keywords: ['download', 'export', 'backup'],
  run({ note }) {
    if (!note) throw new Error('No note is open');

    const blob = new Blob([note.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
});
