# Studio Boss — Master Design Bible

**Version:** Master Draft 1.4 / Unified Non-Lossy v3.0  
**Status:** Living Design Document  
**Project:** Studio Boss  
**Genre:** Single-player Hollywood studio management simulation  


---

## 1. Purpose of This Document

This document collates and reconciles the currently attached design and roadmap materials into a single master design bible for **Studio Boss**. It is the unified non-lossy edition, intended to preserve all current canonical systems while also retaining useful implementation notes, roadmap framing, and legacy reference material from earlier drafts. It is intended to serve as the canonical reference for the project going forward.

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

### 9.8 Cohesion Framework
The game should explicitly treat all major systems as parts of one shared executive decision engine rather than separate minigames. The unifying player question is:

**What projects do I bet on, how do I package and finance them, where do I place them, and how do I survive the consequences?**

Every major system should either:

- change the quality of a bet
- change the cost of a bet
- change the risk of a bet
- change the upside of a bet
- or change which future bets become available

If a system does not affect one of those outcomes, it should be simplified, folded into another layer, or treated as flavor rather than strategy.

#### 9.8.1 The Project Card as the Center of Gravity
The project card should be the main point where the simulation comes together. Each active project or series should surface a shared set of executive-facing dimensions so the player can understand the full strategic picture without opening ten disconnected panels.

Recommended shared dimensions:

- commercial outlook
- prestige outlook
- production risk
- PR sensitivity
- buyer or distribution fit
- talent heat
- cash pressure
- rights value
- franchise or library potential

This creates a common language across film, scripted TV, unscripted TV, remakes, prestige plays, commercial plays, and M&A opportunities.

#### 9.8.2 Three Macro Resources
Most systems should ultimately roll up into three macro resources that remain visible across the entire game:

- **Cash**
- **Reputation**
- **Leverage**

Cash governs survival and expansion capacity.
Reputation reflects critic standing, audience trust, awards heat, and brand perception.
Leverage represents negotiating power: talent loyalty, buyer appetite, rights ownership, library strength, distribution access, and strategic bargaining position.

Secondary variables should usually feed one or more of these rather than remaining isolated score tracks.

#### 9.8.3 Cause Chains Instead of Stat Soup
Outcomes should be readable as cause chains. A healthy pattern is:

**Discovery** -> **Packaging** -> **Financing** -> **Production/Post** -> **Distribution/Release** -> **Outcome** -> **Next Opportunities**

This means, for example:

- attaching a star improves buyer confidence and opening reach but raises cost and scandal exposure
- giving a director final cut can improve prestige ceiling but reduce audience breadth
- selling rights can stabilize cash immediately but reduce long-tail leverage
- winning awards can improve renewal odds, talent access, and buyer confidence
- mishandling PR can damage present revenue and also weaken future deal terms

The player should be able to look backward after a result and understand the chain that produced it.

#### 9.8.4 Weekly Agenda Integration
The weekly rhythm should be the container that ties all systems together. Every week should deliver:

- a concise Monday brief framing opportunities, fires, and market shifts
- a mid-week action window where the player makes a small number of high-leverage decisions
- a Friday wrap showing what changed in cash, reputation, leverage, project health, buyer relationships, and rival behavior

This ensures finance, talent, TV buyer politics, awards, PR, and M&A all show up in the same cadence rather than feeling like competing timers.

#### 9.8.5 Shared Vocabulary Across Systems
The UI and simulation should reuse the same executive vocabulary everywhere possible. Terms like the following should remain consistent across project cards, buyer dossiers, talent screens, finance views, and postmortems:

- audience heat
- prestige
- risk
- readiness
- leverage
- cash pressure
- fit
- rights value

Consistent terms improve readability and help the player build a mental model of the whole industry.

#### 9.8.6 Studio Identity as the Meta-Layer
The long campaign should be tied together by the evolving identity of the player’s studio. Repeated choices should move the studio along recognizable axes such as:

- prestige vs commercial
- disciplined vs chaotic
- talent-friendly vs controlling
- niche vs broad
- owner-operator vs work-for-hire
- film-first vs TV-first

Studio identity should then influence which projects arrive, which buyers trust the studio, what talent accepts a call, how scandals are interpreted, and which M&A opportunities appear believable.

#### 9.8.7 Cross-System Collision Moments
To keep the game cohesive and memorable, the design should deliberately create recurring moments where many systems collide at once. Good examples include:

- pilot pickup week
- final-cut crisis
- awards campaign decision
- liquidity emergency
- merger opportunity
- hostile acquisition defense
- buyer mandate shift during renewal season

These are the moments where the game most clearly fulfills its promise of art, commerce, politics, ego, and survival colliding.

#### 9.8.8 One Strategic Question per Project per Week
As a practical cohesion rule, every active project should ideally present one clear executive question in a given week. Examples:

- Do we spend more to broaden this audience?
- Do we protect the director or protect the cut?
- Do we renew this series or shop it elsewhere?
- Do we sell rights to stabilize cash?
- Do we fold this label into our studio, buy this rival, or let the opportunity pass?

This rule keeps the game decision-dense without making it administratively bloated.

#### 9.8.9 Dashboard and Newsfeed as Connective Tissue
The dashboard and newsfeed should translate system interactions into readable, story-rich updates. Headlines should not merely report isolated events; they should explain how one system is influencing another.

Examples:

- final-cut fight lowers audience fit but raises prestige heat
- buyer freeze hurts renewal odds on an otherwise healthy show
- awards buzz improves talent leverage demands
- scandal harms launch awareness in one demo but boosts curiosity in another
- rival debt crisis creates an acquisition opening

This keeps the simulation legible and helps players retell what happened in their campaign.

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
- AI rival studios, mergers and acquisitions, and broader industry simulation
- television buyer ecosystems, distribution outlets, and pickup negotiations
- foreign format licensing, local remakes, and remake-rights strategy
- shared universes, crossovers, and legacy catalog systems
- dashboard-centric UI, cohesion framework, and finance visualization
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

### 13.4 Television as a Distinct Game Pillar
Television production should not feel like “film, but longer.” It should be one of the game’s deepest and most replayable systems, because series creation is where executive strategy, creative relationships, scheduling pressure, staffing, audience retention, and network politics all collide.

The TV side of Studio Boss should allow the player to pursue very different fantasies, including:

- building a mass-market network hit that runs for years
- nurturing a prestige limited series designed to dominate awards
- managing a reliable procedural that quietly funds riskier bets
- shepherding an animated comedy that takes longer to launch but becomes a library monster
- surviving a troubled first season and engineering a comeback in season two
- spinning a breakout supporting character into a companion series

### 13.5 TV Series Format Categories
Television projects should be created using clear format archetypes so that the player immediately understands what kind of machine they are building. Each format should carry different cost logic, staffing needs, awards pathways, renewal expectations, audience behavior, and production risks.

#### 13.5.1 Half-Hour Sitcom
Core traits:

- lower to mid budget per episode
- writer-heavy tone and joke-density needs
- cast chemistry matters more than spectacle
- repeatability and comfort-viewing increase long-tail value
- holiday episodes, guest stars, and “bottle episodes” can create efficient upside

Gameplay identity:

- easier to produce at volume once stable
- vulnerable to weak pilots and cast mismatch
- strong syndication/library upside if episode count grows
- awards path leans toward comedy performance and writing

#### 13.5.2 One-Hour Procedural
Core traits:

- medium to high episode count potential
- format engine built around repeatable case/problem structures
- dependable demographics and broad audience appeal
- less volatile than auteur prestige drama, but vulnerable to “stale formula” decline

Gameplay identity:

- ideal cashflow stabilizer for larger studios
- supports long multi-season runs
- showrunner durability and writers room efficiency matter heavily
- cast exits can be survivable if the format engine is strong

#### 13.5.3 Prestige Serial Drama
Core traits:

- high creative ambition
- stronger dependence on season arcs and cliffhangers
- expensive above-the-line talent and premium production value
- high critic upside, high cancellation pain

Gameplay identity:

- best for prestige-chasing studios
- weak weekly retention can turn acclaim into a financial problem
- season finales, surprise twists, and social buzz strongly matter
- final-cut, notes, and auteur conflict are especially important

#### 13.5.4 Limited Series / Miniseries
Core traits:

- fixed episode plan from the start
- marketed as a complete event
- can attract major film talent because commitment is finite
- strong awards positioning and lower long-tail renewal value

Gameplay identity:

- easier to package with stars and prestige directors
- lower long-run upside than an ongoing hit
- less exposed to season-two collapse
- ideal for true-story adaptations, literary projects, and high-end awards plays

#### 13.5.5 Animated Comedy / Animated Family Series
Core traits:

- longer development and production lead times
- voice cast flexibility
- high merchandising and replay value potential
- style consistency, pipeline efficiency, and overseas/vendor coordination matter

Gameplay identity:

- slower initial payoff but huge long-tail library value if it lands
- voice talent controversies are usually less catastrophic than live-action on-set crises
- franchise and spinoff potential is exceptionally strong
- holiday specials and crossover events can drive periodic spikes

#### 13.5.6 Animated Prestige / Adult Animation
Core traits:

- narrower but passionate audiences
- greater tonal experimentation
- strong cult and critic upside
- can take time to find a mainstream audience

Gameplay identity:

- excellent for brand differentiation
- vulnerable to executive panic if early metrics underwhelm
- cult recovery arcs should be common and satisfying

#### 13.5.7 Reality / Competition / Unscripted (Optional Expansion Track)
This format is not required for the first full TV pass, but the design bible should leave room for it because unscripted programming can become a vital low-cost counterweight to expensive scripted slates.

### 13.6 TV Lifecycle Overview
A TV series should move through a more granular lifecycle than a film, because the central fantasy is not just greenlighting a title but managing an evolving machine.

Recommended lifecycle:

1. Concept / Acquisition
2. Pitch & Internal Development
3. Pilot Script / Series Bible
4. Packaging & Showrunner Attachment
5. Pilot Order or Straight-to-Series Order
6. Writers Room & Season Break
7. Pre-Production
8. Production Block(s)
9. Post / Delivery
10. Premiere / Weekly Run or Full Drop
11. Renewal / Cancellation / Final Season Decision
12. Franchise Extension / Syndication / Catalog Afterlife

### 13.7 Series Creation Inputs
When creating a television project, the player should define more than just genre and budget. The game should ask for a concise but rich set of executive-facing choices that are intuitive on first use and deep over time.

Recommended series setup inputs:

- format category
- genre and tonal lane
- target rating
- target demographics
- intended platform model (network, streamer, premium cable, self-financed channel equivalent)
- season structure (episode count, runtime, release cadence)
- source material status (original, adaptation, reboot, spinoff)
- franchise intent (standalone, expandable, universe entry)
- prestige vs commercial priority
- production complexity (contained, standard, ambitious, effects-heavy, global)

### 13.8 Development Materials: Bible, Pilot, and Proof of Concept
TV development should revolve around concrete package elements rather than a single generic “script quality” number.

#### 13.8.1 Series Bible
The series bible should represent the show’s long-term engine. It influences:

- executive confidence in renewability
- showrunner attachment quality
- room efficiency
- long-term arc coherence
- spin-off and multi-season potential

A weak bible can still produce a flashy pilot, but it should create later-season instability.

#### 13.8.2 Pilot Script
The pilot script should matter separately from the series bible. It influences:

- whether buyers respond to the initial concept
- cast attachment quality
- early critic reaction
- first-episode retention
- conversion from marketing awareness into actual viewership

#### 13.8.3 Sizzle Reel / Table Read / Animatic
Depending on format, the project may also benefit from optional proof materials:

- live-action sizzle reel for tone-selling
- chemistry read for ensemble comedy
- animatic for animation timing/style confidence
- proof-of-concept short for weird or risky projects

These should cost time and money but improve order odds and buyer confidence.

### 13.9 Order Models: Pilot vs Straight-to-Series
A central TV decision should be whether the project earns a small commitment first or a full season pickup.

#### 13.9.1 Pilot Order
Advantages:

- lower initial risk
- allows testing cast chemistry and tone
- gives the player a salvage opportunity before full commitment

Disadvantages:

- delays launch
- increases risk of talent availability changes
- creates a public failure point if the pilot underperforms

#### 13.9.2 Straight-to-Series
Advantages:

- faster path to market
- stronger market signal and higher buzz
- helps secure in-demand talent

Disadvantages:

- much larger downside if the concept is unstable
- bad scripts or weak room leadership are punished harder
- cancellation after one season is more painful financially and reputationally

#### 13.9.3 Backdoor Pilot
Some projects should support backdoor pilots embedded inside an existing series or universe. These are lower-risk franchise plays and excellent for crossovers, but fans may resent blatant spin-off engineering if the execution is clumsy.

### 13.10 Showrunners as Core Power Players
Television should elevate showrunners into one of the game’s most important talent classes. They are not just head writers; they are the operational heart of a series.

Showrunner attributes should influence:

- room morale and speed
- rewrite quality
- budget discipline
- delivery reliability
- cast retention
- network/studio note management
- multi-season planning
- crisis recovery when episodes break or actors leave

Showrunner archetypes may include:

- machine operator
- auteur storyteller
- actor whisperer
- budget hawk
- chaos genius
- franchise architect

A great showrunner can rescue a flawed premise. A bad showrunner can sink even a hot package.

### 13.11 Writers Rooms and Season Breaking
Unlike film writing, TV writing should feel like a collaborative production engine. The writers room is where cost, pace, consistency, and season shape are won or lost.

#### 13.11.1 Room Configuration
The player should be able to influence:

- room size
- seniority mix
- comedy vs drama staffing emphasis
- diversity of voice/thought as a creative and PR factor
- use of freelance scripts versus tightly controlled in-room writing

#### 13.11.2 Break Quality
Before production, the room “breaks” the season. Strong breaks improve:

- arc coherence
- finale payoff
- retention between episodes
- production efficiency
- reduced mid-season panic rewrites

#### 13.11.3 Room Problems
Typical TV events should include:

- room factionalism
- missed outline deadlines
- showrunner burnout
- network note clashes
- actor feedback forcing character rewrites
- sudden topical relevance creating a rewrite opportunity

### 13.12 Season Structure and Episode Orders
The player should make explicit decisions about episode counts and structure because these choices define risk and upside.

Typical order ranges:

- 6 to 8 episodes: limited / prestige / premium model
- 10 to 13 episodes: streamer standard / cable hybrid
- 18 to 22 episodes: network procedural or sitcom workhorse
- specials / holiday episodes / event two-parters: optional boosters

Tradeoffs:

- shorter seasons preserve quality and prestige perception
- longer seasons increase fatigue risk but improve library size and monetization
- high episode counts reward dependable pipelines and repeatable formats
- short seasons concentrate marketing and awards focus

### 13.13 Production Planning by Format
TV production should use format-specific rules rather than a single generic schedule.

#### 13.13.1 Sitcom Production
Potential modifiers:

- single-cam vs multi-cam
- live audience energy bonus
- rehearsal efficiency
- set reusability and bottle episode savings

#### 13.13.2 Procedural Production
Potential modifiers:

- standing set efficiency
- case-of-the-week formula strength
- second-unit usefulness
- guest cast reliability

#### 13.13.3 Prestige Drama Production
Potential modifiers:

- location complexity
- production value pressure
- difficult directors
- serialized continuity risk

#### 13.13.4 Animation Production
Potential modifiers:

- script-to-screen lag
- storyboard throughput
- vendor delays
- retake volume
- voice cast scheduling flexibility

### 13.14 Weekly Release Models and Audience Behavior
Television should support multiple audience-consumption models because they materially change how a show lives in culture.

#### 13.14.1 Weekly Release
Benefits:

- stronger conversation persistence
- more time for fandom and critic momentum to build
- easier to course-correct marketing mid-season

Risks:

- weak early episodes can poison the run
- churn risk if momentum drops

#### 13.14.2 Full-Season Drop
Benefits:

- explosive launch-week attention
- binge-friendly prestige/event framing
- fewer weeks of exposure to negative discourse before completion

Risks:

- faster cultural burn-off
- harder to build long mid-season narrative momentum
- finale discussion may collapse quickly

#### 13.14.3 Split Season / Event Batch
Benefits:

- extends relevance window
- provides a second marketing beat
- useful for animation and expensive prestige drama

Risks:

- audience frustration between halves
- momentum loss if the gap is mishandled

### 13.15 Performance Metrics Unique to TV
TV success should not be represented by a single number. The player needs a readable dashboard that surfaces why a series is healthy or in danger.

Recommended TV metrics:

- premiere sampling
- episode-to-episode retention
- completion rate
- social buzz velocity
- audience fit by demographic target
- critic score trajectory
- awards heat
- cost per retained viewer
- international portability
- merchandising potential for family/animation titles
- syndication threshold progress

### 13.16 Renewal, Cancellation, and Final Season Decisions
Renewals should be one of the most satisfying and stressful moments in the TV game. They are not automatic rewards; they are executive judgment calls informed by data, cost, strategy, awards value, and schedule realities.

#### 13.16.1 Renewal Inputs
A renewal decision should weigh:

- audience size
- retention quality
- budget trajectory
- cast contract escalations
- showrunner willingness to continue
- awards value and studio prestige
- franchise and spinoff potential
- schedule fit within the slate
- library strategy and backend economics

#### 13.16.2 Renewal Outcomes
Possible outcomes:

- full renewal
- shortened renewal
- final season order
- soft reboot / cast refresh
- anthology reset
- cancellation
- pickup by another buyer or internal label

#### 13.16.3 Painful TV Stories the Game Should Generate
The system should be able to produce stories like:

- a critically adored season one that is too expensive to renew
- a mediocre procedural that keeps getting renewed because it prints reliable value
- a breakout comedy whose cast becomes unaffordable by season four
- a limited series that was meant to end but is tempted into a dubious second chapter
- an animated series that launches slowly, then becomes a merchandising powerhouse

### 13.17 Multi-Season Evolution
A show should not feel static after season one. Ongoing series need visible aging, escalation, fatigue, and reinvention.

Multi-season factors should include:

- cast salary inflation
- creative exhaustion or renewed confidence
- mythology bloat for serial dramas
- formula fatigue for procedurals
- iconic-character lock-in for sitcoms and animation
- quality rebounds after room refreshes or new directors
- fan attachment to status quo versus appetite for reinvention

### 13.18 Cast Contracts, Options, and Series Regular Status
TV contracting should create longer-term planning pressure.

Important contract concepts:

- pilot holds
- series regular vs recurring status
- option years
- escalation clauses
- episode guarantees
- exclusivity windows
- ensemble parity disputes

These systems are ideal for emergent drama because a cast member can become far more valuable after a breakout season than they were when first signed.

### 13.19 TV-Specific Event Deck
To keep the feature fun and alive, television should have a robust event deck tuned to format and season stage.

Example events:

- chemistry read goes electric
- pilot audience loves one supporting character
- network hates the ending
- showrunner demands two more room weeks
- star booked a film and needs schedule accommodation
- episode 7 script collapses
- holiday special opportunity
- bottle episode saves the budget
- fan campaign saves a bubble show
- leaked finale triggers spoiler panic
- actor exit forces emergency rewrite
- awards buzz revives renewal chances

### 13.20 TV Awards and Recognition Pathways
TV series should feed different recognition lanes depending on format.

Examples:

- sitcoms chase comedy acting/writing/series awards
- prestige dramas chase drama series, directing, and acting awards
- limited series compete in event/miniseries categories
- animation can compete in animation and voice/performance-adjacent prestige lanes

Awards should matter because they can:

- improve renewal leverage
- justify higher budgets for future seasons
- attract better guest stars and directors
- increase library value and cultural prestige

### 13.21 Fun-First, Intuitive UX for TV Management
The system should be deep, but the player should never feel buried in a scheduling spreadsheet. TV management must be executive-readable.

Recommended UX structure:

- a dedicated Series Dashboard card with season status at a glance
- one prominent “season health” strip summarizing budget, scripts, retention, morale, and renewal odds
- expandable episode tracker, not a mandatory micromanagement grid
- clear warning states like “Pilot Risk,” “On the Bubble,” “Cost Spiral,” and “Prestige Breakout”
- format-specific tooltips that teach the player why a sitcom behaves differently from a limited series

The player should feel like they are steering a show, not filling out production accounting forms.

### 13.22 AI Rival Television Behavior
Rival studios should actively participate in the television market so the player feels pressure from a living slate.

Rival TV behavior should include:

- bidding on hot pitches
- cancelling too early and leaving value on the table
- over-renewing expensive prestige darlings for vanity reasons
- exploiting procedurals and family animation as balance-sheet anchors
- launching spin-offs after your breakout hits prove a lane exists

### 13.23 Strategic Role of TV Inside the Full Studio Simulation
TV should serve several strategic functions within the overall game economy and identity system:

- steadying cashflow between risky films
- building recurring audience relationships
- creating awards opportunities in years without a strong film slate
- providing incubators for IP, spin-offs, and talent development
- generating catalog durability that supports long-term studio survival

A studio with no TV presence should feel more volatile. A studio overcommitted to TV should risk brand flattening, executive overload, and creative sameness.

### 13.24 Canonical TV Design Principle
Television in Studio Boss should be designed around one core truth:

> **A series is not just a project. It is an organism.**

The player should feel the difference between launching a movie and nurturing a show through pilots, seasons, renewals, cast crises, format fatigue, awards runs, and eventual legacy value.

### 13.25 Buyer Ecosystem: Networks, Streamers, Premium, and Self-Distribution
A studio does not simply make television and magically reach an audience. In most cases, it needs a buyer, commissioner, platform partner, or owned outlet strategy. That dependency should be a major source of leverage, tension, and fun.

TV buyers should exist as active market actors with brand identity, appetite, budget behavior, and executive personalities. The player should regularly ask:

- who is this show actually for at the buyer level
- which outlet values this concept most
- whether to sell the show outright, co-finance it, or keep more downstream rights
- whether to accept restrictive notes in exchange for security and marketing muscle
- whether to launch through the studio’s own outlet if one exists

Recommended buyer archetypes:

- **Broad Linear Network**: wants reach, consistency, ad-friendly tone, and repeatable formats
- **Prestige Premium Outlet**: wants buzz, critical love, and awards identity
- **Mass-Market Streamer**: wants subscriber acquisition, completion rate, and broad recommendation appeal
- **Niche Streamer**: wants strong fit with a passionate segment or fandom lane
- **AVOD / FAST Channel Equivalent**: wants volume, library durability, comfort-viewing, and low-cost engagement
- **Public Broadcaster / Cultural Outlet**: values critical respect, local relevance, and public mission alignment
- **Studio-Owned Outlet**: highest control and rights retention, but highest cost and exposure

Each buyer should expose visible traits such as:

- genre appetite
- tolerance for risk, controversy, and ratings heat
- target demos
- marketing support strength
- patience for slow-burn audience growth
- cancellation aggression
- budget ceiling
- openness to co-productions and foreign formats
- note intensity
- international footprint

### 13.26 Greenlight, Pitch, and Pickup Negotiation Layer
Series projects should enter a dedicated buyer-facing phase after internal development. The player is no longer only deciding whether a show is good. They are deciding how to position it to get made.

The pitch-to-pickup loop should support:

- internal pitch refinement before going out to market
- targeting one buyer, a shortlist, or a broad market sweep
- packaging different cuts of the same idea for different buyers
- buyer-specific meeting outcomes driven by fit, package strength, and trend timing
- bidding wars for hot packages
- soft passes with rewrite requests
- direct pickup offers, pilot commitments, or put-pilot deals
- turnaround, where a passed project can be taken elsewhere after penalties or delays

Negotiation variables should include:

- license fee or production financing
- episode order and runtime
- platform exclusivity
- domestic vs international rights splits
- merchandising and ancillary rights
- renewal option structure
- minimum marketing commitment
- release window promises
- creative approvals and notes process
- cancellation penalties or kill fees where appropriate

This phase should feel like one of the game’s signature executive arenas, sitting beside talent negotiation and final-cut conflict.

### 13.27 Distribution Models for Television
TV business models should be meaningfully different, not cosmetic wrappers over the same math.

#### 13.27.1 Linear Network Commission
Core behavior:

- buyer pays a license fee or cost-plus structure
- ad sales and affiliate economics mostly sit with the buyer unless the player owns the outlet
- bigger dependence on weekly ratings, lead-ins, and schedule slots
- stronger pressure for broad demos and episode consistency

Gameplay effects:

- lower downside for the studio than self-releasing
- less control over scheduling and promotion
- renewals may depend on ratings rank relative to time slot and price
- long-running procedurals, sitcoms, and competition formats thrive here

#### 13.27.2 Streaming License / Original
Core behavior:

- buyer may fund heavily up front or in milestone installments
- performance is judged through completion, subscriber contribution, retention, and conversation heat
- full-season drops, split drops, and hybrid models all matter
- opaque platform metrics create uncertainty

Gameplay effects:

- stronger upside for prestige and bingeable serials
- harder for the player to read true performance unless they have leverage or data partnerships
- cancellation risk can feel abrupt if cost-to-engagement ratio turns bad
- streamer notes may emphasize hook strength and global portability

#### 13.27.3 Premium Channel / Prestige Outlet
Core behavior:

- lower volume, higher brand curation
- stronger tolerance for adult tone and prestige ambition
- awards and critical standing weigh heavily

Gameplay effects:

- easier home for limited series and auteur drama
- slower audience growth can still be acceptable if prestige and churn protection are strong
- talent cachet matters more than pure mass appeal

#### 13.27.4 International Co-Production and Presales
Core behavior:

- financing assembled from multiple territory partners
- rights carve-outs become more complex
- casting, language mix, and setting may change to satisfy partners

Gameplay effects:

- lowers financing burden
- raises negotiation complexity
- can unlock global stories and subsidies
- may create conflicting note chains and delivery obligations

#### 13.27.5 Studio-Owned Outlet
Core behavior:

- the studio owns the release window and data
- all marketing, scheduling, and platform upkeep costs sit closer to the player
- stronger library and brand flywheel if executed well

Gameplay effects:

- highest control and rights retention
- highest near-term cash exposure
- enables franchise curation, event weeks, vault strategy, and catalog bundling
- poor platform health can drag down even good shows

### 13.28 Scheduling, Slotting, and Launch Strategy
Once a show is sold or self-scheduled, placement should matter.

For linear and hybrid outlets, the player or buyer-facing simulation should consider:

- fall launch vs midseason vs summer burn-off
- strong lead-in support vs death slot placement
- weekly slot competition from rival hits and sports-equivalent events
- holiday interruptions
- episode split scheduling and hiatus risk

For streaming and owned outlets, the player should choose or negotiate:

- binge drop vs weekly rollout vs split-cour release
- global same-day launch vs territory staggering
- event premiere with heavy campaign support vs quiet catalog-style release
- windowing onto secondary outlets later

Placement outcomes should influence:

- awareness conversion
- week-to-week retention
- press narrative
- renewal odds
- long-tail library value

### 13.29 Robust Television Genre Matrix
Television should support a broad, readable genre matrix across scripted and unscripted production.

#### 13.29.1 Scripted Genres
The core scripted genre families should include:

- sitcom
- workplace comedy
- family comedy
- dramedy
- procedural crime
- legal
- medical
- emergency / first responder
- detective / mystery
- soap / melodrama
- teen drama
- prestige family saga
- political thriller
- espionage thriller
- sci-fi adventure
- space opera
- fantasy epic
- supernatural horror
- anthology horror
- romantic drama / romantic comedy series
- historical / period drama
- action adventure
- adult animation
- family animation
- anime-inspired action or genre animation

Each genre family should connect to:

- budget tendencies
- target ratings
- demographic attraction
- renewal durability
- awards lanes
- merchandising or franchise upside
- international export strength

#### 13.29.2 Unscripted and Reality Genres
Unscripted television should be fully supported as a major business lane rather than a footnote.

Core unscripted families should include:

- competition reality
- dating reality
- docuseries
- true crime docuseries
- lifestyle / makeover
- food / travel
- talent competition
- survival / adventure competition
- social experiment
- housewives / ensemble interpersonal reality
- workplace factual entertainment
- game show / quiz
- clip / panel / topical comedy format
- children and family unscripted

Unscripted systems should behave differently from scripted TV in several ways:

- lower script development costs
- casting depends on personalities, archetypes, and volatility rather than star acting talent
- faster turnaround for trend exploitation
- higher scandal, ethics, and participant-welfare risk
- easier international format adaptation
- often stronger ad-friendly volume economics than awards upside

This gives the player meaningful reasons to use unscripted as:

- a low-cost survival lane during cash crunches
- a mass-market brand extension tool
- a trend-responsive counterprogramming strategy
- a feeder into spinoffs, reunion specials, and all-star returns

### 13.30 Format Rights, Foreign IP Licensing, and Local Remakes
One of the most fun and authentic TV-business systems should be format rights and remake licensing.

The player should be able to acquire television IP in multiple ways:

- option a finished foreign scripted format for local remake
- license an unscripted format bible from another territory
- acquire remake rights to a cult short-run drama and relaunch it for a different market
- buy regional adaptation rights while another studio holds other territories
- co-develop a local-language version with the original rights holder

Format-rights packages should specify things like:

- territory scope
- language scope
- term length
- sequel / spin-off rights
- merchandising and ancillary rights
- approval rights held by the original creator or distributor
- required format elements that must remain recognizable
- format royalty or per-episode fees

Remake/adaptation gameplay should create real strategic tradeoffs:

Advantages:

- existing proof of concept lowers concept risk
- easier buyer pitch because the format already has precedent
- awards or critic history from the source version may add prestige halo
- strong fit for unscripted, procedurals, and high-concept limited series

Risks:

- local audience may reject a remake as inauthentic or unnecessary
- cultural translation may be mishandled
- approval-heavy licensors may slow production
- comparison discourse can hurt critics and fandom sentiment
- foreign hit status can inflate license fees and reduce margins

The remake system should include adaptation choices such as:

- faithful remake
- tonal reinterpretation
- prestige reimagining
- genre swap
- localized setting and cultural rewrite
- star-driven remake built around a specific talent package

A well-adapted remake should feel clever and commercially sharp. A badly adapted one should feel like expensive executive cynicism.

### 13.31 Buyer Mandates, Platform Politics, and Taste Profiles
TV buyers should not behave like static vending machines. Every outlet should feel like it is run by human executives under pressure, with changing mandates, changing bosses, changing financial constraints, and changing taste priorities.

This system should make the act of selling television feel alive from year to year. A buyer that loved edgy auteur dramas two years ago may now want cheaper broad-audience comfort fare because of subscriber churn, a merger, an ad-tier pivot, or a new content chief.

#### 13.31.1 Buyer Identity Layer
Each buyer should have a readable but dynamic identity card containing:

- brand promise to audiences
- current corporate health
- target audience profile
- risk tolerance
- current genre appetites
- preferred budget band
- franchise hunger vs original-IP appetite
- awards ambition vs mass-market mandate
- domestic priority vs global portability priority
- executive stability vs internal chaos

This should appear in a buyer dossier UI so the player can quickly understand not just what a company says it wants, but what it is likely to reward in practice.

#### 13.31.2 Mandate Shifts
Mandates should be semi-predictable strategic changes that reshape what buyers want over time.

Examples include:

- prestige-to-profit pivot after investor pressure
- broad four-quadrant push after a period of niche losses
- family programming expansion
- unscripted volume strategy during austerity
- international-local production push in a key territory
- IP exploitation wave focused on known brands, games, books, or old catalog titles
- ad-tier support strategy requiring high-episode-count engagement programming
- awards push in response to brand weakness
- cost discipline order that deprioritizes expensive sci-fi and period drama
- youth-demo chase after audience aging becomes visible

Mandate shifts should be driven by events such as:

- mergers and acquisitions
- activist investor pressure
- executive turnover
- stock-price collapses or debt pressure
- rival breakout hits changing market behavior
- ad-market contraction or rebound
- regulatory changes in local-content obligations
- technology or distribution shifts such as FAST, AVOD, or bundle integration

Gameplay effects of mandate shifts:

- pitch fit scores change across genres and formats
- existing projects in development may lose support or gain sudden heat
- note patterns change, sometimes drastically
- renewal odds move even if a show’s raw performance stays stable
- projects can be stranded in “legacy mandate” limbo if they were bought under an older regime

Mandate shifts should be telegraphed through trades, earnings-call headlines, executive gossip, and buyer-relationship meetings so they feel legible rather than random punishment.

#### 13.31.3 Budget Freezes and Austerity Windows
Buyers should periodically enter constrained states where even good projects become harder to sell or renew.

Budget freeze states may include:

- soft freeze: fewer new orders, stricter per-episode caps, more rewrite demands
- hard freeze: near-total pause on new scripted orders except elite packages
- selective freeze: only expensive genres or originals are constrained while formats and franchise extensions continue
- marketing freeze: projects are still bought, but launch support is weaker than promised

Budget freezes can emerge from:

- missed earnings
- debt refinancing pressure
- subscriber losses
- advertising downturns
- merger integration costs
- corporate scandals or leadership uncertainty
- major overspend on a failed tentpole slate

Gameplay consequences:

- more projects get passed despite strong creative scores
- buyers push toward co-financing, deficit financing, or lower episode counts
- straight-to-series becomes rarer outside proven IP or elite talent packages
- renewals become shorter, cheaper, or conditional
- “bubble shows” become common, creating end-of-season suspense
- the player may strategically pivot into unscripted, remakes, animation in lower-cost pipelines, or foreign-format adaptations

The goal is not to make the player powerless. The fun comes from reading the market early and adjusting slate strategy before the freeze hits hardest.

#### 13.31.4 Buyer-Specific Taste Profiles
Every buyer should maintain a taste profile that is more specific than genre labels.

Taste-profile dimensions may include:

- optimism vs cynicism
- procedural comfort vs serialized complexity
- accessible hook vs slow-burn sophistication
- edgy adult tone vs broad family safety
- grounded realism vs elevated genre
- franchise familiarity vs bold originality
- celebrity-driven packaging vs concept-driven bets
- domestic specificity vs internationally legible stories
- weekly-return habit formation vs binge completion power
- talk value / social conversation potential

This means two buyers may both “want crime,” but for different reasons:

- one wants cozy case-of-the-week comfort with older demos
- another wants dark serialized prestige for awards and social buzz
- another wants glossy YA thriller energy for global streaming completion

The system should reward the player for understanding the buyer beneath the headline mandate.

#### 13.31.5 Named Executive Archetypes
At key buyers, the player should interact with specific executive personas rather than an abstract corporate blob.

Relevant roles may include:

- network president
- head of scripted
- head of unscripted
- streamer content chief
- comedy chief
- drama chief
- current programming executive
- acquisitions lead
- international formats lead
- finance or greenlight committee figure

Executive archetypes may include:

- tastemaker visionary
- mandate enforcer
- cost-cutter
- relationship loyalist
- trend chaser
- awards obsessive
- broad-audience operator
- chaos politician

Each executive should have attributes such as:

- genre preferences
- ego and credit hunger
- loyalty memory
- patience with overruns
- appetite for talent heat
- trust in the player’s studio
- tolerance for scandal risk
- likelihood of giving useful notes vs destructive notes

This creates more dramatic outcomes such as a project surviving because one buyer champion loves it, or dying because a new regime sees it as a symbol of the old boss.

#### 13.31.6 Buyer Politics and Internal Friction
Buyers should contain internal disagreement. Development, finance, marketing, ad sales, and international divisions may not want the same thing.

Examples:

- creative executives love a costly sci-fi drama, but finance rejects the spend
- the domestic team dislikes a format, but international sees remake potential
- marketing wants a star-heavy package while current programming prefers a procedural workhorse
- the ad-sales team pressures for broader demos and lighter tone
- awards teams champion a limited series that subscriber teams view as weak on retention

Gameplay expression:

- some pitches trigger internal-review mini outcomes
- the player may make concessions to win one department without fully satisfying another
- a well-connected executive producer or agency ally may help close a politically difficult sale
- a project can be ordered with compromised terms if internal support is split

This gives TV dealmaking more texture than a single yes/no score check.

#### 13.31.7 Buyer Health States
Each buyer should operate in a visible but not perfectly transparent health state.

Possible health states:

- expansion
- stable
- cautious
- austerity
- merger turbulence
- turnaround mode
- prestige rebuilding
- ad-growth chase
- library monetization phase

Health states should alter:

- appetite for originals
- marketing reliability
- tolerance for long-term bets
- renewal stability
- willingness to overpay for star packages
- volume of overall orders

This lets the player learn which buyers are dependable homes and which ones are seductive but volatile.

#### 13.31.8 Mandates and Renewals
Renewal decisions should not depend only on ratings or completion. They should be interpreted through the buyer’s current strategic lens.

Examples:

- a modest but stable procedural may be renewed during austerity because it is cheap and dependable
- a critically adored prestige drama may die because the new regime wants broader programming
- an underperforming reality format may survive because the buyer urgently needs volume and ad inventory
- a costly science-fiction show may be renewed one last time if it anchors global brand identity

This keeps renewal drama grounded in believable executive logic rather than purely hidden math.

#### 13.31.9 Player Counterplay Against Buyer Volatility
The player should have tools to mitigate buyer volatility.

Counterplay options should include:

- cultivating personal relationships with key executives
- tailoring pitches to current mandates without betraying the core idea
- building multiple cuts of a package for different buyers
- retaining rights flexibility so projects can move after passes or cancellations
- using foreign-format remakes and unscripted lanes during budget crunches
- keeping a mix of prestige, reliable, and low-cost projects on the slate
- owning or partially owning distribution to reduce dependence on third-party buyers
- reading trade coverage and analyst-style dashboard signals to anticipate regime changes early

