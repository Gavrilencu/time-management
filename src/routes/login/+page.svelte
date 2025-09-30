<script lang="ts">
	import { onMount } from 'svelte';
	import { Clock, Shield, ArrowRight, RefreshCw, AlertCircle, CheckCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { currentUser, isAuthenticated, authLoading, setCurrentUser, clearCurrentUser, setAuthLoading } from '$lib/auth';
	import { getKerberosUser, kerberosLogout } from '$lib/kerberos';
	import { userService } from '$lib/api';
	import { notifications } from '$lib/notifications';
	import '$lib/app.css';

	let retryCount = $state(0);
	let authError = $state('');
	let isRetrying = $state(false);

	onMount(() => {
		// Nu redirecționa automat - permite utilizatorului să vadă pagina de login
		// if ($isAuthenticated) {
		// 	goto('/time-monitoring/');
		// }
	});

	async function authenticateWithKerberos() {
		try {
			isRetrying = true;
			authError = '';
			setAuthLoading(true);
			
			const kerberosData = await getKerberosUser();
			await authenticateUser(kerberosData);
			
			// Redirecționează la dashboard după autentificare reușită
			goto('/time-monitoring/');
		} catch (error) {
			console.error('Kerberos authentication failed:', error);
			authError = 'Nu s-a putut autentifica utilizatorul prin Kerberos.';
			retryCount++;
		} finally {
			setAuthLoading(false);
			isRetrying = false;
		}
	}

	async function authenticateUser(kerberosData: { username: string; email: string; displayName: string; department: string; domain?: string; groups?: string[] }) {
		try {
			// Verifică dacă utilizatorul există
			let user;
			try {
				user = await userService.getByEmail(kerberosData.email);
				
				// Actualizează informațiile utilizatorului cu datele Kerberos
				if (user.name !== kerberosData.displayName || user.department !== kerberosData.department) {
					user = await userService.update(user.id!, {
						...user,
						name: kerberosData.displayName,
						department: kerberosData.department
					});
				}
			} catch (error) {
				// Utilizatorul nu există, îl creez
				user = await userService.create({
					name: kerberosData.displayName,
					email: kerberosData.email,
					role: 'User',
					department: kerberosData.department
				});
				notifications.success('Utilizator creat', `Bun venit, ${kerberosData.displayName}!`);
			}

			if (user) {
				setCurrentUser(user);
				notifications.success('Autentificare reușită', `Bun venit, ${kerberosData.displayName}!`);
			}
		} catch (error) {
			console.error('Error authenticating user:', error);
			throw error;
		}
	}

	function handleRetry() {
		authenticateWithKerberos();
	}

	function handleRefresh() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Autentificare - KPI Time Tracker</title>
</svelte:head>

<div class="login-page">
	<div class="login-container">
		<div class="login-header">
			<div class="logo">
				<Clock size={48} />
			</div>
			<h1>KPI Time Tracker</h1>
			<p>Monitorizează timpul de lucru cu eficiență</p>
		</div>

		{#if $authLoading || isRetrying}
			<!-- Loading State -->
			<div class="auth-loading">
				<div class="loading-spinner">
					<div class="spinner"></div>
				</div>
				<h3>Se autentifică prin Kerberos...</h3>
				<p>Te rugăm să aștepți în timp ce verificăm credențialele tale.</p>
			</div>
		{:else if authError}
			<!-- Error State -->
			<div class="auth-error">
				<div class="error-icon">
					<AlertCircle size={48} />
				</div>
				<h3>Eroare la autentificare</h3>
				<p>{authError}</p>
				<div class="error-details">
					<p><strong>Posibile cauze:</strong></p>
					<ul>
						<li>Credențialele Kerberos nu sunt valide</li>
						<li>Conexiunea la serverul de autentificare este întreruptă</li>
						<li>Utilizatorul nu are permisiuni de acces</li>
					</ul>
				</div>
				<div class="error-actions">
					<button class="btn-retry" onclick={handleRetry} disabled={isRetrying}>
						<RefreshCw size={16} />
						{isRetrying ? 'Se încearcă...' : 'Încearcă din nou'}
					</button>
					<button class="btn-refresh" onclick={handleRefresh}>
						<RefreshCw size={16} />
						Reîncarcă pagina
					</button>
				</div>
			</div>
		{:else}
			<!-- Initial State -->
			<div class="auth-initial">
				<div class="auth-icon">
					<Shield size={48} />
				</div>
				<h3>Autentificare necesară</h3>
				<p>Pentru a accesa aplicația, trebuie să te autentifici prin Kerberos.</p>
				<div class="auth-info">
					<div class="info-item">
						<CheckCircle size={20} />
						<span>Autentificare securizată prin Kerberos</span>
					</div>
					<div class="info-item">
						<CheckCircle size={20} />
						<span>Acces automat la contul tău</span>
					</div>
					<div class="info-item">
						<CheckCircle size={20} />
						<span>Nu sunt necesare parole suplimentare</span>
					</div>
				</div>
				<button class="btn-login" onclick={authenticateWithKerberos}>
					<Shield size={20} />
					Autentifică-te prin Kerberos
					<ArrowRight size={16} />
				</button>
			</div>
		{/if}

		<div class="login-footer">
			<p>Dacă întâmpini probleme, contactează administratorul sistemului.</p>
			<div class="footer-links">
				<button onclick={() => goto('/time-monitoring/onboarding')}>Prima utilizare?</button>
				<span>•</span>
				<button onclick={() => window.open('mailto:support@company.com')}>Suport tehnic</button>
			</div>
		</div>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		position: relative;
		overflow: hidden;
	}

	.login-page::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
		opacity: 0.3;
		pointer-events: none;
	}

	.login-container {
		background: var(--color-card);
		border-radius: 20px;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		padding: 3rem;
		max-width: 500px;
		width: 100%;
		position: relative;
		z-index: 1;
		border: 1px solid var(--color-cardBorder);
	}

	.login-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.logo {
		width: 80px;
		height: 80px;
		background: var(--color-primary);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.5rem;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
	}

	.login-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.login-header p {
		color: var(--color-textSecondary);
		font-size: 1rem;
		margin: 0;
	}

	/* Loading State */
	.auth-loading {
		text-align: center;
		padding: 2rem 0;
	}

	.loading-spinner {
		margin-bottom: 1.5rem;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid var(--color-border);
		border-top: 4px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.auth-loading h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.auth-loading p {
		color: var(--color-textSecondary);
		margin: 0;
	}

	/* Error State */
	.auth-error {
		text-align: center;
		padding: 1rem 0;
	}

	.error-icon {
		color: var(--color-error);
		margin-bottom: 1rem;
	}

	.auth-error h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.auth-error p {
		color: var(--color-textSecondary);
		margin: 0 0 1.5rem 0;
	}

	.error-details {
		background: var(--color-surface);
		border-radius: 12px;
		padding: 1.5rem;
		margin: 1.5rem 0;
		text-align: left;
		border: 1px solid var(--color-border);
	}

	.error-details p {
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.75rem 0;
	}

	.error-details ul {
		margin: 0;
		padding-left: 1.25rem;
		color: var(--color-textSecondary);
	}

	.error-details li {
		margin-bottom: 0.25rem;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn-retry, .btn-refresh {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	.btn-retry {
		background: var(--color-primary);
		color: white;
	}

	.btn-retry:hover:not(:disabled) {
		background: var(--color-buttonHover);
		transform: translateY(-1px);
	}

	.btn-retry:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-refresh {
		background: var(--color-buttonSecondary);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-refresh:hover {
		background: var(--color-surface);
		transform: translateY(-1px);
	}

	/* Initial State */
	.auth-initial {
		text-align: center;
		padding: 1rem 0;
	}

	.auth-icon {
		color: var(--color-primary);
		margin-bottom: 1rem;
	}

	.auth-initial h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.auth-initial p {
		color: var(--color-textSecondary);
		margin: 0 0 1.5rem 0;
	}

	.auth-info {
		background: var(--color-surface);
		border-radius: 12px;
		padding: 1.5rem;
		margin: 1.5rem 0;
		text-align: left;
		border: 1px solid var(--color-border);
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		color: var(--color-text);
	}

	.info-item:last-child {
		margin-bottom: 0;
	}

	.info-item svg {
		color: var(--color-success);
		flex-shrink: 0;
	}

	.btn-login {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 12px;
		padding: 1rem 1.5rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: 1rem;
	}

	.btn-login:hover {
		background: var(--color-buttonHover);
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
	}

	.btn-login:active {
		transform: translateY(0);
	}

	/* Footer */
	.login-footer {
		text-align: center;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-border);
	}

	.login-footer p {
		color: var(--color-textSecondary);
		font-size: 0.875rem;
		margin: 0 0 1rem 0;
	}

	.footer-links {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		font-size: 0.875rem;
	}

	.footer-links button {
		background: none;
		border: none;
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.footer-links button:hover {
		color: var(--color-buttonHover);
		text-decoration: underline;
	}

	.footer-links span {
		color: var(--color-textSecondary);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.login-page {
			padding: 1rem;
		}

		.login-container {
			padding: 2rem;
		}

		.login-header h1 {
			font-size: 1.75rem;
		}

		.error-actions {
			flex-direction: column;
		}

		.btn-retry, .btn-refresh {
			width: 100%;
		}
	}
</style>
