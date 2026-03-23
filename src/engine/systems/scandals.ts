import { GameState, Scandal, ScandalType } from '../types';

/**
 * Randomly spawns a scandal for a talent in the pool based on their controversy risk.
 */
export function generateScandals(state: GameState): { newScandals: Scandal[], headlines: any[] } {
  const newScandals: Scandal[] = [];
  const headlines: any[] = [];
  
  // Only look at talent that is actually attached to active studio projects to keep it relevant
  const relevantTalentIds = new Set<string>();
  state.contracts.forEach(c => relevantTalentIds.add(c.talentId));
  
  const activeTalent = state.talentPool.filter(t => relevantTalentIds.has(t.id));
  
  for (const talent of activeTalent) {
    const risk = talent.controversyRisk || 5; 
    // risk of 5 means 0.5% chance per week
    if (Math.random() * 1000 < risk) {
       const types: ScandalType[] = ['financial', 'personal', 'onset_behavior', 'legal', 'feud'];
       const type = types[Math.floor(Math.random() * types.length)];
       
       const s: Scandal = {
         id: crypto.randomUUID(),
         talentId: talent.id,
         severity: 20 + Math.floor(Math.random() * 80), // 20-100
         type,
         weeksRemaining: 4 + Math.floor(Math.random() * 8)
       };
       newScandals.push(s);
       headlines.push({
          id: crypto.randomUUID(),
          week: state.week,
          category: 'talent',
          text: `PR NIGHTMARE: Massive ${type} scandal erupts violently around ${talent.name}!`
       });
    }
  }
  
  return { newScandals, headlines };
}

/**
 * Processes weekly decay of scandals and applies their penalties to projects.
 */
export function advanceScandals(state: GameState): GameState {
  if (!state.scandals || state.scandals.length === 0) return state;
  
  const updatedScandals = state.scandals
    .map(s => ({ ...s, weeksRemaining: s.weeksRemaining - 1 }))
    .filter(s => s.weeksRemaining > 0);
    
  const activeScandalTalent = new Set(updatedScandals.map(s => s.talentId));
  
  // Find projects penalized by attached talent scandals
  const penalizedProjectIds = new Set<string>();
  state.contracts.forEach(c => {
    if (activeScandalTalent.has(c.talentId)) {
      penalizedProjectIds.add(c.projectId);
    }
  });
  
  const newProjects = state.projects.map(p => {
    if (penalizedProjectIds.has(p.id)) {
      // Tank the buzz due to the PR nightmare
      return {
        ...p,
        buzz: Math.max(0, p.buzz - 2) 
      };
    }
    return p;
  });
  
  return {
    ...state,
    scandals: updatedScandals,
    projects: newProjects
  };
}