A sophisticated player should feel rewarded for behaving like a real executive strategist instead of merely chasing the highest script score.

#### 13.31.10 Buyer Dossier UI
The buyer UI should be one of the most valuable television-management screens in the game.

Recommended dossier elements:

- outlet identity summary
- live mandate tags
- current health state
- taste-profile sliders or badges
- recent pickups and cancellations
- active executive roster
- relationship strength with the player
- average order size and budget comfort band
- current freeze or slowdown warnings
- notes tendencies
- rights friendliness
- renewal reliability score

The player should be able to compare buyers side by side when choosing where to take a project.

#### 13.31.11 News, Gossip, and Discovery Surface
Mandate shifts and freezes should surface through multiple channels:

- trade headlines
- assistant alerts
- agency chatter
- executive lunch reports
- earnings-call summaries
- rumor items of varying reliability
- sudden changes in buyer response patterns

A skilled player should be able to piece together the real story before it is officially announced.

#### 13.31.12 Canonical Buyer-Politics Principle
The TV market should follow one more governing truth:

> **A good show does not sell into a vacuum. It sells into a moving target shaped by mandates, politics, and money.**

The player fantasy improves when success depends not only on making strong material, but on understanding who is buying, why they are buying, and what has changed since last quarter.

### 13.32 Ownership, Backend, and Renewal Leverage in TV Deals
TV dealmaking should make rights ownership matter over years, not just weeks.

The player should be able to negotiate or track:

- who owns the underlying format or series bible
- domestic first-run rights
- international sales rights
- library window after first exhibition
- remake rights in other territories
- sequel, spin-off, reunion, and special rights
- ad-sales participation for owned outlets
- subscriber-bonus or performance kicker equivalents
- backend pools for creators, stars, and showrunners

These variables should shape long-term leverage such as:

- whether a hit show enriches the buyer more than the studio
- whether later-season renewals become financially painful because cast escalators outrun license growth
- whether the player can move a cancelled show to a new home
- whether a foreign remake becomes a surprise windfall years later
- whether a studio-owned outlet becomes viable thanks to retained library strength

### 13.33 Canonical TV Market Principle
The television market should be governed by one additional truth:

> **Making the show is only half the game. Getting it picked up, placed, renewed, and retained is the other half.**

A great series without the right buyer, deal, slot, or rights structure should still be capable of failing in fascinating ways.

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
| Linear / Network Commission | Paid on delivery or via license fee milestones | Low |
| Streaming License / Original | Paid in installments with platform opacity | Medium |
| Premium / Prestige Outlet | More curated, prestige-sensitive payment profile | Medium |
| International Co-Production | Mixed financing from multiple partners | Medium |
| Self-Owned Airing / Studio-Owned Outlet | Weekly revenue and library upside | High |

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

### 15.5 Mergers, Acquisitions, and Asset Strategy
M&A should be a major strategic layer rather than a rare end-state cutscene. In Studio Boss, acquisition activity should appear in three main forms:

- **asset acquisitions** such as buying a library, label, format catalog, rights package, or production facility
- **control acquisitions** such as buying a rival indie, distressed studio, animation house, unscripted banner, or foreign production partner
- **defensive transactions** such as selling a minority stake, accepting a strategic investor, merging to survive, or using a white-knight partner to avoid a hostile takeover

#### 15.5.1 Why M&A Exists in the Design
M&A connects finance, rights, talent, TV buyer politics, studio identity, and rival simulation. It gives the player a way to turn cash or leverage into lasting structural advantage rather than only funding individual projects.

#### 15.5.2 Acquisition Targets
Possible acquisition and merger targets include:

- distressed rival studios
- boutique prestige labels
- unscripted production companies
- animation houses
- genre specialists
- international co-production partners
- libraries of finished films or series
- format catalogs and remake-rights portfolios
- minority stakes in streamers, channels, or distribution outlets

Each target should have a distinct reason to buy it: rights depth, buyer access, talent relationships, production efficiency, demographic reach, awards credibility, or immediate cash generation.

#### 15.5.3 Deal Structures
M&A should support multiple deal types rather than a single buyout button. Recommended structures include:

- cash acquisition
- stock or valuation-based merger
- earn-out tied to future performance
- distressed debt-to-control conversion
- minority strategic stake
- asset carve-out
- management buyout support
- roll-up of multiple small labels into one group

Different structures should shift risk between liquidity, integration complexity, control, and future upside.

#### 15.5.4 Integration and Post-Deal Friction
Buying a company should create opportunities and headaches. Integration factors should include:

- retained executive loyalty
- culture clash
- talent flight risk
- buyer distrust during transition
- overlapping slates and duplicate overhead
- synergy gains from shared marketing, distribution, legal, or finance functions
- antitrust or regulatory scrutiny at higher market share levels
- brand dilution if a beloved boutique label is absorbed too aggressively

The player should sometimes choose between tight integration, loose label autonomy, or eventual asset stripping.

#### 15.5.5 Hostile vs Friendly Deals
Not every deal should feel the same.

- **Friendly deals** are easier to integrate and preserve talent goodwill, but often cost more.
- **Hostile deals** are cheaper or faster in moments of distress, but create deeper culture damage, PR risk, and defection risk.
- **Rescue mergers** can save both parties but may create years of operational drag.

#### 15.5.6 Gameplay Uses of M&A
M&A should solve or create real strategic problems. Examples:

- buying an unscripted label during a budget freeze to stabilize cashflow
- acquiring a foreign format house to improve remake and adaptation access
- merging with a debt-heavy rival to gain their library but inherit their liabilities
- selling a minority stake to survive a bad quarter while preserving independence
- buying a struggling network or streamer shell to secure distribution for future series

#### 15.5.7 M&A UI Concept
The player should manage this system through a dedicated **Corporate Strategy / M&A** layer connected to the finance screen and rival dossiers. It should show:

- target valuation
- debt burden
- catalog value
- cultural fit
- buyer/distribution assets
- expected synergies
- integration risk
- regulatory pressure
- effect on cash, reputation, and leverage

#### 15.5.8 Design Rule
M&A should never be mandatory for every run, but it should be one of the clearest ways advanced players reshape the board itself instead of merely reacting to it.

### 15.6 Rival Use
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

### 17.6 Family, Lineage, and Hollywood Dynasty System
Studio Boss should explicitly model entertainment families and lineage networks as a major sub-layer of the talent ecosystem. The real-world industry repeatedly produces sibling collaborations, multi-generation dynasties, famous surnames, child stars who grow into adult performers, and “nepo baby” debates. This system should capture the strategic upside of family networks while also generating jealousy, entitlement, legacy pressure, and public skepticism.

The design goal is not celebrity parody. It is to represent a recurring Hollywood truth: talent does not enter the industry on a level playing field, and family ties often act as both accelerant and curse.

### 17.7 Core Design Goals of the Lineage System
The family and lineage layer should:

- make some talent enter the world with pre-existing access, reputation, or pressure
- create collaboration patterns such as sibling duos, parent-child pipelines, and entire family creative circles
- generate rivalry, resentment, and succession drama within families
- deepen child-star arcs and long-term career evolution
- create richer PR stories around nepotism, favoritism, and “legacy expectations”
- produce meaningful differences between earned breakout stars and heavily connected insiders
- interact with awards, fandom, press, agent leverage, and studio culture

### 17.8 Family Entities and Lineage Data Model
Each talent character may optionally belong to a **Family / Lineage entity**.

A family entity should track:

- family name and public recognition level
- industry branches represented in the family, such as acting, directing, writing, producing, music, or executive power
- prestige legacy, commercial legacy, scandal legacy, and volatility legacy
- notable living members and deceased legends
- internal relationship graph between family members
- whether the family is considered respected, chaotic, overexposed, revived, faded, or newly rising

This allows the game to create several recognizable dynasty patterns:

- old-money acting dynasties
- writer-director sibling teams
- powerful producer families
- actor-director parent/child chains
- child-star households that turn into mini-empires
- chaotic tabloid families with recurring PR blowups

### 17.9 Family Archetypes
Families should be generated or authored around archetypes so they feel distinct.

Suggested archetypes include:

**Classic Dynasty**  
Old industry bloodline with awards pedigree, strong prestige gravity, and intense expectations. Great for awards campaigns, harder for rebellious reinvention.

**Prestige Clan**  
Known for filmmakers, auteurs, and festival credibility. Strong critic upside, high ego friction, often resistant to crass commercial notes.

**Commercial Hitmakers**  
A family associated with broad audience instincts, franchise savvy, and highly bankable names. Good return on investment, somewhat less awards heat.

**Child-Star Factory**  
A family that pushes children into the spotlight early. High early earning potential but elevated burnout, addiction, scandal, and identity-crisis risk.

**Chaotic Tabloid Family**  
Massive name recognition, erratic behavior, unstable loyalty, and recurring PR fires. Great headline generation; terrible predictability.

**Rebuilder Lineage**  
A once-famous family trying to reclaim relevance through one breakout member. Strong comeback storytelling and legacy-pressure hooks.

### 17.10 Relationship Types Within Families
Family ties should be more specific than a generic “related to” flag.

Supported relationships should include:

- siblings
- half-siblings / step-siblings
- parent-child
- cousins
- spouses / ex-spouses within entertainment families
- mentor-relative relationships such as aunt/uncle stewardship
- family manager / guardian dynamics for minors

Each relationship should track affinity, rivalry, trust, dependency, and public narrative.

This enables combinations such as:

- supportive siblings who demand package deals together
- estranged siblings competing for the same awards lane
- a powerful parent overshadowing an adult child’s career
- cousins who quietly sabotage each other through agencies and gossip
- a former child star protecting a younger sibling from exploitation

### 17.11 Sibling Collaborations and Duos
A major expression of the system should be **sibling collaboration teams**, inspired by real-world patterns such as the Coen brothers’ long-running partnership and other family-based creative duos. Sibling teams should not be limited to directing. They can appear as:

- co-director siblings
- director-writer siblings
- producer-director siblings
- actor-director sibling pairs
- actor ensembles from the same family

Sibling teams should gain special bonuses when paired correctly:

- shared shorthand bonus, reducing development friction
- unified taste bonus, improving tonal consistency
- press-story bonus, increasing pre-release interest
- loyalty bonus, making them less likely to split for small financial differences

But sibling teams should also carry special risks:

- one sibling overshadowing the other
- co-credit disputes
- public breakup risk after a failure
- resentment if the studio attempts to separate them
- family loyalty overriding studio schedule needs

### 17.12 Family Rivalries and Succession Drama
Not all lineage is cooperative. Rivalries are one of the most fertile drama generators in the system.

Possible rivalry forms include:

- sibling rivalry over artistic legitimacy
- “golden child” resentment inside a famous family
- parent-child conflict over career direction
- public feuds over remakes, franchises, or casting
- competing family branches pursuing the same awards lane
- ex-child-star bitterness toward a younger relative receiving better launch support

Rivalries should affect:

- negotiation difficulty
- package stability
- gossip frequency
- awards campaign sabotage risk
- set morale when both relatives are attached to one project
- press tone if the feud becomes public

Families should also experience **succession pressure**. When an elder legend retires, dies, or becomes inactive, the family may enter a volatile phase where heirs compete to define the next chapter of the brand.

### 17.13 Nepotism, Access, and the “Nepo Baby” Layer
The game should include an explicit but nuanced **Access / Nepotism** model.

Talent may enter the simulation with one of several access origins:

- self-made outsider
- connected outsider with soft access
- legacy child with strong access
- dynasty heir with extreme access
- rescued comeback from a faded family

This should not function as a moral judgment meter alone. Instead, access affects the starting conditions of a career:

- easier agency representation
- earlier audition and meeting access
- better odds of early packaging consideration
- higher baseline media attention
- stronger safety net after a flop
- inherited goodwill in some circles and skepticism in others

To balance this, high-access talent should often carry additional burdens:

- elevated press scrutiny around favoritism
- harsher backlash when underperforming
- comparisons to famous relatives
- entitlement risk or underdeveloped craft
- family brand damage after scandals

The player should frequently face strategic questions such as:

- is this talent genuinely excellent, or merely well-connected?
- can the studio survive the bad PR of obvious favoritism?
- is it worth betting on a raw but famous surname for marketing value?
- does pairing a nepo baby with a respected veteran legitimize them or create resentment?

### 17.14 Talent Attribute Expansion for Lineage Play
To support family dynamics, the talent model should expand beyond basic reputation and skill.

Recommended additional attributes:

- **Raw Talent**: natural creative or performance ability
- **Craft Discipline**: work ethic, training, and reliability
- **Instinct / Taste**: quality of creative choices and project fit
- **Charisma**: interview strength, public magnetism, and campaign charm
- **Legacy Burden**: psychological pressure of living up to a family name
- **Entitlement**: expectation of special treatment
- **Hunger**: drive to prove oneself independently
- **Family Loyalty**: willingness to prioritize relatives over career efficiency
- **Reinvention Capacity**: ability to escape typecasting or family comparison
- **Guardian Influence**: how much a parent, agent, or manager controls choices

These values should combine with the existing descriptor-based personality system rather than replace it.

### 17.15 Child Stars and Early-Career Family Pipelines
Child stars should become a dedicated sub-system, especially because they are one of the clearest ways lineage, access, exploitation risk, and long-term career arcs intersect.

A child performer should track:

- age band
- stage-schooling / training quality
- guardian stability
- public cuteness / breakout appeal
- resilience and emotional maturity
- burnout risk
- scandal exposure risk through family or entourage
- transition potential into teen and adult roles

Child stars may originate from:

- entertainment dynasties
- ambitious stage-parent households
- studio discovery programs
- viral or advertising breakouts
- prestige-family protégés being launched carefully

#### Child Star Lifecycle
A child-star career should evolve through multiple phases:

1. **Discovery / Cute Novelty**  
   Fast audience affection, limited craft, highly guardian-controlled.

2. **Teen Transition**  
   High volatility phase where many careers collapse or go sideways. Image management becomes crucial.

3. **Adult Reinvention**  
   The performer either becomes a respected adult talent, settles into nostalgia casting, or burns out.

4. **Legacy Echo**  
   Former child stars may become producers, directors, scandal magnets, comeback stories, or guardians to a new generation.

#### Child Star Design Tensions
This system should generate stories such as:

- a child actor carrying a prestige film with shocking maturity
- a famous surname getting a fast launch but collapsing under pressure
- a former child star making an awards-season comeback as an adult
- a parent pushing a child too hard and triggering PR backlash
- siblings forced into direct competition for “next generation” branding

### 17.16 Family Packaging and Slate Strategy
Families should matter at the dealmaking layer, not just in biography text.

Possible package behaviors:

- a parent insists a child be cast alongside a veteran relative
- siblings only sign if they can produce together
- one family member unlocks access to others at a reduced deal premium
- a family package provides marketing heat but concentrates scandal risk
- a family name boosts financing confidence for prestige projects or nostalgic commercial plays

Family packages can also create negative leverage:

- one problematic relative contaminates the whole package
- legacy interference from parents or managers increases notes friction
- tabloids focus on dynasty casting over the actual project
- rival studios accuse the player of favoritism and insider dealing

### 17.17 Public Perception, PR, and Fandom Effects
The lineage system should heavily interact with the press and fandom loops.

Public narratives may include:

- beloved dynasty returns
- industry royalty takes on prestige material
- shameless nepo casting backlash
- sibling feud explodes during awards season
- tragic child-star spiral
- family redemption arc after rehab, scandal, or flop streak

PR posture should matter. The studio may choose to:

- openly celebrate the family legacy
- avoid discussing the connection and emphasize merit
- pair the relative with respected outsiders to counter nepotism narratives
- lean into “a family affair” marketing for awards or nostalgia appeal
- distance the studio from volatile relatives while keeping the bankable one

Fandom reactions should differ by audience segment. Some viewers adore legacy casting; others punish anything that feels inherited rather than earned.

### 17.18 Awards, Prestige, and Backlash Interactions
Lineage should matter during festivals and awards season.

Potential effects include:

- dynasty names getting easier media coverage and campaign bookings
- backlash narratives if a connected performer is viewed as unworthy
- sentimental appeal around comeback stories or multi-generation firsts
- critics reacting more harshly to perceived coasting on family reputation
- sibling or parent-child collaborations becoming irresistible awards stories if the work is great

In other words, lineage should amplify both triumph and humiliation.

### 17.19 Rival Studio Use of Family Systems
Rival AI studios should actively exploit dynasty logic.

They should be able to:

- build projects around famous surnames
- weaponize family gossip against the player
- poach one member of a family to destabilize another deal
- pursue comeback vehicles for fallen child stars
- sign rising younger relatives before the player notices them
- create “family business” boutique labels or vanity deals

This ensures the lineage system affects the whole industry, not only the player’s roster.

### 17.20 Studio Culture Interactions
Different studio identities should interpret family-driven talent differently.

Examples:

- **Auteur Haven** may value respected filmmaking dynasties but hate entitlement-heavy actor heirs.
- **Commercial Machine** may embrace famous surnames if they lift opening weekend.
- **Indie Tastemaker** may prefer “reclaimed” nepo babies who are proving themselves through craft.
- **Creative Chaos** may accidentally become the home of imploding tabloid families and former child stars.

This makes lineage feel native to the broader culture system already defined in the bible.

### 17.21 Example Event and Story Hooks
This system should generate reusable event patterns such as:

- “Sibling Duo Wants Joint Credit”
- “Legend’s Child Demands Shortcut to Lead Role”
- “Former Child Star Seeks Serious Reinvention”
- “Family Feud Leaks Into Press Tour”
- “Parent-Producer Wants Script Approval”
- “Younger Sibling Outshines Established Star”
- “Dynasty Documentary Revives Family Brand”
- “Awards Narrative Turns Into Nepotism Debate”

### 17.22 Design Balance Rules
To keep the system interesting and fair:

- lineage should provide access, not guaranteed excellence
- outsiders should retain powerful breakthrough paths through raw talent, timing, and studio support
- famous surnames should widen variance rather than simply add power
- child stars should be lucrative but fragile assets
- family packages should create concentrated upside and concentrated risk
- rivalry and loyalty should both be capable of driving major outcomes

### 17.23 Implementation Notes
At the simulation level, the family system should be a lightweight graph layer connected to the talent database.

Each talent record should support:

- family_id
- relationship links to other talent ids
- access origin
- lineage modifiers
- family perception tags
- family event hooks
- child-star phase, if applicable

This allows the existing talent, negotiation, PR, awards, and rival systems to query family state without requiring a separate heavy simulation.

### 17.24 Why This System Matters
The family and lineage system is a strong fit for Studio Boss because it reinforces nearly every major pillar already established in the project:

- talent with memory and leverage
- prestige versus profit tension
- PR and gossip storytelling
- awards-season narrative heat
- rival ecosystem behavior
- long-term legacy arcs across generations

It turns the roster from a flat talent marketplace into a truly Hollywood social web.


### 17.25 Greenlighting as a Multi-Stage Commitment System
Projects should not jump directly from “interesting idea” to “fully active production.” The greenlight process should be one of the game’s central executive rituals and should model the real-world truth that a studio often develops, packages, re-prices, delays, and re-evaluates a project several times before cameras roll.

Recommended project commitment ladder:

1. **Concept / Rights Controlled**  
   The studio owns or controls the basic opportunity, but nothing material is committed.

2. **Development**  
   Script work, producer outreach, early budget range, buyer testing, and initial casting conversations begin.

3. **Packaging**  
   The player actively pursues director, lead cast, producers, showrunner if relevant, financiers, distribution partners, and target release framing.

4. **Conditional Greenlight**  
   The studio authorizes pre-production spending, but production only proceeds if key package thresholds are met by a deadline.

5. **Full Greenlight**  
   The studio commits production capital, reserves calendar space, triggers start-date planning, and converts many soft conversations into binding deals.

6. **Go / No-Go Lock**  
   The project reaches the last decision gate, where financing, availability, and production readiness are checked again before principal photography or series start.

This ladder creates room for stories such as a prestige film being packaged for two years, a commercial project rushing to market after one star signs, or a series pilot falling apart at the last moment because a director left for a rival streamer job.

### 17.26 Greenlight Committee Logic
The game should present greenlighting as a structured evaluation rather than a simple button press. Even though the player is the final authority, the simulation should surface an internal “committee readout” that summarizes whether the current package justifies the spend.

A project’s greenlight recommendation should be built from multiple inputs:

- script or concept strength
- genre and market heat
- audience-demographic fit
- buyer or distributor fit
- production complexity
- ratings exposure
- franchise or library upside
- awards or prestige potential
- talent package strength
- package cost inflation
- schedule certainty
- funding and cashflow strain
- reputational risk

The recommendation can be expressed as a weighted readout such as:

- **Easy Greenlight**
- **Viable with Conditions**
- **Speculative Bet**
- **Dangerous Vanity Play**
- **Do Not Greenlight Yet**

This does not remove player agency. It simply frames the choice in readable Hollywood terms.

### 17.27 Packaging Before Greenlight
Attaching talent before greenlight should be a core pre-production game layer. In many cases, the package is the project. A mediocre script with an elite star and director may be financeable, while a strong script without bankable attachment may remain trapped in development.

Common package slots should include:

- lead actor(s)
- key supporting actor(s)
- director
- writer or rewrite writer
- producers
- executive producer or prestige sponsor
- showrunner for scripted TV
- host or key judge for unscripted formats
- cinematographer, composer, or high-prestige below-the-line name for prestige projects

Each attachment should affect more than quality. It should also influence:

- budget floor and budget ceiling
- financing confidence
- awards narrative
- buyer interest
- audience reach by demographic
- production risk
- schedule risk
- PR volatility
- sequel or franchise leverage

A package can therefore be “good” in different ways. One package might maximize opening weekend, another festival heat, another international presales, and another franchise durability.

### 17.28 Required vs Optional Attachment Slots
Not every project should need the same package shape. The game should define required and optional attachments by format and ambition level.

Examples:

**Commercial Studio Film**
- usually wants director + at least one lead + core producer before full greenlight
- major tentpoles may require a star, franchise steward, or VFX-capable director before approval

**Prestige Film**
- can greenlight on script + auteur director + financing confidence even without broad stars
- respected producers and awards-friendly supporting cast materially improve confidence

**Low-Budget Genre Film**
- can greenlight with fewer attachments if cost is low enough
- a single cult actor or horror name may replace a traditional star package

**Scripted TV Series**
- showrunner is usually mandatory
- lead cast and pilot director strongly affect buyer confidence
- ensemble depth matters more than one superstar in many formats

**Unscripted Format**
- may rely more on concept, host, production company, and buyer mandate fit than on traditional cast heat

This makes project setup feel distinct instead of formulaic.

### 17.29 Talent Market Value and Compensation Curves
Every major talent record should carry both a creative profile and a market profile. The player should care not only whether someone is good, but what they currently cost and whether the market believes they are worth it.

Recommended market-facing fields for actors, directors, producers, writers, and showrunners:

- **Quote**: current asking price for a typical deal in their lane
- **Floor**: lowest likely guaranteed compensation they will accept under normal circumstances
- **Ceiling Tier**: whether they can trigger premium production escalations such as star trailers, larger entourage support, or richer backend
- **Heat**: short-term market momentum based on recent success, awards, social buzz, and demand
- **Bankability**: how much confidence they add to revenue, buyers, or investors
- **Prestige Weight**: how much they raise critic and awards expectations
- **Reliability**: likelihood of showing up prepared, staying attached, and surviving schedule turbulence
- **Deal Demands**: common asks such as backend, billing, final cut influence, rewrite approval, or schedule protection

The quote should move dynamically over time. Strong box office, breakout streaming metrics, awards wins, critical raves, hot festival debuts, and rival bidding wars can push it upward. Flops, scandals, difficult productions, poor test scores, genre fatigue, aging out of a lane, or oversupply can push it downward.

### 17.30 Value Is Not the Same as Cost
A crucial design rule is that expensive talent should not always be efficient talent.

The simulation should distinguish between:

- **Cost**: what the studio must pay
- **Value**: what the talent adds to the project
- **Fit**: how well that value applies to this specific project

Examples:

- an overpriced global star may be bad value on a mid-budget adult drama
- an acclaimed indie director may be enormous prestige value but weak commercial value on a four-quadrant franchise entry
- a modestly priced comedy veteran may be elite value for a sitcom or broad comedy
- a fading A-lister may still help financing even if their audience conversion is slipping

This prevents a simplistic “always hire the most famous person” strategy.

### 17.31 Success and Failure Feedback on Talent Pricing
Talent economics should be reflexive. The outcomes of projects should feed back into future negotiation power.

Career outcomes that should raise quote and leverage:

- box office breakout
- sustained streaming hit performance
- awards win or nomination streak
- strong critic trend
- social media buzz or fan obsession
- a rival bidding war
- franchise proof or sequel reliability
- delivering a troubled project successfully

Career outcomes that should lower quote or increase discount willingness:

- consecutive commercial failures
- repeated expensive overages
- scandal or insurability problems
- typecasting stagnation
- weak audience testing
- buyer distrust
- being replaced or fired from a visible project
- aging out of a narrow commercial lane without reinvention

Different talent classes should respond differently. Actors may swing more on public heat; directors on critical reputation and delivery record; producers on package strength, cost discipline, and buyer trust.

### 17.32 Packaging Score and Greenlight Confidence
The project should compute a **Package Score** that feeds directly into greenlight confidence, financial forecast, and market positioning. This score should not be a hidden black box. The player should see why the package is helping or hurting.

Inputs can include:

- star power by role size
- director-project fit
- producer execution strength
- ensemble chemistry
- awards credibility
- demographic pull across age, gender, and region
- franchise compatibility
- reliability and schedule certainty
- PR/scandal exposure
- package cost relative to project scale

Suggested outputs:

- forecast revenue/viewership delta
- likely critic delta
- awards delta
- insurance/risk modifier
- pre-sale or buyer interest modifier
- production delay probability
- internal confidence score

A package can therefore justify a greenlight even when script quality is merely solid, or fail to justify it when the costs have become absurd.

### 17.33 Budget Construction and Above-the-Line Inflation
Attaching talent should immediately reshape the budget. The player should see the budget update in real time as package choices are made.

Major budget effects from talent should include:

- actor salaries
- director fee
- producer fees
- writer or showrunner fees
- executive producer overhead
- entourage and travel expectations
- accommodation standards
- rehearsal time
- stunt, training, dialect, or coaching costs
- scheduling inefficiency costs caused by difficult availability
- contingency expansion for volatile or unreliable talent
- insurance premium changes

Some talent should also cause indirect cost inflation. A perfectionist auteur may increase shoot days. A star with limited windows may compress the schedule and raise daily burn. A prestige ensemble may add coordination costs but improve awards odds.

### 17.34 Deal Structures and Conditional Commitments
Before greenlight, not every attachment should be equally binding. The system should support several commitment levels:

- **Wishlist**: purely aspirational; no market effect except planning.
- **Outreach**: active conversation; small chance of acceptance.
- **Soft Attach**: talent is interested, adding moderate market confidence, but can still leave easily.
- **Offer Out**: salary and terms are being negotiated.
- **Attached**: substantive agreement reached; higher confidence and moderate breakage cost.
- **Pay-or-Play / Locked**: talent is contractually secured and expensive to lose.
- **Hold**: talent is reserving a time window for the studio, usually at a cost or goodwill drain.

This creates an important executive choice: whether to package broadly with soft attachments, or spend money and leverage to truly lock the project.

### 17.35 Casting Director / Casting Agent System
The game should include a dedicated **casting agent** or **casting director** support function that can automate some or all slot-filling on a project. This gives the player a way to move quickly across a larger slate without manually auditioning every role.

The casting function should have its own quality attributes:

- market knowledge
- taste alignment with the studio
- prestige instincts
- commercial instincts
- agency relationships
- international awareness
- diversity of candidate pools
- speed
- salary discipline
- willingness to take unconventional risks

A better casting professional should generate stronger shortlists, discover underpriced breakouts earlier, reduce time-to-package, and sometimes unlock talent that would ignore a weaker studio.

### 17.36 Auto-Fill Rules for Casting Agents
When the player asks the casting function to fill open slots, it should not simply choose the highest-rated names. It should evaluate “best available talent” according to project context.

Selection logic should consider:

- role archetype fit
- target age and image
- chemistry with already attached cast
- genre experience
- prestige/commercial target of the project
- current quote
- budget cap
- schedule availability
- willingness to work with attached director or producer
- scandal or reliability risk
- audience demographic appeal
- market freshness versus overexposure

The player should be able to set casting priorities such as:

- cheapest workable package
- strongest commercial package
- awards-focused ensemble
- emerging talent with upside
- favor familiar collaborators
- avoid scandal risk
- maximize schedule certainty

This keeps automation useful without removing strategy.

### 17.37 Availability, Calendars, and Schedule Conflicts
Every significant talent should exist on an industry calendar with windows of availability rather than being permanently selectable.

Calendar pressures should include:

- active productions
- prep periods
- post obligations for directors or producers
- press tours
- festival attendance
- franchise options
- awards campaigning
- personal downtime or burnout leave
- parental or family obligations for some talent
- legal, scandal, rehab, or health interruptions

Availability should be readable as windows such as:

- free now
- free in 6 weeks
- available only for a short window
- soft-hold by rival production
- blocked for franchise obligation
- waiting on renewal decision

This turns scheduling into a strategic resource instead of an invisible rule.

### 17.38 Waiting on Talent and Start-Date Strategy
The player should be allowed to wait for desired talent rather than instantly replacing them. Waiting, however, should be a real gamble.

Potential player options:

- start immediately with current package
- hold for preferred star/director until they free up
- slide the production start date by a few weeks or months
- put the project back into development while retaining key attachments
- recast only one slot and preserve the rest of the package
- cancel the project and redeploy budget

Waiting should have meaningful consequences:

- cash tied up in development and holds
- increased risk that other attached talent will leave
- buyer windows may close
- market heat may cool or intensify
- a competitor may launch a similar project first
- awards-season qualification may slip away
- location, stage, or release-slot plans may be disrupted

This is one of the most Hollywood-feeling decision spaces in the game.

### 17.39 Hold Fees, Option Windows, and Expiry Pressure
To make waiting meaningful, the game should support contractual time pressure.

Recommended mechanics:

- **Hold Fee**: paid to reserve availability for a defined window
- **Attachment Expiry**: a soft-attach loses confidence or expires after a deadline
- **Option Window**: a star or director remains available only if the project begins by a certain date
- **Escalation Clause**: delayed starts increase compensation
- **Pay-or-Play Trigger**: if the studio delays too long after locking talent, major money is still owed
- **Drop-Dead Date**: financing or distribution approval vanishes if the project misses its launch window

This gives the player the classic studio problem of having to either move now, pay to wait, or watch the package unravel.

### 17.40 Bow-Outs, Replacements, and Cascading Package Collapse
Once a project is greenlit, schedule slippage should threaten attached talent. Some people will stay loyal; others will leave when conflicting obligations begin.

Common triggers for bowing out:

- start date missed beyond tolerance window
- a rival project activates first
- awards campaign or press obligations expand
- scandal or insurance issues intervene
- creative dispute with director, showrunner, or studio
- family event or burnout leave
- contract clause allows exit after prolonged delay

When one departure happens, it should sometimes trigger others. A project built around a director-star relationship may lose both. A prestige ensemble may unravel if the lead leaves. A fragile financing stack may collapse when the bankable name exits.

The player should then choose among:

- immediate replacement search
- emergency casting through the casting agent
- re-budget and scale down
- rewrite around the remaining cast
- pause production and absorb losses
- shut down entirely and take reputational damage

### 17.41 Replacement Talent and Repackaging Logic
Replacing talent should not simply restore the old state. The new attachment should change the project’s identity.

Replacement effects may include:

- tonal drift due to different actor persona
- lower or higher box office forecast
- stronger or weaker awards appeal
- chemistry re-evaluation with remaining cast
- budget relief or budget spike
- different ratings risk based on performance style or script changes
- buyer re-evaluation
- fandom backlash or enthusiasm

This creates rich stories such as a flop-bound blockbuster being saved by an inspired recast, or a prestige film losing all awards heat after the original auteur leaves.

### 17.42 Agency, Producer, and Packaging Politics
Real projects are often packaged through relationship webs rather than isolated hires. The system should model that some producers, managers, and agencies act as dealmakers who can fill multiple slots at once.

Useful behaviors:

- a producer brings three realistic cast options to a package
- an agency pushes a client bundle and wants multiple placements
- a showrunner requests a familiar directing stable
- a star insists on a favored producer or acting coach
- a prestige producer lowers financing friction even when cast is weak
- a commercial producer improves delivery reliability more than creative upside

This makes the packaging game feel like networked Hollywood politics rather than a clean menu.

### 17.43 Talent Availability as Competitive Terrain
Rival studios should compete for the same calendar space. The player should feel they are operating in a crowded industry where the best people are never idle for long.

Rival behavior should include:

- placing soft holds on hot talent
- rushing projects into greenlight to beat the player to a start window
- poaching talent during delay periods
- using higher quotes or richer backend to break soft attachments
- leaking package news to increase pressure and force commitments

This turns availability into part of the competitive layer, not just an internal planning stat.

### 17.44 UI and Dashboard Requirements
To keep the system readable, the design bible should call for several concrete interface elements.

Recommended project-facing panels:

- **Package Overview Card** showing attached roles, open slots, package score, and package cost
- **Greenlight Readout** summarizing projected upside, risk, and unmet conditions
- **Availability Timeline** showing when each attached or targeted talent is free
- **Conflict Alerts** warning that a locked start date is approaching or a hold is expiring
- **Casting Agent Shortlist Drawer** comparing candidates by fit, quote, schedule, and upside
- **Recast Emergency Modal** for projects that lose key talent after delay or dispute

The player should never have to guess why a project cannot start.

### 17.45 Stories This System Should Generate
This combined greenlight, packaging, and scheduling system should regularly create stories such as:

- a script sitting for a year until one superstar finally becomes available
- a low-cost horror project being greenlit fast because no major package is required
- a prestige film losing its lead after awards season expands their commitments
- a commercial sequel overpaying for aging talent because the release slot cannot move
- a casting agent discovering an underpriced newcomer who becomes a franchise star
- a producer package making a shaky project financeable despite weak script confidence
- a delayed project collapsing into expensive recasts and lawsuit threats
- a rival studio stealing the same director the player was waiting on

### 17.46 Implementation Notes for Simulation
At the data-model level, this system can be layered onto the existing project and talent simulation with several additional fields.

Recommended talent-side additions:

- current_quote
- quote_trend
- bankability_by_format
- prestige_weight
- reliability
- schedule_calendar
- active_hold_ids
- exit_tolerance_weeks
- preferred_collaborators
- blocked_collaborators
- typical_deal_demands

Recommended project-side additions:

- package_slots
- required_slots
- optional_slots
- package_score
- package_cost
- greenlight_confidence
- target_start_window
- locked_start_date
- hold_expiries
- conditional_greenlight_requirements
- delay_risk
- replacement_risk

These are sufficient to make the system feel deep without requiring a full legal-production sim.

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

The game’s prestige layer is heavily tied to festivals and awards. This system should function as a full annual prestige metagame rather than a light cosmetic bonus layer. It should connect release strategy, campaign spending, critical reception, creative risk, talent leverage, studio identity, and long-tail catalog value.

### 24.1 Goals of the Awards System
The awards system should do five jobs at once:

- reward prestige-minded projects and elite craft execution
- create meaningful strategic choices around release timing, campaign spending, platform format, and creative positioning
- give smaller, riskier, or more artistic projects a path to success that is not purely box office driven
- create emotional highs and lows through nominations, wins, snubs, scandals, and comeback narratives
- feed long-term studio legacy, not just short-term prestige points

Awards should never be only decorative. A nomination or win should have downstream effects on business outcomes, studio culture, future development choices, and talent relationships.

### 24.2 Annual Awards Cycle
The system should run on a recurring yearly structure with five stages.

#### 24.2.1 Eligibility Stage
Projects first need to qualify for a given award body. Qualification should be determined by project format, release method, release window, distribution scale, budget bracket, campaign support, and category fit.

#### 24.2.2 Awards Profile Generation
Every film and television project should generate a hidden awards profile based on the project’s creative and market identity. Suggested attributes include:

- prestige score
- critic score
- guild appeal
- audience passion
- cultural heat
- craft excellence
- campaign strength
- controversy risk
- studio reputation bonus
- festival momentum

#### 24.2.3 Nomination Stage
Each award body should evaluate projects according to its own preferences. Some institutions should skew toward prestige dramas and serious auteurs, while others should favor accessible star vehicles, indie credibility, audience warmth, or television craft.

#### 24.2.4 Campaign Stage
The player should be able to campaign actively. Campaign actions may include:

- For Your Consideration pushes
- guild screenings
- Q and A events
- critic outreach
- red carpet appearances
- talent press tours
- damage control after scandals
- strategic festival placement
- selective category campaigning

Campaigning should consume money, executive attention, PR bandwidth, and sometimes reputation. Over-campaigning should risk backlash.

#### 24.2.5 Outcome and Aftermath Stage
Nominations, wins, and losses should change the simulation. Even a high-profile snub should create consequences, such as morale shifts, ego clashes, press narratives, and market reassessments.

### 24.3 Core Awards Stats
The awards system should draw from a blend of visible and hidden values.

