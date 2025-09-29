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
		// Culori pentru componente suplimentare
		card: string;
		cardBorder: string;
		button: string;
		buttonHover: string;
		buttonSecondary: string;
		input: string;
		inputBorder: string;
		inputFocus: string;
		modal: string;
		modalOverlay: string;
		sidebar: string;
		sidebarText: string;
		navbar: string;
		navbarText: string;
		table: string;
		tableHeader: string;
		tableRow: string;
		tableBorder: string;
		badge: string;
		badgeText: string;
		progress: string;
		progressFill: string;
		shadow: string;
		shadowHover: string;
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
			error: '#dc2626',
			// Componente suplimentare
			card: '#ffffff',
			cardBorder: '#e5e7eb',
			button: '#2563eb',
			buttonHover: '#1d4ed8',
			buttonSecondary: '#f3f4f6',
			input: '#ffffff',
			inputBorder: '#d1d5db',
			inputFocus: '#3b82f6',
			modal: '#ffffff',
			modalOverlay: 'rgba(0, 0, 0, 0.5)',
			sidebar: '#f8fafc',
			sidebarText: '#6b7280',
			navbar: '#ffffff',
			navbarText: '#1f2937',
			table: '#ffffff',
			tableHeader: '#f9fafb',
			tableRow: '#ffffff',
			tableBorder: '#e5e7eb',
			badge: '#eff6ff',
			badgeText: '#1e40af',
			progress: '#e5e7eb',
			progressFill: '#3b82f6',
			shadow: 'rgba(0, 0, 0, 0.1)',
			shadowHover: 'rgba(0, 0, 0, 0.15)'
		}
	},
	dark: {
		name: 'dark',
		label: 'Întunecat',
		colors: {
			primary: '#60a5fa',
			secondary: '#94a3b8',
			background: '#0f172a',
			surface: '#1e293b',
			text: '#f8fafc',
			textSecondary: '#cbd5e1',
			border: '#334155',
			accent: '#3b82f6',
			success: '#34d399',
			warning: '#fbbf24',
			error: '#f87171',
			// Componente suplimentare
			card: '#1e293b',
			cardBorder: '#334155',
			button: '#3b82f6',
			buttonHover: '#2563eb',
			buttonSecondary: '#374151',
			input: '#1e293b',
			inputBorder: '#475569',
			inputFocus: '#60a5fa',
			modal: '#1e293b',
			modalOverlay: 'rgba(0, 0, 0, 0.7)',
			sidebar: '#1e293b',
			sidebarText: '#cbd5e1',
			navbar: '#0f172a',
			navbarText: '#f8fafc',
			table: '#1e293b',
			tableHeader: '#334155',
			tableRow: '#1e293b',
			tableBorder: '#475569',
			badge: '#1e3a8a',
			badgeText: '#93c5fd',
			progress: '#374151',
			progressFill: '#60a5fa',
			shadow: 'rgba(0, 0, 0, 0.3)',
			shadowHover: 'rgba(0, 0, 0, 0.4)'
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
			error: '#dc2626',
			// Componente suplimentare
			card: '#e0f2fe',
			cardBorder: '#bae6fd',
			button: '#1e40af',
			buttonHover: '#1e3a8a',
			buttonSecondary: '#e0f2fe',
			input: '#f0f9ff',
			inputBorder: '#bae6fd',
			inputFocus: '#0284c7',
			modal: '#e0f2fe',
			modalOverlay: 'rgba(14, 165, 233, 0.3)',
			sidebar: '#e0f2fe',
			sidebarText: '#0369a1',
			navbar: '#f0f9ff',
			navbarText: '#0c4a6e',
			table: '#e0f2fe',
			tableHeader: '#bae6fd',
			tableRow: '#e0f2fe',
			tableBorder: '#bae6fd',
			badge: '#dbeafe',
			badgeText: '#1e40af',
			progress: '#bae6fd',
			progressFill: '#0284c7',
			shadow: 'rgba(14, 165, 233, 0.1)',
			shadowHover: 'rgba(14, 165, 233, 0.2)'
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
	
	// Aplică variabilele CSS de bază
	Object.entries(themeConfig.colors).forEach(([key, value]) => {
		root.style.setProperty(`--color-${key}`, value);
	});
	
	// Adaugă clasa pentru tema
	root.className = root.className.replace(/theme-\w+/g, '');
	root.classList.add(`theme-${theme}`);
}

export const currentTheme = createThemeStore();
