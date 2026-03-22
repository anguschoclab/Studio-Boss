import { Project, Contract, TalentProfile, Award } from '../types';
import { BUDGET_TIERS } from '../data/budgetTiers';
import { TV_FORMATS } from '../data/tvFormats';
import { UNSCRIPTED_FORMATS } from '../data/unscriptedFormats';
import { clamp, randRange } from '../utils';
import { updateTalentStats } from './talentStats';
import { generateReviewScore, simulateWeeklyBoxOffice } from './releaseSimulation';

function getAttachedTalent(contracts: Contract[], talentPoolMap: Map<string, TalentProfile>): TalentProfile[] {
  return contracts.reduce((acc, c) => {
    const t = talentPoolMap.get(c.talentId);
    if (t) acc.push(t);
    return acc;
  }, [] as TalentProfile[]);
}

function handleDevelopmentPhase(p: Project): { update: string | null } {
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
  return { update };
}

export function handleReleasePhaseEntry(
  p: Project,
  currentWeek: number,
  studioPrestige: number,
  projectContracts: Contract[],
  talentPoolMap: Map<string, TalentProfile>
): { update: string | null } {
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
  const talentDrawFactor = attachedTalent.reduce((sum, t) => sum + (t.draw / 100), 1);

  const baseGross = (minRev + (maxRev - minRev) * buzzFactor * prestigeFactor * randomFactor) * talentDrawFactor;

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

  return { update };
}

function handleReleasedPhase(
  p: Project,
  projectContracts: Contract[],
  talentPoolMap: Map<string, TalentProfile>,
  rivalStrengthAvg: number,
  awards: Award[]
): { update: string | null } {
  p.revenue += p.weeklyRevenue;
  let update: string | null = null;

  if ((p.format === 'tv' && p.tvFormat) || (p.format === 'unscripted' && p.unscriptedFormat)) {
    const formatData = p.format === 'tv' ? TV_FORMATS[p.tvFormat!] : UNSCRIPTED_FORMATS[p.unscriptedFormat!];
    const eps = p.episodes || formatData.defaultEpisodes;

    if (p.releaseModel === 'binge') {
      p.weeklyRevenue *= randRange(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1);

      if (p.weeklyRevenue < 50_000 || p.weeksInPhase > 8) {
        p.status = 'post_release';
        p.weeksInPhase = 0;
        update = `"${p.title}" Season ${p.season} finishes its run.`;
        updateTalentStats(p, projectContracts, talentPoolMap, awards);
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
        updateTalentStats(p, projectContracts, talentPoolMap, awards);
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
          updateTalentStats(p, projectContracts, talentPoolMap, awards);
        }
      }
    }
  } else {
    p.weeklyRevenue = simulateWeeklyBoxOffice(p, p.weeksInPhase, p.reviewScore || 50, p.weeklyRevenue, rivalStrengthAvg);
    if (p.weeklyRevenue < 100_000 || p.weeksInPhase > 12) {
      p.status = 'post_release';
      p.weeksInPhase = 0;
      update = `"${p.title}" completes its theatrical run — total gross: ${(p.revenue / 1_000_000).toFixed(1)}M`;
    }
  }

  return { update };
}




function handlePostReleasePhase(p: Project): { update: string | null } {
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

  return { update };
}


function handleMarketingPhase(p: Project): { update: string | null } {
  p.status = 'marketing';
  p.weeksInPhase = 0;
  return { update: `"${p.title}" has wrapped production and is ready for marketing strategy.` };
}

export function advanceProject(
  project: Project,
  currentWeek: number,
  studioPrestige: number,
  projectContracts: Contract[],
  talentPoolMap: Map<string, TalentProfile>,
  rivalStrengthAvg: number = 50,
  awards: Award[] = []
): { project: Project; update: string | null } {
  if (project.status === 'archived') return { project, update: null };

  const p = { ...project, weeksInPhase: project.weeksInPhase + 1 };
  let update: string | null = null;

  if (p.status === 'development' && p.weeksInPhase >= p.developmentWeeks) {
    const result = handleDevelopmentPhase(p);
    update = result.update;
  } else if (p.status === 'production' && p.weeksInPhase >= p.productionWeeks) {
    const result = handleMarketingPhase(p);
    update = result.update;
  } else if (p.status === 'released') {
    const result = handleReleasedPhase(p, projectContracts, talentPoolMap, rivalStrengthAvg, awards);
    update = result.update;
  } else if (p.status === 'post_release') {
    const result = handlePostReleasePhase(p);
    update = result.update;
  }

  // Buzz drift during active phases
  if (p.status === 'development' || p.status === 'production') {
    const attachedTalent = getAttachedTalent(projectContracts, talentPoolMap);
    const talentBuzzBonus = attachedTalent.reduce((sum, t) => sum + (t.draw / 50), 0);
    p.buzz = clamp(p.buzz + randRange(-4, 6) + talentBuzzBonus, 0, 100);
  }

  return { project: p, update };
}

