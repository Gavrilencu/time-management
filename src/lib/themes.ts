import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'blue';

export interface ThemeConfig {
	name: string;
	label: string;
	colors: {
		primary: string;
		secondary: string;
		background: string;
		surface: string;
		text: string;
		textSecondary: string;
		border: string;
		accent: string;
		success: string;
		warning: string;
		error: string;
	};
}

export const themes: Record<Theme, ThemeConfig> = {
	light: {
		name: 'light',
		label: 'Luminos',
		colors: {
			primary: '#2563eb',
			secondary: '#64748b',
			background: '#ffffff',
			surface: '#f8fafc',
			text: '#1f2937',
			textSecondary: '#6b7280',
			border: '#e5e7eb',
			accent: '#3b82f6',
			success: '#059669',
			warning: '#d97706',
			error: '#dc2626'
		}
	},
	dark: {
		name: 'dark',
		label: 'Întunecat',
		colors: {
			primary: '#3b82f6',
			secondary: '#94a3b8',
			background: '#0f172a',
			surface: '#1e293b',
			text: '#f1f5f9',
			textSecondary: '#cbd5e1',
			border: '#334155',
			accent: '#60a5fa',
			success: '#10b981',
			warning: '#f59e0b',
			error: '#ef4444'
		}
	},
	blue: {
		name: 'blue',
		label: 'Albastru',
		colors: {
			primary: '#1e40af',
			secondary: '#475569',
			background: '#f0f9ff',
			surface: '#e0f2fe',
			text: '#0c4a6e',
			textSecondary: '#0369a1',
			border: '#bae6fd',
			accent: '#0284c7',
			success: '#059669',
			warning: '#d97706',
			error: '#dc2626'
		}
	}
};

// Store pentru tema curentă
function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('light');

	return {
		subscribe,
		setTheme: (theme: Theme) => {
			set(theme);
			localStorage.setItem('kpi-theme', theme);
			applyTheme(theme);
		},
		initTheme: () => {
			const savedTheme = localStorage.getItem('kpi-theme') as Theme;
			const theme = savedTheme && themes[savedTheme] ? savedTheme : 'light';
			set(theme);
			applyTheme(theme);
		}
	};
}

// Funcție pentru aplicarea temei
function applyTheme(theme: Theme) {
	const themeConfig = themes[theme];
	const root = document.documentElement;
	
	// Aplică variabilele CSS
	Object.entries(themeConfig.colors).forEach(([key, value]) => {
		root.style.setProperty(`--color-${key}`, value);
	});
	
	// Adaugă clasa pentru tema
	root.className = root.className.replace(/theme-\w+/g, '');
	root.classList.add(`theme-${theme}`);
}

export const currentTheme = createThemeStore();
