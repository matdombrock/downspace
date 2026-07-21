export type Theme = 'light' | 'dark' | 'dark-modern' | 'dark-oled';
export type SortMode = 'chrono' | 'alpha';

export interface Settings {
  theme: Theme;
  sort: SortMode;
  sidebarWidth: number;
}

const KEY = 'downspace-settings';

const DEFAULTS: Settings = {
  theme: 'light',
  sort: 'chrono',
  sidebarWidth: 280,
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
      return { ...DEFAULTS, ...parsed };
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
