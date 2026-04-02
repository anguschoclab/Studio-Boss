import { GameState, FestivalSubmission, AwardBody, Project } from '@/engine/types';
import { randRange } from '../utils';
import { StateImpact } from '../types/state.types';

export const FESTIVALS: { body: AwardBody, name: string, weeks: number[], cost: number, prestigeNeeded: number, buzzReward: number }[] = [
  { body: 'Sundance Film Festival', name: 'Sundance', weeks: [3, 4], cost: 25000, prestigeNeeded: 40, buzzReward: 30 },
  { body: 'Cannes Film Festival', name: 'Cannes', weeks: [20, 21], cost: 50000, prestigeNeeded: 60, buzzReward: 50 },
  { body: 'Venice Film Festival', name: 'Venice', weeks: [35, 36], cost: 50000, prestigeNeeded: 70, buzzReward: 40 },
  { body: 'Berlin International Film Festival', name: 'Berlinale', weeks: [8, 9], cost: 35000, prestigeNeeded: 50, buzzReward: 35 }
];

export function submitToFestival(
  state: GameState,
  projectId: string,
  festivalBody: AwardBody
): StateImpact | null {
  const fest = FESTIVALS.find(f => f.body === festivalBody);
  const project = state.studio.internal.projects[projectId];
  
  if (!fest || !project || state.finance.cash < fest.cost) return null;
  
  if (project.state === 'development' || project.state === 'pitching') return null;
  
  const submission: FestivalSubmission = {
    id: crypto.randomUUID(),
    projectId,
    festivalBody,
    status: 'submitted',
    buzzGain: 0,
    week: state.week
  };
  
  return {
    cashChange: -fest.cost,
    newFestivalSubmissions: [...(state.industry.festivalSubmissions || []), submission],
    newHeadlines: [
      {
        id: `headline-${crypto.randomUUID()}`,
        week: state.week,
        category: 'awards' as const,
        text: `"${project.title}" officially submitted for consideration at ${fest.name}.`
      }
    ]
  };
}

export function resolveFestivals(state: GameState): StateImpact {
  if (!state.industry.festivalSubmissions || state.industry.festivalSubmissions.length === 0) return {};
  
  const impact: StateImpact = {
    newFestivalSubmissions: [],
    projectUpdates: [],
    prestigeChange: 0,
    newHeadlines: []
  };

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
    
    if (fest.weeks.includes(state.week % 52)) {
      const project = state.studio.internal.projects[sub.projectId];
      if (!project) {
          updatedSubmissions.push(sub);
          continue;
      }
      
      const baseChance = (project.reviewScore || 50) + (state.studio.prestige * 0.5);
      const isAccepted = baseChance > fest.prestigeNeeded + randRange(-20, 20);
      
      if (isAccepted) {
        impact.projectUpdates!.push({
            projectId: sub.projectId,
            update: { buzz: Math.min(100, project.buzz + fest.buzzReward) }
        });
        impact.prestigeChange! += 2;
        
        impact.newHeadlines!.push({
          id: `headline-${crypto.randomUUID()}`,
          week: state.week,
          category: 'awards' as const,
          text: `Massive buzz out of ${fest.name} as "${project.title}" premieres to standing ovation!`
        });
        
        updatedSubmissions.push({ ...sub, status: 'selected' as const, buzzGain: fest.buzzReward });
      } else {
        updatedSubmissions.push({ ...sub, status: 'rejected' as const });
      }
    } else {
      updatedSubmissions.push(sub);
    }
  }
  
  impact.newFestivalSubmissions = updatedSubmissions.filter(s => s.status !== 'rejected' || state.week - s.week < 12);
  return impact;
}
