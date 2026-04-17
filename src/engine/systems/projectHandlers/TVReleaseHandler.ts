import { SeriesProject, Contract, Talent, Award, StateImpact } from '@/engine/types';
import { TalentSystem } from '../TalentSystem';
import { TV_FORMATS } from '../../data/tvFormats';
import { RandomGenerator } from '../../utils/rng';

export function handleTVReleaseEntry(
  p: SeriesProject,
  currentWeek: number,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currentSeason = p.tvDetails?.currentSeason || 1;
  const weeklyRevenue = (p.budget * 0.1) * (p.buzz / 50) * franchiseSynergy * (1 - franchiseFatigue);
  
  const projectUpdate: Partial<SeriesProject> = {
    state: 'released',
    weeksInPhase: 0,
    releaseWeek: currentWeek,
    revenue: weeklyRevenue,
    weeklyRevenue
  };

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: p.id,
      update: projectUpdate
    }
  });
  
  return impacts;
}

export function handleTVReleasedPhase(
  p: SeriesProject,
  projectContracts: Contract[],
  talentPool: Record<string, Talent>,
  projectAwards: Award[],
  franchiseSynergy: number,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const formatData = TV_FORMATS[p.tvFormat as keyof typeof TV_FORMATS] || TV_FORMATS['prestige_drama'];
  const eps = p.tvDetails.episodesOrdered || formatData.defaultEpisodes;
  const currentSeason = p.tvDetails.currentSeason || 1;
  const currentRevenue = p.revenue + p.weeklyRevenue;
  let newWeeklyRevenue = p.weeklyRevenue;
  let newState = p.state;
  let newWeeksInPhase = p.weeksInPhase;
  let episodesAired = p.tvDetails.episodesAired || 0;

  if (p.releaseModel === 'binge') {
    newWeeklyRevenue *= rng.range(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1) * franchiseSynergy;

    if (newWeeklyRevenue < 50_000 || p.weeksInPhase > 8) {
      newState = 'post_release';
      newWeeksInPhase = 0;
      const talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, talentPool, projectAwards);
      talentUpdates.forEach(t => {
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: { talentId: t.id, update: t }
        });
      });
    }
  } else if (p.releaseModel === 'split') {
    const part2DropWeek = Math.ceil(eps / 2) + 2;

    if (p.weeksInPhase === part2DropWeek) {
      episodesAired = eps;
      newWeeklyRevenue *= 2.5 * franchiseSynergy;
    } else if (p.weeksInPhase > part2DropWeek) {
      newWeeklyRevenue *= rng.range(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1) * franchiseSynergy;
    } else {
      newWeeklyRevenue *= rng.range(0.6, 0.8) * franchiseSynergy;
    }

    if (p.weeksInPhase > part2DropWeek + 6 && newWeeklyRevenue < 50_000) {
      newState = 'post_release';
      newWeeksInPhase = 0;
      const talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, talentPool, projectAwards);
      talentUpdates.forEach(t => {
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: { talentId: t.id, update: t }
        });
      });
    }
  } else {
    if (episodesAired < eps) {
      episodesAired += 1;
      newWeeklyRevenue *= rng.range(formatData.revenueDecayWeekly - 0.05, formatData.revenueDecayWeekly + 0.05) * franchiseSynergy;

      if (episodesAired === eps) {
        newWeeklyRevenue *= 1.3 * franchiseSynergy;
      }
    } else {
      newWeeklyRevenue *= 0.6 * franchiseSynergy;
      if (newWeeklyRevenue < 50_000 || p.weeksInPhase > eps + 4) {
        newState = 'post_release';
        newWeeksInPhase = 0;
        const talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, talentPool, projectAwards);
        talentUpdates.forEach(t => {
          impacts.push({
            type: 'TALENT_UPDATED',
            payload: { talentId: t.id, update: t }
          });
        });
      }
    }
  }

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: p.id,
      update: {
        revenue: currentRevenue,
        weeklyRevenue: newWeeklyRevenue,
        tvDetails: {
          ...p.tvDetails,
          episodesAired
        },
        state: newState,
        weeksInPhase: newWeeksInPhase
      }
    }
  });

  return impacts;
}
