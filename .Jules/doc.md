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
