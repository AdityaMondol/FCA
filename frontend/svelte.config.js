import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			runtime: 'nodejs18.x'
		}),
		prerender: {
			entries: ['/', '/teachers', '/facilities', '/notices', '/media', '/contact']
		}
	},
	onwarn: (warning, handler) => {
		// Disable a11y warnings during build
		if (warning.code.startsWith('a11y-')) {
			return;
		}
		handler(warning);
	}
};

export default config;