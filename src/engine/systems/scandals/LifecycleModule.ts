import { GameState, StateImpact } from '@/engine/types';
import { getContractsByTalentId } from '../../utils';

export function advanceScandals(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currentScandals = state.industry.scandals || [];
  const activeScandalTalent = new Set<string>();

  for (const s of currentScandals) {
    if (s.weeksRemaining > 1) {
      activeScandalTalent.add(s.talentId);
    } else {
      impacts.push({
        type: 'SCANDAL_REMOVED',
        payload: { scandalId: s.id }
      });
    }
  }
  
  const contractsDict = state.entities.contracts || {};
  const talentIdx = state.entities.contractsByTalentId || {};
  const penalizedProjectIds = new Set<string>();
  for (const talentId of activeScandalTalent) {
    const talentContracts = getContractsByTalentId(talentIdx, contractsDict, talentId);
    for (const c of talentContracts) {
      penalizedProjectIds.add(c.projectId);
    }
  }
  
  for (const projectId of penalizedProjectIds) {
      const p = state.entities.projects[projectId];
      if (p) {
          impacts.push({
              type: 'PROJECT_UPDATED',
              payload: {
                  projectId,
                  update: { buzz: Math.max(0, p.buzz - 2) }
              }
          });
      }
  }
  
  return impacts;
}
