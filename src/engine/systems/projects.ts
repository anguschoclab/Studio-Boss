import { Project, Contract, Talent, Award, MarketingCampaign, SeriesProject, UnscriptedProject, StateImpact } from '@/engine/types';
import { TalentSystem } from './TalentSystem';
import { calculateReviewScore, calculateOpeningWeekend, simulateWeeklyBoxOffice } from './releaseSimulation';
import { isFilmProject, isSeriesProject, isUnscriptedProject } from '../utils/projectUtils';
import { TV_FORMATS } from '../data/tvFormats';
import { UNSCRIPTED_FORMATS } from '../data/unscriptedFormats';
import { TalentMoraleSystem } from './talent/TalentMoraleSystem';
import { RandomGenerator } from '../utils/rng';
import { ReviewSystem } from './ReviewSystem';

function getAttachedTalent(contracts: Contract[], talentPool: Record<string, Talent>): Talent[] {
  const acc: Talent[] = [];
  for (let i = 0; i < contracts.length; i++) {
    const t = talentPool[contracts[i].talentId];
    if (t) acc.push(t);
  }
  return acc;
}

function handleDevelopmentPhase(p: Project): StateImpact[] {
  const impacts: StateImpact[] = [];
  let newState: string;
  if (p.format === 'tv' || p.format === 'unscripted') {
    newState = 'pitching';
  } else {
    newState = 'needs_greenlight';
  }
  
  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: p.id,
      update: {
        state: newState as any,
        weeksInPhase: 0
      }
    }
  });
  
  return impacts;
}

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

  // 2. Simulate Opening (Film vs TV)
  let weeklyRevenue = 0;
  let updateText: string;
  
  if (isFilmProject(p)) {
    const result = calculateOpeningWeekend(p, attachedTalent, studioPrestige, rng, franchiseSynergy, franchiseFatigue);
    const projectUpdate: Partial<Project> = {
      ...result.project,
      state: 'released',
      weeksInPhase: 0,
      releaseWeek: currentWeek,
      revenue: 0,
      reception,
      reviewScore
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
  
  // TV and Unscripted projects
  if (p.format === 'tv' || p.format === 'unscripted') {
    const isTV = p.format === 'tv';
    const currentSeason = isTV ? ((p as SeriesProject).tvDetails?.currentSeason || 1) : 1;
    weeklyRevenue = (p.budget * (isTV ? 0.1 : 0.05)) * (p.buzz / 50) * franchiseSynergy * (1 - franchiseFatigue); 
    updateText = isTV ? `"${p.title}" Season ${currentSeason} premieres!` : `"${p.title}" premieres!`;
  } else {
    // Fallback for other project types
    const projectAny = p as any;
    weeklyRevenue = (projectAny.budget * 0.1) * (projectAny.buzz / 50) * franchiseSynergy * (1 - franchiseFatigue); 
    updateText = `"${projectAny.title}" has been released.`;
  }

  const projectUpdate: Partial<Project> = {
    state: 'released',
    weeksInPhase: 0,
    releaseWeek: currentWeek,
    revenue: weeklyRevenue,
    weeklyRevenue,
    reception,
    reviewScore
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

function handleReleasedSeries(
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
  let updateText: string | null = null;
  let episodesAired = p.tvDetails.episodesAired || 0;

  if (p.releaseModel === 'binge') {
    newWeeklyRevenue *= rng.range(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1) * franchiseSynergy;

    if (newWeeklyRevenue < 50_000 || p.weeksInPhase > 8) {
      newState = 'post_release';
      newWeeksInPhase = 0;
      updateText = `"${p.title}" Season ${currentSeason} finishes its run.`;
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
      updateText = `"${p.title}" Season ${currentSeason} Part 2 drops!`;
    } else if (p.weeksInPhase > part2DropWeek) {
      newWeeklyRevenue *= rng.range(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1) * franchiseSynergy;
    } else {
      newWeeklyRevenue *= rng.range(0.6, 0.8) * franchiseSynergy;
    }

    if (p.weeksInPhase > part2DropWeek + 6 && newWeeklyRevenue < 50_000) {
      newState = 'post_release';
      newWeeksInPhase = 0;
      updateText = `"${p.title}" Season ${currentSeason} finishes its run.`;
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
        updateText = `"${p.title}" Season ${currentSeason} airs its finale!`;
        newWeeklyRevenue *= 1.3 * franchiseSynergy;
      }
    } else {
      newWeeklyRevenue *= 0.6 * franchiseSynergy;
      if (newWeeklyRevenue < 50_000 || p.weeksInPhase > eps + 4) {
        newState = 'post_release';
        newWeeksInPhase = 0;
        updateText = `"${p.title}" Season ${currentSeason} finishes its run.`;
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

function handleReleasedUnscripted(
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
  let updateText: string | null = null;

  if (newWeeklyRevenue < 30_000 || p.weeksInPhase > eps + 2) {
    newState = 'post_release';
    newWeeksInPhase = 0;
    updateText = `"${p.title}" concludes its broadcast.`;
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
    return handleReleasedSeries(p, projectContracts, talentPool, projectAwards, franchiseSynergy, rng);
  } else if (isUnscriptedProject(p)) {
    return handleReleasedUnscripted(p, projectContracts, talentPool, projectAwards, franchiseSynergy, rng);
  } else if (isFilmProject(p)) {
    const impacts: StateImpact[] = [];
    const currentRevenue = p.revenue + p.weeklyRevenue;
    const newWeeklyRevenue = simulateWeeklyBoxOffice(p, p.weeksInPhase, p.reviewScore || 50, p.weeklyRevenue, rivalStrengthAvg, trendMultiplier, franchiseSynergy, franchiseFatigue);
    
    let trendText = "";
    if (trendMultiplier > 1.0) {
      const boost = Math.round((trendMultiplier - 1.0) * 100);
      trendText = ` (+${boost}% from trends!)`;
    } else if (trendMultiplier < 1.0) {
      const penalty = Math.round((1.0 - trendMultiplier) * 100);
      trendText = ` (-${penalty}% from stale content.)`;
    }

    if (newWeeklyRevenue < 100_000 || p.weeksInPhase > 12) {
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
  } else {
    const impacts: StateImpact[] = [];
    const projectAny = p as any;
    const currentRevenue = (projectAny.revenue || 0) + (projectAny.weeklyRevenue || 0);
    const newWeeklyRevenue = (projectAny.weeklyRevenue || 0) * rng.range(0.6, 0.8) * franchiseSynergy;

    if (newWeeklyRevenue < 50_000 || p.weeksInPhase > 4) {
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
          projectId: projectAny.id,
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
          projectId: projectAny.id,
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

function handlePostReleasePhase(p: Project, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  let weeklyAncillary = 0;
  let updateText: string | null = null;

  const isFamilyOrAnim = p.genre === 'Family' || p.genre === 'Animation';
  const isPrestige = (p as any).genre === 'Drama' || (p as any).targetAudience === 'Prestige / Critics';
  const projectAny = p as any;

  if (p.weeksInPhase === 1) {
    if (isPrestige && (p.reviewScore || 0) > 80) {
      weeklyAncillary = projectAny.budget * rng.range(0.5, 1.5);
      updateText = `A fierce bidding war erupts for the streaming rights to "${projectAny.title}"!`;
    } else if (p.format === 'film') {
      weeklyAncillary = projectAny.revenue * rng.range(0.1, 0.3);
      updateText = `"${projectAny.title}" drops on VOD and physical media.`;
    } else if (p.format === 'tv') {
      weeklyAncillary = projectAny.revenue * rng.range(0.05, 0.15);
      updateText = (isSeriesProject(p) && (p as any).releaseModel === 'binge') ? `"${projectAny.title}" continues to trend on streaming.` : `"${projectAny.title}" becomes available in its entirety on streaming.`;
    } else if (p.format === 'unscripted') {
      weeklyAncillary = projectAny.revenue * rng.range(0.02, 0.08);
      updateText = `"${projectAny.title}" begins its long-tail streaming and syndication run.`;
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

function handleMarketingPhase(p: Project, talentPool: Record<string, Talent>, projectContracts: Contract[], rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  let newBuzz = p.buzz;
  
  // Auteur Friction Logic
  if (p.activeCut === 'sanitized') {
    const directorContract = projectContracts.find(c => c.role === 'director');
    if (directorContract) {
      const director = talentPool[directorContract.talentId];
      if (director && director.directorArchetype === 'auteur') {
        // 80% chance of a scandal if an auteur is sanitized
        if (rng.next() < 0.8) {
          impacts.push({
            type: 'SCANDAL_ADDED',
            payload: {
              scandal: {
                id: rng.uuid('SND'),
                type: 'director_speaks_out' as any,
                talentId: director.id,
                severity: 70,
                description: `Renowned director ${director.name} has publically disowned the studio's "sanitized" cut of "${p.title}", claiming their creative vision was compromised for commercial gain.`,
                isPublic: true,
                weekDiscovered: 0 // Will be set by reducer
              }
            }
          });
          newBuzz = Math.max(0, p.buzz - 15); // Negative buzz from controversy
        }
      }
    }
  }

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: p.id,
      update: {
        state: 'marketing',
        weeksInPhase: 0,
        buzz: newBuzz
      }
    }
  });

  return impacts;
}

export function executeMarketing(
  project: Project,
  campaign: MarketingCampaign
): { project: Project } {
  const p = { 
    ...project, 
    marketingCampaign: {
      ...campaign,
      weeksInMarketing: 1 // Starts at week 1
    } 
  };
  return { project: p };
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
