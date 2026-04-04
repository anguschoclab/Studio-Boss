import { GameState, StateImpact, Project, RivalStudio, FestivalSubmission, AwardBody } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

export const FESTIVALS: { body: AwardBody, name: string, weeks: number[], cost: number, prestigeNeeded: number, buzzReward: number }[] = [
  { body: 'Sundance Film Festival', name: 'Sundance', weeks: [3, 4], cost: 25000, prestigeNeeded: 40, buzzReward: 30 },
  { body: 'Cannes Film Festival', name: 'Cannes', weeks: [20, 21], cost: 50000, prestigeNeeded: 60, buzzReward: 50 },
  { body: 'Venice Film Festival', name: 'Venice', weeks: [35, 36], cost: 50000, prestigeNeeded: 70, buzzReward: 40 },
  { body: 'Berlin International Film Festival', name: 'Berlinale', weeks: [8, 9], cost: 35000, prestigeNeeded: 50, buzzReward: 35 }
];

/**
 * Weekly Festival Resolver
 * Processes submissions from ALL studios.
 */
export function resolveFestivals(state: GameState, rng: RandomGenerator): StateImpact[] {
  if (!state.industry.festivalSubmissions || state.industry.festivalSubmissions.length === 0) return [];
  
  const impacts: StateImpact[] = [];
  const updatedSubmissions: FestivalSubmission[] = [];

  for (const sub of state.industry.festivalSubmissions) {
    if (sub.status !== 'submitted') {
        updatedSubmissions.push(sub);
        continue;
    }
    
    const fest = FESTIVALS.find(f => f.body === sub.festivalBody);
    if (!fest) {
        updatedSubmissions.push(sub);
        continue;
    }
    
    const weekOfCycle = state.week % 52 === 0 ? 52 : state.week % 52;
    if (fest.weeks.includes(weekOfCycle)) {
      // Find the project and its owner
      const playerProject = state.studio.internal.projects[sub.projectId];
      const rival = state.industry.rivals.find(r => !!(r.projects || {})[sub.projectId]);
      const project = playerProject || (rival?.projects || {})[sub.projectId];
      const ownerId = playerProject ? 'PLAYER' : (rival?.id || 'RIVAL');

      if (!project) {
          updatedSubmissions.push(sub);
          continue;
      }
      
      const ownerPrestige = playerProject ? state.studio.prestige : (rival?.prestige || 50);
      const baseChance = (project.reviewScore || 50) + (ownerPrestige * 0.5);
      const isAccepted = baseChance > (fest.prestigeNeeded + rng.range(-20, 20));
      
      if (isAccepted) {
        // Success: Buzz and Prestige
        const buzzGain = Math.min(100, project.buzz + fest.buzzReward);
        
        if (ownerId === 'PLAYER') {
            impacts.push({
                type: 'PROJECT_UPDATED',
                payload: { projectId: project.id, update: { buzz: buzzGain } }
            });
            impacts.push({ type: 'PRESTIGE_CHANGED', payload: 2 });
        } else {
            impacts.push({
                type: 'RIVAL_UPDATED',
                payload: {
                    rivalId: ownerId,
                    update: {
                        projects: { ...(rival?.projects || {}), [project.id]: { ...(rival?.projects || {})[project.id], buzz: buzzGain } },
                        prestige: Math.min(100, (rival?.prestige || 50) + 2)
                    }
                }
            });
        }
        
        impacts.push({
            type: 'NEWS_ADDED',
            payload: {
                headline: `FESTIVALS: "${project.title}" premieres at ${fest.name}`,
                description: `Receiving a standing ovation, ${project.title} has become the talk of the circuit.`,
                category: 'awards'
            }
        });
        
        updatedSubmissions.push({ ...sub, status: 'selected' as const, buzzGain: fest.buzzReward });
      } else {
        updatedSubmissions.push({ ...sub, status: 'rejected' as const });
      }
    } else {
      updatedSubmissions.push(sub);
    }
  }
  
  // Update state with a rolling 8-week TTL for all submissions to prevent state bloat
  impacts.push({
    type: 'INDUSTRY_UPDATE',
    payload: {
        update: { 'industry.festivalSubmissions': updatedSubmissions.filter(s => (state.week - s.week) < 8) }
    }
  });

  return impacts;
}
