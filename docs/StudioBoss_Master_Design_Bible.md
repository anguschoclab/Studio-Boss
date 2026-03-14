# Studio Boss — Master Design Bible

**Version:** Master Draft 1.0  
**Status:** Living Design Document  
**Project:** Studio Boss  
**Genre:** Single-player Hollywood studio management simulation  


---

## 1. Purpose of This Document

This document collates and reconciles the currently attached design and roadmap materials into a single master design bible for **Studio Boss**. It is intended to serve as the canonical reference for the project going forward.

This file is designed to be a **living document**. As new systems are designed, features are revised, or implementation priorities change, this bible should be updated rather than replaced. The goal is to keep one organized source of truth that captures:

- the fantasy and product vision
- the player experience and gameplay loops
- the major simulation systems
- UI and UX direction
- production and engineering assumptions
- delivery sequencing and sprint structure
- open implementation posture for future expansion

Where the source documents overlapped, duplicated, or evolved over time, this master bible adopts the **latest direction where it is clearly newer**, while preserving useful detail from earlier documents if it still supports the current vision.

---

## 2. One-Sentence Game Definition

**Studio Boss is a single-player Hollywood studio management sim in which the player runs a film and television studio, balancing creative ambition, financial survival, talent relationships, publicity, audience demand, awards prestige, and rivalry inside a living AI-driven entertainment industry.**

---

## 3. High-Concept Vision

Studio Boss is not merely a tycoon game about placing buildings or adjusting numbers. It is a **drama-generating strategy simulation** about running the modern dream factory.

The player steps into the role of founder and CEO of a film and television studio. From that position, the player discovers source material, develops projects, negotiates with talent and agencies, manages budgets and production pipelines, navigates ratings and demographic choices, handles scandals and press narratives, releases projects into an ever-shifting market, competes with rival studios, and attempts to build a legacy.

The desired fantasy is equal parts:

- creative power fantasy
- business survival simulator
- social and reputational chess match
- Hollywood narrative generator
- long-term empire builder

The game should consistently create stories such as:

- a prestige director threatening to walk over final cut
- a risky auteur film turning into an awards darling but losing money
- a commercial franchise sequel saving the studio from a cashflow crisis
- a scandal damaging a star at the worst possible release window
- a festival breakout changing a small studio’s entire trajectory
- a rival studio collapsing, merging, or poaching your top collaborators
- a shared universe becoming either a studio-defining triumph or an overextended disaster

The guiding emotional promise is:

> **Run the dream factory. Survive the chaos.**

---

## 4. Design Pillars

### 4.1 Hollywood Fantasy with Real Stakes
The player should feel like they are truly running a modern entertainment studio, with all the ambition, glamour, compromise, ego, and volatility that implies.

### 4.2 Systems That Create Stories
Economic systems, talent systems, PR systems, awards systems, and rival AI systems should collide to generate memorable emergent outcomes rather than remain isolated spreadsheets.

### 4.3 Always-Playable Core
At every development milestone, the game should remain playable end-to-end, even if some later systems are represented by placeholder interfaces or “Coming Soon” stubs.

### 4.4 Dashboard-First Decision-Making
The player should spend most of their time in a clear, powerful studio dashboard that surfaces key information and keeps interactions flowing quickly.

### 4.5 Weekly Rhythm, Long-Term Consequences
The game should feel paced in discrete weekly turns or cycles, while allowing projects and consequences to play out over months and years.

### 4.6 Prestige vs Profit Tension
The game must sustain the tension between artistic ambition and commercial pragmatism. Neither should be a simple “correct” answer.

### 4.7 Rival Industry as a Living Ecosystem
The player is not operating in a vacuum. Rival studios, agents, talent, critics, streamers, festivals, and market trends all need to feel active and reactive.

### 4.8 Legacy and Replayability
The game should encourage multiple playstyles and many runs through varied studio archetypes, market shifts, rival behavior, talent dynamics, and long-term IP strategy.

---

## 5. Player Role and Fantasy

The player is the **Studio Boss**: founder, chief executive, strategic leader, and final decision-maker of a modern film and TV studio.

The player fantasy includes:

- greenlighting films and series
- discovering or buying source material
- assembling talent packages
- negotiating contracts and creative control
- balancing budgets and cash reserves
- handling release strategy and distribution outcomes
- steering PR responses and brand perception
- targeting audiences by demographics and region
- gaming the awards circuit when useful
- surviving liquidity crises and avoiding collapse
- building franchises, universes, and studio identity
- watching competitors rise, fail, merge, or copy your moves

The player is not meant to micromanage every granular production detail. Instead, the game should focus on **high-leverage executive decisions** that still feel textured and dramatic.

---

## 6. Product Definition

### 6.1 Genre
Single-player Hollywood studio management sim.

### 6.2 Platform
Primary target is **macOS desktop**.

### 6.3 Session Structure
The game is suitable for both:

- short management sessions driven by weekly turns, and
- long campaign play focused on studio growth and legacy.

### 6.4 Intended Feel
The tone should combine:

