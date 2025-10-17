import { browser } from '$app/environment';
import { init, register } from 'svelte-i18n';

const defaultLocale = 'bn';

register('en', () => import('./locales/en.json'));
register('bn', () => import('./locales/bn.json'));

init({
  fallbackLocale: 'en',
  initialLocale: browser ? window.localStorage.getItem('locale') || defaultLocale : defaultLocale,
});

export { _ } from 'svelte-i18n';