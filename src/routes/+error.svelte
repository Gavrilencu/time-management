<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Home, ArrowLeft, RefreshCw, Search, AlertTriangle, Clock } from 'lucide-svelte';

	let errorCode = $state(404);
	let errorMessage = $state('Pagina nu a fost găsită');
	let errorDescription = $state('Se pare că pagina pe care o cauți nu există sau a fost mutată.');
	let suggestions = $state([
		'Verifică dacă URL-ul este corect',
		'Încearcă să actualizezi pagina',
		'Revino la pagina principală',
		'Contactează administratorul dacă problema persistă'
	]);

	onMount(() => {
		// Determină tipul de eroare bazat pe status
		const status = $page.status;
		if (status) {
			errorCode = status;
			switch (status) {
				case 404:
					errorMessage = 'Pagina nu a fost găsită';
					errorDescription = 'Se pare că pagina pe care o cauți nu există sau a fost mutată.';
					suggestions = [
						'Verifică dacă URL-ul este corect',
						'Încearcă să actualizezi pagina',
						'Revino la pagina principală',
						'Contactează administratorul dacă problema persistă'
					];
					break;
				case 500:
					errorMessage = 'Eroare internă a serverului';
					errorDescription = 'A apărut o problemă tehnică pe server. Echipa noastră a fost notificată.';
					suggestions = [
						'Încearcă din nou în câteva minute',
						'Verifică conexiunea la internet',
						'Contactează suportul tehnic',
						'Revino la pagina principală'
					];
					break;
				case 403:
					errorMessage = 'Acces interzis';
					errorDescription = 'Nu ai permisiuni pentru a accesa această pagină.';
					suggestions = [
						'Verifică dacă ai permisiunile necesare',
						'Contactează administratorul',
						'Revino la pagina principală',
						'Verifică dacă ești autentificat'
					];
					break;
				default:
					errorMessage = 'Eroare neașteptată';
					errorDescription = 'A apărut o problemă neașteptată.';
					suggestions = [
						'Încearcă să actualizezi pagina',
						'Verifică conexiunea la internet',
						'Contactează suportul tehnic',
						'Revino la pagina principală'
					];
			}
		}
	});

	function goHome() {
		goto('/time-management/');
	}

	function goBack() {
		history.back();
	}

	function refreshPage() {
		window.location.reload();
	}

	function getErrorIcon() {
		switch (errorCode) {
			case 404:
				return Search;
			case 500:
				return AlertTriangle;
			case 403:
				return AlertTriangle;
			default:
				return AlertTriangle;
		}
	}

	function getErrorColor() {
		switch (errorCode) {
			case 404:
				return 'var(--color-warning)';
			case 500:
				return 'var(--color-error)';
			case 403:
				return 'var(--color-error)';
			default:
				return 'var(--color-error)';
		}
	}
</script>

<svelte:head>
	<title>{errorCode} - {errorMessage} | KPI Time Tracker</title>
</svelte:head>

<div class="error-page">
	<div class="error-container">
		<div class="error-header">
			<div class="error-icon" style="color: {getErrorColor()}">
				<svelte:component this={getErrorIcon()} size={80} />
			</div>
			<div class="error-code">{errorCode}</div>
			<h1 class="error-title">{errorMessage}</h1>
			<p class="error-description">{errorDescription}</p>
		</div>

		<div class="error-suggestions">
			<h3>Ce poți face:</h3>
			<ul>
				{#each suggestions as suggestion}
					<li>
						<Clock size={16} />
						<span>{suggestion}</span>
					</li>
				{/each}
			</ul>
		</div>

		<div class="error-actions">
			<button class="btn-primary" onclick={goHome}>
				<Home size={20} />
				Pagina principală
			</button>
			<button class="btn-secondary" onclick={goBack}>
				<ArrowLeft size={20} />
				Înapoi
			</button>
			<button class="btn-outline" onclick={refreshPage}>
				<RefreshCw size={20} />
				Actualizează
			</button>
		</div>

		<div class="error-footer">
			<p>Dacă problema persistă, contactează echipa de suport tehnic.</p>
			<div class="footer-links">
				<button onclick={() => goto('/time-management/login')}>Autentificare</button>
				<span>•</span>
				<button onclick={() => window.open('mailto:support@company.com')}>Suport</button>
				<span>•</span>
				<button onclick={() => goto('/time-management/onboarding')}>Prima utilizare</button>
			</div>
		</div>
	</div>
</div>

<style>
	.error-page {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		position: relative;
		overflow: hidden;
	}

	.error-page::before {
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

	.error-container {
		background: var(--color-card);
		border-radius: 20px;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		padding: 3rem;
		max-width: 600px;
		width: 100%;
		position: relative;
		z-index: 1;
		border: 1px solid var(--color-cardBorder);
		text-align: center;
	}

	.error-header {
		margin-bottom: 2rem;
	}

	.error-icon {
		margin-bottom: 1rem;
		opacity: 0.8;
	}

	.error-code {
		font-size: 6rem;
		font-weight: 900;
		color: var(--color-text);
		margin-bottom: 0.5rem;
		line-height: 1;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.error-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 1rem 0;
	}

	.error-description {
		font-size: 1.125rem;
		color: var(--color-textSecondary);
		margin: 0;
		line-height: 1.6;
	}

	.error-suggestions {
		background: var(--color-surface);
		border-radius: 12px;
		padding: 1.5rem;
		margin: 2rem 0;
		text-align: left;
		border: 1px solid var(--color-border);
	}

	.error-suggestions h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 1rem 0;
		text-align: center;
	}

	.error-suggestions ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.error-suggestions li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.error-suggestions li:last-child {
		margin-bottom: 0;
	}

	.error-suggestions li svg {
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		margin: 2rem 0;
	}

	.btn-primary, .btn-secondary, .btn-outline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
		border: none;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-buttonHover);
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
	}

	.btn-secondary {
		background: var(--color-buttonSecondary);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background: var(--color-surface);
		transform: translateY(-1px);
	}

	.btn-outline {
		background: transparent;
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-outline:hover {
		background: var(--color-surface);
		transform: translateY(-1px);
	}

	.error-footer {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-border);
	}

	.error-footer p {
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
		.error-page {
			padding: 1rem;
		}

		.error-container {
			padding: 2rem;
		}

		.error-code {
			font-size: 4rem;
		}

		.error-title {
			font-size: 1.5rem;
		}

		.error-description {
			font-size: 1rem;
		}

		.error-actions {
			flex-direction: column;
		}

		.btn-primary, .btn-secondary, .btn-outline {
			width: 100%;
			justify-content: center;
		}

		.footer-links {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
