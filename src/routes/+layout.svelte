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

let { children } = $props();

// Autentificare automată cu Kerberos (non-blocking)
onMount(() => {
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
// Fallback pentru demo
setCurrentUser({ id: 1, name: 'Demo User', email: 'demo@example.com', role: 'User', total_hours: 0 });
} finally {
setAuthLoading(false);
}
}

async function authenticateUser(kerberosData: { username: string; email: string; displayName: string }) {
try {
// Optimizare: verifică direct utilizatorul după email în loc să încarci toți utilizatorii
let user;
try {
user = await userService.getByEmail(kerberosData.email);
} catch (error) {
// Utilizatorul nu există, îl creez
user = await userService.create({
name: kerberosData.displayName,
email: kerberosData.email,
role: 'User' // Rol default
});
notifications.success('Utilizator creat', `Bun venit, ${kerberosData.displayName}!`);
}

if (user) {
setCurrentUser(user);
if (user.name !== kerberosData.displayName) {
notifications.info('Bun venit', `Salut, ${user.name}!`);
}
}
} catch (error) {
console.error('Error authenticating user:', error);
notifications.error('Eroare autentificare', 'Eroare la autentificarea utilizatorului!');
}
}

	const menuItems = [
		{ name: 'Dashboard', href: '/', icon: BarChart3 },
		{ name: 'Calendar', href: '/calendar', icon: Calendar },
		{ name: 'Timp Lucru', href: '/time-tracking', icon: Clock },
		{ name: 'Adaugă Task', href: '/add-task', icon: Plus },
		{ name: 'Admin', href: '/admin', icon: Users },
		{ name: 'Setări', href: '/settings', icon: Settings }
	];

function logout() {
clearCurrentUser();
// TODO: Implementează logout Kerberos real
kerberosLogout();
goto('/login');
}

////test
</script>

<svelte:head>
<link rel="icon" href={favicon} />
<title>KPI Time Tracker</title>
</svelte:head>

{#if $authLoading}
<!-- Loading UI -->
<div class="auth-container">
<div class="auth-card">
<div class="auth-header">
<div class="logo">
<Clock size={48} />
</div>
<h1>KPI Time Tracker</h1>
<p>Se autentifică prin Kerberos...</p>
</div>
<div class="auth-spinner">
<div class="spinner"></div>
</div>
</div>
</div>
{:else if !$isAuthenticated}
<!-- Authentication failed UI -->
<div class="auth-container">
<div class="auth-card">
<div class="auth-header">
<div class="logo">
<Clock size={48} />
</div>
<h1>KPI Time Tracker</h1>
<p>Eroare la autentificare</p>
</div>
<div class="auth-error">
<p>Nu s-a putut autentifica utilizatorul prin Kerberos.</p>
<button class="retry-btn" onclick={() => window.location.reload()}>
Reîncearcă
</button>
</div>
</div>
</div>
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
{#each menuItems as item}
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
background-color: #f8fafc;
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
background: white;
border-right: 1px solid #e5e7eb;
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
border-bottom: 1px solid #e5e7eb;
}

.sidebar-header .logo {
display: flex;
align-items: center;
gap: 0.75rem;
font-weight: 700;
font-size: 1.25rem;
color: #1f2937;
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
color: #6b7280;
text-decoration: none;
transition: all 0.2s;
border-left: 3px solid transparent;
}

.nav-item:hover {
background-color: #f9fafb;
color: #374151;
}

.nav-item.active {
background-color: #eff6ff;
color: #2563eb;
border-left-color: #2563eb;
}

.sidebar-footer {
padding: 1.5rem;
border-top: 1px solid #e5e7eb;
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
background: #667eea;
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
color: #1f2937;
font-size: 0.875rem;
}

.user-email {
color: #6b7280;
font-size: 0.75rem;
}

.logout-btn {
width: 100%;
display: flex;
align-items: center;
justify-content: center;
gap: 0.5rem;
padding: 0.75rem;
background: #f3f4f6;
border: none;
border-radius: 8px;
color: #6b7280;
cursor: pointer;
transition: all 0.2s;
}

.logout-btn:hover {
background: #e5e7eb;
color: #374151;
}

.main-content {
flex: 1;
margin-left: 280px;
padding: 2rem;
background-color: #f8fafc;
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
</style>

<!-- Container pentru notificări -->
<NotificationContainer />
