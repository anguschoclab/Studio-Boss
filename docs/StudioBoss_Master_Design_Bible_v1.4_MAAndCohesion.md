# Studio Boss — Master Design Bible

**Version:** Master Draft 1.3  
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
