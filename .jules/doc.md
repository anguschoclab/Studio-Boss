### 📝 Daily Progress & Docs Update

#### 🏗️ Codebase Status:
* Changed core logic around project workflows, talent stats, rival logic, and many slices.
* Current focus appears to be a massive refactoring and expansion of simulation systems (marketing, production, ratings, talent, television, and UI components) possibly moving toward better architectural decoupling and improved event tracking via state impacts.

#### 📖 Design Bible Alignment:
* ✅ **Aligned:** The `evaluateMarketingEfficiency` function correctly implements an angle match check that penalizes (wastes money) or boosts the campaign multiplier based on the project genre, aligning with the "mismatch between audience and message should waste money" rule in section 36.39.2.
* ⚠️ **Missing/Deviations:** We have not fully implemented all the primary and secondary messaging strategies outlined in section 36.39.2. Our current system (`SELL_THE_SPECTACLE`, `SELL_THE_STORY`, etc.) is simpler than the comprehensive list in the bible (`SELL_THE_SCARES`, `SELL_THE_ROMANCE`, `SELL_THE_WORLD_MYTHOLOGY`, `SELL_THE_TRUE_STORY_HOOK`, `SELL_THE_MUSIC`, etc.). We also do not have "primary and secondary" messaging strategies, just a single `primaryAngle`.

#### 📄 Proposed Documentation Updates:
* `docs/marketing_mechanics.md`: Document the current single primary angle approach and the missing secondary strategy, updating the angles to match what is currently implemented vs the design bible.
* **Code Paths Covered:** `src/engine/systems/marketing/efficiencyEvaluator.ts`
* **Key Knowledge Gaps Addressed:** Clarifies the divergence between the current marketing angle matching system and the target design outlined in the design bible.

### 📝 Daily Progress & Docs Update

#### 🏗️ Codebase Status:
* Reorganized core systems and improved state impact structures across the app.
* Current focus involves tracking the project progression pipelines via systems like `evaluateGreenlight` which determines if a project goes into production or stays in development.

#### 📖 Design Bible Alignment:
* ✅ **Aligned:** `evaluateGreenlight` appropriately checks Market Saturation, Finance, Talent Package, and Buzz, aligning well with the core game loop for evaluating projects against the studio's and market's state.
* ⚠️ **Missing/Deviations:** According to section 35.13 of the Design Bible, the greenlight logic is missing the "Role Completeness Score" (checking if all mandatory creative leadership and performance slots are filled) and an evaluation of "Schedule Certainty".

#### 📄 Proposed Documentation Updates:
* `docs/greenlight_mechanics.md`: Documented the current greenlight evaluation criteria (Market Saturation, Finance, Talent Package, Buzz) and noted the deviations from the Master Design Bible.
* **Code Paths Covered:** `src/engine/systems/greenlight.ts`
* **Key Knowledge Gaps Addressed:** Outlines the specific math used to generate the Greenlight Recommendation, and clearly defines the unimplemented features from the Design Bible.
