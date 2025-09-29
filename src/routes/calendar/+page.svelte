<script lang="ts">
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-svelte';

let currentDate = $state(new Date());
let selectedDate = $state(new Date());
let tasks = $state([]);

// Simulare date pentru demo
const sampleTasks = [
{ date: '2024-01-15', hours: 6.5, description: 'Development' },
{ date: '2024-01-16', hours: 8, description: 'Testing' },
{ date: '2024-01-17', hours: 4.5, description: 'Documentation' },
{ date: '2024-01-18', hours: 7, description: 'Bug fixes' },
{ date: '2024-01-19', hours: 8, description: 'Feature development' }
];

onMount(() => {
tasks = sampleTasks;
});

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

function getTasksForDate(date) {
const dateStr = format(date, 'yyyy-MM-dd');
return tasks.filter(task => task.date === dateStr);
}

function getTotalHoursForDate(date) {
return getTasksForDate(date).reduce((total, task) => total + task.hours, 0);
}

function navigateMonth(direction) {
currentDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
}

function selectDate(date) {
selectedDate = date;
}
</script>

<div class="calendar-page">
<div class="calendar-header">
<h1>Calendar</h1>
<div class="month-navigation">
<button class="nav-btn" on:click={() => navigateMonth('prev')}>
<ChevronLeft size={20} />
</button>
<h2>{format(currentDate, 'MMMM yyyy', { locale: ro })}</h2>
<button class="nav-btn" on:click={() => navigateMonth('next')}>
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
<div 
class="calendar-day" 
class:other-month={!isSameMonth(day, currentDate)}
class:today={isToday(day)}
class:selected={isSameDay(day, selectedDate)}
on:click={() => selectDate(day)}
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
</div>
{/each}
</div>
</div>

<div class="selected-day-info">
<h3>Detalii pentru {format(selectedDate, 'dd MMMM yyyy', { locale: ro })}</h3>
<div class="tasks-list">
{#each getTasksForDate(selectedDate) as task}
<div class="task-detail">
<div class="task-hours">{task.hours}h</div>
<div class="task-description">{task.description}</div>
</div>
{:else}
<p class="no-tasks">Nu sunt task-uri pentru această zi</p>
{/each}
</div>
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
color: #1f2937;
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
color: #1f2937;
margin: 0;
min-width: 200px;
text-align: center;
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

.calendar-container {
background: white;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
overflow: hidden;
margin-bottom: 2rem;
}

.calendar-grid {
display: grid;
grid-template-columns: repeat(7, 1fr);
}

.day-header {
background: #f9fafb;
padding: 1rem;
text-align: center;
font-weight: 600;
color: #374151;
border-bottom: 1px solid #e5e7eb;
}

.calendar-day {
min-height: 120px;
padding: 0.75rem;
border-right: 1px solid #e5e7eb;
border-bottom: 1px solid #e5e7eb;
cursor: pointer;
transition: background 0.2s;
position: relative;
}

.calendar-day:hover {
background: #f9fafb;
}

.calendar-day.other-month {
background: #f9fafb;
color: #9ca3af;
}

.calendar-day.today {
background: #eff6ff;
}

.calendar-day.selected {
background: #dbeafe;
border: 2px solid #2563eb;
}

.day-number {
font-weight: 600;
margin-bottom: 0.5rem;
}

.day-tasks {
margin-bottom: 0.5rem;
}

.task-item {
display: flex;
align-items: center;
gap: 0.25rem;
background: #f3f4f6;
padding: 0.25rem 0.5rem;
border-radius: 4px;
margin-bottom: 0.25rem;
font-size: 0.75rem;
}

.day-total {
position: absolute;
bottom: 0.5rem;
right: 0.5rem;
font-size: 0.75rem;
font-weight: 600;
color: #059669;
}

.selected-day-info {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selected-day-info h3 {
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

.task-detail {
display: flex;
align-items: center;
gap: 1rem;
padding: 0.75rem;
background: #f9fafb;
border-radius: 6px;
}

.task-hours {
background: #d1fae5;
color: #065f46;
padding: 0.25rem 0.5rem;
border-radius: 4px;
font-weight: 600;
font-size: 0.875rem;
min-width: 60px;
text-align: center;
}

.task-description {
color: #374151;
font-weight: 500;
}

.no-tasks {
color: #6b7280;
text-align: center;
padding: 2rem;
margin: 0;
}
</style>
