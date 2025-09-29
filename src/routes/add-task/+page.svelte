<script lang="ts">
import { onMount } from 'svelte';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Plus, Calendar, Clock, ChevronDown } from 'lucide-svelte';
import { projectService, taskService, type Project, type TaskCreate } from '$lib/api';
import { notifications } from '$lib/notifications';
import { page } from '$app/stores';
import { currentUser } from '$lib/auth';

let selectedDate = $state(new Date());
let selectedModule = $state('');
let selectedProject = $state('');
let selectedProjectId = $state(0);
let taskDescription = $state('');
let taskHours = $state('');
let showModuleDropdown = $state(false);
let showProjectDropdown = $state(false);
let projects: Project[] = $state([]);
let loading = $state(false);

const modules = [
{ id: 'proiecte', name: 'Proiecte' },
{ id: 'evom', name: 'EVOM' },
{ id: 'operational', name: 'Operational' }
];

onMount(() => {
loadProjects();
});

async function loadProjects() {
try {
loading = true;
projects = await projectService.getAll();
} catch (error) {
console.error('Error loading projects:', error);
} finally {
loading = false;
}
}

async function addTask() {
if (!selectedModule || !selectedProject || !taskDescription || !taskHours) {
notifications.warning('Câmpuri incomplete', 'Te rog completează toate câmpurile!');
return;
}

try {
loading = true;

const taskData: TaskCreate = {
user_id: $currentUser?.id || 1,
project_id: selectedProjectId,
description: taskDescription,
hours: parseFloat(taskHours),
date: format(selectedDate, 'yyyy-MM-dd')
};

await taskService.create(taskData);

// Reset form
taskDescription = '';
taskHours = '';
selectedModule = '';
selectedProject = '';
selectedProjectId = 0;

notifications.success('Succes', 'Task adăugat cu succes!');
} catch (error) {
console.error('Error adding task:', error);
notifications.error('Eroare', 'Eroare la adăugarea task-ului!');
} finally {
loading = false;
}
}

function selectModule(module: { id: string; name: string }) {
selectedModule = module.id;
selectedProject = '';
selectedProjectId = 0;
showModuleDropdown = false;
}

function selectProject(project: Project) {
selectedProject = project.name;
selectedProjectId = project.id!;
showProjectDropdown = false;
}

function getSelectedModuleName() {
return modules.find(m => m.id === selectedModule)?.name || 'Selectează modul';
}

function getSelectedProjectName() {
return selectedProject || 'Selectează proiect';
}

function getAvailableProjects() {
return projects.filter(p => p.module_type === selectedModule);
}
</script>

<div class="add-task-page">
<div class="page-header">
<h1>Adaugă Task Nou</h1>
<p>Completează detaliile pentru noul task</p>
</div>

<div class="form-container">
<div class="form-card">
<div class="form-header">
<Plus size={24} />
<h2>Detalii Task</h2>
</div>

<form on:submit|preventDefault={addTask}>
<!-- Data -->
<div class="form-group">
<label>
<Calendar size={16} />
Data
</label>
<input 
type="date" 
bind:value={selectedDate}
required
/>
</div>

