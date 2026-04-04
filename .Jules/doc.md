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
