### 📝 Daily Progress & Docs Update

#### 🏗️ Codebase Status:
* We recently added new files for types relating to marketing (`marketing.types.ts`), updated `efficiencyEvaluator.ts` in `src/engine/systems/marketing/`, updated `ProjectMarketingTab.tsx` and created a `MarketingWarRoom.tsx` to handle the marketing strategy and execution process. The most recent commit was "economy", updating various financial aspects.
* The current WIP focus appears to be on completing the Marketing and Audience strategy features.

#### 📖 Design Bible Alignment:
* ✅ **Aligned:** We have built the marketing slider and a marketing panel. We are correctly tracking `MarketingCampaign` properties, and have correctly implemented a system in `efficiencyEvaluator.ts` that provides an `efficiencyMultiplier`.
* ⚠️ **Missing/Deviations:** We are missing the exact "mismatch penalty" logic explicitly linked to the interaction between "target demographic/audience" and "marketing message" as described in section 36.39.2. `efficiencyEvaluator.ts` currently calculates mismatch penalty based on `genre` and `primaryAngle`, rather than the project`s `targetDemographic` or `targetAudience` as specified in the master design document ("A mismatch between audience and message should waste money."). Additionally, many angles listed in section 36.39.2 (like `sell the comedy`, `sell the world / mythology`, `sell the true-story hook`, `sell the music`) are missing from `MarketingAngle` in `project.types.ts`.

#### 📄 Proposed Documentation Updates:
* `docs/marketing_mechanics.md`: Add a section detailing how target audience mismatches will interact with specific marketing angles.
* **Code Paths Covered:** `evaluateMarketingEfficiency` in `src/engine/systems/marketing/efficiencyEvaluator.ts`.
* **Key Knowledge Gaps Addressed:** Addresses the discrepancy between the genre-based mismatch logic implemented and the audience-based mismatch logic specified in the design bible.
