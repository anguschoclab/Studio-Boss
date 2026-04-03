# Script Drafting Mechanics

The Script Drafting System manages dynamic script evolution during the development phase.

## Conditions for Evolution
Evolution events only occur if:
- The project is in the `development` state.
- The project is a `ScriptedProject` (has the `scriptHeat` property).

## Script Heat Drift
Each week, the script's heat drifts randomly.
- **Drift Amount:** Between -3 and +5 (a slight upward bias).
- **Bounds:** Heat is clamped between 0 and 100.

## Evolution Events
There is a **15% chance** each week for an evolution event to occur during development. If triggered, the event is selected based on a random roll and certain conditions:

### Role Merge
- **Condition:** `evolutionRoll < 0.4` (40% relative chance), `activeRoles.length > 3`, and `scriptHeat < 40`.
- **Description:** The writer suggested merging the two most recently added roles into a single composite character to tighten the plot.
- **Impact:**
  - `qualityImpact`: -5
  - `heatGain`: -2
  - **Buzz:** Decreased by 5.

### Role Split
- **Condition:** `evolutionRoll > 0.8` (20% relative chance), `activeRoles.length < 6`, and `scriptHeat > 70`.
- **Description:** Industry interest in the script has led to the expansion of a minor role into a full-fledged sidekick, love_interest, loose_cannon, or femme_fatale.
- **Impact:**
  - `qualityImpact`: +10
  - `heatGain`: +5
  - **Buzz:** Increased by 10.

### Plot Twist Added
- **Condition:** Occurs if neither Role Merge nor Role Split conditions are met, and the subsequent roll is `> 0.5` (50% relative chance of the remaining 40%, effectively 20% overall).
- **Description:** A major third-act twist has redefined the script's commercial potential.
- **Impact:**
  - `qualityImpact`: +12
  - `heatGain`: +8
  - **Buzz:** Increased by 12.

### Dialogue Polish
- **Condition:** Occurs if neither Role Merge nor Role Split conditions are met, and the subsequent roll is `<= 0.5`.
- **Description:** The latest draft features significantly improved dialogue and pacing.
- **Impact:**
  - `qualityImpact`: +5
  - `heatGain`: +3
  - **Buzz:** Increased by 5.
