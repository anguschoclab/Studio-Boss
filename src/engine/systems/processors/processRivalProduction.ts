import { GameState, RivalStudio, Project, TalentProfile, Contract, Award } from '@/engine/types';
import { StateImpact } from '../../types/state.types';
import { advanceProject } from '../projects';
import { groupContractsByProject } from '../../utils';
import { getTrendMultiplier } from '../trends';

/**
 * Simulates the weekly production cycles for ALL rival studios simultaneously.
 */
export const processRivalProduction = (state: GameState): StateImpact => {
  const impact: StateImpact = {
    rivalProjectUpdates: [],
    talentUpdates: [],
    uiNotifications: []
  };

  const nextWeek = state.week + 1;
  const talentPoolMap = new Map(Object.entries(state.industry.talentPool));
  
  // Calculate Avg Rival Strength once
  const rivals = state.industry.rivals;
  const avgStrength = rivals.reduce((sum, r) => sum + r.strength, 0) / Math.max(1, rivals.length);

  // Group all industry awards for lookup
  const awardsByProject = new Map<string, Award[]>();
  (state.industry.awards || []).forEach(a => {
     if (!awardsByProject.has(a.projectId)) awardsByProject.set(a.projectId, []);
     awardsByProject.get(a.projectId)!.push(a);
  });

  for (const rival of rivals) {
     const contractsByProject = groupContractsByProject(rival.contracts || []);
     
     Object.values(rival.projects || {}).forEach(p => {
        const projectContracts = contractsByProject.get(p.id) || [];
        const trendMult = getTrendMultiplier(p, state);

        const { project: updatedProj, update: logMessage, talentUpdates } = advanceProject(
           p,
           nextWeek,
           rival.prestige,
           projectContracts,
           talentPoolMap,
           avgStrength,
           awardsByProject.get(p.id) || [],
           trendMult
        );

        if (logMessage && secureRandom() < 0.1) { // Don't spam rival minor updates
           impact.uiNotifications!.push(`[${rival.name}] ${logMessage}`);
        }

        talentUpdates?.forEach(t => {
           impact.talentUpdates!.push({ talentId: t.id, update: t });
        });

        impact.rivalProjectUpdates!.push({
           rivalId: rival.id,
           projectId: updatedProj.id,
           update: updatedProj
        });
     });
  }

  return impact;
};

// Helper for local randomness without importing entire utils in this small file
function secureRandom(): number {
    return Math.random(); // Placeholder for local logic
}
