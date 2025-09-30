<!-- Modern Add Task Page -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { format } from 'date-fns';
	import { ro } from 'date-fns/locale';
	import { Plus, Calendar, Clock, ArrowLeft, CheckCircle } from 'lucide-svelte';
	import { projectService, taskService, departmentService, type Project, type TaskCreate } from '$lib/api';
	import { notifications } from '$lib/notifications';
	import { page } from '$app/stores';
	import { currentUser } from '$lib/auth';
	import ModernCard from '$lib/components/ModernCard.svelte';
	import ModernButton from '$lib/components/ModernButton.svelte';
	import ModernInput from '$lib/components/ModernInput.svelte';
	
	let selectedDate = $state(new Date());
	let selectedModule = $state('');
	let selectedProject = $state('');
	let selectedProjectId = $state<number | string>('');
	let taskDescription = $state('');
	let taskHours = $state('');
	let projects: Project[] = $state([]);
	let loading = $state(false);
	let showPreview = $state(false);
	
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
			if ($currentUser?.department) {
				projects = await projectService.getByDepartment($currentUser.department);
			} else {
				projects = await projectService.getAll();
			}
			console.log('Loaded projects:', projects);
		} catch (error) {
			console.error('Error loading projects:', error);
			notifications.error('Eroare', 'Eroare la încărcarea proiectelor!');
		} finally {
			loading = false;
		}
	}
	
	async function addTask() {
		if (!selectedModule || !selectedProjectId || !taskDescription || !taskHours) {
			notifications.warning('Câmpuri incomplete', 'Te rog completează toate câmpurile!');
			return;
		}
		
		try {
			loading = true;
			
			const taskData: TaskCreate = {
				user_id: $currentUser?.id || 1,
				project_id: Number(selectedProjectId),
				description: taskDescription,
				hours: parseFloat(taskHours),
				date: format(selectedDate, 'yyyy-MM-dd')
			};
			
			console.log('Creating task with data:', taskData);
			
			await taskService.create(taskData);
			
			// Reset form
			taskDescription = '';
			taskHours = '';
			selectedModule = '';
			selectedProject = '';
			selectedProjectId = '';
			showPreview = false;
			
			notifications.success('Succes', 'Task adăugat cu succes!');
		} catch (error) {
			console.error('Error adding task:', error);
			notifications.error('Eroare', 'Eroare la adăugarea task-ului!');
		} finally {
			loading = false;
		}
	}
	
	function getAvailableProjects() {
		if (!selectedModule) {
			return [];
		}
		
		const filteredProjects = projects.filter(p => p.module_type === selectedModule);
		return filteredProjects;
	}
	
	function getSelectedModuleName() {
		const module = modules.find(m => m.id === selectedModule);
		return module ? module.name : 'Nu este selectat';
	}
	
	function getSelectedProjectName() {
		return selectedProject || 'Nu este selectat';
	}
	
	function togglePreview() {
		showPreview = !showPreview;
	}
</script>

