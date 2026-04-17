import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { BardResolver } from '../bardResolver';

export function processRazzies(state: GameState, week: number, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const projects = Object.values(state.entities.projects || {});
  
  const eligibleProjects = projects.filter(p => {
    const score = p.reception?.metaScore || p.reviewScore || 100;
    const budget = p.budget || 0;
    return p.state === 'released' && budget >= 50_000_000 && score <= 30 && p.releaseWeek !== null;
  });

  if (eligibleProjects.length === 0) return impacts;

  eligibleProjects.sort((a, b) => {
    const scoreA = a.reception?.metaScore || a.reviewScore || 100;
    const scoreB = b.reception?.metaScore || b.reviewScore || 100;
    return scoreA - scoreB;
  });

  const nominees = eligibleProjects.slice(0, 3);

  for (const project of nominees) {
    const score = project.reception?.metaScore || project.reviewScore || 30;
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
        }
      }
    });

    if (isPlayer) {
      impacts.push({ type: 'PRESTIGE_CHANGED', payload: prestigePenalty });
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
        id: rng.uuid('NWS'),
        week,
        headline: `RAZZIES: "${project.title}" nominated for ${razzieCategory}`,
        description: BardResolver.resolve({
          domain: 'Industry',
          subDomain: 'Award',
          intensity: 20,
          tone: 'Tabloid',
          context: { project: project.title, category: razzieCategory },
          rng
        }),
        category: 'awards',
        publication: 'The Hollywood Reporter'
      }
    });

    if (isAbsurd) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          week,
          headline: `"${project.title}" gains ironic cult following`,
          description: `Despite its Razzie nomination, the film has developed a cult following among midnight movie audiences.`,
          category: 'general',
          publication: 'Variety'
        }
      });
    }
  }

  return impacts;
}
