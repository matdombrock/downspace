<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "./lib/Sidebar.svelte";
  import NoteViewer from "./lib/NoteViewer.svelte";
  import NoteEditor from "./lib/NoteEditor.svelte";
  import FileViewer from "./lib/FileViewer.svelte";
  import ThemeToggle from "./lib/ThemeToggle.svelte";
  import ActionPicker from "./lib/ActionPicker.svelte";
  import type { TreeNode, Note } from "./lib/types";
  import {
    loadActions,
    getActions,
    type Action,
  } from "./lib/actions";
  import {
    fetchTree,
    fetchNote,
    saveNote,
    deleteNote as apiDeleteNote,
    createDirectory,
    deleteDirectory as apiDeleteDirectory,
    moveNote,
    moveDirectory,
    deleteFile as apiDeleteFile,
    moveFile as apiMoveFile,
  } from "./lib/api";
  import {
    loadSettings,
    saveSettings,
    toggleFavorite,
    updateFavoritePath,
    removeFavorite,
    updateFavoritesPrefix,
    removeFavoritesWithPrefix,
  } from "./lib/settings";
  import type { Theme } from "./lib/settings";
  import themes, { applyThemeById } from "./lib/themes";

  let tree = $state<TreeNode[]>([]);
  let selectedNote = $state<Note | null>(null);
  let selectedFile = $state<string | null>(null);
  let editMode = $state(false);
  let theme = $state<Theme>("light");
  let sidebarOpen = $state(false);
  let showSettings = $state(false);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let actions = $state<Action[]>([]);
  let showActions = $state(false);

  // ─── Swipe to open sidebar (mobile) ──────────────────────────────────────

  let touchStartX = $state(0);
  let touchStartY = $state(0);

  function handleTouchStart(e: TouchEvent) {
    if (editMode || sidebarOpen) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e: TouchEvent) {
    if (editMode || sidebarOpen) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Swipe right: at least 60px rightward, and more horizontal than vertical
    if (dx > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      sidebarOpen = true;
    }
  }

  // ─── Favorites ────────────────────────────────────────────────────────────

  let favorites = $state<string[]>(loadSettings().favorites);
  let currentNoteFav = $derived(
    selectedNote ? favorites.includes(selectedNote.path) : false,
  );

  function handleToggleFavorite() {
    if (!selectedNote) return;
    favorites = toggleFavorite(selectedNote.path);
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  onMount(() => {
    theme = loadSettings().theme;
    applyTheme(theme);

    loadActions()
      .then(() => {
        actions = getActions();
      })
      .catch((e: unknown) => {
        error = e instanceof Error ? e.message : String(e);
      });

    const init = async () => {
      await loadTree();
      const urlPath = window.location.pathname.slice(1).replace(/\/$/, "");
      if (urlPath) {
        if (urlPath.startsWith("f/")) {
          selectedFile = decodeURIComponent(urlPath.slice(2));
        } else {
          navigateToNoteFromPath(decodeURIComponent(urlPath));
        }
      }
    };
    init();

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  });

  // ─── Theme ──────────────────────────────────────────────────────────────

  const THEME_CYCLE = themes.map((t) => t.id) as Theme[];

  function applyTheme(t: Theme) {
    applyThemeById(t);
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
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  // ─── URL ↔ note/file path helpers ───────────────────────────────────────

  function toUrlPath(notePath: string): string {
    return (
      "/" +
      notePath
        .replace(/\.md$/, "")
        .split("/")
        .map((s) => encodeURIComponent(s))
        .join("/")
    );
  }

  /** Try to load a note from a URL path segment. Returns true if found. */
  async function navigateToNoteFromPath(path: string): Promise<boolean> {
    const notePath = path.endsWith(".md") ? path : path + ".md";
    try {
      selectedNote = await fetchNote(notePath);
      selectedFile = null;
      editMode = false;
      return true;
    } catch {
      selectedNote = null;
      selectedFile = null;
      return false;
    }
  }

  function onPopState() {
    const path = window.location.pathname.slice(1).replace(/\/$/, "");
    if (path.startsWith("f/")) {
      const filePath = decodeURIComponent(path.slice(2));
      selectedNote = null;
      selectedFile = filePath;
      editMode = false;
    } else if (path) {
      navigateToNoteFromPath(decodeURIComponent(path));
    } else {
      selectedNote = null;
      selectedFile = null;
      editMode = false;
    }
  }

  // ─── Note selection (from sidebar or internal link) ─────────────────────

  function handleSelectFile(filePath: string) {
    selectedNote = null;
    editMode = false;
    selectedFile = filePath;
    sidebarOpen = false;
  }

  async function handleSelectNote(notePath: string) {
    loading = true;
    error = null;
    try {
      selectedNote = await fetchNote(notePath);
      selectedFile = null;
      editMode = false;
      sidebarOpen = false;
      window.history.replaceState({ note: notePath }, "", toUrlPath(notePath));
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  async function handleNavigateToNote(path: string) {
    loading = true;
    error = null;
    try {
      const notePath = path.endsWith(".md") ? path : path + ".md";
      selectedNote = await fetchNote(notePath);
      selectedFile = null;
      editMode = false;
      sidebarOpen = false;
      window.history.pushState({ note: notePath }, "", toUrlPath(notePath));
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : String(e);
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
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  async function handleDelete() {
    if (!selectedNote) return;
    if (!confirm(`Delete "${selectedNote.title || selectedNote.name}"?`))
      return;
    error = null;
    try {
      await apiDeleteNote(selectedNote.path);
      removeFavorite(selectedNote.path);
      favorites = loadSettings().favorites;
      selectedNote = null;
      selectedFile = null;
      editMode = false;
      window.history.replaceState({ note: "" }, "", "/");
      await loadTree();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  function handleRenameNote() {
    if (!selectedNote) return;
    const newName = prompt("New name (without .md):", selectedNote.name);
    if (!newName || !newName.trim() || newName.trim() === selectedNote.name)
      return;
    const dir = selectedNote.directory ? selectedNote.directory + "/" : "";
    const oldPath = selectedNote.path;
    const newPath = dir + newName.trim() + ".md";
    error = null;
    moveNote(oldPath, newPath)
      .then(() => {
        updateFavoritePath(oldPath, newPath);
        favorites = loadSettings().favorites;
        return fetchNote(newPath);
      })
      .then((note) => {
        selectedNote = note;
        window.history.replaceState({ note: newPath }, "", toUrlPath(newPath));
        return loadTree();
      })
      .catch((e: unknown) => {
        error = e instanceof Error ? e.message : String(e);
      });
  }

  async function handleRunAction(action: Action) {
    showActions = false;
    error = null;
    try {
      await action.run({ note: selectedNote });
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  function handleCopyNote() {
    if (!selectedNote) return;
    const text = selectedNote.content;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text: string) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    // @ts-expect-error document.execCommand is deprecated but serves as a fallback
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  function handleEdit() {
    editMode = true;
  }

  function handleCancelEdit() {
    editMode = false;
  }

  function handleNewNote(dirPath: string) {
    const name = prompt("Note name:");
    if (!name || !name.trim()) return;
    const notePath = dirPath
      ? `${dirPath}/${name.trim()}.md`
      : `${name.trim()}.md`;
    loading = true;
    error = null;
    saveNote(notePath, "")
      .then(() => loadTree())
      .then(() => fetchNote(notePath))
      .then((note) => {
        selectedNote = note;
        editMode = true;
        sidebarOpen = false;
        window.history.replaceState(
          { note: notePath },
          "",
          toUrlPath(notePath),
        );
      })
      .catch((e: unknown) => {
        error = e instanceof Error ? e.message : String(e);
      })
      .finally(() => {
        loading = false;
      });
  }

  // ─── Directory CRUD ─────────────────────────────────────────────────────

  function handleRenameDirectory(dirPath: string) {
    const oldName = dirPath.split("/").pop() || "";
    const parent = dirPath.includes("/")
      ? dirPath.slice(0, dirPath.lastIndexOf("/"))
      : "";
    const newName = prompt("New directory name:", oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;
    const newPath = parent ? `${parent}/${newName.trim()}` : newName.trim();
    error = null;
    moveDirectory(dirPath, newPath)
      .then(() => {
        updateFavoritesPrefix(dirPath, newPath);
        favorites = loadSettings().favorites;
        loadTree();
        if (selectedNote && selectedNote.path.startsWith(dirPath + "/")) {
          const relativePath = selectedNote.path.slice(dirPath.length + 1);
          fetchNote(newPath + "/" + relativePath)
            .then((note) => {
              selectedNote = note;
            })
            .catch(() => {
              selectedNote = null;
              selectedFile = null;
              editMode = false;
              window.history.replaceState({ note: "" }, "", "/");
            });
        }
      })
      .catch((e: unknown) => {
        error = e instanceof Error ? e.message : String(e);
      });
  }

  function handleNewDirectory(parentPath: string) {
    const name = prompt("Directory name:");
    if (!name || !name.trim()) return;
    const dirPath = parentPath ? `${parentPath}/${name.trim()}` : name.trim();
    error = null;
    createDirectory(dirPath)
      .then(() => loadTree())
      .catch((e: unknown) => {
        error = e instanceof Error ? e.message : String(e);
      });
  }

  function handleDeleteFile(filePath: string) {
    const name = filePath.split("/").pop() || filePath;
    if (!confirm(`Delete "${name}"?`)) return;
    error = null;
    apiDeleteFile(filePath)
      .then(() => loadTree())
      .catch((e: unknown) => {
        error = e instanceof Error ? e.message : String(e);
      });
  }

  function handleRenameFile(filePath: string) {
    const oldName = filePath.split("/").pop() || "";
    const dir = filePath.includes("/")
      ? filePath.slice(0, filePath.lastIndexOf("/"))
      : "";
    const newName = prompt("New file name:", oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;
    const newPath = dir ? `${dir}/${newName.trim()}` : newName.trim();
    error = null;
    apiMoveFile(filePath, newPath)
      .then(() => loadTree())
      .catch((e: unknown) => {
        error = e instanceof Error ? e.message : String(e);
      });
  }

  function handleDeleteNoteInline(notePath: string) {
    const name = notePath.split("/").pop()?.replace(/\.md$/, "") || notePath;
    if (!confirm(`Delete "${name}"?`)) return;
    error = null;
    apiDeleteNote(notePath)
      .then(() => {
        removeFavorite(notePath);
        favorites = loadSettings().favorites;
        if (selectedNote?.path === notePath) {
          selectedNote = null;
          selectedFile = null;
          editMode = false;
          window.history.replaceState({ note: "" }, "", "/");
        }
        return loadTree();
      })
      .catch((e: unknown) => {
        error = e instanceof Error ? e.message : String(e);
      });
  }

  function handleRenameNoteInline(notePath: string) {
    const name = notePath.split("/").pop()?.replace(/\.md$/, "") || "";
    const dir = notePath.includes("/")
      ? notePath.slice(0, notePath.lastIndexOf("/"))
      : "";
    const newName = prompt("New name (without .md):", name);
    if (!newName || !newName.trim() || newName.trim() === name) return;
    const newPath = dir
      ? `${dir}/${newName.trim()}.md`
      : `${newName.trim()}.md`;
    error = null;
    moveNote(notePath, newPath)
      .then(() => {
        updateFavoritePath(notePath, newPath);
        favorites = loadSettings().favorites;
        if (selectedNote?.path === notePath) {
          return fetchNote(newPath).then((note) => {
            selectedNote = note;
            window.history.replaceState(
              { note: newPath },
              "",
              toUrlPath(newPath),
            );
          });
        }
      })
      .then(() => loadTree())
      .catch((e: unknown) => {
        error = e instanceof Error ? e.message : String(e);
      });
  }

  function handleDeleteDirectory(dirPath: string) {
    if (!confirm(`Delete directory "${dirPath}" and all its contents?`)) return;
    error = null;
    apiDeleteDirectory(dirPath)
      .then(() => {
        removeFavoritesWithPrefix(dirPath);
        favorites = loadSettings().favorites;
        loadTree();
        if (selectedNote && selectedNote.path.startsWith(dirPath + "/")) {
          selectedNote = null;
          selectedFile = null;
          editMode = false;
          window.history.replaceState({ note: "" }, "", "/");
        }
      })
      .catch((e: unknown) => {
        error = e instanceof Error ? e.message : String(e);
      });
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="app-layout"
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
>
  <!-- Header -->
  <header class="app-header">
    <button
      class="btn-icon hamburger"
      onclick={() => (sidebarOpen = !sidebarOpen)}
      aria-label="Toggle sidebar"
    >
      <i class="fas fa-bars fa-lg"></i>
    </button>
    <span class="logo"><i class="fas fa-rocket"></i> downspace</span>
    <div class="header-actions">
      {#if selectedNote && !editMode}
        <button class="btn" onclick={handleEdit} title="Edit"
          ><i class="fas fa-pen-to-square"></i></button
        >
        <button class="btn" onclick={handleRenameNote} title="Rename"
          ><i class="fas fa-tag"></i></button
        >
        <button
          class="btn fav-btn"
          class:favorited={currentNoteFav}
          onclick={handleToggleFavorite}
          title={currentNoteFav ? "Remove from favorites" : "Add to favorites"}
        >
          <i class="fa{currentNoteFav ? 's' : 'r'} fa-star"></i>
        </button>
        <button class="btn" onclick={handleCopyNote} title="Copy to clipboard"
          ><i class="fas fa-copy"></i></button
        >
        <button class="btn" onclick={handleDelete} title="Delete"
          ><i class="fas fa-trash-alt"></i></button
        >
        <button class="btn" onclick={() => (showActions = true)} title="Actions"
          ><i class="fas fa-bolt"></i></button
        >
      {/if}
      {#if selectedNote && editMode}
        <button class="btn" onclick={handleCancelEdit} title="Cancel"
          ><i class="fas fa-times"></i></button
        >
      {/if}
      <ThemeToggle {theme} ontoggle={toggleTheme} />
    </div>
  </header>

  <!-- Overlay for mobile sidebar -->
  {#if sidebarOpen}
    <div
      class="sidebar-overlay"
      onclick={() => (sidebarOpen = false)}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") sidebarOpen = false;
      }}
      role="button"
      tabindex="-1"
    ></div>
  {/if}

  <!-- Actions picker overlay -->
  {#if showActions}
    <ActionPicker
      {actions}
      onClose={() => (showActions = false)}
      onPick={handleRunAction}
    />
  {/if}

  <!-- Sidebar -->
  <aside class="sidebar" class:open={sidebarOpen}>
    <Sidebar
      {tree}
      {showSettings}
      {theme}
      {favorites}
      selectedNotePath={selectedNote?.path ?? null}
      onSelectNote={handleSelectNote}
      onSelectFile={handleSelectFile}
      onNewNote={handleNewNote}
      onNewDirectory={handleNewDirectory}
      onRenameDirectory={handleRenameDirectory}
      onDeleteDirectory={handleDeleteDirectory}
      onRenameFile={handleRenameFile}
      onDeleteFile={handleDeleteFile}
      onRenameNote={handleRenameNoteInline}
      onDeleteNote={handleDeleteNoteInline}
      onUpload={loadTree}
      onToggleSettings={() => (showSettings = !showSettings)}
      onSetTheme={setTheme}
    />
  </aside>

  <!-- Main content -->
  <main
    class="main-content"
    class:edit-mode={editMode}
  >
    {#if error}
      <div class="error-bar">{error}</div>
    {/if}

    {#if loading}
      <div class="empty-state">Loading...</div>
    {:else if selectedFile}
      <FileViewer filePath={selectedFile} />
    {:else if !selectedNote}
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fa-solid fa-user-astronaut fa-4x"></i>
        </div>
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
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 50vw;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex-shrink: 0;
  }
  .header-actions::-webkit-scrollbar {
    display: none;
  }

  .hamburger {
    display: none;
  }

  .fav-btn.favorited {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--bg-tertiary);
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
      background: rgba(0, 0, 0, 0.4);
      z-index: 25;
    }

    .main-content {
      padding: 16px;
    }

    .main-content.edit-mode {
      padding: 0;
    }

  }
</style>
