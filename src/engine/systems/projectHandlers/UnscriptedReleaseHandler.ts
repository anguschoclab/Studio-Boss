import { UnscriptedProject, Contract, Talent, Award, StateImpact } from '@/engine/types';
import { TalentSystem } from '../TalentSystem';
import { UNSCRIPTED_FORMATS } from '../../data/unscriptedFormats';
import { RandomGenerator } from '../../utils/rng';

export function handleUnscriptedReleaseEntry(
  p: UnscriptedProject & { type: 'SERIES' },
  currentWeek: number,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const weeklyRevenue = (p.budget * 0.05) * (p.buzz / 50) * franchiseSynergy * (1 - franchiseFatigue);
  
  const projectUpdate: Partial<UnscriptedProject> = {
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

export function handleUnscriptedReleasedPhase(
  p: UnscriptedProject & { type: 'SERIES' },
  projectContracts: Contract[],
  talentPool: Record<string, Talent>,
  projectAwards: Award[],
  franchiseSynergy: number,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const formatData = UNSCRIPTED_FORMATS[p.unscriptedFormat as keyof typeof UNSCRIPTED_FORMATS] || UNSCRIPTED_FORMATS['competition'];
  const eps = formatData.defaultEpisodes; 
  const currentRevenue = p.revenue + p.weeklyRevenue;
  const newWeeklyRevenue = p.weeklyRevenue * rng.range(formatData.revenueDecayWeekly - 0.05, formatData.revenueDecayWeekly + 0.05) * franchiseSynergy;
  let newState = p.state;
  let newWeeksInPhase = p.weeksInPhase;

  if (newWeeklyRevenue < 30_000 || p.weeksInPhase > eps + 2) {
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

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: p.id,
      update: {
        revenue: currentRevenue,
        weeklyRevenue: newWeeklyRevenue,
        state: newState,
        weeksInPhase: newWeeksInPhase
      }
    }
  });

  return impacts;
}