#### 24.3.1 Visible Values
- critic score
- audience score
- buzz
- prestige
- profit
- controversy
- campaign spend
- festival performance

#### 24.3.2 Hidden Values
- academy appeal
- guild appeal
- foreign appeal
- populist appeal
- indie credibility
- craft depth
- social resonance
- ensemble strength
- campaign efficiency
- industry narrative score

The industry narrative score is especially important. Awards momentum often depends on factors such as comeback stories, overdue veterans, breakout newcomers, scandal drag, and a studio’s broader reputation in a given season.

### 24.4 Festival Pipeline
Festivals should feed awards momentum, project valuation, and studio identity.

#### 24.4.1 Festivals Included
The festival layer should include at minimum:

- Cannes
- Venice
- Berlin
- Telluride
- TIFF
- Sundance
- SXSW
- Tribeca

#### 24.4.2 Festival Identities
Each festival should tilt toward different project types.

- **Cannes**: auteur cinema, prestige drama, international art film, high-status premieres
- **Venice**: serious prestige launches, awards-season starters, visually ambitious work
- **Berlin**: international, political, art-forward, socially resonant cinema
- **Telluride**: elite awards launch platform with heavy prestige signaling
- **TIFF**: prestige-plus-audience crossover, major awards momentum builder
- **Sundance**: indie discovery, documentary breakout, debut filmmaker launches
- **SXSW**: younger-skewing buzz, genre breakouts, offbeat audience energy
- **Tribeca**: urban prestige, indie credibility, strong launch support for smaller titles

#### 24.4.3 Festival Outcomes
Festival play should create changes to:

- critic score reveal or revision
- buzz trajectory
- awards profile bonuses
- acquisition or distribution value
- cast and director heat
- press narrative
- rival imitation or poaching pressure

#### 24.4.4 Festival Buzz Meter
The roadmap highlights a **Festival Buzz Meter**. That meter should represent the project’s momentum in prestige circles and should react to premiere response, critic sentiment, audience warmth, deal chatter, and scandal noise.

### 24.5 Award Bodies Included
The game should support multiple overlapping award ecosystems so that more project types can find meaningful success.

#### 24.5.1 Major Film Awards
- **Academy Awards / Oscars**
- **BAFTA Film Awards**
- **Golden Globes** (film)
- **Independent Spirit Awards**
- **Critics Choice Awards**
- **Screen Actors Guild Awards**
- **Writers Guild Awards**
- **Directors Guild Awards**
- **Producers Guild Awards**
- **Annie Awards**
- **ASC Awards**
- **Art Directors Guild Awards**
- **ACE Eddie Awards**
- **VES Awards**

#### 24.5.2 Major Television Awards
- **Primetime Emmys**
- **BAFTA Television Awards**
- **Golden Globes** (television)
- **Critics Choice Television Awards**
- **Screen Actors Guild Awards**
- **Writers Guild Awards**
- **Directors Guild Awards**
- **Producers Guild Awards**
- **Peabody Awards**
- **Television Critics Association Awards**

#### 24.5.3 Specialty and Flavor Awards
These should expand the emotional and strategic texture of the system:

- **Gotham Awards**
- **National Board of Review**
- **Satellite Awards**
- **People’s Choice Awards**
- **Kids’ Choice Awards**
- **MTV Movie & TV Awards**
- **GLAAD Media Awards**
- **NAACP Image Awards**
- **IDA Awards** for documentary recognition

These do not all need the same depth as the Oscars or Emmys, but they help different genres, demographics, and studio identities feel recognized.

### 24.6 Gameplay Award Categories
The awards system should include the categories that make the most gameplay sense, rather than only mirroring reality in a narrow way.

#### 24.6.1 Universal Top-Line Categories
- Best Picture / Best Series
- Best Director
- Best Original Screenplay
- Best Adapted Screenplay
- Best Lead Actor
- Best Lead Actress
- Best Supporting Actor
- Best Supporting Actress
- Best Ensemble

#### 24.6.2 Film Craft Categories
- Cinematography
- Editing
- Production Design
- Costume Design
- Makeup and Hairstyling
- Visual Effects
- Sound
- Original Score
- Original Song
- Casting
- Animated Feature
- Documentary Feature
- International Feature
- Debut Feature

#### 24.6.3 Television Categories
- Best Drama Series
- Best Comedy Series
- Best Limited Series
- Best TV Movie
- Lead performance categories by format
- Supporting performance categories by format
- Writing for Drama, Comedy, and Limited Series
- Directing for Drama, Comedy, and Limited Series
- Casting
- Editing
- Production Design
- Sound
- Score or Music Supervision
- Animated Program
- Documentary or Nonfiction Series

#### 24.6.4 Audience and Market-Facing Meta Categories
These can be game-specific abstraction categories used by press, fan communities, or lower-prestige shows:

- Breakout Hit
- Audience Favorite
- Cult Sensation
- Best Family Release
- Best Franchise Launch
- Most Buzzworthy Release
- Best Debut Creator

### 24.7 Award-Specific Requirements and Preferences
Each major body should have both a qualification gate and a taste profile.

#### 24.7.1 Academy Awards / Oscars
**Best for:** prestige films, major craft showcases, serious dramas, prestige animation, and auteur work.

**Gameplay requirements:**
- must be a film rather than a television project
- must receive a qualifying theatrical release
- must release within the eligible awards window
- must carry enough visibility or campaign support to enter the race seriously
- must match category-specific identity for categories such as Animated Feature, Documentary Feature, International Feature, Original Song, and Original Score

**Preference profile:**
- critic score
- prestige score
- festival momentum
- campaign spend
- craft excellence
- awards-friendly genre and tone
- strong studio reputation

**Gameplay effects:**
- very large prestige gain
- stronger talent leverage
- improved investor and distributor confidence
- long-tail library value increase
- major legacy milestone tracking

#### 24.7.2 Primetime Emmys
**Best for:** prestige television drama, comedy, limited series, and TV movies.

**Gameplay requirements:**
- must be an eligible television-format project
- must air or release in the eligible TV window
- must fit format buckets such as drama series, comedy series, limited series, or TV movie
- acting, writing, and directing bids should depend on episode-level strength and season-wide momentum

**Preference profile:**
- season consistency
- critic score
- platform strength
- audience loyalty
- ensemble quality
- campaign support

**Gameplay effects:**
- improves renewal and ordering confidence
- raises value of showrunners, TV writers, and lead casts
- increases series library value
- strengthens streamer or network leverage

#### 24.7.3 BAFTAs
**Best for:** prestige film and prestige television with strong craft and international resonance.

**Gameplay requirements:**
- must match film or television eligibility
- must release within the correct timing window
- performs best with proper awards support and strong creative identity

**Preference profile:**
- craft excellence
- critic score
- prestige score
- international appeal
- director reputation

**Gameplay effects:**
- strong international prestige bonus
- improved overseas sales positioning
- greater value for craft-led productions

#### 24.7.4 Golden Globes
**Best for:** star-driven prestige, accessible dramas, comedy-musicals, and glamorous, highly visible film and television projects.

**Gameplay requirements:**
- must release in-window
- must fit correct drama, comedy, musical, or television category bucket
- benefits from strong PR and celebrity visibility

**Preference profile:**
- star power
- media buzz
- critic score
- accessibility
- campaign charm
- glamour factor

**Gameplay effects:**
- major PR burst
- audience awareness boost
- can elevate commercial projects into prestige conversation

#### 24.7.5 Independent Spirit Awards
**Best for:** indie films, lower-budget prestige projects, unconventional auteur work, and breakout debuts.

**Gameplay requirements:**
- must be a film
- must fall under an indie budget or scale threshold in gameplay terms
- should generally benefit from lower-budget positioning, strong critic support, and festival breakout status

**Preference profile:**
- indie credibility
- originality
- critic score
- festival buzz
- debut energy

**Gameplay effects:**
- creates a real prestige path for smaller studios
- increases discovery value for emerging talent
- can define the studio as an indie tastemaker

#### 24.7.6 SAG Awards
**Best for:** performance-driven projects and ensemble showcases.

**Gameplay requirements:**
- must feature standout acting metrics
- ensemble categories require multiple strong cast performances
- film and TV categories should be tracked separately

**Preference profile:**
- cast quality
- ensemble chemistry
- emotional accessibility
- role showcase strength

**Gameplay effects:**
- raises actor quote demands
- improves future casting leverage
- can push momentum into Oscars and Emmys

#### 24.7.7 Writers Guild Awards
**Best for:** script- and writer-driven projects.

**Gameplay requirements:**
- requires strong writing metrics
- should split original versus adapted for film and major format buckets for television

**Preference profile:**
- script quality
- structure
- dialogue
- originality or adaptation strength

**Gameplay effects:**
- boosts writer prestige
- raises value of writer-first projects
- improves later top-tier awards positioning

#### 24.7.8 Directors Guild Awards
**Best for:** auteur projects and films or shows with a clear directorial signature.

**Gameplay requirements:**
- requires high directing score and project coherence
- works especially well for prestige and visually confident projects

**Preference profile:**
- directing score
- visual identity
- critical acclaim
- creative control payoff

**Gameplay effects:**
- increases director leverage in future negotiations
- strengthens final-cut pressure from auteurs
- raises director market price

#### 24.7.9 Producers Guild Awards
**Best for:** holistically successful projects with strong execution and awards-season professionalism.

**Gameplay requirements:**
- strong overall project package
- disciplined campaign operation
- broad industry respect

**Preference profile:**
- production execution
- package quality
- awards consistency
- campaign professionalism

**Gameplay effects:**
- boosts studio-wide reputation
- improves co-financing and investor confidence
- supports Best Picture or Best Series momentum

#### 24.7.10 Critics Choice Awards
**Best for:** critic-friendly projects with enough visibility to break through.

**Gameplay requirements:**
- must release in-window on film or television side
- best supported by strong review averages and baseline visibility

**Preference profile:**
- critic score
- craft score
- prestige score

**Gameplay effects:**
- early momentum support
- improves nomination chains into larger shows

#### 24.7.11 Annie Awards
**Best for:** animated films and animated television.

**Gameplay requirements:**
- must be an animated project
- should demonstrate strong animation craft and either family appeal or artistic distinction

**Preference profile:**
- animation quality
- visual identity
- family or demographic fit
- music and voice-cast appeal

**Gameplay effects:**
- boosts animation brand value
- supports awards runs in animation categories elsewhere
- improves sequel and franchise confidence for animated IP

#### 24.7.12 Peabody Awards
**Best for:** culturally significant television, nonfiction, and issue-driven storytelling.

**Gameplay requirements:**
- best suited to television, documentary, or socially resonant projects
- cultural and thematic impact should matter more than glamour

**Preference profile:**
- thematic depth
- social resonance
- writing quality
- prestige seriousness

**Gameplay effects:**
- prestige gain without relying on mainstream popularity
- strengthens the studio’s identity in serious storytelling

### 24.8 Release Strategy and Eligibility Logic
Awards should push the player to think carefully about how a project is released.

The system should consider:

- theatrical versus television or streaming identity
- release quarter and late-year awards positioning
- platform strength and campaign support
- prestige festival premiere before general release
- category-fit decisions for limited series versus ongoing series
- budget bracket for indie-specific awards
- whether the studio chooses to spend enough to be visible during awards season

This should create meaningful strategic tension. A project released for pure commercial optimization may weaken its awards chances, while an awards-first release path may reduce short-term financial efficiency.

### 24.9 Campaigning and Trade-Offs
Awards campaigning should be a deliberate executive system, not an automatic bonus.

The player should make choices about:

- how much to spend on campaigning
- which projects to prioritize in a crowded season
- which categories to target aggressively
- whether to position a title as prestige drama, crowd-pleaser, comedy, or craft play
- whether to pull back if scandal or backlash makes a campaign risky

Possible campaign outcomes include:

- momentum gain
- wasted spend
- narrative backlash
- category confusion
- talent fatigue
- improved industry goodwill

### 24.10 Awards Consequences
Awards should matter immediately, in the medium term, and over the life of the studio.

#### 24.10.1 Immediate Effects
- PR burst
- morale increase
- revenue or viewership bump
- stronger sequel or spinoff confidence
- better negotiating position on late distribution or licensing deals

#### 24.10.2 Medium-Term Effects
- talent quote inflation
- more inbound scripts and packages
- greater trust from agencies, investors, and co-production partners
- stronger leverage in future financing and platform negotiations

#### 24.10.3 Long-Term Effects
- permanent studio legacy gains
- catalog value increase
- studio culture drift toward prestige, indie, or commercial identity
- timeline recognition for banner titles and landmark seasons

### 24.11 Snubs, Scandals, and Drama
To preserve the emotional unpredictability of Hollywood, the awards system should also support negative and chaotic outcomes.

Possible events include:

- shocking snub after strong festival play
- campaign scandal or resurfaced controversy
- vote splitting between two titles from the same studio
- commercial smash ignored by prestige institutions
- over-campaigned project triggering backlash
- actor victory inflating ego and future salary demands
- director loss reigniting final-cut resentment on the next project
- critics darling fading before televised awards season

These outcomes should reinforce the broader design pillar that Studio Boss is a story-generating system where intersecting mechanics create memorable industry drama.

### 24.12 Red Carpet and Presentation Flavor
Awards season should be visually and tonally rewarding. Red carpet beats, acceptance speech flavor text, gossip headlines, and prestige dashboards should heighten emotion without forcing long non-interactive ceremonies.

### 24.13 Summary of the Awards System
The awards system should be understood as an annual prestige metagame in which film and television projects qualify for specific award bodies based on format, release path, scale, campaign choices, and creative profile, then compete across performance, writing, directing, craft, audience, and prestige categories. Success should reshape studio reputation, finances, talent leverage, future negotiations, and long-term legacy.

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

### 25.6 Mergers, Acquisitions, and Corporate Control in the Rival Ecosystem
The rival simulation should treat corporate control as part of the living industry, not an edge case. Rival studios should be able to:

- acquire distressed competitors
- merge into larger groups
- sell labels or libraries under pressure
- spin off unscripted, animation, or prestige divisions
- take minority investment from outside capital
- be absorbed by networks, streamers, or diversified media conglomerates

This system is important because it changes the strategic map. A merger can suddenly create a buyer with a new mandate, an acquired boutique label can lose its creative edge, and a distressed sale can put valuable catalogs or format rights on the board for the player to chase.

The player should be able to react to rival M&A through:

- counterbids
- defensive talent retention
- opportunistic hiring after layoffs or culture collapse
- library or rights purchases from divestitures
- partnership offers from newly strengthened groups

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

## 29. First-Look Deals, Overall Deals, Pods, Recurring Collaborators, and Co-Productions

A first-look system should be one of the most authentically “Hollywood” strategic layers in the game. In real life, studios and platforms often lock in privileged access to a producer, filmmaker, star-producer, management company, mini-major label, animation house, or showrunner pod. Those relationships do not guarantee that every project gets made, but they do change who sees projects first, who gets paid overhead, who has development support, and where the best ideas tend to land.

In **Studio Boss**, first-look deals should sit at the intersection of:

- talent management
- project sourcing
- development throughput
- greenlight quality
- rights retention
- buyer access
- co-financing and pod economics
- dynasty / family / nepotism systems
- prestige versus commercial strategy

The goal is to create the feeling that the player is not just picking projects from a neutral market. They are building a network of semi-exclusive relationships that shape the future flow of the business.

### 29.1 What a First-Look Deal Is in Game Terms
A first-look deal gives the player’s studio a contractual priority window on projects generated by a specific partner.

That partner can be:

- an individual producer
- a director with a producing shingle
- a writer-producer or showrunner
- an actor-producer
- a documentary team
- an animation creator collective
- a genre label
- a management-backed production pod
- a family dynasty banner run by siblings, spouses, parents and children, or second-generation “nepo” heirs

A first-look deal should not mean total exclusivity by default. Instead, it usually means:

1. the project comes to your studio first
2. you get a defined evaluation window
3. you may fund development or overhead during the term
4. if you pass, rights may revert, go to market, or move to a second-look partner depending on the contract

This distinction is important because first-look deals are powerful, but they should not function as absolute ownership of a creator.

### 29.2 Why the System Matters
This system creates a more realistic content pipeline and stronger long-term strategy.

It allows the player to:

- secure early access to premium projects before rivals can bid
- shape studio identity through repeat collaborators
- build producer ecosystems and labels instead of single one-off hires
- create TV and film slates with recognizable internal creative families
- nurture emerging talent into future rainmakers
- use development money and overhead as a strategic weapon
- feel the risk of expensive deals that do not yield enough viable output

It also creates great stories:

- a hot producer with an expensive pod deal delivers three weak packages in a row
- a niche horror label becomes your most profitable first-look relationship
- a superstar actor’s vanity shingle clogs development with passion projects
- a family-run production company creates internal sibling succession drama during the term
- a showrunner uses your development money to incubate a breakout global franchise
- a rival poaches your first-look partner after you underfund their overhead

### 29.3 Deal Types
Not all recurring relationships should be identical. The game should support several contract archetypes.

#### 29.3.1 Standard First-Look
The studio gets the first opportunity to evaluate projects from the partner for a fixed term.

Typical properties:

- low to moderate guaranteed cost
- limited overhead
- defined submission volume expectation
- pass window of a few weeks to a few months
- projects can leave if declined

This should be the most common entry-level deal type.

#### 29.3.2 Overhead / Pod Deal
The studio funds a producer or mini-label’s office, assistants, development executives, and active slate operations.

Typical properties:

- monthly or quarterly overhead payments
- higher project flow
- stronger loyalty and better package quality
- more pressure to justify the spend
- possible internal team growth and staffing events

These deals are strategically powerful but can become costly dead weight.

#### 29.3.3 Overall Deal
Most common for TV-oriented writer-producers and major multi-hyphenates, but can also exist for star producers or label heads.

Typical properties:

- heavier exclusivity
- stronger rights capture
- larger development fund access
- greater reputational prestige
- fewer competitor approaches during the term
- bigger breakup fallout if relations collapse

Overall deals should be rare, expensive, and identity-defining.

#### 29.3.4 First-Look + Distribution / Output Hybrid
Useful for indie labels, international banners, documentary shops, or genre divisions.

Typical properties:

- your studio gets first access or distribution rights to a set number of packages per year
- partner may co-finance some projects
- rights split can be more complex
- useful when you want volume without full overhead control

#### 29.3.5 Talent Incubator Deal
A lower-cost deal for emerging creators, child stars transitioning into producers, second-generation family members, or festival breakouts.

Typical properties:

- cheaper guarantees
- more volatility
- higher growth potential
- more mentorship events
- higher odds of misfires, image crises, or sudden breakout upside

This is where “discover the next mogul early” gameplay lives.

### 29.4 Eligible Partners
Any recurring collaborator with enough reputation, ambition, and business orientation can eventually ask for or be offered a deal.

Common partner archetypes:

- prestige film producer
- commercial franchise producer
- sibling director-producer duo
- documentary banner
- comedy pod
- horror label
- family dynasty banner
- former child star turned producer
- TV super-producer / showrunner
- animation creator house
- international co-production banner
- actor-producer vanity company

Eligibility should depend on a mix of:

- reputation
- recent output
- relationship with the studio
- ambition
- leverage
- representation strength
- age and career phase
- family network backing
- awards heat or commercial heat

### 29.5 Core Contract Variables
Every first-look or overall deal should be assembled from core variables rather than a single flat status effect.

#### 29.5.1 Term Length
Usually 1 to 5 years in simulation terms.

Longer terms:

- improve security and loyalty
- reduce annual renegotiation friction
- increase downside if the deal goes stale

Shorter terms:

- preserve flexibility
- lower long-run risk
- make breakout partners easier to lose

#### 29.5.2 Exclusivity Level
The spectrum should include:

- non-exclusive preferred relationship
- first-look only
- film-only overall
- TV-only overall
- cross-media overall
- exclusive pod / label deal

Exclusivity affects project flow, poaching risk, and partner resentment.

#### 29.5.3 Overhead Cost
A regular fixed cost representing office staff, assistants, execs, and general operations.

This cost should vary by:

- partner scale
- city footprint / burn rate
- premium staffing expectations
- whether the partner is film, TV, animation, or unscripted oriented
- how many active projects the pod is allowed to maintain

#### 29.5.4 Development Fund Access
Separate from overhead, this is money the partner can deploy toward:

- script commissions
- rights shopping
- treatments and pitch decks
- pilot scripts and bibles
- packaging travel and attachments
- research trips
- proof-of-concept shorts or sizzle reels

The player may choose between tight control and broad autonomy.

#### 29.5.5 Submission Quota / Expected Output
The deal should track whether the partner is delivering enough active packages.

Metrics can include:

- ideas submitted
- projects advanced to script stage
- projects packaged
- projects greenlit
- projects sold externally after pass
- hit rate

A low-output partner may still be worth it if their few swings are elite.

#### 29.5.6 Pass Window
How long the studio has to decide after receiving a package.

A short window creates pressure and can force fast staffing, budgeting, and taste decisions.

#### 29.5.7 Rights Structure
When a first-look package arrives, the deal should specify default rights assumptions:

- full buyout on greenlight
- co-owned IP
- sequel / remake participation
- backend points for the partner
- reversion rights if not greenlit by a deadline
- TV, film, merchandising, or international carve-outs

#### 29.5.8 Key-Person Clause
If the deal is built around one person, illness, scandal, death, retirement, burnout, imprisonment, rehab, or sudden rival defection can destabilize the agreement.

This is especially useful for dynastic banners and vanity labels where the brand depends on one family member.

#### 29.5.9 Renewal Options and Sunset Clauses
Deals should not just end abruptly. They can include:

- studio option to renew
- mutual option to extend
- performance-based extension
- decline in overhead after underperformance
- automatic sunset if no project reaches greenlight by a threshold date

### 29.6 First-Look Pipeline Flow
A first-look deal should generate its own mini gameplay loop.

1. **Relationship Formation**  
   The player notices a repeat collaborator or rising banner.

2. **Deal Negotiation**  
   Agent, lawyer, producer, or family representative negotiates term, overhead, scope, rights, and approval language.

3. **Pod Activation**  
   The partner begins generating ideas, rights chases, packages, staffing requests, and internal politics.

4. **Project Submission Queue**  
   The studio receives priority looks from that partner before the open market does.

5. **Evaluation Window**  
   The player can approve development spend, pass, hold, ask for rewrite, or move directly to packaging.

6. **Outcome**  
   Projects are greenlit, passed, sold elsewhere, shelved, or turned into co-productions.

7. **Deal Health Update**  
   The relationship grows stronger or weaker depending on responsiveness, success, notes friction, and economics.

This loop should make first-look relationships feel alive, not passive.

### 29.7 Deal Health and Partner Satisfaction
Every deal should have a hidden and partially visible health model.

Inputs should include:

- how fast you read and respond
- how often you actually greenlight their work
- whether you cut their overhead during austerity
- whether you protect their projects in awards and release strategy
- whether you force bad notes or demand trend chasing
- whether you honor promised staffing and budget support
- whether your studio brand still matches their ambitions

High health results in:

- better packages
- lower poaching risk
- more honest early warning about weak projects
- willingness to bring passion projects first
- more favorable renewal terms

Low health results in:

- perfunctory submissions
- hoarding the best ideas for later exit
- passive-aggressive staffing battles
- more leverage demands
- higher risk of rival courtship
- press leaks and messy departures

### 29.8 Prestige Partners vs Commercial Partners
The system should distinguish between partners who create status and partners who create reliable monetization.

A prestige pod may:

- elevate awards odds
- attract elite actors and filmmakers
- improve critic relationships
- generate lower-volume but high-prestige slates

A commercial pod may:

- excel at broad demos and repeatable franchises
- move faster through development
- deliver stronger merchandising and sequel potential
- strain the studio’s prestige identity if overused

The best studios should eventually learn to balance both.

### 29.9 Family Dynasties, Nepo Heirs, and Inherited Labels
First-look deals are a perfect place to connect the family / lineage system to the project pipeline.

Examples of gameplay patterns:

- a legendary producer’s children inherit the family shingle but have unequal talent
- siblings run a pod together and gain a collaboration bonus until rivalry breaks the partnership
- a child star ages into an executive producer role under the family banner
- a spouse duo has strong awards instincts but unstable personal chemistry
- a “nepo baby” has easy access to meetings and packaging heat but weak execution discipline
- a second-generation heir unexpectedly outperforms the founding parent and demands more autonomy

Family-run pods should have special traits:

- inherited reputation
- inherited agency access
- faster talent attachment within their social network
- succession disputes
- intra-family favoritism
- scandal spillover across relatives
- richer gossip, rivalry, and tabloid storylines

This lets first-look deals become a major delivery mechanism for Hollywood dynasty storytelling.

### 29.10 Child Stars and Transition Deals
Child stars who survive early fame can evolve into:

- actor-producers
- vanity-label founders
- YA-focused creators
- prestige reinvention stories
- unstable tabloid magnets with poor reliability

A special “transition deal” can be offered when a former child star wants to mature into producing. These deals should be volatile.

Upside:

- built-in audience awareness
- easier financing heat
- strong PR narrative if the reinvention works

Downside:

- entitlement
- inconsistent taste
- relapse or scandal risk
- poor notes discipline
- family interference

### 29.11 Producer Pods and Label Identity
Some deals should create sub-brands inside the studio.

Examples:

- prestige classics label
- elevated horror banner
- family animation unit
- youth / YA label
- edgy indie label
- documentary division
- awards boutique

These labels can influence:

- which projects are generated
- default demographic targeting
- buyer trust in specific categories
- cost structure and development speed
- awards reputation
- staff hiring preferences

A good pod is not only a source of projects. It becomes part of the studio’s identity architecture.

### 29.12 Negotiation Layer
Negotiating a first-look or overall deal should feel like a genuine Hollywood business conversation, not a simple yes/no button.

Negotiable points should include:

- term
- overhead
- signing bonus
- guaranteed producing fee floors
- number of free passes the studio can take without penalty
- staffing approvals
- genre restrictions or carve-outs
- film-only vs TV-only scope
- theatrical commitment expectations
- minimum marketing support promises for greenlit projects
- office size / prestige expectations
- first-look window length
- turnaround rights
- co-financing options
- renewal triggers
- award campaign support language

Who represents the partner should matter. A powerful agency or attorney can demand better economics, more approvals, or packaging rights for sibling clients.

### 29.13 Approval Rights and Creative Control
Some first-look partners will want more than money. They may seek:

- director approval
- casting consultation rights
- script approval or consultation
- final cut thresholds
- release strategy promises
- awards campaign commitments
- sequel participation guarantees

These rights increase happiness and package quality, but reduce player flexibility.

### 29.14 Project Flow Generated by the Deal
A partner under deal should create content in ways that reflect their personality and resources.

Possible outputs:

- original pitches
- rights-shopping targets
- adaptations from books, podcasts, articles, games, and life rights
- remakes and format plays
- family passion projects
- vanity vehicles for themselves or relatives
- opportunistic trend copies
- passion prestige projects with low commercial logic
- broad commercial packages chasing current market heat

Their internal traits should shape the mix.

### 29.15 First-Look Queue UI
The player should have a dedicated **Deals / Pods / First-Look** screen showing:

- active deal partners
- term remaining
- overhead burn
- deal health
- project submissions in queue
- projects passed / accepted / sold elsewhere
- total spend vs generated value
- upcoming renewal dates
- poaching risk
- family or scandal alerts

Each incoming package should show:

- why it was generated
- who is attached or likely attachable
- rights terms
- evaluation deadline
- market comps
- internal executive opinion
- estimated package potential if nurtured

### 29.16 Pass, Hold, Turnaround, and Market Escape
When a first-look project arrives, the player should not only choose “yes” or “no.”

Options should include:

- fund development
- package quietly without commitment
- pass immediately
- hold for more market clarity
- ask the partner to rework it
- offer co-production instead of full studio financing
- release it into turnaround / outside market after pass

If you pass too often, the partner becomes frustrated. If you hold too long, you may block the pod and create bottlenecks.

### 29.17 Turnaround and Reversion
Projects should not disappear when declined.

Possible outcomes after a pass:

- revert fully to the partner
- remain partially owned if you funded development
- go to open bidding after a cooling-off period
- move to a second-look partner
- become a co-financing opportunity later

Watching a rival turn your passed project into an awards hit or a giant franchise should be one of the best emotional pain points in the simulation.

### 29.18 Co-Production Hooks
First-look deals should naturally generate co-productions.

For example:

- the partner brings a package too expensive for your current balance sheet
- your studio keeps domestic rights while a buyer takes international
- a streamer finances a TV order while you keep library participation
- a family banner insists on retaining part of the IP
- a prestige producer wants a boutique foreign partner to maintain credibility

This ties first-look deals directly into the rights and financing systems rather than leaving them as pure talent flavor.

### 29.19 Schedule Conflicts Within Deal Slates
Because first-look partners feed the development queue, they must interact with the scheduling conflict system.

Examples:

- a pod submits a package built around one star who is only available in six months
- your overall deal showrunner has two series staffing windows colliding
- a sibling directing duo under deal has one member pulled onto a family emergency project
- an actor-producer vanity label can package films quickly but the star lead is constantly booked

The player may choose to:

- wait and hold the package
- recast or repackage
- accelerate development to meet a talent window
- downgrade budget to fit earlier dates
- lose the package if timing slips

This makes first-look deals feel integrated with real production pressure.

### 29.20 Renewal Negotiations
As the term nears expiration, a deal should enter a renewal phase.

Renewal leverage depends on:

- number of hits delivered
- profitability of greenlit projects
- awards success
- whether the partner feels creatively supported
- whether rivals are circling
- whether your studio still has cash to carry overhead
- whether the partner has a breakout family member or protégé now demanding elevation

Renewal outcomes:

- richer extension
- same economics
- reduced overhead with project-by-project continuation
- first-look downgraded to preferred access only
- amicable exit
- messy public breakup
- rival poach with industry press impact

### 29.21 Rival Studio Competition and Poaching
Rivals should actively pursue your best deal partners, especially when:

- your liquidity weakens
- you keep passing on their projects
- their awards value outgrows your brand
- a streamer offers more freedom or guaranteed output
- a family member inside the banner feels undervalued

Poaching pressure can appear as:

- private leverage warnings from agents
- trade rumor items
- urgent renewal deadlines
- bidding wars
- surprise opt-out clauses becoming active after underperformance

### 29.22 Strategic Trade-Offs
A strong first-look system works because every benefit has a cost.

Benefits:

- early access to better projects
- stronger studio identity
- repeatable packages
- loyalty and talent clustering
- better awards and prestige pipelines
- hidden discovery upside

Costs and risks:

- overhead burn
- cluttered development slate
- vanity project bloat
- fewer resources for open-market opportunism
- long-tail relationship politics
- blowback if you cannot support all partners equally

### 29.23 AI Behavior for Partners
Partners under deal should not be static resource generators. They should have their own behavior profiles.

Useful internal traits:

- taste coherence
- commercial instinct
- prestige instinct
- mentoring ability
- networking ability
- spending discipline
- family favoritism
- volatility
- opportunism
- loyalty
- scandal susceptibility
- trend-chasing tendency

These traits influence what kinds of projects the partner produces and whether the deal is worth renewing.

### 29.24 Metrics That Determine Whether a Deal Was Worth It
The player needs tools to evaluate deal performance.

Suggested metrics:

- total overhead spent
- total development spend deployed
- number of submissions
- number of packages accepted
- number of projects greenlit
- box office / licensing / backend generated
- awards points generated
- catalog value created
- talent relationships unlocked
- external sales lost after passes
- replacement cost if the pod exits

A deal can be “worth it” even if not wildly profitable, if it builds prestige, future stars, or a franchise beachhead.

### 29.25 Staff Roles That Interact with First-Look Deals
Internal executives should matter here.

Relevant roles:

- head of film
- head of TV
- creative executive
- business affairs lead
- casting lead
- production head
- awards strategist
- talent relations executive
- family-office style fixer for dynasty-heavy banners

A great executive team can turn a mediocre deal into a solid engine. A weak team can waste elite access.

### 29.26 Event and Drama Hooks
This system should generate rich event chains.

Possible events:

- partner demands bigger offices after a hit
- assistant exodus cripples a pod’s output
- sibling feud pauses the banner
- the founder wants their untalented child staffed on projects
- a rival offers richer TV freedom while you only want film output
- a pod head wants to spin out and take staff with them
- a former child star partner melts down before a major announcement
- your studio slashes overhead during a downturn and triggers a public breakup
- a quiet low-cost pod suddenly delivers a culture-shaping breakout

### 29.27 Interaction with Awards, PR, and Studio Brand
Deals should have reputational consequences.

A prestigious overall deal:

- raises the studio’s perceived seriousness
- attracts critics and actors
- increases expectations for awards support

A loud commercial vanity deal:

- boosts public awareness
- may hurt elite prestige branding
- can improve mass-market recruitment and franchise monetization

A scandal-plagued family banner:

- may still be profitable
- can trigger PR and advertiser headaches
- can contaminate sibling or child-star relatives by association

### 29.28 Interaction with Greenlight Logic
First-look partners should meaningfully affect greenlight decisions.

Positive modifiers:

- trusted pod with strong hit rate
- elite packaging network
- faster staffing confidence
- reliable delivery history
- better market read in their niche

Negative modifiers:

- vanity project inflation
- repeat underperformance
- overstuffed slate with too many internal commitments
- talent availability problems from overbooking
- expensive overhead biasing you to greenlight bad projects just to justify the deal

This is important: first-look deals should create temptation to throw good money after bad.

### 29.29 Recommended Data Model
A first-look / overall deal entity should track:

- partner type
- scope (film, TV, both)
- term start and end
- exclusivity level
- overhead cost
- development fund size
- pass window
- renewal logic
- rights defaults
- deal health
- loyalty
- prestige contribution
- commercial contribution
- poaching risk
- active submissions
- delivered hits / misses
- family linkage flags
- key person dependency

### 29.30 Design Role
A robust first-look system turns the studio from a passive buyer of projects into an active curator of creative ecosystems.

It deepens:

- long-term planning
- talent retention
- slate identity
- risk management
- Hollywood drama generation
- family and lineage storytelling
- TV/film convergence
- co-production and rights strategy

It should become one of the clearest ways the player feels they are no longer just making movies. They are building a real studio machine.

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

- TV buyer ecosystem and distribution structures
- regional rights
- pickup negotiations, slotting, and outlet strategy
- bridge financing options
- debt and collateral logic
- default and restructuring mechanics

Outcome:
The player must think about rights and survival, not just project quality.

#### Sprint E — Talent Packaging and IP Retention
Goals:

- stronger packaging systems
- first-look logic
- TV format licensing and remake-rights hooks
- co-production hooks
- IP retention model
- contract personality texture

Outcome:
Deals begin to matter long after signing.

#### Sprint F — Rival AI Economy, Genre Trends, and Studio Culture
Goals:

- differentiated rival strategies
- trend board
- early M&A and asset-sale logic
- workerized industry simulation
- studio culture system

Outcome:
The industry becomes a living ecosystem with identifiable studio personalities, market consolidations, and strategic takeover opportunities.

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
- expanded international market modeling
- legacy archive and timeline presentation
- advanced franchise management and continuity pressure
- additional studio archetypes or start conditions
- deeper network, platform, and distribution-outlet governance for player-owned buyers

---

## 43. Canonical Design Principles Summary

To keep future additions aligned, the following principles should remain canonical:

1. **The game is about running a studio, not just shipping content.**
2. **Money and reputation are narrative engines, not isolated score systems.**
3. **Projects should create long-tail strategic consequences.**
4. **Talent should feel like people with leverage and memory.**
5. **Prestige and profit should remain in productive tension.**
6. **The dashboard is the command center.**
7. **Every major system should feed shared decisions about bets, consequences, and future leverage.**
8. **The industry must feel alive even when the player is not directly touching it.**
9. **Every development milestone should remain playable.**
10. **The current product posture is an offline-capable Vite-based macOS experience.**
11. **The game should generate stories the player wants to retell.**

---

## 44. Current Canonical Product Statement

**Studio Boss is a dashboard-first, offline-capable, single-player Hollywood studio simulation for macOS where the player discovers, develops, finances, packages, releases, and publicizes film and television projects while competing in a living AI-driven industry, navigating mergers and acquisitions, and building a long-term studio legacy.**

---

## 45. Maintenance Note for Future Updates

When updating this document in the future:

- preserve section numbering where possible
- add new systems into the appropriate conceptual section rather than appending random notes
- update the roadmap only when sequence or scope meaningfully changes
- maintain clear distinction between current canon, implementation guidance, and future ideas
- prefer integrating new material into the master structure over creating replacement bibles

---


## 30. Vanity Shingles, Star Production Companies, Writers as Talent, and TV Leadership Expansion

This section expands the first-look, packaging, and talent systems so they better reflect the way real Hollywood actually works while still remaining readable and fun in play. In practice, many major stars, directors, writer-producers, comedians, animation creators, and prestige filmmakers do not simply appear as individual freelancers in the market. They often operate through **production companies**, **vanity shingles**, **pods**, or **creator banners** that sit on a studio lot or under an overall / first-look arrangement.

In **Studio Boss**, that means talent should not only be tracked as people. Many of the most important people in the simulation should also have a **company layer** that changes how projects are sourced, packaged, staffed, financed, and politically managed.

This system should make the player feel like they are:

