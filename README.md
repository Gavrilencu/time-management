# KPI Time Tracker

O aplicație modernă SvelteKit pentru monitorizarea timpului de lucru pe proiecte.

## Funcționalități

### ��� Autentificare Automată
- Pagină de autentificare modernă cu design white
- Autentificare automată (simulată)
- Redirecționare automată către dashboard

### ��� Dashboard Principal
- **Progresul zilnic**: Urmărire automată a celor 8 ore lucratoare
- **Calendar interactiv**: Vizualizare săptămânală cu task-uri
- **Dropdown-uri pentru module**: Proiecte, EVOM, Operational
- **Dropdown-uri pentru proiecte**: Lista dinamică bazată pe modulul selectat
- **Adăugare task-uri**: Cu descriere, ore lucrate și selecție zi

### ⏱️ Urmărire Timp în Timp Real
- Timer cu start/pause/stop
- Statistici săptămânale
- Grafic progres zilnic
- Istoric task-uri recente

### ��� Calendar Detaliat
- Vizualizare lunară completă
- Detalii task-uri pentru fiecare zi
- Navigare între luni

### ⚙️ Setări
- Configurare profil utilizator
- Preferințe lucru (ore zilnice, început săptămână)
- Export date
- Notificări

## Structura Aplicației

```
src/
├── routes/
│   ├── +layout.svelte          # Layout principal cu sidebar
│   ├── +page.svelte            # Dashboard principal
│   ├── calendar/
│   │   └── +page.svelte        # Calendar detaliat
│   ├── time-tracking/
│   │   └── +page.svelte        # Timer și statistici
│   ├── add-task/
│   │   └── +page.svelte        # Formular adăugare task
│   └── settings/
│       └── +page.svelte        # Setări aplicație
└── lib/
    └── assets/
        └── favicon.svg
```

## Tehnologii Utilizate

- **SvelteKit 5** - Framework modern pentru aplicații web
- **TypeScript** - Tipizare statică
- **Lucide Svelte** - Iconițe moderne
- **date-fns** - Manipulare date
- **CSS Grid & Flexbox** - Layout responsive

## Instalare și Rulare

1. **Instalare dependențe**:
   ```bash
   pnpm install
   ```

2. **Rulare în mod development**:
   ```bash
   pnpm dev
   ```

3. **Build pentru producție**:
   ```bash
   pnpm build
   ```

4. **Preview build-ul**:
   ```bash
   pnpm preview
   ```

## Funcționalități Principale

### ��� Monitorizare Timp Zilnic
- Progres bar pentru cele 8 ore lucratoare
- Calcul automat timp rămas
- Vizualizare procentuală progres

### ��� Management Task-uri
- Dropdown pentru module (Proiecte, EVOM, Operational)
- Dropdown dinamic pentru proiecte
- Adăugare task cu descriere și ore
- Editare și ștergere task-uri

### ��� Statistici și Rapoarte
- Progres săptămânal
- Medie ore zilnice
- Numărul de task-uri completate
- Grafic vizual progres

### ��� Design Modern
- Interfață white modernă
- Sidebar fixat pe stânga
- Animații și tranziții fluide
- Design responsive

## Utilizare

1. **Autentificare**: Aplicația se autentifică automat
2. **Dashboard**: Vezi progresul zilnic și calendarul
3. **Adăugare Task**: Completează modulul, proiectul, descrierea și orele
4. **Urmărire Timp**: Folosește timer-ul pentru lucru în timp real
5. **Calendar**: Navighează prin luni și vezi detalii task-uri
6. **Setări**: Configurează preferințele și exportă datele

## Caracteristici Tehnice

- **State Management**: Folosind `$state` din Svelte 5
- **Local Storage**: Persistență date în browser
- **Responsive Design**: Optimizat pentru desktop și mobile
- **TypeScript**: Tipizare completă pentru siguranță
- **Modern CSS**: Grid, Flexbox, Custom Properties

## Dezvoltare Viitoare

- [ ] Autentificare reală cu backend
- [ ] Sincronizare cloud
- [ ] Rapoarte avansate
- [ ] Integrare cu calendar externe
- [ ] Notificări push
- [ ] Export în multiple formate (PDF, Excel)

---

**KPI Time Tracker** - Monitorizează-ți timpul de lucru cu eficiență! ⏰
