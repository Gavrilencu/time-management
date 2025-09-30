<!-- Modern Dashboard Layout -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/auth';
	import { projectService, taskService, type Project, type Task } from '$lib/api';
	import { format, startOfWeek, endOfWeek, isToday, isThisWeek } from 'date-fns';
	import { ro } from 'date-fns/locale';
	import { 
		Clock, 
		Calendar, 
		TrendingUp, 
		Users, 
		Target, 
		Plus,
		ChevronRight,
		ChevronLeft,
		BarChart3,
		PieChart,
		Activity,
		CheckCircle,
		AlertCircle,
		Info,
		ArrowLeft
	} from 'lucide-svelte';
	import ModernCard from '$lib/components/ModernCard.svelte';
	import ModernButton from '$lib/components/ModernButton.svelte';
	
	// State
	let projects: Project[] = $state([]);
	let tasks: Task[] = $state([]);
	let loading = $state(true);
	let currentWeek = $state(new Date());
	let weeklyHours = $state(0);
	let todayHours = $state(0);
	let totalProjects = $state(0);
	let completedTasks = $state(0);
	let pendingTasks = $state(0);
	
	// Stats
	let stats = $state({
		totalHours: 0,
		weeklyProgress: 0,
		projectCompletion: 0,
		teamProductivity: 0
	});
	
	// Load data
	onMount(async () => {
		await loadDashboardData();
	});
	
	async function loadDashboardData() {
		try {
			loading = true;
			
			// Load projects and tasks in parallel
			const [projectsData, tasksData] = await Promise.all([
				projectService.getAll(),
				taskService.getAll()
			]);
			
			projects = projectsData;
			tasks = tasksData;
			
			// Calculate stats
			calculateStats();
			
		} catch (error) {
			console.error('Error loading dashboard data:', error);
		} finally {
			loading = false;
		}
	}
	
	function calculateStats() {
		// Calculate weekly hours
		const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
		const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
		
		weeklyHours = tasks
			.filter(task => {
				const taskDate = new Date(task.date);
				return taskDate >= weekStart && taskDate <= weekEnd;
			})
			.reduce((total, task) => total + (task.hours || 0), 0);
		
		// Calculate today hours
		todayHours = tasks
			.filter(task => isToday(new Date(task.date)))
			.reduce((total, task) => total + (task.hours || 0), 0);
		
		// Calculate other stats
		totalProjects = projects.length;
		completedTasks = tasks.filter(task => task.status === 'completed').length;
		pendingTasks = tasks.filter(task => task.status === 'pending').length;
		
		// Calculate progress percentages
		stats.totalHours = tasks.reduce((total, task) => total + (task.hours || 0), 0);
		stats.weeklyProgress = Math.min((weeklyHours / 40) * 100, 100); // Assuming 40h/week
		stats.projectCompletion = totalProjects > 0 ? (completedTasks / (completedTasks + pendingTasks)) * 100 : 0;
		stats.teamProductivity = Math.min((todayHours / 8) * 100, 100); // Assuming 8h/day
	}
	
	function navigateWeek(direction: number) {
		const newWeek = new Date(currentWeek);
		newWeek.setDate(newWeek.getDate() + (direction * 7));
		currentWeek = newWeek;
		calculateStats();
	}
	
	function getWeekRange() {
		const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
		const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
		return `${format(start, 'dd MMM', { locale: ro })} - ${format(end, 'dd MMM yyyy', { locale: ro })}`;
	}
	
	function getRecentTasks() {
		return tasks
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, 5);
	}
	
	function getProjectTasks(projectId: number) {
		return tasks.filter(task => task.project_id === projectId);
	}
</script>

