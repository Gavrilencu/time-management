<script lang="ts">
	import { onMount } from 'svelte';
	import { auditService, type AuditLog } from '$lib/api';
	import { currentUser } from '$lib/auth';
	import { notifications } from '$lib/notifications';
	import { Search, Filter, Download, Eye, User, Calendar, Activity } from 'lucide-svelte';

	let auditLogs: AuditLog[] = [];
	let auditStats: any = null;
	let loading = true;
	let currentPage = 0;
	let pageSize = 50;
	let selectedUser: number | null = null;
	let searchTerm = '';

	onMount(() => {
		loadAuditLogs();
		loadAuditStats();
	});

	async function loadAuditLogs() {
		try {
			loading = true;
			const logs = await auditService.getAuditLogs(currentPage * pageSize, pageSize, selectedUser || undefined);
			auditLogs = logs;
		} catch (error) {
			console.error('Error loading audit logs:', error);
			notifications.error('Eroare', 'Nu s-au putut încărca audit logs-urile');
		} finally {
			loading = false;
		}
	}

	async function loadAuditStats() {
		try {
			auditStats = await auditService.getAuditStats();
		} catch (error) {
			console.error('Error loading audit stats:', error);
		}
	}

	function getActionColor(action: string): string {
		switch (action) {
			case 'CREATE_USER':
			case 'CREATE_TASK':
			case 'CREATE_COMMENT':
				return 'success';
			case 'UPDATE_USER':
			case 'UPDATE_TASK':
				return 'warning';
			case 'DELETE_USER':
			case 'DELETE_TASK':
			case 'DELETE_COMMENT':
				return 'error';
			default:
				return 'primary';
		}
	}

	function getActionLabel(action: string): string {
		const labels: Record<string, string> = {
			'CREATE_USER': 'Utilizator creat',
			'UPDATE_USER': 'Utilizator actualizat',
			'DELETE_USER': 'Utilizator șters',
			'CREATE_TASK': 'Task creat',
			'UPDATE_TASK': 'Task actualizat',
			'DELETE_TASK': 'Task șters',
			'CREATE_COMMENT': 'Comentariu adăugat',
			'DELETE_COMMENT': 'Comentariu șters'
		};
		return labels[action] || action;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString('ro-RO');
	}

	function nextPage() {
		currentPage++;
		loadAuditLogs();
	}

	function prevPage() {
		if (currentPage > 0) {
			currentPage--;
			loadAuditLogs();
		}
	}

	function applyFilters() {
		currentPage = 0;
		loadAuditLogs();
	}

	function clearFilters() {
		selectedUser = null;
		searchTerm = '';
		currentPage = 0;
		loadAuditLogs();
	}

	const filteredLogs = auditLogs.filter(log => 
		!searchTerm || 
		log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
		log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
		(log.user_name && log.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
	);
</script>

<svelte:head>
	<title>Audit Logs - Admin</title>
</svelte:head>

<div class="audit-logs-container">
	<div class="page-header">
		<div class="header-content">
			<div class="title-section">
				<Activity size={32} />
				<h1>Audit Logs</h1>
				<p>Monitorizare activitate și securitate</p>
			</div>
		</div>
	</div>

	<!-- Statistici -->
	{#if auditStats}
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon">
				<Activity size={24} />
			</div>
			<div class="stat-content">
				<div class="stat-value">{auditStats.total_logs}</div>
				<div class="stat-label">Total Log-uri</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">
				<User size={24} />
			</div>
			<div class="stat-content">
				<div class="stat-value">{auditStats.user_stats.length}</div>
				<div class="stat-label">Utilizatori Activi</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">
				<Calendar size={24} />
			</div>
			<div class="stat-content">
				<div class="stat-value">{auditStats.action_stats.length}</div>
				<div class="stat-label">Tipuri Acțiuni</div>
			</div>
		</div>
	</div>
	{/if}

	<!-- Filtre -->
	<div class="filters-section">
		<div class="filters-grid">
			<div class="filter-group">
				<label for="search">Căutare</label>
				<div class="search-input">
					<Search size={16} />
					<input
						id="search"
						type="text"
						placeholder="Caută după acțiune, utilizator..."
						bind:value={searchTerm}
						on:input={applyFilters}
					/>
				</div>
			</div>

			<div class="filter-group">
				<label for="user-filter">Utilizator</label>
				<select id="user-filter" bind:value={selectedUser} on:change={applyFilters}>
					<option value={null}>Toți utilizatorii</option>
					{#if auditStats?.user_stats}
						{#each auditStats.user_stats as user}
							<option value={user.user_id}>{user.user}</option>
						{/each}
					{/if}
				</select>
			</div>

			<div class="filter-actions">
				<button class="btn-secondary" on:click={clearFilters}>
					<Filter size={16} />
					Resetează Filtrele
				</button>
			</div>
		</div>
	</div>

	<!-- Tabel Audit Logs -->
	<div class="table-container">
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Se încarcă audit logs-urile...</p>
			</div>
		{:else if filteredLogs.length === 0}
			<div class="empty-state">
				<Eye size={48} />
				<h3>Nu există audit logs</h3>
				<p>Nu s-au găsit log-uri care să corespundă criteriilor de căutare.</p>
			</div>
		{:else}
			<div class="table-wrapper">
				<table class="audit-table">
					<thead>
						<tr>
							<th>Data/Ora</th>
							<th>Utilizator</th>
							<th>Acțiune</th>
							<th>Entitate</th>
							<th>ID Entitate</th>
							<th>IP Address</th>
							<th>Detalii</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredLogs as log}
							<tr>
								<td class="date-cell">
									<div class="date-info">
										<span class="date">{formatDate(log.created_at || '').split(',')[0]}</span>
										<span class="time">{formatDate(log.created_at || '').split(',')[1]}</span>
									</div>
								</td>
								<td class="user-cell">
									<div class="user-info">
										<div class="user-avatar">
											{log.user_name?.charAt(0) || '?'}
										</div>
										<span class="user-name">{log.user_name || 'Sistem'}</span>
									</div>
								</td>
								<td class="action-cell">
									<span class="action-badge action-{getActionColor(log.action)}">
										{getActionLabel(log.action)}
									</span>
								</td>
								<td class="entity-cell">
									<span class="entity-type">{log.entity_type}</span>
								</td>
								<td class="id-cell">
									{log.entity_id || '-'}
								</td>
								<td class="ip-cell">
									{log.ip_address || '-'}
								</td>
								<td class="details-cell">
									{#if log.new_values || log.old_values}
										<button class="details-btn" on:click={() => {
											// TODO: Implement modal for details
											console.log('Details:', log);
										}}>
											<Eye size={16} />
											Vezi Detalii
										</button>
									{:else}
										-
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Paginare -->
			<div class="pagination">
				<button 
					class="btn-secondary" 
					on:click={prevPage} 
					disabled={currentPage === 0}
				>
					← Anterior
				</button>
				
				<span class="page-info">
					Pagina {currentPage + 1} • {filteredLogs.length} rezultate
				</span>
				
				<button 
					class="btn-secondary" 
					on:click={nextPage}
					disabled={filteredLogs.length < pageSize}
				>
					Următor →
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.audit-logs-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.title-section {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.title-section h1 {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.title-section p {
		margin: 0;
		color: var(--color-textSecondary);
		font-size: 1rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: var(--color-card);
		border: 1px solid var(--color-cardBorder);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		box-shadow: 0 2px 4px var(--color-shadow);
		transition: all 0.2s ease;
	}

	.stat-card:hover {
		box-shadow: 0 4px 8px var(--color-shadowHover);
		transform: translateY(-2px);
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		background: var(--color-primary);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text);
		line-height: 1;
	}

	.stat-label {
		color: var(--color-textSecondary);
		font-size: 0.875rem;
		font-weight: 500;
		margin-top: 0.25rem;
	}

	.filters-section {
		background: var(--color-card);
		border: 1px solid var(--color-cardBorder);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		box-shadow: 0 2px 4px var(--color-shadow);
	}

	.filters-grid {
		display: grid;
		grid-template-columns: 1fr 200px auto;
		gap: 1.5rem;
		align-items: end;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-group label {
		font-weight: 500;
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.search-input {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-input svg {
		position: absolute;
		left: 0.75rem;
		color: var(--color-textSecondary);
		z-index: 1;
	}

	.search-input input {
		padding-left: 2.5rem;
		/* Folosesc stilurile globale pentru input-uri */
	}

	.filter-actions {
		display: flex;
		gap: 0.75rem;
	}

	.table-container {
		background: var(--color-card);
		border: 1px solid var(--color-cardBorder);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 4px var(--color-shadow);
	}

	.loading-state, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
	}

	.loading-state .spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--color-border);
		border-top: 4px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-state svg {
		color: var(--color-textSecondary);
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		margin: 0 0 0.5rem 0;
		color: var(--color-text);
		font-size: 1.25rem;
	}

	.empty-state p {
		margin: 0;
		color: var(--color-textSecondary);
	}

	.table-wrapper {
		overflow-x: auto;
	}

	.audit-table {
		width: 100%;
		border-collapse: collapse;
	}

	.audit-table th {
		background: var(--color-tableHeader);
		color: var(--color-text);
		font-weight: 600;
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid var(--color-tableBorder);
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.audit-table td {
		padding: 1rem;
		border-bottom: 1px solid var(--color-tableBorder);
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.audit-table tr:hover td {
		background: var(--color-surface);
	}

	.date-cell {
		min-width: 120px;
	}

	.date-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.date {
		font-weight: 500;
		color: var(--color-text);
	}

	.time {
		font-size: 0.75rem;
		color: var(--color-textSecondary);
	}

	.user-cell {
		min-width: 150px;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.user-avatar {
		width: 32px;
		height: 32px;
		background: var(--color-primary);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.user-name {
		font-weight: 500;
		color: var(--color-text);
	}

	.action-cell {
		min-width: 140px;
	}

	.action-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.action-success {
		background: #dcfce7;
		color: #14532d;
	}

	.action-warning {
		background: #fef3c7;
		color: #92400e;
	}

	.action-error {
		background: #fee2e2;
		color: #991b1b;
	}

	.action-primary {
		background: #dbeafe;
		color: #1e40af;
	}

	.entity-cell {
		min-width: 100px;
	}

	.entity-type {
		font-weight: 500;
		color: var(--color-text);
		text-transform: capitalize;
	}

	.id-cell {
		min-width: 80px;
		text-align: center;
		font-family: monospace;
		color: var(--color-textSecondary);
	}

	.ip-cell {
		min-width: 120px;
		font-family: monospace;
		color: var(--color-textSecondary);
	}

	.details-cell {
		min-width: 120px;
	}

	.details-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-buttonSecondary);
		color: var(--color-text);
		border: none;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.details-btn:hover {
		background: var(--color-border);
		transform: translateY(-1px);
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-top: 1px solid var(--color-tableBorder);
		background: var(--color-tableHeader);
	}

	.page-info {
		color: var(--color-textSecondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.btn-secondary {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: var(--color-buttonSecondary);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-border);
		transform: translateY(-1px);
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.audit-logs-container {
			padding: 1rem;
		}

		.filters-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.table-wrapper {
			font-size: 0.75rem;
		}

		.audit-table th,
		.audit-table td {
			padding: 0.75rem 0.5rem;
		}

		.pagination {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}
	}
</style>
