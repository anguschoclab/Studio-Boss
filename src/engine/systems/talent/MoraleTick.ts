import { GameState, StateImpact } from "@/engine/types";
import { RandomGenerator } from "@/engine/utils/rng";

/**
 * MoraleTick — Weekly morale adjustment for contracted talent.
 *
 * Reads each Contract, finds the associated Talent and Project, applies
 * adjustment rules, clamps to 0-100, and returns TALENT_UPDATED impacts.
 * If morale drops below 20 there is a 1-in-3 chance of a NEWS_ADDED impact.
 *
 * NOTE: Talent.morale is an optional field not yet present on the base Talent
 * type. This system reads it via (talent as any).morale and writes it back
 * through the TALENT_UPDATED impact so it round-trips correctly once the field
 * is added to the type.
 */
export function tickMorale(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  for (const contractId in state.entities.contracts) {
    if (!Object.prototype.hasOwnProperty.call(state.entities.contracts, contractId)) continue;

    const contract = state.entities.contracts[contractId];
    const talent = state.entities.talents[contract.talentId];
    const project = state.entities.projects[contract.projectId];

    // Skip if related entities are missing
    if (!talent || !project) continue;

    // Read morale with fallback default
    const currentMorale: number = (talent as any).morale ?? 50;
    let delta = 0;

    // --- Rule 1: Active crisis on project — -5
    if (project.activeCrisis && !project.activeCrisis.resolved) {
      delta -= 5;
    }

    // --- Rule 2: Project over-budget (accumulatedCost > budget * 1.2) — -3
    if (project.accumulatedCost > project.budget * 1.2) {
      delta -= 3;
    }

    // --- Rule 3: Production on schedule (productionWeeks > 0 and progress > 50%) — +2
    if (project.productionWeeks > 0 && project.progress > 50) {
      delta += 2;
    }

    // --- Rule 4: Salary above market rate equivalent — +1
    // contract.fee is the weekly fee; talent.fee is their market rate
    if (contract.fee > talent.fee) {
      delta += 1;
    }

    // --- Rule 5: No active crisis AND project in 'production' — +1 baseline positive
    const hasActiveCrisis = project.activeCrisis && !project.activeCrisis.resolved;
    if (!hasActiveCrisis && project.state === "production") {
      delta += 1;
    }

    // No change — skip
    if (delta === 0) continue;

    const newMorale = Math.max(0, Math.min(100, currentMorale + delta));

    impacts.push({
      type: "TALENT_UPDATED",
      payload: {
        talentId: talent.id,
        update: { morale: newMorale } as any,
      },
    } as StateImpact);

    // --- Low morale news event: 1-in-3 chance when morale drops below 20
    if (newMorale < 20 && rng.next() < 1 / 3) {
      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          headline: `${talent.name} shows signs of unhappiness on set`,
          description: `Sources close to the production of "${project.title}" report that ${talent.name} has been visibly unhappy on set. Continued unrest could affect production quality and team morale.`,
          category: "talent",
        },
      } as StateImpact);
    }
  }

  return impacts;
}
