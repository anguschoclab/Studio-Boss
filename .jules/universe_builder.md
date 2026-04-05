### 🌌 The Universe Builder Changes

* Updated `calculateFranchiseEquity` to add a penalty for diluting the franchise brand with 4 or more concurrent projects.
* Implemented an extreme oversaturation penalty for franchises with 4 or more active projects and a highly saturated genre (> 15).
* Enhanced "Too Soon Penalty" by introducing "IP Factory (Extreme Decay)" for release gaps less than 1 year (with -30 buzzBonus).
* Adjusted FRANCHISE_FATIGUE_RISK: Multiverse to 1.15 and Superhero to 1.05, acknowledging faster audience burnout.
* Fixed unit test failures in fatigueEngine.test.ts related to updated genre fatigue rates.
* Implemented Reboot Renaissance in franchiseCoordinator.ts: Dead franchises (>7 years) receive a massive spike in loyalty and synergy when scoring a hit.
* Expanded Crossover Events in franchiseCoordinator.ts: Added a 25% synergy bonus for massive crossover events linking 4+ distinct IPs via IP Mashup.
* Implemented Cynical IP Retention in ipRebootEngine.ts: Reboots with low/micro budgets aimed purely at rights retention suffer severe buzz and review penalties.
* Ran bun test and bunx tsc --noEmit. The test suite correctly executed, and all TypeScript types checked out. The pre-existing errors in unrelated domains remain.
