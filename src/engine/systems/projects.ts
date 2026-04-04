import { Project, Contract, Talent, Award, MarketingCampaign, SeriesProject, UnscriptedProject } from '@/engine/types';
import { TalentSystem } from './TalentSystem';
import { calculateReviewScore, calculateOpeningWeekend, simulateWeeklyBoxOffice } from './releaseSimulation';
import { isFilmProject, isSeriesProject, isUnscriptedProject } from '../utils/projectUtils';
import { TV_FORMATS } from '../data/tvFormats';
import { UNSCRIPTED_FORMATS } from '../data/unscriptedFormats';
import { TalentMoraleSystem } from './talent/TalentMoraleSystem';
import { RandomGenerator } from '../utils/rng';

function getAttachedTalent(contracts: Contract[], talentPoolMap: Map<string, Talent>): Talent[] {
  const acc: Talent[] = [];
  for (let i = 0; i < contracts.length; i++) {
    const t = talentPoolMap.get(contracts[i].talentId);
    if (t) acc.push(t);
  }
  return acc;
}

function handleDevelopmentPhase(p: Project): { update: string | null; talentUpdates: Talent[] } {
  let update: string | null;
  if (p.format === 'tv' || p.format === 'unscripted') {
    p.state = 'pitching';
    p.weeksInPhase = 0;
    update = `"${p.title}" is ready to be pitched to networks/streamers.`;
  } else {
    p.state = 'needs_greenlight';
    p.weeksInPhase = 0;
    update = `"${p.title}" is ready for greenlight committee review.`;
  }
  return { update, talentUpdates: [] };
}

export function handleReleasePhaseEntry(
  p: Project,
  currentWeek: number,
  studioPrestige: number,
  projectContracts: Contract[],
  talentPoolMap: Map<string, Talent>,
  rng: RandomGenerator,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0
): { update: string | null; talentUpdates: Talent[] } {
  p.state = 'released';
  p.weeksInPhase = 0;
  p.releaseWeek = currentWeek;
  p.revenue = 0;

  const attachedTalent = getAttachedTalent(projectContracts, talentPoolMap);
  
  // 1. Generate Review Score
  if (p.reviewScore === undefined) {
    const rawScore = calculateReviewScore(p, attachedTalent, p.activeCrisis, rng);
    const moraleMult = TalentMoraleSystem.getQualityMultiplier(attachedTalent);
    p.reviewScore = Math.round(rawScore * moraleMult);
  }

  // 2. Simulate Opening (Film vs TV)
  if (isFilmProject(p)) {
    const result = calculateOpeningWeekend(p, attachedTalent, studioPrestige, rng, franchiseSynergy, franchiseFatigue);
    Object.assign(p, result.project);
    return { update: result.feedback, talentUpdates: [] };
  } 
  
  if (isSeriesProject(p)) {
    const currentSeason = p.tvDetails?.currentSeason || 1;
    p.weeklyRevenue = (p.budget * 0.1) * (p.buzz / 50) * franchiseSynergy * (1 - franchiseFatigue); 
    p.revenue = p.weeklyRevenue;
    return { 
      update: `"${p.title}" Season ${currentSeason} premieres!`, 
      talentUpdates: [] 
    };
  }
  
  if (isUnscriptedProject(p)) {
    p.weeklyRevenue = (p.budget * 0.1) * (p.buzz / 50) * franchiseSynergy * (1 - franchiseFatigue); 
    p.revenue = p.weeklyRevenue;
    return { 
      update: `"${p.title}" premieres!`, 
      talentUpdates: [] 
    };
  }

  // Fallback for types not yet fully handled
  return { update: `"${(p as Project).title}" has been released.`, talentUpdates: [] };
}

