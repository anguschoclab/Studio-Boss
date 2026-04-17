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
  
  const contractsList = Object.values(state.entities.contracts || {});
  const penalizedProjectIds = new Set<string>();
  for (const c of contractsList) {
    if (activeScandalTalent.has(c.talentId)) {
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
