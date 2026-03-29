import { GameState, FestivalSubmission, AwardBody } from '@/engine/types';
import { randRange } from '../utils';

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
): GameState | null {
  const fest = FESTIVALS.find(f => f.body === festivalBody);
  const project = state.studio.internal.projects.find(p => p.id === projectId);
  
  if (!fest || !project || state.cash < fest.cost) return null;
  
  // Can only submit completed or post-production films
  if (project.status === 'development' || project.status === 'pitching') return null;
  
  const submission: FestivalSubmission = {
    id: crypto.randomUUID(),
    projectId,
    festivalBody,
    status: 'submitted',
    buzzGain: 0,
    week: state.week
  };
  
  return {
    ...state,
    cash: state.cash - fest.cost,
    industry: {
      ...state.industry,
      festivalSubmissions: [...(state.industry.festivalSubmissions || []), submission],
      headlines: [
        {
          id: crypto.randomUUID(),
          week: state.week,
          category: 'awards' as const,
          text: `"${project.title}" officially submitted for consideration at ${fest.name}.`
        },
        ...state.industry.headlines
      ].slice(0, 50)
    }
  };
}

export function resolveFestivals(state: GameState): GameState {
  if (!state.industry.festivalSubmissions || state.industry.festivalSubmissions.length === 0) return state;
  
  const newState = { ...state };
  let updatedSubmissions = [...state.industry.festivalSubmissions];
  const updatedProjects = [...state.studio.internal.projects];
  const newHeadlines = [...state.industry.headlines];
  
  const projectIndices = new Map<string, number>();
  for (let i = 0; i < updatedProjects.length; i++) {
    projectIndices.set(updatedProjects[i].id, i);
  }

  updatedSubmissions = updatedSubmissions.map(sub => {
    if (sub.status !== 'submitted') return sub;
    
    const fest = FESTIVALS.find(f => f.body === sub.festivalBody);
    if (!fest) return sub;
    
    // Resolve if festival is occurring this week
    if (fest.weeks.includes(state.week % 52)) {
      const pIndex = projectIndices.get(sub.projectId);
      if (pIndex === undefined) return sub;
      const project = updatedProjects[pIndex];
      
      // Calculate acceptance chance
      const baseChance = (project.reviewScore || 50) + (state.studio.prestige * 0.5);
      const isAccepted = baseChance > fest.prestigeNeeded + randRange(-20, 20);
      
      if (isAccepted) {
        // Boost buzz and slightly boost prestige
        updatedProjects[pIndex] = {
          ...project,
          buzz: Math.min(100, project.buzz + fest.buzzReward)
        };
        newState.studio.prestige = Math.min(100, newState.studio.prestige + 2);
        
        newHeadlines.unshift({
          id: crypto.randomUUID(),
          week: state.week,
          category: 'awards' as const,
          text: `Massive buzz out of ${fest.name} as "${project.title}" premieres to standing ovation!`
        });
        
        return { ...sub, status: 'selected' as const, buzzGain: fest.buzzReward };
      } else {
        return { ...sub, status: 'rejected' as const };
      }
    }
    
    return sub;
  });
  
  // Clean up old rejections
  updatedSubmissions = updatedSubmissions.filter(s => s.status !== 'rejected' || state.week - s.week < 12);
  
  return {
    ...newState,
    studio: {
      ...newState.studio,
      internal: {
        ...newState.studio.internal,
        projects: updatedProjects
      }
    },
    industry: {
      ...newState.industry,
      festivalSubmissions: updatedSubmissions,
      headlines: newHeadlines.slice(0, 50)
    }
  };
}
