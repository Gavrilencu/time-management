<script lang="ts">
	import { onMount } from 'svelte';
	import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
	import { ro } from 'date-fns/locale';
	import { Calendar, Clock, Plus, ChevronDown, ChevronUp, Trash2, Edit3, MessageCircle } from 'lucide-svelte';
	import { projectService, taskService, commentService, departmentService, type Project, type Task, type TaskCreate, type TaskComment } from '$lib/api';
import { notifications } from '$lib/notifications';
import { page } from '$app/stores';
import { currentUser } from '$lib/auth';

// Starea aplicației
let selectedDate = $state<Date>(new Date());
let selectedModule = $state('proiecte');
let selectedProject = $state('');
let taskDescription = $state('');
let taskHours = $state('');
let newComment = $state('');
let showAddForm = $state(false);
let showEditTaskModal = $state(false);
let editingTask: Task | null = $state(null);
let showDeleteTaskModal = $state(false);
let taskToDelete: Task | null = $state(null);
let showModuleDropdown = $state(false);
let showProjectDropdown = $state(false);

// Datele aplicației - începe curată
let modules = $state<Array<{id: string, name: string, projects: string[]}>>([
	{ id: 'proiecte', name: 'Proiecte', projects: [] },
	{ id: 'evom', name: 'EVOM', projects: [] },
	{ id: 'operational', name: 'Operational', projects: [] }
]);

let allProjects: Project[] = $state([]);
let tasks: Task[] = $state([]);
let taskComments: TaskComment[] = $state([]);
let loadedTaskComments = $state<Set<number>>(new Set());
let taskCommentInputs = $state<Map<number, string>>(new Map());
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
		// Încarcă proiectele filtrate pe departamentul utilizatorului curent
		let projectsPromise;
		if ($currentUser?.department) {
			projectsPromise = projectService.getByDepartment($currentUser.department);
		} else {
			projectsPromise = projectService.getAll();
		}
		
		// Încarcă task-urile în paralel cu proiectele
		let tasksPromise;
		if ($currentUser?.department) {
			tasksPromise = taskService.getByDepartment($currentUser.department);
		} else {
			tasksPromise = taskService.getAll();
		}
		
		// Așteaptă ambele promise-uri să se rezolve
		const [projects, tasksData] = await Promise.all([projectsPromise, tasksPromise]);
		
		allProjects = projects;
		tasks = tasksData;
		updateModules();
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

// Funcții pentru comentarii

async function loadTaskComments(taskId: number) {
	if (loadedTaskComments.has(taskId)) return; // Deja încărcate
	
	try {
		const comments = await commentService.getTaskComments(taskId);
		taskComments = [...taskComments, ...comments];
		loadedTaskComments.add(taskId);
	} catch (error) {
		console.error('Error loading comments:', error);
		notifications.error('Eroare comentarii', 'Eroare la încărcarea comentariilor!');
	}
}

async function addComment(taskId: number, commentText: string) {
	if (!commentText.trim() || !$currentUser?.id) return;
	
	try {
		await commentService.createComment({
			task_id: taskId,
			user_id: $currentUser.id,
			comment: commentText.trim()
		});
		
		// Reîncarcă comentariile pentru task-ul specific
		await loadTaskComments(taskId);
		
		// Resetează câmpul de comentariu pentru acest task
		taskCommentInputs.set(taskId, '');
		
		notifications.success('Comentariu adăugat', 'Comentariul a fost adăugat cu succes!');
	} catch (error) {
		console.error('Error adding comment:', error);
		notifications.error('Eroare comentariu', 'Eroare la adăugarea comentariului!');
	}
}

function getTaskComments(taskId: number) {
	return taskComments.filter(c => c.task_id === taskId);
}

// Funcții pentru editarea task-urilor
function editTask(task: Task) {
	editingTask = { ...task };
	showEditTaskModal = true;
}

async function updateTask() {
	if (!editingTask) return;

	try {
		// Actualizează task-ul prin API (doar câmpurile editabile)
		await taskService.update(editingTask.id!, {
			id: editingTask.id,
			user_id: editingTask.user_id,
			project_id: editingTask.project_id,
			description: editingTask.description,
			hours: editingTask.hours,
			date: editingTask.date,
			created_at: editingTask.created_at
		});

		// Reîncarcă datele
		await loadDataInBackground();
		
		showEditTaskModal = false;
		editingTask = null;
		notifications.success('Succes', 'Task actualizat cu succes!');
	} catch (error) {
		console.error('Error updating task:', error);
		notifications.error('Eroare', 'Eroare la actualizarea task-ului!');
	}
}

