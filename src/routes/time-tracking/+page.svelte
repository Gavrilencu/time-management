<script lang="ts">
import { onMount } from 'svelte';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Clock, Play, Pause, Square, BarChart3 } from 'lucide-svelte';
import { projectService, taskService, statsService, type Project, type Task } from '$lib/api';
import { notifications } from '$lib/notifications';
import { page } from '$app/stores';
import { currentUser } from '$lib/auth';

let isRunning = $state(false);
let startTime: number | null = $state(null);
let elapsedTime = $state(0);
let currentTask = $state('');
let selectedProject = $state('');
let selectedProjectId = $state(0);
let timerInterval: number | null = $state(null);
let projects: Project[] = $state([]);
let recentTasks: Task[] = $state([]);
let weeklyData: { day: string; hours: number; tasks: number }[] = $state([]);
let loading = $state(false);

onMount(() => {
loadData();
});

async function loadData() {
try {
loading = true;
projects = await projectService.getAll();
recentTasks = await taskService.getAll();
loadWeeklyData();
} catch (error) {
console.error('Error loading data:', error);
} finally {
loading = false;
}
}

function loadWeeklyData() {
// Calculează datele săptămânale din task-urile reale
const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
const dayNames = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];

weeklyData = weekDays.map((day, index) => {
const dayStr = format(day, 'yyyy-MM-dd');
const dayTasks = recentTasks.filter(task => task.date === dayStr);
const totalHours = dayTasks.reduce((sum, task) => sum + (task.hours || 0), 0);
return {
day: dayNames[index],
hours: totalHours,
tasks: dayTasks.length
};
});
}

function startTimer() {
if (!currentTask || !selectedProject) {
notifications.warning('Câmpuri incomplete', 'Te rog completează task-ul și proiectul!');
return;
}

isRunning = true;
startTime = Date.now();

timerInterval = setInterval(() => {
elapsedTime = Date.now() - (startTime || 0);
}, 1000);
}

function pauseTimer() {
isRunning = false;
if (timerInterval) {
clearInterval(timerInterval);
timerInterval = null;
}
}

async function stopTimer() {
isRunning = false;
if (timerInterval) {
clearInterval(timerInterval);
timerInterval = null;
}

const hours = elapsedTime / (1000 * 60 * 60);

try {
// Salvează task-ul în baza de date
await taskService.create({
user_id: $currentUser?.id || 1,
project_id: selectedProjectId,
description: currentTask,
hours: parseFloat(Number(hours).toFixed(2)),
date: format(new Date(), 'yyyy-MM-dd')
});

// Reîncarcă datele
await loadData();

notifications.success('Task salvat', `Task salvat cu succes: ${Number(hours).toFixed(2)} ore`);
} catch (error) {
console.error('Error saving task:', error);
notifications.error('Eroare', 'Eroare la salvarea task-ului!');
}

// Reset timer
elapsedTime = 0;
startTime = null;
currentTask = '';
selectedProject = '';
selectedProjectId = 0;
}

