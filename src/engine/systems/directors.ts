import { GameState, Project, TalentProfile, Contract } from '../types';

export interface DirectorDispute {
  projectId: string;
  directorId: string;
  type: 'budget_increase' | 'marketing_control' | 'cast_rebellion';
  description: string;
  status: 'active' | 'resolved' | 'fired';
}

/**
 * Checks if the director for a given project has final cut / creative control.
 */
export function hasCreativeControl(projectId: string, state: GameState): boolean {
  const directorContract = state.studio.internal.contracts.find(c => 
    c.projectId === projectId && 
    state.industry.talentPool.find(t => t.id === c.talentId)?.roles.includes('director')
  );
  
  if (!directorContract) return false;
  return !!directorContract.creativeControl;
}

/**
 * Periodically called during the 'production' phase to randomly spawn disputes.
 */
export function processDirectorDisputes(state: GameState): { updates: string[], newCrises: any[] } {
  const updates: string[] = [];
  const newCrises: any[] = [];
  
  const inProduction = state.studio.internal.projects.filter(p => p.status === 'production');
  
  for (const proj of inProduction) {
    // Find the director
    const dirContract = state.studio.internal.contracts.find(c => c.projectId === proj.id);
    if (!dirContract) continue;
    
    const director = state.industry.talentPool.find(t => t.id === dirContract.talentId);
    if (!director || !director.roles.includes('director')) continue;
    
    // Auteurs and Visionaries cause more disputes
    const chance = director.directorArchetype === 'auteur' ? 0.05 : 
                   director.directorArchetype === 'visionary' ? 0.04 : 
                   0.01;
                   
    if (Math.random() < chance && !proj.activeCrisis) {
       // Spawn a dispute crisis
       newCrises.push({
         projectId: proj.id,
         crisis: {
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
       });
       updates.push(`A massive creative dispute erupted on the set of "${proj.title}"!`);
    }
  }
  
  return { updates, newCrises };
}
