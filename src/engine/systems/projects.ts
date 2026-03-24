import { Project, Contract, TalentProfile, Award } from '../types';
import { BUDGET_TIERS } from '../data/budgetTiers';
import { TV_FORMATS } from '../data/tvFormats';
import { UNSCRIPTED_FORMATS } from '../data/unscriptedFormats';
import { clamp, randRange } from '../utils';
import { TalentSystem } from './TalentSystem';
import { generateReviewScore, simulateWeeklyBoxOffice } from './releaseSimulation';
import { calculateRegionalPenalties } from './ratings';
import { calculateAudienceIndex } from './demographics';
import { GameState, WeekSummary, Headline } from '../types';
import { groupContractsByProject } from '../utils';
import { checkAndTriggerCrisis } from './crises';
import { calculateBoxOfficeRanks, BoxOfficeEntry } from './releaseSimulation';
import { generateAwardsProfile } from './awards';
import { processDirectorDisputes } from './directors';
import { getTrendMultiplier } from './trends';

function getAttachedTalent(contracts: Contract[], talentPoolMap: Map<string, TalentProfile>): TalentProfile[] {
  const acc: TalentProfile[] = [];
  for (let i = 0; i < contracts.length; i++) {
    const t = talentPoolMap.get(contracts[i].talentId);
    if (t) acc.push(t);
  }
  return acc;
}

function handleDevelopmentPhase(p: Project): { update: string | null; talentUpdates: TalentProfile[] } {
  let update: string | null;
  if (p.format === 'tv' || p.format === 'unscripted') {
    p.status = 'pitching';
    p.weeksInPhase = 0;
    update = `"${p.title}" is ready to be pitched to networks/streamers.`;
  } else {
    p.status = 'needs_greenlight';
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
  talentPoolMap: Map<string, TalentProfile>
): { update: string | null; talentUpdates: TalentProfile[] } {
  p.status = 'released';
  p.weeksInPhase = 0;
  p.releaseWeek = currentWeek;
  p.revenue = 0;

  const tier = BUDGET_TIERS[p.budgetTier];
  const [minRev, maxRev] = tier.revenueRange;
  const buzzFactor = p.buzz / 100;
  const prestigeFactor = 0.5 + studioPrestige / 200;
  const randomFactor = randRange(0.7, 1.3);

  const attachedTalent = getAttachedTalent(projectContracts, talentPoolMap);
  if (p.reviewScore === undefined) {
    p.reviewScore = generateReviewScore(p, attachedTalent, p.activeCrisis);
  }
  let talentDrawFactor = 1;
  for (let i = 0; i < attachedTalent.length; i++) {
    talentDrawFactor += attachedTalent[i].draw / 100;
  }

  // Sprint H & I: Regional Censorship and Demographic Penetration
  const regionalMultiplier = calculateRegionalPenalties(p);
  const demographicMultiplier = p.targetDemographic ? calculateAudienceIndex(p, p.targetDemographic) : 1.0;

  const baseGross = (minRev + (maxRev - minRev) * buzzFactor * prestigeFactor * randomFactor) * talentDrawFactor * regionalMultiplier * demographicMultiplier;

  let update: string | null;

  if ((p.format === 'tv' && p.tvFormat) || (p.format === 'unscripted' && p.unscriptedFormat)) {
    p.episodesReleased = 0;
    const formatData = p.format === 'tv' ? TV_FORMATS[p.tvFormat!] : UNSCRIPTED_FORMATS[p.unscriptedFormat!];
    const eps = p.episodes || formatData.defaultEpisodes;
    const episodeMultiplier = Math.sqrt(eps / 10);
    const totalTvGross = baseGross * episodeMultiplier;

    if (p.releaseModel === 'binge') {
      p.weeklyRevenue = totalTvGross * 0.6;
      p.episodesReleased = eps;
      update = `"${p.title}" Season ${p.season} drops! Huge binge viewership.`;
    } else if (p.releaseModel === 'split') {
      p.weeklyRevenue = totalTvGross * 0.35;
      p.episodesReleased = Math.ceil(eps / 2);
      update = `"${p.title}" Season ${p.season} Part 1 premieres!`;
    } else {
      p.weeklyRevenue = (totalTvGross * 0.15);
      p.episodesReleased = 1;
      update = `"${p.title}" Season ${p.season} premieres its first episode!`;
    }
  } else {
    p.weeklyRevenue = baseGross * 0.35;
    const strength = p.weeklyRevenue > baseGross * 0.25 ? 'strong' : 'modest';
    update = `"${p.title}" releases to a ${strength} opening!`;
  }

  return { update, talentUpdates: [] };
}

function handleReleasedPhase(
  p: Project,
  projectContracts: Contract[],
  talentPoolMap: Map<string, TalentProfile>,
  rivalStrengthAvg: number,
  awards: Award[],
  trendMultiplier: number = 1.0
): { update: string | null; talentUpdates: TalentProfile[] } {
  p.revenue += p.weeklyRevenue;
  let update: string | null = null;
  let talentUpdates: TalentProfile[] = [];

  if ((p.format === 'tv' && p.tvFormat) || (p.format === 'unscripted' && p.unscriptedFormat)) {
    const formatData = p.format === 'tv' ? TV_FORMATS[p.tvFormat!] : UNSCRIPTED_FORMATS[p.unscriptedFormat!];
    const eps = p.episodes || formatData.defaultEpisodes;

    if (p.releaseModel === 'binge') {
      p.weeklyRevenue *= randRange(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1);

      if (p.weeklyRevenue < 50_000 || p.weeksInPhase > 8) {
        p.status = 'post_release';
        p.weeksInPhase = 0;
        update = `"${p.title}" Season ${p.season} finishes its run.`;
        talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), awards);
      }
    } else if (p.releaseModel === 'split') {
      const part2DropWeek = Math.ceil(eps / 2) + 2;

      if (p.weeksInPhase === part2DropWeek) {
        p.episodesReleased = eps;
        p.weeklyRevenue *= 2.5;
        update = `"${p.title}" Season ${p.season} Part 2 drops!`;
      } else if (p.weeksInPhase > part2DropWeek) {
        p.weeklyRevenue *= randRange(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1);
      } else {
        p.weeklyRevenue *= randRange(0.6, 0.8);
      }

      if (p.weeksInPhase > part2DropWeek + 6 && p.weeklyRevenue < 50_000) {
        p.status = 'post_release';
        p.weeksInPhase = 0;
        update = `"${p.title}" Season ${p.season} finishes its run.`;
        talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), awards);
      }
    } else {
      if (p.episodesReleased !== undefined && p.episodesReleased < eps) {
        p.episodesReleased += 1;
        p.weeklyRevenue *= randRange(formatData.revenueDecayWeekly - 0.05, formatData.revenueDecayWeekly + 0.05);

        if (p.episodesReleased === eps) {
          update = `"${p.title}" Season ${p.season} airs its finale!`;
          p.weeklyRevenue *= 1.3;
        }
      } else {
        p.weeklyRevenue *= 0.6;
        if (p.weeklyRevenue < 50_000 || p.weeksInPhase > eps + 4) {
          p.status = 'post_release';
          p.weeksInPhase = 0;
          update = `"${p.title}" Season ${p.season} finishes its run.`;
          talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), awards);
        }
      }
    }
  } else {
    p.weeklyRevenue = simulateWeeklyBoxOffice(p, p.weeksInPhase, p.reviewScore || 50, p.weeklyRevenue, rivalStrengthAvg, trendMultiplier);
    if (p.weeklyRevenue < 100_000 || p.weeksInPhase > 12) {
      p.status = 'post_release';
      p.weeksInPhase = 0;
      update = `"${p.title}" completes its theatrical run — total gross: ${(p.revenue / 1_000_000).toFixed(1)}M`;
      talentUpdates = TalentSystem.applyProjectResults(p, projectContracts, Array.from(talentPoolMap.values()), awards);
    }
  }

  return { update, talentUpdates };
}

