// ⚠️ DEAD CODE: This file is not imported by any active module (WeekCoordinator, filters, etc.).
// Retained for reference only. The active scandal logic lives in src/engine/systems/scandals.ts.
import { GameState, Scandal, ScandalType, Project } from '@/engine/types';
import { rand, generateId } from '../utils';
import { StateImpact } from '../types/state.types';

/**
 * Randomly spawns a scandal for a talent in the pool based on their controversy risk.
 * If the talent is attached to an active studio project, it triggers a Project Crisis.
 */
export function generateScandals(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  const contracts = Object.values(state.entities.contracts).filter(c => c.ownerId === 'player');
  const talentToProjectMap = new Map<string, string>();
  for (const c of contracts) {
    talentToProjectMap.set(c.talentId, c.projectId);
  }
  
  const studioProjects = state.entities.projects;

  for (const talent of Object.values(state.entities.talents || {})) {
    const risk = talent.psychology?.scandalRisk || 5; 
    if (rand() * 1000 < risk) {
       const types: ScandalType[] = ['financial', 'personal', 'onset_behavior', 'legal', 'feud'];
       const type = types[Math.floor(rand() * types.length)];
       
       const s: Scandal = {
         id: generateId('SCA'),
         talentId: talent.id,
         severity: 20 + Math.floor(rand() * 80), // 20-100
         type,
         weeksRemaining: 4 + Math.floor(rand() * 8)
       };

       impacts.push({
         type: 'SCANDAL_ADDED',
         payload: { scandal: s }
       });

       impacts.push({
         type: 'NEWS_ADDED',
         payload: {
           headline: 'PR NIGHTMARE',
           description: `A massive ${type} scandal erupts violently around ${talent.name}!`,
         }
       });

       const projectId = talentToProjectMap.get(talent.id);
       if (projectId && studioProjects[projectId]) {
         const project = studioProjects[projectId];
         impacts.push({
           type: 'PROJECT_UPDATED',
           payload: {
             projectId,
             update: {
               activeCrisis: {
                  crisisId: generateId('CRI'),
                  triggeredWeek: state.week,
                  haltedProduction: false,
                 description: `BREAKING NEWS: ${talent.name.toUpperCase()} has been involved in a massive ${type} scandal while working on "${project.title}". The press is circling.`,
                 resolved: false,
                  severity: s.severity > 75 ? 'high' : 'medium',
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
               }
             }
           }
         });
       }
    }
  }
  
  return impacts;
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
  
  const updatedScandals = currentScandals
    .filter(s => s.weeksRemaining > 1)
    .map(s => ({ ...s, weeksRemaining: s.weeksRemaining - 1 }));

  const contracts = Object.values(state.entities.contracts).filter(c => c.ownerId === 'player');
  const penalizedProjectIds = new Set<string>();
  for (const c of contracts) {
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
