<script lang="ts">
import { Settings, User, Bell, Shield, Database, Download } from 'lucide-svelte';

let userSettings = $state({
name: 'Utilizator',
email: 'user@example.com',
notifications: true,
theme: 'light',
workingHours: 8,
weekStart: 'monday'
});

function saveSettings() {
localStorage.setItem('kpi-settings', JSON.stringify(userSettings));
alert('Setările au fost salvate!');
}

function exportData() {
// Simulare export date
const data = {
tasks: [],
settings: userSettings,
exportDate: new Date().toISOString()
};

const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'kpi-data-export.json';
a.click();
URL.revokeObjectURL(url);
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
<div class="form-group">
<label>Nume</label>
<input type="text" bind:value={userSettings.name} />
</div>
<div class="form-group">
<label>Email</label>
<input type="email" bind:value={userSettings.email} />
</div>
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
<button class="action-btn export" on:click={exportData}>
<Download size={16} />
Exportă Date
</button>
</div>
</div>
</div>

<div class="settings-actions">
<button class="save-btn" on:click={saveSettings}>
Salvează Setările
</button>
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

.save-btn:hover {
background: #1d4ed8;
}
</style>
