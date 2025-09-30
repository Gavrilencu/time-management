import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange' | 'modern-light' | 'modern-dark';

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
		// Culori moderne suplimentare
		primaryLight?: string;
		primaryDark?: string;
		secondaryLight?: string;
		secondaryDark?: string;
		accentLight?: string;
		accentDark?: string;
		backgroundSecondary?: string;
		backgroundTertiary?: string;
		backgroundElevated?: string;
		surfaceHover?: string;
		surfaceActive?: string;
		surfaceBorder?: string;
		textTertiary?: string;
		textInverse?: string;
		textDisabled?: string;
		borderLight?: string;
		borderDark?: string;
		borderFocus?: string;
		shadowLight?: string;
		shadowDark?: string;
		shadowFocus?: string;
		glass?: string;
		glassBorder?: string;
		gradient?: string;
	};
	
	// Typography
	typography?: {
		fontFamily: string;
		fontFamilyMono: string;
		fontSize: {
			xs: string;
			sm: string;
			base: string;
			lg: string;
			xl: string;
			'2xl': string;
			'3xl': string;
			'4xl': string;
		};
		fontWeight: {
			light: number;
			normal: number;
			medium: number;
			semibold: number;
			bold: number;
		};
		lineHeight: {
			tight: number;
			normal: number;
			relaxed: number;
		};
	};
	
	// Spacing
	spacing?: {
		xs: string;
		sm: string;
		md: string;
		lg: string;
		xl: string;
		'2xl': string;
		'3xl': string;
	};
	
	// Border Radius
	borderRadius?: {
		none: string;
		sm: string;
		md: string;
		lg: string;
		xl: string;
		'2xl': string;
		full: string;
	};
	
	// Shadows
	shadows?: {
		none: string;
		sm: string;
		md: string;
		lg: string;
		xl: string;
		'2xl': string;
		inner: string;
	};
	
	// Transitions
	transitions?: {
		fast: string;
		normal: string;
		slow: string;
		ease: string;
		easeIn: string;
		easeOut: string;
		easeInOut: string;
	};
}

