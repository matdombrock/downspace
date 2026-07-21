<script lang="ts">
  import type { TreeNode } from './types';
  import Self from './TreeDir.svelte';

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
  }: Props = $props();

  let expanded = $state(false);

  // Collapse all directories when collapseKey changes
  $effect(() => {
    if (collapseKey) expanded = false;
  });

  function toggle() {
    expanded = !expanded;
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
    <button class="btn-icon tree-btn danger" title="Delete directory" onclick={(e) => { e.stopPropagation(); onDeleteDirectory(dir.path); }}>
      <i class="fas fa-times fa-xs"></i>
    </button>
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
        />
      {/each}
      {#each subnotes as note (note.path)}
        <button
          class="tree-note"
          class:active={selectedNotePath === note.path}
          onclick={() => onSelectNote(note.path)}
        >
          {#if showFileIcons}<span class="tree-dot"><i class="fas fa-file-lines"></i></span>{/if}
          <span class="tree-label">{note.name}</span>
        </button>
      {/each}

      {#each subfiles as file (file.path)}
        <button
          class="tree-note"
          onclick={() => window.open('/f/' + file.path, '_blank')}
        >
          {#if showFileIcons}<span class="tree-dot"><i class="fas fa-file"></i></span>{/if}
          <span class="tree-label">{file.name}</span>
        </button>
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
</style>
