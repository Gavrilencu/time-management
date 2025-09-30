<script lang="ts">
import favicon from '$lib/assets/favicon.svg';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { Calendar, Clock, BarChart3, Settings, LogOut, Plus, Users } from 'lucide-svelte';
import NotificationContainer from '$lib/NotificationContainer.svelte';
import { userService } from '$lib/api';
import { notifications } from '$lib/notifications';
import { getKerberosUser, kerberosLogout } from '$lib/kerberos';
import { currentUser, isAuthenticated, authLoading, setCurrentUser, clearCurrentUser, setAuthLoading } from '$lib/auth';
import { currentTheme } from '$lib/themes';
import '$lib/app.css';

let { children } = $props();

// Autentificare automată cu Kerberos (non-blocking)
onMount(() => {
// Inițializează tema
currentTheme.initTheme();
// Nu bloca încărcarea paginii - autentificarea se face în background
authenticateInBackground();
});

async function authenticateInBackground() {
try {
setAuthLoading(true);
const kerberosData = await getKerberosUser();
await authenticateUser(kerberosData);
} catch (error) {
console.error('Kerberos authentication failed:', error);
// Nu există fallback - utilizatorul trebuie să se autentifice prin Kerberos
notifications.error('Autentificare eșuată', 'Nu s-a putut autentifica utilizatorul prin Kerberos!');
} finally {
setAuthLoading(false);
}
}

async function authenticateUser(kerberosData: { username: string; email: string; displayName: string; department: string; domain?: string; groups?: string[] }) {
	try {
		// Optimizare: verifică direct utilizatorul după email în loc să încarci toți utilizatorii
		let user;
		try {
			user = await userService.getByEmail(kerberosData.email);
			
			// Actualizează informațiile utilizatorului cu datele Kerberos
			if (user.name !== kerberosData.displayName || user.department !== kerberosData.department) {
				user = await userService.update(user.id!, {
					...user,
					name: kerberosData.displayName,
					department: kerberosData.department
				});
			}
		} catch (error) {
			// Utilizatorul nu există, îl creez
			user = await userService.create({
				name: kerberosData.displayName,
				email: kerberosData.email,
				role: 'User', // Rol default
				department: kerberosData.department
			});
			notifications.success('Utilizator creat', `Bun venit, ${kerberosData.displayName}!`);
		}

		if (user) {
			setCurrentUser(user);
			
			// Afișează informații suplimentare despre autentificare
			const welcomeMessage = `Autentificat prin Kerberos: ${kerberosData.username}`;
			if (kerberosData.domain) {
				console.log(`Domain: ${kerberosData.domain}`);
			}
			if (kerberosData.groups && kerberosData.groups.length > 0) {
				console.log(`Groups: ${kerberosData.groups.join(', ')}`);
			}
			
			notifications.info('Autentificare reușită', welcomeMessage);
		}
	} catch (error) {
		console.error('Error authenticating user:', error);
		notifications.error('Eroare autentificare', 'Eroare la autentificarea utilizatorului!');
	}
}

	const menuItems = [
		{ name: 'Dashboard', href: '/time-monitoring/', icon: BarChart3 },
		{ name: 'Calendar', href: '/time-monitoring/calendar', icon: Calendar },
		{ name: 'Timp Lucru', href: '/time-monitoring/time-tracking', icon: Clock },
		{ name: 'Adaugă Task', href: '/time-monitoring/add-task', icon: Plus },
		{ name: 'Setări', href: '/time-monitoring/settings', icon: Settings }
	];

	// Adaugă Admin doar pentru utilizatorii cu rol de admin
	const adminMenuItem = { name: 'Admin', href: '/time-monitoring/admin', icon: Users };
	
	// Funcție pentru a obține meniul complet bazat pe rol
	function getMenuItems() {
		const items = [...menuItems];
		if ($currentUser?.role === 'Admin') {
			items.splice(4, 0, adminMenuItem); // Inserează Admin înainte de Setări
		}
		return items;
	}

function logout() {
	clearCurrentUser();
	// TODO: Implementează logout Kerberos real
	kerberosLogout();
	goto('/time-monitoring/login');
}

////test
</script>

<svelte:head>
<link rel="icon" href={favicon} />
<title>KPI Time Tracker</title>
</svelte:head>

