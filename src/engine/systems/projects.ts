import { Project, Contract, Talent, Award, SeriesProject, UnscriptedProject, StateImpact, MarketingCampaign } from '@/engine/types';
import { TalentSystem } from './TalentSystem';
import { isFilmProject, isSeriesProject, isUnscriptedProject } from '../utils/projectUtils';
import { RandomGenerator } from '../utils/rng';
import { ReviewSystem } from './ReviewSystem';
import { getAttachedTalent } from '../utils/talentHelpers';
import {
  handleDevelopmentPhase,
  handleFilmReleaseEntry,
  handleFilmReleasedPhase,
  handleTVReleaseEntry,
  handleTVReleasedPhase,
  handleUnscriptedReleaseEntry,
  handleUnscriptedReleasedPhase,
  handlePostReleasePhase,
  handleMarketingPhase,
  executeMarketing
} from './projectHandlers';

export function handleReleasePhaseEntry(
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
  const attachedTalent = getAttachedTalent(projectContracts, talentPool);
  
  // 1. Generate Review Score & Reception
  let reception = p.reception;
  let reviewScore = p.reviewScore;
  if (reception === undefined || reviewScore === undefined) {
    if (reception === undefined) {
      reception = ReviewSystem.generateReception(p, attachedTalent, rng);
    }
    reviewScore = reception.metaScore;
  }

  // 2. Use appropriate release handler based on project type
  if (isFilmProject(p)) {
    const releaseImpacts = handleFilmReleaseEntry(p, currentWeek, studioPrestige, projectContracts, talentPool, rng, franchiseSynergy, franchiseFatigue);
    // Add reception data to the project update
    if (releaseImpacts.length > 0 && releaseImpacts[0].type === 'PROJECT_UPDATED') {
      releaseImpacts[0].payload.update = {
        ...releaseImpacts[0].payload.update,
        reception,
        reviewScore
      };
    }
    return releaseImpacts;
  } else if (isSeriesProject(p)) {
    const releaseImpacts = handleTVReleaseEntry(p as SeriesProject, currentWeek, franchiseSynergy, franchiseFatigue);
    if (releaseImpacts.length > 0 && releaseImpacts[0].type === 'PROJECT_UPDATED') {
      releaseImpacts[0].payload.update = {
        ...releaseImpacts[0].payload.update,
        reception,
        reviewScore
      };
    }
    return releaseImpacts;
  } else if (isUnscriptedProject(p)) {
    const releaseImpacts = handleUnscriptedReleaseEntry(p as UnscriptedProject & { type: 'SERIES' }, currentWeek, franchiseSynergy, franchiseFatigue);
    if (releaseImpacts.length > 0 && releaseImpacts[0].type === 'PROJECT_UPDATED') {
      releaseImpacts[0].payload.update = {
        ...releaseImpacts[0].payload.update,
        reception,
        reviewScore
      };
    }
    return releaseImpacts;
  }
  
  // Fallback for other project types
  const weeklyRevenue = (p.budget * 0.1) * (p.buzz / 50) * franchiseSynergy * (1 - franchiseFatigue);
  
  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: p.id,
      update: {
        state: 'released',
        weeksInPhase: 0,
        releaseWeek: currentWeek,
        revenue: weeklyRevenue,
        weeklyRevenue,
        reception,
        reviewScore
      }
    }
  });
  
  return impacts;
}