function handleReleasedSeries(
  p: SeriesProject,
  projectContracts: Contract[],
  talentPoolMap: Map<string, Talent>,
  projectAwards: Award[],
  franchiseSynergy: number,
  rng: RandomGenerator
): { update: string | null; talentUpdates: Talent[] } {
  p.revenue += p.weeklyRevenue;
  let update: string | null = null;
  let talentUpdates: Talent[] = [];

  const formatData = TV_FORMATS[p.tvFormat as keyof typeof TV_FORMATS] || TV_FORMATS['prestige_drama'];
  const eps = p.tvDetails.episodesOrdered || formatData.defaultEpisodes;
  const currentSeason = p.tvDetails.currentSeason || 1;

  if (p.releaseModel === 'binge') {
    p.weeklyRevenue *= rng.range(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1) * franchiseSynergy;

    if (p.weeklyRevenue < 50_000 || p.weeksInPhase > 8) {
      p.state = 'post_release';
      p.weeksInPhase = 0;
      update = `"${p.title}" Season ${currentSeason} finishes its run.`;
      talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), projectAwards);
    }
  } else if (p.releaseModel === 'split') {
    const part2DropWeek = Math.ceil(eps / 2) + 2;

    if (p.weeksInPhase === part2DropWeek) {
      p.tvDetails.episodesAired = eps;
      p.weeklyRevenue *= 2.5 * franchiseSynergy;
      update = `"${p.title}" Season ${currentSeason} Part 2 drops!`;
    } else if (p.weeksInPhase > part2DropWeek) {
      p.weeklyRevenue *= rng.range(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1) * franchiseSynergy;
    } else {
      p.weeklyRevenue *= rng.range(0.6, 0.8) * franchiseSynergy;
    }

    if (p.weeksInPhase > part2DropWeek + 6 && p.weeklyRevenue < 50_000) {
      p.state = 'post_release';
      p.weeksInPhase = 0;
      update = `"${p.title}" Season ${currentSeason} finishes its run.`;
      talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), projectAwards);
    }
  } else {
    const episodesReleased = p.tvDetails.episodesAired || 0;
    if (episodesReleased < eps) {
      p.tvDetails.episodesAired += 1;
      p.weeklyRevenue *= rng.range(formatData.revenueDecayWeekly - 0.05, formatData.revenueDecayWeekly + 0.05) * franchiseSynergy;

      if (p.tvDetails.episodesAired === eps) {
        update = `"${p.title}" Season ${currentSeason} airs its finale!`;
        p.weeklyRevenue *= 1.3 * franchiseSynergy;
      }
    } else {
      p.weeklyRevenue *= 0.6 * franchiseSynergy;
      if (p.weeklyRevenue < 50_000 || p.weeksInPhase > eps + 4) {
        p.state = 'post_release';
        p.weeksInPhase = 0;
        update = `"${p.title}" Season ${currentSeason} finishes its run.`;
        talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), projectAwards);
      }
    }
  }
  return { update, talentUpdates };
}

function handleReleasedUnscripted(
  p: UnscriptedProject & { type: 'SERIES' },
  projectContracts: Contract[],
  talentPoolMap: Map<string, Talent>,
  projectAwards: Award[],
  franchiseSynergy: number,
  rng: RandomGenerator
): { update: string | null; talentUpdates: Talent[] } {
  p.revenue += p.weeklyRevenue;
  let update: string | null = null;
  let talentUpdates: Talent[] = [];

  const formatData = UNSCRIPTED_FORMATS[p.unscriptedFormat as keyof typeof UNSCRIPTED_FORMATS] || UNSCRIPTED_FORMATS['competition'];
  const eps = formatData.defaultEpisodes; 
  
  p.weeklyRevenue *= rng.range(formatData.revenueDecayWeekly - 0.05, formatData.revenueDecayWeekly + 0.05) * franchiseSynergy;

  if (p.weeklyRevenue < 30_000 || p.weeksInPhase > eps + 2) {
    p.state = 'post_release';
    p.weeksInPhase = 0;
    update = `"${p.title}" concludes its broadcast.`;
    talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), projectAwards);
  }

  return { update, talentUpdates };
}

function handleReleasedPhase(
  p: Project,
  projectContracts: Contract[],
  talentPoolMap: Map<string, Talent>,
  rivalStrengthAvg: number,
  projectAwards: Award[],
  rng: RandomGenerator,
  trendMultiplier: number = 1.0,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0
): { update: string | null; talentUpdates: Talent[] } {
  if (isSeriesProject(p)) {
    return handleReleasedSeries(p, projectContracts, talentPoolMap, projectAwards, franchiseSynergy, rng);
  } else if (isUnscriptedProject(p)) {
    return handleReleasedUnscripted(p, projectContracts, talentPoolMap, projectAwards, franchiseSynergy, rng);
  } else if (isFilmProject(p)) {
    p.revenue += p.weeklyRevenue;
    p.weeklyRevenue = simulateWeeklyBoxOffice(p, p.weeksInPhase, p.reviewScore || 50, p.weeklyRevenue, rivalStrengthAvg, trendMultiplier, franchiseSynergy, franchiseFatigue);
    
    let trendText = "";
    if (trendMultiplier > 1.0) {
      const boost = Math.round((trendMultiplier - 1.0) * 100);
      trendText = ` (+${boost}% from trends!)`;
    } else if (trendMultiplier < 1.0) {
      const penalty = Math.round((1.0 - trendMultiplier) * 100);
      trendText = ` (-${penalty}% from stale content.)`;
    }

    if (p.weeklyRevenue < 100_000 || p.weeksInPhase > 12) {
      p.state = 'post_release';
      p.weeksInPhase = 0;
      return {
        update: `"${p.title}" completes its theatrical run — total gross: ${(p.revenue / 1_000_000).toFixed(1)}M${trendText}`,
        talentUpdates: TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), projectAwards)
      };
    } else {
      return {
        update: `"${p.title}" grossed ${(p.weeklyRevenue / 1_000_000).toFixed(1)}M this week.${trendText}`,
        talentUpdates: []
      };
    }
  }

  // Fallback for types not yet fully handled
  return { update: null, talentUpdates: [] };
}

