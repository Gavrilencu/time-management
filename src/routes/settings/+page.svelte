<script lang="ts">
import { onMount } from 'svelte';
import { Settings, User, Bell, Shield, Database, Download, FileText, FileCode, FileSpreadsheet } from 'lucide-svelte';
import { userService, taskService, projectService, exportService, type User as UserType, type Task, type Project } from '$lib/api';
import { notifications } from '$lib/notifications';
import { page } from '$app/stores';
import { currentUser } from '$lib/auth';
import { currentTheme, themes, type Theme } from '$lib/themes';

let userSettings = $state({
name: 'Utilizator',
email: 'user@example.com',
notifications: true,
theme: 'light' as Theme,
workingHours: 8,
weekStart: 'monday'
});

let currentUserData: UserType | null = $state(null);
let userTasks: Task[] = $state([]);
let userProjects: Project[] = $state([]);
let loading = $state(false);
let hasChanges = $state(false);

onMount(() => {
loadUserData();
});

// Monitorizează schimbările în formular
function checkForChanges() {
if (currentUserData) {
hasChanges = 
userSettings.name !== currentUserData.name || 
userSettings.email !== currentUserData.email;
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
currentUserData = null;
return;
}

currentUserData = users.find(u => u.id === 1) || users[0];

if (currentUserData) {
userSettings.name = currentUserData.name;
userSettings.email = currentUserData.email;
}

// Încarcă tema curentă din store
currentTheme.subscribe((theme) => {
userSettings.theme = theme;
});

// Verifică schimbările după încărcare
checkForChanges();

// TODO: Înlocuiește cu ID-ul utilizatorului autentificat
userTasks = await taskService.getByUser(currentUserData?.id || 1);
userProjects = await projectService.getAll();
} catch (error) {
console.error('Error loading user data:', error);
notifications.error('Eroare', 'Eroare la încărcarea datelor utilizatorului!');
} finally {
loading = false;
}
}

