<script lang="ts">
	import { onMount } from 'svelte';
	import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
	import { ro } from 'date-fns/locale';
	import { Calendar, Clock, Plus, ChevronDown, ChevronUp, Trash2, Edit3 } from 'lucide-svelte';
	import { projectService, taskService, type Project, type Task, type TaskCreate } from '$lib/api';
import { notifications } from '$lib/notifications';
import { page } from '$app/stores';
import { currentUser } from '$lib/auth';

// Starea aplicației
let selectedDate = $state(new Date());
let selectedModule = $state('');
let selectedProject = $state('');
let taskDescription = $state('');
let taskHours = $state('');
let showAddForm = $state(false);
let showModuleDropdown = $state(false);
let showProjectDropdown = $state(false);

// Datele aplicației - începe curată
let modules = $state([
{ id: 'proiecte', name: 'Proiecte', projects: [] },
{ id: 'evom', name: 'EVOM', projects: [] },
{ id: 'operational', name: 'Operational', projects: [] }
]);

let allProjects: Project[] = $state([]);
let tasks: Task[] = $state([]);
let dailyProgress = $state(0); // ore lucrate în ziua curentă
const maxDailyHours = 8;

// Calendar
let currentWeek = $state(startOfWeek(selectedDate, { weekStartsOn: 1 }));
let weekDays = $state([]);

onMount(() => {
updateWeekDays();
// Încarcă datele în background pentru performanță mai bună
loadDataInBackground();
});

async function loadDataInBackground() {
try {
// Încarcă proiectele mai întâi (mai importante pentru UI)
allProjects = await projectService.getAll();
updateModules();

// Apoi încarcă task-urile în background
tasks = await taskService.getAll();
updateDailyProgress();
} catch (error) {
console.error('Error loading data:', error);
notifications.error('Eroare încărcare', 'Eroare la încărcarea datelor!');
}
}

function updateModules() {
// Organizează proiectele pe module
modules.forEach(module => {
module.projects = allProjects
.filter(p => p.module_type === module.id)
.map(p => p.name);
});
}

function updateWeekDays() {
weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
}

async function loadData() {
// Funcția veche - acum redirectează către versiunea optimizată
await loadDataInBackground();
}

function updateDailyProgress() {
const today = format(selectedDate, 'yyyy-MM-dd');
dailyProgress = tasks
.filter(task => task.date === today)
.reduce((total, task) => total + (task.hours || 0), 0);
}

async function addTask() {
if (!selectedModule || !selectedProject || !taskDescription || !taskHours) {
notifications.warning('Câmpuri incomplete', 'Te rog completează toate câmpurile!');
return;
}

try {
// Găsește proiectul selectat
const project = allProjects.find(p => 
p.module_type === selectedModule && p.name === selectedProject
);

if (!project) {
notifications.error('Proiect negăsit', 'Proiectul selectat nu a fost găsit!');
return;
}

const taskData: TaskCreate = {
user_id: $currentUser?.id || 1,
project_id: project.id!,
description: taskDescription,
hours: parseFloat(taskHours),
date: format(selectedDate, 'yyyy-MM-dd')
};

// Creează task-ul prin API
await taskService.create(taskData);

// Reîncarcă datele
await loadData();

// Reset form
taskDescription = '';
taskHours = '';
showAddForm = false;
} catch (error) {
console.error('Error adding task:', error);
notifications.error('Eroare', 'Eroare la adăugarea task-ului!');
}
}

async function deleteTask(taskId: number) {
try {
await taskService.delete(taskId);
await loadData(); // Reîncarcă datele
} catch (error) {
console.error('Error deleting task:', error);
notifications.error('Eroare', 'Eroare la ștergerea task-ului!');
}
}

function getTasksForDate(date) {
return tasks.filter(task => task.date === format(date, 'yyyy-MM-dd'));
}

function getTotalHoursForDate(date) {
return getTasksForDate(date).reduce((total, task) => total + task.hours, 0);
}

