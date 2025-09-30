import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit()],
	base: '/time-management/',
	
	// Configurație pentru dezvoltare
	server: {
		port: 5175,
		host: true,
		fs: {
			allow: ['..']
		}
	},
	
	// Configurație pentru producție
	build: {
		target: 'esnext',
		minify: mode === 'production' ? 'terser' : false,
		sourcemap: mode === 'development',
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['svelte'],
					icons: ['lucide-svelte'],
					utils: ['date-fns', 'date-fns/locale']
				}
			}
		},
		chunkSizeWarningLimit: 1000
	},
	
	// Optimizări pentru cache
	optimizeDeps: {
		include: ['lucide-svelte', 'date-fns', 'date-fns/locale']
	},
	
	// Configurare pentru viteza de dezvoltare
	esbuild: {
		target: 'esnext'
	},
	
	// Configurare pentru viteza de încărcare
	define: {
		__DEV__: JSON.stringify(mode === 'development')
	}
}));
