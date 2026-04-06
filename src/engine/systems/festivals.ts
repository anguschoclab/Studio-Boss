import { GameState, StateImpact, Project, RivalStudio, FestivalSubmission, AwardBody } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

export const FESTIVALS: { body: AwardBody, name: string, weeks: number[], cost: number, prestigeNeeded: number, buzzReward: number }[] = [
  { body: 'Sundance Film Festival', name: 'Sundance', weeks: [3, 4], cost: 25000, prestigeNeeded: 40, buzzReward: 30 },
  { body: 'Cannes Film Festival', name: 'Cannes', weeks: [20, 21], cost: 50000, prestigeNeeded: 60, buzzReward: 50 },
  { body: 'Venice Film Festival', name: 'Venice', weeks: [35, 36], cost: 50000, prestigeNeeded: 70, buzzReward: 40 },
  { body: 'Berlin International Film Festival', name: 'Berlinale', weeks: [8, 9], cost: 35000, prestigeNeeded: 50, buzzReward: 35 }
];

export const FESTIVAL_BY_BODY = FESTIVALS.reduce((acc, f) => {
  acc[f.body] = f;
  return acc;
}, {} as Partial<Record<AwardBody, typeof FESTIVALS[0]>>);

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
    
    const fest = FESTIVAL_BY_BODY[sub.festivalBody];
    if (!fest) {
        updatedSubmissions.push(sub);
        continue;
    }
    
    const weekOfCycle = state.week % 52 === 0 ? 52 : state.week % 52;
    if (fest.weeks.includes(weekOfCycle)) {
      // Find the project and its owner
      const playerProject = state.entities.projects[sub.projectId];
      const rival = state.entities.rivals.find(r => !!(r.projects || {})[sub.projectId]);
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

/**
 * Submits a project to a festival.
 * Phase 2: Deducts entry fee and adds to global submissions list.
 */
export function submitToFestival(
  state: GameState, 
  projectId: string, 
  festivalBody: AwardBody, 
  rng: RandomGenerator
): StateImpact[] | null {
  const project = state.entities.projects[projectId];
  const fest = FESTIVAL_BY_BODY[festivalBody];
  
  if (!project || !fest) return null;
  if (state.finance.cash < fest.cost) return null;

  const impacts: StateImpact[] = [
    {
      type: 'FUNDS_DEDUCTED',
      payload: { amount: fest.cost }
    },
    {
      type: 'INDUSTRY_UPDATE',
      payload: {
        update: {
          'industry.festivalSubmissions': [
            ...(state.industry.festivalSubmissions || []),
            {
              id: rng.uuid('sub'),
              projectId,
              festivalBody,
              status: 'submitted',
              week: state.week
            }
          ]
        }
      }
    },
    {
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('news-fest'),
        headline: `Studio submits "${project.title}" to ${fest.name}`,
        description: `Strategic awards push: The studio has officially entered the competition at ${fest.name}.`,
        category: 'awards'
      }
    }
  ];

  return impacts;
}