function handlePostReleasePhase(p: Project): { update: string | null; talentUpdates: TalentProfile[] } {
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
    p.status = 'archived';
  }

  return { update, talentUpdates: [] };
}

function handleMarketingPhase(p: Project): { update: string | null; talentUpdates: TalentProfile[] } {
  p.status = 'marketing';
  p.weeksInPhase = 0;
  return { update: `"${p.title}" has wrapped production and is ready for marketing strategy.`, talentUpdates: [] };
}

export function executeMarketing(
  project: Project,
  budget: number,
  domesticPct: number,
  angle: string
): { project: Project } {
  const p = { ...project };
  p.marketingBudget = budget;
  p.marketingDomesticSplit = domesticPct;
  p.marketingAngle = angle;

  // Marketing effectiveness
  let buzzBonus = Math.floor(budget / 100000) * 0.1;
  if (budget >= p.budget * 0.5) buzzBonus += 10;
  if (budget >= p.budget) buzzBonus += 20;

  const genreToAngle: Record<string, string[]> = {
    'Action': ['spectacle', 'thrills'],
    'Comedy': ['humor'],
    'Drama': ['prestige', 'romance'],
    'Horror': ['thrills', 'mystery'],
    'Sci-Fi': ['spectacle', 'mystery'],
    'Romance': ['romance'],
  };

  const matched = genreToAngle[p.genre]?.includes(angle) ? 15 : -10;
  buzzBonus += matched;

  p.buzz = Math.min(100, Math.max(0, p.buzz + buzzBonus));
  return { project: p };
}

