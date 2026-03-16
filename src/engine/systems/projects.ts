import { Project, Contract, TalentProfile } from '../types';
import { BUDGET_TIERS } from '../data/budgetTiers';
import { TV_FORMATS } from '../data/tvFormats';
import { UNSCRIPTED_FORMATS } from '../data/unscriptedFormats';
import { clamp, randRange } from '../utils';
import { updateTalentStats } from './talentStats';

function getAttachedTalent(contracts: Contract[], talentPoolMap: Map<string, TalentProfile>): TalentProfile[] {
  return contracts.reduce((acc, c) => {
    const t = talentPoolMap.get(c.talentId);
    if (t) acc.push(t);
    return acc;
  }, [] as TalentProfile[]);
}

export function advanceProject(
  project: Project,
  currentWeek: number,
  studioPrestige: number,
  projectContracts: Contract[],
  talentPoolMap: Map<string, TalentProfile>
): { project: Project; update: string | null } {
  if (project.status === 'archived') return { project, update: null };

  const p = { ...project, weeksInPhase: project.weeksInPhase + 1 };
  let update: string | null = null;

  if (p.status === 'development' && p.weeksInPhase >= p.developmentWeeks) {
    if (p.format === 'tv' || p.format === 'unscripted') {
      p.status = 'pitching';
      p.weeksInPhase = 0;
      update = `"${p.title}" is ready to be pitched to networks/streamers.`;
    } else {
      p.status = 'needs_greenlight';
      p.weeksInPhase = 0;
      update = `"${p.title}" is ready for greenlight committee review.`;
    }
  } else if (p.status === 'production' && p.weeksInPhase >= p.productionWeeks) {
    p.status = 'released';
    p.weeksInPhase = 0;
    p.releaseWeek = currentWeek;
    p.revenue = 0;

    const tier = BUDGET_TIERS[p.budgetTier];
    const [minRev, maxRev] = tier.revenueRange;
    const buzzFactor = p.buzz / 100;
    const prestigeFactor = 0.5 + studioPrestige / 200;
    const randomFactor = randRange(0.7, 1.3);

    // Talent impact
    const attachedTalent = getAttachedTalent(projectContracts, talentPoolMap);
    const talentDrawFactor = attachedTalent.reduce((sum, t) => sum + (t.draw / 100), 1);

    const baseGross = (minRev + (maxRev - minRev) * buzzFactor * prestigeFactor * randomFactor) * talentDrawFactor;

    if ((p.format === 'tv' && p.tvFormat) || (p.format === 'unscripted' && p.unscriptedFormat)) {
      // Episodic Release logic
      p.episodesReleased = 0;

      const formatData = p.format === 'tv' ? TV_FORMATS[p.tvFormat!] : UNSCRIPTED_FORMATS[p.unscriptedFormat!];
      const eps = p.episodes || formatData.defaultEpisodes;
      const episodeMultiplier = Math.sqrt(eps / 10); // More episodes = more total revenue, but diminishing returns

      const totalTvGross = baseGross * episodeMultiplier;

      if (p.releaseModel === 'binge') {
        p.weeklyRevenue = totalTvGross * 0.6; // Massive opening
        p.episodesReleased = eps;
        update = `"${p.title}" Season ${p.season} drops! Huge binge viewership.`;
      } else if (p.releaseModel === 'split') {
        p.weeklyRevenue = totalTvGross * 0.35; // Big opening for part 1
        p.episodesReleased = Math.ceil(eps / 2);
        update = `"${p.title}" Season ${p.season} Part 1 premieres!`;
      } else { // weekly
        p.weeklyRevenue = (totalTvGross * 0.15); // Smaller opening, sustained
        p.episodesReleased = 1;
        update = `"${p.title}" Season ${p.season} premieres its first episode!`;
      }
    } else {
      // Film release logic
      p.weeklyRevenue = baseGross * 0.35;
      const strength = p.weeklyRevenue > baseGross * 0.25 ? 'strong' : 'modest';
      update = `"${p.title}" releases to a ${strength} opening!`;
    }

  } else if (p.status === 'released') {
    p.revenue += p.weeklyRevenue;

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
        // Drop part 2 halfway through the season run length
        const part2DropWeek = Math.ceil(eps / 2) + 2;

        if (p.weeksInPhase === part2DropWeek) {
          p.episodesReleased = eps;
          p.weeklyRevenue *= 2.5; // Spike for part 2
          update = `"${p.title}" Season ${p.season} Part 2 drops!`;
        } else if (p.weeksInPhase > part2DropWeek) {
          p.weeklyRevenue *= randRange(formatData.revenueDecayBinge - 0.1, formatData.revenueDecayBinge + 0.1);
        } else {
           p.weeklyRevenue *= randRange(0.6, 0.8); // decay between parts
        }

        if (p.weeksInPhase > part2DropWeek + 6 && p.weeklyRevenue < 50_000) {
           p.status = 'archived';
           update = `"${p.title}" Season ${p.season} finishes its run.`;
           updateTalentStats(p, projectContracts, talentPoolMap);
        }

      } else { // weekly
        if (p.episodesReleased !== undefined && p.episodesReleased < eps) {
           p.episodesReleased += 1;
           // Maintain steady revenue, maybe slight decay or slight boost
           p.weeklyRevenue *= randRange(formatData.revenueDecayWeekly - 0.05, formatData.revenueDecayWeekly + 0.05);

           if (p.episodesReleased === eps) {
              update = `"${p.title}" Season ${p.season} airs its finale!`;
              p.weeklyRevenue *= 1.3; // Finale bump
           }
        } else {
           // Post-finale decay
           p.weeklyRevenue *= 0.6;
           if (p.weeklyRevenue < 50_000 || p.weeksInPhase > eps + 4) {
             p.status = 'archived';
             update = `"${p.title}" Season ${p.season} finishes its run.`;
             updateTalentStats(p, projectContracts, talentPoolMap);
           }
        }
      }
    } else {
      // Film decay
      p.weeklyRevenue *= randRange(0.5, 0.7);
      if (p.weeklyRevenue < 100_000 || p.weeksInPhase > 12) {
        p.status = 'archived';
        update = `"${p.title}" completes its run — total gross: ${(p.revenue / 1_000_000).toFixed(1)}M`;
      }
    }
  }

  // Buzz drift during active phases
  if (p.status === 'development' || p.status === 'production') {
    const attachedTalent = getAttachedTalent(projectContracts, talentPoolMap);
    const talentBuzzBonus = attachedTalent.reduce((sum, t) => sum + (t.draw / 50), 0);
    p.buzz = clamp(p.buzz + randRange(-4, 6) + talentBuzzBonus, 0, 100);
  }

  return { project: p, update };
}




