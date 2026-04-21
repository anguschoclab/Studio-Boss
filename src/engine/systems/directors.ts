import { GameState, Project, Talent, Contract, ActiveCrisis } from '@/engine/types';
type TalentProfile = Talent;
type Crisis = ActiveCrisis;
import { secureRandom } from '../utils';

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
    state.industry.talentPool[c.talentId]?.roles.includes('director')
  );
  
  if (!directorContract) return false;
  return !!directorContract.creativeControl;
}

/**
 * Periodically called during the 'production' phase to randomly spawn disputes.
 *
 * ⚡ Bolt Optimization: Refactored to accept a single Project, its pre-filtered Contracts,
 * and an O(1) Talent Pool Map instead of the full GameState. This eliminates O(N^2)
 * array scans and prevents the need for expensive object-spread cloning when called
 * inside the hot simulation loops (processProduction and advanceProjects).
 */
export function processDirectorDisputes(
  project: Project,
  projectContracts: Contract[],
  talentPoolMap: Map<string, TalentProfile>
): { updates: string[], newCrises: { projectId: string; crisis: Crisis }[] } {
  const updates: string[] = [];
  const newCrises: { projectId: string; crisis: Crisis }[] = [];

  if (project.state !== 'production') return { updates, newCrises };

  // Find the director using pre-filtered contracts for this specific project (O(1) instead of O(N) scan)
  const dirContract = projectContracts.find(c => c.projectId === project.id);
  if (!dirContract) return { updates, newCrises };
  
  // O(1) Map lookup instead of full array .find()
  const director = talentPoolMap.get(dirContract.talentId);
  if (!director || !director.roles.includes('director')) return { updates, newCrises };
  
  // Auteurs and Visionaries cause more disputes
  const archetype = (director as any).directorArchetype;
  const chance = archetype === 'auteur' ? 0.05 :
                 archetype === 'visionary' ? 0.04 :
                 0.01;

  if (secureRandom() < chance && !project.activeCrisis) {
     // Spawn a dispute crisis
     newCrises.push({
       projectId: project.id,
       crisis: {
         crisisId: `crisis-${crypto.randomUUID()}`,
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
     });
     updates.push(`A massive creative dispute erupted on the set of "${project.title}"!`);
  }
  
  return { updates, newCrises };
}
