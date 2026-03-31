import { GameState, StateImpact } from '@/engine/types';
import { secureRandom, pick } from '../../utils';

/**
 * AI Decision Mapping to News API (Target C3).
 * Simulates the "Living World" by generating headlines based on AI state.
 */
export function tickWorldEvents(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];

  // 1. Poison the Well: Genre Saturation
  state.projects.active.forEach(project => {
    if (project.state === 'released' && project.weeksInPhase === 1) {
      if (secureRandom() < 0.25) {
        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            headline: {
              id: crypto.randomUUID(),
              week: state.week,
              category: 'market',
              text: `MARKET SATURATION: The success of ${project.title} has flooded the ${project.genre} market.`
            }
          }
        });
      }
    }
  });

  // 2. Star Meter & Talent Momentum
  Object.values(state.industry.talentPool || {}).forEach(talent => {
    if (talent.momentum > 85 && secureRandom() < 0.1) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: {
            id: `news-${Math.random()}`,
            week: state.week,
            category: 'talent',
            text: `STAR RISING: Agents report massive demand for ${talent.name} after a breakout season.`
          }
        }
      });
    }
  });

  return impacts;
}