- housing big-name dealmakers on the lot
- fielding incoming projects from star banners
- using actor-producers and director-producers to package projects faster
- managing the ego and overhead of vanity labels
- deciding when a glamorous shingle is worth the cost
- turning writers into real market actors rather than invisible background inputs
- treating TV showrunners as top-tier talent alongside stars and directors
- navigating auteur packages where one person fills multiple creative roles

The system should be rooted in reality, but the UX should stay intuitive:

- **people** have quotes, traits, schedules, and ambitions
- **companies** have deals, overhead, pipeline, taste, and brand identity
- **projects** have required roles, optional attachments, and packaging momentum
- **TV shows** have leadership positions that matter across the full life of the series

### 30.1 Core Design Goals

This expansion should achieve six goals at once.

#### 30.1.1 Make Hollywood Relationships Feel Structural
A star with a vanity company should feel different from a normal freelancer. They bring projects in, ask for producers’ fees, want office overhead, hire favored collaborators, and often expect a louder voice in creative decisions.

#### 30.1.2 Elevate Writers into a Full Talent Class
Writers should no longer feel like a hidden project stat. They should be market participants with quotes, availability, prestige, volatility, voice, agency relationships, and career arcs.

#### 30.1.3 Make Multi-Hyphenates Matter
Many important real-world creators are writer-directors, actor-producers, writer-showrunners, director-producers, or actor-writer-comedians. The simulation should support that naturally.

#### 30.1.4 Distinguish Film and TV Leadership
A film can survive with a rewrite and a producer-heavy package. A TV series lives or dies on the creative and managerial competence of the showrunner and room leadership.

#### 30.1.5 Keep Systems Understandable
The player should not have to study Hollywood trade law to use the system. Every deal and attachment should answer simple questions:

- Who is this person?
- What roles can they fill?
- What does their company give me?
- What does it cost?
- How much control do they expect?
- What happens if I delay?

#### 30.1.6 Support Emergent Drama
Vanity labels and multi-hyphenates should generate stories such as:

- a movie star uses their shingle to force a passion project onto the slate
- an actor-producer brings a great package but insists on casting their sibling
- an auteur demands both writing and directing credit plus final cut pressure
- a hit showrunner launches a pod and starts draining top writers from rivals
- a vanity shingle turns into an expensive vanity sinkhole with no hits
- a child star grown into adulthood relaunches their career by producing for themselves

### 30.2 New Entity Layer: Production Companies and Vanity Shingles

The talent system should support **production entities** attached to people or small creative teams.

A production entity may be:

- a true independent production company
- a vanity shingle on the studio lot
- a TV pod under an overall deal
- a boutique genre label
- an actor-led production banner
- a director’s prestige company
- a writer-producer company
- a sibling or family company run by multiple related talents

These entities should be lightweight enough to manage at scale, but meaningful enough to matter strategically.

Each production entity should track:

- company name / shingle name
- founding talent or controlling partners
- company type
- lot relationship or independent status
- first-look / overall / output / co-financing status
- overhead burden
- annual development capacity
- taste profile and preferred genres
- format focus: film, TV, animation, documentary, unscripted, hybrid
- favored collaborators list
- reputation profile
- delivery record
- active slate
- hit rate and profitability history
- political leverage inside the studio

### 30.3 Vanity Shingle Types

Not every shingle should function identically. Variety is what makes the feature fun.

#### 30.3.1 Star Vanity Label
Usually controlled by a major actor or performer. Strengths include packaging speed, cast access, PR heat, and talent magnetism. Weaknesses include ego cost, vanity development spend, and a tendency toward star vehicles.

Typical behavior:
- brings vehicle ideas for the founder
- pushes specific directors or co-stars
- wants producing credit and meaningful set influence
- may overvalue personal passion projects

#### 30.3.2 Director Banner
Usually prestige-heavy or brand-heavy. Strengths include tone control, filmmaker loyalty, and strong package identity. Weaknesses include slower iteration, stronger creative demands, and schedule fragility.

Typical behavior:
- incubates hand-picked material
- keeps a stable of writers, editors, and department heads
- may insist on first-look rights over remakes or spin-offs connected to their work

#### 30.3.3 Writer / Showrunner Pod
Usually TV-facing, though film writers can also use this model. Strengths include pipeline volume, repeatable development output, and staffing leverage. Weaknesses include high overhead, room costs, and burnout risk.

Typical behavior:
- generates several concepts per year
- recruits upper-level writers into orbit
- demands meaningful development funds
- creates strong renewal pressure if it breaks out

#### 30.3.4 Family or Sibling Banner
A family-run shingle may include siblings, spouses, cousins, parents and children, or dynasty protégés. Strengths include loyalty and chemistry. Weaknesses include nepotism optics, group conflicts, and succession drama.

Typical behavior:
- packages internal collaborators first
- may split after a feud
- creates strong PR narratives, good or bad

#### 30.3.5 Prestige Mini-Label / Genre House
These entities sit between an indie label and a vanity company. They are useful for horror, awards cinema, YA, faith, romcom, animation, documentary, and elevated genre niches.

Typical behavior:
- spots undervalued material faster
- has a strong taste signature
- can outperform its budget tier when market windows align

### 30.4 Talent Roles and Multi-Hyphenates

The core talent model should support a **role matrix** rather than a one-role identity.

A talent record can have one or more primary and secondary professional roles.

Possible roles include:

- actor
- director
- writer
- producer
- executive producer
- showrunner
- creator
- comedian / host
- cinematographer for certain special cases if eventually expanded
- animator / creator for animation-facing systems if eventually expanded

The most important near-term combinations should be:

- actor-producer
- actor-writer
- actor-director
- writer-director
- writer-producer
- writer-showrunner
- director-producer
- actor-writer-producer
- writer-director-producer auteur
- creator-showrunner-executive producer for TV

The UI should express this cleanly with tags and icons so the player instantly understands what a person can do.

Example presentation:

- **Ava Stone** — Actor / Producer
- **Miles Kwan** — Writer / Director (Auteur)
- **Rina Vale** — Writer / Showrunner / EP
- **The Varela Siblings** — Director / Producer duo

### 30.5 Writers as Full Market Talent

Writers should be promoted to the same simulation class as actors and directors.

Every writer should have:

- market quote
- prestige score
- commercial heat
- critical credibility
- speed
- rewrite skill
- original voice strength
- adaptation skill
- collaboration compatibility
- room leadership potential
- reliability / deadline discipline
- ego / control demands
- awards profile
- scandal / PR exposure if relevant
- representation strength
- schedule calendar
- preferred formats and genres

Writers should be discoverable, poachable, packageable, and sellable in pitch conversations.

A strong writer can add value by:

- improving the script grade
- increasing attachment odds for directors and actors
- improving buyer interest for TV
- raising awards expectations for prestige material
- reducing production chaos through cleaner scripts

A weak or misaligned writer can hurt a project by:

- causing draft delays
- failing on tone
- alienating attached talent
- forcing rewrites that inflate development spend
- weakening buyer confidence

### 30.6 Writer Archetypes

Writers should feel distinct. Useful archetypes include:

- **Prestige Auteur Writer** — brilliant voice, expensive, slow, awards-heavy
- **Franchise Mechanic** — reliable on structure and IP execution, low glamour, high utility
- **Comedy Punch-Up Specialist** — saves jokes, dialogue, and tonal energy
- **Adaptation Whisperer** — great with books, true stories, and remakes
- **Horror Machine** — fast, cheap, commercially sharp, often under-awarded
- **TV Factory Showrunner-in-Waiting** — prolific, can scale into room leadership
- **Chaos Genius** — huge upside, terrible reliability
- **Network Craftsman** — good at notes, broad audience writing, stable delivery
- **Streaming Prestige Voice** — excellent for buzzy limited series and critical attention

These archetypes should interact with buyer mandates, awards play, ratings goals, and platform identity.

### 30.7 Auteur System

Some talent should have the **Auteur** flag. This means they are especially powerful when occupying multiple creative roles on the same project, but also more dangerous if the package goes wrong.

Auteurs may be:

- writer-directors
- writer-director-producers
- actor-writer-directors in smaller prestige or comedy spaces
- creator-showrunner auteurs in TV

Auteur bonuses may include:

- stronger tonal cohesion
- higher critic upside
- better awards legitimacy on prestige projects
- stronger branding and marketing identity
- better fit for certain festival pathways

Auteur costs may include:

- slower development
- harsher reaction to notes
- stronger final cut or approval demands
- difficulty replacing them midstream
- higher volatility if they miss

An auteur should feel like both a strategic edge and a concentration of risk.

### 30.8 Writers in Film vs Writers in TV

The game should clearly distinguish writer value by format.

#### 30.8.1 Film Writers
Film writers usually matter most during development and rewrite phases. Their impact is strongest on:

- script quality
- package attraction
- production readiness
- awards credibility
- dialogue and character depth

Film writers may remain influential into production, but usually less than the director and producers unless they are also the director or a powerful producer.

#### 30.8.2 TV Writers
TV writers matter throughout the life of the series. Their impact should touch:

- pilot quality
- season arc shape
- episode consistency
- room speed
- staffing quality
- renewal likelihood
- talent morale
- budget discipline across episodes
- late-season fatigue

This is why TV should elevate showrunners and upper-level writers into core ongoing management problems.

### 30.9 TV Role Expansion: Creator, Showrunner, EP, and Room Leadership

TV projects should require more explicit leadership roles than films.

A scripted TV series may have the following fillable roles:

- creator
- lead writer / pilot writer
- showrunner
- executive producer
- director of pilot
- producing director or block director for certain formats
- lead cast
- key supporting cast
- head of room or co-showrunner on larger shows

Not every show needs every slot as a separate person, because many series use one multi-hyphenate creator-showrunner. But the system should allow role splitting.

Examples:

- **Prestige cable drama:** creator, showrunner, pilot director may all be separate
- **Comedy vehicle:** star, creator, writer, and EP may overlap heavily
- **Broadcast procedural:** creator sells it, veteran showrunner is hired to run it
- **Genre streamer:** creator remains symbolic while a practical co-showrunner keeps the train on time

### 30.10 Showrunner System Expansion

A showrunner should be one of the most consequential recurring hires in the entire game.

Each showrunner should track:

- creative vision
- room management
- outline discipline
- rewrite speed
- casting instinct
- budget discipline
- notes diplomacy
- actor management
- production problem solving
- post stamina
- season architecture skill
- burnout tendency
- franchise appetite
- willingness to mentor juniors

A showrunner’s practical impact should influence:

- time to break season
- number of rewrite crises
- average script quality drift over season
- cast retention odds
- episode budget creep
- probability of late delivery penalties
- critic consistency across episodes
- renewal confidence

### 30.11 Writer and Showrunner Quotes

Writers and showrunners should have quotes just like actors and directors.

A writer quote may be broken into:

- pitch / concept fee
- first draft fee
- rewrite fee
- polish fee
- episode fee for TV
- pilot premium
- producing fee if also EP or showrunner
- backend or bonus participation

A showrunner quote may include:

- pilot setup fee
- per episode producing fee
- room management overhead
- series bonus triggers
- renewal bump clauses
- staffing approval leverage

Like actor and director value, writer and showrunner quotes should rise and fall based on:

- recent hits and misses
- awards recognition
- buyer demand
- platform trend fit
- reliability reputation
- scarcity in their niche
- PR or scandal events

### 30.12 Company-Attached Talent and Role Stacking

If talent owns or controls a vanity company, they should be able to attach to a project through both **personal role attachment** and **company participation**.

For example:

- a star actor may attach as lead + producer via their banner
- a director may attach as director + producer through their company
- a writer may attach as writer + EP through their pod
- a showrunner may attach as creator + showrunner + EP through their overall deal company

This matters because it changes both cost and influence.

A package involving the same person in multiple capacities should affect:

- above-the-line cost
- overhead allocation
- approval rights
- notes sensitivity
- awards category positioning
- scheduling complexity
- replacement difficulty

Role stacking should usually reduce search friction and improve package coherence, but it should also concentrate power and negotiation leverage in fewer hands.

### 30.13 How Vanity Shingles Interact with First-Look Deals

Vanity shingles should be one of the most visible outputs of the first-look system.

A star or creator with a studio lot deal may gain:

- dedicated office overhead
- annual development budget
- automatic first-read or first-look queue placement
- preferred staffing support
- easy access to the casting team
- internal marketing prestige
- studio-lot identity that boosts loyalty

In exchange, the studio expects:

- a minimum volume of submitted concepts or packages
- periodic active development output
- a floor on production starts or meaningful attachments
- stronger renewal justification through performance

A vanity shingle should feel like a semi-persistent content source. Even when it is not actively delivering finished projects, it is generating pressure, politics, and opportunity.

### 30.14 Lot Space and Prestige Ecology

If the game continues to deepen lot and infrastructure flavor, vanity shingles can also become part of a **prestige ecology**.

Having elite banners on the lot can create soft benefits:

- better talent attraction
- stronger trade-press prestige
- improved perception among agencies
- faster inbound submissions
- stronger award narrative around the studio as a creative home

But too many vanity deals can create penalties:

- overhead bloat
- queue congestion
- internal competition for development funds
- ego conflicts
- more gossip and leak risks

This gives the player a meaningful portfolio question: do you want a glamorous lot full of famous labels, or a leaner slate built around fewer, more disciplined deals?

### 30.15 Producing Through a Vanity Company

Actors and directors should be able to attach to projects **to produce through their own company**, even when they are already attached in another role.

Examples:

- a leading actor attaches as star and producer through their banner
- a director insists their company receive a producer slot and overhead participation
- a comedian fronts a TV comedy but also produces through a vanity label
- a former child star uses their company to redevelop public image through smarter material selection

Producing attachment through a company should offer potential benefits:

- easier star commitment
- stronger package momentum
- more promotional enthusiasm from the star
- better access to that person’s trusted collaborators
- possible reduction in later walk risk if they feel invested

But it can also cause problems:

- more fees layered into the budget
- more producer approvals
- more set politics
- favoritism pressure in hiring and casting
- vanity development spend on weak material

### 30.16 Vanity Company Influence Rules

A vanity company should not be a cosmetic credit line. It should actively influence project behavior.

Company influence variables may include:

- attachment leverage
- development pressure
- preferred collaborator pull
- creative control appetite
- awards appetite
- commercial discipline
- sequel / franchise appetite
- budget discipline
- PR sensitivity
- loyalty to studio

High-influence companies may:

- push for specific casting
- insist on preferred writers or line producers
- resist replacement talent
- lobby for awards positioning
- agitate for release-date changes
- demand internal marketing support

Low-influence companies are easier to manage but offer less upside.

### 30.17 The Shingle Health System

Each vanity label or pod should have a simple but rich **health score** made from:

- creative output
- commercial output
- prestige output
- delivery reliability
- relationship health with the studio
- overhead efficiency
- talent retention inside its orbit

Healthy shingles unlock:

- stronger inbound talent
- better packaging odds
- faster greenlight confidence
- easier renewal conversations

Unhealthy shingles trigger:

- trade gossip about wasted overhead
- internal pressure to reduce the deal
- more desperate submission behavior
- poaching vulnerability
- higher odds of breakup or departure

### 30.18 Internal Politics: Vanity Deal Complaints and Favoritism

One of the fun parts of this system is the politics.

Other producers, executives, and deal partners should react when one vanity label seems to receive favored treatment.

Possible friction cards or event chains include:

- “Why does their pod get all the good books first?”
- “They keep stuffing their clients into supporting roles.”
- “Your star-producer’s office has spent heavily and delivered nothing.”
- “The showrunner pod is hoarding writers the rest of TV needs.”
- “Awards campaign resources are skewing toward the vanity label’s projects.”

These events create choices about fairness, discipline, and favoritism.

### 30.19 Packaging with Company Orbit Bonuses

Some talent companies should develop a real **orbit** of recurring collaborators.

An orbit may include:

- trusted writers
- recurring directors
- regular supporting cast
- editors and composers for flavor and future expansion
- favored development executives
- sibling and family collaborators

Packaging with company orbit members may create bonuses:

- chemistry boost
- speed boost
- reduced negotiation friction
- stronger tonal cohesion
- better marketing story

But overuse may create penalties:

- audience fatigue
- groupthink
- accusations of nepotism or clique behavior
- weaker diversity of ideas

### 30.20 The Casting and Staffing Relationship with Vanity Shingles

The casting agent / casting director system should acknowledge vanity companies and TV pods.

When auto-filling roles, the staffing logic should weigh:

- best available talent overall
- package fit
- company orbit preferences
- the studio’s political obligations to important deal partners
- PR optics of obvious nepotism or vanity casting
- budget constraints
- the player’s chosen staffing philosophy

This creates fun strategic sliders such as:

- **Pure Best Fit**
- **Value Package**
- **Prestige Package**
- **Shingle Loyalty**
- **Discovery Mode**
- **Anti-Nepotism Safe Mode**

### 30.21 Writer Rooms as Talent Ecosystems

Writers rooms should not just be anonymous cost centers. They should be talent ecosystems that can be shaped by showrunners, pods, and studio strategy.

A room should track at least:

- room size
- average seniority
- chemistry
- genre fit
- rewrite speed
- joke density or procedural efficiency where relevant
- burnout risk
- diversity of voice
- future breakout potential

A strong showrunner pod may improve room recruitment. A toxic pod may poison room morale.

### 30.22 TV Staffing Hierarchy

For fun, intuitive gameplay, the TV staffing screen should support a simplified but recognizable hierarchy:

- staff writer
- story editor
- executive story editor
- co-producer
- producer
- supervising producer
- co-executive producer
- executive producer
- co-showrunner
- showrunner

The player does not need to manually hire every single rung on day one. Instead, staffing can use layered control:

- **Manual** for top leadership roles
- **Guided** for upper room composition
- **Auto** for lower room balancing

This keeps the feature deep without becoming tedious.

### 30.23 Showrunner Succession and Rescue Hires

TV series should support leadership instability.

Possible scenarios:

- the creator is not experienced enough to run the show, so a veteran showrunner is hired
- the original showrunner burns out mid-season and a co-showrunner steps up
- a scandal forces a quiet replacement
- a troubled room requires an expensive rescue hire
- the studio pairs a brilliant but chaotic creator with a disciplined operator

This system makes TV feel meaningfully different from film and creates real-world-style drama.

### 30.24 Script-to-Series Pipeline Under Pods and Shingles

When a project originates from a shingle or pod, the development flow should reflect that.

Typical pipeline:
1. company develops concept internally
2. first-look submission arrives at studio
3. player funds exploratory development or passes
4. writer / creator / star attachments deepen
5. showrunner may be attached before greenlight
6. pilot or package goes to buyer / internal greenlight
7. room staffing begins after order

This should create a constant sense that the studio is curating relationships, not just buying isolated scripts.

### 30.25 Scheduling and Availability for Writers, Showrunners, and Multi-Hyphenates

The scheduling system introduced earlier should apply fully to writers and showrunners.

Writers may be unavailable because they are:

- on an exclusive assignment
- finishing rewrites elsewhere
- in a room on another show
- in post as a showrunner or EP
- on press or awards duty after a breakout hit
- unavailable due to burnout or personal hiatus

Multi-hyphenates should be especially fragile on schedules because one person filling multiple roles creates dependency stacking.

If a writer-director auteur is delayed, the project may lose:

- screenplay continuity
- directing commitment
- prestige identity
- awards upside

If a star-producer bows out, the studio may lose both a lead and a producing shingle at once.

### 30.26 Waiting on Talent and Holding Deals

The player should be able to wait for important writers, showrunners, or vanity-company heads to become available.

Waiting should be a real strategic choice with visible costs:

- development carrying cost
- opportunity cost against slate timing
- risk of buyer mandates shifting
- release window collapse
- attachment expiration risk
- rival poaching risk

The UI should show a clear summary such as:

> Wait 18 weeks for Rina Vale to finish her current streamer series?  
> Benefits: keeps prestige package intact, +buyer interest, +awards upside  
> Risks: lead actor option expires in 10 weeks, holiday corridor missed, budget inflates by 6%

### 30.27 Replacement Cascades in TV and Film

If an attached person leaves and they occupied multiple functions, the replacement system should recognize the cascade.

Examples:

- replacing a star-producer requires a new performer and possibly a new company partner
- replacing a writer-director auteur may force a full creative repackaging
- replacing a showrunner may reduce cast morale, room chemistry, and buyer confidence
- replacing a family-run sibling team may create public feud coverage that damages launch momentum

This makes role stacking exciting but dangerous.

### 30.28 Deal Structures for Company Participation

When a vanity label participates in a project, the deal model should support some combination of:

- producer fee
- executive producer fee
- overhead allocation
- pilot setup fee
- per episode fee for TV
- backend corridor
- bonus for greenlight, production start, renewal, or awards milestones
- first negotiation rights on sequel or spin-off participation

This is important because a project cost should reflect not only the person’s quote, but also the company layer riding with them.

### 30.29 Studio Policy Settings

To keep the system intuitive, the player should be able to set studio-wide policies.

Useful policy toggles include:

- allow actor-producer vanity attachments by default
- cap simultaneous overhead deals
- prefer external writers vs internal pods
- require veteran showrunner on high-budget scripted TV
- auto-flag nepotism optics risks
- allow multi-role auteur packages on projects above certain budget thresholds
- prioritize company-orbit staffing when auto-filling roles

These policies help the player shape house culture without micromanaging every case.

### 30.30 Talent Value and Company Value Feedback Loops

The existing quote system should be expanded so both **people** and **companies** gain or lose value over time.

#### 30.30.1 Personal Value Changes
Actor, director, writer, producer, and showrunner quotes should move based on:

- box office or audience performance
- critic response
- awards momentum
- reliability
- social heat
- meme status or fandom buzz
- scandal
- overexposure
- comeback narrative

#### 30.30.2 Company Value Changes
Vanity company leverage should move based on:

- hit rate
- profitability
- breakout discovery record
- awards conversion
- delivery pace
- relationship stability with studio
- ability to attract collaborators

This allows situations where:

- a fading star still has a hot company because their taste is strong
- a famous actor’s shingle is actually a money pit
- a young showrunner pod suddenly becomes must-have after one phenomenon series

### 30.31 AI and Automation Support

Because this system is rich, the game should offer strong automation support.

Assist modes may include:

- **Casting Agent** for on-camera roles
- **Packaging Executive** for finding writers, directors, and producer attachments
- **TV Staffing Lead** for building rooms around the player’s showrunner
- **Deal Counsel** for surfacing costly vanity-company clauses
- **Studio COO** warnings when overhead and vanity spend become bloated

The player should always have override power, but automation should make large-slate play enjoyable.

### 30.32 UI and UX Requirements

The system will only feel intuitive if the presentation is clean.

Important screens and drawers:

#### 30.32.1 Talent Card
Should show:
- primary roles
- secondary roles
- quote by role
- company affiliation
- current heat
- schedule bar
- favored collaborators
- reliability and ego markers
- awards / prestige badges

#### 30.32.2 Company / Shingle Card
Should show:
- controlling talent
- deal type
- overhead cost
- active projects
- submission pipeline
- health score
- favored orbit
- renewal date
- studio sentiment

#### 30.32.3 TV Leadership Screen
Should show:
- creator
- showrunner
- pilot writer
- EP layer
- room composition summary
- season break progress
- staffing risk warnings

#### 30.32.4 Project Packaging Screen
Should clearly distinguish:
- required roles still unfilled
- optional value-adding attachments
- company-linked attachments
- role stacking warnings
- schedule conflict alerts
- nepotism / optics alerts

### 30.33 Event and Drama Deck Additions

This expansion should feed the event system with flavorful cards and chains.

Examples:

- **Vanity Shingle Overreach** — the star’s company wants office expansion after one modest hit
- **Pod Raid** — a rival poaches two upper-level writers from your showrunner pod
- **Star Vehicle Panic** — an actor-producer insists on greenlighting a weak but ego-driven project
- **Rescue Showrunner Available** — an expensive veteran can stabilize a troubled series
- **Family Banner Feud** — sibling company partners stop speaking during prep
- **Breakout Staff Writer** — a junior writer from your room becomes a hot creator
- **Credit Arbitration Blowup** — writer and director dispute ownership of the project identity
- **Lot Status Symbol** — signing a glamorous banner boosts prestige but raises overhead complaints

### 30.34 Awards, PR, and Branding Interactions

These new roles and companies should affect multiple existing systems.

Writers and showrunners should matter more in:

- screenplay awards
- guild awards
- limited series prestige races
- TV creator branding
- “from the creator of…” marketing hooks
- trade-journal coverage of pods and overall deals

Vanity shingles should also influence PR tone:

- a respected banner adds credibility
- a notorious vanity label creates skepticism
- a comeback shingle can support redemption narratives
- obvious nepo-banner packaging can trigger discourse

### 30.35 Balance Principles

To keep this fun rather than oppressive, the following balance rules are recommended:

- no more than a few active vanity companies should demand heavy manual attention at once
- auto-staffing tools should handle low-level room and package tasks competently
- players should be able to ignore some corporate detail and still succeed on easier settings
- the richest emergent stories should happen on high-profile projects, prestige TV, and overloaded studio years
- multi-hyphenates should be powerful enough to chase, but risky enough that they never become automatic best choices

### 30.36 Canonical Rules Added by This Section

The following design rules should now be treated as canonical for the rest of the bible:

1. **Writers are a full talent class** with quotes, traits, schedules, prestige, and market value.
2. **Showrunners are explicit fillable leadership roles** on TV projects and one of the most important TV-facing talent classes in the game.
3. **Actors, directors, writers, and showrunners may own or control production companies or vanity shingles.**
4. **Talent may attach through both personal roles and company roles at once**, affecting cost, influence, and replacement difficulty.
5. **First-look and overall deals should commonly produce vanity shingle gameplay**, not just invisible rights logic.
6. **Multi-hyphenate auteur packages are supported as core gameplay**, especially writer-directors and creator-showrunners.
7. **TV staffing and room leadership are formal systems**, not just flavor text, whenever the project is a scripted series.
8. **Company health, overhead, and orbit politics matter** and should feed events, economics, PR, and project success.



## 31. Trade Press, Industry News, Rumors, Box Office, TV Performance Reporting, and Talent Compensation Escalation

This section formalizes the industry-information layer of **Studio Boss** by turning the entertainment trades into a playable system rather than mere flavor text. In real Hollywood, publications such as *Deadline*, *Variety*, *The Hollywood Reporter*, *Screen International*, awards columnists, TV ratings roundups, box office analysts, and social-buzz aggregators shape perception, leak information, influence negotiations, and create momentum. In the game, the player should feel that the industry is always talking — about projects in development, packages coming together, who is circling what, who is overpaid, which awards horses are surging, and whether a hit is “real” or “soft.”

The goal is to make information itself a strategic resource. Good trade coverage can improve talent attachment odds, awards positioning, buyer confidence, and investor sentiment. Bad coverage can inflate costs, trigger rival bidding, unsettle casts, cause panic in greenlight committees, or make a project feel “damaged” before cameras roll.

### 31.1 Core Design Goals

#### 31.1.1 Make the Industry Feel Alive Week to Week

Every weekly tick should carry a believable stream of headlines, blurbs, rumors, charts, predictions, trend pieces, and postmortems. Even when the player takes no direct action, the world should move and talk.

#### 31.1.2 Translate Complex Hollywood Reporting into Readable Gameplay Signals

The system must feel rich without becoming unreadable. A player should not need deep real-world media-business expertise to understand why an item matters. Every story should answer one of four practical questions:

- does this affect project value?
- does this affect talent value?
- does this affect awards odds?
- does this affect studio reputation or negotiating leverage?

#### 31.1.3 Let Metrics Change Behavior, Not Merely Decorate Screens

Box office, TV share, streaming strength proxies, critical response, syndication upside, and awards heat should all feed into concrete systems: talent quotes, backend payouts, renewal costs, sequel leverage, first-look renewals, and buyer trust.

#### 31.1.4 Make Rumors Powerful but Uncertain

Rumors should matter before facts are known. A well-sourced rumor may pressure the player to act quickly. A wrong rumor may create chaos, resentment, or stockpiled PR debt. The player should learn to manage uncertainty rather than wait for perfect information.

#### 31.1.5 Preserve a Fun, Intuitive UX

All of this should roll up into a clear dashboard language: heat, momentum, confidence, risk, quote pressure, and value movement. The game should present trade reporting as an exciting, gossipy, decision-relevant layer rather than a spreadsheet wall.

### 31.2 The Trade Outlets as Game Entities

The trades are not just generic “press.” Each outlet has a personality, strengths, and gameplay function.

#### 31.2.1 Deadline-Type Outlet

Fast, deal-driven, rumor-forward, casting-focused, and highly influential in project momentum. This outlet breaks who is attached, who is circling, bidding wars, exits, replacements, pod deals, launch dates, renewals, cancellations, and first-look signings.

Primary gameplay functions:
- break casting and director attachment stories early
- surface package heat before greenlight
- intensify bidding wars and competitive pressure
- frame projects as “hot package,” “troubled production,” or “quietly moving”
- increase rival awareness of your moves

#### 31.2.2 Variety-Type Outlet

More institutional and awards-literate, blending business, craft, industry analysis, and prestige framing. This outlet is particularly strong for awards charts, executive transitions, market narratives, and “what this means” trade analysis.

Primary gameplay functions:
- shape prestige narratives and awards respectability
- publish nominee and winner predictions
- amplify strategic stories about your studio identity
- influence executive/buyer confidence and long-term brand value

#### 31.2.3 Hollywood Reporter-Type Outlet

Useful as the middle zone between speed and polish: strong for features, power lists, profile pieces, development updates, think pieces, and talent-business ecosystem coverage.

Primary gameplay functions:
- produce talent profiles and rehabilitation stories
- highlight behind-the-scenes friction or creative tensions
- raise or lower perceived cultural legitimacy
- publish rankings and annual perception snapshots

#### 31.2.4 Screen / Market Bulletin-Type Outlets

These represent market-facing industry publications focused on sales, festivals, international buyers, rights movement, co-productions, and worldwide commercial temperature.

Primary gameplay functions:
- affect foreign pre-sales confidence
- influence co-financing and festival buyer traffic
- boost or damage international value perception
- help non-U.S. content break out globally

#### 31.2.5 Ratings / Box Office Roundup Columns

These are specialized reporting channels for weekend box office, Nielsen-style reports, live-plus-delayed TV performance, franchise trend analysis, and annual winner/loser scorecards.

Primary gameplay functions:
- publish revenue-facing scoreboards
- trigger value/cost changes automatically
- supply sequel, spin-off, renewal, and cancellation leverage
- change cast renegotiation expectations

### 31.3 Newsfeed Architecture

The game’s weekly newsfeed should be divided into a few distinct content types so that players can immediately understand what kind of item they are seeing.

#### 31.3.1 Breaking Items

Short, immediate updates with direct action implications.
Examples:
- “A-list star circling your crime thriller”
- “Director exits two weeks before production start”
- “Buyer mandates shift away from YA fantasy”
- “Competing studio wins weekend auction for hot spec”

#### 31.3.2 Analysis Items

Longer trade framing that changes confidence, prestige, or market sentiment.
Examples:
- “Is your studio over-indexing on mid-budget originals?”
- “Awards insiders souring on crowded fall slate”
- “TV ad softness changing appetite for expensive procedurals”

#### 31.3.3 Metric Reports

Scheduled or event-driven performance drops.
Examples:
- weekend domestic box office chart
- international cume update
- opening weekend ranking
- Nielsen-style broadcast/cable share report
- delayed viewing uplift report
- syndication value snapshot

#### 31.3.4 Rumor / Blind-Item Style Noise

Low-certainty items that may still move behavior.
Examples:
- “Whispers that a star wants script changes before committing”
- “Talk of showrunner fatigue on expensive sophomore drama”
- “One awards consultant says a frontrunner is losing momentum”

#### 31.3.5 Prediction Columns

Awards, box office, and renewal predictions generated at key calendar moments.
Examples:
- early Emmy watch list
- Oscar top 10 projection
- weekend box office forecast
- bubble-watch list for TV renewals and cancellations

### 31.4 Information Quality and Source Credibility

Every trade item carries a hidden and sometimes visible credibility profile.

Core values:
- **certainty**: how likely the item is true
- **source quality**: insider, agent leak, set leak, executive quote, analyst estimate, anonymous chatter
- **reach**: how widely the item spreads
- **heat impact**: how much the industry reacts before confirmation
- **half-life**: how long the story meaningfully affects behavior

This lets the game differentiate between:
- confirmed deal announcements
- highly credible early scoops
- speculative chatter
- opportunistic narrative pieces based on thin evidence

Practical rule: a rumor can move the market before it is proven, but a confirmed report moves systems more reliably and for longer.

### 31.5 The Rumor System

This expands the existing gossip layer into a formal simulation.

#### 31.5.1 Rumor Categories

Rumors can emerge in several domains:
- casting and attachments
- script quality or development trouble
- budget overruns
- bad test screenings
- on-set conflict
- awards campaign strength or weakness
- buyer mandate changes
- executive exits
- franchise sequel plans
- series renewal odds
- cast salary tension
- behind-the-scenes romance, scandal, or personality conflict

#### 31.5.2 Rumor Lifecycle

A rumor generally moves through five states:
1. **whisper** — only low-level industry chatter; limited gameplay effect
2. **trade item** — appears as a rumor/scoop; moderate effect on leverage and morale
3. **follow-up coverage** — more outlets echo it; market starts pricing it in
4. **confirmation or collapse** — rumor proven true, partly true, or false
5. **aftermath** — trust shifts, PR debt resolves, or grudges form

#### 31.5.3 Who Starts Rumors

Rumors may be seeded by:
- agents trying to inflate a client quote
- producers trying to create momentum for financing
- awards consultants boosting their contender
- rival studios undermining a package
- angry crew, leaked assistants, or estranged talent
- buyers pressure-testing the market
- the player’s own publicity apparatus

This creates a high-value strategic layer: sometimes you are managing rumors, sometimes exploiting them, and sometimes suffering from them.

#### 31.5.4 Player Interactions with Rumors

The player can choose among actions such as:
- ignore the item
- deny publicly
- leak a competing story
- accelerate dealmaking to make the rumor true
- quietly renegotiate affected contracts
- call talent personally to stabilize trust
- use PR budget to flood the cycle with alternate narratives
- embrace the attention if the rumor increases heat

#### 31.5.5 Rumor Accuracy and Reputation Memory

Outlets and insiders develop long-term trust scores. If a trade frequently publishes weak rumors about your studio that collapse, their future pieces may carry lower market impact. Conversely, consistently accurate award predictors or box office analysts become highly influential. The player’s own PR office also earns a credibility profile; repeated misleading spin may work short-term but reduce later trust.

### 31.6 Box Office Reporting System

Film performance should not arrive as a single “success/failure” verdict. The trades transform box office into a serial story.

#### 31.6.1 Core Box Office Values Reported

For each theatrical title, the system can surface:
- preview gross
- opening day
- opening weekend domestic gross
- domestic total / cume
- international opening and cume
- worldwide cume
- weekend-over-week drop
- theater count and expansion/contraction notes
- per-theater average
- production budget
- marketing spend estimate
- break-even estimate band
- profitability confidence band

#### 31.6.2 Framing Labels

To keep the system intuitive, the trades convert raw numbers into language such as:
- breakout hit
- solid hold
- front-loaded opening
- leggy sleeper
- disaster opening
- prestige overperformer
- family word-of-mouth winner
- international rescue story
- expensive underperformer

These labels help non-expert players understand what matters.

#### 31.6.3 Box Office Momentum

The important gameplay value is not just gross but **momentum narrative**. A $40M opening can be good or bad depending on budget, genre, comp titles, and expectations. Momentum affects:
- sequel confidence
- star quote inflation
- director prestige
- exhibitor/buyer trust
- awards visibility for prestige releases
- stock of family/IP value

#### 31.6.4 Comparative Context

Trades often compare results to comps. The game should do the same through short contextual notes:
- “Best opening for this actor in five years”
- “Below genre comps despite strong awareness”
- “Outperforming similar budget originals”
- “Strong international start offsets soft domestic debut”

This helps the player understand *why* talent value moved.

### 31.7 Television Ratings and Audience Report System

Television needs its own trade-reporting grammar rather than simply imitating film box office.

#### 31.7.1 Core TV Metrics Surface

Depending on buyer type and era flavor, the game can report:
- overnight or same-day rating/share
- live-plus-3 and live-plus-7 lift
- total viewers
- target demo share
- household rating
- ranking in timeslot
- season average trendline
- premiere vs finale retention
- binge completion proxy for streamer titles
- subscriber-acquisition contribution estimate
- churn-reduction estimate
- social buzz rank
- critic momentum rank

#### 31.7.2 Nielsen-Style Weekly Reports

At the end of each broadcast week, the player receives a digest of:
- top shows by total viewers
- top shows in key demo(s)
- biggest gainers and fallers
- strongest premieres
- most threatened bubble shows
- delayed viewing champions

This should feel like the player is opening a simplified, readable version of weekly trade charts.

#### 31.7.3 Platform-Sensitive Interpretation

The exact meaning of a “win” differs by model:
- broadcast cares heavily about share, demo, and ad-friendly consistency
- cable/premium cares more about identity and subscriber loyalty
- streaming cares about completion, acquisition, retention, and global long-tail performance
- studio-owned outlet may care about ecosystem synergy and catalog value

Therefore the trades should not just print numbers; they should print interpretation tailored to that buyer model.

#### 31.7.4 TV Success Labels

