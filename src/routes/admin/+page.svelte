<script lang="ts">
	import { onMount } from "svelte";
	import { format } from "date-fns";
	import { ro } from "date-fns/locale";
import { 
	Users, 
	BarChart3, 
	Settings, 
	Plus, 
	Trash2, 
	Edit3, 
	Eye, 
	Clock,
	TrendingUp,
	Calendar,
	UserCheck,
	Database,
	Download,
	FileText,
	FileSpreadsheet,
	FileCode
} from "lucide-svelte";
	import { userService, projectService, taskService, statsService, exportService, type User, type Project, type Task } from '$lib/api';
import { notifications } from '$lib/notifications';

	// Starea aplicației
	let activeTab = $state("overview");
	let users: User[] = $state([]);
	let projects: Project[] = $state([]);
	let allTasks: Task[] = $state([]);
	let overviewStats = $state({
	total_users: 0,
	total_hours: 0,
	active_projects: 0,
	total_tasks: 0,
	top_user: { name: 'N/A', hours: 0 },
	average_hours_per_user: 0
});
	let selectedUser: User | null = $state(null);
	let showAddModal = $state(false);
	let newItem = $state({ name: "", type: "", description: "" });
	let exportLoading = $state(false);

	onMount(() => {
		// Încarcă datele în background pentru performanță mai bună
		loadAllDataInBackground();
	});

	async function loadAllDataInBackground() {
		try {
			// Încarcă statisticile mai întâi (pentru overview)
			overviewStats = await statsService.getOverview();
			
			// Apoi încarcă datele în paralel
			await Promise.all([
				loadUsers(),
				loadProjects(),
				loadTasks(),
				loadOverviewStats()
			]);
		} catch (error) {
			console.error('Error loading data:', error);
		}
	}

	// Funcția veche pentru compatibilitate
	async function loadAllData() {
		await loadAllDataInBackground();
	}

	async function loadUsers() {
		try {
			users = await userService.getAll();
		} catch (error) {
			console.error("Error loading users:", error);
		}
	}

	async function loadProjects() {
		try {
			projects = await projectService.getAll();
		} catch (error) {
			console.error("Error loading projects:", error);
		}
	}

	async function loadTasks() {
		try {
			allTasks = await taskService.getAll();
		} catch (error) {
			console.error("Error loading tasks:", error);
		}
	}

	async function loadOverviewStats() {
		try {
			overviewStats = await statsService.getOverview();
		} catch (error) {
			console.error("Error loading stats:", error);
		}
	}

async function addItem() {
if (!newItem.name) {
notifications.warning('Câmp incomplet', 'Te rog completează numele!');
return;
}

		try {
			await projectService.create({
				name: newItem.name,
				description: newItem.description,
				module_type: newItem.type
			});

			await loadProjects();
			newItem = { name: "", type: "", description: "" };
			showAddModal = false;
} catch (error) {
console.error("Error adding item:", error);
notifications.error('Eroare', 'Eroare la adăugarea elementului!');
}
	}