- polished executive decision-making
- glamorous entertainment-industry flavor
- emergent chaos and production drama
- readable but deep management systems

### 6.5 Delivery Philosophy
The game will be delivered in progressive **playable macOS ZIP builds** through development. Every build should provide a functioning loop from title screen into a playable dashboard with save/load.

---

## 7. Core Gameplay Structure

The master gameplay loop is:

1. **Discovery**
2. **Development**
3. **Production**
4. **Post**
5. **Marketing and Release**
6. **Festivals and Awards**
7. **Reporting and Finance**
8. **Strategy and Growth**

These are not separate minigames. They are interconnected layers of one larger studio simulation.

### 7.1 Discovery
The player finds scripts, rights packages, market opportunities, trends, and talent combinations worth pursuing.

### 7.2 Development
Projects are shaped into viable productions through packaging, budget planning, creative leadership, talent attachment, and positioning.

### 7.3 Production
Projects move through pre-production, shoot, and major milestone execution while budget, morale, quality, schedule, and risk remain in play.

### 7.4 Post
Editing, rating concerns, market positioning, and release readiness become central. Creative control disputes may escalate here.

### 7.5 Marketing and Release
The player decides how a project is presented to audiences, which audience is targeted, and how release strategy affects returns and reputation.

### 7.6 Festivals and Awards
Prestige-focused projects can generate value beyond direct financial return through buzz, awards nominations, and studio identity enhancement.

### 7.7 Reporting and Finance
The player continually reads outcomes through dashboards, forecasts, and project-level performance drilldowns.

### 7.8 Strategy and Growth
The player responds to long-term trends by scaling operations, pursuing IP retention, reviving relationships, pursuing universes, and shaping the studio’s future direction.

---

## 8. Weekly Rhythm and Time Structure

The project materials consistently point toward a **weekly pacing model**.

### 8.1 Weekly Flow
A representative weekly round should feel like:

- **Monday brief**: current state, fires to put out, opportunities, industry updates
- **Mid-week actions**: negotiations, greenlights, staffing, PR responses, finance actions, release decisions
- **Friday wrap**: project outcomes, revenue movement, press reactions, rival activity, events

### 8.2 Why Weekly Pacing Matters
Weekly pacing provides:

- strategic rhythm
- readable financial cadence
- manageable narrative density
- alignment with film/TV business logic
- a steady drumbeat for headlines, crises, and project milestones

### 8.3 Long-Horizon Layer
Although the game advances weekly, projects and studios should evolve over a longer-term horizon measured in months and years. The player must feel the cumulative effect of choices.

---

## 9. Major Gameplay Loops

### 9.1 Studio Loop
Acquire opportunities, make bets, manage the slate, release work, reinvest success, survive failures.

### 9.2 Project Loop
Source material or concept, package talent, greenlight, produce, release, track returns, evaluate legacy potential.

### 9.3 Talent Loop
Find collaborators, negotiate terms, navigate egos, build loyalty, lose people to rivals, revive relationships.

### 9.4 Finance Loop
Commit money, absorb weekly outflows, chase inflows, protect liquidity, service debt, forecast risk, recover from crises.

### 9.5 Reputation Loop
Manage buzz, scandals, critics, fandom, awards prestige, and how all of that changes future negotiations and commercial outcomes.

### 9.6 Industry Loop
Observe rivals, react to market trends, exploit competitor failures, defend against poaching, ride or resist genre cycles.

### 9.7 Legacy Loop
Retain IP, create franchises, build shared universes, create catalog value, and shape what your studio is known for.

---

## 10. Game Scope Overview

The master scope from the existing files includes these major system families:

- source material and discovery
- projects and pipeline management
- talent, agencies, and negotiations
- finance and cashflow simulation
- liquidity, loans, and bankruptcy recovery
- demographics and ratings
- creative control and director negotiations
- festivals, critics, and awards
- press, scandals, fandom, and PR responses
- AI rival studios and broader industry simulation
- shared universes, crossovers, and legacy catalog systems
- dashboard-centric UI and finance visualization
- onboarding, archetypes, assistant voices, and thematic presentation

---

## 11. Source Material and Discovery

One of the first loops is identifying what to make.

### 11.1 Sources of Opportunity
Projects may originate from:

- scripts
- acquired rights
- internal concepts
- talent-driven package opportunities
- trend-driven market openings
- event-driven opportunities such as a “Black List” style discovery beat

### 11.2 Design Intent
Discovery should not feel like pulling random cards with no context. It should create meaningful strategic decisions:

- chase prestige material
- exploit market appetite
- package around a star or filmmaker
- buy rights early and bet on adaptation potential
- walk away from hot material when terms are bad

### 11.3 Strategic Variables
Discovery choices should interact with:

- budget size
- target demographics
- ratings implications
- franchise potential
- talent availability
- awards upside
- PR risk
- region-specific performance

---

## 12. Projects and the Pipeline System

The project pipeline is one of the most important organizing structures in the game.

