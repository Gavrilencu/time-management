import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

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
			text: '#f1f5f9',
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
			sidebarText: '#f1f5f9',
			navbar: '#0f172a',
			navbarText: '#f1f5f9',
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
			background: '#ffffff',
			surface: '#f0f9ff',
			text: '#0c4a6e',
			textSecondary: '#0369a1',
			border: '#bae6fd',
			accent: '#0284c7',
			success: '#059669',
			warning: '#d97706',
			error: '#dc2626',
			// Componente suplimentare
			card: '#ffffff',
			cardBorder: '#bae6fd',
			button: '#1e40af',
			buttonHover: '#1e3a8a',
			buttonSecondary: '#f0f9ff',
			input: '#ffffff',
			inputBorder: '#bae6fd',
			inputFocus: '#0284c7',
			modal: '#ffffff',
			modalOverlay: 'rgba(14, 165, 233, 0.3)',
			sidebar: '#f0f9ff',
			sidebarText: '#0369a1',
			navbar: '#ffffff',
			navbarText: '#0c4a6e',
			table: '#ffffff',
			tableHeader: '#f0f9ff',
			tableRow: '#ffffff',
			tableBorder: '#bae6fd',
			badge: '#dbeafe',
			badgeText: '#1e40af',
			progress: '#bae6fd',
			progressFill: '#0284c7',
			shadow: 'rgba(14, 165, 233, 0.1)',
			shadowHover: 'rgba(14, 165, 233, 0.2)'
		}
	},
	green: {
		name: 'green',
		label: 'Verde',
		colors: {
			primary: '#059669',
			secondary: '#6b7280',
			background: '#ffffff',
			surface: '#f0fdf4',
			text: '#14532d',
			textSecondary: '#166534',
			border: '#bbf7d0',
			accent: '#16a34a',
			success: '#059669',
			warning: '#d97706',
			error: '#dc2626',
			// Componente suplimentare
			card: '#ffffff',
			cardBorder: '#bbf7d0',
			button: '#059669',
			buttonHover: '#047857',
			buttonSecondary: '#f0fdf4',
			input: '#ffffff',
			inputBorder: '#bbf7d0',
			inputFocus: '#16a34a',
			modal: '#ffffff',
			modalOverlay: 'rgba(5, 150, 105, 0.3)',
			sidebar: '#f0fdf4',
			sidebarText: '#166534',
			navbar: '#ffffff',
			navbarText: '#14532d',
			table: '#ffffff',
			tableHeader: '#f0fdf4',
			tableRow: '#ffffff',
			tableBorder: '#bbf7d0',
			badge: '#dcfce7',
			badgeText: '#14532d',
			progress: '#bbf7d0',
			progressFill: '#16a34a',
			shadow: 'rgba(5, 150, 105, 0.1)',
			shadowHover: 'rgba(5, 150, 105, 0.2)'
		}
	},
	purple: {
		name: 'purple',
		label: 'Mov',
		colors: {
			primary: '#7c3aed',
			secondary: '#6b7280',
			background: '#ffffff',
			surface: '#faf5ff',
			text: '#581c87',
			textSecondary: '#7c2d12',
			border: '#e9d5ff',
			accent: '#8b5cf6',
			success: '#059669',
			warning: '#d97706',
			error: '#dc2626',
			// Componente suplimentare
			card: '#ffffff',
			cardBorder: '#e9d5ff',
			button: '#7c3aed',
			buttonHover: '#6d28d9',
			buttonSecondary: '#faf5ff',
			input: '#ffffff',
			inputBorder: '#e9d5ff',
			inputFocus: '#8b5cf6',
			modal: '#ffffff',
			modalOverlay: 'rgba(124, 58, 237, 0.3)',
			sidebar: '#faf5ff',
			sidebarText: '#7c2d12',
			navbar: '#ffffff',
			navbarText: '#581c87',
			table: '#ffffff',
			tableHeader: '#faf5ff',
			tableRow: '#ffffff',
			tableBorder: '#e9d5ff',
			badge: '#f3e8ff',
			badgeText: '#581c87',
			progress: '#e9d5ff',
			progressFill: '#8b5cf6',
			shadow: 'rgba(124, 58, 237, 0.1)',
			shadowHover: 'rgba(124, 58, 237, 0.2)'
		}
	},
	orange: {
		name: 'orange',
		label: 'Portocaliu',
		colors: {
			primary: '#ea580c',
			secondary: '#6b7280',
			background: '#ffffff',
			surface: '#fff7ed',
			text: '#9a3412',
			textSecondary: '#c2410c',
			border: '#fdba74',
			accent: '#f97316',
			success: '#059669',
			warning: '#d97706',
			error: '#dc2626',
			// Componente suplimentare
			card: '#ffffff',
			cardBorder: '#fdba74',
			button: '#ea580c',
			buttonHover: '#dc2626',
			buttonSecondary: '#fff7ed',
			input: '#ffffff',
			inputBorder: '#fdba74',
			inputFocus: '#f97316',
			modal: '#ffffff',
			modalOverlay: 'rgba(234, 88, 12, 0.3)',
			sidebar: '#fff7ed',
			sidebarText: '#c2410c',
			navbar: '#ffffff',
			navbarText: '#9a3412',
			table: '#ffffff',
			tableHeader: '#fff7ed',
			tableRow: '#ffffff',
			tableBorder: '#fdba74',
			badge: '#fed7aa',
			badgeText: '#9a3412',
			progress: '#fdba74',
			progressFill: '#f97316',
			shadow: 'rgba(234, 88, 12, 0.1)',
			shadowHover: 'rgba(234, 88, 12, 0.2)'
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
