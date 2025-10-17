import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

const defaultTheme: Theme = 'system';

const initialTheme = browser 
  ? (localStorage.getItem('theme') as Theme) || defaultTheme
  : defaultTheme;

export const theme = writable<Theme>(initialTheme);

export function setTheme(newTheme: Theme) {
  theme.set(newTheme);
  
  if (browser) {
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }
}

export function applyTheme(currentTheme: Theme) {
  if (!browser) return;

  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  if (currentTheme === 'system') {
    // Use system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(systemPrefersDark ? 'dark' : 'light');
  } else {
    // Use explicit theme
    root.classList.add(currentTheme);
  }
}

export function getSystemTheme(): 'light' | 'dark' {
  if (!browser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getEffectiveTheme(currentTheme: Theme): 'light' | 'dark' {
  if (currentTheme === 'system') {
    return getSystemTheme();
  }
  return currentTheme;
}

// Initialize theme on load
if (browser) {
  // Apply initial theme
  applyTheme(initialTheme);
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    theme.subscribe(currentTheme => {
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    })();
  });
}