function cancelEditTask() {
	showEditTaskModal = false;
	editingTask = null;
}

// Funcții pentru ștergerea task-urilor
function confirmDeleteTask(task: Task) {
	taskToDelete = task;
	showDeleteTaskModal = true;
}

async function deleteTaskConfirmed() {
	if (!taskToDelete) return;

	try {
		await taskService.delete(taskToDelete.id!);
		await loadDataInBackground();
		showDeleteTaskModal = false;
		taskToDelete = null;
		notifications.success('Succes', 'Task șters cu succes!');
	} catch (error) {
		console.error('Error deleting task:', error);
		notifications.error('Eroare', 'Eroare la ștergerea task-ului!');
	}
}

function cancelDeleteTask() {
	showDeleteTaskModal = false;
	taskToDelete = null;
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
	if (!confirm('Ești sigur că vrei să ștergi acest task?')) return;
	
	try {
		await taskService.delete(taskId);
		await loadData(); // Reîncarcă datele
		notifications.success('Task șters', 'Task-ul a fost șters cu succes!');
	} catch (error) {
		console.error('Error deleting task:', error);
		notifications.error('Eroare', 'Eroare la ștergerea task-ului!');
	}
}

function getTasksForDate(date: Date) {
	return tasks.filter(task => task.date === format(date, 'yyyy-MM-dd'));
}

function getTotalHoursForDate(date: Date) {
	return getTasksForDate(date).reduce((total, task) => total + (task.hours || 0), 0);
}

function selectDate(date: Date) {
	selectedDate = date;
	updateDailyProgress();
}

function selectModule(module: Project) {
	selectedModule = String(module.id || '');
	selectedProject = '';
	showModuleDropdown = false;
}

