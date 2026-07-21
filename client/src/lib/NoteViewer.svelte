<script lang="ts">
  import { marked } from 'marked';
  import type { Note } from './types';

  interface Props {
    note: Note;
    onEdit: () => void;
    onDelete: () => void;
    onNavigateToNote: (path: string) => void;
  }

  let { note, onEdit, onDelete, onNavigateToNote }: Props = $props();

  // Resolve a path relative to the current note's directory.
  // Returns an absolute path from the notes root (no leading slash).
  function resolveNotePath(href: string): string {
    if (href.startsWith('/')) return href.slice(1);
    if (href.includes('/')) return href;
    return note.directory ? `${note.directory}/${href}` : href;
  }

  let rendered = $derived.by(() => {
    const renderer = new marked.Renderer();

    renderer.link = (token) => {
      const href = token.href;
      if (!href || /^(https?:\/\/|mailto:|#|data:|tel:)/i.test(href)) {
        return `<a href="${href}" target="_blank" rel="noopener">${token.text}</a>`;
      }
      const resolved = resolveNotePath(href).replace(/\/+/g, '/').replace(/\/$/, '');
      return `<a href="/${resolved}" data-internal-link="${resolved}">${token.text}</a>`;
    };

    renderer.image = (token) => {
      const src = token.href;
      const alt = token.text || '';
      const titleAttr = token.title ? ` title="${token.title}"` : '';
      if (!src || /^(https?:\/\/|data:)/i.test(src)) {
        return `<img src="${src}" alt="${alt}"${titleAttr}>`;
      }
      const resolved = resolveNotePath(src).replace(/\/+/g, '/').replace(/\/$/, '');
      return `<img src="/f/${resolved}" alt="${alt}"${titleAttr}>`;
    };

    return marked(note.content || '*Empty note*', { renderer });
  });

  function handleClick(e: MouseEvent) {
    const link = (e.target as HTMLElement).closest('a[data-internal-link]') as HTMLAnchorElement | null;
    if (!link) return;
    e.preventDefault();
    const path = link.getAttribute('data-internal-link');
    if (path) onNavigateToNote(path);
  }
</script>

<div class="viewer">
  <div class="viewer-meta">
    <span class="viewer-path">{note.directory ? note.directory + '/' : ''}{note.name}.md</span>
    <span class="viewer-modified">Modified: {new Date(note.modified).toLocaleString()}</span>
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div role="presentation" class="markdown viewer-content" onclick={handleClick}>
    {@html rendered}
  </div>
</div>

<style>
  .viewer {
    max-width: 800px;
    margin: 0 auto;
  }

  .viewer-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 12px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    color: var(--text-secondary);
    flex-wrap: wrap;
  }

  .viewer-path {
    font-family: var(--font-mono);
    font-size: 12px;
    background: var(--bg-secondary);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .viewer-content {
    line-height: 1.7;
    word-wrap: break-word;
  }

  .viewer-content :global(a[data-internal-link]) {
    cursor: pointer;
  }
</style>