<div class="modern-add-task-page">
	<!-- Header -->
	<div class="page-header">
		<div class="header-content">
			<div class="header-info">
				<ModernButton variant="secondary" size="sm" onclick={() => window.location.href = '/time-management/'}>
					<ArrowLeft size={16} />
					Înapoi
				</ModernButton>
				<div class="header-text">
					<h1 class="page-title">Adaugă Task Nou</h1>
					<p class="page-subtitle">Completează informațiile pentru noul task</p>
				</div>
			</div>
			<div class="header-actions">
				<ModernButton variant="secondary" size="md" onclick={togglePreview}>
					{showPreview ? 'Ascunde' : 'Previzualizează'}
				</ModernButton>
			</div>
		</div>
	</div>
	
	<!-- Main Content -->
	<div class="main-content">
		<div class="content-grid">
			<!-- Form Section -->
			<ModernCard variant="elevated" class="form-section">
				<div class="card-header">
					<h2 class="card-title">Informații Task</h2>
					<div class="form-progress">
						<div class="progress-steps">
							<div class="step {selectedModule ? 'completed' : 'active'}">
								<div class="step-number">1</div>
								<div class="step-label">Modul</div>
							</div>
							<div class="step {selectedProjectId ? 'completed' : (selectedModule ? 'active' : '')}">
								<div class="step-number">2</div>
								<div class="step-label">Proiect</div>
							</div>
							<div class="step {(taskDescription && taskHours) ? 'completed' : (selectedProjectId ? 'active' : '')}">
								<div class="step-number">3</div>
								<div class="step-label">Detalii</div>
							</div>
						</div>
					</div>
				</div>
				
				<form onsubmit={(e) => {
					e.preventDefault();
					addTask();
				}} class="task-form">
					<!-- Data -->
					<div class="form-group">
						<label for="task-date" class="form-label">
							<Calendar size={16} />
							Data
						</label>
						<input 
							id="task-date"
							type="date" 
							bind:value={selectedDate}
							required
							class="form-input"
						/>
					</div>
					
					<!-- Modul -->
					<div class="form-group">
						<label for="module-select" class="form-label">
							Modul
						</label>
						<select 
							id="module-select" 
							bind:value={selectedModule} 
							onchange={() => {
								selectedProject = '';
								selectedProjectId = '';
								console.log('Module selected:', selectedModule);
								console.log('Available projects:', getAvailableProjects().length);
							}}
							class="form-select"
						>
							<option value="">Selectează modul</option>
							{#each modules as module}
								<option value={module.id}>{module.name}</option>
							{/each}
						</select>
					</div>
					
					<!-- Proiect -->
					{#if selectedModule}
						<div class="form-group">
							<label for="project-select" class="form-label">
								Proiect
							</label>
							<select 
								id="project-select" 
								bind:value={selectedProjectId} 
								onchange={() => {
									if (selectedProjectId) {
										const project = getAvailableProjects().find(p => p.id === Number(selectedProjectId));
										if (project) {
											selectedProject = project.name;
											console.log('Project selected:', project.name, 'Module:', project.module_type);
										}
									} else {
										selectedProject = '';
										console.log('Project deselected');
									}
								}}
								class="form-select"
							>
								<option value="">Selectează proiect</option>
								{#each getAvailableProjects() as project}
									<option value={project.id}>{project.name}</option>
								{/each}
							</select>
							{#if getAvailableProjects().length === 0}
								<div class="no-projects-message">
									Nu există {selectedModule === 'proiecte' ? 'proiecte' : selectedModule === 'evom' ? 'EVOM-uri' : 'elemente operational'} pentru acest modul
								</div>
							{/if}
						</div>
					{/if}
					
					<!-- Descriere -->
					<div class="form-group">
						<label for="task-description" class="form-label">
							Descriere Task
						</label>
						<textarea 
							id="task-description"
							bind:value={taskDescription}
							placeholder="Descrie ce ai lucrat..."
							rows="4"
							required
							class="form-textarea"
						></textarea>
					</div>
					
					<!-- Ore -->
					<div class="form-group">
						<label for="task-hours" class="form-label">
							<Clock size={16} />
							Ore lucrate
						</label>
						<input 
							id="task-hours"
							type="number" 
							step="0.5" 
							min="0" 
							max="8"
							bind:value={taskHours}
							placeholder="Ex: 2.5"
							required
							class="form-input"
						/>
					</div>
					
					<!-- Submit Button -->
					<ModernButton 
						type="submit" 
						variant="primary" 
						size="lg" 
						fullWidth
						loading={loading}
						disabled={!selectedModule || !selectedProjectId || !taskDescription || !taskHours}
					>
						<Plus size={20} />
						{loading ? 'Se salvează...' : 'Adaugă Task'}
					</ModernButton>
				</form>
			</ModernCard>
			
			<!-- Preview Section -->
			{#if showPreview}
				<ModernCard variant="glass" class="preview-section">
					<div class="card-header">
						<h2 class="card-title">Previzualizare</h2>
						<CheckCircle size={20} class="preview-icon" />
					</div>
					<div class="preview-content">
						<div class="preview-item">
							<span class="preview-label">Data:</span>
							<span class="preview-value">{format(selectedDate, 'dd MMMM yyyy', { locale: ro })}</span>
						</div>
						<div class="preview-item">
							<span class="preview-label">Modul:</span>
							<span class="preview-value">{getSelectedModuleName()}</span>
						</div>
						<div class="preview-item">
							<span class="preview-label">Proiect:</span>
							<span class="preview-value">{getSelectedProjectName()}</span>
						</div>
						<div class="preview-item">
							<span class="preview-label">Descriere:</span>
							<span class="preview-value">{taskDescription || 'Nu este completată'}</span>
						</div>
						<div class="preview-item">
							<span class="preview-label">Ore:</span>
							<span class="preview-value">{taskHours || '0'} ore</span>
						</div>
					</div>
				</ModernCard>
			{/if}
		</div>
	</div>
</div>

<style>
	.modern-add-task-page {
		min-height: 100vh;
		background: var(--color-background);
		padding: var(--spacing-lg, 1.5rem);
	}
	
	.page-header {
		margin-bottom: var(--spacing-xl, 2rem);
	}
	
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--spacing-lg, 1.5rem);
	}
	
	.header-info {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-lg, 1.5rem);
	}
	
	.header-text {
		flex: 1;
	}
	
	.page-title {
		font-size: var(--font-typography-fontSize-3xl, 1.875rem);
		font-weight: var(--font-typography-fontWeight-bold, 700);
		color: var(--color-text);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}
	
	.page-subtitle {
		font-size: var(--font-typography-fontSize-lg, 1.125rem);
		color: var(--color-textSecondary);
		margin: 0;
	}
	
	.main-content {
		max-width: 1200px;
		margin: 0 auto;
	}
	
	.content-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-xl, 2rem);
	}
	
	.form-section {
		padding: var(--spacing-xl, 2rem);
	}
	
	.card-header {
		margin-bottom: var(--spacing-xl, 2rem);
	}
	
	.card-title {
		font-size: var(--font-typography-fontSize-2xl, 1.5rem);
		font-weight: var(--font-typography-fontWeight-semibold, 600);
		color: var(--color-text);
		margin-bottom: var(--spacing-lg, 1.5rem);
	}
	
	.form-progress {
		margin-top: var(--spacing-lg, 1.5rem);
	}
	
	.progress-steps {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
	}
	
	.progress-steps::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--color-border);
		z-index: 1;
	}
	
	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm, 0.5rem);
		position: relative;
		z-index: 2;
		background: var(--color-background);
		padding: 0 var(--spacing-sm, 0.5rem);
	}
	
	.step-number {
		width: 2rem;
		height: 2rem;
		border-radius: var(--radius-full, 9999px);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--font-typography-fontWeight-semibold, 600);
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		transition: all var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
	}
	
	.step.active .step-number {
		background: var(--color-primary);
		color: var(--color-textInverse);
	}
	
	.step.completed .step-number {
		background: var(--color-success);
		color: var(--color-textInverse);
	}
	
	.step:not(.active):not(.completed) .step-number {
		background: var(--color-surface);
		color: var(--color-textSecondary);
		border: 2px solid var(--color-border);
	}
	
	.step-label {
		font-size: var(--font-typography-fontSize-xs, 0.75rem);
		color: var(--color-textSecondary);
		font-weight: var(--font-typography-fontWeight-medium, 500);
	}
	
	.task-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg, 1.5rem);
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm, 0.5rem);
	}
	
	.form-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm, 0.5rem);
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		font-weight: var(--font-typography-fontWeight-medium, 500);
		color: var(--color-text);
	}
	
	.form-input,
	.form-select,
	.form-textarea {
		width: 100%;
		padding: var(--spacing-md, 1rem);
		font-family: inherit;
		font-size: var(--font-typography-fontSize-base, 1rem);
		color: var(--color-text);
		background: var(--color-input, var(--color-surface));
		border: 1px solid var(--color-inputBorder, var(--color-border));
		border-radius: var(--radius-md, 0.5rem);
		transition: all var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
		outline: none;
	}
	
	.form-input:focus,
	.form-select:focus,
	.form-textarea:focus {
		border-color: var(--color-inputFocus, var(--color-primary));
		box-shadow: 0 0 0 3px var(--color-shadowFocus, rgba(59, 130, 246, 0.1));
	}
	
	.form-textarea {
		resize: vertical;
		min-height: 6rem;
	}
	
	.form-select {
		cursor: pointer;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
		background-position: right var(--spacing-md, 1rem) center;
		background-repeat: no-repeat;
		background-size: 1rem;
		padding-right: var(--spacing-xl, 2rem);
	}
	
	.no-projects-message {
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		color: var(--color-textSecondary);
		padding: var(--spacing-md, 1rem);
		background: var(--color-surface);
		border-radius: var(--radius-md, 0.5rem);
		text-align: center;
		margin-top: var(--spacing-sm, 0.5rem);
	}
	
	.preview-section {
		padding: var(--spacing-xl, 2rem);
	}
	
	.preview-icon {
		color: var(--color-success);
	}
	
	.preview-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md, 1rem);
	}
	
	.preview-item {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--spacing-md, 1rem);
		padding: var(--spacing-md, 1rem);
		background: var(--color-surface);
		border-radius: var(--radius-md, 0.5rem);
	}
	
	.preview-label {
		font-weight: var(--font-typography-fontWeight-medium, 500);
		color: var(--color-textSecondary);
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		min-width: 80px;
	}
	
	.preview-value {
		font-weight: var(--font-typography-fontWeight-medium, 500);
		color: var(--color-text);
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		text-align: right;
		max-width: 60%;
		word-wrap: break-word;
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.modern-add-task-page {
			padding: var(--spacing-md, 1rem);
		}
		
		.header-content {
			flex-direction: column;
			align-items: stretch;
		}
		
		.header-info {
			flex-direction: column;
			gap: var(--spacing-md, 1rem);
		}
		
		.page-title {
			font-size: var(--font-typography-fontSize-2xl, 1.5rem);
		}
		
		.form-section,
		.preview-section {
			padding: var(--spacing-lg, 1.5rem);
		}
		
		.progress-steps {
			flex-direction: column;
			gap: var(--spacing-md, 1rem);
		}
		
		.progress-steps::before {
			display: none;
		}
	}
</style>