{#if !$isAuthenticated}
<!-- Show login page content -->
{@render children?.()}
{:else}
<div class="app-container">
<aside class="sidebar">
<div class="sidebar-header">
<div class="logo">
<Clock size={32} />
<span>KPI Tracker</span>
</div>
</div>

<nav class="sidebar-nav">
{#each getMenuItems() as item}
<a 
href={item.href} 
class="nav-item" 
class:active={$page.url.pathname === item.href}
>
{#if item.icon === BarChart3}
<BarChart3 size={20} />
{:else if item.icon === Calendar}
<Calendar size={20} />
{:else if item.icon === Clock}
<Clock size={20} />
{:else if item.icon === Plus}
<Plus size={20} />
{:else if item.icon === Users}
<Users size={20} />
{:else if item.icon === Settings}
<Settings size={20} />
{/if}
<span>{item.name}</span>
</a>
{/each}
</nav>

<div class="sidebar-footer">
<div class="user-info">
<div class="user-avatar">
{$currentUser?.name?.charAt(0)}
</div>
<div class="user-details">
<span class="user-name">{$currentUser?.name}</span>
<span class="user-email">{$currentUser?.email}</span>
</div>
</div>
<button class="logout-btn" onclick={logout}>
<LogOut size={16} />
Logout
</button>
</div>
</aside>

<main class="main-content">
{@render children?.()}
</main>
</div>
{/if}

<style>
:global(body) {
margin: 0;
padding: 0;
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
background-color: var(--color-background);
color: var(--color-text);
transition: background-color 0.2s ease, color 0.2s ease;
}

.auth-container {
min-height: 100vh;
display: flex;
align-items: center;
justify-content: center;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
background: white;
padding: 3rem;
border-radius: 16px;
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
text-align: center;
max-width: 400px;
width: 100%;
}

.auth-header .logo {
color: #667eea;
margin-bottom: 1rem;
}

.auth-header h1 {
margin: 0 0 0.5rem 0;
color: #1f2937;
font-size: 2rem;
font-weight: 700;
}

.auth-header p {
color: #6b7280;
margin: 0 0 2rem 0;
}

.auth-spinner {
display: flex;
justify-content: center;
}

.spinner {
width: 40px;
height: 40px;
border: 4px solid #e5e7eb;
border-top: 4px solid #667eea;
border-radius: 50%;
animation: spin 1s linear infinite;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

.app-container {
display: flex;
min-height: 100vh;
}

.sidebar {
	width: 280px;
	background-color: var(--color-sidebar);
	border-right: 1px solid var(--color-border);
	display: flex;
	flex-direction: column;
	position: fixed;
	height: 100vh;
	left: 0;
	top: 0;
	z-index: 1000;
}

.sidebar-header {
	padding: 1.5rem;
	border-bottom: 1px solid var(--color-border);
}

.sidebar-header .logo {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	font-weight: 700;
	font-size: 1.25rem;
	color: var(--color-text);
}

.sidebar-nav {
flex: 1;
padding: 1rem 0;
}

.nav-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1.5rem;
	color: var(--color-sidebarText);
	text-decoration: none;
	transition: all 0.2s;
	border-left: 3px solid transparent;
}

.nav-item:hover {
	background-color: var(--color-surface);
	color: var(--color-text);
}

.nav-item.active {
	background-color: var(--color-primary);
	color: white;
	border-left-color: var(--color-primary);
}

.sidebar-footer {
	padding: 1.5rem;
	border-top: 1px solid var(--color-border);
}

.user-info {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 1rem;
}

.user-avatar {
	width: 40px;
	height: 40px;
	background: var(--color-primary);
	color: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
}

.user-details {
	display: flex;
	flex-direction: column;
}

.user-name {
	font-weight: 600;
	color: var(--color-text);
	font-size: 0.875rem;
}

.user-email {
	color: var(--color-textSecondary);
	font-size: 0.75rem;
}

.logout-btn {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem;
	background: var(--color-buttonSecondary);
	border: none;
	border-radius: 8px;
	color: var(--color-text);
	cursor: pointer;
	transition: all 0.2s;
}

.logout-btn:hover {
	background: var(--color-border);
	color: var(--color-text);
}

.main-content {
	flex: 1;
	margin-left: 280px;
	padding: 2rem;
	background-color: var(--color-background);
	min-height: 100vh;
}

.auth-error {
text-align: center;
padding: 1rem 0;
}

.auth-error p {
color: #dc2626;
margin-bottom: 1rem;
font-size: 0.9rem;
}

.retry-btn {
background: #dc2626;
color: white;
border: none;
padding: 0.75rem 1.5rem;
border-radius: 6px;
cursor: pointer;
font-weight: 500;
transition: background 0.2s;
}

.retry-btn:hover {
background: #b91c1c;
}

/* Variabile CSS pentru teme */
:root {
--color-primary: #2563eb;
--color-secondary: #64748b;
--color-background: #ffffff;
--color-surface: #f8fafc;
--color-text: #1f2937;
--color-textSecondary: #6b7280;
--color-border: #e5e7eb;
--color-accent: #3b82f6;
--color-success: #059669;
--color-warning: #d97706;
--color-error: #dc2626;
--color-card: #ffffff;
--color-cardBorder: #e5e7eb;
--color-button: #2563eb;
--color-buttonHover: #1d4ed8;
--color-buttonSecondary: #f3f4f6;
--color-input: #ffffff;
--color-inputBorder: #d1d5db;
--color-inputFocus: #3b82f6;
--color-modal: #ffffff;
--color-modalOverlay: rgba(0, 0, 0, 0.5);
--color-sidebar: #f8fafc;
--color-sidebarText: #6b7280;
--color-navbar: #ffffff;
--color-navbarText: #1f2937;
--color-table: #ffffff;
--color-tableHeader: #f9fafb;
--color-tableRow: #ffffff;
--color-tableBorder: #e5e7eb;
--color-badge: #eff6ff;
--color-badgeText: #1e40af;
--color-progress: #e5e7eb;
--color-progressFill: #3b82f6;
--color-shadow: rgba(0, 0, 0, 0.1);
--color-shadowHover: rgba(0, 0, 0, 0.15);
}

/* Aplică variabilele în stilurile existente */
.app-container {
background-color: var(--color-background);
color: var(--color-text);
min-height: 100vh;
}

.sidebar {
background-color: var(--color-surface);
border-right: 1px solid var(--color-border);
}

.sidebar-header h1 {
color: var(--color-text);
}

.nav-item {
color: var(--color-textSecondary);
border-radius: 6px;
margin: 0.25rem 0;
padding: 0.75rem 1rem;
transition: all 0.2s ease;
}

.nav-item:hover {
background-color: var(--color-surface);
color: var(--color-text);
}

.nav-item.active {
background-color: var(--color-primary);
color: white;
}

.main-content {
background-color: var(--color-background);
color: var(--color-text);
}

.auth-container {
background-color: var(--color-background);
color: var(--color-text);
}

.auth-card {
background-color: var(--color-surface);
border: 1px solid var(--color-border);
color: var(--color-text);
}

.auth-header h1 {
color: var(--color-text);
}

.auth-header p {
color: var(--color-textSecondary);
}

.auth-error p {
color: var(--color-error);
}

.retry-btn {
background: var(--color-error);
color: white;
border: none;
}

.retry-btn:hover {
background: var(--color-error);
opacity: 0.9;
}

/* Stiluri pentru input-uri și form-uri - folosesc stilurile globale din app.css */

/* Butoane */
button {
background-color: var(--color-button);
color: white;
border: none;
border-radius: 6px;
padding: 0.75rem 1rem;
font-size: 0.875rem;
font-weight: 500;
cursor: pointer;
transition: all 0.2s ease;
}

button:hover {
background-color: var(--color-buttonHover);
transform: translateY(-1px);
}

button:disabled {
opacity: 0.6;
cursor: not-allowed;
transform: none;
}

button.secondary {
background-color: var(--color-buttonSecondary);
color: var(--color-text);
}

button.secondary:hover {
background-color: var(--color-border);
}

/* Card-uri și containere */
.card, .settings-card, .stats-card {
background-color: var(--color-card);
border: 1px solid var(--color-cardBorder);
color: var(--color-text);
box-shadow: 0 1px 3px var(--color-shadow);
border-radius: 8px;
padding: 1.5rem;
}

.card:hover, .settings-card:hover, .stats-card:hover {
box-shadow: 0 4px 6px var(--color-shadowHover);
}

/* Tabele */
table {
background-color: var(--color-table);
border: 1px solid var(--color-tableBorder);
border-radius: 8px;
overflow: hidden;
}

th {
background-color: var(--color-tableHeader);
color: var(--color-text);
padding: 1rem;
text-align: left;
font-weight: 600;
}

td {
background-color: var(--color-tableRow);
color: var(--color-text);
padding: 0.75rem 1rem;
border-bottom: 1px solid var(--color-tableBorder);
}

tr:hover td {
background-color: var(--color-surface);
}

/* Badge-uri */
.badge {
background-color: var(--color-badge);
color: var(--color-badgeText);
padding: 0.25rem 0.75rem;
border-radius: 9999px;
font-size: 0.75rem;
font-weight: 500;
display: inline-block;
}

/* Progress bar */
.progress-bar {
background-color: var(--color-progress);
border-radius: 6px;
overflow: hidden;
height: 8px;
}

.progress-fill {
background-color: var(--color-progressFill);
height: 100%;
transition: width 0.3s ease;
}

/* Modal-uri */
.modal {
background-color: var(--color-modalOverlay);
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
display: flex;
align-items: center;
justify-content: center;
z-index: 1000;
}

.modal-content {
background-color: var(--color-modal);
border-radius: 12px;
padding: 2rem;
max-width: 500px;
width: 90%;
box-shadow: 0 20px 25px var(--color-shadow);
}

/* Navbar */
.navbar {
background-color: var(--color-navbar);
color: var(--color-navbarText);
border-bottom: 1px solid var(--color-border);
padding: 1rem 2rem;
}

/* Sidebar */
.sidebar {
background-color: var(--color-sidebar);
color: var(--color-sidebarText);
border-right: 1px solid var(--color-border);
}

/* Link-uri */
a {
color: var(--color-primary);
text-decoration: none;
}

a:hover {
color: var(--color-accent);
text-decoration: underline;
}
</style>

<!-- Container pentru notificări -->
<NotificationContainer />