<div class="modern-dashboard">
	<!-- Header -->
	<div class="dashboard-header">
		<div class="header-content">
			<div class="header-info">
				<h1 class="dashboard-title">
					Bună ziua, {$currentUser?.name || 'Utilizator'}! 👋
				</h1>
				<p class="dashboard-subtitle">
					Iată un rezumat al activității tale de astăzi
				</p>
			</div>
			<div class="header-actions">
				<ModernButton variant="primary" size="md" onclick={() => window.location.href = '/time-management/add-task'}>
					<Plus size={16} />
					Adaugă Task
				</ModernButton>
			</div>
		</div>
	</div>
	
	<!-- Stats Grid -->
	<div class="stats-grid">
		<ModernCard variant="elevated" className="stat-card">
			<div class="stat-content">
				<div class="stat-icon stat-icon-primary">
					<Clock size={24} />
				</div>
				<div class="stat-info">
					<div class="stat-value">{todayHours.toFixed(1)}h</div>
					<div class="stat-label">Ore astăzi</div>
				</div>
			</div>
			<div class="stat-progress">
				<div class="progress-bar">
					<div class="progress-fill" style="width: {Math.min((todayHours / 8) * 100, 100)}%"></div>
				</div>
			</div>
		</ModernCard>
		
		<ModernCard variant="elevated" className="stat-card">
			<div class="stat-content">
				<div class="stat-icon stat-icon-success">
					<Calendar size={24} />
				</div>
				<div class="stat-info">
					<div class="stat-value">{weeklyHours.toFixed(1)}h</div>
					<div class="stat-label">Ore săptămâna</div>
				</div>
			</div>
			<div class="stat-progress">
				<div class="progress-bar">
					<div class="progress-fill" style="width: {stats.weeklyProgress}%"></div>
				</div>
			</div>
		</ModernCard>
		
		<ModernCard variant="elevated" className="stat-card">
			<div class="stat-content">
				<div class="stat-icon stat-icon-accent">
					<Target size={24} />
				</div>
				<div class="stat-info">
					<div class="stat-value">{totalProjects}</div>
					<div class="stat-label">Proiecte active</div>
				</div>
			</div>
			<div class="stat-progress">
				<div class="progress-bar">
					<div class="progress-fill" style="width: {stats.projectCompletion}%"></div>
				</div>
			</div>
		</ModernCard>
		
		<ModernCard variant="elevated" className="stat-card">
			<div class="stat-content">
				<div class="stat-icon stat-icon-warning">
					<Activity size={24} />
				</div>
				<div class="stat-info">
					<div class="stat-value">{pendingTasks}</div>
					<div class="stat-label">Task-uri în așteptare</div>
				</div>
			</div>
			<div class="stat-progress">
				<div class="progress-bar">
					<div class="progress-fill" style="width: {Math.min((completedTasks / (completedTasks + pendingTasks)) * 100, 100)}%"></div>
				</div>
			</div>
		</ModernCard>
	</div>
	
	<!-- Main Content Grid -->
	<div class="main-grid">
		<!-- Weekly Overview -->
		<ModernCard variant="elevated" className="weekly-overview">
			<div class="card-header">
				<h3 class="card-title">Prezentare Săptămânală</h3>
				<div class="week-navigation">
					<button class="nav-btn" onclick={() => navigateWeek(-1)}>
						<ChevronLeft size={16} />
					</button>
					<span class="week-range">{getWeekRange()}</span>
					<button class="nav-btn" onclick={() => navigateWeek(1)}>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
			<div class="weekly-chart">
				<div class="chart-placeholder">
					<BarChart3 size={48} />
					<p>Grafic săptămânal</p>
				</div>
			</div>
		</ModernCard>
		
		<!-- Recent Tasks -->
		<ModernCard variant="elevated" className="recent-tasks">
			<div class="card-header">
				<h3 class="card-title">Task-uri Recente</h3>
				<ModernButton variant="secondary" size="sm" onclick={() => window.location.href = '/time-management/time-tracking'}>
					Vezi toate
				</ModernButton>
			</div>
			<div class="tasks-list">
				{#each getRecentTasks() as task}
					<div class="task-item">
						<div class="task-info">
							<div class="task-title">{task.description}</div>
							<div class="task-meta">
								<span class="task-hours">{task.hours}h</span>
								<span class="task-date">{format(new Date(task.date), 'dd MMM', { locale: ro })}</span>
							</div>
						</div>
						<div class="task-status">
							{#if task.status === 'completed'}
								<CheckCircle size={16} class="status-completed" />
							{:else if task.status === 'pending'}
								<AlertCircle size={16} class="status-pending" />
							{:else}
								<Info size={16} class="status-info" />
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</ModernCard>
		
		<!-- Projects Overview -->
		<ModernCard variant="elevated" className="projects-overview">
			<div class="card-header">
				<h3 class="card-title">Proiecte Active</h3>
				<ModernButton variant="secondary" size="sm" onclick={() => window.location.href = '/time-management/admin'}>
					Gestionează
				</ModernButton>
			</div>
			<div class="projects-list">
				{#each projects.slice(0, 5) as project}
					<div class="project-item">
						<div class="project-info">
							<div class="project-name">{project.name}</div>
							<div class="project-meta">
								<span class="project-tasks">{getProjectTasks(project.id!).length} task-uri</span>
								<span class="project-hours">
									{getProjectTasks(project.id!).reduce((total, task) => total + (task.hours || 0), 0).toFixed(1)}h
								</span>
							</div>
						</div>
						<div class="project-progress">
							<div class="progress-bar">
								<div class="progress-fill" style="width: {Math.random() * 100}%"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</ModernCard>
		
		<!-- Quick Actions -->
		<ModernCard variant="gradient" className="quick-actions">
			<div class="card-header">
				<h3 class="card-title">Acțiuni Rapide</h3>
			</div>
			<div class="actions-grid">
				<ModernButton variant="secondary" size="lg" fullWidth onclick={() => window.location.href = '/time-management/add-task'}>
					<Plus size={20} />
					Adaugă Task
				</ModernButton>
				<ModernButton variant="secondary" size="lg" fullWidth onclick={() => window.location.href = '/time-management/calendar'}>
					<Calendar size={20} />
					Vezi Calendar
				</ModernButton>
				<ModernButton variant="secondary" size="lg" fullWidth onclick={() => window.location.href = '/time-management/time-tracking'}>
					<Clock size={20} />
					Time Tracking
				</ModernButton>
				<ModernButton variant="secondary" size="lg" fullWidth onclick={() => window.location.href = '/time-management/admin'}>
					<Users size={20} />
					Administrare
				</ModernButton>
			</div>
		</ModernCard>
	</div>
</div>

<style>
	.modern-dashboard {
		min-height: 100vh;
		background: var(--color-background);
		padding: var(--spacing-lg, 1.5rem);
	}
	
	.dashboard-header {
		margin-bottom: var(--spacing-xl, 2rem);
	}
	
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--spacing-lg, 1.5rem);
	}
	
	.dashboard-title {
		font-size: var(--font-typography-fontSize-3xl, 1.875rem);
		font-weight: var(--font-typography-fontWeight-bold, 700);
		color: var(--color-text);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}
	
	.dashboard-subtitle {
		font-size: var(--font-typography-fontSize-lg, 1.125rem);
		color: var(--color-textSecondary);
		margin: 0;
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg, 1.5rem);
		margin-bottom: var(--spacing-xl, 2rem);
	}
	
	.stat-card {
		padding: var(--spacing-lg, 1.5rem);
	}
	
	.stat-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-md, 1rem);
		margin-bottom: var(--spacing-md, 1rem);
	}
	
	.stat-icon {
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius-lg, 0.75rem);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}
	
	.stat-icon-primary { background: var(--color-primary); }
	.stat-icon-success { background: var(--color-success); }
	.stat-icon-accent { background: var(--color-accent); }
	.stat-icon-warning { background: var(--color-warning); }
	
	.stat-value {
		font-size: var(--font-typography-fontSize-2xl, 1.5rem);
		font-weight: var(--font-typography-fontWeight-bold, 700);
		color: var(--color-text);
		line-height: 1;
	}
	
	.stat-label {
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		color: var(--color-textSecondary);
		margin-top: var(--spacing-xs, 0.25rem);
	}
	
	.progress-bar {
		width: 100%;
		height: 0.5rem;
		background: var(--color-surface);
		border-radius: var(--radius-full, 9999px);
		overflow: hidden;
	}
	
	.progress-fill {
		height: 100%;
		background: var(--color-primary);
		border-radius: var(--radius-full, 9999px);
		transition: width var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
	}
	
	.main-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-template-rows: auto auto;
		gap: var(--spacing-lg, 1.5rem);
	}
	
	.weekly-overview {
		grid-column: 1;
		grid-row: 1;
	}
	
	.recent-tasks {
		grid-column: 2;
		grid-row: 1;
	}
	
	.projects-overview {
		grid-column: 1;
		grid-row: 2;
	}
	
	.quick-actions {
		grid-column: 2;
		grid-row: 2;
	}
	
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg, 1.5rem);
	}
	
	.card-title {
		font-size: var(--font-typography-fontSize-xl, 1.25rem);
		font-weight: var(--font-typography-fontWeight-semibold, 600);
		color: var(--color-text);
		margin: 0;
	}
	
	.week-navigation {
		display: flex;
		align-items: center;
		gap: var(--spacing-md, 1rem);
	}
	
	.nav-btn {
		width: 2rem;
		height: 2rem;
		border: none;
		background: var(--color-surface);
		border-radius: var(--radius-md, 0.5rem);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
		color: var(--color-textSecondary);
	}
	
	.nav-btn:hover {
		background: var(--color-surfaceHover);
		color: var(--color-text);
	}
	
	.week-range {
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		color: var(--color-textSecondary);
		font-weight: var(--font-typography-fontWeight-medium, 500);
	}
	
	.chart-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 200px;
		color: var(--color-textTertiary);
		gap: var(--spacing-md, 1rem);
	}
	
	.tasks-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md, 1rem);
	}
	
	.task-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md, 1rem);
		background: var(--color-surface);
		border-radius: var(--radius-md, 0.5rem);
		transition: all var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
	}
	
	.task-item:hover {
		background: var(--color-surfaceHover);
		transform: translateY(-1px);
	}
	
	.task-title {
		font-weight: var(--font-typography-fontWeight-medium, 500);
		color: var(--color-text);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}
	
	.task-meta {
		display: flex;
		gap: var(--spacing-md, 1rem);
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		color: var(--color-textSecondary);
	}
	
	.status-completed { color: var(--color-success); }
	.status-pending { color: var(--color-warning); }
	.status-info { color: var(--color-info); }
	
	.projects-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md, 1rem);
	}
	
	.project-item {
		padding: var(--spacing-md, 1rem);
		background: var(--color-surface);
		border-radius: var(--radius-md, 0.5rem);
		transition: all var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
	}
	
	.project-item:hover {
		background: var(--color-surfaceHover);
		transform: translateY(-1px);
	}
	
	.project-name {
		font-weight: var(--font-typography-fontWeight-medium, 500);
		color: var(--color-text);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}
	
	.project-meta {
		display: flex;
		gap: var(--spacing-md, 1rem);
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		color: var(--color-textSecondary);
		margin-bottom: var(--spacing-sm, 0.5rem);
	}
	
	.project-progress {
		margin-top: var(--spacing-sm, 0.5rem);
	}
	
	.actions-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md, 1rem);
	}
	
	/* Responsive Design */
	@media (max-width: 1024px) {
		.main-grid {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto auto;
		}
		
		.weekly-overview { grid-column: 1; grid-row: 1; }
		.recent-tasks { grid-column: 1; grid-row: 2; }
		.projects-overview { grid-column: 1; grid-row: 3; }
		.quick-actions { grid-column: 1; grid-row: 4; }
	}
	
	@media (max-width: 768px) {
		.modern-dashboard {
			padding: var(--spacing-md, 1rem);
		}
		
		.header-content {
			flex-direction: column;
			align-items: stretch;
		}
		
		.stats-grid {
			grid-template-columns: 1fr;
		}
		
		.actions-grid {
			grid-template-columns: 1fr;
		}
		
		.dashboard-title {
			font-size: var(--font-typography-fontSize-2xl, 1.5rem);
		}
	}
</style>