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
}

const KEY = 'downspace-settings';

export const DEFAULTS: Settings = {
  theme: 'dark',
  sort: 'chrono',
  sidebarWidth: 280,
  vimMode: true,
  showFileIcons: true,
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
