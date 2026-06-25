import { GameState, StateImpact, Project } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { BardResolver } from '../bardResolver';

export function processRazzies(state: GameState, week: number, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  const eligibleProjects = [];
  const releasedIds = state.entities.releasedProjectIds;
  for (let i = 0; i < releasedIds.length; i++) {
    const p = state.entities.projects[releasedIds[i]];
    if (!p) continue;
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
    const isPlayer = project.ownerId === state.studio.id;
    
    const flavor = (project.flavor || '').toLowerCase();
    const isAbsurd = flavor.includes('absurd') || flavor.includes('bizarre') || flavor.includes('mess');
    
    const prestigePenalty = score <= 10 ? -15 : score <= 20 ? -10 : -5;
    const razzieCategory = score <= 10 ? 'Worst Picture' : score <= 20 ? 'Worst Director' : 'Worst Screenplay';
    
    impacts.push({
      type: 'PROJECT_UPDATED',
      payload: {
        projectId: project.id,
        update: {
          razzieWinner: true,
          razzieCategory
        } as unknown as Partial<Project>
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
