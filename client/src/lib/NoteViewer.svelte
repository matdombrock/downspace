<script lang="ts">
  import { marked } from 'marked';
  import { get } from 'svelte/store';
  import { settingsStore } from './settings';
  import type { Note } from './types';
  import mermaid from 'mermaid';
  import 'katex/dist/katex.min.css';
  import katex from 'katex';
  import renderMathInElement from 'katex/dist/contrib/auto-render.mjs';

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

  let { note, onEdit, onNavigateToNote }: Props = $props();

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
      // Check for GFM alert syntax
      const firstPara = tokens?.[0];
      if (firstPara?.type === 'paragraph') {
        const firstTok = firstPara.tokens?.[0];
        if (firstTok?.type === 'text') {
          const marker = firstTok.raw.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
          if (marker) {
            const type = marker[1].toLowerCase();
            const label = marker[1].charAt(0) + marker[1].slice(1).toLowerCase();
            const icon = ALERT_ICONS[type] || 'fa-circle-info';

            // Remove the marker text from the first text token, stripping leading whitespace
            firstTok.raw = firstTok.raw.slice(marker[0].length).replace(/^\s+/, '');
            firstTok.text = firstTok.text.slice(marker[0].length).replace(/^\s+/, '');

            // If the first text token is now empty, remove it
            if (!firstTok.raw.trim()) {
              firstPara.tokens.shift();
            }

            // Strip any leading br/whitespace tokens that came from trailing spaces after the marker
            while (
              firstPara.tokens.length > 0 &&
              (firstPara.tokens[0].type === 'br' ||
                (firstPara.tokens[0].type === 'text' &&
                  !firstPara.tokens[0].raw.trim()))
            ) {
              firstPara.tokens.shift();
            }

            // If the first paragraph has no remaining tokens, remove it from the blockquote
            if (firstPara.tokens.length === 0) {
              tokens.shift();
            }

            // Strip any following empty paragraphs/spaces from blank lines
            while (
              tokens.length > 0 &&
              (tokens[0].type === 'space' ||
                (tokens[0].type === 'paragraph' &&
                  (!tokens[0].tokens ||
                    tokens[0].tokens.length === 0 ||
                    (tokens[0].tokens.length === 1 &&
                      tokens[0].tokens[0].type === 'text' &&
                      !tokens[0].tokens[0].raw.trim()))))
            ) {
              tokens.shift();
            }

            const inner = marked.Parser.parse(tokens, { renderer: this }).trim();
            return `<div class="alert alert-${type}"><strong class="alert-label"><i class="fas ${icon}"></i> ${label}</strong><div class="alert-body">${inner}</div></div>`;
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

  // Post-process rendered HTML: re-execute <script> tags, render math, render mermaid
  $effect(() => {
    const s = $settingsStore;
    void rendered;
    if (!viewerRef) return;

    // Re-execute <script> tags (innerHTML skips them)
    for (const old of viewerRef.querySelectorAll('script')) {
      const el = document.createElement('script');
      if (old.src) el.src = old.src;
      else el.textContent = old.textContent;
      old.replaceWith(el);
    }

    // ─── LaTeX ──────────────────────────────────────────────────────────

    // 1. Always render ```math / ```latex fenced code blocks
    for (const code of viewerRef.querySelectorAll('pre > code.language-math, pre > code.language-latex')) {
      const pre = code.parentElement!;
      const source = code.textContent || '';
      const div = document.createElement('div');
      try {
        katex.render(source, div, { displayMode: true, throwOnError: false });
      } catch {
        div.textContent = source;
      }
      pre.replaceWith(div);
    }

    // 2. Render inline $...$ / $$...$$ math (only when enabled)
    if (s.inlineMath) {
      try {
        renderMathInElement(viewerRef, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      } catch {}
    }

    // ─── Mermaid ─────────────────────────────────────────────────────────

    // Remove any previously rendered mermaid elements
    for (const old of viewerRef.querySelectorAll('.mermaid')) {
      old.remove();
    }

    const mermaidBlocks = viewerRef.querySelectorAll('pre > code.language-mermaid');
    if (mermaidBlocks.length > 0) {
      ensureMermaid(s.theme);

      for (const code of mermaidBlocks) {
        const pre = code.parentElement!;
        const source = code.textContent || '';
        const preMermaid = document.createElement('pre');
        preMermaid.className = 'mermaid';
        preMermaid.textContent = source;
        pre.replaceWith(preMermaid);
      }

      mermaid.run({ querySelector: '.mermaid' }).catch(() => {});
    }
  });

  function handleClick(e: MouseEvent) {
    const link = (e.target as HTMLElement).closest('a[data-internal-link]') as HTMLAnchorElement | null;
    if (!link) return;
    e.preventDefault();
    const path = link.getAttribute('data-internal-link');
    if (path) onNavigateToNote(path);
  }

  // ─── Keybindings (view mode only) ──────────────────────────────────────

  function onKeydown(e: KeyboardEvent) {
    const s = get(settingsStore);
    if (!s.viewerKeybindings) return;

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'e') {
        e.preventDefault();
        onEdit();
      } else if (e.key === 'y') {
        e.preventDefault();
        const text = note.content;
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text);
        }
      } else if (e.key === 'u') {
        e.preventDefault();
        const url = window.location.href;
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(url);
        }
      }
    }
  }

  // Register/unregister window keydown while this component is mounted
  $effect(() => {
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

<div class="viewer">
  <div class="viewer-meta">
    <span class="viewer-path">{note.directory ? note.directory + '/' : ''}{note.name}.md</span>
    <span class="viewer-modified">Modified: {new Date(note.modified).toLocaleString()}</span>
  </div>
  <div
    role="presentation"
    class="markdown viewer-content"
    data-note-viewer
    bind:this={viewerRef}
    onclick={handleClick}
  >
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
    display: block;
    font-size: 0.9em;
    margin-bottom: 4px;
  }

  .viewer-content :global(.alert-label i) {
    margin-right: 6px;
  }

  .viewer-content :global(.alert-body > :first-child) {
    margin-top: 0;
  }

  .viewer-content :global(.alert-body > :last-child) {
    margin-bottom: 0;
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
