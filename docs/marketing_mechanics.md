# Marketing Mechanics

The Marketing System manages the evaluation of marketing campaigns and how they convert budgets and strategy into pre-release momentum, acting as the bridge between production wrap and box-office release.

## Execution and the Marketing Phase

Once a project finishes its production phase, it transitions into the `marketing` phase via `handleMarketingPhase` in `src/engine/systems/projects.ts`.

A marketing campaign is executed by calling `executeMarketing(project, campaign)`, which requires:
- `primaryAngle`: The chosen marketing message (e.g., 'SELL_THE_SPECTACLE').
- `domesticBudget`: Funds allocated to the domestic campaign.
- `foreignBudget`: Funds allocated to the international campaign.

This initiates the campaign and begins tracking `weeksInMarketing`.

## Efficiency Evaluation

The core logic of the campaign's success lives in `evaluateMarketingEfficiency` (`src/engine/systems/marketing/efficiencyEvaluator.ts`). It calculates a `multiplier` and generates `feedbackText` based on three main pillars:

### 1. Angle Match
The `primaryAngle` must align with the project's genre to be effective.

**Matching Angles:**
- **Action:** `SELL_THE_SPECTACLE`, `SELL_THE_STARS`
- **Sci-Fi:** `SELL_THE_SPECTACLE`, `SELL_THE_STORY`
- **Drama:** `SELL_THE_STORY`, `AWARDS_PUSH`
- **Animation:** `FAMILY_ADVENTURE`, `SELL_THE_SPECTACLE`
- **Family:** `FAMILY_ADVENTURE`
- **Comedy:** `SELL_THE_STARS`, `SELL_THE_STORY`
- **Horror:** `SELL_THE_SPECTACLE`, `SELL_THE_STORY`
- **Romance:** `SELL_THE_STARS`, `SELL_THE_STORY`

**Impact:**
- **Match:** `multiplier += 0.2` (The angle resonates perfectly).
- **Mismatch:** `multiplier -= 0.15` (The angle feels misleading and wastes budget).

### 2. Budget Scale
The total marketing budget (`domesticBudget + foreignBudget`) is compared against the core project `budget`.

**Impact:**
- **Market Dominance:** If total marketing budget > 80% of project budget, `multiplier += 0.1`.
- **Under-marketed:** If total marketing budget < 10% of project budget, `multiplier -= 0.1`.

### 3. Hype Decay
Campaigns cannot run indefinitely without the audience losing interest.

**Impact:**
- Hype begins to decay at a rate of 5% per week after 4 weeks in the marketing phase.
- `decay = Math.pow(0.95, overdueWeeks)`
- The current multiplier is multiplied by this `decay` value.

The final efficiency multiplier is clamped to a minimum of `0.1`.