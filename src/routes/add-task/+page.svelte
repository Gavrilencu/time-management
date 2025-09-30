<script lang="ts">
import { onMount } from 'svelte';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Plus, Calendar, Clock, ChevronDown } from 'lucide-svelte';
	import { projectService, taskService, departmentService, type Project, type TaskCreate } from '$lib/api';
import { notifications } from '$lib/notifications';
import { page } from '$app/stores';
import { currentUser } from '$lib/auth';

let selectedDate = $state(new Date());
let selectedModule = $state('proiecte');
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
		// Încarcă proiectele filtrate pe departamentul utilizatorului curent
		if ($currentUser?.department) {
			projects = await projectService.getByDepartment($currentUser.department);
		} else {
			projects = await projectService.getAll();
		}
		console.log('Loaded projects:', projects);
		console.log('Current user department:', $currentUser?.department);
	} catch (error) {
		console.error('Error loading projects:', error);
		notifications.error('Eroare', 'Eroare la încărcarea proiectelor!');
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
	const filteredProjects = projects.filter(p => p.module_type === selectedModule);
	console.log('All projects:', projects);
	console.log('Selected module:', selectedModule);
	console.log('Available projects for module', selectedModule, ':', filteredProjects);
	
	// Dacă nu sunt proiecte pentru modulul selectat, returnează toate proiectele pentru debugging
	if (filteredProjects.length === 0) {
		console.log('No projects found for module, returning all projects for debugging');
		return projects;
	}
	
	return filteredProjects;
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

	<form onsubmit={addTask}>
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
		onclick={() => showModuleDropdown = !showModuleDropdown}
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
		onclick={() => selectModule(module)}
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
		onclick={() => showProjectDropdown = !showProjectDropdown}
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
		onclick={() => selectProject(project)}
>
{project.name}
</button>
{/each}
{#if getAvailableProjects().length === 0}
<div class="dropdown-item disabled">
Nu sunt proiecte disponibile pentru acest modul
</div>
{/if}
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
padding: 0 1rem;
box-sizing: border-box;
}

.page-header {
margin-bottom: 2rem;
}

.page-header h1 {
	font-size: 2rem;
	font-weight: 700;
	color: var(--color-text);
	margin: 0 0 0.5rem 0;
}

.page-header p {
	color: var(--color-textSecondary);
	margin: 0;
}

.form-container {
display: grid;
grid-template-columns: 2fr 1fr;
gap: 2rem;
}

@media (max-width: 768px) {
.form-container {
grid-template-columns: 1fr;
gap: 1rem;
}
}

.form-card {
	background: var(--color-card);
	padding: 2rem;
	border-radius: 12px;
	box-shadow: 0 1px 3px var(--color-shadow);
	border: 1px solid var(--color-cardBorder);
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
	color: var(--color-text);
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
	color: var(--color-text);
	margin-bottom: 0.5rem;
	font-size: 0.875rem;
}

/* Folosesc stilurile globale pentru input-uri */
/* Stilurile sunt definite în app.css */

/* Folosesc stilurile globale pentru dropdown */
/* Stilurile sunt definite în app.css */

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
	background: var(--color-card);
	padding: 1.5rem;
	border-radius: 12px;
	box-shadow: 0 1px 3px var(--color-shadow);
	border: 1px solid var(--color-cardBorder);
	height: fit-content;
}

.preview-card h3 {
	font-size: 1.25rem;
	font-weight: 600;
	color: var(--color-text);
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

.dropdown-item.disabled {
	color: var(--color-textSecondary);
	cursor: not-allowed;
	opacity: 0.6;
}

.dropdown-item.disabled:hover {
	background: transparent;
}
</style>
