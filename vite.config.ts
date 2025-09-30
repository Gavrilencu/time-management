import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	base: '/time-monitoring/',
	
	// Optimizări pentru performanță
	server: {
		port: 5175,
		host: true,
		// Optimizări pentru viteza de dezvoltare
		fs: {
			allow: ['..']
		}
	},
	
	// Optimizări pentru build
	build: {
		target: 'esnext',
		minify: 'esbuild',
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['svelte'],
					icons: ['lucide-svelte'],
					utils: ['date-fns']
				}
			}
		}
	},
	
	// Optimizări pentru cache
	optimizeDeps: {
		include: [
			'lucide-svelte',
			'date-fns',
			'svelte'
		],
		exclude: []
	},
	
	// Configurare pentru viteza de dezvoltare
	esbuild: {
		target: 'esnext'
	},
	
	// Configurare pentru viteza de încărcare
	define: {
		__DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
	}
});
