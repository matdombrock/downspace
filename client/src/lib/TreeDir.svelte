<script lang="ts">
  import type { TreeNode } from './types';
  import Self from './TreeDir.svelte';
  import { uploadFiles } from './api';

  interface Props {
    dir: TreeNode;
    collapseKey: number;
    showFileIcons: boolean;
    selectedNotePath: string | null;
    onSelectNote: (path: string) => void;
    onNewNote: (dirPath: string) => void;
    onNewDirectory: (dirPath: string) => void;
    onRenameDirectory: (dirPath: string) => void;
    onDeleteDirectory: (dirPath: string) => void;
    onRenameFile: (filePath: string) => void;
    onDeleteFile: (filePath: string) => void;
    onRenameNote: (notePath: string) => void;
    onDeleteNote: (notePath: string) => void;
    onUpload: () => void;
  }

  let {
    dir,
    collapseKey,
    showFileIcons,
    selectedNotePath,
    onSelectNote,
    onNewNote,
    onNewDirectory,
    onRenameDirectory,
    onDeleteDirectory,
    onRenameFile,
    onDeleteFile,
    onRenameNote,
    onDeleteNote,
    onUpload,
  }: Props = $props();

  let expanded = $state(false);

  // Collapse all directories when collapseKey changes
  $effect(() => {
    if (collapseKey) expanded = false;
  });

  function toggle() {
    expanded = !expanded;
  }

  let fileInput: HTMLInputElement;

  async function handleUpload(dirPath: string) {
    fileInput.click();
    (fileInput as any)._uploadDir = dirPath;
  }

  async function onFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const dir = (input as any)._uploadDir || '';
    const files = input.files;
    if (!files || files.length === 0) return;
    try {
      await uploadFiles(files, dir);
      onUpload();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      input.value = '';
    }
  }

  const subdirs = $derived(dir.children?.filter(c => c.type === 'directory') ?? []);
  const subnotes = $derived(dir.children?.filter(c => c.type === 'note') ?? []);
  const subfiles = $derived(dir.children?.filter(c => c.type === 'file') ?? []);
</script>

