<script lang="ts">
	import { onMount } from "svelte";
	import { format } from "date-fns";
	import { ro } from "date-fns/locale";
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/auth';
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
	FolderOpen,
	Briefcase,
	Cog,
	Activity,
	FileSpreadsheet,
	FileCode
} from "lucide-svelte";
	import { userService, projectService, taskService, statsService, exportService, departmentService, type User, type Project, type Task } from '$lib/api';
	import { notifications } from '$lib/notifications';

	// Verifică autorizarea admin
	onMount(() => {
		if (!$currentUser || $currentUser.role !== 'Admin') {
			notifications.error('Acces interzis', 'Nu ai permisiuni de administrator!');
			goto('/time-management/');
			return;
		}
		loadAllDataInBackground();
	});

	// Starea aplicației
	let activeTab = $state("overview");
	let users: User[] = $state([]);
	let projects: Project[] = $state([]);
	let allTasks: Task[] = $state([]);
	let departments: string[] = $state([]);
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
	let showEditModal = $state(false);
	let editingUser: User | null = $state(null);
	let newItem = $state({ 
		name: "", 
		type: "", 
		description: "",
		module_type: "proiecte",
		visibility_type: "all",
		visible_departments: []
	});
	let exportLoading = $state(false);

	async function loadAllDataInBackground() {
		try {
			// Încarcă statisticile mai întâi (pentru overview)
			overviewStats = await statsService.getOverview();
			
			// Apoi încarcă datele în paralel
			await Promise.all([
				loadUsers(),
				loadProjects(),
				loadTasks(),
				loadDepartments(),
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

	async function loadDepartments() {
		try {
			departments = await departmentService.getAll();
		} catch (error) {
			console.error('Error loading departments:', error);
		}
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
			module_type: newItem.module_type,
			visibility_type: newItem.visibility_type,
			visible_departments: newItem.visible_departments
		});

		await loadProjects();
		newItem = { 
			name: "", 
			type: "", 
			description: "",
			module_type: "proiecte",
			visibility_type: "all",
			visible_departments: []
		};
		showAddModal = false;
		notifications.success('Succes', 'Element adăugat cu succes!');
	} catch (error) {
		console.error("Error adding item:", error);
		notifications.error('Eroare', 'Eroare la adăugarea elementului!');
	}
}

// Funcții pentru confirmarea ștergerii
let showDeleteModal = $state(false);
let itemToDelete: { id: number; name: string; type: string } | null = $state(null);

function confirmDelete(id: number, name: string, type: string) {
	itemToDelete = { id, name, type };
	showDeleteModal = true;
}

async function deleteItem(id: number) {
	if (!itemToDelete) return;

	try {
		await projectService.delete(id);
		await loadProjects();
		showDeleteModal = false;
		itemToDelete = null;
		notifications.success('Succes', 'Element șters cu succes!');
	} catch (error) {
		console.error("Error deleting item:", error);
		notifications.error('Eroare', 'Eroare la ștergerea elementului!');
	}
}

// Funcții pentru editarea proiectelor
let showEditProjectModal = $state(false);
let editingProject: Project | null = $state(null);

function editProject(project: Project) {
	editingProject = { ...project };
	showEditProjectModal = true;
}

async function updateProject() {
	if (!editingProject) return;

	try {
		await projectService.update(editingProject.id!, editingProject);
		await loadProjects();
		showEditProjectModal = false;
		editingProject = null;
		notifications.success('Succes', 'Proiect actualizat cu succes!');
	} catch (error) {
		console.error("Error updating project:", error);
		notifications.error('Eroare', 'Eroare la actualizarea proiectului!');
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

	// Funcții pentru gestionarea utilizatorilor
	function editUser(user: User) {
		editingUser = { ...user };
		showEditModal = true;
	}

	async function updateUser() {
		if (!editingUser) return;
		
		try {
			await userService.update(editingUser.id!, editingUser);
			await loadUsers();
			showEditModal = false;
			editingUser = null;
			notifications.success('Utilizator actualizat', 'Utilizatorul a fost actualizat cu succes!');
		} catch (error) {
			console.error('Error updating user:', error);
			notifications.error('Eroare', 'Eroare la actualizarea utilizatorului!');
		}
	}

// Funcții pentru confirmarea ștergerii utilizatorilor
let showDeleteUserModal = $state(false);
let userToDelete: User | null = $state(null);

function confirmDeleteUser(user: User) {
	userToDelete = user;
	showDeleteUserModal = true;
}

async function deleteUserConfirmed() {
	if (!userToDelete) return;
	
	try {
		await userService.delete(userToDelete.id!);
		await loadUsers();
		showDeleteUserModal = false;
		userToDelete = null;
		notifications.success('Utilizator șters', 'Utilizatorul a fost șters cu succes!');
	} catch (error) {
		console.error('Error deleting user:', error);
		notifications.error('Eroare', 'Eroare la ștergerea utilizatorului!');
	}
}

async function deleteUser(userId: number) {
	// Această funcție nu mai este folosită direct
	// Folosim confirmDeleteUser în schimb
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
			<FolderOpen size={20} />
			Proiecte
		</button>
		<button 
			class="tab-btn" 
			class:active={activeTab === "evoms"}
			onclick={() => activeTab = "evoms"}
		>
			<Briefcase size={20} />
			EVOM-uri
		</button>
		<button 
			class="tab-btn" 
			class:active={activeTab === "operational"}
			onclick={() => activeTab = "operational"}
		>
			<Activity size={20} />
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
		<button 
			class="tab-btn" 
			class:active={activeTab === "audit"}
			onclick={() => activeTab = "audit"}
		>
			<Eye size={20} />
			Audit Logs
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
Тг							<div class="stat-value">{Number(overviewStats.total_hours || 0).toFixed(1)}h</div>
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
									<button class="action-btn edit" onclick={() => editUser(user)}>
										<Edit3 size={16} />
									</button>
									<button class="action-btn delete" onclick={() => confirmDeleteUser(user)}>
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
					<button class="add-btn" onclick={() => { newItem.module_type = "proiecte"; showAddModal = true; }}>
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
								<button class="action-btn edit" onclick={() => editProject(project)}>
									<Edit3 size={16} />
								</button>
								<button class="action-btn delete" onclick={() => confirmDelete(project.id!, project.name, 'proiect')}>
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
					<button class="add-btn" onclick={() => { newItem.module_type = "evom"; showAddModal = true; }}>
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
								<button class="action-btn edit" onclick={() => editProject(project)}>
									<Edit3 size={16} />
								</button>
								<button class="action-btn delete" onclick={() => confirmDelete(project.id!, project.name, 'proiect')}>
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
					<button class="add-btn" onclick={() => { newItem.module_type = "operational"; showAddModal = true; }}>
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
								<button class="action-btn edit" onclick={() => editProject(project)}>
									<Edit3 size={16} />
								</button>
								<button class="action-btn delete" onclick={() => confirmDelete(project.id!, project.name, 'proiect')}>
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

		{:else if activeTab === "audit"}
			<div class="audit-section">
				<div class="section-header">
					<h3>Audit Logs</h3>
					<p>Monitorizare activitate și securitate</p>
				</div>
				<div class="audit-redirect">
					<div class="audit-card">
						<Eye size={48} />
						<h4>Audit Logs Complet</h4>
						<p>Accesează pagina dedicată pentru audit logs cu filtre avansate și statistici detaliate.</p>
						<button class="audit-btn" onclick={() => window.location.href = '/admin/audit-logs'}>
							Accesează Audit Logs
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Modal pentru adăugare -->
	{#if showAddModal}
		<div class="modal-overlay" onclick={() => showAddModal = false}>
			<div class="modal-content" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>Adaugă {newItem.module_type === "proiecte" ? "Proiect" : newItem.module_type === "evom" ? "EVOM" : "Operational"}</h3>
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
					<div class="form-group">
						<label>Modul:</label>
						<select bind:value={newItem.module_type}>
							<option value="proiecte">Proiecte</option>
							<option value="evom">EVOM</option>
							<option value="operational">Operational</option>
						</select>
					</div>
					<div class="form-group">
						<label>Tip vizibilitate:</label>
						<select bind:value={newItem.visibility_type}>
							<option value="all">Toate departamentele</option>
							<option value="specific_departments">Departamente specifice</option>
							<option value="private">Privat (doar admin)</option>
						</select>
					</div>
					{#if newItem.visibility_type === 'specific_departments'}
					<div class="form-group">
						<label>Departamente vizibile:</label>
						<div class="department-checkboxes">
							{#each departments as department}
							<label class="checkbox-label">
								<input 
									type="checkbox" 
									checked={newItem.visible_departments?.includes(department) || false}
									onchange={(e) => {
										if (!newItem.visible_departments) newItem.visible_departments = [];
										if (e.target.checked) {
											if (!newItem.visible_departments.includes(department)) {
												newItem.visible_departments.push(department);
											}
										} else {
											newItem.visible_departments = newItem.visible_departments.filter(d => d !== department);
										}
									}}
								/>
								<span>{department}</span>
							</label>
							{/each}
						</div>
					</div>
					{/if}
				</div>
				<div class="modal-footer">
					<button class="btn-cancel" onclick={() => showAddModal = false}>Anulează</button>
					<button class="btn-save" onclick={addItem}>Salvează</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Modal pentru editarea utilizatorilor -->
{#if showEditModal && editingUser}
	<div class="edit-modal" onclick={(e) => e.target === e.currentTarget && (showEditModal = false)}>
		<div class="edit-modal-content">
			<h3>Editează Utilizator</h3>
			<div class="edit-form-group">
				<label for="edit-name">Nume:</label>
				<input 
					id="edit-name"
					type="text" 
					bind:value={editingUser.name}
					placeholder="Numele utilizatorului"
				/>
			</div>
			<div class="edit-form-group">
				<label for="edit-email">Email:</label>
				<input 
					id="edit-email"
					type="email" 
					bind:value={editingUser.email}
					placeholder="email@example.com"
				/>
			</div>
			<div class="edit-form-group">
				<label for="edit-department">Department:</label>
				<input 
					id="edit-department"
					type="text" 
					bind:value={editingUser.department}
					placeholder="Department"
				/>
			</div>
			<div class="edit-form-group">
				<label for="edit-role">Rol:</label>
				<select id="edit-role" bind:value={editingUser.role}>
					<option value="User">User</option>
					<option value="Admin">Admin</option>
				</select>
			</div>
			<div class="edit-modal-actions">
				<button class="cancel-btn" onclick={() => showEditModal = false}>
					Anulează
				</button>
				<button class="save-btn" onclick={updateUser}>
					Salvează
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal pentru editarea proiectelor -->
{#if showEditProjectModal && editingProject}
	<div class="edit-modal" onclick={(e) => e.target === e.currentTarget && (showEditProjectModal = false)}>
		<div class="edit-modal-content">
			<h3>Editează Proiect</h3>
			<div class="edit-form-group">
				<label for="edit-project-name">Nume:</label>
				<input 
					id="edit-project-name"
					type="text" 
					bind:value={editingProject.name}
					placeholder="Numele proiectului"
				/>
			</div>
			<div class="edit-form-group">
				<label for="edit-project-desc">Descriere:</label>
				<textarea 
					id="edit-project-desc"
					bind:value={editingProject.description}
					placeholder="Descrierea proiectului"
					rows="3"
				></textarea>
			</div>
			<div class="edit-form-group">
				<label for="edit-project-status">Status:</label>
				<select id="edit-project-status" bind:value={editingProject.status}>
					<option value="active">Activ</option>
					<option value="inactive">Inactiv</option>
					<option value="completed">Completat</option>
				</select>
			</div>
			<div class="edit-form-group">
				<label for="edit-project-module">Modul:</label>
				<select id="edit-project-module" bind:value={editingProject.module_type}>
					<option value="proiecte">Proiecte</option>
					<option value="evom">EVOM</option>
					<option value="operational">Operational</option>
				</select>
			</div>
			<div class="edit-form-group">
				<label for="edit-project-visibility">Tip vizibilitate:</label>
				<select id="edit-project-visibility" bind:value={editingProject.visibility_type}>
					<option value="all">Toate departamentele</option>
					<option value="specific_departments">Departamente specifice</option>
					<option value="private">Privat (doar admin)</option>
				</select>
			</div>
			{#if editingProject.visibility_type === 'specific_departments'}
			<div class="edit-form-group">
				<label>Departamente vizibile:</label>
				<div class="department-checkboxes">
					{#each departments as department}
					<label class="checkbox-label">
						<input 
							type="checkbox" 
							checked={editingProject.visible_departments?.includes(department) || false}
							onchange={(e) => {
								if (!editingProject.visible_departments) editingProject.visible_departments = [];
								if (e.target.checked) {
									if (!editingProject.visible_departments.includes(department)) {
										editingProject.visible_departments.push(department);
									}
								} else {
									editingProject.visible_departments = editingProject.visible_departments.filter(d => d !== department);
								}
							}}
						/>
						<span>{department}</span>
					</label>
					{/each}
				</div>
			</div>
			{/if}
			<div class="edit-modal-actions">
				<button class="cancel-btn" onclick={() => showEditProjectModal = false}>
					Anulează
				</button>
				<button class="save-btn" onclick={updateProject}>
					Salvează
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal pentru confirmarea ștergerii utilizatorilor -->
{#if showDeleteUserModal && userToDelete}
	<div class="delete-modal" onclick={(e) => e.target === e.currentTarget && (showDeleteUserModal = false)}>
		<div class="delete-modal-content">
			<div class="delete-icon">
				<Trash2 size={48} />
			</div>
			<h3>Confirmă ștergerea utilizatorului</h3>
			<p>Ești sigur că vrei să ștergi utilizatorul <strong>{userToDelete.name}</strong>?</p>
			<p class="delete-warning">Această acțiune nu poate fi anulată!</p>
			<div class="delete-modal-actions">
				<button class="cancel-btn" onclick={() => showDeleteUserModal = false}>
					Anulează
				</button>
				<button class="delete-btn" onclick={deleteUserConfirmed}>
					Șterge definitiv
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal pentru confirmarea ștergerii -->
{#if showDeleteModal && itemToDelete}
	<div class="delete-modal" onclick={(e) => e.target === e.currentTarget && (showDeleteModal = false)}>
		<div class="delete-modal-content">
			<div class="delete-icon">
				<Trash2 size={48} />
			</div>
			<h3>Confirmă ștergerea</h3>
			<p>Ești sigur că vrei să ștergi <strong>{itemToDelete.name}</strong>?</p>
			<p class="delete-warning">Această acțiune nu poate fi anulată!</p>
			<div class="delete-modal-actions">
				<button class="cancel-btn" onclick={() => showDeleteModal = false}>
					Anulează
				</button>
				<button class="delete-btn" onclick={() => deleteItem(itemToDelete!.id)}>
					Șterge definitiv
				</button>
			</div>
		</div>
	</div>
{/if}

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
	color: var(--color-text);
	margin: 0 0 0.5rem 0;
}

.admin-header p {
	color: var(--color-textSecondary);
	margin: 0;
}

.admin-tabs {
	display: flex;
	gap: 0.5rem;
	margin-bottom: 2rem;
	background: var(--color-card);
	padding: 0.5rem;
	border-radius: 12px;
	box-shadow: 0 1px 3px var(--color-shadow);
	border: 1px solid var(--color-cardBorder);
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
		color: var(--color-textSecondary);
	}

	.tab-btn:hover {
		background: var(--color-surface);
		color: var(--color-text);
	}

	.tab-btn.active {
		background: var(--color-primary);
		color: white;
	}

.admin-content {
	background: var(--color-card);
	border-radius: 12px;
	box-shadow: 0 1px 3px var(--color-shadow);
	border: 1px solid var(--color-cardBorder);
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
		background: var(--color-card);
		border-radius: 12px;
		border: 1px solid var(--color-cardBorder);
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		background: var(--color-primary);
		color: white;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

.stat-value {
	font-size: 1.5rem;
	font-weight: 700;
	color: var(--color-text);
	margin-bottom: 0.25rem;
}

.stat-label {
	font-size: 0.875rem;
	color: var(--color-textSecondary);
}

.recent-activity h3 {
	font-size: 1.25rem;
	font-weight: 600;
	color: var(--color-text);
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
		background: var(--color-card);
		border-radius: 8px;
		border: 1px solid var(--color-cardBorder);
	}

	.activity-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.user-name {
		font-weight: 600;
		color: var(--color-text);
	}

	.task-desc {
		color: var(--color-textSecondary);
		font-size: 0.875rem;
	}

	.project-name {
		color: var(--color-textSecondary);
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
		color: var(--color-success);
	}

	.date {
		color: var(--color-textSecondary);
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
	color: var(--color-text);
	margin: 0;
}

	.add-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.add-btn:hover {
		background: var(--color-buttonHover);
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
		background: var(--color-card);
		border-radius: 12px;
		border: 1px solid var(--color-cardBorder);
		min-height: 180px;
		overflow: hidden;
		transition: all 0.2s;
	}

	.user-card:hover {
		box-shadow: 0 4px 6px -1px var(--color-shadowHover);
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
		color: var(--color-text);
		margin: 0 0 0.25rem 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-info p {
		color: var(--color-textSecondary);
		font-size: 0.8rem;
		margin: 0 0 0.25rem 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-role {
		background: var(--color-badge);
		color: var(--color-badgeText);
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
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
	}

	.total-hours {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--color-success);
	}

	.tasks-count {
		color: var(--color-textSecondary);
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
		background: var(--color-badge);
		color: var(--color-badgeText);
	}

	.action-btn.view:hover {
		background: var(--color-primary);
		color: white;
	}

	.action-btn.edit {
		background: var(--color-warning);
		color: white;
	}

	.action-btn.edit:hover {
		background: var(--color-warning);
		opacity: 0.9;
	}

	.action-btn.delete {
		background: var(--color-error);
		color: white;
	}

	.action-btn.delete:hover {
		background: var(--color-error);
		opacity: 0.9;
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
		background: var(--color-tableHeader);
		border-radius: 8px;
		font-weight: 600;
		color: var(--color-text);
	}

	.tasks-table .table-header {
		grid-template-columns: 1.5fr 1.5fr 2fr 1fr 1fr;
	}

	.table-row {
		display: grid;
		grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--color-tableBorder);
		border-radius: 8px;
		align-items: center;
		background: var(--color-tableRow);
	}

	.tasks-table .table-row {
		grid-template-columns: 1.5fr 1.5fr 2fr 1fr 1fr;
	}

	.project-name {
		font-weight: 600;
		color: var(--color-text);
	}

	.project-desc {
		color: var(--color-textSecondary);
		font-size: 0.875rem;
	}

	.project-status {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		text-align: center;
		background: var(--color-buttonSecondary);
		color: var(--color-textSecondary);
	}

	.project-status.active {
		background: var(--color-success);
		color: white;
	}

	.project-hours {
		font-weight: 600;
		color: var(--color-success);
		text-align: center;
	}

	.project-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.task-user {
		font-weight: 600;
		color: var(--color-text);
	}

	.task-project {
		color: var(--color-primary);
		font-weight: 500;
	}

	.task-desc {
		color: var(--color-textSecondary);
	}

	.task-hours {
		font-weight: 600;
		color: var(--color-success);
		text-align: center;
	}

	.task-date {
		color: var(--color-textSecondary);
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
		background: var(--color-modal);
		border-radius: 12px;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
		border: 1px solid var(--color-cardBorder);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.modal-header h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
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
		color: var(--color-text);
		margin-bottom: 0.5rem;
	}

	/* Folosesc stilurile globale pentru input-uri și textarea */
	.form-group input,
	.form-group textarea {
		/* Stilurile sunt definite în app.css */
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
		border: 1px solid var(--color-border);
		background: var(--color-buttonSecondary);
		color: var(--color-text);
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-cancel:hover {
		background: var(--color-surface);
	}

	.btn-save {
		padding: 0.75rem 1.5rem;
		border: none;
		background: var(--color-primary);
		color: white;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.btn-save:hover {
		background: var(--color-buttonHover);
	}

	.no-users {
		grid-column: 1 / -1;
		text-align: center;
		padding: 2rem;
		color: var(--color-textSecondary);
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
		border: 1px solid var(--color-border);
		background: var(--color-card);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
		color: var(--color-text);
	}

	.export-btn:hover:not(:disabled) {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	.export-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.export-btn.json {
		color: var(--color-success);
		border-color: var(--color-success);
	}

	.export-btn.json:hover:not(:disabled) {
		background: var(--color-success);
		color: white;
	}

	.export-btn.xml {
		color: var(--color-error);
		border-color: var(--color-error);
	}

	.export-btn.xml:hover:not(:disabled) {
		background: var(--color-error);
		color: white;
	}

	.export-btn.excel {
		color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.export-btn.excel:hover:not(:disabled) {
		background: var(--color-primary);
		color: white;
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

	/* Modal pentru editarea utilizatorilor */
	.edit-modal {
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

	.edit-modal-content {
		background: var(--color-modal);
		border-radius: 12px;
		padding: 2rem;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
		border: 1px solid var(--color-cardBorder);
	}

	.edit-modal h3 {
		margin: 0 0 1.5rem 0;
		color: var(--color-text);
		font-size: 1.5rem;
	}

	.edit-form-group {
		margin-bottom: 1rem;
	}

	.edit-form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--color-text);
	}

	/* Folosesc stilurile globale pentru input-uri și select */
	.edit-form-group input,
	.edit-form-group select {
		/* Stilurile sunt definite în app.css */
	}

	.edit-modal-actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		justify-content: flex-end;
	}

	.edit-modal-actions button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.edit-modal-actions .cancel-btn {
		background: var(--color-buttonSecondary);
		color: var(--color-text);
	}

	.edit-modal-actions .cancel-btn:hover {
		background: var(--color-surface);
	}

	.edit-modal-actions .save-btn {
		background: var(--color-primary);
		color: white;
	}

	.edit-modal-actions .save-btn:hover {
		background: var(--color-buttonHover);
	}

	/* Modal pentru confirmarea ștergerii */
	.delete-modal {
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

	.delete-modal-content {
		background: var(--color-modal);
		border-radius: 12px;
		padding: 2rem;
		max-width: 400px;
		width: 90%;
		text-align: center;
		box-shadow: 0 20px 25px -5px var(--color-shadow);
		border: 1px solid var(--color-cardBorder);
	}

	.delete-icon {
		color: var(--color-error);
		margin-bottom: 1rem;
	}

	.delete-modal-content h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.5rem;
	}

	.delete-modal-content p {
		color: var(--color-textSecondary);
		margin-bottom: 0.5rem;
	}

	.delete-warning {
		color: var(--color-error) !important;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.delete-modal-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
		justify-content: center;
	}

	.delete-btn {
		background: var(--color-error);
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.75rem 1.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.delete-btn:hover {
		background: var(--color-error);
		opacity: 0.9;
	}

	/* Audit section styles */
	.audit-section {
		text-align: center;
	}

	.audit-redirect {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
	}

	.audit-card {
		background: var(--color-card);
		border: 1px solid var(--color-cardBorder);
		border-radius: 12px;
		padding: 3rem 2rem;
		max-width: 500px;
		text-align: center;
		box-shadow: 0 4px 6px -1px var(--color-shadow);
	}

	.audit-card svg {
		color: var(--color-primary);
		margin-bottom: 1rem;
	}

	.audit-card h4 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 1rem 0;
	}

	.audit-card p {
		color: var(--color-textSecondary);
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	.audit-btn {
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 2rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
		font-size: 1rem;
	}

	.audit-btn:hover {
		background: var(--color-buttonHover);
		transform: translateY(-1px);
	}

	/* Stiluri pentru checkbox-uri departamente */
	.department-checkboxes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.checkbox-label:hover {
		background-color: var(--color-surface);
	}

	.checkbox-label input[type="checkbox"] {
		margin: 0;
		width: 16px;
		height: 16px;
	}

	.checkbox-label span {
		font-size: 0.875rem;
		color: var(--color-text);
	}
</style>