function handlePostReleasePhase(p: Project, rng: RandomGenerator): { update: string | null; talentUpdates: Talent[] } {
  let update: string | null = null;
  let weeklyAncillary = 0;

  const isFamilyOrAnim = p.genre === 'Family' || p.genre === 'Animation';
  const isPrestige = p.genre === 'Drama' || p.targetAudience === 'Prestige / Critics';

  if (p.weeksInPhase === 1) {
    if (isPrestige && (p.reviewScore || 0) > 80) {
      weeklyAncillary = p.budget * rng.range(0.5, 1.5);
      update = `A fierce bidding war erupts for the streaming rights to "${p.title}"!`;
    } else if (p.format === 'film') {
      weeklyAncillary = p.revenue * rng.range(0.1, 0.3);
      update = `"${p.title}" drops on VOD and physical media.`;
    }
  } else {
    if (isFamilyOrAnim) {
      weeklyAncillary = p.revenue * 0.005;
    } else {
      weeklyAncillary = p.revenue * 0.001;
    }
    weeklyAncillary *= Math.max(0.1, 1 - (p.weeksInPhase / 52));
  }

  p.ancillaryRevenue = (p.ancillaryRevenue || 0) + weeklyAncillary;
  p.revenue += weeklyAncillary;
  p.weeklyRevenue = 0;

  if (p.weeksInPhase >= 26) {
    p.state = 'archived';
  }

  return { update, talentUpdates: [] };
}

function handleMarketingPhase(p: Project, talentPoolMap: Map<string, Talent>, projectContracts: Contract[], rng: RandomGenerator): { update: string | null; talentUpdates: Talent[]; newScandals: any[] } {
  p.state = 'marketing';
  p.weeksInPhase = 0;
  
  const newScandals: any[] = [];
  
  // Auteur Friction Logic
  if (p.activeCut === 'sanitized') {
    const directorContract = projectContracts.find(c => c.role === 'director');
    if (directorContract) {
      const director = talentPoolMap.get(directorContract.talentId);
      if (director && director.directorArchetype === 'auteur') {
        // 80% chance of a scandal if an auteur is sanitized
        if (rng.next() < 0.8) {
          newScandals.push({
            id: rng.uuid('sc-auteur'),
            type: 'director_speaks_out',
            talentId: director.id,
            severity: 70,
            headline: `${director.name} Slams Studio Over "${p.title}" Edit`,
            description: `Renowned director ${director.name} has publically disowned the studio's "sanitized" cut of "${p.title}", claiming their creative vision was compromised for commercial gain.`,
            isPublic: true,
            weekDiscovered: 0 // Will be set by reducer
          });
          p.buzz = Math.max(0, p.buzz - 15); // Negative buzz from controversy
        }
      }
    }
  }

  return { 
    update: `"${p.title}" has wrapped production and is ready for marketing strategy.`, 
    talentUpdates: [],
    newScandals
  };
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
  talentPoolMap: Map<string, Talent>,
  rng: RandomGenerator,
  rivalStrengthAvg: number = 50,
  projectAwards: Award[] = [],
  trendMultiplier: number = 1.0,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0
): { project: Project; update: string | null; talentUpdates: Talent[] } {
  if (project.state === 'archived') return { project, update: null, talentUpdates: [] };

  const p = { ...project, weeksInPhase: project.weeksInPhase + 1 };

  // Update marketing weeks if in marketing phase
  if (p.state === 'marketing' && p.marketingCampaign) {
    p.marketingCampaign = {
      ...p.marketingCampaign,
      weeksInMarketing: (p.marketingCampaign.weeksInMarketing || 0) + 1
    };
  }

  let update: string | null = null;
  let talentUpdates: Talent[] = [];

  if (p.state === 'development' && p.weeksInPhase >= (p.developmentWeeks || 4)) {
    const result = handleDevelopmentPhase(p);
    update = result.update;
  } else if (p.state === 'production' && p.weeksInPhase >= (p.productionWeeks || 20)) {
    const result = handleMarketingPhase(p, talentPoolMap, projectContracts, rng);
    update = result.update;
    if ((result as any).newScandals) {
      // In a real implementation we'd append to a return object, 
      // but here we rely on the reducer to pick up 'newScandals' on the PROJECT_UPDATED or similar if we modify the project.
      // Actually, we'll mark the project with these scandals so the reducer can process them.
      (p as any).pendingScandals = (result as any).newScandals;
    }
  } else if (p.state === 'released') {
    const result = handleReleasedPhase(p, projectContracts, talentPoolMap, rivalStrengthAvg, projectAwards, rng, trendMultiplier, franchiseSynergy, franchiseFatigue);
    update = result.update;
    if (result.talentUpdates) talentUpdates = result.talentUpdates;
  } else if (p.state === 'post_release') {
    const result = handlePostReleasePhase(p, rng);
    update = result.update;
  }

  // Buzz drift during active phases
  if (p.state === 'development' || p.state === 'production') {
    const attachedTalent = getAttachedTalent(projectContracts, talentPoolMap);
    let talentBuzzBonus = 0;
    for (let i = 0; i < attachedTalent.length; i++) {
      talentBuzzBonus += attachedTalent[i].draw / 50;
    }
    const roll = rng.rangeInt(-4, 6);
    p.buzz = Math.max(0, Math.min(100, p.buzz + roll + talentBuzzBonus));
  }

  return { project: p, update, talentUpdates };
}

