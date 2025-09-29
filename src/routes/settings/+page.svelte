<script lang="ts">
import { onMount } from 'svelte';
import { Settings, User, Bell, Shield, Database, Download } from 'lucide-svelte';
import { userService, taskService, projectService, type User as UserType, type Task, type Project } from '$lib/api';
import { notifications } from '$lib/notifications';
import { page } from '$app/stores';
import { currentUser } from '$lib/auth';

let userSettings = $state({
name: 'Utilizator',
email: 'user@example.com',
notifications: true,
theme: 'light',
workingHours: 8,
weekStart: 'monday'
});

let currentUser: UserType | null = $state(null);
let userTasks: Task[] = $state([]);
let userProjects: Project[] = $state([]);
let loading = $state(false);
let hasChanges = $state(false);

onMount(() => {
loadUserData();
});

// Monitorizează schimbările în formular
function checkForChanges() {
if (currentUser) {
hasChanges = 
userSettings.name !== currentUser.name || 
userSettings.email !== currentUser.email;
} else {
hasChanges = false;
}
}

async function loadUserData() {
try {
loading = true;
// TODO: Înlocuiește cu logica de autentificare reală
const users = await userService.getAll();

if (users.length === 0) {
notifications.warning('Nu există utilizatori', 'Nu există utilizatori în sistem. Creează primul utilizator în Admin.');
currentUser = null;
return;
}

currentUser = users.find(u => u.id === 1) || users[0];

if (currentUser) {
userSettings.name = currentUser.name;
userSettings.email = currentUser.email;
}

// Verifică schimbările după încărcare
checkForChanges();

// TODO: Înlocuiește cu ID-ul utilizatorului autentificat
userTasks = await taskService.getByUser($currentUser?.id || 1);
userProjects = await projectService.getAll();
} catch (error) {
console.error('Error loading user data:', error);
notifications.error('Eroare', 'Eroare la încărcarea datelor utilizatorului!');
} finally {
loading = false;
}
}

async function saveSettings() {
try {
loading = true;

// Verifică câmpurile obligatorii
if (!userSettings.name.trim()) {
notifications.warning('Câmp incomplet', 'Numele este obligatoriu!');
return;
}

if (!userSettings.email.trim()) {
notifications.warning('Câmp incomplet', 'Email-ul este obligatoriu!');
return;
}

// Validează formatul email-ului
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(userSettings.email)) {
notifications.warning('Email invalid', 'Te rog introdu un email valid!');
return;
}

// Actualizează utilizatorul prin API dacă există
if (currentUser && currentUser.id) {
try {
await userService.update(currentUser.id, {
name: userSettings.name.trim(),
email: userSettings.email.trim(),
role: currentUser.role,
total_hours: currentUser.total_hours
});
notifications.success('Succes', 'Setările au fost salvate în baza de date!');
} catch (error) {
console.error('Error updating user:', error);
if (error.message.includes('Email already exists')) {
notifications.error('Email existent', 'Acest email este deja folosit de alt utilizator!');
} else {
notifications.error('Eroare', 'Eroare la actualizarea utilizatorului!');
}
return;
}
} else {
notifications.warning('Atenție', 'Nu există utilizator autentificat pentru a salva setările!');
return;
}

// Salvează și în localStorage pentru backup
localStorage.setItem('kpi-settings', JSON.stringify(userSettings));

// Reîncarcă datele utilizatorului pentru a reflecta modificările
await loadUserData();

// Resetează indicatorul de schimbări
hasChanges = false;
} catch (error) {
console.error('Error saving settings:', error);
notifications.error('Eroare', 'Eroare la salvarea setărilor!');
} finally {
loading = false;
}
}

async function exportData() {
try {
loading = true;
// Exportă datele reale din API
const data = {
user: currentUser,
tasks: userTasks,
projects: userProjects,
settings: userSettings,
exportDate: new Date().toISOString()
};

const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `kpi-data-export-${new Date().toISOString().split('T')[0]}.json`;
a.click();
URL.revokeObjectURL(url);
} catch (error) {
console.error('Error exporting data:', error);
notifications.error('Eroare', 'Eroare la exportarea datelor!');
} finally {
loading = false;
}
}
</script>

<div class="settings-page">
<div class="page-header">
<h1>Setări</h1>
<p>Gestionează-ți preferințele și configurarea aplicației</p>
</div>

