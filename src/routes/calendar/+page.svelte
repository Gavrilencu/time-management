<script lang="ts">
import { onMount } from 'svelte';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-svelte';
import { taskService, type Task } from '$lib/api';
import ModernCard from '$lib/components/ModernCard.svelte';
import ModernButton from '$lib/components/ModernButton.svelte';
import ModernInput from '$lib/components/ModernInput.svelte';

let currentDate = $state(new Date());
let selectedDate = $state(new Date());
let tasks: Task[] = $state([]);
let loading = $state(false);

onMount(() => {
loadTasks();
});

async function loadTasks() {
try {
loading = true;
tasks = await taskService.getAll();
} catch (error) {
console.error('Error loading tasks:', error);
} finally {
loading = false;
}
}

function getDaysInMonth() {
const monthStart = startOfMonth(currentDate);
const monthEnd = endOfMonth(currentDate);
const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

const days = [];
let day = startDate;

while (day <= endDate) {
days.push(day);
day = addDays(day, 1);
}

return days;
}

function getTasksForDate(date: Date) {
const dateStr = format(date, 'yyyy-MM-dd');
return tasks.filter(task => task.date === dateStr);
}

function getTotalHoursForDate(date: Date) {
return getTasksForDate(date).reduce((total, task) => total + (task.hours || 0), 0);
}

function navigateMonth(direction: string) {
currentDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
}

function selectDate(date: Date) {
selectedDate = date;
}
</script>

<div class="calendar-page">
<div class="calendar-header">
<h1>Calendar</h1>
<div class="month-navigation">
		<button class="nav-btn" onclick={() => navigateMonth('prev')}>
			<ChevronLeft size={20} />
		</button>
		<h2>{format(currentDate, 'MMMM yyyy', { locale: ro })}</h2>
		<button class="nav-btn" onclick={() => navigateMonth('next')}>
			<ChevronRight size={20} />
		</button>
</div>
</div>

<div class="calendar-container">
<div class="calendar-grid">
<div class="day-header">Luni</div>
<div class="day-header">Marți</div>
<div class="day-header">Miercuri</div>
<div class="day-header">Joi</div>
<div class="day-header">Vineri</div>
<div class="day-header">Sâmbătă</div>
<div class="day-header">Duminică</div>

{#each getDaysInMonth() as day}
	<button 
		class="calendar-day" 
		class:other-month={!isSameMonth(day, currentDate)}
		class:today={isToday(day)}
		class:selected={isSameDay(day, selectedDate)}
		onclick={() => selectDate(day)}
		type="button"
	>
<div class="day-number">{format(day, 'd')}</div>
<div class="day-tasks">
{#each getTasksForDate(day) as task}
<div class="task-item">
<Clock size={12} />
<span>{task.hours}h</span>
</div>
{/each}
</div>
		<div class="day-total">
			{getTotalHoursForDate(day) > 0 ? getTotalHoursForDate(day) + 'h' : ''}
		</div>
	</button>
{/each}
</div>
</div>

<div class="selected-day-info">
<h3>Detalii pentru {format(selectedDate, 'dd MMMM yyyy', { locale: ro })}</h3>
{#if loading}
<div class="loading">Se încarcă...</div>
{:else}
<div class="tasks-list">
{#each getTasksForDate(selectedDate) as task}
<div class="task-detail">
<div class="task-hours">{task.hours}h</div>
<div class="task-description">
<div class="task-title">{task.description}</div>
<div class="task-meta">
<span class="project-name">{task.project_name}</span>
<span class="user-name">{task.user_name}</span>
</div>
</div>
</div>
{:else}
<p class="no-tasks">Nu sunt task-uri pentru această zi</p>
{/each}
</div>
{/if}
</div>
</div>

<style>
.calendar-page {
max-width: 1000px;
margin: 0 auto;
}

.calendar-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 2rem;
}

.calendar-header h1 {
	font-size: 2rem;
	font-weight: 700;
	color: var(--color-text);
	margin: 0;
}

.month-navigation {
display: flex;
align-items: center;
gap: 1rem;
}

.month-navigation h2 {
	font-size: 1.5rem;
	font-weight: 600;
	color: var(--color-text);
	margin: 0;
	min-width: 200px;
	text-align: center;
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

.calendar-container {
	background: var(--color-card);
	border-radius: 12px;
	box-shadow: 0 1px 3px var(--color-shadow);
	border: 1px solid var(--color-cardBorder);
	overflow: hidden;
	margin-bottom: 2rem;
}

.calendar-grid {
display: grid;
grid-template-columns: repeat(7, 1fr);
}

.day-header {
	background: var(--color-tableHeader);
	padding: 1rem;
	text-align: center;
	font-weight: 600;
	color: var(--color-text);
	border-bottom: 1px solid var(--color-tableBorder);
}

.calendar-day {
	min-height: 120px;
	padding: 0.75rem;
	border-right: 1px solid var(--color-tableBorder);
	border-bottom: 1px solid var(--color-tableBorder);
	cursor: pointer;
	transition: background 0.2s;
	position: relative;
	background: var(--color-tableRow);
	color: var(--color-text);
	border-left: none;
	border-top: none;
	width: 100%;
	text-align: left;
	display: flex;
	flex-direction: column;
}

.calendar-day:hover {
	background: var(--color-surface);
}

.calendar-day.other-month {
	background: var(--color-surface);
	color: var(--color-textSecondary);
}

.calendar-day.today {
	background: var(--color-badge);
	color: var(--color-badgeText);
}

.calendar-day.selected {
	background: var(--color-primary);
	color: white;
	border: 2px solid var(--color-primary);
}

.day-number {
	font-weight: 600;
	margin-bottom: 0.5rem;
	color: var(--color-text);
}

.day-tasks {
	margin-bottom: 0.5rem;
}

.task-item {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	background: var(--color-buttonSecondary);
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	margin-bottom: 0.25rem;
	font-size: 0.75rem;
	color: var(--color-text);
}

.day-total {
	position: absolute;
	bottom: 0.5rem;
	right: 0.5rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--color-success);
}

.selected-day-info {
	background: var(--color-card);
	padding: 1.5rem;
	border-radius: 12px;
	box-shadow: 0 1px 3px var(--color-shadow);
	border: 1px solid var(--color-cardBorder);
}

.selected-day-info h3 {
	font-size: 1.25rem;
	font-weight: 600;
	color: var(--color-text);
	margin: 0 0 1rem 0;
}

.tasks-list {
display: flex;
flex-direction: column;
gap: 0.75rem;
}

.task-detail {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 0.75rem;
	background: var(--color-surface);
	border-radius: 6px;
}

.task-hours {
	background: var(--color-success);
	color: white;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-weight: 600;
	font-size: 0.875rem;
	min-width: 60px;
	text-align: center;
}

.task-description {
	color: var(--color-text);
	font-weight: 500;
	flex: 1;
}

.task-title {
	font-weight: 500;
	margin-bottom: 0.25rem;
	color: var(--color-text);
}

.task-meta {
	display: flex;
	gap: 1rem;
	font-size: 0.75rem;
	color: var(--color-textSecondary);
}

.project-name {
	color: var(--color-primary);
	font-weight: 500;
}

.user-name {
	color: var(--color-success);
	font-weight: 500;
}

.loading {
	text-align: center;
	padding: 2rem;
	color: var(--color-textSecondary);
}

.no-tasks {
	color: var(--color-textSecondary);
	text-align: center;
	padding: 2rem;
	margin: 0;
}
</style>
