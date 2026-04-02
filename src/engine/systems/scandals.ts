import { GameState, Scandal, ScandalType } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { RandomGenerator } from '../utils/rng';

/**
 * Randomly spawns a scandal for a talent in the pool based on their controversy risk.
 * If the talent is attached to an active studio project, it triggers a Project Crisis.
 */
export function generateScandals(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impactsToReturn: StateImpact[] = [];
  const impact: StateImpact = {
    newScandals: [],
    newHeadlines: [],
    newsEvents: [],
    projectUpdates: [],
    uiNotifications: []
  };
  
  const contracts = state.studio.internal.contracts || [];
  const talentToProjectMap = new Map<string, string>();
  for (const c of contracts) {
    talentToProjectMap.set(c.talentId, c.projectId);
  }
  
  const studioProjects = state.studio.internal.projects || {};

  const talentPool = state.industry.talentPool || {};
  for (const talentId in talentPool) {
    const talent = talentPool[talentId];
    const risk = talent.psychology?.scandalRisk || 5; 
    if (rng.next() * 1000 < risk) {
       const types: ScandalType[] = ['financial', 'personal', 'onset_behavior', 'legal', 'feud'];
       const type = rng.pick(types);
       
       const s: Scandal = {
         id: rng.uuid('scandal'),
         talentId: talent.id,
         severity: 20 + Math.floor(rng.next() * 80), // 20-100
         type,
         weeksRemaining: 4 + Math.floor(rng.next() * 8)
       };

       impact.newScandals!.push(s);

       impact.newsEvents!.push({
         id: rng.uuid('news'),
         week: state.week,
         type: 'CRISIS',
         headline: 'PR NIGHTMARE',
         description: `A massive ${type} scandal erupts violently around ${talent.name}!`,
       });

       const projectId = talentToProjectMap.get(talent.id);
       if (projectId && studioProjects[projectId]) {
         const project = studioProjects[projectId];
         const crisisId = rng.uuid('scandal-crisis');
         
         const crisisPayload = {
            crisisId,
            triggeredWeek: state.week,
            haltedProduction: false,
            description: `BREAKING NEWS: ${talent.name.toUpperCase()} has been involved in a massive ${type} scandal while working on "${project.title}". The press is circling.`,
            resolved: false,
            severity: s.severity > 75 ? 'high' as const : 'medium' as const,
            options: [
              {
                text: "Fire Them",
                effectDescription: "Remove talent from project, +2 week delay, preserve reputation.",
                weeksDelay: 2,
                removeTalentId: talent.id,
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
         };

         impact.projectUpdates!.push({
            projectId,
            update: {
               activeCrisis: crisisPayload
            }
         });

         impact.uiNotifications!.push(`A crisis has hit "${project.title}"!`);

         impactsToReturn.push({
           type: 'MODAL_TRIGGERED',
           payload: {
             modalType: 'CRISIS',
             priority: 100,
             payload: {
               projectId,
               crisis: crisisPayload
             }
           }
         });
       }
    }
  }
  
  impactsToReturn.push(impact);
  return impactsToReturn;
}



/**
 * Processes weekly decay of scandals and applies their penalties to projects.
 */
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
  
  const contracts = state.studio.internal.contracts || [];
  const penalizedProjectIds = new Set<string>();
  for (const c of contracts) {
    if (activeScandalTalent.has(c.talentId)) {
      penalizedProjectIds.add(c.projectId);
    }
  }
  
  for (const projectId of penalizedProjectIds) {
      const p = state.studio.internal.projects[projectId];
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