function selectDate(date) {
selectedDate = date;
updateDailyProgress();
}

function selectModule(module) {
selectedModule = module.id;
selectedProject = '';
showModuleDropdown = false;
}

function selectProject(project) {
selectedProject = project;
showProjectDropdown = false;
}

function getSelectedModuleName() {
return modules.find(m => m.id === selectedModule)?.name || 'Selectează modul';
}

function getSelectedProjectName() {
return selectedProject || 'Selectează proiect';
}

function getAvailableProjects() {
return allProjects
.filter(p => p.module_type === selectedModule)
.map(p => p.name);
}

function navigateWeek(direction) {
currentWeek = addDays(currentWeek, direction * 7);
updateWeekDays();
}

function getRemainingHours() {
return Math.max(0, maxDailyHours - dailyProgress);
}

function getProgressPercentage() {
return Math.min(100, (dailyProgress / maxDailyHours) * 100);
}
</script>

<div class="dashboard">
<!-- Header -->
<div class="dashboard-header">
<h1>Dashboard - Monitorizare Timp Lucru</h1>
<p>Urmărește-ți progresul zilnic de 8 ore lucratoare</p>
</div>

<!-- Progresul zilnic -->
<div class="daily-progress">
<div class="progress-header">
<h2>Progresul zilnic - {format(selectedDate, 'dd MMMM yyyy', { locale: ro })}</h2>
<div class="progress-stats">
<span class="hours-worked">{dailyProgress.toFixed(1)}h</span>
<span class="hours-remaining">{getRemainingHours().toFixed(1)}h rămas</span>
</div>
</div>
<div class="progress-bar">
<div class="progress-fill" style="width: {getProgressPercentage()}%"></div>
</div>
<div class="progress-labels">
<span>0h</span>
<span>8h</span>
</div>
</div>

<!-- Calendar și formular -->
<div class="main-content-grid">
<!-- Calendar -->
<div class="calendar-section">
<div class="calendar-header">
<button class="nav-btn" on:click={() => navigateWeek(-1)}>
<ChevronUp size={20} />
</button>
<h3>{format(currentWeek, 'MMMM yyyy', { locale: ro })}</h3>
<button class="nav-btn" on:click={() => navigateWeek(1)}>
<ChevronDown size={20} />
</button>
</div>