Examples:
- breakout freshman hit
- sturdy utility performer
- binge phenomenon
- critical darling with niche reach
- aging procedural still dependable
- sophomore slump
- expensive bubble drama
- cancellation likely unless foreign sales improve

### 31.8 Performance Metrics Driving Talent Value and Cost

This section connects reporting to the labor market.

#### 31.8.1 Film Talent Value Feedback

After a movie release, actor/director/producer/writer value shifts based on:
- budget-relative box office performance
- audience reception
- critic response
- awards heat
- profitability confidence
- how much the trades credit or blame the person

A star in a surprise hit may gain quote and attachment magnetism. A star blamed for a public flop may lose quote, become harder to finance, or require stronger packaging support.

#### 31.8.2 TV Talent Value Feedback

TV talent value changes based on:
- premiere strength
- season retention
- renewal probability
- episode efficiency and reliability
- awards and critics heat
- syndication potential
- social/cultural impact

A showrunner behind two reliable renewals becomes expensive and highly sought-after. A TV ensemble on a breakout multi-season hit can see collective upward pressure on per-episode quotes.

#### 31.8.3 Attribution Rules

Not every success or failure affects everyone equally. The game should attribute outcome credit with weighted logic:
- actor-heavy star vehicle gives more performance weight to lead cast
- auteur project gives more weight to director/writer-director
- franchise machine with weak reviews may reward producers more than actors
- long-running procedural reliability may reward showrunner and line-producing discipline more than prestige directors

#### 31.8.4 Heat Can Rise Faster Than Skill

The game should distinguish between actual craft capability and current market quote. A performer can become suddenly expensive because the market believes in them, even if their internal talent ceiling is unchanged. This creates bubble scenarios and risky overpays.

### 31.9 IP Value, Sequel Leverage, and Franchise Escalation

Trade reporting should also update the perceived value of the underlying property itself.

#### 31.9.1 IP Value Drivers

An IP or original title’s exploitation value changes through:
- theatrical profitability
- sustained TV performance
- awards prestige
- audience loyalty
- merchandise / ancillary fit where relevant
- memeability / cultural stickiness
- family-viewing longevity
- library rewatch value

#### 31.9.2 Film Sequel Logic

If a film overperforms, the trades may trigger sequel and spin-off chatter. This raises:
- cast asking prices for returns
- director quote if they are deemed central to the brand
- backend participation demands
- buyer/sales leverage for future installments
- cost of rights renewals or creator approvals

#### 31.9.3 TV Renewal and Extra-Season Value

A successful series raises value in several overlapping ways:
- renewal confidence
- cost of cast re-ups
- showrunner quote inflation
- back-end participation and EP fee growth
- library value for future package sale or syndication
- spin-off and franchise branch potential

#### 31.9.4 Success Creates Expensive Problems

An important fun principle: hits should not merely make life easier. They should create new negotiation headaches. Surprise success often leads to:
- cast demanding raises
- creators asking for more control
- first-look partners wanting richer terms
- agents pointing to trade coverage as proof of leverage
- expectations inflation on future installments

### 31.10 Compensation Models by Medium

This makes pay structures legible and distinct for film and television.

#### 31.10.1 Film Compensation

Movie talent is generally paid upfront for principal participation, especially above-the-line roles. Core components include:
- upfront acting fee
- directing fee
- producing fee
- writing fee / rewrite fee / polish fee
- optional bonuses tied to production milestones
- backend participation for major talent
- box office bonuses or awards bonuses in special deals

The player sees this on the package screen as a mix of guaranteed spend and contingent spend.

#### 31.10.2 Backend Participation for Films

Major stars, top directors, marquee producers, and elite writer-directors can negotiate backend such as:
- first-dollar gross style participation (rare, expensive, prestige/high-power only)
- adjusted gross participation
- net participation approximation
- box-office threshold bonuses
- sequel option bonuses

Gameplay rule: backend lowers immediate cash burden versus giant upfront quotes in some cases, but can become very expensive on hits. It also creates accounting, relationship, and profit-sharing stories.

#### 31.10.3 Television Compensation

TV cast are generally paid per episode, with season structure shaping real cost. Key components include:
- per-episode acting fee
- guaranteed minimum episode count
- pilot premium or series regular premium
- recurring guest rate
- writer episodic fee
- showrunner weekly/seasonal producing fee
- EP / co-EP / consulting producer fees
- season renewal step-ups
- success-triggered renegotiation rights

This makes TV budget modeling more dynamic than film because order count and renewal length directly alter labor cost.

#### 31.10.4 Showrunner and Writer Compensation

Writers and showrunners require special handling:
- pilot script fee
- series bible / development fee
- room-running fee
- per-episode producing fee
- season completion bonus
- renewal bonus
- backend points for creator-showrunners on valuable series

#### 31.10.5 Per-Episode Escalation

Long-running TV hits should become materially more expensive as cast and producing talent renegotiate. The system should support:
- automatic option-year bumps
- market reset demands after breakout seasons
- parity disputes among ensemble cast
- star breakout causing internal salary imbalance
- “final season premium” asks

### 31.11 Syndication, Library, and Long-Tail TV Revenue

Television should earn value beyond first-run release.

#### 31.11.1 Syndication as a Revenue Phase

Once a series accumulates enough episodes and reaches the appropriate performance profile, it can become eligible for syndication-style or library exploitation value. This may take different forms depending on era and buyer model:
- off-network package sale
- cable rerun package
- streamer catalog license
- international library sale
- AVOD/FAST style long-tail package

#### 31.11.2 Syndication Value Inputs

Syndication strength depends on:
- episode count
- repeat-watch friendliness
- broad audience familiarity
- evergreen appeal
- family-safe or comfort-viewing profile
- procedural accessibility
- cast recognizability
- brand wear-and-tear

#### 31.11.3 Strategic Effects of Syndication

Syndication or catalog value should:
- increase the long-term strategic value of renewals
- justify keeping a “solid but uncool” show alive
- change how much the studio will tolerate cast raises
- elevate the value of ownership versus mere production fees
- make library-heavy strategies viable

### 31.12 Awards Prediction and Prestige Media Layer

The trades should act as the public consciousness of the awards race.

#### 31.12.1 Awards Prediction Content Types

The outlets can publish:
- early watch lists
- monthly top-ten contender rankings
- nomination bubble pieces
- festival reaction recaps
- “who’s rising / who’s slipping” charts
- final winner predictions
- post-nomination surprise analysis

#### 31.12.2 Gameplay Effects of Awards Coverage

Awards prediction content affects:
- campaign efficiency
- prestige momentum
- voter perception proxy
- talent morale and ego
- quote inflation for likely nominees
- pressure to keep a release date or qualifying run

#### 31.12.3 Prediction Accuracy Matters

Each columnist or outlet can have a rolling awards-prediction credibility score. Highly accurate predictors move prestige heat more strongly. This mirrors the real feeling of industry insiders obsessing over who “has the best pulse.”

#### 31.12.4 Snub Shock and Momentum Crashes

If a once-favored contender misses nominations, that should have secondary consequences:
- campaign spend seen as wasted
- talent disappointment and blame
- prestige brand setback for the studio
- temporary quote softness for “overpushed” contenders

### 31.13 Trade Coverage as a Negotiation Weapon

Agents, managers, producers, buyers, and talent should cite the trades in actual negotiations.

Examples:
- “Deadline says three buyers are chasing this package.”
- “Variety has your actor at the top of every Emmy list.”
- “The latest ratings column calls the show a breakout, so our per-episode ask just changed.”
- “Weekend charts say this is underperforming; we need to revisit backend.”

Mechanically, trade coverage can modify ongoing negotiation stances by creating:
- quote pressure
- urgency pressure
- morale pressure
- public-expectation pressure
- legitimacy pressure

### 31.14 Player Tools for Managing the Trade Cycle

The player needs clean, fun controls to interact with this system.

#### 31.14.1 Press Office Functions

The studio’s PR/comms operation can perform actions like:
- issue statement
- grant exclusive interview
- set controlled leak
- embargo information
- deny rumor
- confirm attachment early
- launch awards narrative push
- release box-office brag materials
- reframe TV ratings story around delayed viewing or demos

#### 31.14.2 Information Strategy Modes

At the studio-policy level, the player may prefer:
- stealthy and controlled
- aggressive hype machine
- prestige seriousness
- investor-calming transparency
- playful rumor-friendly chaos

These modes alter how often stories break early, how much heat items generate, and how believable official statements feel.

#### 31.14.3 Exclusive Relationships

Strong studio relationships with certain outlets can modestly improve placement odds, tone, or timing, but overuse risks making coverage feel planted or cynical.

### 31.15 Weekly Event Integration

The trade system should be a backbone of the week-advance event engine.

Each week may generate:
- one or more major trade headlines
- scheduled metrics reports for active releases
- one rumor item from your orbit or rivals
- one awards/renewal/market prediction update during the relevant season
- a “what the town is talking about” summary card

This means the player is always reading the week not just through internal dashboards, but through how the town interprets them.

### 31.16 UI and Dashboard Requirements

#### 31.16.1 Trades Tab

A dedicated screen aggregates stories by category:
- breaking deals
- your studio coverage
- rivals coverage
- box office charts
- TV charts
- awards watch
- rumor mill
- market analysis

#### 31.16.2 Story Cards

Every story card should show:
- outlet name
- certainty level
- what changed mechanically
- one-sentence interpretation
- optional follow-up action

Example: “Variety Awards Watch: *The Glass Harbor* rises to #3 in Best Picture projection. Prestige Heat +6, Campaign Efficiency +4%, Lead Actor Quote Pressure +2.”

#### 31.16.3 Performance Reports Screen

A dedicated chart view should combine film and TV reporting with simple trend lines and labels like overperforming, stable, slipping, and breakout.

#### 31.16.4 Negotiation References

When talks are underway, the UI should visibly show any current trade items affecting leverage so players understand why asks changed.

### 31.17 AI and Rival Studio Behavior

Rivals should use the trade ecosystem too.

They can:
- leak casting to create false momentum
- bury bad test-screening chatter with shiny first-look announcements
- exploit your negative box office narrative to poach talent
- accelerate sequel claims after a breakout opening
- overreact to rumor-driven heat and overpay
- use awards prediction buzz to reposition their slates

This ensures the system produces stories across the whole industry rather than only around the player.

### 31.18 Balance Principles

- trades must be influential but not omnipotent
- rumors must be useful but not perfectly reliable
- metrics must matter, but interpretation should matter too
- a single bad weekend should sting without always destroying a career
- a single hot headline should raise costs, not instantly solve financing
- success should often create expensive second-order problems
- cool, clear presentation beats exhaustive realism where the two conflict

### 31.19 Canonical Rules Added by This Section

- Trade publications are formal entities in the weekly event/news system, with distinct personalities and specialties.
- Box office reports and Nielsen-style TV performance reports appear as recurring trade content, not just as internal financial tables.
- Film talent are primarily compensated through upfront payments, with backend participation available for top-tier talent and certain negotiated deals.
- Television cast are compensated on a per-episode basis, with options, guarantees, renewals, and breakout renegotiations driving later cost escalation.
- Box office, TV performance, awards heat, and trade framing all feed talent value, quote movement, and project/package leverage.
- IP value rises and falls through reported commercial and prestige performance, driving sequel, spin-off, extra-season, and renewal economics.
- Syndication/library exploitation is a meaningful late-life revenue layer for qualifying TV series.
- The rumor system is not purely cosmetic: rumors can alter morale, leverage, scheduling decisions, attachment stability, and buyer confidence before they are confirmed.
- Awards prediction coverage from the trades directly influences campaign momentum and prestige heat.
- Weekly progression should surface the industry’s interpretation of outcomes, not just the underlying numbers.

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


## Appendix C — Legacy Technical Snapshot (v7.6)

The following points are preserved from the v7.6 design/delivery sync because they contain implementation-facing detail that remains useful even where the main bible already reflects the same direction:

### C.1 Final Tech Stack Snapshot
- **Language:** TypeScript
- **Framework:** React SPA with Vite
- **State:** Zustand with Immer
- **Routing:** React Router
- **Styling:** TailwindCSS + Radix UI
- **Narrative scripting:** Ink.js
- **Icons:** Lucide
- **Audio:** howler.js
- **Animation:** Framer Motion
- **Charts:** Recharts, with targeted D3 helpers where needed
- **Game logic:** pure TypeScript modules
- **Parallelism:** Web Workers via Comlink
- **Deterministic RNG:** seedrandom
- **Validation:** Zod
- **Persistence:** Dexie.js with versioned migrations
- **Export/Import:** JSZip (+ pako)
- **Offline runtime:** Vite PWA plugin
- **Testing:** Vitest + React Testing Library
- **Delivery:** offline macOS ZIP with one-click launcher

### C.2 Why Next.js Was Removed
- SSR and ISR add little value in an offline ZIP product.
- Vite produces smaller bundles and simpler worker setup.
- The packaging path for macOS builds is cleaner.

### C.3 Acceptance Checklist Preserved from v7.6
- repo/game assumes Vite-only client
- Worker/Comlink config verified under Vite
- PWA offline install works from ZIP
- Dexie migration scripts scaffolded
- docs updated and placed in `/docs/`

## Appendix D — Legacy Finance UI Sketch (v4.9)

This component sketch is preserved verbatim in spirit because it is a concise implementation aid for the finance screen.

```
FinancePanel
 ├── CashflowChart (D3 stacked bars)
 ├── CategoryHeatmap
 ├── VarianceBars
 ├── CategoryDrawer
 ├── ProjectPnlModal
 │    ├── WaterfallChart
 │    └── Tabs [Overview | Cashflow | Contracts | Episodes]
 └── AlertsBanner / ThresholdWatcher
```

## Appendix E — Legacy Roadmap Matrix Snapshot (v5.1)

The roadmap in the main body is canonical. This appendix preserves the older A→K framing because it is still useful as a milestone compression view for planning conversations.

### E.1 Sprint Compression View
- **A:** playable core prototype
- **B:** talent and production loop
- **C:** finance and cash flow simulation
- **D:** liquidity, loans, and bankruptcy
- **E:** press, fandom, and PR dynamics
- **F:** rival AI and industry simulation
- **G:** culture, awards, and flavor systems
- **H:** legacy, universes, and crossovers
- **I:** UI/UX thematic polish
- **J:** refactor, stabilization, and tech debt
- **K:** gold master and epilogue

### E.2 Guiding Principle Preserved
Every sprint should ship a fully playable macOS ZIP, using “Coming Soon” placeholders only for future systems.


## 32. Unmade Screenplay Market, Heat Lists, and Passion Projects

### 32.1 Purpose
The game should include a **prestige-driven speculative script market** inspired by the real-world ecosystem around annual “best unmade screenplay” lists, hosted screenplay platforms, executive recommendation lists, coverage buzz, and agency circulation. In Hollywood, many projects gain value long before production begins because they are talked about, passed around, championed by executives, or become signature passion material for talent trying to get a project made. Studio Boss should turn this into a readable, exciting gameplay system.

This system creates a bridge between:

- source discovery
- writer development
- executive taste
- talent attachment
- rumor/trade coverage
- packaging and greenlighting
- prestige signaling
- frustrated passion projects that can simmer for years before finally igniting

The fantasy is that the player can discover a script everybody is suddenly talking about, option it before a rival, shepherd a difficult personal project for years, or deliberately gamble on a beloved but risky “town script” that the market loves even if the forecast is shaky.

### 32.2 Real-World Inspiration
The real-world inspiration is the ecosystem around **The Black List**, the annual survey of executives’ favorite unproduced screenplays, which has been published annually since 2005 and ranks the “most liked” rather than formally adjudicating the “best” scripts. The Black List’s founder and the platform’s own materials also describe a broader ecosystem where scripts, pilots, plays, and manuscripts can be surfaced to industry professionals, and where annual lists, evaluations, and curated programs can increase visibility for unmade material. citeturn878410view0turn726001search1turn726001search2

The annual list has historically mattered because appearing on it can raise a writer’s profile, help scripts move into production, and create cultural heat around material that is not yet made. Official Black List materials state that hundreds of listed scripts have later been produced and that the annual list is compiled from surveys of Hollywood executives about their favorite unproduced screenplays from that calendar year. citeturn878410view0turn726001search0turn726001search2

Studio Boss should not merely copy one brand name. Instead, it should build a broader fictionalized gameplay layer that captures the **spec script market**, **heat lists**, **annual discovery surveys**, **insider recommendation boards**, and **passion project circulation** in a way that feels intuitive and dramatically useful.

### 32.3 Core Feature Summary
Add a new discovery and development layer built around five connected systems:

1. **The Heat List** — a rolling in-game list of the most talked-about unmade projects in town
2. **The Annual Unmade List** — an end-of-year prestige survey of favorite unproduced scripts
3. **The Open Submission / Coverage Market** — scripts entering the ecosystem through writers, reps, labs, fellowships, contests, first-look pods, and hosting platforms
4. **Passion Projects** — material personally championed by actors, writers, directors, producers, or showrunners
5. **Spec Auction and Attachment Races** — the market contest to option, buy, package, or revive unmade material

Together these systems should make “finding the next great thing” feel like a major part of the studio fantasy rather than a flat content shop.

### 32.4 New Discovery Categories
Projects entering the market should now be tagged by discovery origin. This origin shapes cost, prestige, risk, and who is likely to care.

Discovery origins include:

- open spec screenplay
- agency package submission
- writer sample
- blacklist-style heat list mention
- annual unmade list honoree
- fellowship or lab selection
- talent passion project
- director dream adaptation
- actor vanity vehicle
- first-look pod submission
- internal development rewrite
- dormant turnaround revival
- festival short expanded to feature or series
- article or book brought in specifically by a writer or star

This matters because a project discovered as an **open spec** behaves differently from a **star passion project** or a **pod-submitted script**.

### 32.5 The Heat List
The **Heat List** is a living weekly screen inside the development dashboard. It represents the current “town conversation” around unmade material.

Each Heat List entry should include:

- title
- format (feature, pilot, limited series, play adaptation, manuscript adaptation)
- genre and tone
- writer and rep status
- current heat score
- prestige score
- commercial forecast
- package readiness
- rights status
- number of interested buyers
- attached or rumored talent
- whether it is a passion project for specific talent
- whether it is internally available, being auctioned, or already in soft attachment with a rival

The Heat List is not a simple ranking of quality. It is a composite of:

- script quality
- concept hook
- market freshness
- trade buzz
- executive recommendation chatter
- attached talent rumors
- awards or prestige upside
- scarcity and exclusivity
- rivalry behavior
- recent coverage scores
- whether the script aligns with current buyer mandates

This makes the Heat List a dynamic market dashboard rather than a static shopping list.

### 32.6 Annual Unmade List
Once per in-game year, a formal **Annual Unmade List** event should fire. This is a prestige-heavy awards-season-adjacent ritual in which executives, producers, buyers, development heads, and pod leaders effectively surface their favorite unmade screenplays and pilot scripts of the year.

The Annual Unmade List should:

- spotlight 10 to 50 unmade projects depending on game size and year
- heavily increase prestige and town awareness for listed writers and scripts
- create short-term bidding, meeting, and attachment windows
- generate trade coverage, rumor items, and awards-prediction-style narrative around scripts “everyone loves”
- raise the chance that actors, directors, and vanity shingles request those scripts
- create disappointment and resentment among near-misses
- affect writer career momentum even if the script is not purchased

This annual event should feel like a hybrid between:

- a discovery market pulse
- a cultural tastemaker list
- an executive social signal
- a late-year development scramble

### 32.7 Fictionalization Approach
For legal and tonal reasons, the game should present fictionalized outlets and lists, such as:

- **The Heat List**
- **The Town List**
- **The Annual Unmade Survey**
- **The Industry 25**
- **The Breakout Script List**

The system can still be transparently inspired by real industry behavior, but fictional naming gives the game freedom to tune rules and UI clarity.

### 32.8 Script Attributes for the Unmade Market
To support this system, scripts and unmade projects need a richer attribute model.

Add the following fields to screenplay and pilot assets:

- concept strength
- execution quality
- originality
- marketability
- prestige potential
- production difficulty
- budget pressure
- package friendliness
- rewrite need
- awards friendliness
- franchise potential
- TV extension potential
- actor bait score
- director bait score
- showrunner bait score
- rep enthusiasm
- executive buzz
- reader score
- controversy risk
- adaptation complexity
- passion intensity
- vanity suitability
- heat volatility
- script voice distinctiveness
- quotability / scene showcase value
- role showcase value for performers

These values should not all be visible numerically. Many should be surfaced through tags and readable descriptors.

### 32.9 Readable User-Facing Tags
To keep the system fun and intuitive, scripts should use clear shorthand tags such as:

- Town Hot
- Quiet Gem
- Actor Magnet
- Awards Catnip
- Rewrite Needed
- Director’s Dream
- Expensive on the Page
- Franchise Seed
- Pilot Engine Strong
- Hard Sell, Great Script
- Star Vanity Vehicle
- Passion Project
- Industry Favorite
- Blacklist-Type Script
- Great Writing, Tough Market
- Easy Package
- Needs Auteur

This lets players read the market quickly without drowning in hidden equations.

### 32.10 Script Supply Channels
New scripts should enter the ecosystem from multiple supply channels each week or month.

Supply channels include:

- agencies and managers submitting material
- unrepresented writers gaining traction via contests, labs, viral buzz, or platform attention
- first-look pods feeding internal material
- showrunners or EPs bringing pilots
- actors bringing packages through their shingles
- directors attaching to projects they want to make
- internal studio development executives sourcing from readers and assistants
- rights scouts finding adaptation material
- film-festival shorts or theater works being expanded

The source channel should influence:

- access cost
- credibility
- deal complexity
- attached expectations
- rewrite obligations
- rival interest intensity

### 32.11 Coverage, Readers, and Internal Taste
Studios should not automatically know whether a new script is good. Add a lightweight **coverage system**.

Scripts can be:

- unread
- skimmed
- covered by junior readers
- covered by senior development executives
- sent to talent or pods for reaction
- internally championed by a specific exec

Coverage returns should include:

- pass / consider / recommend / strongly recommend
- strengths and weaknesses text snippets
- comparable titles
- likely buyer concerns
- talent attachment ideas
- budget flags
- awards / commercial notes

Internal executives should also have personal taste profiles. Some love prestige dramas, some love four-quadrant commercial material, some are drawn to edgy auteur scripts, some are skeptical of risky original films. This makes the discovery process feel human and political.

### 32.12 Executive Champions
A script becomes much more actionable when an internal executive **champions** it.

Championing provides:

- faster movement through the greenlight queue
- stronger confidence in packaging conversations
- better trade leak momentum
- improved odds of talent reading the script quickly
- more resistance to early abandonment

But championing also creates politics. If a pet script fails, the champion’s credibility drops. If a championed script becomes a smash hit or awards giant, that executive gains influence.

### 32.13 Passion Projects
A **Passion Project** is material that a specific talent or executive deeply wants to make for personal, artistic, thematic, image, or legacy reasons.

Any of the following can generate or adopt a passion project:

- actor
- writer
- director
- producer
- showrunner
- vanity shingle head
- family banner
- studio founder / CEO
- internal creative executive

Passion projects should arise from causes such as:

- personal life resonance
- dream role desire
- prestige ambition
- awards pursuit
- genre reinvention attempt
- family legacy continuation
- political or social relevance
- long-gestating adaptation dream
- comeback narrative
- “prove they can do more” impulse
- auteur obsession

### 32.14 Passion Meter
Each passion project gets a **Passion Meter** indicating how emotionally and strategically important it is to the champion.

Low passion means:

- nice to do
- easy to drop if heat cools

Moderate passion means:

- champion will keep asking about it
- may accept compromises

High passion means:

- champion pushes repeatedly
- willing to take lower fee, produce, rewrite, or campaign for it
- may sour relationship if ignored or stalled

Extreme passion means:

- champion may reserve schedule for it
- may bring financing, vanity shingle support, or prestige collaborators
- may refuse replacement projects until it moves
- may leave the studio, move the package elsewhere, or publicly express frustration if mishandled

### 32.15 Why Passion Projects Matter to Gameplay
Passion projects create drama because they are not always rational.

They may:

- be brilliant but commercially difficult
- be clearly weak but irresistible to an A-list star
- be easy to finance if the right actor is obsessed
- become a multi-year relationship test between talent and studio
- conflict with current strategy but carry prestige upside
- generate PR and awards narratives if finally made

This gives the player classic Hollywood dilemmas:

- Do you indulge the star’s dream project to keep them loyal?
- Do you support a writer-director’s difficult debut because it might become a signature cultural win?
- Do you quietly bury a beloved internal pet project because the numbers do not work?

### 32.16 Passion Project Lifecycle
A passion project should move through distinct states:

1. Discovered
2. Championed
3. Packaged
4. Waiting for heat / financing / availability
5. Rewritten for viability
6. Greenlit
7. Stalled
8. Turnaround / dormancy
9. Revived
10. Produced or abandoned

A stalled passion project should remain in the simulation. It can resurface years later with:

- older talent seeking a comeback
- a lower-budget new angle
- TV conversion instead of film
- streamer interest
- awards trend changes
- renewed public relevance

### 32.17 Dormant Scripts and Turnaround
Not every bought script gets made. Add a **Dormant Project Library** and **Turnaround Market**.

Dormant scripts are projects that:

- were optioned but not greenlit
- lost attachments
- became too expensive
- were politically buried
- stalled in rewrite hell
- no longer fit current mandates

These dormant assets can later be:

- revived internally
- sold into turnaround
- repackaged for TV
- converted to a lower-budget label
- taken by a first-look pod or vanity shingle
- rediscovered through a trades “What Ever Happened To?” item

This gives unmade material a second life and makes the world feel historically layered.

### 32.18 Spec Auctions
Some hot scripts should trigger a **spec auction** event.

Auction conditions include:

- high heat score
- multiple interested buyers
- strong rep enthusiasm
- timely thematic relevance
- major talent circling
- annual list placement

In an auction, the player may compete via:

- upfront purchase price
- guaranteed rewrite funds
- fast-track greenlight commitment
- attachment promises
- backend participation
- vanity shingle involvement
- awards campaign promises
- creative control concessions
- series room guarantee for pilots

The highest cash bid should not always win. Relationship strength, speed, prestige fit, and talent alignment should matter.

### 32.19 Option vs Purchase Structure
The player should usually choose between:

- shopping agreement
- short option
- long option
- outright purchase
- rights reversion deal
- development deal with milestones

This matters because many players will not want to fully buy every hot script. Optioning is cheaper but riskier; a rival may poach later if milestones are missed.

### 32.20 Writing Talent as a Market Class
Because this system centers unmade material, **writers** must now have even deeper market behavior.

Writers should have:

- quote level for assignment work
- spec sale heat
- critical prestige
- reliability on delivery
- rewrite strength
- voice distinctiveness
- room leadership for TV
- adaptation skill
- collaborator compatibility
- awards credibility
- trend relevance
- rep quality

A writer with a famous annual-list hit but no produced credits should be treated differently from:

- a veteran rewrite specialist
- a showrunner factory worker
- a playwright crossover darling
- an actor-writer multi-hyphenate
- a commercial franchise script doctor

### 32.21 The Writer Career Flywheel
The system should allow an unmade script to improve a writer’s career even if the project itself never gets produced.

Possible benefits:

- higher quote on assignment jobs
- better reps
- stronger interest from pods and first-look labels
- TV staffing offers
- rewrite assignments
- passion attention from directors and stars
- prestige increase

This is realistic, dramatically satisfying, and important for emergent storytelling.

### 32.22 Auteurs and Material Pairing
Auteurs, writer-directors, showrunners, and star-producers should have preference profiles for the kind of unmade material they respond to.

Examples:

- an auteur director hunts for emotionally difficult awards material
- a comedy star wants a role-forward vanity vehicle
- a family-banner sibling duo seeks scripts about identity and dysfunction
- a genre filmmaker searches for high-concept low-budget bangers
- a prestige showrunner wants “limited series bait” with strong pilot engine

This creates a **matching game** where the right script plus the right champion can suddenly unlock viability.

### 32.23 The Development Marketplace UI
Add a dedicated **Development Marketplace** screen.

Key tabs:

- Hot Scripts
- Annual Unmade List
- Open Submissions
- Passion Projects
- Dormant / Turnaround
- Rights Scouts
- Internal Coverage Queue

Each entry should surface:

- short logline
- heat tag
- format
- genre
- estimated budget band
- status of rights
- who is circling
- why it matters now
- recommended next actions

The player should then be able to take immediate actions from the same screen.

### 32.24 Key Player Actions
From this system, the player can:

- request script
- order coverage
- share with pod or shingle
- approach rep
- option project
- buy project
- place hold while packaging
- attach writer for rewrite
- attach actor / director / producer / showrunner
- move to internal development
- shelve for later
- leak interest to trades
- keep quietly internal
- move to awards-minded prestige label
- convert film to TV exploration
- spin into franchise development research

This keeps the system active rather than decorative.

### 32.25 Trade Integration
Because the bible already includes a trade-press system, the new unmade market should feed directly into trades.

Trades can publish stories such as:

- “Town script sparks weekend bidding war”
- “Annual Unmade Survey favorite lands A-list director”
- “Beloved script quietly stalls after star exits”
- “Actor turns passion project into vanity-shingle priority”
- “Writers lab standout suddenly hottest new voice in town”
- “Spec package loses momentum after bad coverage whispers”

These headlines affect:

- heat score
- rival interest
- talent value
- writer career momentum
- studio brand as tastemaker or trend-chaser

### 32.26 Awards Integration
Although unmade scripts do not win film awards directly, the annual unmade list and spec market should influence the **awards ecosystem indirectly**.

Effects include:

- awards-savvy talent chasing top scripts
- prestige labels using list placement as a scouting filter
- later campaigns referencing a project’s long heat history
- writers with annual-list recognition gaining automatic prestige credit

This helps the player understand why development choices matter years before release.

### 32.27 Passion Projects and Awards Bait
Some passion projects should be explicitly flagged as:

- performance bait
- adaptation bait
- director showcase
- comeback vehicle
- message prestige drama
- limited-series Emmy magnet
- “this could die in development forever”

This is where fun and intuition matter. The player should instantly understand that some projects are exciting precisely because they are dangerous.

### 32.28 Budget Pressure from Hot Material
A hot script should get more expensive in several ways:

- purchase price rises
- writer quote rises
- star demands increase
- director asks for greater control
- package expectations escalate
- schedules become harder to align

A cold script can sometimes become a bargain if bought quietly before the market wakes up.

### 32.29 Talent Discounts on Passion Projects
To avoid purely punitive economics, talent should sometimes reduce cost on true passion projects.

Possible concessions:

- actor lowers upfront fee for role quality
- director takes less in exchange for final cut or backend
- writer agrees to rewrite for ownership or EP credit
- producer pod spends internal development capital
- vanity shingle contributes overhead support

This lets passion compete with money in a way that feels strategically rich.

### 32.30 Packaging Synergy Bonuses
When the right script meets the right people, the game should award **synergy bonuses**.

Examples:

- actor plus script role fit
- director plus tone fit
- writer plus adaptation fit
- showrunner plus series engine fit
- vanity shingle plus brand alignment

Synergy can increase:

- greenlight confidence
- awards upside
- trade excitement
- market projection
- internal morale

### 32.31 Failed Heat and Overhype
Not every hyped script should work.

The system should support:

- overhyped scripts with poor execution
- annual-list darlings that never package
- actor passion projects that disappoint on read
- scripts that get worse with rewrites
- “everybody likes it, nobody wants to pay for it” outcomes

This is crucial because the fun comes from evaluating heat, not blindly following it.

### 32.32 Assistant and Advisor Support
Because the system adds density, advisors should translate it into plain English.

Examples:

- “This is hot because people love the writing, but it may be too expensive to shoot.”
- “The market likes this more than audiences probably will.”
- “If we move now, we can probably option this before the annual list lands.”
- “This is clearly a star’s vanity passion project. We can use it to keep them loyal, but not to stabilize cash flow.”

This makes the feature intuitive for players who do not know real Hollywood jargon.

### 32.33 AI Studio Behavior
Rival studios should interact with the system intelligently.

Different archetypes should behave differently:

- prestige mini-major hunts annual-list darlings
- commercial major buys high-concept specs with franchise hooks
- streamer chases pilot-ready series packages
- talent-driven studio backs passion projects from vanity shingles
- distressed studio sells dormant scripts and rights into turnaround

This keeps the player from always having first pick.

### 32.34 Family and Dynasty Interactions
The family system should plug into this naturally.

Examples:

- sibling filmmakers champion a script together
- a nepo-baby writer gets reads faster but harsher skepticism
- a family banner revives an old dormant project associated with a parent legend
- a dynasty actor uses clout to mount a vanity adaptation

This extends the lineage system rather than creating a siloed feature.

### 32.35 TV and Showrunner Extension
The unmade market should not only be features. It should also support:

- pilots
- limited series bibles
- streamer packages
- play adaptations for TV
- article-to-series pitches
- showrunner vanity concepts

Pilot scripts can appear on hot lists, attract cast, or become room-launch engines. Showrunners should be able to champion or originate passion TV projects much like film auteurs do.

### 32.36 Data Model Additions
Add or expand these entities and fields:

**Script / Project Asset**
- discovery_origin
- heat_score
- annual_list_score
- coverage_state
- executive_buzz
- passion_flag
- passion_owner_id
- dormant_state
- turnaround_eligible
- market_visibility
- auction_state
- synergy_tags

**Writer Talent**
- spec_heat
- annual_list_history
- coverage_avg
- assignment_quote
- passion_tendency
- rewrite_reputation
- sample_strength

**Studio / Executive**
- taste_profile
- champion_capacity
- discovery_bonus
- market_reputation_as_buyer

**Event System**
- annual_unmade_list_drop
- spec_auction_open
- hot_script_leak
- script_stalls
- dormant_revival
- lab_breakout

### 32.37 Suggested Weekly Rhythm Integration
A simple cadence could be:

- weekly: 3 to 12 new materials enter circulation depending on studio scale
- biweekly: some items gain or lose heat
- monthly: coverage summary and dormant project review
- quarterly: fellowship / lab / contest breakouts
- yearly: Annual Unmade List and major development market reset

This rhythm ensures the market feels alive without becoming spammy.

### 32.38 Player Stories the System Should Generate
This feature is succeeding when the player gets stories like:

- “We bought a quiet script before it hit the annual list, attached a director, and turned it into our awards breakout.”
- “A star begged us for a personal drama nobody believed in, but they took a pay cut and it won Oscars.”
- “We overpaid for the hottest spec in town, then the actor walked and the whole package collapsed.”
- “A script we shelved for five years came back as a limited series and became our biggest prestige win.”
- “Our rival got the town-hot script, but we signed the writer to an overall deal and won the long game.”

### 32.39 Balancing Principles
To keep the system fun and intuitive:

- present clear tags, not wall-to-wall hidden numbers
- make heat understandable but not perfectly predictive
- ensure some passion projects become iconic and some implode
- ensure writers can advance from unmade work alone
- ensure not every hot script is right for every studio
- make timing matter as much as money
- let quiet early discovery beat expensive late chasing

### 32.40 Canonical Design Rule
**Unmade material is not just inventory. It is a living market of taste, status, ambition, and obsession. Studio Boss should treat scripts, pilots, and passion projects as social objects whose value changes based on who loves them, who is talking about them, and whether the player can turn heat into an actual production.**


---

## 33. Talent Agencies, Agents, Managers, and Packaging Ecosystem

### 33.1 Purpose
This system models the representation layer that sits between the studio and the people who actually make the content. In the real industry, agencies and agents do far more than merely pass messages. They discover talent, shape careers, create leverage, steer clients toward prestige or commercial work, assemble combinations of clients into packages, move rumors into the trades, and quietly influence which projects feel “real” in the marketplace.

In **Studio Boss**, the agency system should make the player feel like they are operating inside a living ecosystem of power brokers rather than shopping from a static list of available talent.

The goals of this system are to:

- make talent acquisition feel social, competitive, and strategic
- create a middle layer between talent value and project packaging
- generate emergent stories about loyalty, poaching, favoritism, and dealmaking
- support package offers, coordinated pitches, and talent bundles
- create meaningful differences between elite full-service agencies and smaller boutiques
- integrate representation into greenlight, scheduling, rumors, trade coverage, awards, and renewals

This system should be **fun and intuitive**, which means the player should not need to micromanage every phone call. The player should be able to interact at three levels:

- **strategic**: choose agency relationships, staffing philosophy, and negotiation posture
- **tactical**: respond to pitches, approve packages, counter offers, and pursue specific clients
- **delegated**: let casting, business affairs, or creative executives work agency channels automatically

### 33.2 Real-World Inspiration
The system should draw inspiration from the broad structure of the modern Hollywood agency business without reproducing any one company literally. Large agencies in the real market are broad, cross-disciplinary firms representing actors, directors, writers, producers, creators, books, brands, sports, and more, while other firms emphasize a more boutique, hands-on identity. CAA describes its motion picture business as representing actors, directors, writers, and producers and highlights film packaging and financing work. WME presents itself as a long-running agency spanning books, digital media, fashion, film, food, music, sports, television, and theater. UTA describes itself as a full-service global talent, sports, entertainment, and advisory company. Gersh positions itself as a major but more hands-on client-first firm. citeturn133249search20turn133249search8turn133249search6turn133249search12

That real-world variety should inform the game’s fictional market:

