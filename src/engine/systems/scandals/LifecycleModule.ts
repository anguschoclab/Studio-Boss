import { GameState, StateImpact } from '@/engine/types';

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
  
  // ⚡ Bolt Optimization: Replaced Object.values() with a direct for...in loop to avoid large array allocations
  const contractsDict = state.entities.contracts || {};
  const penalizedProjectIds = new Set<string>();
  for (const id in contractsDict) {
    if (Object.prototype.hasOwnProperty.call(contractsDict, id)) {
      const c = contractsDict[id];
      if (activeScandalTalent.has(c.talentId)) {
        penalizedProjectIds.add(c.projectId);
      }
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
