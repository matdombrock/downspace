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

interface TreeNode {
  type: 'directory' | 'note' | 'file';
  path: string;
  children?: TreeNode[];
}

/** Minimal fetch helper mirroring the app's api.ts — actions stay self-contained. */
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

registerAction({
  id: 'notebook-word-count',
  title: 'Notebook word count',
  description: 'Count words across all notes',
  icon: 'fa-book',
  keywords: ['count', 'stats', 'words', 'all', 'notebook'],
  async run() {
    const tree = await fetchJson<TreeNode[]>('/api/tree');

    const notePaths: string[] = [];
    const walk = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'note') notePaths.push(node.path);
        else if (node.type === 'directory' && node.children) walk(node.children);
      }
    };
    walk(tree);

    const notes = await Promise.all(
      notePaths.map((path) =>
        fetchJson<{ content: string }>(`/api/note?path=${encodeURIComponent(path)}`),
      ),
    );
    const total = notes.reduce((sum, note) => sum + countWords(note.content), 0);

    alert(`Word count across ${notes.length} notes: ${total}`);
  },
});
