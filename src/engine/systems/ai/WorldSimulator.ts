import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * AI Decision Mapping to News API (Target C3).
 * Simulates the "Living World" by generating headlines based on AI state.
 */
export function tickWorldEvents(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  // 1. Poison the Well: Genre Saturation
  const projects = Object.values(state.studio.internal.projects);
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    if (project.state === 'released' && project.weeksInPhase === 1) {
      if (rng.next() < 0.25) {
        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            headline: `MARKET SATURATION: The success of ${project.title} has flooded the ${project.genre} market.`,
            description: `Analysts are warning of potential genre fatigue in the ${project.genre} space following the blockbuster debut of "${project.title}".`,
          }
        });
      }
    }
  }

  // 2. Star Meter & Talent Momentum
  const talentPool = Object.values(state.industry.talentPool || {});
  for (let i = 0; i < talentPool.length; i++) {
    const talent = talentPool[i];
    if (talent.momentum > 85 && rng.next() < 0.1) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: `STAR RISING: Agents report massive demand for ${talent.name} after a breakout season.`,
          description: `Industry insiders are calling ${talent.name} the "one to watch" as demand for the star hits an all-time high.`,
        }
      });
    }
  }

  return impacts;
}
