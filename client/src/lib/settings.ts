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

export interface Settings {
  theme: Theme;
  sort: SortMode;
  sidebarWidth: number;
  vimMode: boolean;
  showFileIcons: boolean;
  favorites: string[];
}

const KEY = 'downspace-settings';

export const DEFAULTS: Settings = {
  theme: 'dark',
  sort: 'chrono',
  sidebarWidth: 280,
  vimMode: false,
  showFileIcons: true,
  favorites: [],
};

/** Migrate old separate keys into the single blob. */
function migrate(): Partial<Settings> {
  const migrated: Partial<Settings> = {};
  const oldTheme = localStorage.getItem('downspace-theme');
  if (oldTheme) {
    if (oldTheme === 'light' || oldTheme === 'dark' || oldTheme === 'dark-modern' || oldTheme === 'dark-oled') {
      migrated.theme = oldTheme;
    }
    localStorage.removeItem('downspace-theme');
  }
  const oldSort = localStorage.getItem('downspace-sort');
  if (oldSort === 'chrono' || oldSort === 'alpha') {
    migrated.sort = oldSort;
    localStorage.removeItem('downspace-sort');
  }
  const oldW = localStorage.getItem('downspace-sidebar-width');
  if (oldW) {
    const n = parseInt(oldW);
    if (n > 0) migrated.sidebarWidth = n;
    localStorage.removeItem('downspace-sidebar-width');
  }
  return migrated;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...DEFAULTS, ...parsed };
      // Coerce sidebarWidth to a clean number (old buggy code saved '280px' as string)
      const n = typeof merged.sidebarWidth === 'number' ? merged.sidebarWidth : parseInt(merged.sidebarWidth);
      merged.sidebarWidth = isNaN(n) ? DEFAULTS.sidebarWidth : Math.max(180, n);
      return merged;
    }
  } catch {
    // corrupt — fall through
  }
  // No blob yet — try old keys, then defaults
  const migrated = migrate();
  if (Object.keys(migrated).length > 0) {
    const settings = { ...DEFAULTS, ...migrated };
    saveSettings(settings);
    return settings;
  }
  return { ...DEFAULTS };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
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
