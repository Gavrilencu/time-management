<script lang="ts">
	import { onMount } from 'svelte';
	import { User, Mail, Shield, ArrowRight, CheckCircle } from 'lucide-svelte';
	import { userService } from '$lib/api';
	import { notifications } from '$lib/notifications';
	import { goto } from '$app/navigation';

	let formData = $state({
		name: '',
		email: '',
		role: 'Developer'
	});

	let loading = $state(false);
	let hasUsers = $state(false);

	onMount(async () => {
		await checkExistingUsers();
	});

	async function checkExistingUsers() {
		try {
			const users = await userService.getAll();
			hasUsers = users.length > 0;
		} catch (error) {
			console.error('Error checking users:', error);
		}
	}

	async function createFirstUser() {
		if (!formData.name || !formData.email) {
			notifications.warning('Câmpuri incomplete', 'Te rog completează numele și email-ul!');
			return;
		}

		try {
			loading = true;
			await userService.create(formData);
			notifications.success('Succes', 'Primul utilizator a fost creat cu succes!');
			
			// Redirecționează la dashboard după 2 secunde
			setTimeout(() => {
				goto('/');
			}, 2000);
		} catch (error) {
			console.error('Error creating user:', error);
			notifications.error('Eroare', 'Eroare la crearea utilizatorului!');
		} finally {
			loading = false;
		}
	}
</script>

<div class="onboarding-page">
	<div class="onboarding-container">
		<div class="onboarding-header">
			<div class="logo">
				<User size={48} />
			</div>
			<h1>Bun venit în KPI Time Tracker</h1>
			<p>Hai să configurezi primul utilizator pentru a începe să monitorizezi timpul de lucru</p>
		</div>

		{#if hasUsers}
			<div class="existing-users">
				<CheckCircle size={24} />
				<h3>Utilizatori existenți</h3>
				<p>Aplicația are deja utilizatori configurați.</p>
				<button class="btn-primary" on:click={() => goto('/')}>
					Continuă la Dashboard
					<ArrowRight size={16} />
				</button>
			</div>
		{:else}
			<div class="setup-form">
				<h3>Creează primul utilizator</h3>
				<form on:submit|preventDefault={createFirstUser}>
					<div class="form-group">
						<label>
							<User size={16} />
							Nume complet
						</label>
						<input 
							type="text" 
							bind:value={formData.name}
							placeholder="Ex: Ion Popescu"
							required
						/>
					</div>

					<div class="form-group">
						<label>
							<Mail size={16} />
							Email
						</label>
						<input 
							type="email" 
							bind:value={formData.email}
							placeholder="Ex: ion@example.com"
							required
						/>
					</div>

					<div class="form-group">
						<label>
							<Shield size={16} />
							Rol
						</label>
						<select bind:value={formData.role}>
							<option value="Developer">Developer</option>
							<option value="Designer">Designer</option>
							<option value="Manager">Manager</option>
							<option value="QA">QA</option>
							<option value="DevOps">DevOps</option>
							<option value="Other">Altul</option>
						</select>
					</div>

					<button type="submit" class="btn-primary" disabled={loading}>
						{loading ? 'Se creează...' : 'Creează utilizator'}
						<ArrowRight size={16} />
					</button>
				</form>
			</div>
		{/if}

		<div class="onboarding-footer">
			<p>După crearea utilizatorului, vei putea:</p>
			<ul>
				<li>Adăuga proiecte și EVOM-uri</li>
				<li>Monitoriza timpul de lucru</li>
				<li>Vizualiza statistici</li>
				<li>Gestiona task-uri</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.onboarding-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.onboarding-container {
		background: white;
		border-radius: 16px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		padding: 3rem;
		max-width: 500px;
		width: 100%;
	}

	.onboarding-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.logo {
		width: 80px;
		height: 80px;
		background: #667eea;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.5rem;
	}

	.onboarding-header h1 {
		font-size: 1.875rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
	}

	.onboarding-header p {
		color: #6b7280;
		font-size: 1rem;
		margin: 0;
	}

	.setup-form h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1.5rem 0;
		text-align: center;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.btn-primary {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.875rem 1rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
		margin-top: 1rem;
	}

	.btn-primary:hover:not(:disabled) {
		background: #5a67d8;
	}

	.btn-primary:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.existing-users {
		text-align: center;
		padding: 2rem;
	}

	.existing-users svg {
		color: #10b981;
		margin-bottom: 1rem;
	}

	.existing-users h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
	}

	.existing-users p {
		color: #6b7280;
		margin: 0 0 1.5rem 0;
	}

	.onboarding-footer {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #e5e7eb;
	}

	.onboarding-footer p {
		font-weight: 500;
		color: #374151;
		margin: 0 0 0.75rem 0;
	}

	.onboarding-footer ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.onboarding-footer li {
		color: #6b7280;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
		padding-left: 1rem;
		position: relative;
	}

	.onboarding-footer li::before {
		content: "✓";
		position: absolute;
		left: 0;
		color: #10b981;
		font-weight: 600;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.onboarding-page {
			padding: 1rem;
		}

		.onboarding-container {
			padding: 2rem;
		}

		.onboarding-header h1 {
			font-size: 1.5rem;
		}
	}
</style>
