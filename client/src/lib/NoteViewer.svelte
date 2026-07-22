<script lang="ts">
  import { marked } from 'marked';
  import { settingsStore } from './settings';
  import type { Note } from './types';
  import mermaid from 'mermaid';

  let mermaidInited = false;
  function ensureMermaid(theme: string) {
    if (mermaidInited) return;
    mermaidInited = true;
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'light' ? 'default' : 'dark',
    });
  }

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

  let viewerRef: HTMLDivElement;

  let rendered = $derived.by(() => {
    const s = $settingsStore;

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

    const ALERT_ICONS: Record<string, string> = {
      note: 'fa-circle-info',
      tip: 'fa-lightbulb',
      important: 'fa-circle-exclamation',
      warning: 'fa-triangle-exclamation',
      caution: 'fa-circle-exclamation',
    };

    renderer.blockquote = function ({ tokens }) {
      const firstPara = tokens?.[0];
      if (firstPara?.type === 'paragraph') {
        const firstTok = firstPara.tokens?.[0];
        if (firstTok?.type === 'text') {
          const marker = firstTok.raw.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i);
          if (marker) {
            const type = marker[1].toLowerCase();
            const after = firstTok.raw.slice(marker[0].length);
            if (after) {
              firstTok.raw = after;
              firstTok.text = after;
            } else {
              firstPara.tokens.shift();
              if (firstPara.tokens.length === 0) {
                tokens.shift();
              }
            }
            const inner = marked.Parser.parse(tokens, { renderer: this });
            const label = marker[1].charAt(0) + marker[1].slice(1).toLowerCase();
            const icon = ALERT_ICONS[type] || 'fa-circle-info';
            return `<div class="alert alert-${type}"><strong class="alert-label"><i class="fas ${icon}"></i> ${label}</strong>${inner}</div>`;
          }
        }
      }
      return `<blockquote>${marked.Parser.parse(tokens, { renderer: this })}</blockquote>`;
    };

    return marked(note.content || '*Empty note*', {
      renderer,
      gfm: s.markdownFlavor === 'gfm',
      breaks: s.markdownBreaks,
    });
  });

  // Post-process rendered HTML: re-execute <script> tags and render mermaid
  $effect(() => {
    const s = $settingsStore;
    rendered;
    if (!viewerRef) return;

    // Re-execute <script> tags (innerHTML skips them)
    for (const old of viewerRef.querySelectorAll('script')) {
      const el = document.createElement('script');
      if (old.src) el.src = old.src;
      else el.textContent = old.textContent;
      old.replaceWith(el);
    }

    // Render mermaid diagrams
    const codeBlocks = viewerRef.querySelectorAll('pre > code.language-mermaid');
    if (codeBlocks.length === 0) return;

    // Remove any previously rendered mermaid elements
    for (const old of viewerRef.querySelectorAll('.mermaid')) {
      old.remove();
    }

    // Initialize mermaid with the correct theme
    ensureMermaid(s.theme);

    for (const code of codeBlocks) {
      const pre = code.parentElement!;
      const source = code.textContent || '';
      const preMermaid = document.createElement('pre');
      preMermaid.className = 'mermaid';
      preMermaid.textContent = source;
      pre.replaceWith(preMermaid);
    }

    mermaid.run({ querySelector: '.mermaid' }).catch(() => {});
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
  <div role="presentation" class="markdown viewer-content" bind:this={viewerRef} onclick={handleClick}>
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

  .viewer-content :global(.alert) {
    border-left: 4px solid var(--accent);
    background: var(--bg-secondary);
    border-radius: var(--radius);
    padding: 12px 16px;
    margin: 16px 0;
  }

  .viewer-content :global(.alert > :first-child) {
    margin-top: 0;
  }

  .viewer-content :global(.alert > :last-child) {
    margin-bottom: 0;
  }

  .viewer-content :global(.alert-label) {
    font-size: 0.9em;
  }

  .viewer-content :global(.alert-label i) {
    margin-right: 6px;
  }

  .viewer-content :global(.alert > .alert-label + p),
  .viewer-content :global(.alert > .alert-label + p:first-of-type) {
    display: inline;
  }

  .viewer-content :global(.alert-note) {
    border-color: #58a6ff;
  }
  .viewer-content :global(.alert-note .alert-label) {
    color: #58a6ff;
  }

  .viewer-content :global(.alert-tip) {
    border-color: #3fb950;
  }
  .viewer-content :global(.alert-tip .alert-label) {
    color: #3fb950;
  }

  .viewer-content :global(.alert-important) {
    border-color: #a371f7;
  }
  .viewer-content :global(.alert-important .alert-label) {
    color: #a371f7;
  }

  .viewer-content :global(.alert-warning) {
    border-color: #d29922;
  }
  .viewer-content :global(.alert-warning .alert-label) {
    color: #d29922;
  }

  .viewer-content :global(.alert-caution) {
    border-color: #f85149;
  }
  .viewer-content :global(.alert-caution .alert-label) {
    color: #f85149;
  }

  .viewer-content :global(.mermaid) {
    overflow-x: auto;
    margin: 16px 0;
    text-align: center;
  }
</style>
