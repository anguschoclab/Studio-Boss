import { Project, Talent, Contract, StateImpact } from '@/engine/types';
import { DirectorArchetype } from '@/engine/types/talent.types';
import { RandomGenerator } from '../utils/rng';

/**
 * Checks if the director for a given project has final cut / creative control.
 */
export function hasCreativeControl(projectId: string, state: { studio: { internal: { contracts: Contract[] } }, industry: { talentPool: Record<string, Talent> } }): boolean {
  const directorContract = state.studio.internal.contracts.find(c =>
    c.projectId === projectId &&
    state.industry.talentPool[c.talentId]?.roles.includes('director')
  );

  if (!directorContract) return false;
  return !!directorContract.creativeControl;
}

/**
 * Returns the probability (0–1) that a director of the given archetype
 * will demand creative control as part of contract negotiations.
 */
export function getCreativeControlDemandChance(archetype: DirectorArchetype): number {
  switch (archetype) {
    case 'auteur':       return 0.70;
    case 'visionary':    return 0.60;
    case 'journeyman':   return 0.20;
    case 'commercial_hack': return 0.05;
    default:             return 0.10;
  }
}

export interface CreativeControlNegotiationResult {
  willingnessModifier: number;  // Added to willingness score
  feeModifier: number;          // Fractional change to demanded fee (e.g. -0.10 = 10% discount)
  directorWalks: boolean;       // True if director refuses and leaves the negotiation
}

/**
 * Evaluates the outcome of offering or denying creative control to a director.
 * Call this during contract negotiation UI flow before finalizing the deal.
 */
export function evaluateCreativeControlOffer(
  director: Talent,
  playerOffersControl: boolean,
  rng: RandomGenerator
): CreativeControlNegotiationResult {
  const archetype = director.directorArchetype ?? 'journeyman';

  if (playerOffersControl) {
    return {
      willingnessModifier: 20,
      feeModifier: -0.10,
      directorWalks: false
    };
  }

  // Director denied creative control
  switch (archetype) {
    case 'auteur':
      return {
        willingnessModifier: -15,
        feeModifier: 0,
        directorWalks: rng.next() < 0.60
      };
    case 'visionary':
      return {
        willingnessModifier: -10,
        feeModifier: 0,
        directorWalks: rng.next() < 0.30
      };
    case 'journeyman':
      return {
        willingnessModifier: -5,
        feeModifier: 0,
        directorWalks: false
      };
    case 'commercial_hack':
    default:
      return {
        willingnessModifier: -2,
        feeModifier: 0,
        directorWalks: false
      };
  }
}

/**
 * Periodically called during the 'production' phase to randomly spawn disputes.
 * Handles both budget disputes (existing) and vision-compromise disputes (new).
 */
export function processDirectorDisputes(
  project: Project,
  projectContracts: Contract[],
  talentPoolMap: Map<string, Talent>,
  rng: RandomGenerator
): StateImpact {
  const impact: StateImpact = {
    projectUpdates: [],
    uiNotifications: []
  };

  if (project.state !== 'production') return impact;

  const dirContract = projectContracts.find(c => c.projectId === project.id);
  if (!dirContract) return impact;

  const director = talentPoolMap.get(dirContract.talentId);
  if (!director || !director.roles.includes('director')) return impact;

  const archetype: DirectorArchetype = director.directorArchetype ?? 'journeyman';

  // Budget dispute (existing behavior)
  const budgetDisputeChance = archetype === 'auteur' ? 0.05
    : archetype === 'visionary' ? 0.04
    : 0.01;

  if (rng.next() < budgetDisputeChance && !project.activeCrisis) {
    impact.projectUpdates!.push({
      projectId: project.id,
      update: {
        activeCrisis: {
          crisisId: rng.uuid('crisis'),
          triggeredWeek: 0,
          haltedProduction: false,
          description: `Director ${director.name} is demanding an immediate $5M budget increase to shoot a highly ambitious sequence, threatening to walk off set!`,
          resolved: false,
          severity: 'high',
          options: [
            {
              text: "Approve the $5M increase",
              effectDescription: "Lose $5M but keep the director happy.",
              cashPenalty: 5_000_000
            },
            {
              text: "Deny request",
              effectDescription: "Saves cash, but delays production by 2 weeks and furious director tanks buzz.",
              weeksDelay: 2,
              buzzPenalty: 15
            }
          ]
        }
      }
    });
    impact.uiNotifications!.push(`A massive creative dispute erupted on the set of "${project.title}"!`);
    return impact;
  }

  // Vision-compromise dispute — auteurs without final cut, 3%/week
  const visionDisputeChance = (archetype === 'auteur' || archetype === 'visionary') && !dirContract.creativeControl ? 0.03 : 0;

  if (visionDisputeChance > 0 && rng.next() < visionDisputeChance && !project.activeCrisis) {
    impact.projectUpdates!.push({
      projectId: project.id,
      update: {
        activeCrisis: {
          crisisId: rng.uuid('vision-crisis'),
          triggeredWeek: 0,
          haltedProduction: false,
          description: `Director ${director.name} is threatening to publicly disown "${project.title}" unless given creative approval over the final cut.`,
          resolved: false,
          severity: 'medium',
          options: [
            {
              text: "Grant Creative Control",
              effectDescription: "Amend the contract to give the director final cut. Boosts their mood significantly."
            },
            {
              text: "Hold the Line",
              effectDescription: "Deny the request. The director stays but morale craters and buzz takes a hit.",
              buzzPenalty: 10,
              reputationPenalty: 3
            }
          ]
        }
      }
    });
    impact.uiNotifications!.push(`A vision dispute erupted on the set of "${project.title}"!`);
  }

  return impact;
}