function selectProject(project: string) {
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

function navigateWeek(direction: number) {
currentWeek = addDays(currentWeek, direction * 7);
updateWeekDays();
}

function getRemainingHours() {
const remaining = maxDailyHours - dailyProgress;
return remaining;
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
<span class="hours-worked">{Number(dailyProgress).toFixed(1)}h</span>
{#if getRemainingHours() >= 0}
<span class="hours-remaining">{Number(getRemainingHours()).toFixed(1)}h rămas</span>
{:else}
<span class="hours-overtime">{Number(Math.abs(getRemainingHours())).toFixed(1)}h în plus</span>
{/if}
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
		<button class="nav-btn" onclick={() => navigateWeek(-1)}>
<ChevronUp size={20} />
</button>
<h3>{format(currentWeek, 'MMMM yyyy', { locale: ro })}</h3>
		<button class="nav-btn" onclick={() => navigateWeek(1)}>
<ChevronDown size={20} />
</button>
</div>

<div class="calendar-grid">
{#each weekDays as day}
<div 
class="calendar-day" 
class:selected={isSameDay(day, selectedDate)}
	onclick={() => selectDate(day)}
>
<div class="day-header">
<span class="day-name">{format(day, 'EEE', { locale: ro })}</span>
<span class="day-number">{format(day, 'd')}</span>
</div>
<div class="day-tasks">
{#each getTasksForDate(day).slice(0, 3) as task}
<div class="task-mini">
<span class="task-hours">{task.hours}h</span>
<span class="task-desc">{task.description}</span>
</div>
{/each}
{#if getTasksForDate(day).length > 3}
<div class="task-more">
+{getTasksForDate(day).length - 3} mai multe
</div>
{/if}
</div>
<div class="day-total">
{Number(getTotalHoursForDate(day)).toFixed(1)}h
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
	onclick={() => showAddForm = !showAddForm}
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
<select bind:value={selectedModule} onchange={() => {
	selectedProject = '';
	console.log('Module selected:', selectedModule);
}}>
<option value="">Selectează modul</option>
{#each modules as module}
<option value={module.id}>{module.name}</option>
{/each}
</select>
</div>

<!-- Selectare proiect -->
{#if selectedModule}
<div class="form-group">
<label>Proiect</label>
<select bind:value={selectedProject} onchange={() => {
	console.log('Project selected:', selectedProject);
}}>
<option value="">Selectează proiect</option>
{#each getAvailableProjects() as project}
<option value={project}>{project}</option>
{/each}
</select>
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

	<button class="submit-btn" onclick={addTask}>
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
								<button class="action-btn" onclick={() => loadTaskComments(task.id!)}>
									<MessageCircle size={16} />
								</button>
								<button class="action-btn edit" onclick={() => editTask(task)}>
									<Edit3 size={16} />
								</button>
								<button class="action-btn delete" onclick={() => confirmDeleteTask(task)}>
									<Trash2 size={16} />
								</button>
</div>
</div>

<!-- Comentarii pentru task -->
{#if getTaskComments(task.id!).length > 0}
<div class="task-comments">
<h4>Comentarii:</h4>
{#each getTaskComments(task.id!) as comment}
<div class="comment-item">
<div class="comment-header">
<span class="comment-author">{comment.user_name || 'Utilizator'}</span>
<span class="comment-time">{comment.created_at ? format(new Date(comment.created_at), 'dd.MM.yyyy HH:mm') : 'N/A'}</span>
</div>
<p class="comment-text">{comment.comment}</p>
</div>
{/each}
</div>
{/if}

<!-- Formular pentru adăugare comentariu -->
<div class="add-comment-form">
<input 
	type="text" 
	placeholder="Adaugă un comentariu..." 
	value={taskCommentInputs.get(task.id!) || ''}
	oninput={(e) => {
		const target = e.target as HTMLInputElement;
		taskCommentInputs.set(task.id!, target.value);
	}}
	onkeydown={(e) => e.key === 'Enter' && addComment(task.id!, taskCommentInputs.get(task.id!) || '')}
/>
	<button onclick={() => addComment(task.id!, taskCommentInputs.get(task.id!) || '')}>Adaugă</button>
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

<!-- Modal pentru editarea task-urilor -->
{#if showEditTaskModal && editingTask}
<div class="modal-overlay" onclick={cancelEditTask} role="dialog" aria-modal="true" aria-labelledby="edit-task-title">
	<div class="modal-content" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h3 id="edit-task-title">Editează Task</h3>
			<button class="close-btn" onclick={cancelEditTask} aria-label="Închide modal">×</button>
		</div>
		<div class="modal-body">
			<div class="form-group">
				<label for="edit-task-description">Descriere Task</label>
				<input 
					id="edit-task-description"
					type="text" 
					bind:value={editingTask.description}
					placeholder="Descrierea task-ului"
				/>
			</div>
			<div class="form-group">
				<label for="edit-task-hours">Ore lucrate</label>
				<input 
					id="edit-task-hours"
					type="number" 
					step="0.25"
					min="0"
					max="24"
					bind:value={editingTask.hours}
					placeholder="Numărul de ore"
				/>
			</div>
			<div class="form-group">
				<label for="edit-task-date">Data</label>
				<input 
					id="edit-task-date"
					type="date" 
					bind:value={editingTask.date}
				/>
			</div>
			<div class="form-group">
				<label for="edit-task-project">Proiect</label>
				<input 
					id="edit-task-project"
					type="text" 
					value={editingTask.project_name || 'N/A'}
					disabled
				/>
			</div>
		</div>
		<div class="modal-footer">
			<button class="btn-cancel" onclick={cancelEditTask}>Anulează</button>
			<button class="btn-save" onclick={updateTask}>Salvează</button>
		</div>
	</div>
</div>
{/if}

<!-- Modal pentru confirmarea ștergerii task-urilor -->
{#if showDeleteTaskModal && taskToDelete}
<div class="modal-overlay" onclick={cancelDeleteTask} role="dialog" aria-modal="true" aria-labelledby="delete-task-title">
	<div class="modal-content" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h3 id="delete-task-title">Confirmă ștergerea</h3>
			<button class="close-btn" onclick={cancelDeleteTask} aria-label="Închide modal">×</button>
		</div>
		<div class="modal-body">
			<div class="delete-confirmation">
				<div class="warning-icon">
					<Trash2 size={48} />
				</div>
				<p>Ești sigur că vrei să ștergi acest task?</p>
				<div class="task-preview">
					<strong>Descriere:</strong> {taskToDelete.description}<br>
					<strong>Ore:</strong> {taskToDelete.hours}h<br>
					<strong>Data:</strong> {taskToDelete.date}
				</div>
				<p class="warning-text">Această acțiune nu poate fi anulată!</p>
			</div>
		</div>
		<div class="modal-footer">
			<button class="btn-cancel" onclick={cancelDeleteTask}>Anulează</button>
			<button class="btn-delete" onclick={deleteTaskConfirmed}>Șterge</button>
		</div>
	</div>
</div>
{/if}

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
	color: var(--color-text);
	margin: 0 0 0.5rem 0;
}

.dashboard-header p {
	color: var(--color-textSecondary);
	margin: 0;
}

.daily-progress {
	background: var(--color-card);
	padding: 1.5rem;
	border-radius: 12px;
	box-shadow: 0 1px 3px var(--color-shadow);
	border: 1px solid var(--color-cardBorder);
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
	color: var(--color-text);
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

.hours-overtime {
font-weight: 600;
color: #dc2626;
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
	background: var(--color-card);
	padding: 1.5rem;
	border-radius: 12px;
	box-shadow: 0 1px 3px var(--color-shadow);
	border: 1px solid var(--color-cardBorder);
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
	color: var(--color-text);
	margin: 0;
}

.nav-btn {
	background: var(--color-surface);
	border: 1px solid var(--color-border);
	border-radius: 6px;
	padding: 0.5rem;
	cursor: pointer;
	transition: var(--transition);
	color: var(--color-text);
}

.nav-btn:hover {
	background: var(--color-buttonSecondary);
	border-color: var(--color-primary);
}

.calendar-grid {
display: grid;
grid-template-columns: repeat(7, 1fr);
gap: 0.5rem;
}

.calendar-day {
	border: 1px solid var(--color-border);
	border-radius: 8px;
	padding: 0.75rem;
	cursor: pointer;
	transition: all 0.2s;
	min-height: 120px;
	max-height: 200px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	background: var(--color-card);
	color: var(--color-text);
}

.calendar-day:hover {
	background: var(--color-surface);
	border-color: var(--color-border);
}

.calendar-day.selected {
	background: var(--color-badge);
	border-color: var(--color-primary);
}

.day-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.5rem;
}

.day-name {
	font-size: 0.75rem;
	color: var(--color-textSecondary);
	font-weight: 500;
}

.day-number {
	font-weight: 600;
	color: var(--color-text);
}

.day-tasks {
	margin-bottom: 0.5rem;
	flex: 1;
	overflow-y: auto;
	max-height: 100px;
}

.task-mini {
	background: var(--color-buttonSecondary);
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	margin-bottom: 0.25rem;
	font-size: 0.75rem;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: var(--color-text);
}

.task-more {
	background: var(--color-surface);
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-size: 0.75rem;
	color: var(--color-textSecondary);
	text-align: center;
	font-style: italic;
}

.task-hours {
	font-weight: 600;
	color: var(--color-primary);
	margin-right: 0.25rem;
}

.task-desc {
	color: var(--color-textSecondary);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.day-total {
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--color-text);
	text-align: center;
	padding-top: 0.25rem;
	border-top: 1px solid var(--color-border);
}

.form-section {
	background: var(--color-card);
	padding: 1.5rem;
	border-radius: 12px;
	box-shadow: 0 1px 3px var(--color-shadow);
	border: 1px solid var(--color-cardBorder);
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
	color: var(--color-text);
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
	color: var(--color-text);
	font-size: 0.875rem;
}

/* Folosesc stilurile globale pentru input-uri */
/* Stilurile sunt definite în app.css */

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
	background: var(--color-card);
	padding: 1.5rem;
	border-radius: 12px;
	box-shadow: 0 1px 3px var(--color-shadow);
	border: 1px solid var(--color-cardBorder);
}

.tasks-section h3 {
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--color-text);
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
	color: var(--color-text);
	margin: 0 0 0.5rem 0;
	font-size: 0.875rem;
}

.task-meta {
	display: flex;
	gap: 1rem;
	font-size: 0.75rem;
	color: var(--color-textSecondary);
}

.task-hours {
	font-weight: 600;
	color: var(--color-primary);
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

/* Stiluri pentru comentarii */
.task-comments {
	margin-top: 1rem;
	padding: 1rem;
	background: var(--color-surface);
	border-radius: 8px;
	border: 1px solid var(--color-border);
}

.task-comments h4 {
	margin: 0 0 1rem 0;
	color: var(--color-text);
	font-size: 0.875rem;
	font-weight: 600;
}

.comment-item {
	margin-bottom: 0.75rem;
	padding-bottom: 0.75rem;
	border-bottom: 1px solid var(--color-border);
}

.comment-item:last-child {
	margin-bottom: 0;
	padding-bottom: 0;
	border-bottom: none;
}

.comment-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.5rem;
}

.comment-author {
	font-weight: 600;
	color: var(--color-primary);
	font-size: 0.75rem;
}

.comment-time {
	color: var(--color-textSecondary);
	font-size: 0.75rem;
}

.comment-text {
	margin: 0;
	color: var(--color-text);
	font-size: 0.875rem;
	line-height: 1.4;
}

.add-comment-form {
	display: flex;
	gap: 0.5rem;
	margin-top: 1rem;
	padding: 1rem;
	background: var(--color-surface);
	border-radius: 8px;
	border: 1px solid var(--color-border);
}

.add-comment-form input {
	flex: 1;
	padding: 0.5rem;
	border: 1px solid var(--color-inputBorder);
	border-radius: 4px;
	background: var(--color-input);
	color: var(--color-text);
	font-size: 0.875rem;
}

.add-comment-form button {
	padding: 0.5rem 1rem;
	background: var(--color-primary);
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.875rem;
	transition: var(--transition);
}

.add-comment-form button:hover {
	background: var(--color-buttonHover);
}

/* Stiluri pentru modal */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: var(--color-modalOverlay);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	background: var(--color-modal);
	border-radius: 12px;
	box-shadow: 0 10px 25px var(--color-shadow);
	max-width: 500px;
	width: 90%;
	max-height: 90vh;
	overflow-y: auto;
}

.modal-header {
	padding: 1.5rem 1.5rem 0 1.5rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.modal-header h3 {
	margin: 0;
	color: var(--color-text);
	font-size: 1.25rem;
	font-weight: 600;
}

.close-btn {
	background: none;
	border: none;
	font-size: 1.5rem;
	color: var(--color-textSecondary);
	cursor: pointer;
	padding: 0.25rem;
	border-radius: 4px;
	transition: var(--transition);
}

.close-btn:hover {
	background: var(--color-surface);
	color: var(--color-text);
}

.modal-body {
	padding: 1.5rem;
}

.modal-footer {
	padding: 0 1.5rem 1.5rem 1.5rem;
	display: flex;
	gap: 1rem;
	justify-content: flex-end;
}

.btn-cancel {
	padding: 0.75rem 1.5rem;
	background: var(--color-buttonSecondary);
	color: var(--color-text);
	border: 1px solid var(--color-border);
	border-radius: 6px;
	cursor: pointer;
	font-size: 0.875rem;
	font-weight: 500;
	transition: var(--transition);
}

.btn-cancel:hover {
	background: var(--color-border);
}

.btn-save {
	padding: 0.75rem 1.5rem;
	background: var(--color-primary);
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 0.875rem;
	font-weight: 500;
	transition: var(--transition);
}

.btn-save:hover {
	background: var(--color-buttonHover);
}

/* Stiluri pentru modalul de ștergere */
.delete-confirmation {
	text-align: center;
	padding: 1rem 0;
}

.warning-icon {
	color: var(--color-error);
	margin-bottom: 1rem;
}

.task-preview {
	background: var(--color-surface);
	border-radius: 8px;
	padding: 1rem;
	margin: 1rem 0;
	text-align: left;
	border-left: 4px solid var(--color-primary);
}

.task-preview strong {
	color: var(--color-text);
}

.warning-text {
	color: var(--color-error);
	font-weight: 500;
	margin-top: 1rem;
}

.btn-delete {
	padding: 0.75rem 1.5rem;
	background: var(--color-error);
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 0.875rem;
	font-weight: 500;
	transition: var(--transition);
}

.btn-delete:hover {
	background: #dc2626;
	opacity: 0.9;
}
</style>