### 12.1 Purpose
The pipeline gives the player a readable operational view of all active and completed work across the studio.

### 12.2 Core Columns
A baseline pipeline includes:

- **Development**
- **Production**
- **Released / Archived**

The broader lifecycle should also conceptually support:

- Development
- Pre-Production
- Shoot
- Post
- Release
- Awards / Legacy

### 12.3 Project Card Information
Each project card should surface essential, glanceable information such as:

- title
- project type
- genre
- budget
- current stage
- buzz
- upcoming milestone
- release readiness
- financial status

### 12.4 Project Detail View
Each project should support a detail modal or full view containing tabs such as:

- Overview
- Financials
- Talent
- Production
- Marketing
- Universe
- Contracts
- Episodes, if applicable

### 12.5 Design Intent
The pipeline should make the player feel like an executive surveying a live slate, not a spreadsheet operator lost in menus.

---

## 13. Film and Television Model

Studio Boss includes both film and television projects. They should share a common studio framework while retaining distinct business logic.

### 13.1 Film
Film projects generally emphasize:

- concentrated budget commitments
- marketing spend before release
- theatrical or eventized revenue decay over time
- prestige opportunities via festivals and awards
- sequel and universe potential

### 13.2 Television
Television projects generally emphasize:

- episodic or season-based staffing and payment structures
- delivery schedules
- licensing or network economics
- longer revenue arcs depending on model
- crossover and transmedia potential

### 13.3 Shared Framework
Both films and series should feed into:

- studio brand
- talent relationships
- press and fandom
- rights value
- awards potential
- demographic targeting
- long-term catalog legacy

---

## 14. Economy and Cash Flow Simulation

The financial model is a cornerstone of the game.

### 14.1 Core Principle
The game’s economic layer should make cashflow feel alive, legible, and dangerous. Money is not just a score. It is a pressure source that drives narrative and strategic tradeoffs.

### 14.2 Design Intent
The desired outcome is not punitive bookkeeping. The desired outcome is that finance creates stories:

- risky expansion leading to a short-term cash crunch
- one breakout hit covering losses from multiple failed projects
- a prestigious flop damaging liquidity while improving awards standing
- a bad quarter forcing the player into painful financing decisions

### 14.3 Dynamic Inflows and Outflows
Finances should move dynamically based on project stage and business model.

Examples include:

- development spending
- production costs
- marketing spend
- payroll and deal obligations
- box office inflows
- licensing payments
- streaming lumps or installments
- backend obligations
- debt servicing

### 14.4 Film Cash Cycle
The baseline film cycle is:

**Greenlight (-) → Production (-) → Marketing (-) → Box Office (+ weekly) → Streaming (+ lump) → Backend (-)**

### 14.5 Television Models
The design source identifies three TV structures:

| Model | Cash Flow Character | Risk Profile |
|---|---|---|
| Network Order | Paid on delivery | Low |
| Streaming License | Paid in installments | Medium |
| Self-Owned Airing | Weekly revenue | High |

### 14.6 Salary Structures
Compensation may include:

- actors: flat or per episode
- directors: flat or per season
- writers: per script
- producers: flat plus bonus
- crew: weekly

### 14.7 Weekly Financial Pressure
Because the simulation advances weekly, the player should feel recurring economic movement rather than static balance-sheet snapshots.

---

## 15. Liquidity, Loans, and Bankruptcy

The liquidity model adds existential stakes to the business simulation.

### 15.1 Cashflow Crunch
A crunch occurs when the studio cannot comfortably sustain current obligations. Earlier design material proposes a trigger like cash remaining below zero for multiple weeks.

Likely player responses include:

- delaying salaries
- pausing projects
- selling slate pieces
- seeking loans

### 15.2 Bridge Financing
The source documents identify several possible financing channels:

| Source | Flavor | Tradeoff |
|---|---|---|
| Hedge Fund | Fast money | Punishing terms and loss of leverage |
| Bank Loan | Larger institutional support | Requires collateral |
| Streamer Advance | Cleaner cash support | Loss of rights or control |
| Talent Consortium | Relationship-driven bailout | Creative control concessions |

### 15.3 Default and Restructure
At more severe levels of crisis, the player may face options like:

- selling the studio to a rival
- selling the library
- government subsidy or rescue structures
- Chapter 11 style restructuring
- exiting the industry

### 15.4 Recovery Arc
A strong recovery should matter emotionally and narratively. The design explicitly calls out a “Phoenix Studio” comeback arc where morale and perception improve after survival.

### 15.5 Rival Use
Rival studios should use the same broad liquidity framework so that the player can witness collapses, mergers, asset sales, and opportunistic acquisitions.

---

## 16. Finance UI and Data Presentation

The financial systems need excellent presentation to remain understandable.

### 16.1 Top-Bar Finance Widget
At minimum, the top bar should communicate:

- cash on hand
- weekly delta
- next major inflow

### 16.2 Finance Screen Core Components
The source materials point to a rich finance interface containing:

- stacked weekly cashflow chart
- category heatmap
- variance bars
- project-level and line-item drilldown
- forecast and warning indicators

