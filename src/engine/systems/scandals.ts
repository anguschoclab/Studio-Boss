import { GameState, Scandal, ScandalType } from '@/engine/types';

/**
 * Randomly spawns a scandal for a talent in the pool based on their controversy risk.
 * If the talent is attached to an active studio project, it triggers a Project Crisis.
 */
export function generateScandals(state: GameState): { 
  newScandals: Scandal[], 
  headlines: { id: string; week: number; category: 'talent'; text: string }[],
  projectUpdates: { projectId: string; crisis: import('../types').ActiveCrisis }[]
} {
  const newScandals: Scandal[] = [];
  const headlines: { id: string; week: number; category: 'talent'; text: string }[] = [];
  const projectUpdates: { projectId: string; crisis: import('../types').ActiveCrisis }[] = [];
  
  const contracts = state.studio.internal.contracts;
  const talentToProjectMap = new Map<string, string>();
  for (const c of contracts) {
    talentToProjectMap.set(c.talentId, c.projectId);
  }
  
  for (const talent of state.industry.talentPool) {
    const risk = talent.controversyRisk || 5; 
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
          category: 'talent' as const,
          text: `PR NIGHTMARE: Massive ${type} scandal erupts violently around ${talent.name}!`
       });

       const projectId = talentToProjectMap.get(talent.id);
       if (projectId) {
         projectUpdates.push({
           projectId,
           crisis: {
             description: `BREAKING NEWS: ${talent.name.toUpperCase()} has been involved in a massive ${type} scandal while working on "${state.studio.internal.projects.find(p => p.id === projectId)?.title}". The press is circling.`,
             resolved: false,
             severity: s.severity > 75 ? 'catastrophic' : 'high',
             options: [
               {
                 text: "Fire Them",
                 effectDescription: "Remove talent from project, +2 week delay, preserve reputation.",
                 weeksDelay: 2,
                 removeTalentId: talent.id,
                 reputationPenalty: 0
               },
               {
                 text: "Pay off the Press",
                 effectDescription: `Deduct $${(s.severity * 10000).toLocaleString()} to bury the story. Keep talent.`,
                 cashPenalty: s.severity * 10000,
                 reputationPenalty: 2
               },
               {
                 text: "Double Down",
                 effectDescription: "Cost nothing, but lose 10% reputation and tank project buzz.",
                 reputationPenalty: 10,
                 buzzPenalty: 30
               }
             ]
           }
         });
       }
    }
  }
  
  return { newScandals, headlines, projectUpdates };
}

/**
 * Processes weekly decay of scandals and applies their penalties to projects.
 */
export function advanceScandals(state: GameState): GameState {
  if (!state.industry.scandals || state.industry.scandals.length === 0) return state;
  
  // ⚡ Bolt: Replace map + filter with a single loop to avoid intermediate array allocations
  const updatedScandals: Scandal[] = [];
  const activeScandalTalent = new Set<string>();
  const currentScandals = state.industry.scandals;

  for (let i = 0; i < currentScandals.length; i++) {
    const s = currentScandals[i];
    if (s.weeksRemaining > 1) {
      const updated = { ...s, weeksRemaining: s.weeksRemaining - 1 };
      updatedScandals.push(updated);
      activeScandalTalent.add(updated.talentId);
    }
  }
  
  // Find projects penalized by attached talent scandals
  const penalizedProjectIds = new Set<string>();
  const contracts = state.studio.internal.contracts;
  for (let i = 0; i < contracts.length; i++) {
    const c = contracts[i];
    if (activeScandalTalent.has(c.talentId)) {
      penalizedProjectIds.add(c.projectId);
    }
  }
  
  // ⚡ Bolt: Replace map with a loop to prevent intermediate allocations
  const currentProjects = state.studio.internal.projects;
  const newProjects: typeof currentProjects = new Array(currentProjects.length);
  for (let i = 0; i < currentProjects.length; i++) {
    const p = currentProjects[i];
    if (penalizedProjectIds.has(p.id)) {
      // Tank the buzz due to the PR nightmare
      newProjects[i] = {
        ...p,
        buzz: Math.max(0, p.buzz - 2) 
       };
    } else {
      newProjects[i] = p;
    }
  }
  
  return {
    ...state,
    studio: {
      ...state.studio,
      internal: {
        ...state.studio.internal,
        projects: newProjects
      }
    },
    industry: {
      ...state.industry,
      scandals: updatedScandals
    }
  };
}
