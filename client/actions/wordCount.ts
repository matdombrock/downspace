import { registerAction } from '../src/lib/actions';

/** Count words in markdown content, ignoring formatting syntax. */
function countWords(content: string): number {
  const text = content
    // Drop fenced code blocks and inline code
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    // Images are dropped entirely; links keep only their display text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Strip markdown formatting markers
    .replace(/[#>*_~|]/g, ' ')
    .replace(/^\s*[-+]\s+/gm, ' ')
    .replace(/^\s*\d+[.)]\s+/gm, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}

registerAction({
  id: 'word-count',
  title: 'Word count',
  description: 'Count the words in the current note',
  icon: 'fa-font',
  keywords: ['count', 'stats', 'words'],
  run({ note }) {
    if (!note) throw new Error('No note is open');
    alert(`Word count: ${countWords(note.content)}`);
  },
});