### 16.3 Charting Intent
The finance UI should make complex simulation readable through visuals, not force the player to parse tables first.

### 16.4 Drilldown Hierarchy
Preferred drilldown flow:

- category overview
- category drawer
- project P&L modal
- expandable line items

### 16.5 Standard Filters
Suggested filter layers include:

- time: week, month, quarter
- media: film, TV
- status: active, released

### 16.6 Threshold and Alerting
The system should support banners or threshold watchers to warn about liquidity risk, forecasted collapses, and unusual performance swings.

---

## 17. Talent, Agencies, and Packaging

Studio Boss treats talent as a major simulation pillar, not cosmetic flavor.

### 17.1 Core Talent Types
The attached materials identify these key groups:

- actors
- directors
- writers
- showrunners
- producers
- agencies and agents

### 17.2 Talent Systems Goals
The talent layer should support:

- attachment decisions
- salary and deal structure negotiation
- packaging power
- chemistry and loyalty effects
- scheduling constraints
- recurring collaboration patterns
- poaching and agency leverage

### 17.3 Agencies and Agents
Agencies are not passive lists. They should have traits, agendas, and strategic behavior.

Possible functions include:

- pushing package deals
- protecting talent reputation
- escalating negotiations
- exploiting awards momentum
- steering clients away from unstable studios
- using controversy as leverage

### 17.4 Descriptor-Based Personality Model
Earlier versions mention descriptor-based personalities. This should remain the preferred abstraction so talent behavior feels readable without becoming needlessly simulation-heavy.

### 17.5 Design Intent
Talent should feel like people with leverage and history, not stat containers.

---

## 18. Negotiation Systems

Negotiation is one of the game’s signature dramatic layers.

### 18.1 Scope
Negotiations may include:

- salary
- backend participation
- billing
- schedule flexibility
- creative approval
- rights retention
- final cut
- franchise obligations
- first-look arrangements

### 18.2 Narrative Presentation
The source materials identify **Ink-based** dialogue or event structures as a core presentation method for contract and negotiation interactions.

### 18.3 Desired Feel
Negotiation should sit between strategy and interactive drama:

- concise enough not to stall the sim
- dramatic enough to feel personal
- systemic enough to affect long-term relationships and press outcomes

### 18.4 Long-Term Consequences
A negotiation outcome may influence:

- loyalty
- future availability
- awards campaign enthusiasm
- PR spillover
- budget efficiency
- production morale

---

## 19. Creative Control and Director Dynamics

One of the most important expansions in the later design direction is the inclusion of **director archetypes**, **final cut negotiations**, and related creative tensions.

### 19.1 Purpose
This system represents the reality that not all directors want the same level of control, and the studio’s handling of them should affect both project outcomes and the studio’s identity.

### 19.2 Core Dynamics
The system should account for:

- director archetype or temperament
- appetite for oversight
- tolerance for notes and commercial demands
- insistence on final cut
- response to test screenings
- loyalty effects after conflict or support

### 19.3 Strategic Tension
The player may need to choose between:

- protecting a strong director’s vision
- imposing studio notes for marketability
- accepting a dual-cut or edited compromise
- taking the PR hit from a creative dispute

### 19.4 Outcome Effects
Creative control disputes should potentially influence:

- film quality or coherence
- audience accessibility
- awards reception
- critic sentiment
- director loyalty
- talent reputation
- internal studio culture

### 19.5 Design Importance
This is a defining system because it embodies the game’s core thesis: the studio business is a negotiation between art, commerce, ego, and survival.

---

## 20. Demographics and Audience Simulation

Later design materials explicitly add **age, gender, and region** as meaningful audience dimensions.

### 20.1 Purpose
Projects should not target a generic audience blob. The player should think in terms of who the project is for and how different groups may respond.

### 20.2 Dimensions
The current intended demographic structure includes:

- **Age**
- **Gender**
- **Region**

### 20.3 Design Use
Demographics should influence:

- project greenlight confidence
- marketing effectiveness
- box office and viewership projections
- press narratives
- ratings sensitivity
- awards positioning in some cases
- franchise viability

### 20.4 Weighted Audience Index
The v7.6 material specifically references a **Weighted Audience Index**, suggesting a formalized projection layer for targeting and forecast quality.

### 20.5 Strategy Implications
The player may choose to:

- build broad four-quadrant crowd-pleasers
- target narrow but passionate niches
- skew toward prestige demographics
- make regionally tuned content
- exploit underserved audiences

---

## 21. Ratings and Regional Sensibility Systems

Another later-stage expansion is the integration of ratings and content-based audience restrictions.

### 21.1 Scope
The ratings system should cover:

- film ratings
- television ratings
- content rule implications
- regional content sensitivities
- possible editing or alternate cut hooks

### 21.2 Why It Matters
Ratings are not just labels. They affect:

- accessible audience size
- marketing options
- prestige positioning
- regional release strength
- controversy risk
- commercial upside vs creative freedom

