export interface ThemeDef {
  id: string;
  label: string;
  icon: string;       // Font Awesome icon name (without prefix)
  dark: boolean;
  colors: Record<string, string>;
}

const themes: ThemeDef[] = [
  {
    id: 'light',
    label: 'Light',
    icon: 'sun',
    dark: false,
    colors: {
      '--bg': '#ffffff',
      '--bg-secondary': '#f5f5f5',
      '--bg-tertiary': '#e8e8e8',
      '--text': '#1a1a1a',
      '--text-secondary': '#666666',
      '--text-muted': '#999999',
      '--border': '#e0e0e0',
      '--accent': '#4a90d9',
      '--accent-hover': '#357abd',
      '--accent-text': '#ffffff',
      '--danger': '#d94a4a',
      '--danger-hover': '#c0392b',
      '--sidebar-bg': '#fafafa',
      '--shadow': '0 1px 3px rgba(0,0,0,0.1)',
    },
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: 'moon',
    dark: true,
    colors: {
      '--bg': '#121212',
      '--bg-secondary': '#1e1e1e',
      '--bg-tertiary': '#2c2c2c',
      '--text': '#e0e0e0',
      '--text-secondary': '#aaaaaa',
      '--text-muted': '#666666',
      '--border': '#333333',
      '--accent': '#5b9cf5',
      '--accent-hover': '#4a8ae4',
      '--accent-text': '#ffffff',
      '--danger': '#e74c3c',
      '--danger-hover': '#c0392b',
      '--sidebar-bg': '#161616',
      '--shadow': '0 1px 3px rgba(0,0,0,0.3)',
    },
  },
  {
    id: 'dark-modern',
    label: 'Dark Modern',
    icon: 'moon',
    dark: true,
    colors: {
      '--bg': '#1a1a2e',
      '--bg-secondary': '#16213e',
      '--bg-tertiary': '#0f3460',
      '--text': '#e0e0e0',
      '--text-secondary': '#a0a0b0',
      '--text-muted': '#6c6c7e',
      '--border': '#2a2a4a',
      '--accent': '#5b9cf5',
      '--accent-hover': '#4a8ae4',
      '--accent-text': '#ffffff',
      '--danger': '#e74c3c',
      '--danger-hover': '#c0392b',
      '--sidebar-bg': '#141428',
      '--shadow': '0 1px 3px rgba(0,0,0,0.3)',
    },
  },
  {
    id: 'dark-oled',
    label: 'Dark OLED',
    icon: 'circle',
    dark: true,
    colors: {
      '--bg': '#000000',
      '--bg-secondary': '#000000',
      '--bg-tertiary': '#0a0a0a',
      '--text': '#e0e0e0',
      '--text-secondary': '#888888',
      '--text-muted': '#444444',
      '--border': '#1a1a1a',
      '--accent': '#6ab0f3',
      '--accent-hover': '#5a9ee0',
      '--accent-text': '#ffffff',
      '--danger': '#e74c3c',
      '--danger-hover': '#c0392b',
      '--sidebar-bg': '#000000',
      '--shadow': '0 1px 3px rgba(0,0,0,0.5)',
    },
  },
  {
    id: 'gruvbox',
    label: 'Gruvbox',
    icon: 'moon',
    dark: true,
    colors: {
      '--bg': '#282828',
      '--bg-secondary': '#3c3836',
      '--bg-tertiary': '#504945',
      '--text': '#ebdbb2',
      '--text-secondary': '#a89984',
      '--text-muted': '#7c6f64',
      '--border': '#504945',
      '--accent': '#83a598',
      '--accent-hover': '#6a9bca',
      '--accent-text': '#ffffff',
      '--danger': '#fb4934',
      '--danger-hover': '#e03a2a',
      '--sidebar-bg': '#1d2021',
      '--shadow': '0 1px 3px rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'everforest',
    label: 'Everforest',
    icon: 'moon',
    dark: true,
    colors: {
      '--bg': '#2d353b',
      '--bg-secondary': '#343f44',
      '--bg-tertiary': '#3d484d',
      '--text': '#d3c6aa',
      '--text-secondary': '#9da9a0',
      '--text-muted': '#6a7a72',
      '--border': '#3d484d',
      '--accent': '#7fbbb3',
      '--accent-hover': '#69a89f',
      '--accent-text': '#ffffff',
      '--danger': '#e67e80',
      '--danger-hover': '#d16d6f',
      '--sidebar-bg': '#272e33',
      '--shadow': '0 1px 3px rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'catppuccin',
    label: 'Catppuccin',
    icon: 'moon',
    dark: true,
    colors: {
      '--bg': '#1e1e2e',
      '--bg-secondary': '#181825',
      '--bg-tertiary': '#313244',
      '--text': '#cdd6f4',
      '--text-secondary': '#a6adc8',
      '--text-muted': '#6c7086',
      '--border': '#45475a',
      '--accent': '#89b4fa',
      '--accent-hover': '#74c7ec',
      '--accent-text': '#1e1e2e',
      '--danger': '#f38ba8',
      '--danger-hover': '#eba0ac',
      '--sidebar-bg': '#11111b',
      '--shadow': '0 1px 3px rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'nord',
    label: 'Nord',
    icon: 'moon',
    dark: true,
    colors: {
      '--bg': '#2e3440',
      '--bg-secondary': '#3b4252',
      '--bg-tertiary': '#434c5e',
      '--text': '#eceff4',
      '--text-secondary': '#d8dee9',
      '--text-muted': '#7b88a1',
      '--border': '#4c566a',
      '--accent': '#88c0d0',
      '--accent-hover': '#81a1c1',
      '--accent-text': '#2e3440',
      '--danger': '#bf616a',
      '--danger-hover': '#d08770',
      '--sidebar-bg': '#252b38',
      '--shadow': '0 1px 3px rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'tokyo-night',
    label: 'Tokyo Night',
    icon: 'moon',
    dark: true,
    colors: {
      '--bg': '#1a1b26',
      '--bg-secondary': '#24283b',
      '--bg-tertiary': '#2f3348',
      '--text': '#a9b1d6',
      '--text-secondary': '#787c99',
      '--text-muted': '#565f89',
      '--border': '#363b54',
      '--accent': '#7aa2f7',
      '--accent-hover': '#89ddff',
      '--accent-text': '#1a1b26',
      '--danger': '#f7768e',
      '--danger-hover': '#ff9e64',
      '--sidebar-bg': '#13141f',
      '--shadow': '0 1px 3px rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'dracula',
    label: 'Dracula',
    icon: 'moon',
    dark: true,
    colors: {
      '--bg': '#282a36',
      '--bg-secondary': '#21222c',
      '--bg-tertiary': '#343746',
      '--text': '#f8f8f2',
      '--text-secondary': '#c0c0c8',
      '--text-muted': '#7a7a85',
      '--border': '#44475a',
      '--accent': '#bd93f9',
      '--accent-hover': '#ff79c6',
      '--accent-text': '#282a36',
      '--danger': '#ff5555',
      '--danger-hover': '#ff6e6e',
      '--sidebar-bg': '#1e1f29',
      '--shadow': '0 1px 3px rgba(0,0,0,0.4)',
    },
  },
];

export default themes;

export function applyThemeById(id: string): void {
  const theme = themes.find(t => t.id === id);
  if (!theme) return;
  const root = document.documentElement;
  // Remove all theme classes
  for (const t of themes) {
    root.classList.remove(t.id);
  }
  // Set CSS variables
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(key, value);
  }
  // Also keep the class for backward compat (e.g. CodeMirror oneDark detection)
  if (id !== 'light') {
    root.classList.add(id);
  }
}

export function getThemeById(id: string): ThemeDef | undefined {
  return themes.find(t => t.id === id);
}
