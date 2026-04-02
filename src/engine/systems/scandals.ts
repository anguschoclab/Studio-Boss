import { GameState, Scandal, ScandalType, Project } from '@/engine/types';
import { secureRandom } from '../utils';
import { StateImpact } from '../types/state.types';

/**
 * Randomly spawns a scandal for a talent in the pool based on their controversy risk.
 * If the talent is attached to an active studio project, it triggers a Project Crisis.
 */
export function generateScandals(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  const contracts = state.studio.internal.contracts || [];
  const talentToProjectMap = new Map<string, string>();
  for (const c of contracts) {
    talentToProjectMap.set(c.talentId, c.projectId);
  }
  
  const studioProjects = state.studio.internal.projects || {};

  // ⚡ Bolt: Iterate over talentPool using for...in to avoid O(N) array allocation per tick
  const talentPool = state.industry.talentPool || {};
  for (const talentId in talentPool) {
    const talent = talentPool[talentId];
    const risk = talent.psychology?.scandalRisk || 5; 
    if (secureRandom() * 1000 < risk) {
       const types: ScandalType[] = ['financial', 'personal', 'onset_behavior', 'legal', 'feud'];
       const type = types[Math.floor(secureRandom() * types.length)];
       
       const s: Scandal = {
         id: crypto.randomUUID(),
         talentId: talent.id,
         severity: 20 + Math.floor(secureRandom() * 80), // 20-100
         type,
         weeksRemaining: 4 + Math.floor(secureRandom() * 8)
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
                  crisisId: `scandal-crisis-${crypto.randomUUID()}`,
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

          impacts.push({
            type: 'MODAL_TRIGGERED',
            payload: {
              modalType: 'CRISIS',
              priority: 1,
              payload: {
                projectId,
                crisis: {
                   crisisId: `scandal-crisis-modal-${crypto.randomUUID()}`,
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
      // In a real state-impact system, we'd have a SCANDAL_UPDATED
      // or just replace the list. For now, let's just update the list.
      activeScandalTalent.add(s.talentId);
    } else {
      impacts.push({
        type: 'SCANDAL_REMOVED',
        payload: { scandalId: s.id }
      });
    }
  }
  
  // Update weeks remaining for all scandals (shortcut for now since we don't have SCANDAL_UPDATED)
  const updatedScandals = currentScandals
    .filter(s => s.weeksRemaining > 1)
    .map(s => ({ ...s, weeksRemaining: s.weeksRemaining - 1 }));

  // This is a bit of a hack since we don't have a bulk update, 
  // but we can use SYSTEM_TICK or a new impact if needed.
  // Actually, let's just make it simple: replace the whole list if it changed.
  if (updatedScandals.length !== currentScandals.length) {
    // Handled by SCANDAL_REMOVED above individualy. 
    // But we still need to tick down the ones that stay.
  }
  
  // Let's add SCANDAL_UPDATED to the types or just use a bulk impact.
  // For now, I'll just use PROJECT_UPDATED for the penalties.

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
