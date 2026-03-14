

# Studio Boss — Vertical Slice Plan

## Tech Stack & Why

**React + Vite + TypeScript + Tailwind + Zustand + Immer**
- **Zustand + Immer**: Lightweight, immutable state management perfect for simulation. Zustand stores are naturally domain-sliceable (finance store, project store, rivals store, etc.) and serializable for save/load.
- **No backend needed**: This is a single-player offline game. All state lives client-side. Supabase is unnecessary.
- **Future Electron/Tauri packaging**: Vite builds produce a standard SPA that wraps trivially into desktop builds.
- **Deterministic simulation**: Pure functions operate on state slices → easy to test, replay, and extend.

## Architecture: Simulation ↔ UI Separation

```
src/
├── engine/              # PURE GAME LOGIC — zero React imports
│   ├── types/           # All domain models (Project, Studio, Rival, etc.)
│   ├── systems/         # Simulation systems (finance, projects, rivals, news, events)
│   ├── generators/      # Procedural content (names, headlines, scripts, genres)
│   ├── core/            # Game loop, week advancement, event bus
│   └── data/            # Static data tables (genres, archetypes, budget tiers)
├── store/               # Zustand stores — bridge between engine and UI
│   ├── gameStore.ts     # Master game state + actions
│   └── uiStore.ts       # UI-only state (active tab, modals, etc.)
├── persistence/         # Save/load to localStorage (later: file system)
├── components/          # React UI components
│   ├── dashboard/       # Main dashboard panels
│   ├── pipeline/        # Project pipeline board
│   ├── finance/         # Finance panels and charts
│   ├── rivals/          # Rival studio panels
│   ├── news/            # Newsfeed/headlines
│   ├── modals/          # Create project, events, drilldowns
│   ├── layout/          # TopBar, Sidebar, Shell
│   └── shared/          # Reusable game UI primitives
├── pages/               # Route-level pages (Title, Dashboard, etc.)
├── hooks/               # Game-specific React hooks
└── assets/              # Fonts, any static assets
docs/
└── StudioBoss_Master_Design_Bible.md
```

**Key rule**: `engine/` has ZERO React dependencies. It's pure TypeScript functions that take state in and return new state out. This means the entire simulation is testable, serializable, and portable.

## Save/Load Strategy

- Game state is one serializable TypeScript object
- `JSON.stringify` → `localStorage` for v1
- Auto-save every week advance
- Manual save slots (3 slots)
- Architecture supports future migration to file-system saves via Electron/Tauri

## Design System

- **Montserrat** (display) + **Inter** (body) — loaded via Google Fonts
- Dark-forward palette per the design brief (#0F172A base, #1E293B cards, #FDE047 gold accent, #38BDF8 action blue)
- Sharp corners (2-4px radius), premium card panels
- Cinematic transitions on week advance

---

## What the Vertical Slice Includes

### A. Title Screen & Start Flow
- Studio Boss logo/title with cinematic dark presentation
- "New Game" and "Load Game" buttons
- Load Game shows saved slots with studio name, week number, and cash

### B. Studio Creation Flow
- Enter studio name
- Choose archetype: **Major** (high cash, corporate), **Mid-Tier** (balanced, nimble), **Indie** (low cash, high prestige multiplier)
- Each archetype shows flavor text + starting conditions preview
- Transitions into the main dashboard

### C. Main Dashboard (Command Center)
- **Top Bar**: Studio name, cash, weekly delta, prestige score, current week/date, advance week button
- **Center**: Project Pipeline (kanban-style: Development → Production → Released)
- **Right Sidebar**: Industry Pulse — headlines feed, rival activity, upcoming events
- **Bottom/Secondary**: Quick actions (New Project, View Finances, etc.)

### D. Project Pipeline
- Kanban board with columns: Development, Production, Released
- Project cards show: title, format (Film/TV), genre, budget tier, buzz meter, status, next milestone
- Click card → detail modal with full project info

### E. Create Project Flow
- Modal flow: Title, Format, Genre (from curated list), Budget Tier (Low/Mid/High/Blockbuster), Target Audience, optional flavor text
- Budget tier sets weekly cost drain and potential revenue range
- Project enters Development pipeline

### F. Weekly Advance Loop
- "Advance Week" button triggers the simulation tick
- Each tick: deducts project costs, progresses project milestones, generates 1-3 headlines, updates rival activity, chance of random event
- Week summary overlay shows: financial delta, project updates, headlines, any events
- Cinematic fade-in feel for the summary

### G. Finance Panel
- Cash on hand, weekly burn rate, weekly revenue, net delta
- Simple bar chart: cash over last 12 weeks (using Recharts, already in deps)
- Project cost breakdown list
- Revenue from released projects

### H. Rival Studios
- 3-4 procedurally named rival studios with archetypes
- Each shows: name, type, recent activity blurb, relative strength indicator
- Rivals appear in headlines ("Apex Pictures greenlights $200M sci-fi epic")

### I. Headlines/Newsfeed
- Procedurally generated industry headlines mixing: rival activity, market trends, talent gossip, awards buzz
- New headlines each week
- Scrollable feed in the sidebar

### J. Save/Load
- Auto-save on week advance
- Manual save from dashboard menu
- Load from title screen
- 3 save slots stored in localStorage

---

## What Is Intentionally Excluded (But Architecturally Supported)

- Talent/agency system (types exist, no UI)
- Negotiations & contracts
- Full awards/festival circuit
- Press/scandal/PR response system
- Demographics & ratings depth
- Director final-cut disputes
- Shared universes & franchise systems
- Bankruptcy/loan mechanics

These will have placeholder type definitions in `engine/types/` so the foundation is ready.

---

## Implementation Sequence

1. **Engine foundation**: Domain types, game state shape, week advance core loop, procedural generators
2. **Zustand store + persistence**: Game store, save/load to localStorage
3. **Design system**: Dark palette, Montserrat/Inter fonts, card/panel primitives
4. **Title screen + new game flow**: Route setup, studio creation, archetype selection
5. **Dashboard shell**: Top bar, pipeline area, sidebar, layout grid
6. **Project pipeline + creation**: Kanban board, project cards, create project modal
7. **Week advance loop**: Simulation tick, summary overlay, headline generation
8. **Finance panel**: Cash tracking, chart, cost breakdown
9. **Rivals + newsfeed**: Rival generation, headline system, sidebar feed
10. **Polish**: Transitions, typography hierarchy, empty states, game feel