<div class="tree-item">
  <div class="tree-dir" role="button" tabindex="0" aria-expanded={expanded} onclick={toggle} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}>
    <span class="tree-arrow" class:expanded>
      <i class="fas fa-chevron-right fa-xs"></i>
    </span>
    {#if showFileIcons}<span class="tree-folder"><i class="fas fa-folder"></i></span>{/if}
    <span class="tree-label">{dir.name}</span>
    <button class="btn-icon tree-btn" title="New Note" onclick={(e) => { e.stopPropagation(); onNewNote(dir.path); }}>
      <i class="fas fa-plus fa-xs"></i>
    </button>
    <button class="btn-icon tree-btn" title="Rename directory" onclick={(e) => { e.stopPropagation(); onRenameDirectory(dir.path); }}>
      <i class="fas fa-pencil-alt fa-xs"></i>
    </button>
    <button class="btn-icon tree-btn" title="Upload files" onclick={(e) => { e.stopPropagation(); handleUpload(dir.path); }}>
      <i class="fas fa-upload fa-xs"></i>
    </button>
    <button class="btn-icon tree-btn danger" title="Delete directory" onclick={(e) => { e.stopPropagation(); onDeleteDirectory(dir.path); }}>
      <i class="fas fa-times fa-xs"></i>
    </button>
    <input type="file" multiple bind:this={fileInput} onchange={onFilesSelected} style="display:none" />
  </div>

  {#if expanded}
    <div class="tree-children">
      {#each subdirs as subdir (subdir.path)}
        <Self
          dir={subdir}
          {collapseKey}
          {showFileIcons}
          {selectedNotePath}
          {onSelectNote}
          {onNewNote}
          {onNewDirectory}
          {onRenameDirectory}
          {onDeleteDirectory}
          {onRenameFile}
          {onDeleteFile}
          {onRenameNote}
          {onDeleteNote}
          {onUpload}
        />
      {/each}
      {#each subnotes as note (note.path)}
        <div class="tree-note-row" class:active={selectedNotePath === note.path}>
          <button
            class="tree-note"
            class:active={selectedNotePath === note.path}
            onclick={() => onSelectNote(note.path)}
          >
            {#if showFileIcons}<span class="tree-dot"><i class="fas fa-file-lines"></i></span>{/if}
            <span class="tree-label">{note.name}</span>
          </button>
          <button class="btn-icon tree-btn" title="Rename" onclick={() => onRenameNote(note.path)}>
            <i class="fas fa-pencil-alt fa-xs"></i>
          </button>
          <button class="btn-icon tree-btn danger" title="Delete" onclick={() => onDeleteNote(note.path)}>
            <i class="fas fa-times fa-xs"></i>
          </button>
        </div>
      {/each}

      {#each subfiles as file (file.path)}
        <div class="tree-file-row">
          <button class="tree-note" onclick={() => window.open('/f/' + file.path, '_blank')}>
            {#if showFileIcons}<span class="tree-dot"><i class="fas fa-file"></i></span>{/if}
            <span class="tree-label">{file.name}</span>
          </button>
          <button class="btn-icon tree-btn" title="Rename" onclick={() => onRenameFile(file.path)}>
            <i class="fas fa-pencil-alt fa-xs"></i>
          </button>
          <button class="btn-icon tree-btn danger" title="Delete" onclick={() => onDeleteFile(file.path)}>
            <i class="fas fa-times fa-xs"></i>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tree-item {
    display: flex;
    flex-direction: column;
  }

  .tree-dir, .tree-note {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border: none;
    background: none;
    color: var(--text);
    font-size: 14px;
    text-align: left;
    width: 100%;
    cursor: pointer;
    border-radius: 0;
    transition: background 0.1s;
  }

  .tree-dir:hover, .tree-note:hover {
    background: var(--bg-tertiary);
  }

  .tree-note.active {
    background: var(--accent);
    color: var(--accent-text);
  }

  .tree-arrow {
    display: flex;
    align-items: center;
    width: 12px;
    height: 12px;
    transition: transform 0.15s;
    color: var(--text-muted);
  }

  .tree-arrow.expanded {
    transform: rotate(90deg);
  }

  .tree-folder, .tree-dot {
    font-size: 14px;
    line-height: 1;
  }

  .tree-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-btn {
    opacity: 0;
    transition: opacity 0.1s;
    color: var(--text-muted);
    padding: 2px 4px;
  }

  .tree-btn.danger:hover {
    color: var(--danger);
  }

  .tree-dir:hover .tree-btn {
    opacity: 1;
  }

  .tree-children {
    padding-left: 36px;
  }

  .tree-note-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    cursor: default;
    transition: background 0.1s;
  }

  .tree-note-row.active {
    background: var(--accent);
    color: var(--accent-text);
  }

  .tree-note-row .tree-note {
    flex: 1;
    padding: 0;
    width: auto;
    background: none;
  }

  .tree-note-row:hover {
    background: var(--bg-tertiary);
  }

  .tree-note-row.active:hover {
    background: var(--accent-hover);
  }

  .tree-note-row .tree-btn {
    opacity: 0;
    transition: opacity 0.1s;
    color: var(--text-muted);
    padding: 2px 4px;
  }

  .tree-note-row .tree-btn.danger:hover {
    color: var(--danger);
  }

  .tree-note-row.active .tree-btn {
    color: var(--accent-text);
  }

  .tree-note-row.active .tree-btn.danger:hover {
    color: #ffcccc;
  }

  .tree-note-row:hover .tree-btn {
    opacity: 1;
  }

  .tree-file-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    cursor: default;
    transition: background 0.1s;
  }

  .tree-file-row:hover {
    background: var(--bg-tertiary);
  }

  .tree-file-row .tree-note {
    flex: 1;
    padding: 0;
    width: auto;
  }

  .tree-file-row:hover .tree-note {
    background: none;
  }

  .tree-file-row .tree-btn {
    opacity: 0;
    transition: opacity 0.1s;
    color: var(--text-muted);
    padding: 2px 4px;
  }

  .tree-file-row .tree-btn.danger:hover {
    color: var(--danger);
  }

  .tree-file-row:hover .tree-btn {
    opacity: 1;
  }
</style>