### 21.3 Editing and Dual-Cut Possibilities
The source documents mention editing hooks and dual cuts. This opens design space for:

- toning down a project for broader release
- preserving a more auteur-oriented cut for prestige or fan appeal
- managing conflict between ratings and final-cut demands

### 21.4 Regional Rules
Different territories may react differently to the same content, influencing release strategy and revenue mix.

---

## 22. Press, Public Relations, and Scandals

The game’s PR layer is essential to its Hollywood identity.

### 22.1 Core Components
The roadmap and design materials point to:

- press tone and sentiment
- PR response choices
- procedural critic reviews
- controversies and scandals
- recovery loops
- newsfeed integration

### 22.2 PR Response Modes
A core interaction model includes modal responses such as:

- deny
- spin
- lean in

Each should carry mechanical and tonal tradeoffs rather than merely flavor text.

### 22.3 Possible Event Sources
PR events may emerge from:

- talent behavior
- creative disputes
- ratings controversies
- production accidents
- leaks
- rival gossip
- political or cultural backlash
- awards campaign dynamics

### 22.4 Design Intent
PR should not merely punish the player. It should create opportunities for strategic positioning, damage control, or calculated exploitation.

---

## 23. Fandom, Buzz, and Critic Dynamics

The player is not only managing press headlines but also public sentiment.

### 23.1 Fandom Layer
The roadmap mentions fandom segments, loyalty, and backlash.

This implies systems for:

- core fan attachment
- fan anger over changes or controversy
- cult appreciation and rediscovery
- audience identity alignment

### 23.2 Critic Layer
Procedural critic reviews should provide flavor and meaningful consequences without requiring large-scale authored content.

### 23.3 Prestige vs Commercial Metering
The roadmap explicitly references prestige and commercial meters. These should not be mutually exclusive, but tradeoffs between them should create texture.

### 23.4 Recovery and Reappraisal
Some projects should improve in reputation over time, allowing “cult recovery” stories or rediscovery arcs.

---

## 24. Festivals and Awards

The game’s prestige layer is heavily tied to festivals and awards.

### 24.1 Festivals Named in Source Materials
The currently referenced festival set includes:

- Cannes
- TIFF
- Sundance
- SXSW
- Tribeca

### 24.2 Awards Referenced in Source Materials
The currently referenced awards set includes:

- Oscars
- BAFTAs
- Golden Globes
- Emmys

### 24.3 Purpose of the System
Festivals and awards should matter because they can:

- increase prestige
- alter valuation and release prospects
- improve future talent negotiations
- influence PR tone
- shape studio identity
- rescue or elevate projects that are not direct commercial monsters

### 24.4 Festival Buzz
The roadmap highlights a **Festival Buzz Meter**, implying a focused sub-layer where projects can bomb, break out, or go viral in prestige circles.

### 24.5 Red Carpet and Flavor Sequences
Awards season and red-carpet sequences are called out as flavor-rich presentation opportunities. These should heighten emotional payoff without drowning the player in ceremony.

---

## 25. Rival Studios and Industry Simulation

Studio Boss is explicitly designed as a living industry simulation.

### 25.1 Rival Count
The baseline expectation is **9 AI rival studios**, with additional offscreen smaller competitors possible.

### 25.2 Rival Roles
Rivals should be able to:

- develop competing projects
- poach talent
- co-produce
- trigger bidding wars
- collapse or merge
- react to industry trends
- produce gossip or reputation pressure
- serve as acquisition or merger targets

### 25.3 Strategy Differentiation
Not all rivals should behave the same. They should exhibit strategic identities such as:

- prestige hunters
- franchise builders
- low-risk commercial grinders
- chaotic trend-chasers
- debt-heavy gamblers

### 25.4 Offscreen Industry Pressure
The player should feel that deals happen even when the player is not directly acting. This keeps the world moving.

### 25.5 Industry Trend Board
The roadmap identifies a **Trend Board** showing genre and market movement. This creates a macro layer above individual projects.

---

## 26. Studio Culture and Identity

The design materials call for a **Studio Culture / Vibe** system.

### 26.1 Purpose
The studio should feel like it develops a recognizable internal identity, affecting both aesthetics and simulation outcomes.

### 26.2 Example Cultures
The roadmap references examples such as:

- Creative Chaos
- Auteur Haven

Other culture identities could plausibly define how talent, agents, and audiences perceive the studio.

### 26.3 Mechanical Value
Studio culture may influence:

- who wants to work with you
- risk tolerance
- how PR crises are interpreted
- your awards ceiling
- your franchise discipline
- staff morale or executive effectiveness

### 26.4 Narrative Value
Studio culture helps the player tell a story about what kind of company they built.

---

## 27. Rumors, Gossip, and Production Catastrophes

One of the later roadmap expansions adds strong flavor systems that reinforce Hollywood drama.

### 27.1 Rumor Mill
A rumor layer can spread:

- casting friction
- relationship fallout
- project trouble
- secret deals
- internal panic

### 27.2 Casting Gossip Cards
The roadmap gives an illustrative example like a star refusing to work with a specific director. This suggests cardized or eventized conflict beats that alter player options.