- **power agencies** dominate major stars and franchise packaging
- **mid-tier agencies** compete on responsiveness, hustle, and selective prestige
- **boutique agencies** focus on curation, loyalty, breakout discovery, and personal attention
- **specialized representation shops** may focus on writers, directors, comedy, unscripted, digital creators, international talent, or prestige auteurs

The game should use **fictional agencies and fictional agents**, but their behavior should feel legible to anyone who knows Hollywood.

### 33.3 Core Design Summary
The representation system introduces the following pillars:

1. **Agencies as organizations** with scale, specialties, leverage, culture, and reputations.
2. **Agents as individual operators** with taste, aggression, client care, packaging habits, and personal relationships.
3. **Clients as rosters** attached to agencies and agents across all supported talent classes.
4. **Agency movement** where clients can switch agents, switch agencies, follow a departing agent, or become free agents.
5. **Agency pitches** where representation proactively brings the player talent, packages, passion projects, and prebuilt teams.
6. **Package deals** where multiple represented clients are pitched together for speed, financing, awards prestige, or commercial upside.
7. **Representation leverage** affecting negotiation friction, quote growth, backend asks, renewal pressure, and release-window politics.
8. **Visibility surfaces** where the player can inspect agencies, agents, rosters, and their strategic fit.

### 33.4 New Entity Layer
Add the following simulation entities:

#### Agency
Fields:
- agency name
- agency tier
- market positioning
- office footprint
- specialties by talent type
- client roster size
- relationship strength with each studio
- aggressiveness
- packaging tendency
- prestige focus
- commercial focus
- reputation for honesty or hardball tactics
- internal stability
- poaching susceptibility
- rumor leakage tendency
- commission culture
- diversity and discovery strength

#### Agent
Fields:
- name
- agency affiliation
- department
- seniority
- client capacity
- roster list
- taste profile
- commercial instinct
- prestige instinct
- responsiveness
- aggressiveness
- loyalty
- ethics / leak risk
- packaging tendency
- mentorship strength
- burnout risk
- relationship values with studios, buyers, and individual executives

#### Representation Contract
Fields:
- represented client
- agent
- agency
- start date
- representation strength
- satisfaction
- exclusivity
- commission bracket abstraction
- sunset clause / expiry pressure
- flight risk
- recent wins together
- recent losses together

#### Talent Representation Preferences
Fields:
- wants power agency
- wants boutique attention
- values awards positioning
- values commercial opportunity
- values personal care
- values international reach
- values packaging support
- values career reinvention support
- values creator-business expansion

### 33.5 Supported Client Types
All major talent classes should be representable:

- actors
- writers
- directors
- producers
- showrunners
- creators
- multi-hyphenates
- child actors and former child stars
- prestige auteurs
- commercial franchise specialists
- reality / unscripted talent if that branch exists later
- authors / underlying-rights holders in systems where adaptation rights matter

Important rule: **writers are fully integrated into agency systems**, not treated as a hidden backend variable. Literary departments should be major feeders of the development pipeline.

### 33.6 Agency Archetypes
The game should ship with a large fictionalized roster of agencies across the market spectrum.

#### 33.6.1 Powerhouse Agencies
Traits:
- strongest access to A-list talent
- highest packaging leverage
- most cross-department coordination
- most expensive asks from clients
- strongest ability to turn rumors into market heat
- most likely to play studios against one another

Strengths:
- ideal for tentpoles, awards campaigns, and premium TV packages
- deep rosters make replacements easier
- can assemble impressive bundles quickly

Weaknesses:
- players may feel pushed into costly deals
- major clients are harder to lock without concessions
- these firms may punish a studio that repeatedly lowballs their roster

#### 33.6.2 Prestige-Centric Major Agencies
Traits:
- strong literary and director departments
- festival credibility
- awards positioning strength
- better for passion projects and auteur cinema

#### 33.6.3 Commercial Mid-Tier Agencies
Traits:
- high hustle
- aggressive pitching
- strong relationship selling
- willing to discount rising talent to create breakout stars

#### 33.6.4 Boutique Relationship Agencies
Traits:
- fewer clients per agent
- stronger loyalty
- higher probability of hand-crafted pairings
- more transparent communication
- lower pure market leverage

#### 33.6.5 Specialist Agencies
Possible specialties:
- writers and showrunners
- prestige directors
- comedy talent
- genre specialists
- family entertainment talent
- international co-production talent
- creators and digital-native voices

### 33.7 Agency Identity and Culture
Every agency should have readable identity tags shown in UI, such as:

- Awards Hunters
- Franchise Brokers
- Writer Whisperers
- TV Powerhouse
- Boutique Tastemakers
- Hardball Negotiators
- Talent Incubator
- Family Business Friendly
- International Reach
- Packaging Machine
- Low-Drama
- Leak-Prone

These tags should summarize the numbers beneath them and help the player understand who to work with.

### 33.8 Agency Relationship Scores
The studio tracks a relationship score with each agency. This is not purely “friendship”; it reflects how pleasant, profitable, credible, and strategically useful your studio seems from the agency’s perspective.

Relationship score is influenced by:
- whether you pay on time
- how often your projects actually go forward after attachments
- whether you honor creative promises
- how often your sets run over and cause schedule chaos
- awards success delivered to clients
- box office and ratings wins delivered to clients
- whether you recast clients after delays
- whether you leak negotiation details to the trades
- how often you pass on agency packages
- whether you rescued one of their clients from a troubled project

High relationship effects:
- better access to premium clients
- earlier looks at hot specs and packages
- more favorable initial negotiations
- first call when a client becomes unexpectedly free
- fewer rumor leaks

Low relationship effects:
- fewer premium pitches
- tougher negotiations
- less willingness to hold talent while your project wobbles
- more hostile trade narratives
- rival studios receiving first shot at top clients

### 33.9 Agents as Distinct Characters
The player should not only deal with “the agency”; they should increasingly recognize individual agents.

Each notable agent should feel like a character archetype, for example:
- the feared rainmaker who always pushes for backend and top billing
- the literary agent who can smell a breakout script before anyone else
- the boutique nurturer who cultivates loyalty for decades
- the showrunner wrangler who staffs rooms quickly
- the talent shark who leaks to the trades when negotiation stalls
- the cultural strategist who pushes clients into prestige pivots

Agent traits should materially affect gameplay.

Examples:
- an aggressive agent raises cost but increases urgency and market heat
- a collaborative agent makes replacements and saves easier
- a high-taste literary agent can identify sleeper scripts and unexpected pairings
- a burnished awards strategist boosts nominee odds when their clients are in the conversation

### 33.10 Agency and Agent Directory UI
Add a **Representation Hub** to the dashboard.

Primary tabs:
- Agencies
- Agents
- Clients
- Open Packages
- Agency Pitches
- Movement Watch

#### Agencies View
For each agency show:
- logo / badge
- tier
- specialties
- relationship score with your studio
- total clients by category
- hottest current clients
- package rating
- current open pitches
- reliability notes
- rivalry notes

Clicking an agency opens:
- overview
- department breakdown
- list of agents under the agency
- all clients by department
- top market movers
- current rumors involving clients
- recent deals with your studio

#### Agents View
For each agent show:
- name
- agency
- department
- seniority
- client count
- current hot clients
- style tags
- relationship score with your studio
- recent successful placements

Clicking an agent opens:
- bio summary
- their full client list
- current active pitches
- who might be unhappy on their roster
- which clients they are trying to rebrand, upgrade, or move into producing

This directly satisfies the fantasy of being able to **see an agency, all its agents, and all their clients** in a readable way.

### 33.11 Client Lists and Cross-Representation Readability
Every talent profile should show:
- current agent
- agency
- department
- representation satisfaction
- openness to moving
- whether they are being jointly pitched with other clients
- whether they are part of an agency growth initiative
- whether their agent is pushing them toward film, TV, producing, prestige, franchise work, or awards bait

Every project package view should show representation badges so the player can immediately see:
- how many attached people come from one shop
- whether an agency is effectively trying to package the project
- where leverage is concentrated

### 33.12 Agency Pitches
Agencies should proactively approach the studio with offers. These should arrive in weekly updates, inbox items, trade blurbs, or direct pitch events.

Pitch categories:
- single-client push
- pairing suggestion
- full package bundle
- passion project championing
- vanity shingle project pitch
- “client looking for comeback vehicle” alert
- “client unexpectedly free due to schedule shift” alert
- “take this package before rivals do” heat pitch

Each pitch should surface:
- who is being offered
- why they fit
- cost implications
- prestige/commercial implications
- expiration timer
- hidden agenda hints

Example pitch:
- agency proposes a mid-budget thriller starring one of their TV breakouts, directed by one of their genre directors, from a script by one of their literary clients
- cost is favorable if all three are hired together
- acceptance improves relationship with that agency
- rejection may send the same package to a rival studio next week

### 33.13 Package Deals
Package deals are a major part of the fun.

A package is an agency-brokered bundle of two or more compatible clients offered together to accelerate financing, greenlight confidence, or awards potential.

Possible package structures:
- actor + director
- actor + writer
- actor + producer + director
- writer + showrunner + lead actor for TV
- director + cinematically prestigious actor + awards publicist tag
- family banner + star + vanity shingle project
- showrunner + room staffing mini-bundle

Package benefits:
- faster packaging
- greenlight score bonus
- chemistry bonus if clients have prior success together
- better trade heat
- buyer confidence increase
- lower search friction

Package risks:
- concentrated leverage
- if one person drops out the package may collapse
- bundled discount may be offset by stronger backend demands
- agency relationship damage if you cherry-pick one client and reject the rest

### 33.14 Packaging Logic
Each agency has a **Packaging Ability** stat derived from:
- cross-department roster depth
- reputation
- relationship with your studio
- current market heat
- internal coordination strength
- senior agent quality

Each proposed package has a **Package Cohesion Score** derived from:
- genre fit
- audience fit
- prior collaboration chemistry
- prestige alignment
- cost efficiency
- schedule overlap
- brand or vanity shingle alignment
- IP fit

A high cohesion package can create emergent “why didn’t I think of that?” moments that feel clever rather than random.

### 33.15 Cherry-Picking and Package Etiquette
The player can attempt to break a package apart.

Options:
- accept full package
- counter with partial package
- take only one client
- ask for alternatives from same agency
- shop other agencies for competing combinations

Consequences of cherry-picking:
- minor or major relationship damage depending on agency culture
- agent-specific resentment
- reduced willingness to package for your studio later
- potential rumor item about the project “falling apart” or negotiations “cooling”

However, some agencies are pragmatic and will allow disassembly if the project still benefits a favored client.

### 33.16 Talent Movement Between Agents and Agencies
Talent should not remain permanently represented by the same people.

Movement types:
- client changes agent inside same agency
- client leaves agency for rival agency
- client follows departing agent to new firm
- agent gets promoted and inherits larger roster
- agent leaves and clients get redistributed
- client fires reps after career stall
- talent goes unrepresented briefly after scandal or crash
- young breakout talent is aggressively poached by higher-tier agencies

Movement triggers:
- breakout success
- awards nomination or win
- commercial breakout
- long slump
- scandal mishandling
- lack of auditions / offers
- dissatisfaction with pay outcome
- desire for career pivot into directing/producing/showrunning
- interpersonal fit
- agency instability

Movement should create real market motion. After a hit, half the town may call a previously modest actor.

### 33.17 Free Agency Windows
Some talent may periodically enter a soft or hard free-agency state.

Soft free agency:
- still represented, but open to change
- easier to court indirectly
- more likely to entertain rebrand packages

Hard free agency:
- currently without reps
- harder to negotiate efficiently
- may be undervalued or chaotic
- can be attached cheaply before market catches up

This creates opportunities for savvy players to move early on talent before the rest of the industry resets their value.

### 33.18 Poaching and Follow-the-Agent Behavior
When a powerful agent moves from Agency A to Agency B, some clients may follow.

Simulation effects:
- agencies can lose department strength suddenly
- boutique agencies can be gutted or suddenly become hot
- package networks can break and reform
- studio relationship maps can shift overnight

The game should occasionally generate town-shaking events like:
- three prestige directors and a star writer follow an agent to a rising boutique
- a weakened major agency becomes more aggressive in pitches to rebuild momentum

### 33.19 Agency-Specific Negotiation Flavor
Negotiations should feel different depending on representation.

Examples:
- one agency prioritizes quote and billing
- one prioritizes backend and producing rights
- one prioritizes awards release windows
- one prioritizes future overall deals or first-look commitments
- one prioritizes family-friendly schedules for child stars
- one pushes multi-picture options
- one aggressively pursues executive producer credits for actor clients

This gives agency choice texture without turning it into law-school simulation.

### 33.20 Packaging Through Agencies vs Through Vanity Shingles
Packages can originate from:
- agency initiative
- your internal executives
- a vanity shingle
- a first-look pod
- a showrunner banner
- a family dynasty banner

Important interaction:
- if a star with a vanity shingle is represented by an aggressive package-oriented agency, that star may attach both **as performer and producer**, increasing leverage and reducing your freedom to alter the team later

### 33.21 Agencies and First-Look / Overall Deals
Agencies should care about where their clients’ banners and overall deals land.

Effects:
- agencies may steer producer pods toward studios with better buyer relationships
- agencies may pitch packages that exploit your current first-look network
- an agency that distrusts your studio may push its clients to sign with rivals instead
- big agencies may try to load your first-look lane with their own roster, creating soft capture of your slate

This creates a meaningful tension between:
- convenience and speed from working heavily with one agency
n- overdependence on one pipeline of taste and talent

### 33.22 Agencies and Casting
The **Casting Agent / Casting Director automation system** added earlier should now understand representation.

When the player delegates casting, the casting team evaluates:
- talent fit
- quote
- availability
- chemistry
- awards/commercial upside
- agency relationship score
- package opportunities
- risk of leverage concentration

Auto-casting modes:
- Best Creative Fit
- Best Value
- Best Awards Play
- Best Commercial Package
- Agency-Friendly Fast Package
- Diversify Representation

This means automation does not simply choose the top-rated actor; it chooses within the logic of the agency market.

### 33.23 Agency Pitch Meetings
Add periodic **Agency Day** or **General Meeting** events.

Meeting types:
- annual relationship summit
- awards-season alignment meeting
- staffing season meeting for TV
- package marketplace day
- crisis-control meeting after a client scandal or production collapse

In these interactions the player can set posture:
- open for package pitches
- looking for undervalued talent
- prioritizing TV staffing
- prestige-only season
- family content push
- genre slate build-out
- franchise face search

This subtly changes the kind of pitches agencies send in following weeks.

### 33.24 Writers, Showrunners, and Literary Departments
Literary representation should be especially rich because it connects directly to development.

Literary departments can:
- pitch open writing assignments
- propose rewrite specialists
- pair a writer with a director or star
- suggest a writer-director auteur package
- recommend showrunners for a TV concept
- send mini-room staffing bundles for an accelerated series launch

TV-specific representation mechanics:
- agencies can pitch creator + showrunner pairings
- a high-powered TV agent can assemble room leaders quickly
- cast holding deals become harder if showrunner negotiations drag
- renewal negotiations may be coordinated across multiple cast clients at the same agency

### 33.25 Agency Clusters and TV Cast Renegotiations
If several cast members on a successful TV show share representation from one agency, they may coordinate renewal pressure.

Possible outcomes:
- synchronized per-episode raises
- demand for producer credits
- season order guarantees before signing
- better trailer positions and campaign support
- collective walk risk if the studio plays hardball

If the cast is represented by multiple agencies, negotiations may fragment and become easier to manage — or slower due to competing agendas.

### 33.26 Agencies and Child Talent
Child actors and former child stars need special handling.

Agency effects:
- family-focused agencies are better at managing burnout and schedule limits
- exploitative agencies increase short-term booking intensity but raise meltdown risk
- prestige-oriented agencies may steer child talent toward awards bait at the cost of normalcy
- a savvy boutique may protect a former child actor during reinvention years, increasing long-term career stability

### 33.27 Agencies and Family / Dynasty Systems
Agency relationships should interact with the Family / Lineage system.

Examples:
- sibling teams may insist on staying with the same agent
- nepo-baby launches may be engineered by power agencies
- legacy families may have long-term preferred agencies
- family feuds can split representation camps
- parents may try to move children to different reps to avoid direct comparison

A dynasty-focused agency may proactively build packages around known Hollywood families, while another may deliberately seek outsider narratives.

### 33.28 Agencies and the Trades
Agencies are a major source of rumor energy.

Agency rumor traits influence whether trade stories appear such as:
- “agency shopping hot package to buyers”
- “talks intensify with A-list actor”
- “client eyeing move into directing”
- “showrunner deal nearing close”
- “package cooling after budget concerns”
- “multiple agencies circling breakout star”

High-leak agencies generate more news heat but also more volatility. Tight-lipped boutiques reduce rumor exposure but may lose hype momentum.

### 33.29 Agencies and Awards Strategy
Awards-oriented agencies should increase the chance that clients:
- choose prestige roles over commercial work in key windows
- push for festival premieres
- accept lower upfront pay for awards heat
- campaign more effectively
- appear in awards prediction columns earlier

This should not guarantee nominations, but it should shape the behavior of ambitious talent and their reps.

### 33.30 Agency Reputation and Market Power
Each agency has a **Market Power** score made of:
- client roster heat
- awards success
- box office/rating success
- number of premium clients
- cross-disciplinary depth
- recent package wins
- recent major defections
- trade perception

High market power means:
- their pitches command attention
- their packages generate stronger greenlight bonuses
- their unhappy clients become expensive to pursue
- other agencies may react to them

Low market power means:
- more favorable pricing opportunities for the player
- more hunger and hustle in pitches
- greater chance of losing clients to bigger firms

### 33.31 Internal Agency Stability
Agencies should not be static. Each firm has a hidden or visible stability value.

Threats to stability:
- too many client departures
- rainmaker leaving
- merger gone wrong
- scandal involving an agent
- repeated negotiation failures
- a perception that the agency is losing the culture war or awards war

Effects of instability:
- clients become movable
- package quality falls
- internal feuds leak to trades
- studio relationships become inconsistent

### 33.32 Agency Mergers, Splits, and New Shops
At longer campaign lengths, the market may evolve.

Possible events:
- two boutiques merge into a stronger mid-tier firm
- a major agency spins off a prestige-focused breakaway shop
- a disgraced office head starts a boutique
- a digital-creator firm expands into scripted representation

These structural changes keep the agency ecosystem alive across many in-game years.

### 33.33 Agency-Assisted Talent Discovery
Agencies should be one of several ways new talent enters the player’s awareness.

Discovery channels via reps:
- rising theater actor pitched for film debut
- TV staff writer ready for feature jump
- indie director with festival heat
- former child star seeking gritty reinvention
- international actor ready for breakout crossover
- actor looking to launch vanity shingle
- writer with a passion project seeking champion

This makes agencies part of the broader discovery loop alongside festivals, heat lists, coverage, and trade news.

### 33.34 Package Pressure and Anti-Monoculture Safeguards
A game with agencies can accidentally push the player into always using the same giant firm. The design must actively prevent this.

Safeguards:
- overreliance on one agency creates leverage inflation
- same-agency rosters can trigger coordinated renegotiations later
- rival agencies may freeze you out of their best clients
- trade narratives may accuse the studio of creative monoculture
- diverse rosters can generate fresher combinations and lower correlated risk

The game should make focused relationships useful, but **not obviously dominant**.

### 33.35 Agency Strategy Settings for the Player
Allow the player to set representation policy at the studio level.

Possible policies:
- Favor top agencies
- Mix majors and boutiques
- Prioritize fresh voices
- Agency diversification required
- Package-friendly greenlights
- No heavy agency leverage on low-budget films
- Premium TV built through showrunner-centric reps

These settings guide AI assistants and delegated staffing.

### 33.36 Key Player Actions
The player should be able to:
- browse agencies and agents
- inspect full client rosters
- favorite agencies and agents
- request package ideas by project
- solicit alternatives to a current package
- blacklist an agency from auto-casting
- mark an agency as preferred
- call for undervalued client lists
- pursue a client after signs of representation dissatisfaction
- attempt to mend an agency relationship
- exploit a destabilized agency market

### 33.37 AI Studio Behavior
Rival studios should also have agency relationships.

AI behaviors:
- one studio may become tightly aligned with a prestige boutique ecosystem
- another may become the preferred home of power-agency tentpoles
- some studios overpay due to weak relationships and desperation
- some are skilled at finding future stars before agencies fully monetize them

This helps the player feel the agency market as a competitive terrain, not a menu.

### 33.38 Suggested Events
Example events:
- **Rainmaker Exit:** a top agent leaves a major firm; several clients may follow.
- **Package of the Week:** an agency offers a time-limited premium package with cost discount but backend demands.
- **Client Unhappy:** a talent profile indicates rep dissatisfaction, making them easier to sign onto your passion project.
- **Boutique Breakout:** a small agency suddenly has three hot festival clients.
- **Trade Leak:** negotiations with one agency become public, affecting leverage and rumor temperature.
- **TV Bloc Negotiation:** cast from a hit series coordinate through one agency for substantial raises.
- **Shingle Launch:** an actor’s reps pitch a vanity-shingle producing attachment along with acting services.

### 33.39 UX Rules
To keep the system intuitive:
- summarize complex agency data into tags and meters
- show only the most relevant three to five agencies for each project by default
- explain why a package is attractive in plain language
- warn the player clearly when representation concentration creates future risk
- allow one-click delegation for “find the best available agency-friendly cast”
- keep deeper roster browsing optional for players who enjoy the full fantasy

### 33.40 Data Model Additions
Add or extend:
- `Agency`
- `AgencyDepartment`
- `Agent`
- `RepresentationContract`
- `AgencyRelationship`
- `AgencyPitch`
- `PackageOffer`
- `TalentMovementEvent`
- `NegotiationStyle`
- `ClientSatisfaction`
- `AgencyMarketPowerSnapshot`

Add new links from existing entities:
- Talent → Agent → Agency
- Project → PackageOffer(s)
- Studio → AgencyRelationship(s)
- Show → Agency concentration map for cast
- VanityShingle → affiliated agency / reps

### 33.41 Balancing Principles
- agencies should make the world richer, not merely pricier
- package deals should save time and increase excitement, but not remove strategic choice
- boutiques should matter, not just majors
- movement should be common enough to keep the market alive, but not so constant that loyalty feels meaningless
- player overreliance on one rep ecosystem should create elegant future complications

### 33.42 Canonical Design Rule
**Agencies and agents are a core market layer in Studio Boss. Every major talent type can be represented. Agencies maintain visible rosters of agents and clients, proactively pitch talent and packages, influence negotiations and rumors, and create a living competitive layer between the studio and the talent economy.**


---

## 34. NPC AI, Motivations, Rivalries, and Industry Lifecycles

### 34.1 System Purpose
Studio Boss already contains many simulation layers: greenlights, agencies, trades, family dynasties, awards, packaging, rumors, first-look deals, vanity shingles, and the project marketplace. To make those systems truly come alive in a single-player game, the world needs a robust **NPC AI framework** that powers the behavior of talent, agencies, competing studios, streamers, buyers, executives, producers, critics, guild-aligned power brokers, and emerging hopefuls.

This system is the engine that turns static content into a living entertainment ecosystem.

It should answer questions such as:
- why does this director keep chasing risky prestige material?
- why does this actor suddenly refuse to work with that producer?
- why is a once-dominant studio entering a slump?
- why is a boutique streamer suddenly overpaying for edgy genre shows?
- why did a young writer become an industry obsession after one breakthrough script?
- why is a sibling duo thriving for a decade, then bitterly splitting apart?

The system should create the feeling that every important entity in the world has:
- goals
- memory
- taste
- ego
- fears
- relationships
- scars
- ambitions
- habits
- rise/fall arcs over time

This is one of the main pillars for replayability.

### 34.2 Design Goals
The NPC AI should deliver the following outcomes:

1. **Believable motivation.** Entities should make decisions for reasons the player can understand.
2. **Strong replayability.** Different runs should generate different alliances, rivalries, dynasties, collapses, and market eras.
3. **Readable chaos.** The world can be messy, but never so opaque that the player feels randomness replaced strategy.
4. **Story generation.** AI behavior should create gossip, feuds, comeback arcs, career collapses, bidding wars, and succession crises.
5. **Systemic integration.** AI must hook into every major game system rather than sit as a silo.
6. **Single-player robustness.** The AI must create enough pressure, adaptation, and surprise that the game remains engaging without human opponents.

### 34.3 Core Principle: Every Entity Has a Playstyle
Every major NPC-controlled entity should have a recognizable operating style.

Examples:
- one studio is conservative, franchise-minded, and risk-averse
- another is prestige-hungry and willing to lose money for awards
- one actor prioritizes acclaim above salary
- another chases giant checks and broad visibility
- one showrunner protects writers and hates studio notes
- one agent relentlessly packages clients together
- one streamer over-orders aggressively to juice subscriber growth
- one producer lives for awards-season dramas and hates genre material

These preferences should be legible through tags, behavior patterns, dialogue, rumor items, and outcomes.

### 34.4 AI Actor Classes
The NPC AI framework should support multiple categories of world actors.

#### 34.4.1 Talent AI
Applies to:
- actors
- writers
- directors
- producers
- showrunners
- creators
- multi-hyphenates
- child stars, former child stars, nepo babies, auteur dynasties, and legacy families

#### 34.4.2 Representation AI
Applies to:
- agencies
- individual agents
- managers if added later
- publicists if modeled separately later

#### 34.4.3 Company AI
Applies to:
- rival film studios
- streamers
- broadcasters
- indie financiers
- production labels
- vanity shingles and pods

#### 34.4.4 Executive AI
Applies to:
- studio presidents
- division heads
- development executives
- programming executives
- acquisitions heads
- awards campaign chiefs

#### 34.4.5 Market Influence AI
Applies to:
- trade reporters
- critics and awards pundits
- festival programmers
- rumor columnists
- buyer-side tastemakers

Not every category needs identical simulation depth, but all should share a common AI grammar.

### 34.5 Shared AI Attribute Model
Every major AI-controlled entity should have a common attribute skeleton, then role-specific extensions.

Shared attributes:
- **Ambition:** desire for status, scale, domination, and legacy
- **Risk Appetite:** willingness to pursue unstable, expensive, or controversial opportunities
- **Ego:** sensitivity to disrespect, billing, control, and public perception
- **Loyalty:** tendency to stay with collaborators despite setbacks
- **Grudge Retention:** how long slights and betrayals are remembered
- **Patience:** willingness to endure long development, slow builds, and career rebuilding
- **Taste Profile:** genres, tones, formats, audience targets, and prestige/commercial preferences
- **Prestige Hunger:** desire for awards, reviews, festival credibility, and serious legacy
- **Money Hunger:** preference for maximum compensation and safe commercial wins
- **Stability Need:** preference for reliable teams and low-chaos environments
- **Opportunism:** willingness to pivot, poach, defect, or exploit weakness
- **Integrity / Creative Conviction:** how likely the entity is to defend artistic choices at a cost
- **Social Intelligence:** ability to manage relationships and avoid unnecessary conflict
- **Media Sensitivity:** how strongly trade headlines and rumor cycles affect behavior
- **Burnout Susceptibility:** how likely the entity is to fatigue, spiral, or retreat after prolonged pressure
- **Adaptability:** how well the entity learns and changes strategy over time

These values should not be displayed as raw spreadsheets for every NPC by default, but they should drive visible behavior.

### 34.6 Motivation Stack
Each AI entity should operate from a ranked stack of motivations, not just one label.

For example, a director might rank:
1. win major awards
2. protect creative control
3. work with favored cinematographer and sibling editor
4. avoid franchise work unless financially desperate
5. prove they are not a one-hit wonder

An actor might rank:
1. rebuild credibility after flop era
2. earn enough cash to finance vanity shingle overhead
3. transition into producing
4. avoid abusive directors
5. get top billing over rivals

A streamer might rank:
1. increase subscriber retention
2. build one flagship prestige drama
3. stop overspending on underperforming genre shows
4. poach a hit showrunner from a rival
5. prepare for a merger or acquisition event

This gives AI behavior nuance and allows the same entity to make different choices in different contexts.

### 34.7 Personality Archetypes
Each entity can roll one or two archetypes that influence interpretation of its stats.

Sample talent archetypes:
- Auteur Visionary
- Charming Mercenary
- Fragile Genius
- Prestige Climber
- Reliable Pro
- Family Loyalist
- Chaos Magnet
- Reclusive Craftsman
- Brand Builder
- Serial Reinventor
- Burned Comeback Seeker
- People Pleaser
- Passive-Aggressive Perfectionist
- Shrewd Survivor
- Washed-but-Dangerous Veteran

Sample studio/company archetypes:
- Franchise Factory
- Prestige Fortress
- Lean Indie Gambler
- Growth-at-All-Costs Streamer
- Taste-Driven Curator
- Ruthless Consolidator
- Talent-Friendly Haven
- Spreadsheet Bureaucracy
- Opportunistic Upstart

Sample agent archetypes:
- Rainmaker
- Bulldog Negotiator
- Packaging Architect
- Boutique Tastemaker
- Relationship Whisperer
- Panic Seller
- Career Builder
- Shark

Archetypes should shape behavior, dialogue snippets, event flavor, and rivalry triggers.

### 34.8 Relationship Model
At the heart of the AI system should be a relationship graph.

Each pairwise relationship can track:
- trust
- affection / fondness
- respect
- fear / intimidation
- resentment
- creative compatibility
- commercial compatibility
- loyalty history
- rumor contamination
- betrayal memory
- debt / favors owed
- recent collaboration outcome
- preferred future collaboration score

Relationships should exist between:
- talent ↔ talent
- talent ↔ agents
- talent ↔ studios
- studio ↔ studio
- streamer ↔ talent
- executive ↔ executive
- family member ↔ family member
- shingle ↔ parent studio
- critic/trade voice ↔ studio brand

This turns the world into a social simulation rather than a set of isolated contract checks.

### 34.9 Memory System
AI must remember what happened to it.

Memory categories:
- successful collaborations
- humiliating flops
- late payments or broken promises
- projects killed in development
- awards snubs and campaign betrayals
- being replaced or recast
- being asked to take cuts or defer fees
- public support during scandal
- family favoritism and succession disappointments
- being forced off a project due to delay
- being denied final cut or creator control
- merger-related layoffs or label closures

Memories should decay at different rates based on personality.

Examples:
- a forgiving producer may let go of a messy shoot after 18 months
- an ego-heavy actor may remember a billing slight for 10 years
- a studio may remember a reliable showrunner as “safe in crisis” forever
- a rivalry between siblings may cool professionally but remain emotionally volatile

### 34.10 Decision Engine Overview
Each AI decision should consider four layers:

1. **Identity:** who am I?
2. **Situation:** what is happening right now?
3. **Relationships:** who is involved and how do I feel about them?
4. **Trajectory:** what future am I trying to shape?

This means a talent acceptance decision is not just “highest offer wins.”

A talent might accept lower pay because:
- they want an awards run
- they trust the director
- they are repairing their image
- they want first producer credit for their vanity shingle
- they owe a favor to a sibling or mentor
- they are scared their heat is fading and need visibility now

### 34.11 Utility Scoring With Controlled Drama Bias
Under the hood, AI decisions should use weighted utility scoring, but with a deliberate **drama bias** layer.

Core score inputs:
- money
- prestige potential
- awards potential
- fit with taste
- schedule feasibility
- collaborators attached
- trust in studio
- conflict risk
- current career need
- family pressure
- PR exposure
- exhaustion / burnout
- alternative offers available

Drama bias modifiers:
- public revenge opportunities
- comeback temptation
- sibling one-upmanship
- greed under career panic
- desperate studio overreach
- vanity project obsession
- false confidence after recent hit
- prestige delusion after festival buzz

Drama bias keeps the world entertaining without making it feel random. It should mostly activate when ego, stress, rivalry, or desperation are high.

### 34.12 AI Planning Horizons
Different entities should think on different time scales.

Short horizon actors:
- desperate actors chasing immediate visibility
- agencies trying to close a quarter strongly
- streamers chasing subscriber spikes

Medium horizon actors:
- studios managing yearly slates
- showrunners staffing next season
- producers building a pod slate

Long horizon actors:
- dynasty families building legacy
- auteurs shaping prestige careers
- studio bosses building franchises and libraries
- agencies trying to anchor future stars early

This creates asymmetry and conflict. Long-term plans collide with short-term panic.

### 34.13 Rivalry and Conflict System
The AI should power a formal rivalry/conflict layer.

#### 34.13.1 Rivalry Types
- personal rivalry
- creative rivalry
- awards rivalry
- commercial rivalry
- family rivalry
- succession rivalry
- studio rivalry
- agency rivalry
- streamer rivalry
- mentor/protege rupture

#### 34.13.2 Rivalry Triggers
- project poaching
- awards category competition
- quote/billing disputes
- remake or sequel rights conflict
- replacement on a project
- public trade leak blaming one party
- romantic/family overlap if added in lighter flavor form
- a sibling always being perceived as the “real talent”
- a streamer stealing a signature showrunner or franchise creator

#### 34.13.3 Rivalry Effects
- refusal to work together
- salary inflation when forced together
- higher blowup risk during production
- leak/rumor generation
- campaign sabotage behavior
- morale damage to teams split between rivals
- split-family events and succession drama
- stronger press attention when they reunite

#### 34.13.4 Rivalry Resolution
Rivalries should not be permanent by default.

They can thaw through:
- hit collaborations
- mutual need during career slumps
- awards reconciliation arcs
- shared enemies
- family interventions
- cash crises forcing compromise
- tribute events, memorials, retirements, or late-career legacy plays

### 34.14 Refusal and Blacklist Logic
Some entities should refuse to work with others.

Refusal causes:
- abuse history or toxic set experience
- betrayal in negotiations
- repeated missed start dates
- creator control disputes
- pay inequity resentment
- studio meddling reputation
- awards campaign blame games
- agency war spillover
- family estrangement
- creative incompatibility becoming culturally known

Refusals can be:
- hard refusals
- soft resistance
- requires apology or concession
- requires higher pay
- only possible through trusted intermediary
- only possible on prestige material

This adds meaningful friction to packaging and staffing.

### 34.15 Career Lifecycle Framework
Every talent and many executives should move through life and career stages.

#### 34.15.1 Talent Stages
- Child Discovery
- Child Star
- Transitional Teen Talent
- Breakout Newcomer
- Rising Name
- Heat Peak
- Established Power Player
- Veteran Mainstay
- Legacy Figure
- Comeback Candidate
- Decline / Drift
- Retirement / Semi-Retirement
- Elder Statesperson / Mentor

#### 34.15.2 Studio/Company Stages
- scrappy upstart
- breakout contender
- dominant major
- bloated complacent incumbent
- takeover target
- merged survivor
- brand in decline
- reinvented second act

#### 34.15.3 Agency Stages
- hungry boutique
- rising disruptor
- elite power broker
- overextended empire
- fractured leadership era
- spinout / brain drain period
- legacy shop revival

Each stage should affect leverage, incoming opportunities, PR narratives, and AI confidence.

### 34.16 Rise and Fall Arcs
The game should actively generate arcs, not just static ratings drift.

Possible talent rise triggers:
- surprise breakout performance
- hit franchise launch
- festival discovery
- awards nomination/win
- streaming phenomenon
- viral trade obsession
- successful reinvention from child star or flop era

Possible fall triggers:
- repeated bombs
- on-set chaos reputation
- scandal
- aging out of narrow brand without reinvention
- agency downgrade
- feud with major studio ecosystem
- burnout leading to bad choices
- failed vanity shingle overhead burden

Rise/fall arcs should alter:
- quote/value
- package desirability
- awards heat
- rumor frequency
- quality of incoming offers
- willingness to take risks
- ego calibration
- public identity tags

### 34.17 Retirement and Exit Logic
Retirements should matter. They keep the world from stagnating and create openings.

Retirement styles:
- graceful exit after long run
- abrupt burnout disappearance
- public farewell project
- soft retirement into producing/teaching/mentoring
- “retired” but returns for the right prestige script
- forced retirement after scandal or illness event abstraction

Executives, agents, showrunners, and directors should also retire or shift roles.

Consequences:
- succession battles
- roster migrations
- unfinished passion projects re-entering market
- awards tribute bumps
- nostalgia waves
- protégés inheriting clout or expectations

### 34.18 Fresh Hopeful Generation
The world needs churn. New people must arrive constantly.

New entrant pipelines:
- drama schools and theater scene
- indie festival breakouts
- spec script heat list discoveries
- sitcom room standouts promoted to creator track
- commercial directors moving into features
- music video / digital creator crossovers if enabled later
- child actor cohorts aging into adult careers
- legacy-family nepo entrants
- foreign-market breakout imports
- assistant-to-executive or assistant-to-producer ladders for future reps/executives

Every year, the game should inject new hopefuls with distinct:
- talent ceiling
- starting polish
- hunger
- support network
- family backing or lack thereof
- discoverability
- volatility
- personal brand potential

This prevents the talent pool from becoming solved.

### 34.19 Talent Potential, Ceiling, and Development
The AI system should distinguish between:
- current skill
- current heat
- market quote
- long-term ceiling
- personal discipline
- career instincts

This allows real-world-feeling mismatches:
- highly talented but difficult artist
- mediocre nepo baby with giant access advantages
- extremely commercial but critically ignored star
- raw unknown with huge long-term potential
- former child star with low confidence but major hidden upside
- workhorse TV actor with low prestige and very high reliability

The player should sometimes win by seeing around the market’s current opinion.

### 34.20 NPC Learning and Adaptation
To sustain replayability, AI entities should learn from outcomes.

