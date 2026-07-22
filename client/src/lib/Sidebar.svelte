<script lang="ts">
  import type { TreeNode } from './types';
  import type { SearchResult } from './types';
  import TreeDir from './TreeDir.svelte';
  import { searchNotes, uploadFiles, moveNote, moveFile } from './api';
  import { sortable } from './sortable';
  import { loadSettings, saveSettings, DEFAULTS } from './settings';
  import type { Theme, SortMode } from './settings';
  import themes from './themes';

  interface Props {
    tree: TreeNode[];
    showSettings: boolean;
    theme: Theme;
    favorites: string[];
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
    onToggleSettings: () => void;
    onToggleShell: () => void;
    onSetTheme: (t: Theme) => void;
  }

  let {
    tree,
    showSettings,
    theme,
    favorites,
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
    onToggleSettings,
    onToggleShell,
    onSetTheme,
  }: Props = $props();

  const MIN_SIDEBAR = 180;

  const _settings = loadSettings();
  const w = typeof _settings.sidebarWidth === 'number' ? _settings.sidebarWidth : parseInt(_settings.sidebarWidth);
  document.documentElement.style.setProperty('--sidebar-width', (isNaN(w) ? 280 : Math.max(180, w)) + 'px');

  let showThemes = $state(false);
  let sortMode = $state<SortMode>(_settings.sort);
  let showFileIcons = $state(_settings.showFileIcons);
  let vimModeEnabled = $state(_settings.vimMode);
  let viewerKeybindings = $state(_settings.viewerKeybindings);
  let spellcheckEnabled = $state(_settings.spellcheck);
  let lineNumbersEnabled = $state(_settings.lineNumbers);
  let syntaxHighlightEnabled = $state(_settings.syntaxHighlight);
  let completionsEnabled = $state(_settings.completions);
  let markdownFlavor = $state<'default' | 'gfm'>(_settings.markdownFlavor);
  let markdownBreaksEnabled = $state(_settings.markdownBreaks);
  let inlineMathEnabled = $state(_settings.inlineMath);
  let collapseKey = $state(0);

  let fileInput: HTMLInputElement;

  // ─── Context menu ───────────────────────────────────────────────────────

  interface ContextMenuItem {
    label: string;
    icon: string;
    action: () => void;
  }

  let contextMenu = $state<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

  function openContextMenu(el: HTMLElement, items: ContextMenuItem[], _clientY?: number) {
    const rect = el.getBoundingClientRect();
    const sidebarContent = document.querySelector('.sidebar-content');
    const contentRect = sidebarContent?.getBoundingClientRect();
    // Position relative to sidebar-content (which has position: relative)
    const x = contentRect ? rect.left - contentRect.left : rect.left;
    // Position right below the item's bottom edge
    let y = rect.bottom;
    if (contentRect) y -= contentRect.top;
    // Keep within the sidebar
    const menuHeight = items.length * 32 + 8;
    if (y + menuHeight > (contentRect?.height || window.innerHeight)) {
      y = (contentRect?.height || window.innerHeight) - menuHeight - 8;
    }
    if (y < 8) y = 8;
    contextMenu = { x, y, items };
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  // Close context menu on click outside or Escape
  $effect(() => {
    if (!contextMenu) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeContextMenu();
    }
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.context-menu')) closeContextMenu();
    }
    document.addEventListener('keydown', onKey);
    // Use a timeout so the right-click that opened the menu doesn't immediately close it
    setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  });

  // ─── Long press helper ───────────────────────────────────────────────────

  let longPressTimer: ReturnType<typeof setTimeout> | null = null;

  function onLongPressStart(el: HTMLElement, items: ContextMenuItem[], clientY: number) {
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      openContextMenu(el, items, clientY);
    }, 500);
  }

  function onLongPressMove() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function onLongPressEnd() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  async function handleUpload(dirPath: string) {
    fileInput.click();
    // Store dirPath for the change handler
    fileInput.dataset.uploadDir = dirPath;
  }

  async function handleRootMove(srcPath: string, targetDir: string) {
    const destPath = targetDir ? `${targetDir}/${srcPath.split('/').pop()}` : srcPath.split('/').pop()!;
    try {
      await moveNote(srcPath, destPath);
      onUpload();
    } catch {
      try {
        await moveFile(srcPath, destPath);
      } catch (err: unknown) {
        alert('Move failed: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  }

  async function onFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const dir = input.dataset.uploadDir || '';
    const files = input.files;
    if (!files || files.length === 0) return;
    try {
      await uploadFiles(files, dir);
      // Tree reload is handled by the parent via callback — but we need to trigger it
      // The simplest way is to have the parent reload. We'll use a callback approach.
      // For now, just reload the page to refresh tree.
      // Actually, let's add a callback prop for this.
      // Hmm, let me just reload the tree via the parent. 
      // The parent App.svelte has onNewNote and onNewDirectory which trigger loadTree.
      // We don't have an onUpload callback. Let me add one.
      // Actually, the simplest approach: emit a custom event that the parent can handle.
      // But Svelte 5 uses callback props. Let me just add onUpload to Props.
      // For now, I'll use a simpler approach and reload the page.
      window.location.reload();
    } catch (err: unknown) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      input.value = '';
    }
  }

  function toggleSort() {
    const next = sortMode === 'chrono' ? 'alpha' : 'chrono';
    sortMode = next;
    const s = loadSettings();
    s.sort = next;
    saveSettings(s);
  }

  // ─── Favorites filter ──────────────────────────────────────────────────

  let showFavorites = $state(false);

  function filterFavorites(nodes: TreeNode[]): TreeNode[] {
    return nodes.reduce<TreeNode[]>((acc, node) => {
      if (node.type === 'note') {
        if (favorites.includes(node.path)) {
          acc.push(node);
        }
      } else if (node.type === 'directory') {
        const children = node.children ? filterFavorites(node.children) : [];
        if (children.length > 0) {
          acc.push({ ...node, children });
        }
      }
      return acc;
    }, []);
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

  const baseTree = $derived(showFavorites ? filterFavorites(tree) : tree);
  const sortedTree = $derived(sortNodes(baseTree));

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
      <button class="btn-icon" title="Upload files" onclick={() => handleUpload('')}>
        <i class="fas fa-upload"></i>
      </button>
      <input type="file" multiple bind:this={fileInput} onchange={onFilesSelected} style="display:none" />
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
            {#if showFileIcons}<span class="tree-dot"><i class="fas fa-file-lines"></i></span>{/if}
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
      <button class="settings-section-toggle" onclick={() => showThemes = !showThemes}>
        <span class="settings-arrow" class:expanded={showThemes}><i class="fas fa-chevron-right fa-xs"></i></span>
        <span class="settings-title" style="margin:0">Themes</span>
      </button>

      {#if showThemes}
        <div class="settings-theme-grid">
          {#each themes as t (t.id)}
            <button
              class="theme-chip"
              class:active={theme === t.id}
              onclick={() => onSetTheme(t.id as Theme)}
            >
              <i class="fas fa-{t.icon}"></i>
              <span>{t.label}</span>
            </button>
          {/each}
        </div>
      {/if}

      <div class="settings-divider"></div>

      <button class="settings-action" onclick={() => {
        showFileIcons = !showFileIcons;
        const s = loadSettings();
        s.showFileIcons = showFileIcons;
        saveSettings(s);
      }}>
        <i class="fas fa-icons"></i>
        <span>File icons {showFileIcons ? 'shown' : 'hidden'}</span>
      </button>

      <div class="settings-divider"></div>

      <div class="settings-title">Editor</div>

      <button class="settings-action" onclick={() => {
        spellcheckEnabled = !spellcheckEnabled;
        const s = loadSettings();
        s.spellcheck = spellcheckEnabled;
        saveSettings(s);
      }}>
        <i class="fas fa-spell-check"></i>
        <span>Spell check {spellcheckEnabled ? 'on' : 'off'}</span>
      </button>

      <button class="settings-action" onclick={() => {
        lineNumbersEnabled = !lineNumbersEnabled;
        const s = loadSettings();
        s.lineNumbers = lineNumbersEnabled;
        saveSettings(s);
      }}>
        <i class="fas fa-list-ol"></i>
        <span>Line numbers {lineNumbersEnabled ? 'on' : 'off'}</span>
      </button>

      <button class="settings-action" onclick={() => {
        syntaxHighlightEnabled = !syntaxHighlightEnabled;
        const s = loadSettings();
        s.syntaxHighlight = syntaxHighlightEnabled;
        saveSettings(s);
      }}>
        <i class="fas fa-highlighter"></i>
        <span>Syntax highlight {syntaxHighlightEnabled ? 'on' : 'off'}</span>
      </button>

      <button class="settings-action" onclick={() => {
        completionsEnabled = !completionsEnabled;
        const s = loadSettings();
        s.completions = completionsEnabled;
        saveSettings(s);
      }}>
        <i class="fas fa-list-check"></i>
        <span>Completions {completionsEnabled ? 'on' : 'off'}</span>
      </button>

      <button class="settings-action" onclick={() => {
        vimModeEnabled = !vimModeEnabled;
        const s = loadSettings();
        s.vimMode = vimModeEnabled;
        saveSettings(s);
      }}>
        <i class="fas fa-keyboard"></i>
        <span>Vim mode {vimModeEnabled ? 'on' : 'off'}</span>
      </button>

      <div class="settings-divider"></div>

      <div class="settings-title">Viewer</div>

      <button class="settings-action" onclick={() => {
        viewerKeybindings = !viewerKeybindings;
        const s = loadSettings();
        s.viewerKeybindings = viewerKeybindings;
        saveSettings(s);
      }}>
        <i class="fas fa-keyboard"></i>
        <span>Keybinds {viewerKeybindings ? 'on' : 'off'}</span>
      </button>

      <button class="settings-action" onclick={() => {
        const next = markdownFlavor === 'default' ? 'gfm' : 'default';
        markdownFlavor = next;
        const s = loadSettings();
        s.markdownFlavor = next;
        saveSettings(s);
      }}>
        <i class="fas fa-flask"></i>
        <span>Flavor: {markdownFlavor === 'gfm' ? 'GFM' : 'Default'}</span>
      </button>

      <button class="settings-action" onclick={() => {
        markdownBreaksEnabled = !markdownBreaksEnabled;
        const s = loadSettings();
        s.markdownBreaks = markdownBreaksEnabled;
        saveSettings(s);
      }}>
        <i class="fas fa-text-slash"></i>
        <span>Line breaks {markdownBreaksEnabled ? 'on' : 'off'}</span>
      </button>

      <button class="settings-action" onclick={() => {
        inlineMathEnabled = !inlineMathEnabled;
        const s = loadSettings();
        s.inlineMath = inlineMathEnabled;
        saveSettings(s);
      }}>
        <i class="fas fa-superscript"></i>
        <span>Inline math {inlineMathEnabled ? 'on' : 'off'}</span>
      </button>

      <div class="settings-divider"></div>

      <div class="settings-title">Settings File</div>

      <button class="settings-action" onclick={() => {
        if (confirm('Reset all settings to defaults?')) {
          saveSettings(DEFAULTS);
          location.reload();
        }
      }}>
        <i class="fas fa-undo"></i>
        <span>Clear</span>
      </button>

      <button class="settings-action" onclick={() => {
        const json = JSON.stringify(loadSettings(), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'downspace.settings.json';
        a.click();
        URL.revokeObjectURL(url);
      }}>
        <i class="fas fa-download"></i>
        <span>Export</span>
      </button>

      <input type="file" accept=".json" class="settings-file-input" id="settings-import" onchange={(e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result as string);
            if (parsed.theme || parsed.sort || parsed.sidebarWidth !== undefined) {
              saveSettings({ ...DEFAULTS, ...parsed });
              location.reload();
            } else {
              alert('Invalid settings file.');
            }
          } catch {
            alert('Invalid settings file.');
          }
        };
        reader.readAsText(file);
        (e.target as HTMLInputElement).value = '';
      }} />
      <label for="settings-import" class="settings-action">
        <i class="fas fa-upload"></i>
        <span>Import</span>
      </label>
    </div>
  {:else}
    <div
      class="sidebar-tree"
      use:sortable={{ dirPath: '', onMove: handleRootMove }}
    >
      {#each rootDirs as dir (dir.path)}
        <TreeDir
          {dir}
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
          onContextMenu={openContextMenu}
        />
      {/each}

      {#each rootNotes as note (note.path)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="tree-note-row"
          class:active={selectedNotePath === note.path}
          data-path={note.path}
          oncontextmenu={(e) => { e.preventDefault(); openContextMenu(e.currentTarget, [
            { label: 'Rename', icon: 'pencil-alt', action: () => onRenameNote(note.path) },
            { label: 'Delete', icon: 'times', action: () => onDeleteNote(note.path) },
          ], e.clientY); }}
          ontouchstart={(e) => onLongPressStart(e.currentTarget, [
            { label: 'Rename', icon: 'pencil-alt', action: () => onRenameNote(note.path) },
            { label: 'Delete', icon: 'times', action: () => onDeleteNote(note.path) },
          ], e.touches[0].clientY)}
          ontouchmove={onLongPressMove}
          ontouchend={onLongPressEnd}
        >
          <button class="tree-note" class:active={selectedNotePath === note.path} onclick={() => onSelectNote(note.path)}>
            {#if showFileIcons}<span class="tree-dot"><i class="fas fa-file-lines"></i></span>{/if}
            <span class="tree-label">{note.name}</span>
          </button>
        </div>
      {/each}

      {#each rootFiles as file (file.path)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="tree-file-row"
          data-path={file.path}
          oncontextmenu={(e) => { e.preventDefault(); openContextMenu(e.currentTarget, [
            { label: 'Rename', icon: 'pencil-alt', action: () => onRenameFile(file.path) },
            { label: 'Delete', icon: 'times', action: () => onDeleteFile(file.path) },
          ], e.clientY); }}
          ontouchstart={(e) => onLongPressStart(e.currentTarget, [
            { label: 'Rename', icon: 'pencil-alt', action: () => onRenameFile(file.path) },
            { label: 'Delete', icon: 'times', action: () => onDeleteFile(file.path) },
          ], e.touches[0].clientY)}
          ontouchmove={onLongPressMove}
          ontouchend={onLongPressEnd}
        >
          <button class="tree-note" onclick={() => window.open('/f/' + file.path, '_blank')}>
            {#if showFileIcons}<span class="tree-dot"><i class="fas fa-file"></i></span>{/if}
            <span class="tree-label">{file.name}</span>
          </button>
        </div>
      {/each}

      {#if showFavorites && rootDirs.length === 0 && rootNotes.length === 0}
        <div class="tree-empty">No favorite notes</div>
      {:else if tree.length === 0}
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
    <button class="btn-icon" class:active={showFavorites} title="Favorites" onclick={() => showFavorites = !showFavorites}>
      <i class="{showFavorites ? 'fas' : 'far'} fa-star"></i>
    </button>
    <button class="btn-icon" title="Shell" onclick={onToggleShell}>
      <i class="fas fa-terminal"></i>
    </button>
    <button class="btn-icon settings-btn" title="Settings" onclick={onToggleSettings}>
      <i class="fas fa-gear"></i>
    </button>
  </div>

  {#if contextMenu}
    <div
      class="context-menu"
      style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
      role="menu"
    >
      {#each contextMenu.items as item (item.label)}
        <button class="context-menu-item" role="menuitem" onclick={() => { item.action(); closeContextMenu(); }}>
          <i class="fas fa-{item.icon}"></i>
          <span>{item.label}</span>
        </button>
      {/each}
    </div>
  {/if}

  <!-- svelte-ignore a11y_no_static_element_interactions -->
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
        const w = parseInt(document.documentElement.style.getPropertyValue('--sidebar-width'));
        if (w > 0) {
          const s = loadSettings();
          s.sidebarWidth = w;
          saveSettings(s);
        }
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

  :global(.sortable-ghost) {
    opacity: 0.4;
  }

  :global(.sortable-drag) {
    opacity: 0.8;
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

  .tree-file-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    cursor: default;
  }

  .tree-file-row .tree-note {
    flex: 1;
    padding: 0;
    width: auto;
  }

  .tree-file-row:hover .tree-note {
    background: none;
  }

  .tree-file-row:hover {
    background: var(--bg-tertiary);
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

  .settings-section-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 0;
    border: none;
    background: none;
    color: var(--text);
    font-size: 14px;
    cursor: pointer;
    text-align: left;
    margin-bottom: 8px;
  }

  .settings-arrow {
    display: flex;
    align-items: center;
    width: 12px;
    transition: transform 0.15s;
    color: var(--text-muted);
  }

  .settings-arrow.expanded {
    transform: rotate(90deg);
  }

  .settings-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
  }

  .settings-theme-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-bottom: 8px;
  }

  .theme-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-secondary);
    color: var(--text);
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, border-color 0.15s;
  }

  .theme-chip:hover {
    background: var(--bg-tertiary);
  }

  .theme-chip.active {
    border-color: var(--accent);
    background: var(--bg-tertiary);
  }

  .theme-chip i {
    width: 14px;
    text-align: center;
    color: var(--accent);
    font-size: 11px;
  }

  .settings-divider {
    height: 1px;
    background: var(--border);
    margin: 12px 0;
  }

  .settings-action {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: var(--radius);
    background: none;
    color: var(--text);
    font-size: 14px;
    cursor: pointer;
    text-align: left;
    margin-bottom: 4px;
    transition: background 0.15s;
  }

  .settings-action:hover {
    background: var(--bg-tertiary);
  }

  .settings-action i {
    width: 18px;
    text-align: center;
    color: var(--text-secondary);
  }

  .settings-file-input {
    display: none;
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

  .sidebar-footer .btn-icon.active {
    color: var(--accent);
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

  /* ─── Context menu ───────────────────────────────────────────────────── */

  .context-menu {
    position: absolute;
    z-index: 1000;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    min-width: 160px;
    padding: 4px 0;
  }

  .context-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 12px;
    border: none;
    background: none;
    color: var(--text);
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    transition: background 0.1s;
  }

  .context-menu-item:hover {
    background: var(--bg-tertiary);
  }

  .context-menu-item i {
    width: 16px;
    text-align: center;
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    .sidebar-resize-handle {
      display: none;
    }
  }
</style>
