import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Adapter static pentru hosting pe servere statice
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base: '/time-monitoring'
		},
		
		// Optimizări pentru performanță
		prerender: {
			handleHttpError: 'warn'
		},
		
		// Configurare pentru viteza de dezvoltare
		serviceWorker: {
			register: false
		}
	}
};

export default config;