Examples:
- a studio burned by expensive auteur flops becomes more risk-averse
- a streamer embarrassed by churn-heavy strategy pivots toward retention-friendly comfort hits
- an actor who chased money and lost status may pivot to indie credibility plays
- an agency that over-packaged weak projects becomes less aggressive for a while
- a repeatedly snubbed producer may overcorrect into awards bait

Adaptation should not erase personality. It should bend it.

### 34.21 Confidence, Momentum, and Panic
Each major entity should have a dynamic emotional-state layer.

State meters:
- confidence
- momentum
- pressure
- fatigue
- panic
- satisfaction

Examples:
- a studio on a five-hit run becomes bold, expensive, and slightly arrogant
- a talent in panic mode accepts weak material for fast visibility
- a showrunner under fatigue becomes more likely to feud with network notes
- a desperate agency pushes bad package deals just to keep leverage alive

These temporary states create readable, volatile eras without rewriting core personality.

### 34.22 Collaboration Chemistry
When entities work together, the AI should calculate chemistry.

Chemistry dimensions:
- creative alignment
- trust
- work speed compatibility
- ego compatibility
- tone compatibility
- crisis resilience
- publicity synergy
- awards synergy
- family baggage

High chemistry effects:
- smoother productions
- better performance uplift
- lower blowup chance
- stronger sequel/renewal appetite
- increased chance to form recurring teams or vanity shingles

Low chemistry effects:
- more delays
- walk risk
- expensive rewrites
- recasting and replacement
- bad trade leaks
- weak awards unity

### 34.23 Team Identities and Creative Cliques
The AI should support recurring ecosystems.

Examples:
- actor/director duos
- sibling teams
- writer/director auteur circles
- prestige producer clusters
- comedy troupes
- TV rooms that follow a showrunner across projects
- agency-led package circles
- family-run banners

These cliques should have identities and reputations.

Benefits:
- easy packaging
- quality uplift from familiarity
- fan/trade narrative strength
- stronger loyalty

Risks:
- stagnation
- monoculture accusations
- harder renegotiations as everyone levels up together
- clique implosion if one relationship ruptures

### 34.24 Studio and Streamer AI Strategy Brains
Competing companies need robust strategic AI.

Each studio/streamer should manage:
- genre priorities
- slate balance
- cash discipline
- prestige targets
- franchise dependence
- release strategy posture
- talent-friendliness reputation
- tolerance for development overhead
- appetite for mergers or asset sales
- willingness to poach or outbid

Potential AI company behaviors:
- flood market with mid-budget thrillers
- poach family-friendly IP after your animated hit
- aggressively pursue one awards season lane
- retreat from scripted after a financial shock
- use first-look deals to corner rising creators
- buy turnaround projects from distressed rivals
- overcommit to one genre and later suffer market fatigue

### 34.25 Hidden Information and Readability
The AI should be sophisticated, but the player must be able to read enough of it to strategize.

Surface to player through:
- tags such as “Prestige Hungry,” “Burned by Flops,” “Agency Loyal,” “Family Loyalist,” “Control Freak,” “Comeback Mode,” “Panic Spending,” “Retirement Watch”
- brief explanation strings on decisions
- trade and rumor coverage interpreting motives
- relationship icons and heat meters
- project fit summaries
- behavior history log

Do not expose every formula. Expose the story meaning.

### 34.26 Event Integration
The AI system should be one of the main generators of events.

Event families driven by AI:
- feud eruptions
- surprise reconciliations
- agent exits and client migrations
- retirement announcements
- comeback opportunities
- succession crises inside families, studios, agencies, and shingles
- panic buying sprees by streamers
- prestige overreach at rival studios
- grudge-fueled competitive release moves
- talent refusing notes and threatening exits
- aging star demanding producer control to stay attached
- ex-child-star reinvention narrative wave

### 34.27 Life Outside the Player’s Studio
A robust single-player world must keep evolving off-screen.

Simulation should continue for NPCs even when the player is not interacting with them:
- rival studios greenlight and cancel projects
- agencies lose agents and gain clients
- stars sign to outside films and become unavailable
- rival shows launch and influence ratings climate
- awards races reshape power hierarchies
- mergers change buyer appetites
- dynasties expand, fracture, and spawn new entrants
- dormant scripts reheat after market changes

The player should feel like they entered a living town, not a waiting room.

### 34.28 AI-Assisted Difficulty and Replayability
Because this is a single-player game, AI should also function as the main source of dynamic difficulty.

How AI keeps runs fresh:
- different studios emerge as primary rivals each run
- different agencies dominate each era
- different genres become oversupplied because competitors pursue them
- different dynasties rise or implode
- different hopefuls break out unexpectedly
- different executives or agents become kingmakers
- different merger waves reshape buyer landscape
- different stars retire early or extend careers longer than expected

Replayability should come from the world recombining these forces, not from stat inflation alone.

### 34.29 Delegation AI and Assistant Logic
The player will sometimes automate or delegate searches, staffing, and negotiations. Those assistants should use the same AI-readable world model.

Examples:
- “Find me a reliable commercial director who is not in feud with this lead actor.”
- “Package a prestige TV drama around a rising showrunner with low meltdown risk.”
- “Identify undervalued actors in comeback mode.”
- “Show studios likely to poach this creator if I wait three weeks.”

This makes assistant tools feel smart and grounded.

### 34.30 Data Architecture Overview
Suggested core entities:
- `NPCIdentity`
- `AIPersonalityProfile`
- `AIMotivationStack`
- `AIRelationshipEdge`
- `AIMemoryEvent`
- `AICareerStage`
- `AIMomentumState`
- `AIRivalry`
- `AIBlacklistOrRefusal`
- `AICollaborationChemistry`
- `AIStrategicPlan`
- `AILearningSnapshot`
- `AIFamilyDynamic`
- `AIHopefulGenerationProfile`
- `AIRetirementPlan`

Each major talent/company/agent entity should reference these rather than inventing separate one-off systems.

### 34.31 UI Surfaces
Recommended player-facing surfaces:

#### 34.31.1 Person Profile
Shows:
- core role and archetype tags
- current heat/value/career stage
- motivations summary
- notable allies and rivals
- current emotional state
- refusal list / collaboration warnings
- family and agency ties
- recent history timeline

#### 34.31.2 Company Profile
Shows:
- strategy tags
- confidence and pressure level
- active priorities
- signature collaborators
- budget posture
- current market narrative
- enemy/rival companies

#### 34.31.3 Relationship View
Shows:
- collaboration history
- trust/respect/resentment bars
- key memory events
- likely deal blockers
- thaw opportunities

#### 34.31.4 Industry Pulse Dashboard
Shows:
- rising hopefuls
- retirement watch list
- active feuds
- hot collaborations
- distressed rivals
- panic buyers
- stability leaders

### 34.32 Example Emergent Scenarios
Examples of stories the system should generate:

1. A prestige sibling directing duo with family baggage wins major awards, then collapses when one is publicly credited as the real auteur.
2. A former child star, now in comeback mode, accepts lower pay on a prestige limited series, becomes an awards contender, then uses leverage to launch a vanity shingle.
3. A dominant streamer enters panic-spend mode after subscriber decline, overpays for three expensive genre projects, then slams the brakes, stranding multiple first-look creators.
4. A boutique agency grows because its clients keep delivering efficient hits, forcing major firms to poach its rainmaker agent.
5. A rival studio boss in desperation greenlights too many franchise sequels, burning brand value while your smaller studio wins cultural prestige.
6. An aging blockbuster actor refuses your director due to a 12-year-old billing slight, but their adult child—an ambitious nepo baby—takes a supporting role and starts a family thaw arc.
7. A beloved veteran showrunner retires, setting off a chain reaction of staffing moves, pod instability, and franchise uncertainty across the TV market.

### 34.33 Balance Rules
To keep the system fun and intuitive:
- AI should have strong identity, not pure randomness
- no single variable should dominate every decision
- relationships should matter, but not make the world impossibly sticky
- rivalries should create friction, not constant deadlock
- new entrants should appear often enough to refresh the market
- retirements should create space without feeling punitive
- the player should usually understand why a decision happened, even if they dislike it
- dramatic outcomes should feel earned by state, not scripted inevitability

### 34.34 Optional Future Extensions
Potential expansions later:
- managers and publicists as separate AI classes
- guild politics and labor-alignment behavior
- international co-production taste differences by territory
- mentor/protege training systems
- personal life flavor events with careful abstraction
- lawsuits and formal dispute escalation layers
- political ideology or activism posture as a limited public-risk system if handled carefully and abstractly

### 34.35 Canonical Design Rule
**Studio Boss uses a unified NPC AI framework to power talent, agencies, studios, streamers, executives, and other industry entities. Each major entity has motivations, personality, memory, relationships, lifecycles, rivalry logic, and adaptive strategy. The result is a living single-player Hollywood ecosystem with believable behavior, emergent conflict, constant talent churn, and strong replayability.**


## 35. Production Roles, Role Counts, Script Drafting, Talent Age Curves, and Awards-Driven Salary Escalation

### 35.1 System Purpose
This system formalizes how a project determines **which roles exist**, **how many performers and creative leads are needed**, **how those needs are inferred from script and genre**, and **how those role requirements feed directly into development, packaging, greenlight readiness, and budget forecasting**.

It also expands the talent economy with:

- screenplay **multi-draft development** and approval gates
- **script doctors** and emergency rewrite specialists
- explicit ability to hire talent as **writer** and/or **director**
- age-driven **Sex Appeal** shifts at milestone decades
- hidden or masked attributes for talent under age 18
- salary sorting and quote comparison improvements
- awards-prestige-based salary inflation for winners and nominees

The design goal is to make pre-production feel like real Hollywood package building without forcing the player to manually fill dozens of meaningless slots.

### 35.2 Core Principle
A project should not ask the player to invent cast size from scratch. Instead, every project generates a **Role Map** from three sources:

1. **Format and Genre Template**
2. **Script Draft Analysis**
3. **Ambition Layer** such as prestige, commercial scale, franchise intent, and budget band

The Role Map then determines:

- mandatory creative hires
- recommended creative hires
- minimum cast count
- ideal cast count
- optional flavor or prestige roles
- salary pressure bands
- packaging leverage points
- greenlight confidence

### 35.3 Production Role Framework
Every project should organize roles into five broad buckets.

#### 35.3.1 Core Creative Leadership
Common slots include:

- writer
- director
- producer
- executive producer
- showrunner for scripted TV
- creator for TV when distinct from writer
- pilot director for TV when distinct from ongoing producing director

These roles influence script quality, package value, tone coherence, schedule control, and note resistance.

#### 35.3.2 Principal On-Screen Cast
These are the most market-facing performance roles.

Common role classes include:

- lead
- co-lead
- ensemble lead
- primary antagonist
- romantic lead / love interest
- key supporting
- secondary supporting
- comic relief
- mentor / authority figure
- guest star
- cameo prestige role
- child lead / teen lead / child supporting

#### 35.3.3 Voice and Performance Capture Roles
These are especially important in animation and some VFX-heavy projects.

Common classes include:

- lead voice role
- ensemble voice role
- narrator
- creature / specialty voice
- celebrity stunt voice role
- motion capture lead
- motion capture supporting
- singing voice when distinct from speaking voice

#### 35.3.4 TV-Specific Staffing Roles
Television should require additional role logic beyond film.

Common classes include:

- creator
- lead writer / pilot writer
- showrunner
- co-showrunner
- head of room
- upper-level writer(s)
- staff writers
- episodic directors / block directors
- series regular cast
- recurring cast
- guest cast

This extends the existing TV leadership model and showrunner importance already established elsewhere in the bible. fileciteturn6file2 fileciteturn6file7

#### 35.3.5 Prestige and Specialist Optional Roles
Some projects may optionally benefit from specialist attachments.

Examples include:

- script doctor
- prestige narrator
- awards magnet supporting role
- music-driven celebrity cameo
- authenticity consultant
- dialect-heavy featured player
- stunt-heavy action specialist performer
- voice star for animation marketing

### 35.4 Role Count Generation: The Role Map
Every script or concept should generate a **Role Map** with counts rather than fixed names.

The game should present role counts using three levels:

- **Minimum Required** — must be filled to move forward
- **Recommended Package** — strongly improves greenlight confidence or performance odds
- **Expanded / Luxury** — optional roles that raise quality, prestige, or commercial upside

A Role Map should be expressed in a compact executive style such as:

- 1 lead
- 1 co-lead or romantic counterpart
- 2 key supporting
- 4 supporting
- 1 antagonist
- 1 optional narrator
- director required
- writer required
- producer required

The player should be free to over-package within reason, but excessive cast or creative bloat should increase budget, ego risk, and schedule complexity.

### 35.5 Script Analysis Inputs That Generate Role Counts
A screenplay or pilot should generate role counts from hidden analysis tags.

Relevant tags include:

- ensemble density
- romance intensity
- antagonist centrality
- family spread
- comedy banter reliance
- action set-piece dependency
- mythology complexity
- youth focus
- voiceover reliance
- narration flag
- celebrity cameo friendliness
- child character count
- location spread
- episode-engine repeatability for TV

These tags do not need literal NLP simulation. For gameplay purposes they can be produced through structured generation rules plus draft outcomes.

### 35.6 Genre-Based Role Templates
Genre should strongly influence the initial Role Map before draft-specific modifiers are applied.

#### 35.6.1 Romantic Comedy
Typical baseline:

- 2 leads or 1 lead + 1 romantic lead
- 2 to 4 key supporting friends/family/coworkers
- 2 to 5 supporting roles
- optional narrator in some subtypes
- strong chemistry weighting

System notes:

- lead chemistry matters more than raw acting score alone
- romantic counterpart is near-mandatory
- sex appeal and charisma influence commercial score more than in many genres
- awards upside is modest unless elevated prestige dramedy

#### 35.6.2 Prestige Drama
Typical baseline:

- 1 lead or 2 co-leads
- 3 to 6 key supporting roles
- 4 to 8 supporting roles
- optional child role, aging role, or narrator depending on story form
- director and writer prestige heavily matter

System notes:

- supporting cast quality can materially affect awards trajectory
- narrators are uncommon but powerful when the project uses literary framing
- script quality and director cohesion matter more than raw cast count

#### 35.6.3 Comedy Ensemble
Typical baseline:

- 1 lead or 2 co-leads
- 4 to 8 ensemble supporting roles
- 2 to 6 recurring comedic supporting slots
- optional stunt cameo or celebrity guest

System notes:

- chemistry and comic timing dominate
- cast count can rise without automatically becoming prestige inflation
- large ensembles create more scheduling risk

#### 35.6.4 Action / Thriller
Typical baseline:

- 1 lead
- 1 antagonist
- 1 love interest or emotional anchor optional but common
- 2 to 4 key supporting roles
- 4 to 8 supporting roles
- optional narrator uncommon

System notes:

- star power matters strongly for lead and villain
- secondary cast depth matters less than premium anchor roles
- stunt-heavy productions can use fewer speaking roles but higher cost per role

#### 35.6.5 Horror
Typical baseline:

- 1 lead or young ensemble
- 1 to 3 co-leads
- 2 to 5 supporting roles
- optional cult character actor or horror icon cameo
- optional narrator for anthology/gothic variants

System notes:

- low-budget horror can function with lean cast counts
- a cult genre actor can replace broader package depth
- child roles may raise both marketing novelty and ethics/PR risk

#### 35.6.6 Family Adventure / Four-Quadrant Fantasy
Typical baseline:

- 1 child/teen lead or young-adult lead
- 1 adult mentor
- 1 antagonist
- 2 to 4 peer supporting roles
- 3 to 6 adult/family supporting roles
- optional narrator common in storybook framing

System notes:

- voice or creature roles may matter even in live action
- family demographic fit increases value of lovable supporting cast
- merch and sequel value are sensitive to role archetype clarity

#### 35.6.7 Animated Family Film
Typical baseline:

- 1 lead voice
- 1 co-lead or sidekick voice
- 1 antagonist voice
- 3 to 7 ensemble voice roles
- narrator optional but common
- singing voice optional depending on musical flag

System notes:

- voice star casting drives marketing disproportionately
- performers can be scheduled more flexibly than live-action leads
- role count may be larger than a comparable live-action project without equivalent schedule pain
- narrators, celebrity voices, and animal/creature specialty voices become meaningful package slots

#### 35.6.8 Adult Animation
Typical baseline:

- 1 to 3 lead voice roles
- 4 to 8 ensemble voices
- recurring multi-voice comedy specialists optional
- narrator uncommon but viable for satire/anthology

System notes:

- a few performers may cover multiple minor roles
- quote demands can be high for iconic voice stars despite low physical scheduling friction

#### 35.6.9 Scripted TV Procedural
Typical baseline for a new series:

- 1 lead or pair of leads
- 3 to 6 series regular supporting roles
- 1 showrunner mandatory
- 1 creator/pilot writer mandatory unless acquired spec already exists
- guest cast generated per episode later

System notes:

- one star is less important than dependable ensemble structure
- recurring cast and guest engine matter for season durability
- cast count is moderate-to-high, but not every role requires major star heat

#### 35.6.10 Prestige TV Drama
Typical baseline:

- 1 to 2 leads
- 4 to 7 key supporting roles
- 3 to 8 recurring/seasonal roles
- creator, showrunner, pilot writer, and pilot director strongly recommended

System notes:

- room quality and showrunner stamina matter heavily
- supporting cast depth improves awards odds and late-season retention

#### 35.6.11 Sitcom
Typical baseline:

- 1 lead or 2 co-leads
- 4 to 6 core ensemble regulars
- guest roles on top
- showrunner mandatory
- pilot writer mandatory
- producing director optional but valuable for multi-cam or fast-turn formats

System notes:

- chemistry across the core cast is more important than one megastar
- syndication upside scales with ensemble durability

#### 35.6.12 Limited Series / Miniseries
Typical baseline:

- 1 to 2 leads
- 3 to 6 key supporting roles
- 2 to 5 story-critical featured roles
- creator, showrunner, and pilot writer often overlap but not always

System notes:

- film stars are easier to attract due to finite commitment
- awards appeal is very sensitive to lead/supporting role clarity

### 35.7 Special Role Types
#### 35.7.1 Romantic Lead / Love Interest
A script may generate a distinct **romantic lead** slot when romance intensity crosses a threshold.

This role should matter because:

- chemistry strongly affects audience satisfaction in romance and dramedy
- it may drive poster/trailer appeal
- it can alter sex appeal-driven commercial lift
- replacing this role late is especially damaging to tone

#### 35.7.2 Narrator
A narrator slot should only appear when the script has a narration tag, literary framing, mockumentary framing, anthology structure, fairy-tale framing, or prestige memoir energy.

A narrator can:

- improve coherence on structurally difficult scripts
- raise prestige if voiced by a respected talent
- raise marketability for family animation or literary adaptations
- slightly reduce subtlety if the narrator is used as a crutch on weak drafts

#### 35.7.3 Antagonist / Villain
The system should distinguish a generic supporting role from a proper antagonist slot.

A true antagonist role boosts:

- package leverage in thrillers, action, fantasy, crime, and prestige dramas
- awards potential for supporting performers
- trailer and market identity

#### 35.7.4 Child Roles and Child Stars
If the script generates child or teen roles, those become special slots with extra considerations:

- guardianship / welfare complexity
- schedule restrictions
- higher development volatility
- nepo-baby and dynasty crossover potential
- hidden personal attributes when under 18

### 35.8 Role Count by Script Quality and Draft Evolution
The number and clarity of roles should evolve as drafts evolve.

A weak early draft may create:

- too many thin supporting roles
- unclear lead hierarchy
- redundant love-interest functions
- underwritten antagonist
- no obvious breakout part

A stronger later draft may:

- merge or cut redundant roles
- clarify lead/supporting billing
- create a better awards-friendly supporting showcase
- turn a weak side character into a breakout role
- remove the need for an awkward narrator

This means script development is not only about “quality up/down”; it also changes **cast architecture**.

### 35.9 Multi-Draft Screenplay Development System
The development pipeline should treat screenplay work as a staged process, not one hidden roll.

Recommended stages:

1. pitch / treatment
2. outline
3. first draft
4. second draft
5. polish / production draft
6. emergency rewrites if needed

Each stage should have:

- time cost
- money cost
- quality delta risk
- role-map update chance
- approval gate

Possible outcomes at each draft stage:

- improved substantially
- improved slightly
- no major change
- became messier
- structurally worsened
- gained a breakout role
- lost tonal coherence

This makes development a real gameplay loop rather than a binary wait state.

### 35.10 Draft Approval Gates
The player should not be forced to approve every tiny revision, but major gates should require executive approval.

Recommended approvals:

- approve concept to outline
- approve first draft for packaging
- approve revised draft for greenlight committee
- approve production draft before go/no-go

At each gate the player may:

- approve and continue
- request another pass
- replace writer
n- hire script doctor
- downgrade scope
- repurpose for TV or film
- shelve the project

### 35.11 Script Doctors
Script doctors should exist as a distinct writer subtype. They are not just generic rewrite writers.

Common script doctor archetypes:

- structure fixer
- dialogue punch-up specialist
- comedy punch-up specialist
- prestige dialogue polisher
- action clarity fixer
- adaptation cleaner
- TV pilot rescue specialist
- franchise continuity patcher

Possible strengths:

- fast turnaround
- specific weakness repair
- strong emergency save chance
- improved production readiness

Possible risks:

- tonal mismatch
- auteur backlash
- over-explaining exposition
- flattening unique voice
- expensive last-minute fees

A great script doctor can save a greenlight. A bad one can make the script feel committee-built and dead.

### 35.12 Hiring Talent as Writer and/or Director
Talent should be hireable into writer and director roles exactly as they are for acting or producing.

This should support:

- straightforward writer attachment
- straightforward director attachment
- hiring one talent into both writer and director roles
- multi-hyphenate auteur stacking with producer or actor participation

This is consistent with the existing auteur and writer-director framework already established in the current bible. fileciteturn6file7 fileciteturn6file10

Benefits of stacked writer-director hiring may include:

- stronger tonal cohesion
- easier note alignment
- marketing clarity
- awards legitimacy on prestige plays

Risks include:

- higher approval demands
- harder replacements
- stronger disruption if that one talent bows out

### 35.13 Greenlight Integration: Role Completeness Score
The existing greenlight committee should gain a **Role Completeness Score** that sits beside package strength and schedule certainty. Existing greenlight logic already evaluates script strength, talent package strength, schedule certainty, funding strain, and package cost inflation. fileciteturn6file0

Role Completeness should evaluate:

- are all mandatory creative leadership slots filled
- are all mandatory performance slots filled
- does the genre have the right shape of cast
- are any role archetypes badly mismatched
- are key chemistry pairs unresolved
- are child-role protections satisfied where relevant
- is the draft mature enough to lock cast counts

This score can produce warnings like:

- **Under-Cast for Genre**
- **No Clear Lead Identified**
- **Romantic Arc Not Properly Packaged**
- **Missing Showrunner**
- **Narrator Slot Optional: do not overpay**
- **Too Many Thin Supporting Roles**
- **Awards-Friendly Supporting Role Available**

### 35.14 Greenlight Integration: Role Forecast Panel
Every project in development should surface a **Role Forecast Panel** before full greenlight.

Recommended display:

- required roles
- recommended roles
- optional prestige/commercial roles
- current filled count / target count
- cast cost estimate
- creative leadership cost estimate
- chemistry risk
- replacement risk
- whether the draft is stable enough to cast deeply

### 35.15 Role Count Scaling by Budget and Ambition
Genre creates the baseline, but budget and ambition modify it.

Examples:

- a low-budget horror film may compress to 1 lead, 2 co-leads, 3 supporting
- a mid-budget romantic drama may use 2 leads, 3 key supporting, 4 supporting
- a prestige ensemble awards film may expand to 2 leads, 5 key supporting, 8 supporting
- a mass-market animation film may add extra voice cameos for marketing reasons

This keeps role count intuitive while still allowing variety.

### 35.16 TV Role Count Logic
Television should distinguish between:

- series regulars
- recurring characters
- guest stars
- day players / episode utility roles

A new show’s development package should only require the **core regular structure**, while recurring and guest roles are generated later at season break and episode planning.

Examples:

- sitcom: 4 to 6 core regulars
- procedural: 4 to 7 core regulars plus heavy guest engine
- prestige ensemble drama: 5 to 8 meaningful regular/recurring anchors
- limited series: 3 to 6 major roles with tighter hierarchy
- animation: 3 to 6 core voice anchors with flexible guest voices

### 35.17 Animation and Voice Casting Rules
Animation should use a distinct casting logic.

Key rules:

- voice roles do not require physical shoot availability but still require recording windows
- a single actor may voice multiple minor roles if skill supports it
- celebrity voice casting raises awareness more than dramatic credibility
- veteran voice actors improve reliability and production speed
- narrator roles are more common and more accepted in animation
- child voice roles may be filled by adults, teens, or actual children depending tone and authenticity goals

### 35.18 Chemistry Architecture
Certain role pairings should be explicitly chemistry-sensitive.

High-importance pairings include:

- lead and romantic lead
- lead and antagonist
- buddy co-leads
- parent and child roles
- mentor and protege
- core sitcom ensemble
- detective partners / procedural duo

The game should evaluate chemistry at the pairing layer, not just the full cast average.

### 35.19 Sex Appeal Age Curve System
Talent should have a **Sex Appeal** attribute that can shift at age milestones of 30, 40, 50, 60, and 70.

At each milestone, the game should roll or infer one of three outcomes:

- **increases**
- **decreases**
- **no major change**

This should not be purely punitive. Different archetypes should age differently.

Examples:

- youthful heartthrob may dip at 30 then stabilize through reinvention
- glamorous movie star may hold through 40 then bifurcate based on prestige and public image
- silver-fox / grande-dame archetypes may rise at 50 or 60
- comedy, character, prestige, and auteur identities may depend far less on sex appeal than charisma or gravitas

System effects:

- changes casting desirability for romance-heavy roles
- alters marketing heat in certain genres
- may shift a talent from lead romantic slots into authority, mentor, villain, or prestige support lanes
- interacts with public image, reinvention, scandal, and awards narrative

### 35.20 Under-18 Data Privacy and Hidden Attributes
Talent under age 18 should have partially hidden or masked attributes.

Design rules:

- no explicit sex appeal display for under-18 talent
- sensitive personal traits remain hidden or generalized
- controversial or adult-facing marketability descriptors are suppressed
- some instability or maturity stats may be summarized as broad labels rather than exposed numbers

Visible information for under-18 talent should focus on:

- performance potential
- reliability within child-labor limits
- family/guardian stability
- education or welfare burden
- charm, screen presence, voice fit, comedic fit, or dramatic fit

This keeps the system safer, cleaner, and more intuitive.

### 35.21 Talent List Sorting by Salary
Talent search and roster screens should support **sorting by Salary / Quote**.

Recommended salary-related sort modes:

- lowest quote
- highest quote
- best value for quote
- salary trend rising
- salary trend falling
- quote within budget band

This should be available for actors, writers, directors, producers, showrunners, and voice actors.

### 35.22 Awards Prestige Tiers and Salary Inflation
Awards should not produce flat quote bumps. The increase should depend on the prestige of the award body and category. The existing awards system already establishes that SAG wins raise actor quote demands, Writers Guild wins boost writer prestige, Directors Guild wins raise director market price, and top-tier awards create broad downstream leverage. fileciteturn6file12 fileciteturn6file17

Recommended award prestige tiers:

#### 35.22.1 Tier S — Industry-Crowning Awards
Examples in game terms:

- Oscars
- Emmys

Effects:

- large quote increase
- major prestige lift
- stronger approval demands
- easier agency leverage
- better packaging pull for future projects

#### 35.22.2 Tier A — Major Global Prestige / Industry Momentum Awards
Examples:

- BAFTAs
- Golden Globes
- SAG
- DGA
- WGA
- PGA

Effects:

- meaningful quote increase
- medium-to-large prestige bump
- improved awards credibility and package heat

#### 35.22.3 Tier B — Strong Specialty / Indie / Breakout Awards
Examples:

- Independent Spirit-style wins
- key critics and festival performance awards

Effects:

- small-to-medium quote increase
- large discovery/prestige benefit for lower-tier talent
- better access to prestige projects

#### 35.22.4 Tier C — Niche, Genre, or Breakthrough Recognition
Effects:

- modest quote increase
- stronger effect inside specialty lanes than mass-market work

### 35.23 Nomination vs Win Effects
Nominations should matter, but less than wins.

Recommended structure:

- nomination: modest temporary bump plus prestige heat
- win: stronger permanent or semi-permanent quote increase
- repeat wins: diminishing percentage bump but increasing leverage floor
- overdue narrative win: may increase prestige more than raw quote if the talent is already expensive

### 35.24 Award Effects by Talent Type
Awards should raise salary demands differently by role class.

Examples:

- lead acting awards most strongly affect lead-actor quotes and billing demands
- ensemble or supporting awards lift supporting-actor quotes and upgrade future role size expectations
- writing awards raise first-draft, rewrite, and pilot fees
- directing awards raise upfront director quote and approval demands
- producing awards raise packaging leverage more than pure salary
- TV acting awards raise **per-episode** demands more than flat season fees

### 35.25 TV vs Film Compensation Rules
The game should clearly surface the distinction between film and TV pay structure.

Film:

- actors usually paid upfront
- major stars may demand backend
- directors and writers often work on project-fee basis

TV:

- cast generally paid per episode
- showrunners and some producers use per-episode producing fees plus bonuses
- awards wins and breakout seasons can trigger step-up renegotiations on renewal

This is already aligned with the broader compensation model in the bible and should now be made visible inside role screens and contract previews. fileciteturn6file6

### 35.26 Replacement Pressure When Role Archetypes Matter
When a production loses talent after greenlight, replacement logic should respect role archetype.

Examples:

- losing a romantic lead requires replacement with chemistry and heat, not just generic score
- losing a narrator may be cheaper to fix than losing a co-lead
- losing a showrunner is catastrophic on TV
- losing a celebrity animation voice may hurt marketing more than quality
- losing a script doctor mid-rescue may freeze draft readiness

### 35.27 Suggested UI Surfaces
Recommended interfaces:

#### 35.27.1 Role Map Panel
Shows generated role counts by class, chemistry dependencies, and optional slots.

#### 35.27.2 Draft Tracker
Shows stage, quality movement, recent rewrite notes, role-map changes, and approval status.

#### 35.27.3 Salary and Quote Sorts
Allows quick ranking by salary, value, awards heat, role fit, and availability.

#### 35.27.4 Youth Talent Safe View
A restricted, cleaner profile view for under-18 talent.

#### 35.27.5 Awards Quote Impact Tooltip
Shows why a quote rose: for example “Won Tier A supporting-acting award last season” or “Oscar nominee two years ago; prestige floor retained.”

### 35.28 Example Emergent Stories
The system should create stories like:

- a weak first draft becoming greenlightable after a structure fixer creates a real antagonist role
- an animation film overpaying for celebrity voices that raise awareness but not critic score
- a romantic drama collapsing because the lead and romantic counterpart have no chemistry
- a child-star breakout becoming hard to manage as adult roles begin replacing teen slots
- a veteran actor’s sex appeal dipping at 40, then rebounding at 50 as they become a prestige romantic lead for older-skewing dramas
- a WGA win making a previously affordable writer suddenly expensive for rewrites
- a TV supporting actor winning a major award and demanding a huge per-episode bump for season two

### 35.29 Balancing Principles
- Role generation should feel legible, not random.
- Draft iteration should usually help but should never be risk-free.
- Script doctors should be powerful but expensive and imperfect.
- Awards should raise cost through **prestige tier**, not a single universal multiplier.
- Youth talent handling should be cleaner and more protected than adult talent handling.
- Genre should strongly shape role counts, but the script should always be able to modify them.

### 35.30 Canonical Design Rule
Production roles in Studio Boss should follow one core truth:

> **You do not greenlight a title. You greenlight a script shape, a role map, and a package that can actually be cast, financed, and made.**


---

## 36. Benchmark-Inspired Simulation Expansion (Hollywood Mogul Style Gaps Filled)

This section captures feature ideas surfaced by reviewing the supplied **Hollywood Mogul 4** screenshots and translating any still-missing or under-defined ideas into the current Studio Boss simulation language.

The goal is **not** to copy that game screen-for-screen. The goal is to recognize useful categories of simulation that appear in those screenshots, identify where Studio Boss can benefit from deeper treatment, and then integrate those ideas into the existing canon in a way that feels more modern, more intuitive, and more systemic.

These additions especially strengthen:

- project dashboard readability
- project phase visibility
- production incident tracking
- release planning clarity
- merchandising and ancillary deal play
- final accounting transparency
- rival studio intelligence reporting
- library browsing and sequel spawning
- contract rider visibility
- location, format, and production-choice texture

The guiding principle for this section is:

> **The player should be able to understand what a project is, what stage it is in, what it costs, what is going wrong, what it earned, and what strategic levers still remain.**

### 36.1 Project Command Center and Information Architecture
The screenshots show a useful truth: a Hollywood studio game becomes much easier to play when each project acts like a **command center** with a stable set of tabs.

Studio Boss should formalize this into a consistent project shell for both films and series.

Each project should expose a persistent left-to-right or top-to-bottom tab structure:

1. **Overview / Story**
2. **Roles**
3. **Screenplay / Series Bible**
4. **Talent**
5. **Production**
6. **Production Problems**
7. **Advertising / Campaign**
8. **Distribution Partnerships**
9. **Merchandising / Ancillary**
10. **Release**
11. **Final Accounting**
12. **Reviews / Awards / Legacy**

Some tabs should remain locked until the project reaches the relevant phase. This preserves clarity and teaches the pipeline naturally.

Example:

- before a screenplay exists, **Screenplay** is locked or skeletal
- before greenlight, **Production Problems** is hidden
- before release planning, **Distribution**, **Merchandising**, and **Release** are locked
- after release, **Final Accounting** and **Legacy** unlock fully

This creates strong phase readability without requiring the player to remember hidden states.

### 36.2 Project List Status Language
The current project list should gain explicit **phase labels** and **warning labels** that are readable at a glance.

Recommended standardized statuses:

- No Story
- Story Seed
- Outline in Progress
- First Draft
- Rewriting
- Needs Writer
- Needs Director
- Needs Showrunner
- Needs Greenlight
- Packaged, Awaiting Vote
- Greenlit
- Production Begins Next Month
- In Production
- Post-Production
- Needs Release Plan
- Marketing Active
- Released
- Renewed
- Cancelled
- Shelved
- Turnaround

Recommended warning tags:

- Role Gap
- Talent Hold Expiring
- Over Budget
- Schedule Conflict
- Production Delay Risk
- Rewrite Requested
- Weak Test Screening
- Merchandising Opportunity
- Awards Heat
- Sequel Viable

These labels should appear in the project row and in the project header.

### 36.3 Cost To Date and Spend Transparency
The screenshots reveal the value of a simple **Cost To Date** callout.

Studio Boss should track and show at least four spend buckets on every project:

- **Development Spend To Date**
- **Above-the-Line Spend To Date**
- **Below-the-Line / Production Spend To Date**
- **Marketing Spend To Date**

These should roll into:

- **Total Cost To Date**
- **Committed Future Spend**
- **Exposure If Cancelled Today**

This matters because the player often needs to decide whether to continue, delay, recast, reshoot, or kill a project. A raw budget number is not enough. The real decision is about **sunk cost versus remaining exposure**.

### 36.4 Story Page Expansion
The screenshots imply a story page that surfaces not only genre but also content shape.

Studio Boss should formalize a **Story Diagnostic Panel** for both films and series.

Public-facing or mostly readable story fields:

- title
- logline / storyline
- format
- genre + subgenre
- tone
- target demographic
- world / period / era
- primary audience quadrants
- core hook
- source material origin
- franchise status

Internal story-analysis attributes generated from the screenplay, outline, pilot, or season bible:

- character development
- intelligence / complexity
- dialogue strength
- pacing
- plot twist density
- subplot count
- villain strength
- romance intensity
- comedy density
- scare intensity
- action scale
- mythology load
- creature / VFX dependence
- groundedness versus stylization
- merchandisability
- sequel elasticity
- awards elasticity

These attributes should not all be equally precise at early stages. Early-stage projects may display fuzzy confidence bands such as:

- Strong
- Promising
- Unclear
- Risky

This makes story development feel like discovery rather than omniscience.

### 36.5 Production Design Layer and Monthly Burn Breakdown
The screenshots show a production screen with cost per month and craft dimensions such as VFX, stunts, explosions, set design, and costume complexity.

Studio Boss should deepen production planning using **Production Demand Axes**.

Each project should generate or allow tuning of the following production dimensions:

- stunt complexity
- vehicle / destruction load
- practical effects load
- VFX load
- creature / prosthetic load
- wardrobe / costume complexity
- set build complexity
- location complexity
- crowd complexity
- period authenticity load
- musical performance load
- dance / choreography load
- animation complexity
- voice recording complexity
- child labor / tutoring burden when minors are used

These dimensions should drive:

- monthly burn rate
- schedule length
- crew strain
- vendor demand
- overrun risk
- insurance cost
- awards craft upside
- merchandising appeal in some genres

The player should not need to hand-tune dozens of numbers every time. By default, the script and genre should auto-generate a recommended production profile, and the player can then choose one of three stances:

- **Lean Version**
- **Standard Version**
- **Prestige / Spectacle Version**

Advanced players can manually override individual axes.

