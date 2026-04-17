import { pick } from '../../utils';
import { GameState, Scandal, ScandalType } from '@/engine/types';
import { StateImpact } from '../../types/state.types';
import { RandomGenerator } from '../../utils/rng';
import { BardResolver } from '../bardResolver';

export function generateScandals(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impactsToReturn: StateImpact[] = [];
  const impact: StateImpact = {
    newScandals: [],
    newHeadlines: [],
    newsEvents: [],
    projectUpdates: [],
    uiNotifications: []
  };
  
  const contractsList = Object.values(state.entities.contracts || {});
  const talentToProjectMap = new Map<string, string>();
  for (const c of contractsList) {
    talentToProjectMap.set(c.talentId, c.projectId);
  }
  
  const studioProjects = state.entities.projects || {};

  const numContracts = contractsList.length;
  const studioProjectsCount = Object.keys(studioProjects).length;
  const sizeModifier = 1.0 + (numContracts * 0.50) + (studioProjectsCount * 0.75);

  const talentPool = state.entities.talents || {};
  for (const talentId in talentPool) {
    const talent = talentPool[talentId];
    const risk = talent.psychology?.scandalRisk || 5; 
    if (rng.next() * 1000 < (risk * sizeModifier)) {
       const types: ScandalType[] = ['financial', 'personal', 'onset_behavior', 'legal', 'feud'];
       const type = pick(types, rng);
       
       const s: Scandal = {
         id: rng.uuid('SND'),
         talentId: talent.id,
         severity: 20 + Math.floor(rng.next() * 80),
         type,
         weeksRemaining: 4 + Math.floor(rng.next() * 8)
       };

       impact.newScandals!.push(s);

       impact.newsEvents!.push({
         id: rng.uuid('NWS'),
         week: state.week,
         type: 'CRISIS',
         headline: BardResolver.resolve({
            domain: 'Industry',
            subDomain: 'Scandal',
            intensity: s.severity,
            tone: 'Trade',
            context: { actor: talent.name, type },
            rng
         }),
         description: BardResolver.resolve({
            domain: 'Industry',
            subDomain: 'Scandal',
            intensity: s.severity,
            tone: 'Tabloid',
            context: { actor: talent.name, type },
            rng
         }),
       });

       const projectId = talentToProjectMap.get(talent.id);
       if (projectId && studioProjects[projectId]) {
         const project = studioProjects[projectId];
         const crisisId = rng.uuid('CRS');
         
         const crisisPayload = {
            id: crisisId,
            crisisId,
            triggeredWeek: state.week,
            haltedProduction: false,
            description: BardResolver.resolve({
               domain: 'Crisis',
               subDomain: 'PR',
               intensity: s.severity,
               context: { actor: talent.name, project: project.title, type },
               rng
            }),
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