export const themes: Record<Theme, ThemeConfig> = {
	light: {
		name: 'light',
		label: 'Luminos',
		colors: {
			primary: '#3b82f6',
			secondary: '#64748b',
			background: '#ffffff',
			surface: '#f8fafc',
			text: '#1e293b',
			textSecondary: '#64748b',
			border: '#e2e8f0',
			accent: '#06b6d4',
			success: '#10b981',
			warning: '#f59e0b',
			error: '#ef4444',
			// Componente suplimentare
			card: '#ffffff',
			cardBorder: '#e2e8f0',
			button: '#3b82f6',
			buttonHover: '#2563eb',
			buttonSecondary: '#f1f5f9',
			input: '#ffffff',
			inputBorder: '#d1d5db',
			inputFocus: '#3b82f6',
			modal: '#ffffff',
			modalOverlay: 'rgba(0, 0, 0, 0.4)',
			sidebar: '#f8fafc',
			sidebarText: '#475569',
			navbar: '#ffffff',
			navbarText: '#1e293b',
			table: '#ffffff',
			tableHeader: '#f1f5f9',
			tableRow: '#ffffff',
			tableBorder: '#e2e8f0',
			badge: '#dbeafe',
			badgeText: '#1e40af',
			progress: '#e2e8f0',
			progressFill: '#3b82f6',
			shadow: 'rgba(0, 0, 0, 0.08)',
			shadowHover: 'rgba(0, 0, 0, 0.12)'
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
			accent: '#22d3ee',
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
			sidebarText: '#f8fafc',
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
	'modern-light': {
		name: 'modern-light',
		label: 'Modern Luminos',
		colors: {
			primary: '#3B82F6',
			secondary: '#8B5CF6',
			background: '#FFFFFF',
			surface: '#F8FAFC',
			text: '#0F172A',
			textSecondary: '#475569',
			border: '#E2E8F0',
			accent: '#10B981',
			success: '#10B981',
			warning: '#F59E0B',
			error: '#EF4444',
			// Componente suplimentare
			card: '#FFFFFF',
			cardBorder: '#E2E8F0',
			button: '#3B82F6',
			buttonHover: '#2563EB',
			buttonSecondary: '#F1F5F9',
			input: '#FFFFFF',
			inputBorder: '#D1D5DB',
			inputFocus: '#3B82F6',
			modal: '#FFFFFF',
			modalOverlay: 'rgba(0, 0, 0, 0.5)',
			sidebar: '#F8FAFC',
			sidebarText: '#475569',
			navbar: '#FFFFFF',
			navbarText: '#0F172A',
			table: '#FFFFFF',
			tableHeader: '#F1F5F9',
			tableRow: '#FFFFFF',
			tableBorder: '#E2E8F0',
			badge: '#DBEAFE',
			badgeText: '#1E40AF',
			progress: '#E2E8F0',
			progressFill: '#3B82F6',
			shadow: 'rgba(0, 0, 0, 0.1)',
			shadowHover: 'rgba(0, 0, 0, 0.15)',
			// Culori moderne suplimentare
			primaryLight: '#DBEAFE',
			primaryDark: '#1E40AF',
			secondaryLight: '#EDE9FE',
			secondaryDark: '#6D28D9',
			accentLight: '#D1FAE5',
			accentDark: '#047857',
			backgroundSecondary: '#F8FAFC',
			backgroundTertiary: '#F1F5F9',
			backgroundElevated: '#FFFFFF',
			surfaceHover: '#F8FAFC',
			surfaceActive: '#F1F5F9',
			surfaceBorder: '#E2E8F0',
			textTertiary: '#94A3B8',
			textInverse: '#FFFFFF',
			textDisabled: '#CBD5E1',
			borderLight: '#F1F5F9',
			borderDark: '#CBD5E1',
			borderFocus: '#3B82F6',
			shadowLight: 'rgba(0, 0, 0, 0.05)',
			shadowDark: 'rgba(0, 0, 0, 0.2)',
			shadowFocus: 'rgba(59, 130, 246, 0.3)',
			glass: 'rgba(255, 255, 255, 0.8)',
			glassBorder: 'rgba(255, 255, 255, 0.2)',
			gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		},
		typography: {
			fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
			fontFamilyMono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
			fontSize: {
				xs: '0.75rem',
				sm: '0.875rem',
				base: '1rem',
				lg: '1.125rem',
				xl: '1.25rem',
				'2xl': '1.5rem',
				'3xl': '1.875rem',
				'4xl': '2.25rem',
			},
			fontWeight: {
				light: 300,
				normal: 400,
				medium: 500,
				semibold: 600,
				bold: 700,
			},
			lineHeight: {
				tight: 1.25,
				normal: 1.5,
				relaxed: 1.75,
			},
		},
		spacing: {
			xs: '0.25rem',
			sm: '0.5rem',
			md: '1rem',
			lg: '1.5rem',
			xl: '2rem',
			'2xl': '3rem',
			'3xl': '4rem',
		},
		borderRadius: {
			none: '0',
			sm: '0.25rem',
			md: '0.5rem',
			lg: '0.75rem',
			xl: '1rem',
			'2xl': '1.5rem',
			full: '9999px',
		},
		shadows: {
			none: 'none',
			sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
			md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
			lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
			xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			'2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
			inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
		},
		transitions: {
			fast: '150ms',
			normal: '250ms',
			slow: '350ms',
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
			easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
			easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
		},
	},
	'modern-dark': {
		name: 'modern-dark',
		label: 'Modern Întunecat',
		colors: {
			primary: '#60A5FA',
			secondary: '#A78BFA',
			background: '#0F172A',
			surface: '#1E293B',
			text: '#F8FAFC',
			textSecondary: '#CBD5E1',
			border: '#334155',
			accent: '#34D399',
			success: '#34D399',
			warning: '#FBBF24',
			error: '#F87171',
			// Componente suplimentare
			card: '#1E293B',
			cardBorder: '#334155',
			button: '#3B82F6',
			buttonHover: '#2563EB',
			buttonSecondary: '#374151',
			input: '#1E293B',
			inputBorder: '#475569',
			inputFocus: '#60A5FA',
			modal: '#1E293B',
			modalOverlay: 'rgba(0, 0, 0, 0.7)',
			sidebar: '#1E293B',
			sidebarText: '#F8FAFC',
			navbar: '#0F172A',
			navbarText: '#F8FAFC',
			table: '#1E293B',
			tableHeader: '#334155',
			tableRow: '#1E293B',
			tableBorder: '#475569',
			badge: '#1E3A8A',
			badgeText: '#93C5FD',
			progress: '#374151',
			progressFill: '#60A5FA',
			shadow: 'rgba(0, 0, 0, 0.3)',
			shadowHover: 'rgba(0, 0, 0, 0.4)',
			// Culori moderne suplimentare
			primaryLight: '#1E3A8A',
			primaryDark: '#1E40AF',
			secondaryLight: '#4C1D95',
			secondaryDark: '#6D28D9',
			accentLight: '#064E3B',
			accentDark: '#047857',
			backgroundSecondary: '#1E293B',
			backgroundTertiary: '#334155',
			backgroundElevated: '#1E293B',
			surfaceHover: '#334155',
			surfaceActive: '#475569',
			surfaceBorder: '#334155',
			textTertiary: '#94A3B8',
			textInverse: '#0F172A',
			textDisabled: '#64748B',
			borderLight: '#475569',
			borderDark: '#1E293B',
			borderFocus: '#60A5FA',
			shadowLight: 'rgba(0, 0, 0, 0.1)',
			shadowDark: 'rgba(0, 0, 0, 0.5)',
			shadowFocus: 'rgba(96, 165, 250, 0.3)',
			glass: 'rgba(30, 41, 59, 0.8)',
			glassBorder: 'rgba(255, 255, 255, 0.1)',
			gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		},
		typography: {
			fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
			fontFamilyMono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
			fontSize: {
				xs: '0.75rem',
				sm: '0.875rem',
				base: '1rem',
				lg: '1.125rem',
				xl: '1.25rem',
				'2xl': '1.5rem',
				'3xl': '1.875rem',
				'4xl': '2.25rem',
			},
			fontWeight: {
				light: 300,
				normal: 400,
				medium: 500,
				semibold: 600,
				bold: 700,
			},
			lineHeight: {
				tight: 1.25,
				normal: 1.5,
				relaxed: 1.75,
			},
		},
		spacing: {
			xs: '0.25rem',
			sm: '0.5rem',
			md: '1rem',
			lg: '1.5rem',
			xl: '2rem',
			'2xl': '3rem',
			'3xl': '4rem',
		},
		borderRadius: {
			none: '0',
			sm: '0.25rem',
			md: '0.5rem',
			lg: '0.75rem',
			xl: '1rem',
			'2xl': '1.5rem',
			full: '9999px',
		},
		shadows: {
			none: 'none',
			sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
			md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
			lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
			xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
			'2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
			inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
		},
		transitions: {
			fast: '150ms',
			normal: '250ms',
			slow: '350ms',
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
			easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
			easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
		},
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
	const { subscribe, set, update } = writable<Theme>('modern-light');

	return {
		subscribe,
		setTheme: (theme: Theme) => {
			set(theme);
			localStorage.setItem('kpi-theme', theme);
			applyTheme(theme);
		},
		initTheme: () => {
			const savedTheme = localStorage.getItem('kpi-theme') as Theme;
			const theme = savedTheme && themes[savedTheme] ? savedTheme : 'modern-light';
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
	
	// Aplică variabilele de tipografie dacă există
	if (themeConfig.typography) {
		Object.entries(themeConfig.typography).forEach(([category, values]) => {
			if (typeof values === 'object') {
				Object.entries(values).forEach(([key, value]) => {
					root.style.setProperty(`--font-${category}-${key}`, value);
				});
			} else {
				root.style.setProperty(`--font-${category}`, values);
			}
		});
	}
	
	// Aplică variabilele de spacing dacă există
	if (themeConfig.spacing) {
		Object.entries(themeConfig.spacing).forEach(([key, value]) => {
			root.style.setProperty(`--spacing-${key}`, value);
		});
	}
	
	// Aplică variabilele de border radius dacă există
	if (themeConfig.borderRadius) {
		Object.entries(themeConfig.borderRadius).forEach(([key, value]) => {
			root.style.setProperty(`--radius-${key}`, value);
		});
	}
	
	// Aplică variabilele de shadow dacă există
	if (themeConfig.shadows) {
		Object.entries(themeConfig.shadows).forEach(([key, value]) => {
			root.style.setProperty(`--shadow-${key}`, value);
		});
	}
	
	// Aplică variabilele de transition dacă există
	if (themeConfig.transitions) {
		Object.entries(themeConfig.transitions).forEach(([key, value]) => {
			root.style.setProperty(`--transition-${key}`, value);
		});
	}
	
	// Adaugă clasa pentru tema
	root.className = root.className.replace(/theme-\w+/g, '');
	root.classList.add(`theme-${theme}`);
}

export const currentTheme = createThemeStore();