function handleReleasedPhase(
  p: Project,
  projectContracts: Contract[],
  talentPool: Record<string, Talent>,
  rivalStrengthAvg: number,
  projectAwards: Award[],
  rng: RandomGenerator,
  trendMultiplier: number = 1.0,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0
): StateImpact[] {
  if (isSeriesProject(p)) {
    return handleTVReleasedPhase(p, projectContracts, talentPool, projectAwards, franchiseSynergy, rng);
  } else if (isUnscriptedProject(p)) {
    return handleUnscriptedReleasedPhase(p as any, projectContracts, talentPool, projectAwards, franchiseSynergy, rng);
  } else if (isFilmProject(p)) {
    return handleFilmReleasedPhase(p, projectContracts, talentPool, rivalStrengthAvg, projectAwards, rng, trendMultiplier, franchiseSynergy, franchiseFatigue);
  } else {
    // Fallback for other project types
    const impacts: StateImpact[] = [];
    const currentRevenue = (p.revenue || 0) + (p.weeklyRevenue || 0);
    const newWeeklyRevenue = (p.weeklyRevenue || 0) * rng.range(0.6, 0.8) * franchiseSynergy;

    if (newWeeklyRevenue < 50_000 || (p.weeksInPhase || 0) > 4) {
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
}


export function executeGreenlight(project: Project): { project: Project; update: string } {
  const p = { ...project, state: 'production' as const, weeksInPhase: 0 };
  return {
    project: p,
    update: `"${project.title}" receives full greenlight and enters production.`
  };
}

export function executePitching(
  project: Project,
  buyerName: string,
  contractType: string
): { project: Project; update: string } {
  const p = { ...project, state: 'production' as const, weeksInPhase: 0 };
  return {
    project: p,
    update: `${buyerName} officially picks up "${project.title}" on a ${contractType} deal.`
  };
}

export function advanceProject(
  project: Project,
  currentWeek: number,
  studioPrestige: number,
  projectContracts: Contract[],
  talentPool: Record<string, Talent>,
  rng: RandomGenerator,
  rivalStrengthAvg: number = 50,
  projectAwards: Award[] = [],
  trendMultiplier: number = 1.0,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0
): StateImpact[] {
  if (project.state === 'archived') return [];

  const impacts: StateImpact[] = [];
  const newWeeksInPhase = project.weeksInPhase + 1;

  // Update marketing weeks if in marketing phase
  let marketingCampaignUpdate: any = undefined;
  if (project.state === 'marketing' && project.marketingCampaign) {
    marketingCampaignUpdate = {
      ...project.marketingCampaign,
      weeksInMarketing: (project.marketingCampaign.weeksInMarketing || 0) + 1
    };
  }

  // Handle phase transitions
  if (project.state === 'development' && newWeeksInPhase >= (project.developmentWeeks || 4)) {
    impacts.push(...handleDevelopmentPhase(project));
  } else if (project.state === 'production' && newWeeksInPhase >= (project.productionWeeks || 20)) {
    impacts.push(...handleMarketingPhase(project, talentPool, projectContracts, rng));
  } else if (project.state === 'released') {
    impacts.push(...handleReleasedPhase(project, projectContracts, talentPool, rivalStrengthAvg, projectAwards, rng, trendMultiplier, franchiseSynergy, franchiseFatigue));
  } else if (project.state === 'post_release') {
    impacts.push(...handlePostReleasePhase(project, rng));
  }

  // Buzz drift during active phases
  if (project.state === 'development' || project.state === 'production') {
    const attachedTalent = getAttachedTalent(projectContracts, talentPool);
    let talentBuzzBonus = 0;
    for (let i = 0; i < attachedTalent.length; i++) {
      talentBuzzBonus += attachedTalent[i].draw / 50;
    }
    const roll = rng.rangeInt(-4, 6);
    const newBuzz = Math.max(0, Math.min(100, project.buzz + roll + talentBuzzBonus));
    
    impacts.push({
      type: 'PROJECT_UPDATED',
      payload: {
        projectId: project.id,
        update: {
          weeksInPhase: newWeeksInPhase,
          buzz: newBuzz,
          marketingCampaign: marketingCampaignUpdate
        }
      }
    });
  } else {
    // Just advance weeksInPhase for other phases
    impacts.push({
      type: 'PROJECT_UPDATED',
      payload: {
        projectId: project.id,
        update: {
          weeksInPhase: newWeeksInPhase,
          marketingCampaign: marketingCampaignUpdate
        }
      }
    });
  }

  return impacts;
}