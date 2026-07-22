<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorView } from 'codemirror';
  import { EditorState, type Extension } from '@codemirror/state';
  import { markdown } from '@codemirror/lang-markdown';
  import {
    keymap, lineNumbers, highlightActiveLineGutter,
    highlightSpecialChars, drawSelection, dropCursor,
    rectangularSelection, crosshairCursor, highlightActiveLine
  } from '@codemirror/view';
  import {
    indentWithTab, history, defaultKeymap, historyKeymap
  } from '@codemirror/commands';
  import {
    foldGutter, indentOnInput, syntaxHighlighting,
    defaultHighlightStyle, bracketMatching, foldKeymap
  } from '@codemirror/language';
  import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
  import {
    closeBrackets, autocompletion,
    closeBracketsKeymap, completionKeymap
  } from '@codemirror/autocomplete';
  import { lintKeymap } from '@codemirror/lint';
  import { vim } from '@replit/codemirror-vim';
  import { oneDark, oneDarkTheme, oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
  import { loadSettings } from './settings';
  import type { Note } from './types';

  interface Props {
    note: Note;
    onSave: (content: string) => void;
    onCancel: () => void;
  }

  let { note, onSave, onCancel }: Props = $props();

  let editorRef: HTMLDivElement;
  let editorView: EditorView;

  // ─── Editor theme ─────────────────────────────────────────────────────

  function editorTheme(highlight: boolean) {
    return highlight ? oneDark : oneDarkTheme;
  }

  // ─── Build extensions ──────────────────────────────────────────────────

  function createExtensions(content: string, saveFn: () => void) {
    const s = loadSettings();
    const extensions: Extension[] = [];

    // Line numbers
    if (s.lineNumbers) {
      extensions.push(lineNumbers());
      extensions.push(highlightActiveLineGutter());
    }

    // Always-on features (core editing)
    extensions.push(highlightSpecialChars());
    extensions.push(history());
    extensions.push(foldGutter());
    extensions.push(drawSelection());
    extensions.push(dropCursor());
    extensions.push(EditorState.allowMultipleSelections.of(true));
    extensions.push(indentOnInput());
    extensions.push(bracketMatching());
    extensions.push(rectangularSelection());
    extensions.push(crosshairCursor());
    extensions.push(highlightActiveLine());
    extensions.push(highlightSelectionMatches());

    // Markdown language support
    extensions.push(markdown());

    // Syntax highlighting
    if (s.syntaxHighlight) {
      extensions.push(syntaxHighlighting(defaultHighlightStyle, { fallback: true }));
    }

    // Autocompletion
    if (s.completions) {
      extensions.push(closeBrackets());
      extensions.push(autocompletion());
    }

    // Spell check
    extensions.push(EditorView.contentAttributes.of(
      s.spellcheck
        ? { spellcheck: 'true', lang: 'en', autocorrect: 'on', autocapitalize: 'on', writingsuggestions: 'true', translate: 'yes' }
        : { spellcheck: 'false' }
    ));

    // Vim mode
    if (s.vimMode) {
      extensions.push(vim());
    }

    // Theme
    extensions.push(editorTheme(s.syntaxHighlight));

    // Key bindings
    extensions.push(keymap.of([
      indentWithTab,
      { key: 'Mod-s', run: () => { saveFn(); return true; } },
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...closeBracketsKeymap,
      ...lintKeymap,
    ]));

    // Line wrapping
    extensions.push(EditorView.lineWrapping);

    return extensions;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────

  onMount(() => {
    editorView = createEditor(note.content);
    return () => {
      editorView?.destroy();
    };
  });

  function createEditor(content: string): EditorView {
    const state = EditorState.create({
      doc: content,
      extensions: createExtensions(content, handleSaveFromEditor),
    });
    return new EditorView({
      state,
      parent: editorRef,
    });
  }

  function handleSaveFromEditor() {
    const content = editorView.state.doc.toString();
    onSave(content);
  }

  // ─── React to note changes ─────────────────────────────────────────────

  let prevPath = $state('');

  $effect(() => {
    if (note.path !== prevPath && editorView) {
      prevPath = note.path;
      editorView.destroy();
      editorView = createEditor(note.content);
    }
  });
</script>

<div class="editor">
  <div class="editor-meta">
    <span class="editor-path">{note.directory ? note.directory + '/' : ''}{note.name}.md</span>
    <span class="editor-hint">Editing</span>
    <span class="editor-actions">
      <button class="btn-icon" title="Save (Ctrl+S)" onclick={handleSaveFromEditor}><i class="fas fa-save"></i></button>
      <button class="btn-icon" title="Cancel" onclick={onCancel}><i class="fas fa-times"></i></button>
    </span>
  </div>
  <div class="editor-cm-wrapper" bind:this={editorRef}></div>
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    height: calc(100vh - var(--header-height) - 48px);
    max-width: 800px;
    margin: 0 auto;
  }

  .editor-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    color: var(--text-secondary);
  }

  .editor-path {
    font-family: var(--font-mono);
    font-size: 12px;
    background: var(--bg-secondary);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .editor-hint {
    color: var(--accent);
    font-weight: 500;
  }

  .editor-cm-wrapper {
    flex: 1;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .editor-cm-wrapper :global(.cm-editor) {
    height: 100%;
  }

  .editor-cm-wrapper :global(.cm-scroller) {
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.6;
  }

  .editor-cm-wrapper :global(.cm-content) {
    padding: 16px;
  }

  .editor-cm-wrapper :global(.cm-gutters) {
    user-select: none;
  }

  .editor-meta :global(.btn-icon) {
    color: var(--text-secondary);
    padding: 4px 6px;
    border-radius: var(--radius);
    cursor: pointer;
    background: none;
    border: none;
    font-size: 14px;
  }

  .editor-meta :global(.btn-icon:hover) {
    background: var(--bg-tertiary);
    color: var(--text);
  }

  @media (max-width: 768px) {
    .editor {
      max-width: none;
      margin: 0;
      height: 100%;
    }

    .editor-actions {
      margin-left: auto;
    }

    .editor-actions :global(.btn-icon) {
      padding: 8px 10px;
      font-size: 16px;
    }
  }
</style>