async function deleteItem(id: number) {
if (!confirm("Ești sigur că vrei să ștergi acest element?")) return;

try {
await projectService.delete(id);
await loadProjects();
notifications.success('Succes', 'Element șters cu succes!');
} catch (error) {
console.error("Error deleting item:", error);
notifications.error('Eroare', 'Eroare la ștergerea elementului!');
}
}

	function getUserTasks(userId: number) {
		return allTasks.filter(task => task.user_id === userId);
	}

	function getProjectsByType(moduleType: string) {
		return projects.filter(project => project.module_type === moduleType);
	}

	// Funcții de export
	async function exportJSON() {
		try {
			exportLoading = true;
			const data = await exportService.exportJSON();
			
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `kpi-export-${new Date().toISOString().split('T')[0]}.json`;
			a.click();
			URL.revokeObjectURL(url);
			
			notifications.success('Export JSON', 'Datele au fost exportate în JSON cu succes!');
		} catch (error) {
			console.error('Export JSON error:', error);
			notifications.error('Eroare Export', 'Eroare la exportarea în JSON!');
		} finally {
			exportLoading = false;
		}
	}

	async function exportXML() {
		try {
			exportLoading = true;
			const response = await exportService.exportXML();
			
			const blob = new Blob([response.xml], { type: 'application/xml' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `kpi-export-${new Date().toISOString().split('T')[0]}.xml`;
			a.click();
			URL.revokeObjectURL(url);
			
			notifications.success('Export XML', 'Datele au fost exportate în XML cu succes!');
		} catch (error) {
			console.error('Export XML error:', error);
			notifications.error('Eroare Export', 'Eroare la exportarea în XML!');
		} finally {
			exportLoading = false;
		}
	}

	async function exportExcel() {
		try {
			exportLoading = true;
			const blob = await exportService.exportExcel();
			
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `kpi-export-${new Date().toISOString().split('T')[0]}.xlsx`;
			a.click();
			URL.revokeObjectURL(url);
			
			notifications.success('Export Excel', 'Datele au fost exportate în Excel cu succes!');
		} catch (error) {
			console.error('Export Excel error:', error);
			notifications.error('Eroare Export', 'Eroare la exportarea în Excel!');
		} finally {
			exportLoading = false;
		}
	}
</script>

<div class="admin-page">
	<div class="admin-header">
		<div class="header-content">
			<div class="header-text">
				<h1>Admin Panel</h1>
				<p>Monitorizare completă și gestionare sistem</p>
			</div>
			<div class="export-buttons">
				<button class="export-btn json" onclick={exportJSON} disabled={exportLoading}>
					<FileText size={16} />
					JSON
				</button>
				<button class="export-btn xml" onclick={exportXML} disabled={exportLoading}>
					<FileCode size={16} />
					XML
				</button>
				<button class="export-btn excel" onclick={exportExcel} disabled={exportLoading}>
					<FileSpreadsheet size={16} />
					Excel
				</button>
			</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="admin-tabs">
		<button 
			class="tab-btn" 
			class:active={activeTab === "overview"}
			onclick={() => activeTab = "overview"}
		>
			<BarChart3 size={20} />
			Overview
		</button>
		<button 
			class="tab-btn" 
			class:active={activeTab === "users"}
			onclick={() => activeTab = "users"}
		>
			<Users size={20} />
			Utilizatori
		</button>
		<button 
			class="tab-btn" 
			class:active={activeTab === "projects"}
			onclick={() => activeTab = "projects"}
		>
			<Database size={20} />
			Proiecte
		</button>
		<button 
			class="tab-btn" 
			class:active={activeTab === "evoms"}
			onclick={() => activeTab = "evoms"}
		>
			<TrendingUp size={20} />
			EVOM-uri
		</button>
		<button 
			class="tab-btn" 
			class:active={activeTab === "operational"}
			onclick={() => activeTab = "operational"}
		>
			<Settings size={20} />
			Operational
		</button>
		<button 
			class="tab-btn" 
			class:active={activeTab === "tasks"}
			onclick={() => activeTab = "tasks"}
		>
			<Clock size={20} />
			Task-uri
		</button>
	</div>

	<!-- Content -->
	<div class="admin-content">
		{#if activeTab === "overview"}
			<div class="overview-section">
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-icon">
							<Users size={24} />
						</div>
						<div class="stat-info">
							<div class="stat-value">{overviewStats.total_users || 0}</div>
							<div class="stat-label">Utilizatori activi</div>
						</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">
							<Clock size={24} />
						</div>
						<div class="stat-info">
							<div class="stat-value">{Number(overviewStats.total_hours || 0).toFixed(1)}h</div>
							<div class="stat-label">Total ore lucrate</div>
						</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">
							<BarChart3 size={24} />
						</div>
						<div class="stat-info">
							<div class="stat-value">{Number(overviewStats.average_hours_per_user || 0).toFixed(1)}h</div>
							<div class="stat-label">Medie ore/user</div>
						</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">
							<UserCheck size={24} />
						</div>
						<div class="stat-info">
							<div class="stat-value">{overviewStats.top_user?.name || "N/A"}</div>
							<div class="stat-label">Cel mai activ</div>
						</div>
					</div>
				</div>

				<div class="recent-activity">
					<h3>Activitate Recentă</h3>
					<div class="activity-list">
						{#each allTasks.slice(0, 5) as task}
							<div class="activity-item">
								<div class="activity-info">
									<span class="user-name">{task.user_name}</span>
									<span class="task-desc">{task.description}</span>
									<span class="project-name">{task.project_name}</span>
								</div>
								<div class="activity-meta">
									<span class="hours">{task.hours}h</span>
									<span class="date">{format(new Date(task.date), "dd MMM", { locale: ro })}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

		{:else if activeTab === "users"}
			<div class="users-section">
				<div class="section-header">
					<h3>Utilizatori</h3>
					<button class="add-btn" onclick={() => showAddModal = true}>
						<Plus size={16} />
						Adaugă Utilizator
					</button>
				</div>
				<div class="users-grid">
					{#if users.length === 0}
						<div class="no-users">
							<p>Nu sunt utilizatori încărcați</p>
						</div>
					{:else}
						{#each users as user}
							<div class="user-card">
								<div class="user-card-header">
									<div class="user-avatar">
										{user.name.charAt(0)}
									</div>
									<div class="user-info">
										<h4>{user.name}</h4>
										<p>{user.email}</p>
										<span class="user-role">{user.role}</span>
									</div>
								</div>
								<div class="user-stats">
									<div class="total-hours">{user.total_hours || 0}h</div>
									<div class="tasks-count">{getUserTasks(user.id!).length} task-uri</div>
								</div>
								<div class="user-actions">
									<button class="action-btn view" onclick={() => selectedUser = user}>
										<Eye size={16} />
									</button>
									<button class="action-btn edit">
										<Edit3 size={16} />
									</button>
									<button class="action-btn delete">
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>

		{:else if activeTab === "projects"}
			<div class="items-section">
				<div class="section-header">
					<h3>Proiecte</h3>
					<button class="add-btn" onclick={() => { newItem.type = "proiecte"; showAddModal = true; }}>
						<Plus size={16} />
						Adaugă Proiect
					</button>
				</div>
				<div class="items-table">
					<div class="table-header">
						<div>Nume</div>
						<div>Descriere</div>
						<div>Status</div>
						<div>Ore</div>
						<div>Acțiuni</div>
					</div>
					{#each getProjectsByType("proiecte") as project}
						<div class="table-row">
							<div class="project-name">{project.name}</div>
							<div class="project-desc">{project.description}</div>
							<div class="project-status" class:active={project.status === "active"}>
								{project.status}
							</div>
							<div class="project-hours">{project.total_hours || 0}h</div>
							<div class="project-actions">
								<button class="action-btn edit">
									<Edit3 size={16} />
								</button>
								<button class="action-btn delete" onclick={() => deleteItem(project.id!)}>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>

		{:else if activeTab === "evoms"}
			<div class="items-section">
				<div class="section-header">
					<h3>EVOM-uri</h3>
					<button class="add-btn" onclick={() => { newItem.type = "evom"; showAddModal = true; }}>
						<Plus size={16} />
						Adaugă EVOM
					</button>
				</div>
				<div class="items-table">
					<div class="table-header">
						<div>Nume</div>
						<div>Descriere</div>
						<div>Status</div>
						<div>Ore</div>
						<div>Acțiuni</div>
					</div>
					{#each getProjectsByType("evom") as project}
						<div class="table-row">
							<div class="project-name">{project.name}</div>
							<div class="project-desc">{project.description}</div>
							<div class="project-status" class:active={project.status === "active"}>
								{project.status}
							</div>
							<div class="project-hours">{project.total_hours || 0}h</div>
							<div class="project-actions">
								<button class="action-btn edit">
									<Edit3 size={16} />
								</button>
								<button class="action-btn delete" onclick={() => deleteItem(project.id!)}>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>

		{:else if activeTab === "operational"}
			<div class="items-section">
				<div class="section-header">
					<h3>Operational</h3>
					<button class="add-btn" onclick={() => { newItem.type = "operational"; showAddModal = true; }}>
						<Plus size={16} />
						Adaugă Operational
					</button>
				</div>
				<div class="items-table">
					<div class="table-header">
						<div>Nume</div>
						<div>Descriere</div>
						<div>Status</div>
						<div>Ore</div>
						<div>Acțiuni</div>
					</div>
					{#each getProjectsByType("operational") as project}
						<div class="table-row">
							<div class="project-name">{project.name}</div>
							<div class="project-desc">{project.description}</div>
							<div class="project-status" class:active={project.status === "active"}>
								{project.status}
							</div>
							<div class="project-hours">{project.total_hours || 0}h</div>
							<div class="project-actions">
								<button class="action-btn edit">
									<Edit3 size={16} />
								</button>
								<button class="action-btn delete" onclick={() => deleteItem(project.id!)}>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>

		{:else if activeTab === "tasks"}
			<div class="tasks-section">
				<div class="section-header">
					<h3>Toate Task-urile</h3>
				</div>
				<div class="tasks-table">
					<div class="table-header">
						<div>Utilizator</div>
						<div>Proiect</div>
						<div>Descriere</div>
						<div>Ore</div>
						<div>Data</div>
					</div>
					{#each allTasks as task}
						<div class="table-row">
							<div class="task-user">{task.user_name}</div>
							<div class="task-project">{task.project_name}</div>
							<div class="task-desc">{task.description}</div>
							<div class="task-hours">{task.hours}h</div>
							<div class="task-date">{format(new Date(task.date), "dd MMM yyyy", { locale: ro })}</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Modal pentru adăugare -->
	{#if showAddModal}
		<div class="modal-overlay" onclick={() => showAddModal = false}>
			<div class="modal-content" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>Adaugă {newItem.type === "proiecte" ? "Proiect" : newItem.type === "evom" ? "EVOM" : "Operational"}</h3>
					<button class="close-btn" onclick={() => showAddModal = false}>×</button>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label>Nume</label>
						<input type="text" bind:value={newItem.name} placeholder="Numele elementului" />
					</div>
					<div class="form-group">
						<label>Descriere</label>
						<textarea bind:value={newItem.description} placeholder="Descrierea elementului" rows="3"></textarea>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn-cancel" onclick={() => showAddModal = false}>Anulează</button>
					<button class="btn-save" onclick={addItem}>Salvează</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.admin-page {
		max-width: 1400px;
		margin: 0 auto;
	}

	.admin-header {
		margin-bottom: 2rem;
	}

	.admin-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
	}

	.admin-header p {
		color: #6b7280;
		margin: 0;
	}

	.admin-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		background: white;
		padding: 0.5rem;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border: none;
		background: transparent;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: 500;
		color: #6b7280;
	}

	.tab-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.tab-btn.active {
		background: #2563eb;
		color: white;
	}

	.admin-content {
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		padding: 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 12px;
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		background: #2563eb;
		color: white;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
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

	.recent-activity h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1rem 0;
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.activity-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
	}

	.activity-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.user-name {
		font-weight: 600;
		color: #1f2937;
	}

	.task-desc {
		color: #374151;
		font-size: 0.875rem;
	}

	.project-name {
		color: #6b7280;
		font-size: 0.75rem;
	}

	.activity-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.hours {
		font-weight: 600;
		color: #059669;
	}

	.date {
		color: #6b7280;
		font-size: 0.75rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.section-header h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
	}

	.add-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.add-btn:hover {
		background: #1d4ed8;
	}

	.users-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1rem;
		max-width: 100%;
		overflow: hidden;
	}

	.user-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.25rem;
		background: #f9fafb;
		border-radius: 12px;
		border: 1px solid #e5e7eb;
		min-height: 180px;
		overflow: hidden;
		transition: all 0.2s;
	}

	.user-card:hover {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.user-card-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		background: #667eea;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 1rem;
		flex-shrink: 0;
	}

	.user-info {
		flex: 1;
		min-width: 0;
	}

	.user-info h4 {
		font-size: 0.95rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.25rem 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-info p {
		color: #6b7280;
		font-size: 0.8rem;
		margin: 0 0 0.25rem 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-role {
		background: #dbeafe;
		color: #1e40af;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 500;
		display: inline-block;
	}

	.user-stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-top: 1px solid #e5e7eb;
		border-bottom: 1px solid #e5e7eb;
	}

	.total-hours {
		font-size: 1.1rem;
		font-weight: 700;
		color: #059669;
	}

	.tasks-count {
		color: #6b7280;
		font-size: 0.75rem;
	}

	.user-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		padding-top: 0.5rem;
	}

	.action-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.action-btn.view {
		background: #dbeafe;
		color: #1e40af;
	}

	.action-btn.view:hover {
		background: #bfdbfe;
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

	.items-table, .tasks-table {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.table-header {
		display: grid;
		grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
		font-weight: 600;
		color: #374151;
	}

	.tasks-table .table-header {
		grid-template-columns: 1.5fr 1.5fr 2fr 1fr 1fr;
	}

	.table-row {
		display: grid;
		grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		align-items: center;
	}

	.tasks-table .table-row {
		grid-template-columns: 1.5fr 1.5fr 2fr 1fr 1fr;
	}

	.project-name {
		font-weight: 600;
		color: #1f2937;
	}

	.project-desc {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.project-status {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		text-align: center;
		background: #f3f4f6;
		color: #6b7280;
	}

	.project-status.active {
		background: #d1fae5;
		color: #065f46;
	}

	.project-hours {
		font-weight: 600;
		color: #059669;
		text-align: center;
	}

	.project-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.task-user {
		font-weight: 600;
		color: #1f2937;
	}

	.task-project {
		color: #2563eb;
		font-weight: 500;
	}

	.task-desc {
		color: #374151;
	}

	.task-hours {
		font-weight: 600;
		color: #059669;
		text-align: center;
	}

	.task-date {
		color: #6b7280;
		font-size: 0.875rem;
		text-align: center;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: background 0.2s;
	}

	.close-btn:hover {
		background: #f3f4f6;
	}

	.modal-body {
		padding: 1.5rem;
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

	.modal-footer {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.btn-cancel {
		padding: 0.75rem 1.5rem;
		border: 1px solid #d1d5db;
		background: white;
		color: #374151;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-cancel:hover {
		background: #f9fafb;
	}

	.btn-save {
		padding: 0.75rem 1.5rem;
		border: none;
		background: #2563eb;
		color: white;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.btn-save:hover {
		background: #1d4ed8;
	}

	.no-users {
		grid-column: 1 / -1;
		text-align: center;
		padding: 2rem;
		color: #6b7280;
	}

	.no-users p {
		margin: 0.5rem 0;
	}

	/* Export buttons */
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.export-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.export-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid #e5e7eb;
		background: white;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.export-btn:hover:not(:disabled) {
		background: #f9fafb;
		border-color: #d1d5db;
	}

	.export-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.export-btn.json {
		color: #059669;
		border-color: #10b981;
	}

	.export-btn.json:hover:not(:disabled) {
		background: #ecfdf5;
		border-color: #059669;
	}

	.export-btn.xml {
		color: #dc2626;
		border-color: #ef4444;
	}

	.export-btn.xml:hover:not(:disabled) {
		background: #fef2f2;
		border-color: #dc2626;
	}

	.export-btn.excel {
		color: #2563eb;
		border-color: #3b82f6;
	}

	.export-btn.excel:hover:not(:disabled) {
		background: #eff6ff;
		border-color: #2563eb;
	}

	/* Responsive pentru export buttons */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.export-buttons {
			justify-content: center;
		}

		.export-btn {
			flex: 1;
			justify-content: center;
		}
	}

	/* Responsive pentru utilizatori */
	@media (max-width: 768px) {
		.users-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.user-card {
			min-height: 160px;
			padding: 1rem;
		}

		.user-card-header {
			gap: 0.5rem;
		}

		.user-avatar {
			width: 36px;
			height: 36px;
			font-size: 0.9rem;
		}

		.user-info h4 {
			font-size: 0.9rem;
		}

		.user-info p {
			font-size: 0.75rem;
		}

		.user-role {
			font-size: 0.65rem;
			padding: 0.15rem 0.3rem;
		}

		.total-hours {
			font-size: 1rem;
		}

		.tasks-count {
			font-size: 0.7rem;
		}

		.action-btn {
			width: 28px;
			height: 28px;
		}
	}
</style>