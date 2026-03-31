import { Project, Contract, Talent, Award, MarketingCampaign } from '@/engine/types';
import { BUDGET_TIERS } from '../data/budgetTiers';
import { TV_FORMATS } from '../data/tvFormats';
import { UNSCRIPTED_FORMATS } from '../data/unscriptedFormats';
import { clamp, randRange } from '../utils';
import { TalentSystem } from './TalentSystem';
import { calculateReviewScore, calculateOpeningWeekend, simulateWeeklyBoxOffice } from './releaseSimulation';
import { calculateRegionalPenalties } from './ratings';
import { calculateAudienceIndex } from './demographics';
import { GameState, WeekSummary, Headline } from '@/engine/types';
import { groupContractsByProject } from '../utils';
import { checkAndTriggerCrisis } from './crises';
import { calculateBoxOfficeRanks, BoxOfficeEntry } from './releaseSimulation';
import { generateAwardsProfile } from './awards';
import { processDirectorDisputes } from './directors';
import { getTrendMultiplier } from './trends';
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
    p.reviewScore = calculateReviewScore(p, attachedTalent, p.activeCrisis);
  }

  // 2. Simulate Opening (Film vs TV)
  let update: string | null = null;

  if (p.format === 'film') {
    const result = calculateOpeningWeekend(p, attachedTalent, studioPrestige, franchiseSynergy, franchiseFatigue);
    // Replace p with the updated project from result
    Object.assign(p, result.project);
    update = result.feedback;
  } else {
    // TV/Unscripted logic (simplified for now)
    p.weeklyRevenue = (p.budget * 0.1) * (p.buzz / 50) * franchiseSynergy * (1 - franchiseFatigue); 
    p.revenue = p.weeklyRevenue;
    update = `"${p.title}" Season ${((p as any).tvDetails)?.currentSeason || 1} premieres!`;
  }

  return { update, talentUpdates: [] };
}

function handleReleasedPhase(
  p: Project,
  projectContracts: Contract[],
  talentPoolMap: Map<string, Talent>,
  rivalStrengthAvg: number,
  projectAwards: Award[],
  trendMultiplier: number = 1.0,
  franchiseSynergy: number = 1.0
): { update: string | null; talentUpdates: Talent[] } {
  p.revenue += p.weeklyRevenue;
  let update: string | null = null;
  let talentUpdates: Talent[] = [];

  if ((p.format === 'tv' && ((p as any).tvFormat)) || (p.format === 'unscripted' && ((p as any).unscriptedFormat))) {
    const formatData = p.format === 'tv' ? TV_FORMATS[((p as any).tvFormat)!] : UNSCRIPTED_FORMATS[((p as any).unscriptedFormat)!];
    const eps = ((p as any).tvDetails)?.episodesOrdered || formatData.defaultEpisodes;
    const currentSeason = ((p as any).tvDetails)?.currentSeason || 1;

    if (((p as any).releaseModel) === 'binge') {
      p.weeklyRevenue *= randRange(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1) * franchiseSynergy;

      if (p.weeklyRevenue < 50_000 || p.weeksInPhase > 8) {
        p.state = 'post_release';
        p.weeksInPhase = 0;
        update = `"${p.title}" Season ${currentSeason} finishes its run.`;
        talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), projectAwards);
      }
    } else if (((p as any).releaseModel) === 'split') {
      const part2DropWeek = Math.ceil(eps / 2) + 2;

      if (p.weeksInPhase === part2DropWeek) {
        if (((p as any).tvDetails)) ((p as any).tvDetails).episodesAired = eps;
        p.weeklyRevenue *= 2.5 * franchiseSynergy;
        update = `"${p.title}" Season ${currentSeason} Part 2 drops!`;
      } else if (p.weeksInPhase > part2DropWeek) {
        p.weeklyRevenue *= randRange(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1) * franchiseSynergy;
      } else {
        p.weeklyRevenue *= randRange(0.6, 0.8) * franchiseSynergy;
      }

      if (p.weeksInPhase > part2DropWeek + 6 && p.weeklyRevenue < 50_000) {
        p.state = 'post_release';
        p.weeksInPhase = 0;
        update = `"${p.title}" Season ${currentSeason} finishes its run.`;
        talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), projectAwards);
      }
    } else {
      const episodesReleased = ((p as any).tvDetails)?.episodesAired || 0;
      if (((p as any).tvDetails) && episodesReleased < eps) {
        ((p as any).tvDetails).episodesAired += 1;
        p.weeklyRevenue *= randRange(formatData.revenueDecayWeekly - 0.05, formatData.revenueDecayWeekly + 0.05) * franchiseSynergy;

        if (((p as any).tvDetails).episodesAired === eps) {
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
  } else {
    p.weeklyRevenue = simulateWeeklyBoxOffice(p, p.weeksInPhase, p.reviewScore || 50, p.weeklyRevenue, rivalStrengthAvg, trendMultiplier, franchiseSynergy);
    
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
      update = `"${p.title}" completes its theatrical run — total gross: ${(p.revenue / 1_000_000).toFixed(1)}M${trendText}`;
      talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), projectAwards);
    } else {
      update = `"${p.title}" grossed ${(p.weeklyRevenue / 1_000_000).toFixed(1)}M this week.${trendText}`;
    }
  }

  return { update, talentUpdates };
}

