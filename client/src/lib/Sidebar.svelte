<script lang="ts">
  import type { TreeNode } from './types';
  import type { SearchResult } from './types';
  import TreeDir from './TreeDir.svelte';
  import { searchNotes } from './api';
  import { loadSettings, saveSettings } from './settings';
  import type { Theme, SortMode } from './settings';

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

  const MIN_SIDEBAR = 180;

  const _settings = loadSettings();
  document.documentElement.style.setProperty('--sidebar-width', String(_settings.sidebarWidth) + 'px');

  let sortMode = $state<SortMode>(_settings.sort);
  let collapseKey = $state(0);

  function toggleSort() {
    const next = sortMode === 'chrono' ? 'alpha' : 'chrono';
    sortMode = next;
    const s = loadSettings();
    s.sort = next;
    saveSettings(s);
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

  // ─── Search ────────────────────────────────────────────────────────────

  let query = $state('');
  let searchMode = $state<'fulltext' | 'filename'>('filename');
  let searchResults = $state<SearchResult[]>([]);
  let searchLoading = $state(false);

  function toggleSearchMode() {
    searchMode = searchMode === 'fulltext' ? 'filename' : 'fulltext';
  }

  const sortedSearchResults = $derived(
    [...searchResults].sort((a, b) => {
      if (sortMode === 'chrono') {
        return b.modified.localeCompare(a.modified);
      }
      return a.name.localeCompare(b.name);
    })
  );

  $effect(() => {
    const q = query.trim();
    if (!q) {
      searchResults = [];
      searchLoading = false;
      return;
    }
    const currentMode = searchMode;
    searchLoading = true;
    const timer = setTimeout(async () => {
      try {
        searchResults = await searchNotes(q, currentMode);
      } catch {
        searchResults = [];
      } finally {
        searchLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });
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

  <div class="sidebar-search">
    <span class="sidebar-search-icon"><i class="fas fa-search"></i></span>
    <button class="btn-icon sidebar-search-mode" title="{searchMode === 'fulltext' ? 'Searching full text' : 'Searching file names only'}" onclick={toggleSearchMode}>
      {#if searchMode === 'fulltext'}
        <i class="fas fa-align-left"></i>
      {:else}
        <i class="fas fa-font"></i>
      {/if}
    </button>
    <input class="sidebar-search-input" type="search" placeholder="{searchMode === 'fulltext' ? 'Search full text…' : 'Search file names…'}" bind:value={query} />
    {#if query}
      <button class="btn-icon sidebar-search-clear" title="Clear" onclick={() => query = ''}>
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>

  {#if query.trim()}
    <div class="search-results">
      {#if searchLoading}
        <div class="search-status">Searching…</div>
      {:else if searchResults.length === 0}
        <div class="search-status">No results</div>
      {:else}
        <div class="search-count">{searchResults.length} result{searchResults.length === 1 ? '' : 's'}</div>
        {#each sortedSearchResults as r (r.path)}
          <button class="search-result-item" onclick={() => { query = ''; onSelectNote(r.path); }}>
            <span class="tree-dot"><i class="fas fa-file-lines"></i></span>
            <div class="search-result-body">
              <span class="search-result-title">{r.title}</span>
              <span class="search-result-path">{r.path}</span>
              {#if r.snippet}
                <span class="search-result-snippet">{r.snippet}</span>
              {/if}
            </div>
          </button>
        {/each}
      {/if}
    </div>
  {:else if showSettings}
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

  <div
    class="sidebar-resize-handle"
    onmousedown={(e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = document.documentElement.style.getPropertyValue('--sidebar-width').trim() || '280px';
      const startVal = parseInt(startW);

      function onMove(ev: MouseEvent) {
        const w = Math.max(MIN_SIDEBAR, startVal + ev.clientX - startX);
        document.documentElement.style.setProperty('--sidebar-width', w + 'px');
      }
      function onUp() {
        const w = document.documentElement.style.getPropertyValue('--sidebar-width');
        const s = loadSettings();
        s.sidebarWidth = w;
        saveSettings(s);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }}
  ></div>
</div>

<style>
  .sidebar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
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

  /* ─── Search ──────────────────────────────────────────────────────────── */

  .sidebar-search {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }

  .sidebar-search-icon {
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .sidebar-search-input {
    flex: 1;
    border: none;
    background: none;
    color: var(--text);
    font-size: 13px;
    outline: none;
    font-family: inherit;
  }

  .sidebar-search-input::placeholder {
    color: var(--text-muted);
  }

  .sidebar-search-mode {
    flex-shrink: 0;
    color: var(--text-muted);
    font-size: 12px;
    padding: 2px 4px;
  }

  .sidebar-search-mode:hover {
    color: var(--text);
  }

  .sidebar-search-clear {
    flex-shrink: 0;
    color: var(--text-muted);
    padding: 2px;
  }

  .sidebar-search-clear:hover {
    color: var(--text);
  }

  /* ─── Search results ──────────────────────────────────────────────────── */

  .search-results {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .search-status {
    padding: 24px 16px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
  }

  .search-count {
    padding: 6px 12px 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }

  .search-result-item {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 6px 12px;
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

  .search-result-item:hover {
    background: var(--bg-tertiary);
  }

  .search-result-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .search-result-title {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .search-result-path {
    font-size: 11px;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .search-result-snippet {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ─── Tree ────────────────────────────────────────────────────────────── */

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
    flex-shrink: 0;
    margin-top: 2px;
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

  /* ─── Settings panel ──────────────────────────────────────────────────── */

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

  /* ─── Footer ──────────────────────────────────────────────────────────── */

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

  /* ─── Resize handle ───────────────────────────────────────────────────── */

  .sidebar-resize-handle {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
    cursor: col-resize;
    background: transparent;
    transition: background 0.15s;
    z-index: 10;
  }

  .sidebar-resize-handle:hover,
  .sidebar-resize-handle:active {
    background: var(--accent);
  }

  @media (max-width: 768px) {
    .sidebar-resize-handle {
      display: none;
    }
  }
</style>
