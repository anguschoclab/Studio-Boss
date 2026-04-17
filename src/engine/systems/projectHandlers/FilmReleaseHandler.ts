import { Project, Contract, Talent, StateImpact } from '@/engine/types';
import { calculateOpeningWeekend, simulateWeeklyBoxOffice } from '../releaseSimulation';
import { TalentSystem } from '../TalentSystem';
import { RandomGenerator } from '../../utils/rng';
import { isFilmProject } from '../../utils/projectUtils';

export function handleFilmReleaseEntry(
  p: Project,
  currentWeek: number,
  studioPrestige: number,
  projectContracts: Contract[],
  talentPool: Record<string, Talent>,
  rng: RandomGenerator,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0
): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  // Get attached talent
  const attachedTalent: Talent[] = [];
  for (let i = 0; i < projectContracts.length; i++) {
    const t = talentPool[projectContracts[i].talentId];
    if (t) attachedTalent.push(t);
  }
  
  const result = calculateOpeningWeekend(p, attachedTalent, studioPrestige, rng, franchiseSynergy, franchiseFatigue);
  const projectUpdate: Partial<Project> = {
    ...result.project,
    state: 'released',
    weeksInPhase: 0,
    releaseWeek: currentWeek,
    revenue: 0
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

export function handleFilmReleasedPhase(
  p: Project,
  projectContracts: Contract[],
  talentPool: Record<string, Talent>,
  rivalStrengthAvg: number,
  projectAwards: any[],
  rng: RandomGenerator,
  trendMultiplier: number = 1.0,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currentRevenue = p.revenue + p.weeklyRevenue;
  const newWeeklyRevenue = simulateWeeklyBoxOffice(p, p.weeksInPhase, p.reviewScore || 50, p.weeklyRevenue, rivalStrengthAvg, trendMultiplier, franchiseSynergy, franchiseFatigue);
  
  if (newWeeklyRevenue < 100_000 || p.weeksInPhase > 12) {
    const attachedTalent: Talent[] = [];
    for (let i = 0; i < projectContracts.length; i++) {
      const t = talentPool[projectContracts[i].talentId];
      if (t) attachedTalent.push(t);
    }
    
    const talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, talentPool, projectAwards);
    talentUpdates.forEach(t => {
      impacts.push({
        type: 'TALENT_UPDATED',
        payload: { talentId: t.id, update: t }
      });
    });
    
    impacts.push({
      type: 'PROJECT_UPDATED',
      payload: {
        projectId: p.id,
        update: {
          revenue: currentRevenue,
          weeklyRevenue: newWeeklyRevenue,
          state: 'post_release',
          weeksInPhase: 0
        }
      }
    });
  } else {
    impacts.push({
      type: 'PROJECT_UPDATED',
      payload: {
        projectId: p.id,
        update: {
          revenue: currentRevenue,
          weeklyRevenue: newWeeklyRevenue
        }
      }
    });
  }
  
  return impacts;
}