export function executeGreenlight(project: Project): { project: Project; update: string } {
  const p = { ...project, status: 'production' as const, weeksInPhase: 0 };
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
  const p = { ...project, status: 'production' as const, weeksInPhase: 0 };
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
  talentPoolMap: Map<string, TalentProfile>,
  rivalStrengthAvg: number = 50,
  awards: Award[] = [],
  trendMultiplier: number = 1.0
): { project: Project; update: string | null; talentUpdates: TalentProfile[] } {
  if (project.status === 'archived') return { project, update: null, talentUpdates: [] };

  const p = { ...project, weeksInPhase: project.weeksInPhase + 1 };
  let update: string | null = null;
  let talentUpdates: TalentProfile[] = [];

  if (p.status === 'development' && p.weeksInPhase >= p.developmentWeeks) {
    const result = handleDevelopmentPhase(p);
    update = result.update;
  } else if (p.status === 'production' && p.weeksInPhase >= p.productionWeeks) {
    const result = handleMarketingPhase(p);
    update = result.update;
  } else if (p.status === 'released') {
    const result = handleReleasedPhase(p, projectContracts, talentPoolMap, rivalStrengthAvg, awards, trendMultiplier);
    update = result.update;
    if (result.talentUpdates) talentUpdates = result.talentUpdates;
  } else if (p.status === 'post_release') {
    const result = handlePostReleasePhase(p);
    update = result.update;
  }

  // Buzz drift during active phases
  if (p.status === 'development' || p.status === 'production') {
    const attachedTalent = getAttachedTalent(projectContracts, talentPoolMap);
    let talentBuzzBonus = 0;
    for (let i = 0; i < attachedTalent.length; i++) {
      talentBuzzBonus += attachedTalent[i].draw / 50;
    }
    p.buzz = clamp(p.buzz + randRange(-4, 6) + talentBuzzBonus, 0, 100);
  }

  return { project: p, update, talentUpdates };
}


export interface ProjectAdvanceResult {
  updatedProjects: Project[];
  projectUpdates: string[];
  events: string[];
  updatedTalent: TalentProfile[];
}

export function advanceProjects(
  state: GameState,
  nextWeek: number
): ProjectAdvanceResult {
  const contractsByProject = groupContractsByProject(state.studio.internal.contracts);

  const talentPoolMap = new Map<string, TalentProfile>();
  for (const talent of state.industry.talentPool) {
    talentPoolMap.set(talent.id, talent);
  }

  const projectUpdates: string[] = [];
  const events: string[] = [];

  let rivalStrengthSum = 0;
  for (let i = 0; i < state.industry.rivals.length; i++) {
    rivalStrengthSum += state.industry.rivals[i].strength;
  }
  const rivalAvgStrength = rivalStrengthSum / Math.max(1, state.industry.rivals.length);

  const updatedProjects: Project[] = [];
  const boxOfficeEntries: BoxOfficeEntry[] = [];
  const allTalentUpdates = new Map<string, TalentProfile>();

  for (let i = 0; i < state.studio.internal.projects.length; i++) {
    const p = state.studio.internal.projects[i];

    if (p.activeCrisis && !p.activeCrisis.resolved) {
      projectUpdates.push(`"${p.title}" production is halted until the active crisis is resolved.`);
      updatedProjects.push(p);
      continue;
    }

    const projectContracts = contractsByProject.get(p.id) || [];
    const trendMult = getTrendMultiplier(p.genre, state);
    const { project, update, talentUpdates } = advanceProject(p, nextWeek, state.studio.prestige, projectContracts, talentPoolMap, rivalAvgStrength, state.industry.awards || [], trendMult);

    if (update) projectUpdates.push(update);
    talentUpdates.forEach(t => allTalentUpdates.set(t.id, t));

    if (project.status === 'released' && p.status !== 'released' && !project.awardsProfile) {
      project.awardsProfile = generateAwardsProfile(project);
    }

    if (project.status === 'production' && (!project.activeCrisis || project.activeCrisis.resolved)) {
      const newCrisis = checkAndTriggerCrisis(project);
      if (newCrisis) {
        project.activeCrisis = newCrisis;
        events.push(`CRISIS: "${project.title}" - ${newCrisis.description}`);
      }
    }

    // Director disputes
    if (project.status === 'production') {
      const dirDisputeArgs = processDirectorDisputes({ ...state, studio: { ...state.studio, internal: { ...state.studio.internal, projects: [project] } } });
      if (dirDisputeArgs.newCrises.length > 0 && (!project.activeCrisis || project.activeCrisis.resolved)) {
         project.activeCrisis = dirDisputeArgs.newCrises[0].crisis;
         projectUpdates.push(...dirDisputeArgs.updates);
      }
    }

    updatedProjects.push(project);

    if (project.status === 'released') {
      boxOfficeEntries.push({ projectId: project.id, studioName: state.studio.name, weeklyRevenue: project.weeklyRevenue });
    }
  }

  const ranks = calculateBoxOfficeRanks(boxOfficeEntries);
  for (let i = 0; i < updatedProjects.length; i++) {
    const p = updatedProjects[i];
    if (p.status === 'released' && ranks.has(p.id)) {
      p.boxOfficeRank = ranks.get(p.id);
    }
  }

  // Apply talent updates back into the full pool
  const updatedTalentPool = state.industry.talentPool.map(t => allTalentUpdates.get(t.id) || t);

  return {
    updatedProjects,
    projectUpdates,
    events,
    updatedTalent: updatedTalentPool,
  };
}
