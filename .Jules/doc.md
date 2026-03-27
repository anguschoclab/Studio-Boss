### 📝 Daily Progress & Docs Update

#### 🏗️ Codebase Status:
* Implemented the new `marketing` project phase and `executeMarketing` logic in `src/engine/systems/projects.ts`, introducing marketing budgets, domestic splits, and angle strategies.
* Current focus appears to be on expanding the project lifecycle to include robust marketing simulation and release mechanics before projects hit the box office.

#### 📖 Design Bible Alignment:
* ✅ **Aligned:** The marketing slider has been replaced with a deeper strategy layer, including budget-based buzz bonuses and genre-to-angle matching (e.g., matching "spectacle" with "Action"), aligning with Section 36.39.2.
* ⚠️ **Missing/Deviations:** We built the marketing angles and mismatch penalties, but we are missing the rating/tone restrictions mentioned in Section 36.39.2 (e.g., "family marketing is blocked by harsh rating tone").

#### 📄 Proposed Documentation Updates:
* `docs/marketing_mechanics.md`: Document the new `executeMarketing` parameters and how genre-angle buzz modifiers are calculated.
* **Code Paths Covered:** `src/engine/systems/projects.ts` (`executeMarketing`, `handleMarketingPhase`)
* **Key Knowledge Gaps Addressed:** Explains how marketing budgets convert to buzz and how the `marketingAngle` impacts final project heat prior to release.