function formatTime(ms: number | null) {
if (!ms) return '00:00:00';
const totalSeconds = Math.floor(ms / 1000);
const hours = Math.floor(totalSeconds / 3600);
const minutes = Math.floor((totalSeconds % 3600) / 60);
const seconds = totalSeconds % 60;

return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getTotalWeeklyHours() {
return weeklyData.reduce((total, day) => total + day.hours, 0);
}

function getAverageDailyHours() {
if (weeklyData.length === 0) return '0.0';
return Number(getTotalWeeklyHours() / weeklyData.length).toFixed(1);
}

function onProjectChange(event: Event) {
const target = event.target as HTMLSelectElement;
selectedProject = target.value;
const project = projects.find(p => p.name === target.value);
selectedProjectId = project?.id || 0;
}
</script>

<div class="time-tracking-page">
<div class="page-header">
<h1>Urmărire Timp Lucru</h1>
<p>Monitorizează-ți timpul de lucru în timp real</p>
</div>

<div class="tracking-grid">
<!-- Timer -->
<div class="timer-section">
<div class="timer-card">
<div class="timer-display">
<Clock size={48} />
<div class="time">{formatTime(elapsedTime)}</div>
</div>

<div class="timer-controls">
{#if !isRunning}
<button class="control-btn start" onclick={startTimer}>
<Play size={20} />
Start
</button>
{:else}
<button class="control-btn pause" onclick={pauseTimer}>
<Pause size={20} />
Pause
</button>
<button class="control-btn stop" onclick={stopTimer}>
<Square size={20} />
Stop
</button>
{/if}
</div>
</div>

<div class="task-form">
<div class="form-group">
<label>Descriere Task</label>
<input 
type="text" 
bind:value={currentTask}
placeholder="Ce lucrezi acum?"
disabled={isRunning}
/>
</div>

<div class="form-group">
<label>Proiect</label>
<select onchange={onProjectChange} disabled={isRunning}>
<option value="">Selectează proiect</option>
{#each projects as project}
<option value={project.name}>{project.name}</option>
{/each}
</select>
</div>
</div>
</div>

<!-- Statistici săptămânale -->
<div class="stats-section">
<div class="stats-header">
<h3>Statistici Săptămânale</h3>
<BarChart3 size={24} />
</div>

<div class="stats-grid">
<div class="stat-card">
<div class="stat-value">{getTotalWeeklyHours()}h</div>
<div class="stat-label">Total săptămână</div>
</div>
<div class="stat-card">
<div class="stat-value">{getAverageDailyHours()}h</div>
<div class="stat-label">Medie zilnică</div>
</div>
<div class="stat-card">
<div class="stat-value">{weeklyData.reduce((total, day) => total + day.tasks, 0)}</div>
<div class="stat-label">Task-uri completate</div>
</div>
</div>

<div class="weekly-chart">
<h4>Progresul săptămânii</h4>
<div class="chart-bars">
{#each weeklyData as day}
<div class="chart-bar">
<div class="bar-fill" style="height: {(day.hours / 8) * 100}%"></div>
<div class="bar-label">{day.day}</div>
<div class="bar-value">{day.hours}h</div>
</div>
{/each}
</div>
</div>
</div>
</div>

<!-- Istoric recent -->
<div class="recent-tasks">
<h3>Task-uri Recente</h3>
{#if loading}
<div class="loading">Se încarcă...</div>
{:else}
<div class="tasks-list">
{#each recentTasks.slice(0, 5) as task}
<div class="task-item">
<div class="task-info">
<div class="task-description">{task.description}</div>
<div class="task-project">{task.project_name}</div>
</div>
<div class="task-time">{task.hours}h</div>
</div>
{:else}
<div class="no-tasks">Nu sunt task-uri recente</div>
{/each}
</div>
{/if}
</div>
</div>

<style>
.time-tracking-page {
max-width: 1200px;
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

.tracking-grid {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 2rem;
margin-bottom: 2rem;
}

.timer-section {
display: flex;
flex-direction: column;
gap: 1.5rem;
}

.timer-card {
background: white;
padding: 2rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
text-align: center;
}

.timer-display {
display: flex;
flex-direction: column;
align-items: center;
gap: 1rem;
margin-bottom: 2rem;
}

.timer-display svg {
color: #2563eb;
}

.time {
font-size: 3rem;
font-weight: 700;
color: #1f2937;
font-family: 'Courier New', monospace;
}

.timer-controls {
display: flex;
gap: 1rem;
justify-content: center;
}

.control-btn {
display: flex;
align-items: center;
gap: 0.5rem;
padding: 0.75rem 1.5rem;
border: none;
border-radius: 8px;
font-weight: 600;
cursor: pointer;
transition: all 0.2s;
}

.control-btn.start {
background: #10b981;
color: white;
}

.control-btn.start:hover {
background: #059669;
}

.control-btn.pause {
background: #f59e0b;
color: white;
}

.control-btn.pause:hover {
background: #d97706;
}

.control-btn.stop {
background: #ef4444;
color: white;
}

.control-btn.stop:hover {
background: #dc2626;
}

.task-form {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
	margin-bottom: 1rem;
}

.form-group label {
	display: block;
	font-weight: 500;
	color: var(--color-text);
	margin-bottom: 0.5rem;
}

/* Folosesc stilurile globale pentru input-uri și select */
/* Stilurile sunt definite în app.css */

.stats-section {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1.5rem;
}

.stats-header h3 {
font-size: 1.25rem;
font-weight: 600;
color: #1f2937;
margin: 0;
}

.stats-grid {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 1rem;
margin-bottom: 2rem;
}

.stat-card {
text-align: center;
padding: 1rem;
background: #f9fafb;
border-radius: 8px;
}

.stat-value {
font-size: 1.5rem;
font-weight: 700;
color: #1f2937;
margin-bottom: 0.25rem;
}

.stat-label {
font-size: 0.875rem;
color: #6b7280;
}

.weekly-chart h4 {
font-size: 1rem;
font-weight: 600;
color: #374151;
margin: 0 0 1rem 0;
}

.chart-bars {
display: flex;
gap: 0.5rem;
height: 200px;
align-items: end;
}

.chart-bar {
flex: 1;
display: flex;
flex-direction: column;
align-items: center;
height: 100%;
}

.bar-fill {
width: 100%;
background: linear-gradient(to top, #3b82f6, #60a5fa);
border-radius: 4px 4px 0 0;
min-height: 20px;
margin-bottom: 0.5rem;
}

.bar-label {
font-size: 0.75rem;
color: #6b7280;
margin-bottom: 0.25rem;
}

.bar-value {
font-size: 0.75rem;
font-weight: 600;
color: #1f2937;
}

.recent-tasks {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recent-tasks h3 {
font-size: 1.25rem;
font-weight: 600;
color: #1f2937;
margin: 0 0 1rem 0;
}

.tasks-list {
display: flex;
flex-direction: column;
gap: 0.75rem;
}

.task-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 1rem;
background: #f9fafb;
border-radius: 8px;
}

.task-description {
font-weight: 500;
color: #1f2937;
margin-bottom: 0.25rem;
}

.task-project {
font-size: 0.875rem;
color: #6b7280;
}

.task-time {
font-weight: 600;
color: #059669;
font-size: 1.125rem;
}

.loading {
text-align: center;
padding: 2rem;
color: #6b7280;
}

.no-tasks {
text-align: center;
padding: 2rem;
color: #6b7280;
}
</style>
