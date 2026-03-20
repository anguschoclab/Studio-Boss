import { Project, Contract, TalentProfile } from '../types';
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

function handleProductionRelease(
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
  rivalStrengthAvg: number
): { update: string | null } {
  p.revenue += p.weeklyRevenue;
  let update: string | null = null;

  if ((p.format === 'tv' && p.tvFormat) || (p.format === 'unscripted' && p.unscriptedFormat)) {
    const formatData = p.format === 'tv' ? TV_FORMATS[p.tvFormat!] : UNSCRIPTED_FORMATS[p.unscriptedFormat!];
    const eps = p.episodes || formatData.defaultEpisodes;

    if (p.releaseModel === 'binge') {
      p.weeklyRevenue *= randRange(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1);

      if (p.weeklyRevenue < 50_000 || p.weeksInPhase > 8) {
        p.status = 'archived';
        update = `"${p.title}" Season ${p.season} finishes its run.`;
        updateTalentStats(p, projectContracts, talentPoolMap);
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
        p.status = 'archived';
        update = `"${p.title}" Season ${p.season} finishes its run.`;
        updateTalentStats(p, projectContracts, talentPoolMap);
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
          p.status = 'archived';
          update = `"${p.title}" Season ${p.season} finishes its run.`;
          updateTalentStats(p, projectContracts, talentPoolMap);
        }
      }
    }
  } else {
    p.weeklyRevenue = simulateWeeklyBoxOffice(p, p.weeksInPhase, p.reviewScore || 50, p.weeklyRevenue, rivalStrengthAvg);
    if (p.weeklyRevenue < 100_000 || p.weeksInPhase > 12) {
      p.status = 'archived';
      update = `"${p.title}" completes its run — total gross: ${(p.revenue / 1_000_000).toFixed(1)}M`;
    }
  }

  return { update };
}

export function advanceProject(
  project: Project,
  currentWeek: number,
  studioPrestige: number,
  projectContracts: Contract[],
  talentPoolMap: Map<string, TalentProfile>,
  rivalStrengthAvg: number = 50
): { project: Project; update: string | null } {
  if (project.status === 'archived') return { project, update: null };

  const p = { ...project, weeksInPhase: project.weeksInPhase + 1 };
  let update: string | null = null;

  if (p.status === 'development' && p.weeksInPhase >= p.developmentWeeks) {
    const result = handleDevelopmentPhase(p);
    update = result.update;
  } else if (p.status === 'production' && p.weeksInPhase >= p.productionWeeks) {
    const result = handleProductionRelease(p, currentWeek, studioPrestige, projectContracts, talentPoolMap);
    update = result.update;
  } else if (p.status === 'released') {
    const result = handleReleasedPhase(p, projectContracts, talentPoolMap, rivalStrengthAvg);
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

function updateTalentStats(project: Project, contracts: Contract[], talentPoolMap: Map<string, TalentProfile>) {
  if (contracts.length === 0) return;

  const ROI = project.revenue / project.budget;

  let drawChange = 0;
  let prestigeChange = 0;
  let feeMultiplier = 1.0;

  if (ROI > 3.0) {
    drawChange = 10;
    prestigeChange = 5;
    feeMultiplier = 1.5;
  } else if (ROI > 1.5) {
    drawChange = 5;
    prestigeChange = 2;
    feeMultiplier = 1.2;
  } else if (ROI < 0.5) {
    drawChange = -10;
    prestigeChange = -5;
    feeMultiplier = 0.8;
  } else if (ROI < 1.0) {
    drawChange = -5;
    prestigeChange = -2;
    feeMultiplier = 0.9;
  }

  for (const contract of contracts) {
    const talent = talentPoolMap.get(contract.talentId);
    if (talent) {
      talent.draw = clamp(talent.draw + drawChange, 0, 100);
      talent.prestige = clamp(talent.prestige + prestigeChange, 0, 100);
      talent.fee = clamp(talent.fee * feeMultiplier, 10000, 50000000);
    }
  }
}
