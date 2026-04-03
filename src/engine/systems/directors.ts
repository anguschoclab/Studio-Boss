import { Project, Talent, Contract, StateImpact } from '@/engine/types';
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
 * Periodically called during the 'production' phase to randomly spawn disputes.
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
  
  const archetype = (director as any).directorArchetype;
  const chance = archetype === 'auteur' ? 0.05 :
                 archetype === 'visionary' ? 0.04 :
                 0.01;

  if (rng.next() < chance && !project.activeCrisis) {
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
  }
  
  return impact;
}
