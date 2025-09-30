<!-- 
Exemple de componente cu teme extinse
Aceste componente folosesc variabilele CSS din sistemul de teme
Demonstrează toate cele 6 teme disponibile
-->

<script>
	import { currentTheme, themes } from './themes.js';
	
	let showModal = false;
	
	function setTheme(themeName) {
		currentTheme.setTheme(themeName);
	}
</script>

<!-- Selector de teme -->
<div class="theme-selector">
	<h2>Selectează Tema:</h2>
	<div class="theme-buttons">
		{#each Object.entries(themes) as [key, theme]}
			<button 
				class="theme-button {$currentTheme === key ? 'active' : ''}"
				onclick={() => setTheme(key)}
				style="background-color: {theme.colors.primary}; color: {theme.colors.background};"
			>
				{theme.label}
			</button>
		{/each}
	</div>
</div>

<!-- Componenta Card -->
<div class="card">
  <h3>Titlu Card</h3>
  <p>Conținutul card-ului cu text și elemente.</p>
  <div class="card-actions">
    <button>Acțiune Principală</button>
    <button class="secondary">Acțiune Secundară</button>
  </div>
</div>

<!-- Componenta Badge -->
<div class="badge-container">
  <span class="badge">Status Activ</span>
  <span class="badge">Nou</span>
  <span class="badge">Important</span>
</div>

<!-- Componenta Progress Bar -->
<div class="progress-container">
  <div class="progress-label">Progres: 75%</div>
  <div class="progress-bar">
    <div class="progress-fill" style="width: 75%"></div>
  </div>
</div>

<!-- Componenta Tabel -->
<table class="data-table">
  <thead>
    <tr>
      <th>Nume</th>
      <th>Email</th>
      <th>Status</th>
      <th>Acțiuni</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td><span class="badge">Activ</span></td>
      <td>
        <button>Edit</button>
        <button class="secondary">Delete</button>
      </td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td>jane@example.com</td>
      <td><span class="badge">Inactiv</span></td>
      <td>
        <button>Edit</button>
        <button class="secondary">Delete</button>
      </td>
    </tr>
  </tbody>
</table>

<!-- Componenta Modal -->
{#if showModal}
<div class="modal" onclick={(e) => e.target === e.currentTarget && (showModal = false)}>
  <div class="modal-content">
    <h2>Titlu Modal</h2>
    <p>Conținutul modalului cu form-uri și butoane.</p>
    <div class="form-group">
      <label>Nume:</label>
      <input type="text" placeholder="Introdu numele" />
    </div>
    <div class="form-group">
      <label>Email:</label>
      <input type="email" placeholder="Introdu email-ul" />
    </div>
    <div class="modal-actions">
      <button class="secondary" onclick={() => showModal = false}>Anulează</button>
      <button onclick={() => showModal = false}>Salvează</button>
    </div>
  </div>
</div>
{/if}

<!-- Componenta Navbar -->
<nav class="navbar">
  <div class="navbar-brand">
    <h1>Logo Aplicație</h1>
  </div>
  <div class="navbar-menu">
    <a href="/dashboard">Dashboard</a>
    <a href="/projects">Proiecte</a>
    <a href="/settings">Setări</a>
  </div>
</nav>

<!-- Componenta Sidebar -->
<aside class="sidebar">
  <div class="sidebar-header">
    <h2>Meniu</h2>
  </div>
  <nav class="sidebar-nav">
    <a href="/dashboard" class="nav-link">
      <span class="nav-icon">📊</span>
      Dashboard
    </a>
    <a href="/projects" class="nav-link">
      <span class="nav-icon">📁</span>
      Proiecte
    </a>
    <a href="/settings" class="nav-link">
      <span class="nav-icon">⚙️</span>
      Setări
    </a>
  </nav>
</aside>

<!-- Componenta cu Grid Layout -->
<div class="grid-container">
  <div class="grid-item">
    <div class="card">
      <h3>Statistici</h3>
      <div class="stat-value">1,234</div>
      <div class="stat-label">Total utilizatori</div>
    </div>
  </div>
  <div class="grid-item">
    <div class="card">
      <h3>Progres</h3>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 60%"></div>
      </div>
      <div class="progress-text">60% completat</div>
    </div>
  </div>
  <div class="grid-item">
    <div class="card">
      <h3>Status</h3>
      <span class="badge">Activ</span>
      <p>Toate serviciile funcționează normal</p>
    </div>
  </div>
</div>

<style>
/* Stiluri pentru componentele de exemplu */

.theme-selector {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--color-surface);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.theme-selector h2 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 600;
}

.theme-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.theme-button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.theme-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--color-shadow);
}

.theme-button.active {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.badge-container {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.progress-container {
  margin: 1rem 0;
}

.progress-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.data-table {
  width: 100%;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text);
}

.navbar-menu {
  display: flex;
  gap: 2rem;
}

.navbar-menu a {
  color: var(--color-textSecondary);
  text-decoration: none;
  font-weight: 500;
}

.navbar-menu a:hover {
  color: var(--color-primary);
}

.sidebar-header h2 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  color: var(--color-sidebarText);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: var(--color-surface);
  color: var(--color-text);
}

.nav-icon {
  font-size: 1.2rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.grid-item {
  /* Grid item styling */
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0.5rem 0;
}

.stat-label {
  color: var(--color-textSecondary);
  font-size: 0.875rem;
}

.progress-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-textSecondary);
  text-align: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .navbar-menu {
    gap: 1rem;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
