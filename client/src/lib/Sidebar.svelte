<script lang="ts">
  import type { TreeNode } from './types';
  import TreeDir from './TreeDir.svelte';

  type Theme = 'light' | 'dark' | 'dark-modern' | 'dark-oled';

  interface Props {
    tree: TreeNode[];
    showSettings: boolean;
    theme: Theme;
    selectedNotePath: string | null;
    onSelectNote: (path: string) => void;
    onNewNote: (dirPath: string) => void;
    onNewDirectory: (dirPath: string) => void;
    onRenameDirectory: (dirPath: string) => void;
    onDeleteDirectory: (dirPath: string) => void;
    onToggleSettings: () => void;
    onSetTheme: (t: Theme) => void;
  }

  let {
    tree,
    showSettings,
    theme,
    selectedNotePath,
    onSelectNote,
    onNewNote,
    onNewDirectory,
    onRenameDirectory,
    onDeleteDirectory,
    onToggleSettings,
    onSetTheme,
  }: Props = $props();

  let sortMode = $state<'chrono' | 'alpha'>(
    (localStorage.getItem('downspace-sort') as 'chrono' | 'alpha' | null) ?? 'chrono'
  );
  let collapseKey = $state(0);

  function toggleSort() {
    const next = sortMode === 'chrono' ? 'alpha' : 'chrono';
    sortMode = next;
    localStorage.setItem('downspace-sort', next);
  }

  function collapseAll() {
    collapseKey++;
  }

  function sortNodes(nodes: TreeNode[]): TreeNode[] {
    const sorted = [...nodes].sort((a, b) => {
      if (a.type !== b.type) {
        const order = { directory: 0, note: 1, file: 2 } as const;
        return order[a.type] - order[b.type];
      }
      if (sortMode === 'chrono') {
        const ma = a.modified ?? '';
        const mb = b.modified ?? '';
        return mb.localeCompare(ma);
      }
      return a.name.localeCompare(b.name);
    });
    return sorted.map(node => ({
      ...node,
      children: node.children ? sortNodes(node.children) : undefined,
    }));
  }

  const sortedTree = $derived(sortNodes(tree));

  const rootDirs = $derived(sortedTree.filter(n => n.type === 'directory'));
  const rootNotes = $derived(sortedTree.filter(n => n.type === 'note'));
  const rootFiles = $derived(sortedTree.filter(n => n.type === 'file'));
</script>

<div class="sidebar-content">
  <div class="sidebar-header">
    <span class="sidebar-title">Notes</span>
    <div class="sidebar-actions">
      <button class="btn-icon" title="New Note" onclick={() => onNewNote('')}>
        <i class="fas fa-plus"></i>
      </button>
      <button class="btn-icon" title="New Directory" onclick={() => onNewDirectory('')}>
        <i class="fas fa-folder-plus"></i>
      </button>
    </div>
  </div>

  {#if showSettings}
    <div class="settings-panel">
      <div class="settings-title">Theme</div>
      <button class="theme-option" class:active={theme === 'light'} onclick={() => onSetTheme('light')}>
        <i class="fas fa-sun"></i>
        <span>Light</span>
      </button>
      <button class="theme-option" class:active={theme === 'dark'} onclick={() => onSetTheme('dark')}>
        <i class="fas fa-moon"></i>
        <span>Dark</span>
      </button>
      <button class="theme-option" class:active={theme === 'dark-modern'} onclick={() => onSetTheme('dark-modern')}>
        <i class="fas fa-moon"></i>
        <span>Dark Modern</span>
      </button>
      <button class="theme-option" class:active={theme === 'dark-oled'} onclick={() => onSetTheme('dark-oled')}>
        <i class="fas fa-circle"></i>
        <span>Dark OLED</span>
      </button>
    </div>
  {:else}
    <div class="sidebar-tree">
      {#each rootDirs as dir (dir.path)}
        <TreeDir
          {dir}
          {collapseKey}
          {selectedNotePath}
          {onSelectNote}
          {onNewNote}
          {onNewDirectory}
          {onRenameDirectory}
          {onDeleteDirectory}
        />
      {/each}

      {#each rootNotes as note (note.path)}
        <button class="tree-note" class:active={selectedNotePath === note.path} onclick={() => onSelectNote(note.path)}>
          <span class="tree-dot"><i class="fas fa-file-lines"></i></span>
          <span class="tree-label">{note.name}</span>
        </button>
      {/each}

      {#each rootFiles as file (file.path)}
        <button class="tree-note" onclick={() => window.open('/f/' + file.path, '_blank')}>
          <span class="tree-dot"><i class="fas fa-file"></i></span>
          <span class="tree-label">{file.name}</span>
        </button>
      {/each}

      {#if tree.length === 0}
        <div class="tree-empty">No notes yet</div>
      {/if}
    </div>
  {/if}

  <div class="sidebar-footer">
    <button class="btn-icon" title={sortMode === 'chrono' ? 'Sorted by date' : 'Sorted A-Z'} onclick={toggleSort}>
      {#if sortMode === 'chrono'}
        <i class="fas fa-clock"></i>
      {:else}
        <i class="fas fa-sort-alpha-down"></i>
      {/if}
    </button>
    <button class="btn-icon" title="Collapse all" onclick={collapseAll}>
      <i class="fas fa-compress-alt"></i>
    </button>
    <button class="btn-icon settings-btn" title="Settings" onclick={onToggleSettings}>
      <i class="fas fa-gear"></i>
    </button>
  </div>
</div>

<style>
  .sidebar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 12px 8px;
    border-bottom: 1px solid var(--border);
  }

  .sidebar-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
  }

  .sidebar-actions {
    display: flex;
    gap: 2px;
  }

  .sidebar-tree {
    padding: 4px 0;
    overflow-y: auto;
    flex: 1;
  }

  .tree-note {
    display: flex;
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

  .tree-note:hover {
    background: var(--bg-tertiary);
  }

  .tree-note.active {
    background: var(--accent);
    color: var(--accent-text);
  }

  .tree-dot {
    font-size: 14px;
    line-height: 1;
    width: 16px;
    text-align: center;
  }

  .tree-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-empty {
    padding: 24px 16px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
  }

  .settings-panel {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
  }

  .settings-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .theme-option {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-secondary);
    color: var(--text);
    font-size: 14px;
    cursor: pointer;
    text-align: left;
    margin-bottom: 6px;
    transition: background 0.15s, border-color 0.15s;
  }

  .theme-option:hover {
    background: var(--bg-tertiary);
  }

  .theme-option.active {
    border-color: var(--accent);
    background: var(--bg-tertiary);
  }

  .theme-option i {
    width: 18px;
    text-align: center;
    color: var(--accent);
  }

  .sidebar-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    border-top: 1px solid var(--border);
  }

  .settings-btn {
    color: var(--text-muted);
    font-size: 16px;
  }

  .settings-btn:hover {
    color: var(--text);
  }
</style>