<div class="settings-grid">
<!-- Profil utilizator -->
<div class="settings-card">
<div class="card-header">
<User size={24} />
<h3>Profil Utilizator</h3>
</div>
{#if loading}
<div class="loading">Se încarcă...</div>
{:else}
<div class="form-group">
<label>Nume</label>
<input 
type="text" 
bind:value={userSettings.name} 
on:input={checkForChanges}
class:has-changes={hasChanges && userSettings.name !== currentUser?.name}
/>
</div>
<div class="form-group">
<label>Email</label>
<input 
type="email" 
bind:value={userSettings.email} 
on:input={checkForChanges}
class:has-changes={hasChanges && userSettings.email !== currentUser?.email}
/>
</div>
<div class="form-group">
<label>Rol</label>
<input type="text" value={currentUser?.role || 'N/A'} disabled />
</div>
<div class="form-group">
<label>Total ore lucrate</label>
<input type="text" value={`${currentUser?.total_hours || 0} ore`} disabled />
</div>
{/if}
</div>

<!-- Notificări -->
<div class="settings-card">
<div class="card-header">
<Bell size={24} />
<h3>Notificări</h3>
</div>
<div class="form-group">
<label class="checkbox-label">
<input type="checkbox" bind:checked={userSettings.notifications} />
<span>Activează notificările</span>
</label>
</div>
</div>

<!-- Preferințe lucru -->
<div class="settings-card">
<div class="card-header">
<Settings size={24} />
<h3>Preferințe Lucru</h3>
</div>
<div class="form-group">
<label>Ore lucratoare pe zi</label>
<input type="number" min="1" max="12" bind:value={userSettings.workingHours} />
</div>
<div class="form-group">
<label>Început săptămână</label>
<select bind:value={userSettings.weekStart}>
<option value="monday">Luni</option>
<option value="sunday">Duminică</option>
</select>
</div>
</div>

<!-- Date și siguranță -->
<div class="settings-card">
<div class="card-header">
<Database size={24} />
<h3>Date și Siguranță</h3>
</div>
<div class="form-group">
<button class="action-btn export" on:click={exportData} disabled={loading}>
<Download size={16} />
{loading ? 'Se exportă...' : 'Exportă Date'}
</button>
</div>
<div class="form-group">
<label>Statistici</label>
<div class="stats-info">
<div class="stat-item">
<span class="stat-label">Task-uri totale:</span>
<span class="stat-value">{userTasks.length}</span>
</div>
<div class="stat-item">
<span class="stat-label">Proiecte active:</span>
<span class="stat-value">{userProjects.filter(p => p.status === 'active').length}</span>
</div>
<div class="stat-item">
<span class="stat-label">Ore totale:</span>
<span class="stat-value">{userTasks.reduce((sum, task) => sum + (task.hours || 0), 0).toFixed(1)}h</span>
</div>
</div>
</div>
</div>
</div>

<div class="settings-actions">
<button 
class="save-btn" 
on:click={saveSettings} 
disabled={loading || !hasChanges}
class:has-changes={hasChanges}
>
{loading ? 'Se salvează...' : hasChanges ? 'Salvează modificările' : 'Salvează Setările'}
</button>
{#if hasChanges}
<div class="changes-indicator">
<p>Ai modificări nesalvate</p>
</div>
{/if}
</div>
</div>

<style>
.settings-page {
max-width: 1000px;
margin: 0 auto;
}

.page-header {
margin-bottom: 2rem;
}

.page-header h1 {
font-size: 2rem;
font-weight: 700;
color: #1f2937;
margin: 0 0 0.5rem 0;
}

.page-header p {
color: #6b7280;
margin: 0;
}

.settings-grid {
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 2rem;
margin-bottom: 2rem;
}

.settings-card {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
display: flex;
align-items: center;
gap: 0.75rem;
margin-bottom: 1.5rem;
}

.card-header h3 {
font-size: 1.25rem;
font-weight: 600;
color: #1f2937;
margin: 0;
}

.form-group {
margin-bottom: 1rem;
}

.form-group label {
display: block;
font-weight: 500;
color: #374151;
margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
width: 100%;
padding: 0.75rem;
border: 1px solid #d1d5db;
border-radius: 6px;
font-size: 0.875rem;
transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
outline: none;
border-color: #2563eb;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.checkbox-label {
display: flex !important;
align-items: center;
gap: 0.5rem;
cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
width: auto;
margin: 0;
}

.action-btn {
display: flex;
align-items: center;
gap: 0.5rem;
padding: 0.75rem 1rem;
border: 1px solid #d1d5db;
border-radius: 6px;
background: white;
cursor: pointer;
transition: all 0.2s;
font-size: 0.875rem;
}

.action-btn:hover {
background: #f9fafb;
border-color: #9ca3af;
}

.action-btn.export {
color: #059669;
border-color: #d1fae5;
}

.action-btn.export:hover {
background: #ecfdf5;
border-color: #a7f3d0;
}

.settings-actions {
display: flex;
justify-content: center;
padding: 2rem;
background: white;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.save-btn {
background: #2563eb;
color: white;
border: none;
border-radius: 8px;
padding: 1rem 2rem;
font-weight: 600;
font-size: 1rem;
cursor: pointer;
transition: background 0.2s;
}

.save-btn:hover:not(:disabled) {
background: #1d4ed8;
}

.save-btn:disabled {
background: #9ca3af;
cursor: not-allowed;
}

.save-btn.has-changes {
background: #059669;
}

.save-btn.has-changes:hover:not(:disabled) {
background: #047857;
}

.has-changes {
border-color: #059669 !important;
box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1) !important;
}

.changes-indicator {
margin-top: 1rem;
padding: 0.75rem;
background: #f0fdf4;
border: 1px solid #bbf7d0;
border-radius: 6px;
text-align: center;
}

.changes-indicator p {
margin: 0;
color: #166534;
font-size: 0.875rem;
font-weight: 500;
}

.loading {
text-align: center;
padding: 2rem;
color: #6b7280;
}

.stats-info {
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.stat-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 0.5rem;
background: #f9fafb;
border-radius: 4px;
}

.stat-label {
font-size: 0.875rem;
color: #6b7280;
}

.stat-value {
font-weight: 600;
color: #1f2937;
}

.action-btn:disabled {
opacity: 0.6;
cursor: not-allowed;
}
</style>
