# Studio Boss — UI/UX Design Bible

**Version:** 1.0  
**Status:** Living Design Document  
**Scope:** All screens, components, data visualizations, modals, and future UI extensions  
**Last Updated:** 2026-04-22

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Identity](#2-visual-identity)
3. [Design Tokens](#3-design-tokens)
4. [Typography System](#4-typography-system)
5. [Color System](#5-color-system)
6. [Spacing & Layout Grid](#6-spacing--layout-grid)
7. [Surface Hierarchy & Glassmorphism](#7-surface-hierarchy--glassmorphism)
8. [Component Library](#8-component-library)
9. [Navigation & Information Architecture](#9-navigation--information-architecture)
10. [Data Visualization Standards](#10-data-visualization-standards)
11. [Screen-by-Screen Guidelines](#11-screen-by-screen-guidelines)
12. [Modal & Dialog System](#12-modal--dialog-system)
13. [Animation & Motion](#13-animation--motion)
14. [State & Feedback Patterns](#14-state--feedback-patterns)
15. [Accessibility](#15-accessibility)
16. [Copy & Content Guidelines](#16-copy--content-guidelines)
17. [Designing New Screens](#17-designing-new-screens)

---

## 1. Design Philosophy

### 1.1 The Core Premise

Studio Boss is an executive power fantasy. The player is a **Studio Boss** — not a spreadsheet operator. Every UI decision must reinforce this feeling: the player has a command center, not a dashboard; they hold audiences, not just meetings; they have a legacy, not just a balance sheet.

The UI must balance two tensions that mirror the game itself:

- **Glamour vs. Precision** — The aesthetic should feel like a Hollywood war room, but every number must be instantly readable.
- **Information Density vs. Clarity** — There is a lot happening at any given time; the design must surface what matters without burying everything else.

### 1.2 Three Non-Negotiable Design Principles

**1. Scannable Before Readable**  
A player should be able to land on any screen and understand the critical situation in under 3 seconds. This means: KPIs first, details second; color carries meaning; nothing critical is buried below the fold.

**2. Context Never Breaks**  
The player must always know where they are (navigation), what time it is (fiscal period always visible), and what they're looking at (panel headers always descriptive). No orphaned content. No naked numbers without labels.

**3. Hierarchy Through Contrast, Not Clutter**  
Use one primary color accent per screen section. Reserve `text-primary` (gold/magenta/rust) for the single most important number or action on each card. Everything else recedes.

### 1.3 Reference Points

The UI/UX draws inspiration from:
- **Cyberpunk management UIs** — dense, atmospheric, data-rich dark interfaces
- **Bloomberg Terminal** — relentless information density with scannable hierarchy
- **Variety / The Hollywood Reporter** — editorial confidence and industry vocabulary
- **Succession / Industry (TV shows)** — the visual language of power and money: dark, controlled, expensive

Explicitly avoid: pastel productivity apps, generic SaaS dashboards, "futuristic" designs that sacrifice readability for visual noise.

---

## 2. Visual Identity

### 2.1 Aesthetic Character

Studio Boss uses **Dark Glassmorphism** as its core surface language — deep blue-black backgrounds with semi-transparent, frosted glass cards. This creates:

- Depth without heaviness
- Premium feel without skeuomorphism
- Natural layering of information

The overall mood is: **a private screening room meets a trading floor**. Dark, controlled, confident. Every interaction feels deliberate.

### 2.2 Archetype Themes

The studio archetype selected at game start is not just a gameplay choice — it is a **visual identity** that permeates the entire UI through the active theme class applied to the root element.

| Archetype | Primary Color | Character | Feel |
|-----------|---------------|-----------|------|
| **Major Studio** | Gold `hsl(45, 93%, 55%)` | Established power, weight, legacy | Regal, authoritative |
| **Mid-Tier Studio** | Magenta `hsl(320, 100%, 65%)` | Ambitious, disruptive, creative | Bold, electric |
| **Indie Studio** | Rust Orange `hsl(25, 85%, 60%)` | Artisanal, authentic, raw | Warm, textured, analog |

The Indie archetype also adds a **film grain overlay** (`opacity: 0.05`) via a CSS `::before` pseudo-element on the body — this is intentional and should be preserved on all new Indie-archetype screens.

**Rule:** Never hard-code colors as hex or raw HSL values in components. Always reference design tokens (CSS custom properties or Tailwind semantic classes) so the archetype themes propagate correctly.

### 2.3 Brand Lockup

The game uses the text mark **"S BOSS"** in the sidebar header, rendered in `Montserrat Black` with maximum tracking. This is not a logo to be recreated — it is a typographic identity. Do not add decorative elements around it.

---

## 3. Design Tokens

All design decisions must trace back to these tokens. They are defined in `src/index.css` as CSS custom properties and consumed via Tailwind's semantic utility classes.

### 3.1 Token Reference

| Token | CSS Variable | Tailwind Class | Usage |
|-------|-------------|----------------|-------|
| Background | `--background` | `bg-background` | Page/screen backgrounds |
| Foreground | `--foreground` | `text-foreground` | Primary text |
| Card | `--card` | `bg-card` | Card surfaces |
| Card Foreground | `--card-foreground` | `text-card-foreground` | Text on cards |
| Popover | `--popover` | `bg-popover` | Dropdowns, tooltips |
| Primary | `--primary` | `bg-primary`, `text-primary` | Main accent — interactive elements, key numbers |
| Secondary | `--secondary` | `bg-secondary`, `text-secondary` | Supporting accent — secondary data, icons |
| Muted | `--muted` | `bg-muted` | Subdued surfaces — empty states, disabled areas |
| Muted Foreground | `--muted-foreground` | `text-muted-foreground` | Placeholder text, labels, metadata |
| Accent | `--accent` | `bg-accent` | Hover states, subtle highlights |
| Destructive | `--destructive` | `bg-destructive`, `text-destructive` | Alerts, errors, dangerous actions |
| Success | `--success` | `bg-success`, `text-success` | Positive outcomes, green metrics |
| Border | `--border` | `border-border` | Card and panel borders |
| Input | `--input` | `bg-input` | Form input backgrounds |
| Ring | `--ring` | `ring-ring` | Focus rings |
| Radius | `--radius` | (rounded-xl = 0.75rem) | Corner rounding |

### 3.2 Sidebar-Specific Tokens

The sidebar has its own token set to allow it to be slightly darker than the main background:

| Token | Usage |
|-------|-------|
| `--sidebar-background` | Sidebar background (2% lightness, deepest surface) |
| `--sidebar-foreground` | Nav item text at rest |
| `--sidebar-primary` | Active nav item color = `--primary` |
| `--sidebar-accent` | Nav item hover background |

### 3.3 Token Extension Rules

When a new semantic state is needed (e.g., "warning", "info"):
1. Define it in `:root` in `index.css`
2. Add archetype overrides in `.theme-major`, `.theme-mid-tier`, `.theme-indie` if the color has archetype implications
3. Never introduce a new one-off color in a component

---

## 4. Typography System

### 4.1 Font Stack

| Role | Family | Weights Used | Usage |
|------|--------|-------------|-------|
| **Display** | Montserrat | 900 (Black) | All `h1–h6`, stat values, panel titles, badge labels |
| **Body** | Inter | 300, 400, 500, 600, 700 | Body text, descriptions, labels, form inputs |

Both fonts are loaded from Google Fonts in `index.css`. Use `.font-display` and `.font-body` utility classes when you need to override the default on an element.

### 4.2 Type Scale

| Role | Size | Weight | Tracking | Font | Class Pattern |
|------|------|--------|----------|------|---------------|
| Screen Title | 36px / `text-4xl` | 900 | `-0.05em` (`tracking-tighter`) | Montserrat | `text-4xl font-black tracking-tighter uppercase` |
| Panel Header | 18px / `text-lg` | 800 | `-0.03em` | Montserrat | `text-lg font-black tracking-tight uppercase` |
| Section Label | 10px / `text-[10px]` | 900 | `+0.15em` (`tracking-[0.15em]`) | Montserrat | `text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground` |
| KPI Value | 30px / `text-3xl` | 900 | `-0.03em` | Montserrat | `text-3xl font-black tracking-tighter` |
| Body Text | 14px / `text-sm` | 400–500 | `-0.01em` | Inter | `text-sm font-medium` |
| Caption / Meta | 11px / `text-[11px]` | 500 | 0 | Inter | `text-[11px] text-muted-foreground font-medium` |
| Micro Label | 9px / `text-[9px]` | 900 | `+0.15em` | Montserrat | `text-[9px] font-black uppercase tracking-widest` |

### 4.3 Typography Rules

- **Headlines are UPPERCASE** — all screen titles, panel headers, and KPI labels use `uppercase`. This is non-negotiable; it is a core part of the editorial identity.
- **Numbers use the Display font** — any KPI, stat, or financial figure uses Montserrat Black. Numbers in body copy or tables may use Inter.
- **Never mix weights on one line** — if you need emphasis in a label, use color contrast, not weight variation on the same line.
- **Avoid full sentences in all-caps** — use uppercase only for titles, labels, and badges (≤5 words). Running text in uppercase is inaccessible.
- **Gradient text for hero values** — the screen-level studio title uses `bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent`. Use this sparingly — only once per screen, at the top of the hierarchy.

---

## 5. Color System

### 5.1 Semantic Color Vocabulary

Colors in Studio Boss are **semantic** — they carry specific game meaning. Using colors outside their semantic role creates confusion.

| Color | Semantic Role | Examples |
|-------|--------------|---------|
| `text-primary` | **The accent** — single most important data point or primary action per section | KPI highlight value, active tab indicator, primary CTA button |
| `text-secondary` | **Supporting accent** — secondary metrics, supplementary icons | Audience metrics, streaming data, info icons |
| `text-success` | **Positive financial / prestige movement** | Revenue up, prestige gain, project greenlit |
| `text-destructive` | **Risk, loss, crisis** | Budget overrun, scandal, negative cash flow |
| `text-muted-foreground` | **Labels, metadata, inactive states** | Section labels, timestamps, disabled controls |
| `text-foreground` | **Primary readable content** | Body descriptions, table values, card content |

### 5.2 Color Encoding in Data

When colors represent data categories (e.g., in charts), always use the same encoding consistently throughout the game:

| Data Category | Color |
|---------------|-------|
| Theatrical Revenue | `hsl(var(--primary))` — archetype accent |
| Streaming Revenue | `hsl(var(--secondary))` — cyan/blue |
| Merchandise Revenue | `#a78bfa` — purple (consistent, not part of archetype themes) |
| Passive / Syndication Revenue | `#34d399` — emerald |
| Production Costs | `hsl(var(--destructive))` — red |
| Marketing Costs | `#f97316` — orange |
| Overhead / Burn | `#6b7280` — gray |
| Net / Profit | `hsl(var(--success))` — green |

These must never change per archetype — chart data colors are fixed semantic identifiers, not decorative choices.

### 5.3 Color Opacity Conventions

| Opacity | Usage |
|---------|-------|
| `/5` – `/10` | Atmospheric background blobs, radial glow effects |
| `/20` – `/30` | Badge backgrounds, subtle surface tints |
| `/40` – `/60` | Glass card backgrounds, overlays |
| `/80` – `/90` | Nearly opaque but with glass bleed |
| Full | Only for icons, text, and borders where full opacity is required for legibility |

---

## 6. Spacing & Layout Grid

### 6.1 Spacing Scale

Studio Boss uses Tailwind's 4px base unit. All spacing values must be multiples of 4px.

| Token | px | Usage |
|-------|----|-------|
| `gap-1` / `p-1` | 4px | Icon padding, tight chip spacing |
| `gap-2` / `p-2` | 8px | Badge padding, micro gaps |
| `gap-3` / `p-3` | 12px | Inline spacing between related elements |
| `gap-4` / `p-4` | 16px | Default card padding, section gaps |
| `gap-5` / `p-5` | 20px | Card content padding (primary) |
| `gap-6` / `p-6` | 24px | Between major sections within a panel |
| `gap-8` / `p-8` | 32px | Between layout regions on a screen |
| `space-y-8` | 32px | Primary vertical rhythm within a screen tab |

### 6.2 Screen Layout

The main game layout is a **fixed 2-column structure**:

```
┌─────────────────────────────────────────────────┐
│           TOP BAR (full width, sticky)           │
├──────┬──────────────────────────────────────────┤
│      │                                          │
│  S   │                                          │
│  I   │        MAIN CONTENT AREA                 │
│  D   │        (scrollable)                      │
│  E   │                                          │
│  B   │                                          │
│  A   │                                          │
│  R   │                                          │
└──────┴──────────────────────────────────────────┘
```

- **Sidebar:** Fixed, collapsible (full: ~220px, collapsed: 72px)
- **Top Bar:** Fixed height ~56px, `z-50`, `glass-header` surface
- **Main Content:** Scrollable, `overflow-y-auto`, padded `p-6`

### 6.3 Content Grid Rules

Within the main content area, use these column patterns:

| Layout | Class | When |
|--------|-------|------|
| Full width | `w-full` | Headers, search bars, summary banners |
| 2-column equal | `grid grid-cols-2 gap-4` | Paired KPIs, two related charts |
| 3-column equal | `grid grid-cols-3 gap-4` | Triple KPIs, format breakdown |
| 4-column KPI row | `grid grid-cols-2 md:grid-cols-4 gap-4` | Command Center stat row (standard) |
| 2/3 + 1/3 | `grid grid-cols-3 gap-6` with `col-span-2` + `col-span-1` | Primary viz + secondary widget |
| Pipeline columns | `grid grid-cols-4 gap-4` | Kanban boards only |

**Responsive rule:** All multi-column grids collapse to 1 or 2 columns on smaller windows via `md:` breakpoints. Never use `lg:` or larger as the only responsive breakpoint — assume the window may be narrower than full HD.

### 6.4 Panel Internal Structure

Every panel (a tab's content area) should follow this structure:

```
1. Panel Header Block
   - Screen Title (h1, 4xl, Montserrat Black, uppercase)
   - Sub-label with icon (sm, muted-foreground)
   - Optional: action buttons (top-right)

2. Primary KPI Row
   - 2–4 stat cards in a grid
   - Each card: label + primary value + sparkline or sub-label

3. Content Body
   - Charts / lists / boards / tables
   - Internal sub-sections separated by space-y-6 or space-y-8

4. Optional: Supporting Widgets
   - Secondary data not needed for primary decision-making
```

---

## 7. Surface Hierarchy & Glassmorphism

Studio Boss uses a 5-level surface hierarchy. Never skip levels — each level should visually sit "above" or "below" its parent.

### 7.1 Surface Levels

| Level | Name | Class / Style | z-index | When |
|-------|------|---------------|---------|------|
| 0 | **Page Background** | `bg-background` | 0 | The void — full-screen dark base |
| 1 | **Sidebar** | `glass-panel` (`bg-background/40 backdrop-blur-2xl`) | 10 | Navigation rail |
| 2 | **Top Bar** | `glass-header` (`bg-background/60 backdrop-blur-xl`) | 50 | Always-visible chrome |
| 3 | **Content Cards** | `glass-card` (`bg-card/60 backdrop-blur-xl border border-white/5`) | auto | Data containers, KPI cards |
| 4 | **Popovers / Tooltips** | `bg-popover backdrop-blur-md border border-white/10` | 100 | Hover tooltips, dropdown menus |
| 5 | **Modals / Dialogs** | `bg-card/90 backdrop-blur-2xl border border-white/10` + backdrop overlay | 200 | Modal dialogs, sheet drawers |

### 7.2 Glass Card Anatomy

Every `glass-card` must have:
- `bg-card/60 backdrop-blur-xl` — the frosted glass effect
- `border border-white/5` — barely visible edge definition
- `shadow-2xl` — depth beneath the card
- `rounded-xl` (0.75rem radius) — consistent corner radius

Optional enhancements:
- `bg-gradient-to-br from-white/5 to-transparent` — inner gradient for dimensionality
- `hover:-translate-y-1 transition-transform duration-300` — subtle lift on hover for interactive cards
- An ambient glow blob: `<div className="absolute -top-4 -right-4 w-16 h-16 opacity-10 blur-2xl rounded-full bg-primary" />` — for cards where the KPI value is the primary accent color

### 7.3 Border Rules

- Default card border: `border-white/5` (5% white = barely perceptible)
- Hover state border: `border-primary/40` via `.hover-glow`
- Active/selected state: `border-primary/60` with a `shadow-[0_0_15px_rgba(var(--primary),0.3)]`
- Alert state: `border-destructive/60` with a matching glow
- Never use `border-border` (the semantic token) on glass cards — use `border-white/5` for the glass look

---

## 8. Component Library

### 8.1 KPI Stat Card

**When to use:** Any single critical metric that needs immediate visibility.

**Anatomy:**
```
┌─────────────────────────────┐
│ LABEL          [icon]       │  ← text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground
│                             │
│ 42                          │  ← text-3xl font-black tracking-tighter
│ Sub-label or sparkline      │  ← text-[11px] text-muted-foreground
└─────────────────────────────┘
```

**Rules:**
- Icon always top-right, colored with the KPI's semantic color
- Value: always the largest element on the card
- Use a sparkline only when trend matters more than absolute value
- The ambient glow blob color matches the semantic color of the KPI (primary, secondary, destructive, success)
- No more than 4 KPI cards in a row; if 5+ are needed, break into two rows with a visual separator

### 8.2 Badges & Tags

| Variant | Style | When |
|---------|-------|------|
| **Archetype** | `bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.2)]` | Studio archetype label |
| **Status — Active** | `bg-success/20 text-success border-success/30` | Project in production |
| **Status — Risk** | `bg-destructive/20 text-destructive border-destructive/30` | Crisis, overrun, scandal |
| **Status — Neutral** | `bg-muted text-muted-foreground border-border` | Development, archived |
| **Tier — A-List** | `bg-primary/20 text-primary` | Talent tier A-List |
| **Tier — Rising** | `bg-secondary/20 text-secondary` | Talent Rising Star |
| **Format — Film** | `bg-white/10 text-foreground` | Content format |
| **Format — TV** | `bg-secondary/10 text-secondary` | Content format |

All badges: `uppercase tracking-widest text-[10px] py-0.5 px-2 rounded-md border`

### 8.3 Buttons

| Variant | Style | When |
|---------|-------|------|
| **Primary** | `bg-primary text-primary-foreground hover:bg-primary/90` | Single primary action per view (Greenlight, Advance Week, Save) |
| **Secondary** | `bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30` | Supporting actions |
| **Ghost** | `hover:bg-accent hover:text-accent-foreground` | Tertiary actions, icon buttons in toolbars |
| **Destructive** | `bg-destructive text-destructive-foreground` | Irreversible actions only (drop project, reject deal) |
| **Outline** | `border border-white/10 bg-transparent hover:bg-white/5` | Non-critical contextual actions |

**Rules:**
- One `Primary` button per content area maximum
- Button labels: imperative verb + noun ("Greenlight Project", "Attach Talent") — never just a noun
- Icon + text buttons: icon left of text, `gap-2`, icon `h-4 w-4`
- No loading spinners on the button itself; use a banner or toast for async feedback

### 8.4 Tabs

Two tab styles are used:

**Panel-level tabs** (switching between major sub-views within a screen):
- Full-width tab bar at the top of the panel
- Active tab: `bg-primary/20 text-primary border-b-2 border-primary`
- Inactive: `text-muted-foreground hover:text-foreground`

**Segment tabs** (toggling between closely related data views):
- Compact pill-style tab group
- Active: `bg-primary text-primary-foreground rounded-md`
- Inactive: `text-muted-foreground`

### 8.5 Data Tables

Tables appear in the Finance Ledger and talent lists. Rules:
- No `<table>` for layout — use CSS grid for aligned columns in non-tabular contexts
- Header row: `text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground border-b border-white/5 pb-2`
- Data row: `text-sm font-medium py-3 border-b border-white/5`
- Last column right-aligned if it's a numeric value
- Hover row: `hover:bg-white/5 transition-colors`
- Numbers: right-aligned, monospace-ish (use `tabular-nums` via `font-variant-numeric: tabular-nums`)
- Color-code the sign of financial values: positive = `text-success`, negative = `text-destructive`

### 8.6 Empty States

Every list, table, kanban column, or data section that can be empty must have an empty state. Rules:
- Centered in the available space
- Icon: 48px, `text-muted-foreground/30`
- Headline: `text-base font-black uppercase tracking-tight text-muted-foreground/50`
- Sub-text: `text-sm text-muted-foreground/40`
- Optional: primary action button to resolve the empty state

Never show a blank area — a blank area looks broken.

### 8.7 Search & Filter Controls

- Search input: `bg-input border border-white/5 rounded-lg text-sm` with `Search...` placeholder
- Filter dropdowns: `bg-input border border-white/5 rounded-md`
- Filter chips (active filters): use the Badge style with an `×` dismiss button
- Filter and search always appear in a `flex items-center gap-3` row at the top of the filterable content, below the panel header and above the content body
- When no filters are active, filter controls are still visible but de-emphasized

---

## 9. Navigation & Information Architecture

### 9.1 Primary Navigation — Sidebar

The sidebar is the spine of the game. It must be:
- Always visible (sticky, full height)
- Never scrollable
- Collapsible to icon-only mode (72px)

**Tab order (fixed — never reorder):**

| # | Tab | Icon | Description |
|---|-----|------|-------------|
| 1 | Command Center | Building2 / HQ | Studio executive overview |
| 2 | Production Pipeline | Clapperboard | Kanban board of all projects |
| 3 | The Trades | Newspaper | Discovery, IP marketplace, auctions |
| 4 | Talent Hub | Users | Roster management + SBDB |
| 5 | Distribution Hub | Tv2 | Deals, streaming, ratings |
| 6 | IP Vault | Archive | Franchises, owned IP, syndication |
| 7 | Industry Intelligence | TrendingUp | Rivals, M&A, market dynamics |
| 8 | Finance | DollarSign | Financial reporting, forecasts, ledger |

**Active state:** The active tab has a left-border accent `border-l-2 border-primary`, the icon color shifts to `text-primary`, and the label becomes `text-foreground` (full opacity).

**Notification badges:** If a tab requires attention (e.g., a crisis is unresolved, a deal is expiring), show a red dot badge `h-2 w-2 bg-destructive rounded-full absolute top-1 right-1` on the icon. Do not use numeric count badges — they create anxiety.

### 9.2 Secondary Navigation — In-Panel Tabs

Used when a primary screen has multiple sub-views. Rules:
- Maximum 5 tabs; if more are needed, introduce a second hierarchy level (not more tabs)
- Tab labels: 1–3 words, no icons in tab labels (icons are only for the sidebar)
- The active tab's content must be immediately visible — never require scrolling to see the default view of a tab

### 9.3 Top Bar Persistent Context

The top bar always shows:
- **Left:** Current week and fiscal year
- **Center:** News ticker (scrolling industry headlines)
- **Right:** Prestige score, cash on hand (with `+/-` weekly delta), Advance Week button, Save button

**Rules for the Top Bar:**
- Cash display: always formatted as `$XXXm` or `$X.XXb` — never full number strings in the top bar
- Prestige: show as a number with a `★` prefix
- "Advance Week" is the primary action; style as a full-color `bg-primary text-primary-foreground` button
- Never add more than one action button to the top bar; new global actions go in a menu

### 9.4 Breadcrumbs & Drilldown

Studio Boss uses a **modal-first drilldown** pattern — clicking on a card doesn't navigate to a new page, it opens a modal. There are no breadcrumbs because there is no page-level navigation beyond the sidebar tabs.

**Drilldown depth rules:**
- Level 1: Panel tab (sidebar navigation)
- Level 2: Sub-tab within a panel (in-panel tab bar)
- Level 3: Modal (card click → detail modal)
- Level 4: Nested modal or accordion within a modal (project P&L → line items)

Never go deeper than Level 4. If the information doesn't fit within 4 levels, the information architecture needs restructuring, not another level.

---

## 10. Data Visualization Standards

### 10.1 Chart Selection Guide

Use the right chart for the data type. This is the canonical mapping:

| Data Question | Chart Type | Component |
|--------------|-----------|-----------|
| "How has this changed over time?" | Line / Area | `TimeSeriesChart` |
| "What is the proportion of parts to a whole?" | Donut / Pie | `PieChart` |
| "How does this week compare to the last 12 weeks?" | Bar | `SimpleBarChart` |
| "What is the net flow (costs vs. revenue)?" | Waterfall / Stacked Bar | `ProfitWaterfallChart`, `StackedBarChart` |
| "How does a project score across multiple attributes?" | Radar | `RadarChart` |
| "How does performance distribute across a matrix?" | Heatmap | `HeatMap` |
| "What is the current level of a single KPI?" | Gauge (semicircle) | `GaugeChart` |
| "What is the trend direction of a KPI?" (inline) | Sparkline | `SparkLine` |
| "Where is projected vs. actual?" | Composed (line + bar) | `TimeSeriesChart` with forecast overlay |

**Never use a pie chart when there are more than 5 categories** — switch to a horizontal bar chart with a legend.

**Never use a radar chart to compare two different entities** — use a side-by-side bar chart instead.

### 10.2 Chart Visual Standards

All charts share these visual rules:

**Background:** Charts render on the `glass-card` surface. Never add a second background color inside the chart itself.

**Grid lines:** Use `stroke="#ffffff" strokeOpacity={0.05}` for grid lines — barely visible, just enough for reading alignment.

**Axes:**
- X-axis labels: `text-[11px] text-muted-foreground font-medium` 
- Y-axis labels: same, aligned right
- Never show axis ticks without labels
- Y-axis: always include a unit in the axis label or in a chart subheader (e.g., "$M", "%", "viewers")

**Tooltips:**
- Background: `bg-popover/90 backdrop-blur-md border border-white/10 rounded-lg p-3`
- Contents: label in `text-[10px] uppercase text-muted-foreground`, value in `text-sm font-black text-foreground`
- Always show the full formatted value in the tooltip, even if the axis is abbreviated

**Legend:**
- Position: below the chart for small multiples, to the right for single charts with ≤5 series
- Style: colored dot (`h-2 w-2 rounded-full inline-block`) + label `text-[11px] text-muted-foreground`
- Never auto-generate legend colors — always use the fixed semantic color assignments from Section 5.2

**Animations:**
- Initial render: bars and lines animate in over 400ms
- Data updates: animate the delta, not a full redraw
- Use `animationDuration={400}` on Recharts components

### 10.3 Sparklines

Sparklines are used **inline within KPI cards** to show trend direction without requiring axis labels.

Rules:
- Height: always 30px
- Width: 80–120px maximum
- Color: `'trend'` mode automatically green/red based on direction, or pass the semantic color of the KPI
- No dots by default (`showDots={false}`) unless the dataset has fewer than 5 data points
- Never use a sparkline as the primary visualization — only as a supporting indicator within a KPI card

### 10.4 Gauge Charts

Used for single-value KPIs where the range and relative position matter more than the exact number.

Rules:
- Always display the numeric value below the arc
- Always provide a `label` and optionally a `sublabel`
- Color auto-assigns based on threshold: ≥80% = green, ≥60% = blue, ≥40% = amber, <40% = red
- Use a custom `color` prop only when the value's healthy/unhealthy direction isn't "higher is better" (e.g., spending rate: lower is better)
- Size: 120px default; 100px in tight contexts; never smaller than 80px

### 10.5 Financial Data Viz — Specific Rules

The Finance Panel has the highest data complexity in the game. These rules govern all financial visualizations:

**Cash Flow Forecast Chart:**
- Show 12 weeks of history as a solid area (`fill-opacity: 0.1`) with a solid line
- Show the next 4 weeks as a projected area in dashed line + lighter fill
- Mark the "now" point with a vertical reference line: `stroke="#ffffff" strokeOpacity={0.2} strokeDasharray="4 4"`
- Y-axis: format as `$Xm` (abbreviated millions), never raw numbers
- Zero line: `stroke="#ffffff" strokeOpacity={0.15}` — slightly more visible than grid lines

**Revenue Breakdown (Pie/Donut):**
- Always donut, not full pie (the center hole gives room for a total value)
- Show total value in the donut center: `text-2xl font-black`
- Sections below 3% are merged into "Other"

**Profit Waterfall:**
- Starting bar: `fill="hsl(var(--primary))"` — total revenue
- Cost bars: each cost category in its assigned color (see Section 5.2)
- Net/Profit bar: `fill="hsl(var(--success))"` if positive, `fill="hsl(var(--destructive))"` if negative
- Always show value labels on top of each bar

**Heat Map (Demographics / Regional):**
- Cell color scale: empty/low = `bg-muted/30` → full/high = `bg-primary/80`
- Minimum 8px gap between cells
- Row and column labels in `text-[10px] uppercase text-muted-foreground`
- Hover: show full value in a tooltip; don't try to label individual cells unless the grid is ≤9 cells

### 10.6 Non-Chart Data Display

**Financial figures in text/tables:**
- Always include sign: `+$2.4m` in `text-success` or `-$1.1m` in `text-destructive`
- Format thresholds: `<$1m` → `$XXXk`, `≥$1m` → `$X.Xm`, `≥$1b` → `$X.Xb`
- Never display more than 3 significant digits in the UI (full precision is for exports/logs)

**Percentages:**
- Always include the `%` symbol
- ROI: show with sign `+240%` / `-12%`
- Audience ratings share: `XX.X%` (one decimal)

**Talent ratings / scores:**
- Prestige and Star Meter: always `0–100` scale, displayed as a whole number
- Use a `<progress>`-style bar + numeric value side-by-side

---

## 11. Screen-by-Screen Guidelines

### 11.1 Title Screen

**Purpose:** First impression + entry point  
**Aesthetic:** Full-screen atmospheric — no chrome, no sidebar, no top bar  
**Layout:** Centered content stack, maximum width 480px  
**Key elements:**
- Studio Boss wordmark: `text-6xl font-black tracking-tighter uppercase` with `text-glow` effect
- Tagline: `text-muted-foreground text-base font-medium italic`
- New Game / Load Game buttons: stacked, `w-full`
- Background: solid `bg-background` with an optional radial gradient glow at center

**Save Slot Cards (Load dialog):**
- 4 slots in a 2×2 grid
- Occupied slot: show studio name (font-black), archetype badge, week/year, cash, timestamp
- Empty slot: outlined dashed border, "Empty Slot" label, `text-muted-foreground`
- Active selection: `border-primary/60` with glow

### 11.2 New Game / Studio Setup

**Purpose:** Archetype selection + studio naming  
**Layout:** Two sections: studio name input (top) + archetype cards (3-column grid)

**Archetype Cards:**
- Large cards, full details visible (no truncation)
- Starting stats shown as a mini-stat grid within the card
- Selected state: full `border-primary` border + background tint `bg-primary/5`
- Each card's accent color shifts to match the archetype's theme color (preview the theme in the card itself)

**Studio Name Input:**
- Prominent, full-width input
- Shuffle/randomize icon button `⟳` inlined on the right
- Character limit indicator when approaching max length

### 11.3 Command Center (HQ)

**Purpose:** Executive overview — the game's "Monday morning briefing"  
**First visible on tab selection:** KPI row + Financial Overview + Demographics  
**Information priority order:**
1. KPI row (pipeline count, talent, rivals, prestige) — highest; visible without scrolling
2. Financial Overview widget — critical at all times
3. Demographics widget — strategic, needed for targeting decisions
4. Intelligence Feed — situational; can scroll to

**KPI Row Rules:**
- Exactly 4 cards: Active Pipeline, Talent Roster, Industry Rivals, Prestige XP
- Never add a 5th KPI to this row — create a second row below if expansion is needed
- Each card gets one glow blob matching its semantic color

**Intelligence Feed:**
- Latest 5–8 news items
- Each item: headline text (font-medium) + timestamp (text-[11px] text-muted-foreground) + category badge
- Clickable to open a `NewsStoryModal`
- Items that represent crises or urgent events: left-border `border-l-2 border-destructive`

### 11.4 Production Pipeline

**Purpose:** Project lifecycle management  
**Layout:** 4-column Kanban board (fixed columns, horizontal scroll if needed on smaller windows)

**Column Rules:**
| Column | Status Group | Header Color |
|--------|-------------|-------------|
| Development | `development`, `needs_greenlight` | `text-secondary` |
| Pitching | `pitching` | `text-primary` |
| Active Slate | `production`, `marketing` | `text-success` |
| Catalog | `released`, `post_release`, `archived` | `text-muted-foreground` |

**Project Card Rules:**
- Title: `font-black text-sm uppercase tracking-tight` (truncate at 2 lines)
- Format badge (Film/TV) always top-right
- Budget tier badge below format
- Bottom row: talent count chip + status indicator dot
- Card hover: `hover:-translate-y-1` + `hover-glow`
- Crisis indicator: red pulsing dot `animate-pulse bg-destructive` in top-left if `activeCrisis` exists

**Board Header:**
- Column count badge showing number of projects in each column
- "New IP Venture" button only appears in the Development column header

### 11.5 The Trades (Discovery Board)

**Purpose:** Market scanning — opportunities, auctions, trends  
**Sub-tabs:** IP Marketplace | Auctions | Trend Board | News Feed

**IP Marketplace:**
- Opportunity cards in a 3-column grid
- Each card: title, format badge, asking price, market demand indicator (sparkline or badge)
- Acquisition CTA: `bg-primary` button

**Auction Dashboard:**
- Live auction timer: countdown clock in `text-destructive font-black` if under 24 hours remaining
- Bid history as a vertical timeline, most recent at top
- Current bid: `text-primary font-black text-2xl`
- Your bid input: inline number field + "Bid" button

**Trend Board:**
- Genre trends as a horizontal bar chart (SimpleBarChart)
- Each bar colored by momentum: rising = `text-success`, declining = `text-destructive`, stable = `text-muted-foreground`
- Show trend direction arrow next to genre name

### 11.6 Talent Hub

**Purpose:** Roster management + talent scouting  
**Sub-tabs:** Your Roster | SBDB (Studio Boss Database)

**Talent Cards:**
- Square or tall-rectangle layout
- Name: `font-black text-sm`
- Tier badge top-right
- Role tags as small chips
- Prestige / Star Meter as a small progress bar
- Fee: `text-primary font-black`
- Hover: expand to show agency, availability status

**SBDB Filter Controls:**
- Search field (always visible)
- Role filter dropdown
- Tier filter dropdown
- Sort: by Prestige ↓, Fee ↑, Name A–Z
- Filter state persists within the session (don't reset on tab switch)

**Talent Profile Modal:**
- Two-column layout: left = identity (name, photo placeholder, bio chips), right = career stats + filmography
- Radar chart for capability profile (acting, directing, writing, etc.)
- Action row: "Offer Contract" (primary), "Add to Watchlist" (ghost)

### 11.7 Distribution Hub

**Purpose:** Managing where and how content gets distributed  
**Sub-tabs:** Deals Desk | Streaming Platforms | Nielsen Ratings

**Deals Desk:**
- Active deals as a card list, each showing: buyer name, deal type badge, value, expiry date
- Expiring deals (<4 weeks): amber warning border `border-amber-500/40`
- Expired deals: `border-destructive/40` with a "Renegotiate" CTA

**Nielsen Dashboard:**
- Primary viz: line chart showing viewership over last 12 weeks per show
- Each show gets a distinct line color (use the fixed series color palette from Section 10.2)
- Summary table below the chart: show name, last week rating, week-over-week delta, season average

### 11.8 IP Vault

**Purpose:** Long-term IP asset management  
**Sub-tabs:** Franchise Hub | Owned Inventory | Market Rights | Syndication

**IP Asset Cards:**
- Base value: large number, `text-primary font-black`
- Decay rate: small `text-destructive` percentage
- Merchandising multiplier: `text-secondary` badge
- Last exploit date: `text-muted-foreground text-[11px]`

**Franchise Hub:**
- Franchise shown as a hub-and-spoke diagram (or simplified card with connected projects as chips)
- Total franchise value as a headline stat
- Planned next installment with countdown

**Syndication:**
- Passive income per week from each syndicated title
- Running total: prominent, `text-success font-black text-2xl`

### 11.9 Industry Intelligence (Rivals Panel)

**Purpose:** Competitive intelligence and market dynamics  
**Sub-tabs:** Studio Intelligence | Market Dynamics

**Rival Studio Cards:**
- Name + motto in the card header
- Strength rating as a gauge (GaugeChart, small size 80px)
- Cash and prestige as stat chips
- Recent projects as a small list
- Motivations as descriptive badge chips
- Color tint: rival studios use a neutral blue-gray accent — never use the player's primary color for rivals

**Market Dynamics:**
- M&A activity as a timeline: vertical list, newest at top
- Consolidation events as milestone markers on the timeline
- Market trend indicators as horizontal arrows with labels

### 11.10 Finance Panel

**Purpose:** Financial reporting — the most data-dense screen  
**Sub-tabs:** Cash Flow Forecast | Revenue Streams | Profit Waterfall | Market Rates | Year in Review

**Cash Flow Forecast (default tab):**
- Full-width `TimeSeriesChart`, 400px minimum height
- The most important chart in the game — never shrink or truncate it
- Reference lines for: break-even (zero line), loan thresholds, target cash floor

**Revenue Streams:**
- `PieChart` (donut) for current-period breakdown
- Supporting table: each category, this-week value, month-to-date, year-to-date
- Total row at the bottom: bold, larger font

**Profit Waterfall:**
- `ProfitWaterfallChart`: full-width, clearly labeled bars
- Net result bar always last, always the widest context for the chart's color coding

**Market Rates Widget:**
- Current rate: `text-primary font-black text-2xl`
- Rate history sparkline: last 12 weeks
- Context label: "vs. 12-week avg: +0.2%"

**Year in Review:**
- Side-by-side comparison: this year vs. last year
- Key metrics: total revenue, total costs, net, ROI, prestige gained, projects released
- Positive delta: `text-success`, negative: `text-destructive`

---

## 12. Modal & Dialog System

### 12.1 Modal Hierarchy

Modals stack in this priority order (highest first):

1. **Crisis Modal** — blocks all other interaction
2. **Awards Ceremony Modal** — high drama, full-screen takeover
3. **Week Summary Modal** — weekly recap, required acknowledgment
4. **Action Modals** — player-initiated (pitch, create, attach, bid)
5. **Detail Modals** — informational drilldowns (project detail, talent profile, news story)

### 12.2 Modal Sizes

| Size | Max Width | When |
|------|-----------|------|
| **Small** | 400px | Simple confirmations, single-step actions |
| **Medium** | 600px | Most action modals (pitch, attach talent, create package) |
| **Large** | 800px | Project detail, talent profile, awards ceremony |
| **Full-Screen** | 100% | Crisis modal, bidding war, festival market |

### 12.3 Modal Anatomy

```
┌─────────────────────────────────────────────────┐
│ MODAL TITLE            [optional badge]      [×] │  ← Header: bg-muted/50, border-b border-white/5
│ Sub-description                                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Modal content area                              │  ← Scrollable if needed
│  (padding: p-6)                                  │
│                                                  │
├─────────────────────────────────────────────────┤
│              [Secondary Action] [Primary Action] │  ← Footer: right-aligned actions
└─────────────────────────────────────────────────┘
```

**Modal glass surface:** `bg-card/90 backdrop-blur-2xl border border-white/10`  
**Overlay:** `bg-background/80 backdrop-blur-sm`

### 12.4 Modal Rules

- Every modal must have a clear title (what is happening) and a close mechanism (`×` button + Escape key)
- Primary action is always right-aligned in the footer, secondary action to its left
- Destructive primary actions: use `bg-destructive` button; require a confirmation step if the action is irreversible
- Do not open a modal from within a modal drawer — use an accordion or inline expansion instead
- The Week Summary modal should auto-open after advancing a week, but the player must be able to dismiss it quickly (pressing Escape or the close button should work)
- The Crisis Modal must not be dismissible without making a choice — do not show an `×` button

---

## 13. Animation & Motion

### 13.1 Motion Principles

Animation in Studio Boss serves **orientation and feedback**, not spectacle. The rule is: if removing the animation would make the interface harder to understand, it's useful; if it would just make it slower, remove it.

### 13.2 Entry Animations

Every panel and major content section enters with:
```
animate-in fade-in slide-in-from-bottom-4 duration-700
```

This is the standard entry. Do not introduce new entry animation types — consistency matters more than variety.

**Staggered entry for lists:** When a list of cards loads, stagger each card's entry by 50ms:
```tsx
style={{ animationDelay: `${index * 50}ms` }}
```

Use staggering only when there are 3–8 items. For longer lists, skip it (performance and perceived wait time).

### 13.3 Interaction Animations

| Interaction | Animation |
|------------|-----------|
| Card hover | `hover:-translate-y-1 transition-transform duration-300` |
| Button hover | `hover:opacity-90 transition-opacity` |
| Primary accent on hover | `hover-glow` (glow shadow + border color shift) |
| Icon hover | `hover:scale-110 hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-300` |
| Tab switch | Framer Motion `AnimatePresence` with `opacity: 0→1, y: 8→0` over 200ms |
| Modal open | Scale from 0.95→1.0 + fade in, 200ms |
| Modal close | Fade out, 150ms |

### 13.4 Data Update Animations

When a data value changes (e.g., after advancing a week):
- Numbers count up/down to their new value over 600ms (use a number ticker where budget allows)
- Charts animate their data update (recharts built-in animation at 400ms)
- New items in a list slide in from the top

### 13.5 Performance Rules

- No animation that affects layout (`width`, `height`, `margin`) — only `transform` and `opacity`
- No continuous animations except: the news ticker scroll, the pulse on crisis indicators
- Respect `prefers-reduced-motion` — all animations must have a reduced-motion fallback

---

## 14. State & Feedback Patterns

### 14.1 Loading States

| Context | Loading Pattern |
|---------|----------------|
| Initial game load | Full-screen loading overlay with progress indicator |
| Tab switch (fast) | No loading state — content renders immediately from state |
| Action in progress (saving) | Inline spinner in the button that triggered the action |
| Week advance | Disable "Advance Week" button, show inline spinner |

Never use skeleton loading screens — the game state is always available in the Zustand store; data never loads asynchronously in a way that requires skeletons.

### 14.2 Success States

- Brief toast notification (bottom-right, 3 seconds): `✓ [Action description]`
- Toast style: `bg-success/20 text-success border border-success/30 rounded-lg`
- For major moments (project greenlit, award won): use a full modal or the WeekSummary modal

### 14.3 Error & Alert States

| Severity | Pattern |
|----------|---------|
| **Crisis** (game-blocking) | CrisisModal — full modal, must resolve |
| **Warning** (financial risk) | Alert banner at top of Finance panel with `border-destructive/50 bg-destructive/10` |
| **Caution** (approaching threshold) | Amber badge on the affected KPI card |
| **Info** (neutral update) | Toast notification or IntelligenceFeed item |

### 14.4 Confirmation Dialogs

Required for:
- Dropping a project (irreversible)
- Rejecting a crisis resolution option
- Accepting a merger/acquisition offer

Pattern: Small alert dialog with the consequences clearly stated, then `[Cancel]` and `[Confirm — Irreversible]` buttons.

---

## 15. Accessibility

### 15.1 Required Standards

Studio Boss targets WCAG 2.1 Level AA compliance where technically feasible within a game context. Non-negotiables:

**Color Contrast:**
- `text-foreground` on `bg-card`: must maintain ≥4.5:1 contrast ratio
- `text-primary` badges on dark backgrounds: must maintain ≥3:1 (large text rule applies to 18px+ text)
- `text-muted-foreground` is the minimum contrast floor — never use lower-opacity text for essential content

**Focus States:**
- All interactive elements have a visible focus ring: `ring-2 ring-ring ring-offset-background`
- Never remove the focus ring from keyboard-interactive elements
- Modal focus trap: modals must trap focus within the dialog when open; Radix UI's `Dialog` handles this automatically

**Keyboard Navigation:**
- Sidebar: navigable via Tab + Enter
- Modals: navigable via Tab, closeable via Escape
- Tabs: arrow keys navigate between tab items (Radix UI `Tabs` component handles this)
- Kanban board: individual project cards are keyboard-focusable

### 15.2 Screen Reader Support

- All icon-only buttons have `aria-label`
- Status badges with color meaning also have text content (don't rely on color alone)
- Charts should have an `aria-label` on the container and a visible text summary of the key insight nearby
- All form inputs have associated `<label>` elements

### 15.3 Motion Sensitivity

Wrap all Framer Motion animations in a `useReducedMotion` check:
```tsx
const prefersReducedMotion = useReducedMotion();
const animation = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
```

---

## 16. Copy & Content Guidelines

### 16.1 Voice & Tone

Studio Boss speaks with the confidence and urgency of a Hollywood trades publication. The voice is:
- **Authoritative** — declarative, not hedging ("Your cashflow deteriorates" not "cashflow might be low")
- **Industry-literate** — use actual industry terminology (greenlight, above-the-line, backend, upfronts, P&A)
- **Terse** — labels are short; descriptions are 1–2 sentences max
- **Dramatic when warranted** — crisis events, award results, and scandal reports can be more theatrical

### 16.2 Capitalization Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Screen / tab titles | ALL CAPS | `PRODUCTION PIPELINE` |
| Section headers | Title Case | `Cash Flow Forecast` |
| KPI labels | ALL CAPS | `ACTIVE PIPELINE` |
| Button labels | Title Case | `Greenlight Project` |
| Body text | Sentence case | `This project enters post-production.` |
| Badges and chips | ALL CAPS (≤2 words) | `A-LIST`, `MAJOR STUDIO` |
| Placeholder text | Sentence case | `Search talent by name...` |

### 16.3 Number Formatting Standards

| Value | Format | Example |
|-------|--------|---------|
| Cash < $1M | `$XXXk` | `$450k` |
| Cash $1M–$999M | `$X.Xm` | `$47.3m` |
| Cash ≥ $1B | `$X.Xb` | `$2.1b` |
| Percentage | `XX.X%` | `12.4%` |
| Whole percentage | `XX%` | `84%` |
| ROI | `+XX%` or `-XX%` | `+240%` |
| Week | `Wk XX` | `Wk 14` |
| Year | `Y X` | `Y 2` |
| Prestige | `★ XXX` | `★ 72` |

### 16.4 Terminology Glossary

Use these terms consistently throughout the UI:

| Term | Meaning | Not |
|------|---------|-----|
| Greenlight | Approve a project for production | "Approve", "Start", "Go" |
| Slate | The active set of projects in production | "Queue", "Lineup" |
| Pipeline | All projects from development to catalog | "Backlog", "Projects" |
| Above-the-Line | Creative talent costs (director, cast, writer) | "Talent costs" |
| P&A | Print and advertising (marketing) | "Marketing" (acceptable in simplified contexts) |
| SBDB | Studio Boss Database (talent pool) | "Talent pool" (acceptable in body copy) |
| Fiscal Year / FY | The game's annual accounting period | "Year" alone (in financial contexts) |
| Advance Week | Progress the simulation one week forward | "Next turn", "End week" |
| Prestige | The studio's reputation score | "Fame", "Reputation" |

---

## 17. Designing New Screens

This section is the canonical guide for any engineer or designer adding a new screen, panel, or major component to Studio Boss. Follow this framework to ensure new UI is consistent with the established design system.

### 17.1 New Screen Checklist

Before building a new screen, answer these questions:

1. **Where does it live?** Is it a new sidebar tab, a sub-tab within an existing panel, or a modal? (See Section 9.4 — stay within the 4-level hierarchy.)
2. **Who is the player at this moment?** What decision are they making? What's the most important thing they need to see first?
3. **What is the primary KPI?** Every screen has one number or status that matters most. Identify it and make it the visually dominant element.
4. **What chart type represents the core data?** Use the chart selection guide (Section 10.1).
5. **Does it need filters?** If yes, use the standard filter row pattern (Section 8.7).
6. **Does it need a detail drilldown?** Use a modal (Level 3 in the hierarchy).

### 17.2 New Screen Template

Every new panel tab should start from this structure:

```tsx
// 1. Panel entry animation — always
<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

  {/* 2. Panel Header */}
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div>
      <h1 className="text-4xl font-black tracking-tighter uppercase bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
        {SCREEN_TITLE}
      </h1>
      <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
        <SomeIcon className="h-3.5 w-3.5 text-secondary" />
        {SCREEN_DESCRIPTION}
      </p>
    </div>
    {/* Optional: primary action button */}
    <Button className="bg-primary text-primary-foreground">{PRIMARY_ACTION}</Button>
  </div>

  {/* 3. KPI Row — 2 to 4 stats */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* KPI cards */}
  </div>

  {/* 4. Primary content area */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Main visualization — col-span-2 */}
    {/* Supporting widget — col-span-1 */}
  </div>

  {/* 5. Secondary content (lists, tables, feeds) */}
  
</div>
```

### 17.3 New Chart / Data Viz Checklist

When adding a new visualization:

- [ ] Is there an existing chart component (`TimeSeriesChart`, `PieChart`, etc.) that can handle this data? Use it first.
- [ ] Does the data question match the chart type? (Reference Section 10.1)
- [ ] Are colors using the fixed semantic color mapping? (Section 5.2)
- [ ] Does the chart have proper axis labels including units?
- [ ] Does the chart have a custom Recharts tooltip styled per Section 10.2?
- [ ] Is there a text summary of the key insight visible near the chart for accessibility?
- [ ] Does the chart animate at 400ms?
- [ ] Have you tested it with empty/zero data?

### 17.4 New Modal Checklist

When adding a new modal:

- [ ] What priority level is it? (See Section 12.1 — assign the correct queue priority)
- [ ] What size? (Section 12.2)
- [ ] Does it have a title, sub-description, and close button?
- [ ] Is the primary action right-aligned in the footer?
- [ ] If destructive: is there a confirmation step?
- [ ] Does focus trap work (Radix Dialog handles this automatically)?
- [ ] Does Escape close it (except Crisis modals)?

### 17.5 Archetype Theme Compliance

Every new component must be theme-compliant:

- [ ] No hard-coded hex or HSL color values — use `text-primary`, `bg-primary`, `text-secondary`, etc.
- [ ] Glow effects use `rgba(var(--primary), 0.3)` not a fixed color
- [ ] Borders use `border-white/5` not a fixed opacity value for glass surfaces
- [ ] Chart data colors (category-specific) use the fixed hex values from Section 5.2 — these are the only acceptable hard-coded colors in the codebase

### 17.6 Performance Guidelines for New Screens

- **Memoize derived state.** If you compute a value from game state for display, use `useMemo` with the correct dependency array.
- **Don't subscribe to the full game store.** Use granular selectors: `useGameStore(state => state.gameState.finance)` not `useGameStore(state => state.gameState)`.
- **Virtual lists for long lists.** If a list can have more than 50 items (talent pool, ledger), use windowed rendering.
- **Recharts charts use `ResponsiveContainer`**. Always wrap charts in `<ResponsiveContainer width="100%" height={300}>` — never set pixel widths on charts directly.

### 17.7 When to Add a New Sidebar Tab vs. Sub-Tab

**Add a new sidebar tab when:**
- The content represents a major operational domain (Finance, Talent, Distribution)
- A player would "live in" this screen for extended periods
- The domain has its own primary KPI set

**Add a sub-tab within an existing panel when:**
- The content is a different view of data already owned by the panel (e.g., Revenue Streams vs. Cash Flow within Finance)
- The content is secondary to the panel's primary function
- It doesn't require its own KPI row

**Add a modal when:**
- The content is a drilldown detail triggered by a user action
- The content is transient (resolving a crisis, reviewing a deal)
- It doesn't require persistent navigation context

---

## Appendix A — Quick Reference Card

### Instant Style Decisions

| I need to... | Use this |
|-------------|----------|
| Show a single important number | `text-3xl font-black tracking-tighter text-primary` |
| Label a section | `text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground` |
| Create a card | `glass-card` + `p-5` |
| Create a button | `bg-primary text-primary-foreground` (primary) |
| Show a positive delta | `text-success` |
| Show a negative delta | `text-destructive` |
| Show a tag/badge | `uppercase tracking-widest text-[10px] py-0.5 px-2 rounded-md border bg-primary/20 text-primary border-primary/30` |
| Animate in a panel | `animate-in fade-in slide-in-from-bottom-4 duration-700` |
| Animate a card hover | `hover:-translate-y-1 transition-transform duration-300` + `hover-glow` |
| Create a glass surface | `bg-card/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-xl` |
| Show cash amount | `formatCash(value)` → `$Xm` / `$Xb` / `$XXXk` |

### Chart Selection Quick Reference

| Data type | Chart |
|-----------|-------|
| Time series / trend | `TimeSeriesChart` |
| Part of whole | `PieChart` (donut) |
| Category comparison | `SimpleBarChart` |
| Revenue vs. costs | `ProfitWaterfallChart` |
| Multi-attribute profile | `RadarChart` |
| Geographic / matrix | `HeatMap` |
| Single KPI level | `GaugeChart` |
| Inline trend | `SparkLine` |

---

*This document is a living standard. When a new pattern is established that differs from guidance here, update this bible first — then implement. The document leads the code, not the reverse.*
