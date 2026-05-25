import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { BardResolver } from '../bardResolver';

export function processRazzies(state: GameState, week: number, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  const eligibleProjects = [];
  const projects = state.entities.projects || {};
  for (const id in projects) {
    const p = projects[id];
    const score = p.reviewScore || 100;
    const budget = p.budget || 0;
    if (p.state === 'released' && budget >= 50_000_000 && score <= 30 && p.releaseWeek !== null) {
      eligibleProjects.push(p);
    }
  }

  if (eligibleProjects.length === 0) return impacts;

  eligibleProjects.sort((a, b) => {
    const scoreA = a.reviewScore || 100;
    const scoreB = b.reviewScore || 100;
    return scoreA - scoreB;
  });

  const nominees = eligibleProjects.slice(0, 3);

  for (const project of nominees) {
    const score = project.reviewScore || 30;
    const isPlayer = !!state.entities.projects[project.id];
    
    const flavor = (project.flavor || '').toLowerCase();
    const isAbsurd = flavor.includes('absurd') || flavor.includes('bizarre') || flavor.includes('mess');
    
    const prestigePenalty = score <= 10 ? -15 : score <= 20 ? -10 : -5;
    
    impacts.push({
      type: 'PROJECT_UPDATED',
      payload: {
        projectId: project.id,
        update: {
          razzieWinner: true,
          razzieCategory: score <= 10 ? 'Worst Picture' : score <= 20 ? 'Worst Director' : 'Worst Screenplay'
        } as unknown as Partial<import("@/engine/types").Project>
      }
    });

    if (isPlayer) {
      impacts.push({ type: 'PRESTIGE_CHANGED', payload: { amount: prestigePenalty } });
    }

    if (isAbsurd) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: { isCultClassic: true }
        }
      });
    }

    const razzieCategory = score <= 10 ? 'Worst Picture' : score <= 20 ? 'Worst Director' : 'Worst Screenplay';
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `RAZZIES: "${project.title}" nominated for ${razzieCategory}`,
        description: BardResolver.resolve({
          domain: 'Industry',
          subDomain: 'Award',
          intensity: 20,
          tone: 'Tabloid',
          context: { project: project.title, category: razzieCategory },
          rng
        }),
        category: 'awards'
      }
    });

    if (isAbsurd) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: `"${project.title}" gains ironic cult following`,
          description: `Despite its Razzie nomination, the film has developed a cult following among midnight movie audiences.`,
          category: 'general'
        }
      });
    }
  }

  return impacts;
}
