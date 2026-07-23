export type Theme =
  | 'light'
  | 'dark'
  | 'dark-modern'
  | 'dark-oled'
  | 'gruvbox'
  | 'everforest'
  | 'catppuccin'
  | 'nord'
  | 'tokyo-night'
  | 'dracula';
export type SortMode = 'chrono' | 'alpha';
export type FavoritesView = 'tree' | 'flat';
export type MarkdownFlavor = 'default' | 'gfm';

export interface Settings {
  theme: Theme;
  sort: SortMode;
  sidebarWidth: number;
  vimMode: boolean;
  spellcheck: boolean;
  lineNumbers: boolean;
  syntaxHighlight: boolean;
  completions: boolean;
  showFileIcons: boolean;
  favorites: string[];
  favoritesView: FavoritesView;
  markdownFlavor: MarkdownFlavor;
  markdownBreaks: boolean;
  inlineMath: boolean;
  viewerKeybindings: boolean;
}

import { writable } from 'svelte/store';

const KEY = 'downspace-settings';

export const DEFAULTS: Settings = {
  theme: 'dark',
  sort: 'chrono',
  sidebarWidth: 280,
  vimMode: false,
  spellcheck: true,
  lineNumbers: true,
  syntaxHighlight: true,
  completions: true,
  showFileIcons: true,
  favorites: [],
  favoritesView: 'tree',
  markdownFlavor: 'gfm',
  markdownBreaks: false,
  inlineMath: false,
  viewerKeybindings: true,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...DEFAULTS, ...parsed };
      const n = typeof merged.sidebarWidth === 'number' ? merged.sidebarWidth : parseInt(String(merged.sidebarWidth));
      merged.sidebarWidth = isNaN(n) ? DEFAULTS.sidebarWidth : Math.max(180, n);
      return merged;
    }
  } catch {
    // corrupt — fall through
  }
  return { ...DEFAULTS };
}

export const settingsStore = writable<Settings>(loadSettings());

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
  settingsStore.set(settings);
}

// ─── Favorites helpers ──────────────────────────────────────────────────────

export function toggleFavorite(path: string): string[] {
  const s = loadSettings();
  const idx = s.favorites.indexOf(path);
  if (idx === -1) {
    s.favorites.push(path);
  } else {
    s.favorites.splice(idx, 1);
  }
  saveSettings(s);
  return s.favorites;
}

export function isFavorite(path: string): boolean {
  return loadSettings().favorites.includes(path);
}

export function updateFavoritePath(oldPath: string, newPath: string): void {
  const s = loadSettings();
  let changed = false;
  for (let i = 0; i < s.favorites.length; i++) {
    if (s.favorites[i] === oldPath) {
      s.favorites[i] = newPath;
      changed = true;
    }
  }
  if (changed) saveSettings(s);
}

export function removeFavorite(path: string): void {
  const s = loadSettings();
  const idx = s.favorites.indexOf(path);
  if (idx !== -1) {
    s.favorites.splice(idx, 1);
    saveSettings(s);
  }
}

export function updateFavoritesPrefix(oldPrefix: string, newPrefix: string): void {
  const s = loadSettings();
  let changed = false;
  for (let i = 0; i < s.favorites.length; i++) {
    if (s.favorites[i] === oldPrefix || s.favorites[i].startsWith(oldPrefix + '/')) {
      s.favorites[i] = newPrefix + s.favorites[i].slice(oldPrefix.length);
      changed = true;
    }
  }
  if (changed) saveSettings(s);
}

export function removeFavoritesWithPrefix(prefix: string): void {
  const s = loadSettings();
  const len = s.favorites.length;
  s.favorites = s.favorites.filter(p => p !== prefix && !p.startsWith(prefix + '/'));
  if (s.favorites.length !== len) saveSettings(s);
}
