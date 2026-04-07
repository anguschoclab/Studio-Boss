### 📝 Daily Progress & Docs Update

#### 🏗️ Codebase Status:
* Implemented the new `marketing` phase logic and `executeMarketing` function in `src/engine/systems/projects.ts` to support marketing budgets, domestic/foreign splits, and marketing angle strategies. The `advanceProject` flow was updated to pause at the `marketing` phase after production wraps.
* Current focus appears to be on expanding the project lifecycle into deeper marketing and release planning before a project officially hits the box office, aligning with the "Audience Strategy and Advertising Focus Planner" goals.

#### 📖 Design Bible Alignment:
* ✅ **Aligned:** The codebase now correctly uses angle-based marketing matched to genres (e.g. 'spectacle' mapping well to 'Action') with corresponding buzz bonuses and mismatch penalties as described in Section 36.39.2. Marketing budget tiers also dynamically affect buzz scaling.
* ⚠️ **Missing/Deviations:** While angles are implemented, the simulation currently misses the content/rating tone restriction logic mentioned in Section 36.39.2 (e.g. "family marketing is blocked by harsh rating tone"). The `domesticPct` split is also currently recorded but not fully simulated into differential region returns.

#### 📄 Proposed Documentation Updates:
* `docs/marketing_mechanics.md`: Document the new `executeMarketing` parameters, angle mappings, and how marketing budgets convert to pre-release project buzz.
* **Code Paths Covered:** `src/engine/systems/projects.ts` (`executeMarketing`, `handleMarketingPhase`)
* **Key Knowledge Gaps Addressed:** Explains the transition from production to the new marketing phase, how the `marketingAngle` impacts final project heat, and the math behind budget-driven buzz bonuses.

### 📝 Daily Progress & Docs Update

#### 🏗️ Codebase Status:
* Added sparkline cash trend graph to the studio sidebar UI using `recharts`.
* Current WIP focus appears to be on improving dashboard readability, data presentation, and financial UI in alignment with the master design bible (specifically sections on Dashboard-First Decision-Making and Finance UI).

#### 📖 Design Bible Alignment:
* ✅ **Aligned:** The addition of the sparkline cash trend aligns perfectly with Section 16.1 (Top-Bar Finance Widget) and 16.3 (Charting Intent), which call for visual charting of cashflow rather than just static balance-sheet snapshots. It also fulfills the goal of Dashboard-First Decision-Making (Section 4.4).
* ⚠️ **Missing/Deviations:** While the cash trend chart is added, it is just a simple line. Section 16.2 mentions a "stacked weekly cashflow chart", "variance bars", and "forecast and warning indicators" for the finance screen core components. Section 16.6 mentions "threshold and alerting" for liquidity risks.

#### 📄 Proposed Documentation Updates:
* `docs/finance_ui.md`: Document the implementation details of the new `recharts` sparkline in the `StudioSidebar` component.
* **Code Paths Covered:** `src/components/layout/StudioSidebar.tsx`
* **Key Knowledge Gaps Addressed:** Explains how the `cashHistory` is derived from `gameState.finance.weeklyHistory` and visualized in the sidebar.

### 📝 Daily Progress & Docs Update

#### 🏗️ Codebase Status:
* Implemented the `runUpfronts` engine in `src/engine/systems/television/upfrontsEngine.ts` and integrated it into the weekly `televisionTick.ts` at week 20.
* It evaluates all TV series in development for 'pickup', 'limited_order', or 'pass' based on quality/momentum and triggers a `MODAL_TRIGGERED` impact for the player to review.
* Current focus is clearly expanding the Television ecosystem and network buyer behavior, providing seasonal rhythms (Week 20 Upfronts) and more granular project states (Pilots vs Series orders).

#### 📖 Design Bible Alignment:
* ✅ **Aligned:** The codebase now simulates the TV buying cycle and episodic pickups for the player (Section 13.2 Television Model). The integration into televisionTick provides a foundation for a living TV market.
* ⚠️ **Missing/Deviations:** While Upfronts are simulated mechanically for the player, the system currently excludes rival studios. Additionally, the transition from IN_DEVELOPMENT to ON_AIR status is missing, preventing new pickups from airing. The simulation also uses a simplified quality formula ((buzz * 0.4 + scriptHeat * 0.3 + momentum * 0.3) + RNG) rather than deeply querying the buyer's mandate or executive archetype mentioned in Section 13.31.5.

#### 📄 Proposed Documentation Updates:
* `docs/television_mechanics.md`: Document the new `runUpfronts` mechanic, how it fires on week 20, and how project momentum/buzz convert to episode pickup orders.
* **Code Paths Covered:** `src/engine/systems/television/upfrontsEngine.ts`, `src/engine/systems/television/televisionTick.ts`
* **Key Knowledge Gaps Addressed:** Explains the transition of TV projects from development to production via the Week 20 Upfronts and how episodic orders are assigned.

### 📝 Daily Progress & Docs Update

#### 🏗️ Codebase Status:
* Updated `evaluateRenewal` in `src/engine/systems/television/renewalEngine.ts` to include dynamic thresholding based on award wins (Emmys/Globes) lowering the required rating, and budget tiers ('blockbuster', 'high') increasing the required rating for renewal. Refactored the array filtering into a loop for performance.
* Current focus appears to be on TV renewal mechanics, simulating the streaming wars' tendency to cancel expensive shows faster while keeping prestige or award-winning shows alive despite lower ratings.

#### 📖 Design Bible Alignment:
* ✅ **Aligned:** The changes align with Section 31.9.3 and the general direction of Section 13.27, where prestige and awards influence the strategic value of renewals, and where streaming platforms evaluate cost-to-engagement ratios (canceling expensive shows faster).
* ⚠️ **Missing/Deviations:** While the core mechanic is updated, it lacks integration with cast renegotiation escalations upon renewal (Section 31.10.5) and the broader syndication afterlife effects mentioned in Section 31.9.3. The 'consistent season-over-season quality' reward mentioned in the comment is not yet mathematically implemented in the snippet.

#### 📄 Proposed Documentation Updates:
* `docs/television_mechanics.md`: Document the dynamic `evaluateRenewal` thresholds, specifically how budget tiers and award wins adjust the cancellation rating threshold.
* **Code Paths Covered:** `src/engine/systems/television/renewalEngine.ts` (`evaluateRenewal`)
* **Key Knowledge Gaps Addressed:** Explains the math behind television show renewals and how the 'Prestige Effect' and 'Syndication Baron' budget penalties are calculated against the average show rating.
