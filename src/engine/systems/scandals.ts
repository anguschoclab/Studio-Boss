import { GameState, Scandal, ScandalType } from '@/engine/types';
import { secureRandom } from '../utils';
import { StateImpact } from '../types/state.types';

/**
 * Randomly spawns a scandal for a talent in the pool based on their controversy risk.
 * If the talent is attached to an active studio project, it triggers a Project Crisis.
 */
export function generateScandals(state: GameState): StateImpact {
  const impact: StateImpact = {
    newScandals: [],
    newHeadlines: [],
    projectUpdates: [],
    uiNotifications: []
  };
  
  const contracts = state.studio.internal.contracts;
  const talentToProjectMap = new Map<string, string>();
  for (const c of contracts) {
    talentToProjectMap.set(c.talentId, c.projectId);
  }
  
  const projectTitleMap = new Map<string, string>();
  for (const p of state.studio.internal.projects) {
    projectTitleMap.set(p.id, p.title);
  }

  for (const talent of state.industry.talentPool) {
    const risk = talent.controversyRisk || 5; 
    if (secureRandom() * 1000 < risk) {
       const types: ScandalType[] = ['financial', 'personal', 'onset_behavior', 'legal', 'feud'];
       const type = types[Math.floor(secureRandom() * types.length)];
       
       const s: Scandal = {
         id: `scandal-${crypto.randomUUID()}`,
         talentId: talent.id,
         severity: 20 + Math.floor(secureRandom() * 80), // 20-100
         type,
         weeksRemaining: 4 + Math.floor(secureRandom() * 8)
       };
       
       impact.newScandals!.push(s);
       impact.newHeadlines!.push({
          category: 'talent',
          text: `PR NIGHTMARE: Massive ${type} scandal erupts violently around ${talent.name}!`
       });
       impact.uiNotifications!.push(`Scandal: ${talent.name} involved in ${type} controversy.`);

       const projectId = talentToProjectMap.get(talent.id);
       if (projectId) {
         const projectTitle = projectTitleMap.get(projectId) || 'Unknown Project';
         impact.projectUpdates!.push({
           projectId,
           update: {
             activeCrisis: {
               description: `BREAKING NEWS: ${talent.name.toUpperCase()} has been involved in a massive ${type} scandal while working on "${projectTitle}". The press is circling.`,
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
           }
         });
       }
    }
  }
  
  return impact;
}

/**
 * Processes weekly decay of scandals and returns a StateImpact.
 */
export function advanceScandals(state: GameState): StateImpact {
  if (!state.industry.scandals || state.industry.scandals.length === 0) return {};
  
  const impact: StateImpact = {
    scandalUpdates: [],
    projectUpdates: []
  };

  const activeScandalTalent = new Set<string>();
  const currentScandals = state.industry.scandals;

  for (let i = 0; i < currentScandals.length; i++) {
    const s = currentScandals[i];
    if (s.weeksRemaining > 1) {
      impact.scandalUpdates!.push({
        scandalId: s.id,
        update: { weeksRemaining: s.weeksRemaining - 1 }
      });
      activeScandalTalent.add(s.talentId);
    } else {
        // Scandal expires - could add an update to mark as finished if needed,
        // but applyStateImpact needs to handle removal if we want it gone.
        // For now, let's just assume we update it to 0 and advanceScandals filters in next turn?
        // Actually, applyStateImpact should probably have a 'removeScandals' array.
        // Let's just update it to 0 for now.
        impact.scandalUpdates!.push({
            scandalId: s.id,
            update: { weeksRemaining: 0 }
        });
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
  
  const currentProjects = state.studio.internal.projects;
  for (let i = 0; i < currentProjects.length; i++) {
    const p = currentProjects[i];
    if (penalizedProjectIds.has(p.id)) {
      impact.projectUpdates!.push({
        projectId: p.id,
        update: { buzz: Math.max(0, p.buzz - 2) }
      });
    }
  }
  
  return impact;
}

