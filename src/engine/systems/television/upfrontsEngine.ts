import { GameState, StateImpact, SeriesProject } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

export interface UpfrontResult {
  projectId: string;
  projectTitle: string;
  decision: 'pickup' | 'pass' | 'limited_order';
  episodesOrdered?: number;
  notes: string;
}

/**
 * Upfronts — fired at week 20 each year.
 * Network buyers evaluate all in-development TV projects and issue pickup orders or passes.
 * Triggers a MODAL_TRIGGERED impact for the player to review decisions.
 */
export function runUpfronts(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  const devSeries = Object.values(state.studio.internal.projects).filter(
    (p): p is SeriesProject =>
      p.type === 'SERIES' &&
      (p.state === 'development' || p.state === 'needs_greenlight') &&
      (p as any).stage !== 'pilot'
  );

  if (devSeries.length === 0) return impacts;

  const results: UpfrontResult[] = devSeries.map(project => {
    const buzz = project.buzz ?? 50;
    const scriptHeat = (project as any).scriptHeat ?? 50;
    const momentum = project.momentum ?? 50;
    const quality = (buzz * 0.4 + scriptHeat * 0.3 + momentum * 0.3) + rng.range(-10, 10);

    let decision: UpfrontResult['decision'];
    let episodesOrdered: number | undefined;
    let notes: string;

    if (quality >= 70) {
      decision = 'pickup';
      episodesOrdered = project.budgetTier === 'low' ? rng.rangeInt(6, 10) : rng.rangeInt(8, 13);
      notes = `Strong buyer interest. Full series order of ${episodesOrdered} episodes.`;
    } else if (quality >= 45) {
      decision = 'limited_order';
      episodesOrdered = rng.rangeInt(4, 7);
      notes = `Cautious interest. Limited order of ${episodesOrdered} episodes to prove concept.`;
    } else {
      decision = 'pass';
      notes = `Networks passed. Project needs rework before resubmission.`;
    }

    return { projectId: project.id, projectTitle: project.title, decision, episodesOrdered, notes };
  });

  // Apply project updates for pickups
  results.forEach(result => {
    if (result.decision !== 'pass') {
      const project = state.studio.internal.projects[result.projectId] as SeriesProject;
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: result.projectId,
          update: {
            state: 'production' as const,
            tvDetails: {
              ...project.tvDetails,
              episodesOrdered: result.episodesOrdered ?? 10,
              status: 'IN_DEVELOPMENT',
            }
          }
        }
      });
    }
  });

  // Trigger modal so player can review all decisions
  impacts.push({
    type: 'MODAL_TRIGGERED',
    payload: {
      modalType: 'UPFRONTS',
      priority: 30,
      payload: { results, week: state.week }
    }
  });

  // Add headline
  const pickups = results.filter(r => r.decision !== 'pass').length;
  if (pickups > 0) {
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: `upfronts-${state.week}`,
        headline: `${state.studio.name} announces ${pickups} series pickup${pickups > 1 ? 's' : ''} at Upfronts`,
        description: `The studio secured orders at this season's upfront presentations.`,
        category: 'development',
        publication: 'Deadline'
      }
    });
  }

  return impacts;
}
