import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';

const PILOT_MAX_WEEKS = 2;
const PILOT_BURN_RATE = 0.30;

export function tickPilots(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  for (const key in state.entities.projects) {
    const project = state.entities.projects[key];
    if (project.type !== 'SERIES' || (project as any).stage !== 'pilot') continue;

    const weeksInPilot = (project.weeksInPhase || 0) + 1;

    if (weeksInPilot < PILOT_MAX_WEEKS) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: {
            weeksInPhase: weeksInPilot,
            weeklyCost: Math.round(project.weeklyCost * PILOT_BURN_RATE),
          }
        }
      });
    } else {
      const quality = ((project as any).scriptHeat ?? 50) * 0.5 + (project.momentum ?? 50) * 0.5;
      const graduated = quality >= 40 || rng.next() < 0.3;

      if (graduated) {
        impacts.push({
          type: 'PILOT_GRADUATED',
          payload: { projectId: project.id, nextState: 'production' as const }
        });
        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('NWS'),
            headline: `"${project.title}" pilot greenlit to series`,
            description: `The network has ordered a full series pickup.`,
            category: 'development',
            week: state.week
          }
        });
      } else {
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: {
            projectId: project.id,
            update: { state: 'archived' as const }
          }
        });
        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('NWS'),
            headline: `"${project.title}" pilot passed on`,
            description: `The network declined to order a full series.`,
            category: 'cancellation',
            week: state.week
          }
        });
      }
    }
  }
  return impacts;
}
