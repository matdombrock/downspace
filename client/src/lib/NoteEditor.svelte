<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { EditorState } from '@codemirror/state';
  import { markdown } from '@codemirror/lang-markdown';
  import { keymap } from '@codemirror/view';
  import { indentWithTab } from '@codemirror/commands';
  import { vim } from '@replit/codemirror-vim';
  import { oneDark } from '@codemirror/theme-one-dark';
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

  function editorTheme() {
    return oneDark;
  }

  // ─── Build extensions ──────────────────────────────────────────────────

  const _settings = loadSettings();

  function createExtensions(content: string, saveFn: () => void) {
    return [
      basicSetup,
      markdown(),
      _settings.vimMode ? vim() : [],
      editorTheme(),
      keymap.of([
        indentWithTab,
        { key: 'Mod-s', run: () => { saveFn(); return true; } },
      ]),
      EditorView.lineWrapping,
    ];
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