function handlePostReleasePhase(p: Project): { update: string | null; talentUpdates: Talent[] } {
  let update: string | null = null;
  let weeklyAncillary = 0;

  const isFamilyOrAnim = p.genre === 'Family' || p.genre === 'Animation';
  const isPrestige = p.genre === 'Drama' || p.targetAudience === 'Prestige / Critics';

  if (p.weeksInPhase === 1) {
    if (isPrestige && (p.reviewScore || 0) > 80) {
      weeklyAncillary = p.budget * randRange(0.5, 1.5);
      update = `A fierce bidding war erupts for the streaming rights to "${p.title}"!`;
    } else if (p.format === 'film') {
      weeklyAncillary = p.revenue * randRange(0.1, 0.3);
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

function handleMarketingPhase(p: Project): { update: string | null; talentUpdates: Talent[] } {
  p.state = 'marketing';
  p.weeksInPhase = 0;
  return { update: `"${p.title}" has wrapped production and is ready for marketing strategy.`, talentUpdates: [] };
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
  rivalStrengthAvg: number = 50,
  projectAwards: Award[] = [],
  trendMultiplier: number = 1.0,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0,
  rng?: RandomGenerator
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

  if (p.state === 'development' && p.weeksInPhase >= p.developmentWeeks) {
    const result = handleDevelopmentPhase(p);
    update = result.update;
  } else if (p.state === 'production' && p.weeksInPhase >= p.productionWeeks) {
    const result = handleMarketingPhase(p);
    update = result.update;
  } else if (p.state === 'released') {
    const result = handleReleasedPhase(p, projectContracts, talentPoolMap, rivalStrengthAvg, projectAwards, trendMultiplier, franchiseSynergy);
    update = result.update;
    if (result.talentUpdates) talentUpdates = result.talentUpdates;
  } else if (p.state === 'post_release') {
    const result = handlePostReleasePhase(p);
    update = result.update;
  }

  // Buzz drift during active phases
  if (p.state === 'development' || p.state === 'production') {
    const attachedTalent = getAttachedTalent(projectContracts, talentPoolMap);
    let talentBuzzBonus = 0;
    for (let i = 0; i < attachedTalent.length; i++) {
      talentBuzzBonus += attachedTalent[i].draw / 50;
    }
    const roll = rng ? rng.rangeInt(-4, 6) : randRange(-4, 6);
    p.buzz = clamp(p.buzz + roll + talentBuzzBonus, 0, 100);
  }

  return { project: p, update, talentUpdates };
}
