import { Project, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { isSeriesProject } from '../../utils/projectUtils';

export function handlePostReleasePhase(p: Project, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  let weeklyAncillary = 0;

  const isFamilyOrAnim = p.genre === 'Family' || p.genre === 'Animation';
  const isPrestige = (p as any).genre === 'Drama' || (p as any).targetAudience === 'Prestige / Critics';
  const projectAny = p as any;

  if (p.weeksInPhase === 1) {
    if (isPrestige && (p.reviewScore || 0) > 80) {
      weeklyAncillary = projectAny.budget * rng.range(0.5, 1.5);
    } else if (p.format === 'film') {
      weeklyAncillary = projectAny.revenue * rng.range(0.1, 0.3);
    } else if (p.format === 'tv') {
      weeklyAncillary = projectAny.revenue * rng.range(0.05, 0.15);
    } else if (p.format === 'unscripted') {
      weeklyAncillary = projectAny.revenue * rng.range(0.02, 0.08);
    }
  } else {
    if (isFamilyOrAnim) {
      weeklyAncillary = projectAny.revenue * 0.005;
    } else {
      weeklyAncillary = projectAny.revenue * 0.001;
    }
    weeklyAncillary *= Math.max(0.1, 1 - ((p as any).weeksInPhase / 52));
  }

  const newAncillaryRevenue = (p.ancillaryRevenue || 0) + weeklyAncillary;
  const newRevenue = projectAny.revenue + weeklyAncillary;
  const currentWeeksInPhase = (p as any).weeksInPhase || 0;
  const newState = currentWeeksInPhase >= 26 ? 'archived' : p.state;
  const newWeeksInPhase = currentWeeksInPhase >= 26 ? 0 : currentWeeksInPhase + 1;

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: p.id,
      update: {
        ancillaryRevenue: newAncillaryRevenue,
        revenue: newRevenue,
        weeklyRevenue: 0,
        state: newState as any,
        weeksInPhase: newWeeksInPhase
      }
    }
  });

  return impacts;
}
