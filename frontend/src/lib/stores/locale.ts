import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { locale } from 'svelte-i18n';

export type Locale = 'en' | 'bn';

const defaultLocale: Locale = 'bn';

const initialLocale = browser 
  ? (localStorage.getItem('locale') as Locale) || defaultLocale
  : defaultLocale;

export const currentLocale = writable<Locale>(initialLocale);

export function setLocale(newLocale: Locale) {
  currentLocale.set(newLocale);
  locale.set(newLocale);
  
  if (browser) {
    localStorage.setItem('locale', newLocale);
    // Update document language
    document.documentElement.lang = newLocale;
  }
}

// Initialize locale
if (browser) {
  locale.set(initialLocale);
  document.documentElement.lang = initialLocale;
}