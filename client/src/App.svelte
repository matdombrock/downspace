<script lang="ts">
  import { onMount } from 'svelte';
  import Sidebar from './lib/Sidebar.svelte';
  import NoteViewer from './lib/NoteViewer.svelte';
  import NoteEditor from './lib/NoteEditor.svelte';
  import ThemeToggle from './lib/ThemeToggle.svelte';
  import type { TreeNode, Note } from './lib/types';
  import { fetchTree, fetchNote, saveNote, deleteNote as apiDeleteNote, createDirectory, deleteDirectory as apiDeleteDirectory, moveNote, moveDirectory } from './lib/api';
  import { loadSettings, saveSettings } from './lib/settings';
  import type { Theme } from './lib/settings';

  let tree = $state<TreeNode[]>([]);
  let selectedNote = $state<Note | null>(null);
  let editMode = $state(false);
  let theme = $state<'light' | 'dark' | 'dark-modern' | 'dark-oled'>('light');
  let sidebarOpen = $state(false);
  let showSettings = $state(false);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  onMount(async () => {
    theme = loadSettings().theme;
    applyTheme(theme);
    await loadTree();

    // Check URL for note to load (internal link navigation or direct visit)
    const urlPath = window.location.pathname.slice(1).replace(/\/$/, '');
    if (urlPath) {
      navigateToNoteFromPath(urlPath);
    }

    // Handle back/forward navigation
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  });

  // ─── Theme ──────────────────────────────────────────────────────────────

  const THEME_CYCLE = ['light', 'dark', 'dark-modern', 'dark-oled', 'gruvbox', 'everforest'] as const;
  type Theme = typeof THEME_CYCLE[number];

  function applyTheme(t: Theme) {
    document.documentElement.classList.remove('dark', 'dark-modern', 'dark-oled', 'gruvbox', 'everforest');
    if (t !== 'light') {
      document.documentElement.classList.add(t);
    }
  }

  function toggleTheme() {
    const idx = THEME_CYCLE.indexOf(theme);
    theme = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    applyTheme(theme);
    const s = loadSettings();
    s.theme = theme;
    saveSettings(s);
  }

  function setTheme(t: Theme) {
    theme = t;
    applyTheme(t);
    const s = loadSettings();
    s.theme = t;
    saveSettings(s);
  }

  // ─── Tree loading ───────────────────────────────────────────────────────

  async function loadTree() {
    try {
      tree = await fetchTree();
    } catch (e: any) {
      error = e.message;
    }
  }

  // ─── URL ↔ note path helpers ────────────────────────────────────────────

  function toUrlPath(notePath: string): string {
    return '/' + notePath.replace(/\.md$/, '');
  }

  /** Try to load a note from a URL path segment. Returns true if found. */
  async function navigateToNoteFromPath(path: string): Promise<boolean> {
    const notePath = path.endsWith('.md') ? path : path + '.md';
    try {
      selectedNote = await fetchNote(notePath);
      editMode = false;
      return true;
    } catch {
      selectedNote = null;
      return false;
    }
  }

  function onPopState() {
    const path = window.location.pathname.slice(1).replace(/\/$/, '');
    if (path) {
      navigateToNoteFromPath(path);
    } else {
      selectedNote = null;
      editMode = false;
    }
  }

  // ─── Note selection (from sidebar or internal link) ─────────────────────

  async function handleSelectNote(notePath: string) {
    loading = true;
    error = null;
    try {
      selectedNote = await fetchNote(notePath);
      editMode = false;
      sidebarOpen = false;
      window.history.replaceState({ note: notePath }, '', toUrlPath(notePath));
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function handleNavigateToNote(path: string) {
    loading = true;
    error = null;
    try {
      const notePath = path.endsWith('.md') ? path : path + '.md';
      selectedNote = await fetchNote(notePath);
      editMode = false;
      sidebarOpen = false;
      window.history.pushState({ note: notePath }, '', toUrlPath(notePath));
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  // ─── Note CRUD ──────────────────────────────────────────────────────────

  async function handleSave(content: string) {
    if (!selectedNote) return;
    error = null;
    try {
      await saveNote(selectedNote.path, content);
      selectedNote = await fetchNote(selectedNote.path);
      editMode = false;
      await loadTree();
    } catch (e: any) {
      error = e.message;
    }
  }

  async function handleDelete() {
    if (!selectedNote) return;
    if (!confirm(`Delete "${selectedNote.title || selectedNote.name}"?`)) return;
    error = null;
    try {
      await apiDeleteNote(selectedNote.path);
      selectedNote = null;
      editMode = false;
      window.history.replaceState({ note: '' }, '', '/');
      await loadTree();
    } catch (e: any) {
      error = e.message;
    }
  }

  function handleRenameNote() {
    if (!selectedNote) return;
    const newName = prompt('New name (without .md):', selectedNote.name);
    if (!newName || !newName.trim() || newName.trim() === selectedNote.name) return;
    const dir = selectedNote.directory ? selectedNote.directory + '/' : '';
    const newPath = dir + newName.trim() + '.md';
    error = null;
    moveNote(selectedNote.path, newPath)
      .then(() => fetchNote(newPath))
      .then((note) => {
        selectedNote = note;
        window.history.replaceState({ note: newPath }, '', toUrlPath(newPath));
        return loadTree();
      })
      .catch((e: any) => { error = e.message; });
  }

  function handleEdit() {
    editMode = true;
  }

  function handleCancelEdit() {
    editMode = false;
  }

  function handleNewNote(dirPath: string) {
    const name = prompt('Note name:');
    if (!name || !name.trim()) return;
    const notePath = dirPath ? `${dirPath}/${name.trim()}.md` : `${name.trim()}.md`;
    loading = true;
    error = null;
    saveNote(notePath, '')
      .then(() => loadTree())
      .then(() => fetchNote(notePath))
      .then((note) => {
        selectedNote = note;
        editMode = true;
        sidebarOpen = false;
        window.history.replaceState({ note: notePath }, '', toUrlPath(notePath));
      })
      .catch((e: any) => { error = e.message; })
      .finally(() => { loading = false; });
  }

  // ─── Directory CRUD ─────────────────────────────────────────────────────

  function handleRenameDirectory(dirPath: string) {
    const oldName = dirPath.split('/').pop() || '';
    const parent = dirPath.includes('/') ? dirPath.slice(0, dirPath.lastIndexOf('/')) : '';
    const newName = prompt('New directory name:', oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;
    const newPath = parent ? `${parent}/${newName.trim()}` : newName.trim();
    error = null;
    moveDirectory(dirPath, newPath)
      .then(() => {
        loadTree();
        if (selectedNote && selectedNote.path.startsWith(dirPath + '/')) {
          const relativePath = selectedNote.path.slice(dirPath.length + 1);
          fetchNote(newPath + '/' + relativePath).then(note => {
            selectedNote = note;
          }).catch(() => {
            selectedNote = null;
            editMode = false;
            window.history.replaceState({ note: '' }, '', '/');
          });
        }
      })
      .catch((e: any) => { error = e.message; });
  }

  function handleNewDirectory(parentPath: string) {
    const name = prompt('Directory name:');
    if (!name || !name.trim()) return;
    const dirPath = parentPath ? `${parentPath}/${name.trim()}` : name.trim();
    error = null;
    createDirectory(dirPath)
      .then(() => loadTree())
      .catch((e: any) => { error = e.message; });
  }

  function handleDeleteDirectory(dirPath: string) {
    if (!confirm(`Delete directory "${dirPath}" and all its contents?`)) return;
    error = null;
    apiDeleteDirectory(dirPath)
      .then(() => {
        loadTree();
        if (selectedNote && selectedNote.path.startsWith(dirPath + '/')) {
          selectedNote = null;
          editMode = false;
          window.history.replaceState({ note: '' }, '', '/');
        }
      })
      .catch((e: any) => { error = e.message; });
  }
</script>

<div class="app-layout">
  <!-- Header -->
  <header class="app-header">
    <button class="btn-icon hamburger" onclick={() => sidebarOpen = !sidebarOpen} aria-label="Toggle sidebar">
      <i class="fas fa-bars fa-lg"></i>
    </button>
    <span class="logo"><i class="fas fa-rocket"></i> downspace</span>
    <div class="header-actions">
      {#if selectedNote && !editMode}
        <button class="btn" onclick={handleRenameNote} title="Rename"><i class="fas fa-tag"></i></button>
        <button class="btn" onclick={handleEdit} title="Edit"><i class="fas fa-pen-to-square"></i></button>
        <button class="btn" onclick={handleDelete} title="Delete"><i class="fas fa-trash-alt"></i></button>
      {/if}
      {#if selectedNote && editMode}
        <button class="btn" onclick={handleCancelEdit} title="Cancel"><i class="fas fa-times"></i></button>
      {/if}
      <ThemeToggle {theme} ontoggle={toggleTheme} />
    </div>
  </header>

  <!-- Overlay for mobile sidebar -->
  {#if sidebarOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="sidebar-overlay" onclick={() => sidebarOpen = false} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') sidebarOpen = false; }} role="button" tabindex="-1"></div>
  {/if}

  <!-- Sidebar -->
  <aside class="sidebar" class:open={sidebarOpen}>
    <Sidebar
      {tree}
      {showSettings}
      {theme}
      selectedNotePath={selectedNote?.path ?? null}
      onSelectNote={handleSelectNote}
      onNewNote={handleNewNote}
      onNewDirectory={handleNewDirectory}
      onRenameDirectory={handleRenameDirectory}
      onDeleteDirectory={handleDeleteDirectory}
      onToggleSettings={() => showSettings = !showSettings}
      onSetTheme={setTheme}
    />
  </aside>

  <!-- Main content -->
  <main class="main-content">
    {#if error}
      <div class="error-bar">{error}</div>
    {/if}

    {#if loading}
      <div class="empty-state">Loading...</div>
    {:else if !selectedNote}
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-star fa-4x"></i></div>
        <h2>downspace</h2>
        <p>Select a note from the sidebar, or create a new one.</p>
      </div>
    {:else if editMode}
      <NoteEditor
        note={selectedNote}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />
    {:else}
      <NoteViewer
        note={selectedNote}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNavigateToNote={handleNavigateToNote}
      />
    {/if}
  </main>
</div>

<style>
  .app-layout {
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr;
    grid-template-rows: var(--header-height) 1fr;
    grid-template-areas:
      "header header"
      "sidebar main";
    height: 100vh;
    overflow: hidden;
  }

  .app-header {
    grid-area: header;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
    z-index: 20;
  }

  .logo {
    font-size: 16px;
    font-weight: 600;
    flex: 1;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hamburger {
    display: none;
  }

  .sidebar {
    grid-area: sidebar;
    overflow-y: auto;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
  }

  .sidebar-overlay {
    display: none;
  }

  .main-content {
    grid-area: main;
    overflow-y: auto;
    padding: 24px;
    position: relative;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
    text-align: center;
    gap: 8px;
  }

  .empty-icon {
    font-size: 48px;
    opacity: 0.3;
  }

  .empty-state h2 {
    font-size: 24px;
    color: var(--text);
  }

  .empty-state p {
    max-width: 300px;
  }

  .error-bar {
    padding: 8px 16px;
    background: var(--danger);
    color: white;
    border-radius: var(--radius);
    margin-bottom: 16px;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    .app-layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        "header"
        "main";
    }

    .hamburger {
      display: flex;
    }

    .sidebar {
      position: fixed;
      top: var(--header-height);
      left: 0;
      bottom: 0;
      width: 85%;
      max-width: 320px;
      z-index: 30;
      transform: translateX(-100%);
      transition: transform 0.2s ease;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .sidebar-overlay {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 25;
    }

    .main-content {
      padding: 16px;
    }
  }
</style>
