# Ghid pentru Sistemul de Teme Extins

Acest ghid explică cum să folosești sistemul de teme extins pentru a crea componente consistente în toate temele.

## Variabile CSS Disponibile

### Culori de Bază
- `--color-primary` - Culoarea principală
- `--color-secondary` - Culoarea secundară
- `--color-background` - Fundalul principal
- `--color-surface` - Suprafața pentru card-uri și containere
- `--color-text` - Textul principal
- `--color-textSecondary` - Textul secundar
- `--color-border` - Bordurile
- `--color-accent` - Culoarea de accent
- `--color-success` - Verde pentru succes
- `--color-warning` - Galben pentru avertismente
- `--color-error` - Roșu pentru erori

### Culori pentru Componente
- `--color-card` - Fundalul card-urilor
- `--color-cardBorder` - Bordurile card-urilor
- `--color-button` - Fundalul butoanelor principale
- `--color-buttonHover` - Fundalul butoanelor la hover
- `--color-buttonSecondary` - Fundalul butoanelor secundare
- `--color-input` - Fundalul input-urilor
- `--color-inputBorder` - Bordurile input-urilor
- `--color-inputFocus` - Culoarea la focus
- `--color-modal` - Fundalul modal-urilor
- `--color-modalOverlay` - Fundalul overlay-ului modal
- `--color-sidebar` - Fundalul sidebar-ului
- `--color-sidebarText` - Textul din sidebar
- `--color-navbar` - Fundalul navbar-ului
- `--color-navbarText` - Textul din navbar
- `--color-table` - Fundalul tabelelor
- `--color-tableHeader` - Fundalul header-ului tabel
- `--color-tableRow` - Fundalul rândurilor tabel
- `--color-tableBorder` - Bordurile tabelelor
- `--color-badge` - Fundalul badge-urilor
- `--color-badgeText` - Textul badge-urilor
- `--color-progress` - Fundalul progress bar-ului
- `--color-progressFill` - Culoarea de umplere progress bar
- `--color-shadow` - Umbra normală
- `--color-shadowHover` - Umbra la hover

## Cum să Folosești Variabilele

### 1. În CSS
```css
.my-component {
  background-color: var(--color-card);
  border: 1px solid var(--color-cardBorder);
  color: var(--color-text);
  box-shadow: 0 2px 4px var(--color-shadow);
}

.my-component:hover {
  box-shadow: 0 4px 8px var(--color-shadowHover);
}
```

### 2. În Svelte
```svelte
<div class="my-component">
  <h3>Titlu</h3>
  <p>Conținut</p>
  <button>Acțiune</button>
</div>

<style>
.my-component {
  background-color: var(--color-card);
  border: 1px solid var(--color-cardBorder);
  color: var(--color-text);
  padding: 1rem;
  border-radius: 8px;
}

.my-component h3 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.my-component p {
  color: var(--color-textSecondary);
  margin-bottom: 1rem;
}

.my-component button {
  background-color: var(--color-button);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.my-component button:hover {
  background-color: var(--color-buttonHover);
}
</style>
```

## Exemple de Componente

### Card Component
```svelte
<div class="card">
  <h3>{title}</h3>
  <p>{content}</p>
  <div class="card-actions">
    <button>Acțiune Principală</button>
    <button class="secondary">Acțiune Secundară</button>
  </div>
</div>

<style>
.card {
  background-color: var(--color-card);
  border: 1px solid var(--color-cardBorder);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--color-shadow);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 6px var(--color-shadowHover);
}

.card h3 {
  color: var(--color-text);
  margin: 0 0 1rem 0;
}

.card p {
  color: var(--color-textSecondary);
  margin: 0 0 1rem 0;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.card-actions button.secondary {
  background-color: var(--color-buttonSecondary);
  color: var(--color-text);
}
</style>
```

### Badge Component
```svelte
<span class="badge">{text}</span>

<style>
.badge {
  background-color: var(--color-badge);
  color: var(--color-badgeText);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
}
</style>
```

### Progress Bar Component
```svelte
<div class="progress-container">
  <div class="progress-label">{label}</div>
  <div class="progress-bar">
    <div class="progress-fill" style="width: {percentage}%"></div>
  </div>
</div>

<style>
.progress-container {
  margin: 1rem 0;
}

.progress-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.progress-bar {
  background-color: var(--color-progress);
  border-radius: 6px;
  overflow: hidden;
  height: 8px;
}

.progress-fill {
  background-color: var(--color-progressFill);
  height: 100%;
  transition: width 0.3s ease;
}
</style>
```

### Table Component
```svelte
<table class="data-table">
  <thead>
    <tr>
      {#each headers as header}
        <th>{header}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each rows as row}
      <tr>
        {#each row as cell}
          <td>{cell}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
.data-table {
  width: 100%;
  background-color: var(--color-table);
  border: 1px solid var(--color-tableBorder);
  border-radius: 8px;
  overflow: hidden;
}

.data-table th {
  background-color: var(--color-tableHeader);
  color: var(--color-text);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

.data-table td {
  background-color: var(--color-tableRow);
  color: var(--color-text);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-tableBorder);
}

.data-table tr:hover td {
  background-color: var(--color-surface);
}
</style>
```

## Adăugarea de Teme Noi

Pentru a adăuga o temă nouă:

1. Adaugă tipul în `Theme`:
```typescript
export type Theme = 'light' | 'dark' | 'blue' | 'purple';
```

2. Adaugă configurația temei:
```typescript
purple: {
  name: 'purple',
  label: 'Mov',
  colors: {
    primary: '#7c3aed',
    secondary: '#a78bfa',
    background: '#faf5ff',
    surface: '#f3e8ff',
    text: '#581c87',
    textSecondary: '#7c2d12',
    // ... toate celelalte culori
  }
}
```

3. Actualizează variabilele CSS în layout:
```css
:root {
  --color-primary: #7c3aed;
  --color-secondary: #a78bfa;
  /* ... toate celelalte variabile */
}
```

## Best Practices

1. **Folosește întotdeauna variabilele CSS** în loc de culori hardcodate
2. **Testează în toate temele** pentru a te asigura că componentele arată bine
3. **Folosește culorile semantice** (success, warning, error) pentru feedback
4. **Mantain contrastul** pentru accesibilitate
5. **Folosește tranziții** pentru o experiență smooth
6. **Testează pe ecrane mici** pentru responsive design

## Debugging

Pentru a verifica ce variabile CSS sunt active:

```javascript
// În consolă
const root = document.documentElement;
const computedStyle = getComputedStyle(root);
console.log(computedStyle.getPropertyValue('--color-primary'));
```

Sau folosește DevTools pentru a inspecta variabilele CSS în tab-ul "Computed".