### 36.6 Shoot Format and Presentation Features
The production screen suggests format choices such as 3-D and large format.

Studio Boss should include optional **premium presentation features** that can be attached at production or release planning stages.

Examples:

- large format / premium large-screen capture
- 3-D pipeline
- premium sound mix
- event-cinema formatted cut
- concert-film presentation
- animation premium conversion
- immersive / specialty venue edition

These features should affect:

- cost
- post schedule
- release ceiling
- premium ticket revenue mix
- event status in trades
- awards or technical prestige in certain categories

These should never be automatic wins. Many projects are better without them.

### 36.7 Shoot Location and Incentive Planning
One screenshot shows a location block with the ability to add shoot locations.

Studio Boss should formalize a **location planning system** for projects in production.

Each project can have one or more shoot locations, such as:

- Los Angeles
- New York
- Atlanta
- Vancouver
- London
- Eastern Europe hub
- Australia / New Zealand
- virtual production stage hub
- tax-incentive domestic region
- prestige international location

Each location should have variables like:

- tax incentives
- crew depth
- weather reliability
- stage availability
- permit friction
- travel and lodging cost
- union burden
- authenticity match to script setting
- prestige value
- disruption risk

The system should present the player with readable tradeoffs:

- cheaper but harder logistically
- more authentic but weather risky
- tax friendly but shallow crew pool
- expensive but reliable and awards friendly

Location choices should also feed later production problems.

### 36.8 Vendor, Facility, and Specialist Partner Layer
The screenshots reference animation studio and visual effects studio issues.

Studio Boss should add a **specialist vendor layer** for projects that need external partners.

Possible vendor types:

- animation house
- VFX vendor
- sound post house
- scoring studio
- virtual production facility
- creature effects shop
- stunt house
- international service producer
- dubbing / localization vendor

Vendors should have:

- skill / quality
- cost level
- reliability
- speed
- backlog load
- scandal risk
- innovation edge
- relationship history with your studio

Vendor selection should matter for both quality and production stability.

### 36.9 Production Problems Log and Incident Lifecycle
The screenshots show a **Production Problems** page plus a modal describing a specific incident and cost increase.

Studio Boss should make production incidents a first-class system instead of one-off popups.

Each project in production should maintain a **Production Problems Log** with entries containing:

- month and week
- incident type
- primary cause
- affected talent / vendor / department
- immediate cost increase
- delay added
- reputation effect
- mitigation options chosen
- whether the issue is resolved, recurring, or escalating

Incident categories should include:

- talent performance conflict
- perfectionism causing extra takes
- chemistry mismatch surfacing during production
- director-star feud
- late script rewrite spillover
- stunt injury or safety slowdown
- weather interruption
- location permit issue
- VFX vendor delay
- animation pipeline bottleneck
- child performer hour restrictions
- music rights or cue replacement issue
- crew burnout
- union grievance
- production design rebuild
- continuity problem discovered late
- test screening panic reshoots

The player should be able to open each incident to see who caused it, how severe it is, and what choices are available.

### 36.10 Incident Response Choices
When a production problem occurs, the player should usually get 2 to 5 response choices, for example:

- absorb the delay and protect quality
- force a cheaper workaround
- replace a vendor
- authorize partial rewrite
- bring in mediator / producer intervention
- reduce scope elsewhere to fund the fix
- pause production briefly
- remove a difficult talent from key creative decisions
- buy out a performer and recast
- reschedule around the problem

Each response should affect some combination of:

- direct cost
- time
- morale
- future incident risk
- final quality
- PR leak chance
- relationship damage

### 36.11 Problem Traits and Persistent Production Personalities
The incident screen suggests a personality issue like **Perfectionist**.

Studio Boss should turn production volatility into persistent, reusable talent traits.

Examples:

- Perfectionist
- Fast and Loose
- Script Loyal
- Improviser
- Demanding Star
- Collaborative
- Exhausting Visionary
- Panics Under Pressure
- Calm Fixer
- Chaotic Genius
- Crew Favorite
- Set Tyrant
- Stunt Addict
- Brand Protector

These should influence both upside and downside.

A perfectionist actor or director may:

- improve performance quality
- improve awards odds
- increase overrun risk
- slow schedule
- trigger conflict with efficient producers

### 36.12 Studio Library Browser
The screenshots show studio libraries for the player and rivals.

Studio Boss should include a **Library Browser** that lets the player inspect completed projects by studio.

Views should include:

- your studio library
- rival studio libraries
- acquired catalog libraries
- franchise bundles
- genre clusters
- awards library
- evergreen TV library
- merchandising-heavy library

Each library item should show:

- release year
- format
- profitability
- awards prestige
- audience afterlife
- sequel / reboot viability
- rights status
- syndication / library revenue status
- cultural footprint

This makes the industry feel historical rather than only present-tense.

### 36.13 Rival Studio Intelligence Feed
One screenshot shows a monthly feed listing rival greenlights and key attachments.

Studio Boss should add a **Monthly Industry Intelligence Feed** sourced through the trades and your internal market analysts.

This feed should summarize things like:

- rival studio greenlights
- rival series orders
- major package attachments
- top actor or director deals
- release date moves
- trailer reactions
- buyer pickups
- cancellations and writedowns
- merger rumors
- talent defections
- awards momentum swings

The feed should sometimes include partial information rather than omniscient truth.

Examples:

- “Super Studios has greenlit an event sci-fi feature at $120M, starring two bankable leads.”
- “Hopscotch Pictures is said to be circling a prestige limited series with a hot showrunner.”
- “Eldritch may be overextending on three horror titles in the same quarter.”

This feed should help the player read the market and feel the passage of time each month.

### 36.14 Release Planning: Theater Footprint Model
The release screenshot shows a formula-driven theater count influenced by budget, audience, stars, and advertising.

Studio Boss should explicitly model **release footprint capacity** for theatrical titles.

A theatrical release plan should determine:

- platform release, modest wide, wide, event wide, premium saturation
- opening theater count
- premium screen share
- international rollout cadence
- expansion triggers
- holdover expectations

The initial theater footprint should be driven by factors such as:

- genre and broadness of target audience
- MPAA / age rating accessibility
- star power
- franchise familiarity
- concept clarity
- marketing spend
- critic confidence
- exhibitor trust in the studio
- seasonal competition
- awards-platform strategy

The game should show a breakdown so the player understands *why* the footprint is what it is.

Example display:

- Base Release: 1,000 theaters
- Four-Quadrant Appeal: +600
- Two Major Stars: +400
- Franchise Recognition: +500
- Advertising Spend Tier III: +700
- Crowded Weekend: -500
- Final Opening Footprint: 2,700

### 36.15 Distribution Partnerships and Territorial Splits
The final accounting screenshot implies foreign partner distribution revenue and adjusted foreign rentals.

Studio Boss should deepen **distribution partnership design**.

For each project, the player may choose or negotiate:

- self-distribution domestic only
- domestic partner / output partner
- foreign sales agent
- territory-by-territory sales
- co-financier with distribution carve-out
- streaming-first global partner
- television licensing path

Important economic outputs should include:

- domestic gross
- exhibitor / theater share
- domestic rentals to studio
- foreign gross
- foreign exhibitor share
- foreign market fees
- local distributor fees
- sales agent commission
- net foreign rentals to studio
- minimum guarantee income where applicable

This should connect cleanly to the existing rights and co-production systems.

### 36.16 Final Accounting Screen
The screenshots show a very legible post-release accounting breakdown.

Studio Boss should ensure every completed project gets a **Final Accounting Screen** with standardized sections.

Recommended sections:

#### 36.16.1 Revenue Overview
- worldwide gross
- domestic gross
- foreign gross
- studio rentals
- platform license revenue
- home entertainment revenue
- broadcast revenue
- AVOD / FAST revenue
- merchandising royalties
- soundtrack / music revenue
- games / interactive licensing revenue
- airline / hotel / educational / specialty windows where relevant

#### 36.16.2 Cost Overview
- development cost
- production cost
- marketing cost
- distribution fees
- participation payouts
- residual burden estimate
- reshoot / overrun premium
- financing cost where relevant

#### 36.16.3 Net Outcome
- project P&L
- ROI
- break-even threshold
- contribution to studio cashflow
- contribution to library value
- sequel / renewal trigger eligibility

#### 36.16.4 Legacy Outcome
- critic score band
- audience reception band
- awards tally
- franchise heat
- catalog durability
- talent quote changes caused by the project

The point is not just realism. It is feedback clarity. The player must learn from each release.

### 36.17 Reviews and Critical Reception Screen
The screenshots include a dedicated critics and reviews area.

Studio Boss should explicitly present **review clusters** rather than a single score.

Possible review breakdowns:

- top critics
- trade reviews
- general critic average
- audience score
- fan enthusiasm
- social memeability
- awards pundit heat

Review text snippets should reflect what the project was trying to do.

Example:

- praised performances but weak ending
- strong concept, noisy execution
- surprise family breakout
- prestigious but cold
- fun crowdpleaser, no awards path

This should connect to word-of-mouth, holds, streaming afterlife, and sequel logic.

### 36.18 Merchandising Contracts and Threshold Gating
A screenshot shows **manufacturer interest** and minimum production / advertising thresholds for product categories.

Studio Boss should add a clearer **merchandising contract layer** before or during release planning.

Possible merchandise categories:

- action figures
- fashion / apparel
- homewares
- school / stationery
- publishing tie-ins
- collectibles / statues
- toys / games
- mobile / video game license
- soundtrack vinyl / music bundles
- food and brand promotions
- theme or experience licensing

Each category should require a fit threshold, such as:

- enough visual/iconic character identity
- sufficient production spectacle
- sufficient marketing commitment
- family accessibility or youth appeal
- genre suitability
- character count / toyetic depth
- expected audience size

The game should present outcomes like:

- **No Interest**
- **Conditional Interest**
- **Interest if Budget or Campaign Increases**
- **Strong Interest**
- **Competitive Bids**

This gives the player reasons to invest in family, sci-fi, fantasy, action, animation, and youth-skewing titles beyond the box office alone.

### 36.19 Sequel and Franchise Trigger Panel
The screenshots show a clear **Create a Sequel** action after a film succeeds.

Studio Boss should expose sequel readiness through a formal panel rather than burying it.

Trigger contributors should include:

- financial success
- audience demand
- franchise heat
- unresolved story elasticity
- retained rights
- cast return likelihood
- merchandise performance
- awards halo in prestige follow-up cases
- sequel options pre-negotiated in contracts

Possible states:

- Not Viable
- Artistically Possible, Commercially Weak
- Commercially Strong, Talent Fragile
- Strong Sequel Case
- Franchise Expansion Available
- Spin-Off Better Than Sequel

This should also apply to TV spin-offs, extra seasons, sequel films, animated specials, and prequels.

### 36.20 Contract Riders and Negotiation Surface Area
The talent negotiation screenshot reveals a few specific contractual asks that should be fully visible in Studio Boss.

Add contract rider fields for:

- salary
- backend points
- per-episode quote
- pay-or-play
- name above the title
- billing position
- sequel option ladder
- series option ladder
- awards-bonus clause
- vanity shingle production fee
- consulting producer credit
- script approval
- cut approval or meaningful creative consultation
- scheduling hold term
- exclusivity window

These terms should influence both acceptance chance and downstream project constraints.

#### 36.20.1 Name Above Title
This should be mostly cosmetic on paper, but meaningful in simulation.

Effects may include:

- ego satisfaction for major stars
- increased campaign prominence
- stronger audience recognition for star-led films
- reduced willingness of peer co-leads to accept lesser billing
- small poster/layout marketing constraints

#### 36.20.2 Sequel Option Ladder
For sequel-capable projects, major talent should often want pre-negotiated escalation tables.

Example:

- film 1: $4M
- sequel if first film passes threshold A: $6M
- sequel if threshold B: $8M + 1 point
- sequel if threshold C: $10M + pay-or-play

This makes franchise success exciting but expensive.

### 36.21 Agency Offer Presentation and Negotiation Framing
The screenshot shows multiple agency offers for a single deal.

Studio Boss should frame some negotiations as **structured offer exchanges** rather than hidden math.

In visible negotiations, the player may receive:

- hard ask from agent
- compromise offer
- prestige-friendly offer
- cash-heavy offer
- backend-heavy offer
- fast-close offer

This is especially useful for stars, directors, showrunners, and top writers.

It makes representation feel active and readable.

### 36.22 Talent Search, Sorting, and Audition Workflow Upgrades
The screenshots show sortable talent lists with salary columns, audition indicators, and profile comparisons.

Studio Boss should extend talent search with richer list controls:

- sort by salary / quote
- sort by availability date
- sort by awards heat
- sort by chemistry with selected lead
- sort by role fit
- sort by international pull
- sort by franchise fit
- sort by reliability
- sort by agency
- sort by willingness to work with attached director

Talent rows should also show quick-status flags:

- interested
- not interested
- audition required
- offer out
- hold in place
- schedule conflict
- award-season unavailable
- family / child restrictions
- sequel obligation elsewhere

### 36.23 Monthly Studio Pulse and End-Month Ritual
The screenshots repeatedly emphasize an **End Month** button and a monthly news cadence.

Studio Boss already uses turn cadence, but this should be formalized into a stronger **monthly pulse ritual**.

At the end of each month, the game should summarize:

- your cash movement
- major project status changes
- rival studio moves
- trade headlines
- awards heat updates
- box office chart
- ratings chart
- talent quote movers
- incidents / crises
- new opportunities entering market

This creates a satisfying sense of rhythm and makes the game easier to read at scale.

### 36.24 Project Final Breakdown as a Teachable Postmortem
The screenshots show a final breakdown that functions almost like a postmortem.

Studio Boss should embrace this as a learning tool.

Every completed title should generate a **What Drove This Result?** panel showing top contributors.

Examples:

- strong opening due to broad release and major ad spend
- weak legs due to poor audience word-of-mouth
- foreign overperformance due to cast fit and action clarity
- awards halo helped streaming afterlife
- merchandise failed because campaign was too small
- sequel viability improved despite only modest profit

This helps the player build intuition rather than just reading numbers.

### 36.25 Series-Specific Counterparts
Any feature added from the screenshots must have a TV equivalent where sensible.

Examples:

- theatrical footprint becomes premiere reach / platform push / episode rollout scale
- merchandising thresholds become character/IP thresholds for series licensing
- final accounting becomes season accounting plus lifetime series value
- sequel panel becomes renewal / spin-off / special / event reunion panel
- production problems log includes writers’ room instability, showrunner burnout, cast holdouts, and episode overrun

### 36.26 UX Rule: Everything Should Explain Itself
The benchmark screenshots are useful because they make many numbers visible, but they also risk opacity.

Studio Boss should modernize this by ensuring that every major value has at least one of:

- breakdown tooltip
- “why changed?” tooltip
- comparison against baseline
- forecast delta if changed
- simple label explaining whether the number is good, bad, or risky

The game should feel deep, never obscure.

### 36.27 New Data Fields Required
Add the following data points where not already present:

#### 36.27.1 Project Dashboard Fields
- project phase label
- warning tags
- total cost to date
- committed future spend
- cancellation exposure
- release readiness score
- merchandising readiness score
- sequel readiness state

#### 36.27.2 Production Planning Fields
- monthly burn baseline
- stunt load
- destruction load
- VFX load
- costume load
- set-build load
- crowd load
- location count
- premium format flag
- location incentive estimate
- primary vendor links

#### 36.27.3 Production Incident Fields
- incident id
- month/week
- source entity
- trait cause
- cost delta
- schedule delta
- quality delta
- resolution state

#### 36.27.4 Release and Accounting Fields
- opening footprint
- exhibitor share estimate
- domestic rentals
- foreign partner fee burden
- merchandising royalties
- ancillary revenue by window
- break-even estimate
- franchise trigger score

#### 36.27.5 Contract Rider Fields
- name above title
- billing rank
- sequel option ladder
- series option ladder
- awards bonus clause
- scheduling hold end date

### 36.28 Example Emergent Stories from These Additions
The system should now be able to produce stories like:

- a studio overcommits to premium large-format spectacle, gets a bigger opening, but suffers painful VFX overruns
- a toy company shows conditional interest in a family action film, so the player increases campaign spend to unlock a lucrative apparel and figures deal
- a rival studio’s monthly feed reveals they are moving a big sci-fi film into your release corridor, forcing a date change
- a prestige period drama chooses authentic European locations, wins craft awards, but takes repeated weather delays
- a top star accepts a lower upfront fee in exchange for name-above-title billing and an aggressive sequel escalator
- a production problem that started as harmless perfectionism becomes a recurring delay spiral and blows the budget
- a modest film loses money theatrically but shows strong library and streaming afterlife, making it a hidden strategic success
- a foreign distributor’s fee structure makes an apparently strong overseas gross far less valuable than the player expected

### 36.29 Canonical Design Rule
The benchmark-inspired additions should be governed by one rule:

> **Every project should read like a living business case, a creative package, and a production history all at once.**


### 36.30 Distribution Rights Sales, Pre-Sales, and Territorial Deal-Making
A new set of screenshots highlights a more explicit **distribution-rights selling layer** than the current bible spells out.

Studio Boss should add a full **Rights Sales and Distribution Partnerships Market** that lets the player retain distribution, sell rights early, or carve projects into domestic and international territory deals.

This system should sit between greenlight and release, and it should remain relevant again at completion when library and secondary-window rights are resold.

#### 36.30.1 Core Rights Sale Modes
For eligible film projects, and for some premium limited series or specials, the player may choose among:

- self-distribute domestically
- license domestic distribution to another studio or distributor
- sell all foreign rights in one package
- sell foreign rights territory by territory
- pre-sell selected territories before production to reduce financing risk
- enter a negative pickup style arrangement where delivery unlocks the payment
- retain certain rights while outsourcing only theatrical execution
- sell later-window rights only, keeping primary release control

Each option should trade off:

- immediate guaranteed cash
- retained upside
- marketing control
- awards campaign control
- release timing control
- downstream library value
- franchise and sequel leverage

#### 36.30.2 Domestic Distribution Offers
If the player chooses to shop domestic rights, different buyers should generate offers with distinct logic.

Offer variables include:

- minimum guarantee
- P&amp;A commitment
- number of screens / footprint ambition
- awards push commitment
- trailer and key-art quality expectation
- release-window promise
- revenue split after recoupment
- sequel or remake option language
- whether the buyer expects final delivery changes

Big majors may offer large checks but demand control.
Boutique prestige distributors may offer smaller guarantees but stronger awards positioning.
Streamer-first buyers may skip theatrical upside but reduce risk.

#### 36.30.3 Foreign Territory Carve-Outs
Foreign rights should be sellable one territory or regional cluster at a time.

Illustrative market buckets:

- UK / Ireland
- France
- Germany / Austria / Switzerland
- Spain
- Italy
- Benelux
- Australia / New Zealand
- Japan
- South Korea
- China where politically and regulatorily viable
- Latin America clusters
- Southeast Asia clusters
- Middle East / North Africa where appropriate

Each territory offer should reflect:

- genre exportability
- cast recognition in that territory
- action clarity versus dialogue dependence
- awards appeal versus commercial appeal
- local censorship or political risk
- dub/sub burden
- release corridor competition
- whether a local partner over-indexes on horror, family, prestige, or action

This should create very readable strategic choices.
A broad action film may get strong Asian and Latin American bids.
A dialogue-heavy prestige drama may travel better through festivals, awards, and selective European buyers.

#### 36.30.4 Pre-Sales as Financing Tools
The player should be able to use pre-sales to make borderline projects financeable.

Pre-sales can:

- reduce required studio cash outlay
- lower greenlight committee fear
- improve lender confidence
- make prestige risk projects possible
- unlock bigger casts by reducing financing pressure

But pre-selling too much weakens later upside and can create release complications.

Possible downside flags:

- low retained revenue participation
- conflicting international release dates
- weak foreign marketing from low-quality partners
- franchise restrictions in pre-sold territories
- loss of sequel leverage outside retained markets

#### 36.30.5 Rights Retention Strategy Layer
The player should be able to set a **rights retention posture** per project:

- Hold Everything
- Sell to De-Risk
- Sell Foreign Only
- Sell Prestige Domestic, Keep Other Rights
- Territory Optimization
- Cashflow Emergency Sale

This posture should become part of studio identity.
A cash-starved indie player may routinely pre-sell.
A rising prestige banner may retain more rights to build long-term library value.

#### 36.30.6 Rights Sale UI Rules
The rights screen should show:

- estimated self-release value
- current best external offers
- expected retained upside if held
- risk reduction if sold
- partner quality and trustworthiness
- territory map or territory list
- rights already sold versus retained
- downstream rights conflicts

The player must understand not just **how much money is on the table**, but **what control and upside is being surrendered**.

### 36.31 Advanced Merchandising Deal Structure and Partner Quality
The new screenshots reveal extra detail inside merchandising that goes beyond threshold gating alone.

Studio Boss should expand merchandising into a true **licensing deal system** with partner quality, royalty rate, category depth, and contract-signing choices.

#### 36.31.1 Category-by-Category Merchandising Contracts
Each merch category should be evaluated separately.

Suggested categories:

- action figures
- dolls / plush
- apparel
- publishing tie-ins
- soundtrack album / vinyl / playlist campaign
- toys and board games
- video game / mobile tie-in
- collectibles / premium statues
- Halloween / cosplay goods
- school supplies
- food promotions
- miscellaneous novelty licensing

Each category should have its own:

- interest state
- partner quality
- royalty percentage
- minimum guarantee when relevant
- approval burden
- schedule lead time
- cancellation or underperformance risk

#### 36.31.2 Manufacturer Quality
Partner quality should matter, not just whether interest exists.

Quality bands:

- Low-Cost Opportunist
- Standard Licensee
- Reliable Mid-Tier Partner
- Premium Brand Partner
- Best-in-Class Global Partner

Higher-quality partners may offer:

- stronger sell-through
- lower reputational damage risk
- higher production values
- stronger retailer placement
- better global reach
- better merchandising afterlife

Lower-quality partners may offer:

- quick cash
- easier approvals
- weak products that hurt brand prestige
- supply issues
- low long-tail revenue

#### 36.31.3 Royalty Share and License Economics
The player should negotiate or choose among royalty structures such as:

- flat minimum guarantee
- lower guarantee plus higher royalty share
- high guarantee but poor backend
- short-term promo license
- premium prestige limited-run deal
- mass-market deal with lower brand control

Visible fields should include:

- manufacturer percentage retained by partner
- studio royalty percentage
- guaranteed advance
- expected unit volume band
- expected total licensing value
- approval cost / oversight burden

#### 36.31.4 Soundtrack as a Separate Ancillary System
The screenshots imply soundtrack or music-related licensing should be first-class rather than hidden in generic ancillary revenue.

Studio Boss should separate **Soundtrack / Music Commercialization** from generic ancillary revenue.

Possible soundtrack states:

- no meaningful soundtrack opportunity
- curated soundtrack tie-in
- score release only
- soundtrack breakout candidate
- chart crossover potential
- awards-friendly original song campaign

Soundtrack outcomes can influence:

- youth marketing reach
- awards momentum
- social-media resonance
- later library value
- cross-promotion deals

#### 36.31.5 Merchandising Readiness from Role and Story Design
Merchandising should draw from more than genre.
It should also reflect whether the project actually has:

- iconic silhouettes
- strong color / costume identity
- toyetic characters or creatures
- a memorable villain
- quotable lines or symbols
- a youth-friendly entry point
- world-building depth for collectibles
- music or catchphrases for soundtrack and novelty products

This ties merchandising back to script, role, costume, and franchise design.

### 36.32 Expanded Role Specification and Performance Modality
The new role screenshots suggest a more explicit role-spec sheet than the bible currently spells out.

Studio Boss should deepen the role system so each role is not only a billing slot, but a **performance brief** that informs casting, budget, risk, and awards potential.

#### 36.32.1 Role Spec Sheet Fields
Every meaningful cast role should be able to store:

- billing class
- narrative function
- performance type
- performance focus
- species or being type where relevant
- age band
- gender presentation if the role requires it
- romantic or family linkage
- stunt burden
- intimacy burden
- comedy burden
- accent or language need
- singing / dancing need
- prosthetic / makeup load
- motion capture requirement
- CGI interaction intensity
- voiceover-only flag where relevant

This should still stay readable through defaults and auto-generated templates.

#### 36.32.2 Performance Type
Role performance type should drive who is considered a good fit.

Suggested values:

- Live Action Only
- Live Action with Light VFX Interaction
- Live and CGI Enhanced
- Heavy Prosthetic Performance
- Motion Capture Performance
- Performance Capture Hybrid
- Voice Performance
- Narration Only
- Host / Presenter
- Archival / Documentary Recreation

This helps animation, creature features, fantasy, superhero, and hybrid productions behave differently from grounded dramas.

#### 36.32.3 Performance Focus
Each role should express what kind of acting challenge is central.

Possible focus tags:

- Drama
- Comedy
- Romance
- Action Presence
- Horror Vulnerability
- Villain Presence
- Character Comedy
- Musical Performance
- Physicality
- Voice Charisma
- Ensemble Glue
- Child Naturalism
- Prestige Monologue Weight

A role may have one primary focus and one secondary focus.
This gives the casting agent and player a better reason why a talent fits or misses.

#### 36.32.4 Character Traits and Casting Signals
Role specs should also generate a simple readable trait bundle such as:

- brave
- funny
- seductive
- intelligent
- spiritual
- chaotic
- ruthless
- optimistic
- vulnerable
- parental
- mysterious
- physically intimidating

These are not moral judgments. They are casting signals.
They influence chemistry, audience fantasy, and actor fit.

#### 36.32.5 Role Count Expansion from Script Drafts
The screenshots show an explicit **additional roles** count.

Studio Boss should formalize the idea that drafts can:

- combine roles
- split a composite role into multiple roles
- add a love interest
- add a stronger villain counterpart
- add comic relief
- add family members
- increase ensemble density
- add children or teen counterparts
- add creatures or animated sidekicks
- add recurring guest roles in TV

This should feed directly into:

- casting workload
- above-the-line and below-the-line budget
- chemistry complexity
- production scheduling
- merchandising potential
- awards category spread

#### 36.32.6 Add / Delete Role During Development
The player should be able to intentionally add, remove, or merge meaningful roles during script development.

Examples:

- strengthen the antagonist
- add a clearer romantic lead
- make the ensemble broader for four-quadrant appeal
- reduce role count to cut cost
- create a narrator device
- combine two supporting roles into one juicier prestige part

This choice should improve some projects and damage others.
A bloated role map may raise cost and scheduling friction.
An over-trimmed role map may flatten the story.

### 36.33 Talent Attachment Locks and Change Control
One screenshot strongly implies that hiring certain talent can **lock changes** to story, roles, production assumptions, or release type.

Studio Boss should add a formal **Attachment Lock System**.

#### 36.33.1 What Can Be Locked
When attaching major talent, the contract or handshake may lock:

- the current story direction
- the existing screenplay draft
- specific roles or character definitions
- the current production plan and scale
- the release type
- shooting location promises
- a season episode count in TV
- rating target or content tone
- merchandising restrictions where talent is protective

#### 36.33.2 Lock Strength
Locks should come in tiers:

- **Soft Preference**: changing it causes mild relationship damage
- **Protected Understanding**: changing it requires renegotiation
- **Contract Lock**: changing it may trigger walk-away, pay-or-play, or lawsuit risk

#### 36.33.3 Who Tends to Demand Locks
Typical lock-demanders:

- prestige directors protecting script and tone
- stars protecting role size, billing, or release posture
- showrunners protecting episode count and room structure
- producers protecting budget floor or release promise
- vanity shingle talent protecting their banner identity

#### 36.33.4 Player Benefit
Locks add friction, but they also make attachments meaningful.

A top actor agreeing to star in your film should not feel like a reversible icon swap.
Once attached, that package should become more committed, more expensive to change, and more narratively alive.

#### 36.33.5 Casting Agent Interaction with Locks
When the player chooses **Open Casting Call** or **Use a Casting Agent**, the system should respect locks automatically.

If the story, role, or release posture is locked, the agent should only search within those guardrails unless the player first decides to reopen negotiation.

### 36.34 Open Casting Calls, Fast-Cast Modes, and Agent Automation
The screenshots suggest a clearer flow between manual casting, open calls, and agent-assisted shortlisting.

Studio Boss should turn this into a full **Casting Workflow Mode Selector**.

#### 36.34.1 Casting Modes
For any open role, the player can choose:

- Manual Targeting
- Agency Package Search
- Open Casting Call
- Casting Director Shortlist
- Emergency Replacement Search
- Child Casting Search
- Voice Ensemble Search

#### 36.34.2 Open Casting Call
An open call should:

- surface more unknowns and rising hopefuls
- take time
- cost modest search overhead
- improve discovery of bargains
- increase volatility in performance outcome
- sometimes uncover a breakout star

Open calls are especially strong for:

- teen roles
- indie supporting parts
- comedy wildcards
- genre discoveries
- fresh TV ensembles

#### 36.34.3 Casting Director / Casting Agent Shortlist
A casting professional should generate a shortlist based on configurable priorities:

- cheapest viable
- best fit
- best chemistry with attached lead
- awards upside
- best global marketability
- best reliability
- fastest availability
- director-friendly choices
- unexpected but inspired options

#### 36.34.4 Emergency Replacement Search
If a talent drops out close to production, the player should be able to trigger an emergency search mode that prioritizes:

- immediate availability
- script compatibility
- minimal renegotiation damage
- public perception control
- preserving release date

This should usually yield worse or more expensive options than normal casting.
That is the point.

### 36.35 Compatibility Forecasts and Production Friction Prediction
A new screenshot shows a very specific **Potential Conflicts** panel comparing a director and cast members across traits like **On Budget**, **Perfectionist**, and **Script As Written**.

Studio Boss should formalize this as a visible **Compatibility Forecast Screen** whenever the player is assembling a package.

#### 36.35.1 Forecast Axes
Key tension axes should include:

- On Budget discipline
- Perfectionism
- Script-As-Written rigidity
- Improvisation comfort
- Stunt appetite
- Method intensity
- Ego sensitivity
- Press discipline
- Schedule discipline
- collaboration warmth
- tolerance for reshoots
- comfort with VFX-heavy acting
- comfort with child performers or animals where relevant

#### 36.35.2 Forecast Outcomes
The screen should not guarantee disaster. It should forecast tendencies such as:

- low risk
- manageable creative tension
- likely rehearsal friction
- likely budget overrun risk
- likely schedule drift
- likely morale problem
- likely awards upside despite difficulty
- strong chemistry / low efficiency
- smooth execution / lower spark

This helps the player decide whether a difficult but brilliant package is worth the pain.

#### 36.35.3 Script-As-Written as a Distinct Axis
The screenshots make this axis important enough that it should become a first-class simulation variable.

**Script-As-Written** measures how strictly a talent wants to follow the page.

High values imply:

- fidelity to dialogue and blocking
- lower improvisation tolerance
- better protection for carefully written scripts
- higher conflict risk with improvisers or chaotic directors

Low values imply:

- comfort with riffing and discovery on set
- more adaptability during production problems
- higher risk of tonal drift
- possible writer frustration

This should be especially meaningful in:

- comedy
- prestige drama
- dialogue-driven TV
- action productions with constantly revised set-pieces

#### 36.35.4 On Budget as Behavior, Not Just Math
**On Budget** should be a personal discipline trait.

High On Budget talent:

- prefers efficient days
- resists vanity reshoots
- cooperates with compromises
- may be less adventurous

Low On Budget talent:

- chases perfection or spectacle
- is more likely to demand extra takes, reshoots, or expanded scope
- may produce stronger artistic outcomes when supported

This ties personality to financial gameplay in a readable way.

### 36.36 Monthly Quote Repricing, Award Winner Renegotiations, and Market Heat
The end-month screenshots show talent quotes changing as a result of awards and performance.

Studio Boss should add a more ceremonial **Monthly Market Repricing Layer**.

#### 36.36.1 End-Month Quote Movers
At month end, the game should identify notable movers:

- award winners demanding more money
- breakout stars raising quote
- flop-tainted stars losing leverage
- genre-specific rating movement such as comedy or action star shifts
- directors gaining points participation leverage
- showrunners demanding richer renewal terms

These should be surfaced in a **Quote Movers** digest with clear explanation.

#### 36.36.2 Awards Winner Contract Reset Events
When a talent wins a meaningful award, the market should often react before the player does.

Possible automatic effects:

- minimum quote floor increases
- backend demand increases
- pay-or-play becomes more likely
- name-above-title demand increases
- sequel escalation ladder increases
- prestige-only selectiveness increases for auteurs

Award prestige tier should continue to determine magnitude, but the monthly event feed should make this visible as town gossip and agent behavior.

#### 36.36.3 Representation Follow-Through
Agencies and managers should immediately use momentum.

After a win or hot streak, their behavior may shift to:

- pulling clients from low-prestige offers
- pushing overall deals
- demanding producer credit
- demanding first-position scheduling
- pushing passion projects that were previously ignored

### 36.37 Talent Rating Drift by Genre and Performance Outcome
A screenshot shows role-by-role **Talent Rating Change** messages like “Comedy star rating increase” or decrease.

Studio Boss should make performance outcome updates more genre-specific.

#### 36.37.1 Skill Domains That Can Move
Projects may move talent market perception in specific lanes such as:

- action star power
- comedy star power
- drama prestige weight
- horror credibility
- family appeal
- voice performance heat
- awards prestige
- international draw

#### 36.37.2 Role-Specific Aftermath
The same film can change different cast members in different ways.

Examples:

- the lead gains action rating
- the villain gains scene-stealer prestige
- the comic sidekick becomes more castable in family titles
- the writer becomes hot in contained thrillers
- the director gains credibility in VFX-heavy material

This makes each project’s aftermath more nuanced than a flat fame increase.

#### 36.37.3 Negative Repricing
Ratings can also fall when:

- the role miscasts the actor badly
- a once-hot star ages out of a lane and fails to pivot
- the project becomes a meme for the wrong reasons
- awards hype collapses into backlash
- a sequel exposes the talent as repetitive

This keeps the town churning.

### 36.38 Awards Ceremony Presentation and Broadcast Layer
The awards screenshot suggests a more theatrical presentation layer than the bible currently spells out.

Studio Boss should add a formal **Awards Ceremony Presentation System**.

#### 36.38.1 Ceremony Presentation Goals
Ceremonies should feel like:

- payoff for long-term campaigning
- a public reputational event
- a market-moving moment
- a memory-generating spectacle

#### 36.38.2 Ceremony Flow
A major ceremony can present:

- category splash screen
- nominee lineup with studio attribution
- pundit expectation line
- suspense reveal
- winner card
- immediate aftermath panel

The key dramatic beat is the reveal moment.
The player should feel the tension before the winner is announced.

#### 36.38.3 Ceremony Outcomes Beyond Trophies
Ceremony results should feed into:

- quote spikes
- agency demands
- trade headlines
- streaming and library bumps
- sequel framing for prestige brands
- shareholder or board confidence where relevant
- rival jealousy and poaching attempts

#### 36.38.4 Minor vs Major Ceremony Treatment
Not every award needs a full animation or long reveal.

Treatment bands:

- full broadcast ceremony for major tentpole awards shows
- fast montage for secondary ceremonies
- digest summary for guild and critic rounds when pacing matters

This keeps the system dramatic without becoming tedious.

### 36.39 Audience Strategy and Advertising Focus Planner
A screenshot shows a much more explicit audience/marketing planning screen than the current bible fully details.

Studio Boss should deepen the **Audience Strategy Planner** and tie it directly into release and advertising.

#### 36.39.1 Audience Definition Layer
For every project, the player should specify or approve:

- primary audience
- secondary audience
- age bands
- gender skew or mixed appeal
- family co-viewing potential
- prestige/auteur audience appeal
- fandom or subculture target
- international audience priority

These should be forecast suggestions, not blind guesses.
The script, genre, talent, rating, and release posture should all contribute suggested target audiences.

#### 36.39.2 Marketing Focus Modes
The player should choose a primary and secondary messaging strategy such as:

- broad four-quadrant marketing
- sell the plot
- sell the star
- sell the scares
- sell the romance
- sell the comedy
- sell the spectacle
- sell the world / mythology
- sell the awards prestige
- sell the true-story hook
- sell the family adventure angle
- sell the music

A mismatch between audience and message should waste money.
A sharp match should improve campaign efficiency.

#### 36.39.3 Domestic vs Foreign Campaign Split
The advertising screen should allow a readable split between:

- domestic campaign budget
- foreign campaign budget
- territory-specific focus where relevant
- platform / channel mix

Some projects should justify much stronger foreign spend than domestic, and vice versa.

#### 36.39.4 Campaign Efficiency Feedback
The player should be told why a campaign is effective or wasteful.

Examples:

- broad spend is inefficient because appeal is niche
- awards positioning works better than action spectacle messaging
- foreign campaign should emphasize creatures and scale rather than dialogue
- romance marketing is underselling the star pairing
- family marketing is blocked by harsh rating tone

This turns marketing from a blunt slider into a meaningful strategy layer.

### 36.40 Canonical Rule for This Expansion Round
The second benchmark-inspired pass should follow this rule:

> **The player must be able to see not only what a project is, but how the town intends to sell it, fight over it, exploit it, and suffer through making it.**

These additions should remain integrated with the already established screenplay, packaging, talent, awards, trades, distribution, production-problem, merchandising, and NPC AI systems rather than operating as separate minigames.