// Funcție pentru schimbarea temei
function changeTheme(theme: Theme) {
currentTheme.setTheme(theme);
notifications.success('Temă schimbată', `Tema a fost schimbată în ${themes[theme].label}`);
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
if (currentUserData && currentUserData.id) {
try {
await userService.update(currentUserData.id, {
name: userSettings.name.trim(),
email: userSettings.email.trim(),
role: currentUserData.role,
total_hours: currentUserData.total_hours
});
notifications.success('Succes', 'Setările au fost salvate în baza de date!');
} catch (error: any) {
console.error('Error updating user:', error);
if (error.message && error.message.includes('Email already exists')) {
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

async function exportJSON() {
try {
loading = true;
const data = await exportService.exportJSON();

const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `kpi-export-${new Date().toISOString().split('T')[0]}.json`;
a.click();
URL.revokeObjectURL(url);

notifications.success('Export JSON', 'Datele au fost exportate în JSON cu succes!');
} catch (error) {
console.error('Error exporting JSON:', error);
notifications.error('Eroare Export', 'Eroare la exportarea în JSON!');
} finally {
loading = false;
}
}

async function exportXML() {
try {
loading = true;
const response = await exportService.exportXML();

const blob = new Blob([response.xml], { type: 'application/xml' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `kpi-export-${new Date().toISOString().split('T')[0]}.xml`;
a.click();
URL.revokeObjectURL(url);

notifications.success('Export XML', 'Datele au fost exportate în XML cu succes!');
} catch (error) {
console.error('Error exporting XML:', error);
notifications.error('Eroare Export', 'Eroare la exportarea în XML!');
} finally {
loading = false;
}
}

async function exportExcel() {
try {
loading = true;
const blob = await exportService.exportExcel();

const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `kpi-export-${new Date().toISOString().split('T')[0]}.xlsx`;
a.click();
URL.revokeObjectURL(url);

notifications.success('Export Excel', 'Datele au fost exportate în Excel cu succes!');
} catch (error) {
console.error('Error exporting Excel:', error);
notifications.error('Eroare Export', 'Eroare la exportarea în Excel!');
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
oninput={checkForChanges}
class:has-changes={hasChanges && userSettings.name !== currentUserData?.name}
/>
</div>
<div class="form-group">
<label>Email</label>
<input 
type="email" 
bind:value={userSettings.email} 
oninput={checkForChanges}
class:has-changes={hasChanges && userSettings.email !== currentUserData?.email}
/>
</div>
<div class="form-group">
<label>Rol</label>
<input type="text" value={currentUserData?.role || 'N/A'} disabled />
</div>
<div class="form-group">
<label>Total ore lucrate</label>
<input type="text" value={`${currentUserData?.total_hours || 0} ore`} disabled />
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

<!-- Teme -->
<div class="settings-card">
<div class="card-header">
<Settings size={24} />
<h3>Temă Aplicație</h3>
</div>
<div class="form-group">
<label>Selectează tema</label>
<div class="theme-selector">
{#each Object.entries(themes) as [key, theme]}
<button 
class="theme-option {userSettings.theme === key ? 'active' : ''}"
onclick={() => changeTheme(key as Theme)}
>
<div class="theme-preview" style="background: linear-gradient(135deg, {theme.colors.primary}, {theme.colors.accent})"></div>
<span>{theme.label}</span>
</button>
{/each}
</div>
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
<div class="export-buttons">
<button class="export-btn json" onclick={exportJSON} disabled={loading}>
<FileText size={16} />
JSON
</button>
<button class="export-btn xml" onclick={exportXML} disabled={loading}>
<FileCode size={16} />
XML
</button>
<button class="export-btn excel" onclick={exportExcel} disabled={loading}>
<FileSpreadsheet size={16} />
Excel
</button>
</div>
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
<span class="stat-value">{Number(userTasks.reduce((sum, task) => sum + (task.hours || 0), 0)).toFixed(1)}h</span>
</div>
</div>
</div>
</div>
</div>

<div class="settings-actions">
<button 
class="save-btn" 
onclick={saveSettings} 
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

/* Export buttons */
.export-buttons {
display: flex;
gap: 0.5rem;
flex-wrap: wrap;
}

.export-btn {
display: flex;
align-items: center;
gap: 0.5rem;
padding: 0.5rem 1rem;
border: 1px solid #e5e7eb;
background: white;
border-radius: 6px;
cursor: pointer;
font-size: 0.875rem;
font-weight: 500;
transition: all 0.2s;
}

.export-btn:hover:not(:disabled) {
background: #f9fafb;
border-color: #d1d5db;
}

.export-btn:disabled {
opacity: 0.5;
cursor: not-allowed;
}

.export-btn.json {
color: #059669;
border-color: #10b981;
}

.export-btn.json:hover:not(:disabled) {
background: #ecfdf5;
border-color: #059669;
}

.export-btn.xml {
color: #dc2626;
border-color: #ef4444;
}

.export-btn.xml:hover:not(:disabled) {
background: #fef2f2;
border-color: #dc2626;
}

.export-btn.excel {
color: #2563eb;
border-color: #3b82f6;
}

.export-btn.excel:hover:not(:disabled) {
background: #eff6ff;
border-color: #2563eb;
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

/* Stiluri pentru selectorul de teme */
.theme-selector {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
gap: 1rem;
margin-top: 0.5rem;
}

.theme-option {
display: flex;
flex-direction: column;
align-items: center;
gap: 0.5rem;
padding: 1rem;
border: 2px solid #e5e7eb;
border-radius: 8px;
background: white;
cursor: pointer;
transition: all 0.2s ease;
}

.theme-option:hover {
border-color: #3b82f6;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.theme-option.active {
border-color: #2563eb;
background: #eff6ff;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.theme-preview {
width: 40px;
height: 40px;
border-radius: 50%;
border: 2px solid white;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-option span {
font-size: 0.875rem;
font-weight: 500;
color: #374151;
}

.theme-option.active span {
color: #2563eb;
font-weight: 600;
}

/* Responsive pentru teme */
@media (max-width: 768px) {
.theme-selector {
grid-template-columns: 1fr;
gap: 0.75rem;
}

.theme-option {
padding: 0.75rem;
}
}
</style>
