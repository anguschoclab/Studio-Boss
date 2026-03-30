### 📝 Daily Progress & Docs Update

#### 🏗️ Codebase Status:
* Recent updates expanded the procedural narrative logic by adding more absurd `CRISIS_POOLS` (e.g., method actors refusing to break character) and enhanced the franchise fatigue logic in `franchises.ts` (adding "Superhero Fatigue" thresholds and new format-flip paths like docuseries reboots). Additionally, O(1) performance optimizations were implemented in `processProduction.ts` and `processWorldEvents.ts` by "Bolt", and "The Studio Comptroller" tightened the economy with steeper extreme risk multipliers for $200M+ budgets in `stats.ts`. UI tests like `DiscoveryBoard` were also adjusted to reflect UI text changes.
* Current WIP focus appears to be refining the core game loops (production simulation, crisis handling, and franchise exploitation) while optimizing state selection and array operations in simulation systems.

#### 📖 Design Bible Alignment:
* ✅ **Aligned:** The implemented features closely align with the "Hollywood narrative generator" and "business survival simulator" concepts from the Design Bible. The new method actor crises reflect the "drama-generating strategy simulation", while the `franchise` system's "Superhero Fatigue" penalizing saturated markets maps directly to the Bible's "market saturation and mandate shifts" mechanic.
* ⚠️ **Missing/Deviations:** According to the Design Bible (Section 36.39 - Audience Strategy and Advertising Focus Planner), the game requires a deep "Audience Definition Layer" (specifying primary/secondary audience, age bands, etc.) and explicit "Marketing Focus Modes" (e.g., broad four-quadrant, sell the plot, sell the star). While the `Project` type has a basic `targetAudience` field and there's a generic `marketing` status, the explicit audience definition and multi-faceted marketing focus strategies (domestic vs. foreign, specific campaign focuses) are currently missing.

#### 📄 Proposed Documentation Updates:
* `docs/marketing_and_audience_systems.md`: Detail the planned implementation of the Audience Strategy and Advertising Focus Planner, bridging the gap between the design bible and current code.
* **Code Paths Covered:** `src/engine/types/project.types.ts`, `src/engine/systems/releaseSimulation.ts`
* **Key Knowledge Gaps Addressed:** Explains how the generic `marketing` phase will be expanded into a meaningful strategy layer involving campaign budgets and target audience alignment, guiding future UI and engine work.