### 27.3 Production Catastrophes
Examples mentioned include:

- set fire
- leaks
- rehab-related interruptions

These events should produce both immediate and long-tail consequences.

### 27.4 Design Role
These systems add drama, unpredictability, and storytelling energy without requiring high-frequency micromanagement.

---

## 28. Rights, Retention, and Long-Term Value

Rights and ownership are important strategic differentiators.

### 28.1 Scope
The later design summary references:

- regional rights
- partial IP retention
- sequel rights
- TV rights
- merchandise rights

### 28.2 Why It Matters
A project’s direct revenue may matter less in the long run than what rights the studio keeps.

### 28.3 Design Implication
The player should be able to make “good business, bad vanity” or “great prestige, bad ownership” deals, and feel the difference later.

---

## 29. First-Look Deals, Recurring Collaborators, and Co-Productions

The source materials include first-look deals and co-production structures as strategic systems.

### 29.1 First-Look Deals
These can reward players who successfully nurture repeat collaborators.

### 29.2 Recurring Collaboration
A recurring relationship system can make talent and producer pairings valuable beyond simple stats.

### 29.3 Co-Productions
These provide risk-sharing and strategic alignment opportunities, especially when the studio needs to scale or hedge exposure.

---

## 30. Shared Universes, Crossovers, and Legacy

The game is expected to support empire-building beyond one-off projects.

### 30.1 Shared Universe Builder
The player should be able to create linked projects with continuity and strategic dependencies.

### 30.2 Crossovers
TV-to-film and film-to-TV crossovers are explicitly in scope.

### 30.3 Legacy Mode Lite
The roadmap refers to a studio timeline and catalog view, suggesting a persistent record of the studio’s history and output.

### 30.4 Why It Matters
These systems create long-tail goals and identity:

- franchise momentum
- fan loyalty
- catalog value
- continuity stakes
- legacy storytelling

---

## 31. Dashboard-Centric UX Philosophy

The dashboard is the player’s studio lot control center.

### 31.1 Top Bar
Baseline top bar information includes:

- cash
- week
- active projects
- headlines

### 31.2 Main Dashboard Sections
The existing design calls for:

- inline pipeline
- quick actions
- newsfeed
- rival sidebar
- calendar

### 31.3 Slide-In or Context Panels
Secondary systems such as Talent, Material, Press, and Finance should open contextually instead of forcing heavy navigation.

### 31.4 UX Goal
The dashboard must support fast, informed decisions while reinforcing the fantasy that the player is surveying an active studio operation.

---

## 32. Accessibility and Presentation Principles

Although the files are not exhaustive on accessibility, the roadmap and tech direction establish some baseline expectations.

### 32.1 Accessibility Standards
The game should support:

- keyboard navigation
- reduced-motion respect
- readable hierarchy
- accessible primitives
- at least AA-oriented visual accessibility goals

### 32.2 Motion Philosophy
Motion should support tone and clarity, not spectacle for its own sake.

### 32.3 Information Density
The UI should be rich but readable. The player should be able to understand studio state at a glance.

---

## 33. FTUE, Archetypes, and Assistant Persona

The v7.6 materials introduce a meaningful framing layer for early player experience.

### 33.1 FTUE
FTUE stands for first-time user experience. It should help the player understand the game’s complex systems without flattening its personality.

### 33.2 Studio Archetype Selection
The player may begin with a studio archetype such as:

- Major
- Mid-Tier
- Indie

### 33.3 Impact of Archetype
This choice should affect:

- tone
- difficulty
- available resources
- studio identity
- UI theme
- assistant voice and guidance style

### 33.4 Assistant Personas
The source materials name assistant voices such as:

- **Fixer** for Major
- **Insider** for Mid-Tier
- **Dreamer** for Indie

These should help tutorialize while reinforcing the player’s chosen fantasy.

---

## 34. Thematic UI Styles by Archetype

The current thematic styles are:

### 34.1 Major
- gold and deep teal
- smooth motion
- corporate polish
- assistant voice: Fixer

### 34.2 Mid-Tier
- neon and glass
- snappy motion
- assistant voice: Insider

### 34.3 Indie
- sepia and grain
- organic motion
- assistant voice: Dreamer

These themes should flavor the experience while preserving usability and a shared information architecture.

---

## 35. Narrative Systems and Tone

Studio Boss is a management sim, but its emotional texture should be narrative-forward.

### 35.1 Core Tone
The game should feel:

- glamorous
- tense
- strategic
- occasionally chaotic
- wry but not parody-first

### 35.2 Narrative Engines
Narrative should emerge through:

- negotiation scenes
- news headlines
- rumor cascades
- finance crises
- awards moments
- talent fallout
- competitor actions

### 35.3 Design Principle
The systems should generate stories the player can retell.

---

## 36. Engineering and Technical Direction

The latest attached direction clearly updates the project’s technical posture.

### 36.1 Canonical Client Stack
The master current stack is:

- **Language:** TypeScript
- **Framework:** React SPA with Vite
- **State:** Zustand with Immer
- **Routing:** React Router
- **Styling:** TailwindCSS with Radix UI
- **Narrative scripting:** Ink.js
- **Icons:** Lucide
- **Audio:** howler.js
- **Animation:** Framer Motion
- **Charts:** Recharts, with targeted D3 helpers as needed

### 36.2 Simulation and Performance Stack
- game logic in pure TypeScript modules
- Web Workers via Comlink
- deterministic RNG via seedrandom
- validation via Zod

### 36.3 Data, Saves, and Packaging
- Dexie.js over IndexedDB for persistence
- versioned migrations
- JSZip and pako for export/import
- Vite PWA plugin for installable offline operation
- Vitest and React Testing Library for testing
- macOS ZIP delivery with a one-click `Run.command`

### 36.4 Change in Direction
The master current direction explicitly removes Next.js from the client in favor of a Vite-only SPA. This simplifies offline packaging and supports the ZIP-first release model.

### 36.5 Python Use
The materials indicate that Python should preferably be used for build-time generation rather than broad runtime dependency, with Pyodide reserved for narrow runtime needs only.

---

## 37. Simulation Architecture Principles

### 37.1 Workerized Simulation
Simulation ticks should run in Web Workers so the UI stays responsive.

### 37.2 Centralized State with Selectors
The UI should subscribe to domain slices and derived selectors rather than handling business logic directly.

### 37.3 Determinism
Seeds should be serialized into saves to ensure reproducible outcomes, debugging clarity, and consistent replays where appropriate.

### 37.4 Feature Flagging
Incomplete systems should be gated cleanly so the build remains coherent and playable.

### 37.5 Save Compatibility
Migration discipline is mandatory if the game is shipped incrementally across many milestone builds.

---

## 38. Domain Model Guidance

The roadmap suggests domain-oriented state boundaries. A practical structure would include slices or modules such as:

- projects
- talent
- finance
- press
- rivals
- universes

This separation should support maintainability, performance, and easier feature iteration.

---

## 39. Delivery Philosophy and Definition of Done

The attached roadmap is explicit about delivery posture.

### 39.1 Playable Build Rule
Every sprint should ship a playable macOS ZIP build.

### 39.2 Use of Placeholders
“Coming Soon” stubs are allowed only for systems planned for future sprints, and the core loop must remain functional.

### 39.3 Minimum Done Criteria per Sprint
A sprint should generally be considered done when:

- the game is playable from title to dashboard to meaningful actions
- save/load functions
- new systems are integrated into the dashboard and newsfeed
- keyboard and reduced-motion support are respected
- performance remains acceptable on a mid-range Mac

---

## 40. Master Delivery Roadmap

The attached documents include two overlapping roadmap structures. This master bible reconciles them into a single chronological progression. The earlier roadmap is feature-rich and production-oriented; the later roadmap is more implementation-structured and Vite-aligned. Both are useful.

### 40.1 Delivery Model
Build labels continue in milestone form, with playable ZIP builds throughout development.

### 40.2 Master Sprint Sequence

#### Sprint A — Playable Core Prototype / Foundation
Goals:

- Vite + React SPA scaffold
- Zustand base architecture
- theming hooks
- studio creation and naming
- basic film/TV project creation
- procedural title generation
- weekly tick
- simple finances
- newsfeed
- save/load
- baseline rival studio generation

Outcome:
A working playable skeleton where the player can create a studio, greenlight projects, advance time, and see basic financial and headline outcomes.

#### Sprint B — FTUE, Archetypes, Talent, and Production Foundations
Goals:

- FTUE framework
- archetype and assistant selection
- first tutorial project
- actors, directors, writers, showrunners
- agents and agencies with traits
- casting and negotiations
- project pipeline board

Outcome:
The player now understands the game’s fantasy and can manage people systems around projects.

#### Sprint C — Economic Core and Finance UI v1
Goals:

- budget and ROI simulation
- weekly income/expense engine
- film revenue taper
- finance screen baseline
- top-bar cash widget
- stacked cashflow visualization
- forecast indicators

Outcome:
Finance becomes a visible, interpretable system rather than a hidden ledger.

#### Sprint D — Distribution, Rights, Liquidity, and Crisis
Goals:

- distribution structures
- regional rights
- festival sourcing and bidding
- bridge financing options
- debt and collateral logic
- default and restructuring mechanics

Outcome:
The player must think about rights and survival, not just project quality.

#### Sprint E — Talent Packaging and IP Retention
Goals:

- stronger packaging systems
- first-look logic
- co-production hooks
- IP retention model
- contract personality texture

Outcome:
Deals begin to matter long after signing.

#### Sprint F — Rival AI Economy, Genre Trends, and Studio Culture
Goals:

- differentiated rival strategies
- trend board
- workerized industry simulation
- studio culture system

Outcome:
The industry becomes a living ecosystem with identifiable studio personalities.

#### Sprint G — Festivals, Valuation, Marketplace Events, and Flavor Systems
Goals:

- festival valuation effects
- marketplace opportunities
- awards season flavor
- rumor mill
- casting gossip
- production catastrophes
- festival buzz meter

Outcome:
The game gains strong Hollywood drama and prestige-market texture.

#### Sprint H — Ratings System and Regional Rules
Goals:

- ratings framework
- content sensitivity flags
- editing hooks
- regional rule interactions

Outcome:
The player must think about what form of the project is commercially and culturally viable.

#### Sprint I — Demographics and Marketing Targeting
Goals:

- age, gender, and region model
- marketing targeting systems
- Weighted Audience Index
- audience response projections

Outcome:
Audience strategy becomes specific and legible.

#### Sprint J — Director Negotiations and Final Cut
Goals:

- director archetypes
- final-cut negotiations
- dispute events
- loyalty and PR connections

Outcome:
The central tension between creative autonomy and commercial control becomes systemic.

#### Sprint K — Ratings and Demographics Dashboard / Scenario Forecasting
Goals:

- integrated ratings and demographics dashboard
- forecast scenarios
- director-approval and project-position indicators

Outcome:
The player receives stronger decision support before release.

#### Sprint L — Press, Fandom, Controversies, and Recovery
Goals:

- press system expansion
- scandals and controversy loops
- fandom loyalty and backlash
- recovery arcs
- polished newsfeed behavior

Outcome:
Perception becomes one of the studio’s key resources.

#### Sprint M — Full UI/UX Polish
Goals:

- icons
- motion pass
- thematic cohesion
- archetype-specific presentation polish
- ambience and awards presentation tuning

Outcome:
The game’s visual identity locks into place.

#### Sprint N — Refactor, Performance, QA, and Tech Debt
Goals:

- type hardening
- store boundaries cleanup
- performance passes
- save migration verification
- balancing sweep
- bug fixing

Outcome:
The codebase becomes stable and maintainable enough for final release.

#### Sprint O — Gold Master and Epilogue
Goals:

- final balancing
- full persistence confidence
- QA completion
- packaging and final ZIP delivery
- dynamic epilogue reflecting the rise and fall of the player’s studio

Outcome:
Version 1.0 release.

---

## 41. Build Labeling Guidance

A practical labeling sequence based on the attached documents would look like:

- v0.1A
- v0.2B
- v0.3C
- v0.4D
- v0.5E
- v0.6F
- v0.7G
- v0.8H
- v0.9I
- v0.95J / onward as needed
- v1.0O at gold release

The exact middle-version labels may be adjusted, but the core rule should remain: every milestone is playable.

---

## 42. Open Design Priorities Going Forward

As this is a living document, future design additions should likely extend one or more of the following areas:

- deeper talent psychology and relationship memory
- expanded demographic targeting and marketing tools
- more detailed release-window strategy
- richer awards campaigning and guild politics
- staff and executive sublayers
- expanded international market modeling
- legacy archive and timeline presentation
- advanced franchise management and continuity pressure
- additional studio archetypes or start conditions

---

## 43. Canonical Design Principles Summary

To keep future additions aligned, the following principles should remain canonical:

1. **The game is about running a studio, not just shipping content.**
2. **Money and reputation are narrative engines, not isolated score systems.**
3. **Projects should create long-tail strategic consequences.**
4. **Talent should feel like people with leverage and memory.**
5. **Prestige and profit should remain in productive tension.**
6. **The dashboard is the command center.**
7. **The industry must feel alive even when the player is not directly touching it.**
8. **Every development milestone should remain playable.**
9. **The current product posture is an offline-capable Vite-based macOS experience.**
10. **The game should generate stories the player wants to retell.**

---

## 44. Current Canonical Product Statement

**Studio Boss is a dashboard-first, offline-capable, single-player Hollywood studio simulation for macOS where the player discovers, develops, finances, packages, releases, and publicizes film and television projects while competing in a living AI-driven industry and building a long-term studio legacy.**

---

## 45. Maintenance Note for Future Updates

When updating this document in the future:

- preserve section numbering where possible
- add new systems into the appropriate conceptual section rather than appending random notes
- update the roadmap only when sequence or scope meaningfully changes
- maintain clear distinction between current canon, implementation guidance, and future ideas
- prefer integrating new material into the master structure over creating replacement bibles

---

## Appendix A — Source Consolidation Notes

This master bible was synthesized from the following attached project documents:

- `StudioBoss_DesignBible_v4.9.md`
- `StudioBoss_DesignBible_v7.6.md`
- `StudioBoss_Roadmap_v5.1.md`

General reconciliation rules applied:

- newer technical direction supersedes older platform assumptions
- earlier documents remain valuable where they contain deeper system detail
- roadmap material has been folded into a single master progression
- duplicated ideas were merged into unified sections

---

## Appendix B — Short Studio Boss Elevator Pitch

Build the slate. Package the talent. Survive the quarter. Win the awards. Outlast the rivals.

Studio Boss is a Hollywood studio sim about making great bets under pressure and living with the consequences.
