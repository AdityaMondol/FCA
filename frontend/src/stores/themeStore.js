import { writable } from 'svelte/store';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

export const darkMode = writable(getInitialTheme());

darkMode.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', value ? 'dark' : 'light');
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});

export const toggleTheme = () => {
  darkMode.update(value => !value);
};