<div class="calendar-grid">
{#each weekDays as day}
<div 
class="calendar-day" 
class:selected={isSameDay(day, selectedDate)}
on:click={() => selectDate(day)}
>
<div class="day-header">
<span class="day-name">{format(day, 'EEE', { locale: ro })}</span>
<span class="day-number">{format(day, 'd')}</span>
</div>
<div class="day-tasks">
{#each getTasksForDate(day) as task}
<div class="task-mini">
<span class="task-hours">{task.hours}h</span>
<span class="task-desc">{task.description}</span>
</div>
{/each}
</div>
<div class="day-total">
{getTotalHoursForDate(day).toFixed(1)}h
</div>
</div>
{/each}
</div>
</div>

<!-- Formular adăugare task -->
<div class="form-section">
<div class="form-header">
<h3>Adaugă Task Nou</h3>
<button 
class="toggle-btn" 
on:click={() => showAddForm = !showAddForm}
>
<Plus size={20} />
{showAddForm ? 'Anulează' : 'Adaugă'}
</button>
</div>

{#if showAddForm}
<div class="add-form">
<!-- Selectare modul -->
<div class="form-group">
<label>Modul</label>
<div class="dropdown">
<button 
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

<!-- Selectare proiect -->
{#if selectedModule}
<div class="form-group">
<label>Proiect</label>
<div class="dropdown">
<button 
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
class="dropdown-item" 
on:click={() => selectProject(project)}
>
{project}
</button>
{/each}
</div>
{/if}
</div>
</div>
{/if}

<!-- Descriere task -->
<div class="form-group">
<label>Descriere Task</label>
<input 
type="text" 
bind:value={taskDescription}
placeholder="Ce ai lucrat?"
/>
</div>

<!-- Ore lucrate -->
<div class="form-group">
<label>Ore lucrate</label>
<input 
type="number" 
step="0.5" 
min="0" 
max="8"
bind:value={taskHours}
placeholder="Ex: 2.5"
/>
</div>

<button class="submit-btn" on:click={addTask}>
<Plus size={16} />
Adaugă Task
</button>
</div>
{/if}
</div>
</div>

<!-- Lista task-urilor pentru ziua selectată -->
<div class="tasks-section">
<h3>Task-uri pentru {format(selectedDate, 'dd MMMM yyyy', { locale: ro })}</h3>
<div class="tasks-list">
{#each getTasksForDate(selectedDate) as task}
<div class="task-item">
<div class="task-info">
						<div class="task-header">
							<span class="task-module">{task.module_type || 'N/A'}</span>
							<span class="task-project">{task.project_name || 'N/A'}</span>
						</div>
<p class="task-description">{task.description}</p>
<div class="task-meta">
<span class="task-hours">{task.hours}h</span>
							<span class="task-time">{task.created_at ? format(new Date(task.created_at), 'HH:mm') : 'N/A'}</span>
</div>
</div>
<div class="task-actions">
<button class="action-btn edit" on:click={() => console.log('Edit', task.id)}>
<Edit3 size={16} />
</button>
<button class="action-btn delete" on:click={() => deleteTask(task.id)}>
<Trash2 size={16} />
</button>
</div>
</div>
{:else}
<div class="no-tasks">
<Clock size={48} />
<p>Nu ai task-uri pentru această zi</p>
</div>
{/each}
</div>
</div>
</div>

<style>
.dashboard {
max-width: 1200px;
margin: 0 auto;
}

.dashboard-header {
margin-bottom: 2rem;
}

.dashboard-header h1 {
font-size: 2rem;
font-weight: 700;
color: #1f2937;
margin: 0 0 0.5rem 0;
}

.dashboard-header p {
color: #6b7280;
margin: 0;
}

.daily-progress {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
margin-bottom: 2rem;
}

.progress-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1rem;
}

.progress-header h2 {
font-size: 1.25rem;
font-weight: 600;
color: #1f2937;
margin: 0;
}

.progress-stats {
display: flex;
gap: 1rem;
}

.hours-worked {
font-weight: 600;
color: #059669;
font-size: 1.125rem;
}

.hours-remaining {
font-weight: 600;
color: #6b7280;
font-size: 1.125rem;
}

.progress-bar {
height: 12px;
background: #e5e7eb;
border-radius: 6px;
overflow: hidden;
margin-bottom: 0.5rem;
}

.progress-fill {
height: 100%;
background: linear-gradient(90deg, #10b981, #059669);
transition: width 0.3s ease;
}

.progress-labels {
display: flex;
justify-content: space-between;
font-size: 0.875rem;
color: #6b7280;
}

.main-content-grid {
display: grid;
grid-template-columns: 2fr 1fr;
gap: 2rem;
margin-bottom: 2rem;
}

.calendar-section {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.calendar-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1rem;
}

.calendar-header h3 {
font-size: 1.125rem;
font-weight: 600;
color: #1f2937;
margin: 0;
}

.nav-btn {
background: #f3f4f6;
border: none;
border-radius: 6px;
padding: 0.5rem;
cursor: pointer;
transition: background 0.2s;
}

.nav-btn:hover {
background: #e5e7eb;
}

.calendar-grid {
display: grid;
grid-template-columns: repeat(7, 1fr);
gap: 0.5rem;
}

.calendar-day {
border: 1px solid #e5e7eb;
border-radius: 8px;
padding: 0.75rem;
cursor: pointer;
transition: all 0.2s;
min-height: 120px;
}

.calendar-day:hover {
background: #f9fafb;
border-color: #d1d5db;
}

.calendar-day.selected {
background: #eff6ff;
border-color: #2563eb;
}

.day-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 0.5rem;
}

.day-name {
font-size: 0.75rem;
color: #6b7280;
font-weight: 500;
}

.day-number {
font-weight: 600;
color: #1f2937;
}

.day-tasks {
margin-bottom: 0.5rem;
}

.task-mini {
background: #f3f4f6;
padding: 0.25rem 0.5rem;
border-radius: 4px;
margin-bottom: 0.25rem;
font-size: 0.75rem;
}

.task-hours {
font-weight: 600;
color: #059669;
margin-right: 0.25rem;
}

.task-desc {
color: #374151;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
}

.day-total {
font-size: 0.75rem;
font-weight: 600;
color: #1f2937;
text-align: center;
padding-top: 0.25rem;
border-top: 1px solid #e5e7eb;
}

.form-section {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1rem;
}

.form-header h3 {
font-size: 1.125rem;
font-weight: 600;
color: #1f2937;
margin: 0;
}

.toggle-btn {
display: flex;
align-items: center;
gap: 0.5rem;
background: #2563eb;
color: white;
border: none;
border-radius: 6px;
padding: 0.5rem 1rem;
cursor: pointer;
transition: background 0.2s;
}

.toggle-btn:hover {
background: #1d4ed8;
}

.add-form {
display: flex;
flex-direction: column;
gap: 1rem;
}

.form-group {
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.form-group label {
font-weight: 500;
color: #374151;
font-size: 0.875rem;
}

.form-group input {
padding: 0.75rem;
border: 1px solid #d1d5db;
border-radius: 6px;
font-size: 0.875rem;
transition: border-color 0.2s;
}

.form-group input:focus {
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
background: #059669;
color: white;
border: none;
border-radius: 6px;
padding: 0.75rem;
cursor: pointer;
font-weight: 500;
transition: background 0.2s;
}

.submit-btn:hover {
background: #047857;
}

.tasks-section {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tasks-section h3 {
font-size: 1.125rem;
font-weight: 600;
color: #1f2937;
margin: 0 0 1rem 0;
}

.tasks-list {
display: flex;
flex-direction: column;
gap: 1rem;
}

.task-item {
display: flex;
justify-content: space-between;
align-items: flex-start;
padding: 1rem;
border: 1px solid #e5e7eb;
border-radius: 8px;
transition: all 0.2s;
}

.task-item:hover {
border-color: #d1d5db;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-info {
flex: 1;
}

.task-header {
display: flex;
gap: 0.5rem;
margin-bottom: 0.5rem;
}

.task-module {
background: #dbeafe;
color: #1e40af;
padding: 0.25rem 0.5rem;
border-radius: 4px;
font-size: 0.75rem;
font-weight: 500;
}

.task-project {
background: #f3f4f6;
color: #374151;
padding: 0.25rem 0.5rem;
border-radius: 4px;
font-size: 0.75rem;
font-weight: 500;
}

.task-description {
color: #1f2937;
margin: 0 0 0.5rem 0;
font-size: 0.875rem;
}

.task-meta {
display: flex;
gap: 1rem;
font-size: 0.75rem;
color: #6b7280;
}

.task-hours {
font-weight: 600;
color: #059669;
}

.task-actions {
display: flex;
gap: 0.5rem;
}

.action-btn {
padding: 0.5rem;
border: none;
border-radius: 4px;
cursor: pointer;
transition: background 0.2s;
}

.action-btn.edit {
background: #fef3c7;
color: #92400e;
}

.action-btn.edit:hover {
background: #fde68a;
}

.action-btn.delete {
background: #fee2e2;
color: #dc2626;
}

.action-btn.delete:hover {
background: #fecaca;
}

.no-tasks {
text-align: center;
padding: 3rem;
color: #6b7280;
}

.no-tasks p {
margin: 1rem 0 0 0;
font-size: 1.125rem;
}
</style>