<!-- Modul -->
<div class="form-group">
<label>Modul</label>
<div class="dropdown">
<button 
type="button"
class="dropdown-btn" 
on:click={() => showModuleDropdown = !showModuleDropdown}
>
{getSelectedModuleName()}
<ChevronDown size={16} />
</button>
{#if showModuleDropdown}
<div class="dropdown-menu">
{#each modules as module}
<button 
type="button"
class="dropdown-item" 
on:click={() => selectModule(module)}
>
{module.name}
</button>
{/each}
</div>
{/if}
</div>
</div>

<!-- Proiect -->
{#if selectedModule}
<div class="form-group">
<label>Proiect</label>
<div class="dropdown">
<button 
type="button"
class="dropdown-btn" 
on:click={() => showProjectDropdown = !showProjectDropdown}
>
{getSelectedProjectName()}
<ChevronDown size={16} />
</button>
{#if showProjectDropdown}
<div class="dropdown-menu">
{#each getAvailableProjects() as project}
<button 
type="button"
class="dropdown-item" 
on:click={() => selectProject(project)}
>
{project.name}
</button>
{/each}
</div>
{/if}
</div>
</div>
{/if}

<!-- Descriere -->
<div class="form-group">
<label>Descriere Task</label>
<textarea 
bind:value={taskDescription}
placeholder="Descrie ce ai lucrat..."
rows="4"
required
></textarea>
</div>

<!-- Ore -->
<div class="form-group">
<label>
<Clock size={16} />
Ore lucrate
</label>
<input 
type="number" 
step="0.5" 
min="0" 
max="8"
bind:value={taskHours}
placeholder="Ex: 2.5"
required
/>
</div>

<button type="submit" class="submit-btn" disabled={loading}>
<Plus size={20} />
{loading ? 'Se salvează...' : 'Adaugă Task'}
</button>
</form>
</div>

<!-- Preview -->
<div class="preview-card">
<h3>Preview Task</h3>
<div class="preview-content">
<div class="preview-item">
<span class="label">Data:</span>
<span class="value">{format(selectedDate, 'dd MMMM yyyy', { locale: ro })}</span>
</div>
<div class="preview-item">
<span class="label">Modul:</span>
<span class="value">{getSelectedModuleName()}</span>
</div>
<div class="preview-item">
<span class="label">Proiect:</span>
<span class="value">{getSelectedProjectName()}</span>
</div>
<div class="preview-item">
<span class="label">Descriere:</span>
<span class="value">{taskDescription || 'Nu este completată'}</span>
</div>
<div class="preview-item">
<span class="label">Ore:</span>
<span class="value">{taskHours || '0'}h</span>
</div>
</div>
</div>
</div>
</div>

<style>
.add-task-page {
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

.form-container {
display: grid;
grid-template-columns: 2fr 1fr;
gap: 2rem;
}

.form-card {
background: white;
padding: 2rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-header {
display: flex;
align-items: center;
gap: 0.75rem;
margin-bottom: 2rem;
}

.form-header h2 {
font-size: 1.5rem;
font-weight: 600;
color: #1f2937;
margin: 0;
}

.form-group {
margin-bottom: 1.5rem;
}

.form-group label {
display: flex;
align-items: center;
gap: 0.5rem;
font-weight: 500;
color: #374151;
margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
width: 100%;
padding: 0.75rem;
border: 1px solid #d1d5db;
border-radius: 6px;
font-size: 0.875rem;
transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
outline: none;
border-color: #2563eb;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.dropdown {
position: relative;
}

.dropdown-btn {
width: 100%;
padding: 0.75rem;
border: 1px solid #d1d5db;
border-radius: 6px;
background: white;
cursor: pointer;
display: flex;
justify-content: space-between;
align-items: center;
font-size: 0.875rem;
transition: border-color 0.2s;
}

.dropdown-btn:hover {
border-color: #9ca3af;
}

.dropdown-menu {
position: absolute;
top: 100%;
left: 0;
right: 0;
background: white;
border: 1px solid #d1d5db;
border-radius: 6px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
z-index: 10;
max-height: 200px;
overflow-y: auto;
}

.dropdown-item {
width: 100%;
padding: 0.75rem;
border: none;
background: none;
text-align: left;
cursor: pointer;
font-size: 0.875rem;
transition: background 0.2s;
}

.dropdown-item:hover {
background: #f3f4f6;
}

.submit-btn {
display: flex;
align-items: center;
justify-content: center;
gap: 0.5rem;
width: 100%;
background: #2563eb;
color: white;
border: none;
border-radius: 8px;
padding: 1rem;
cursor: pointer;
font-weight: 600;
font-size: 1rem;
transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
background: #1d4ed8;
}

.submit-btn:disabled {
background: #9ca3af;
cursor: not-allowed;
}

.preview-card {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
height: fit-content;
}

.preview-card h3 {
font-size: 1.25rem;
font-weight: 600;
color: #1f2937;
margin: 0 0 1rem 0;
}

.preview-content {
display: flex;
flex-direction: column;
gap: 0.75rem;
}

.preview-item {
display: flex;
justify-content: space-between;
align-items: flex-start;
padding: 0.75rem;
background: #f9fafb;
border-radius: 6px;
}

.preview-item .label {
font-weight: 500;
color: #374151;
font-size: 0.875rem;
}

.preview-item .value {
color: #1f2937;
font-size: 0.875rem;
text-align: right;
max-width: 60%;
word-wrap: break-word;
}
</style>
