import { Project, Contract, TalentProfile } from '../types';
import { BUDGET_TIERS } from '../data/budgetTiers';
import { TV_FORMATS } from '../data/tvFormats';
import { clamp, randRange } from '../utils';

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
    if (p.format === 'tv') {
      p.status = 'pitching';
      p.weeksInPhase = 0;
      update = `"${p.title}" is ready to be pitched to networks/streamers.`;
    } else {
      p.status = 'production';
      p.weeksInPhase = 0;
      update = `"${p.title}" enters production`;
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
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentPoolMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as TalentProfile[]);
    const talentDrawFactor = attachedTalent.reduce((sum, t) => sum + (t.draw / 100), 1);

    const baseGross = (minRev + (maxRev - minRev) * buzzFactor * prestigeFactor * randomFactor) * talentDrawFactor;

    if (p.format === 'tv' && p.tvFormat) {
      // TV Release logic
      p.episodesReleased = 0;

      const tvFormatData = TV_FORMATS[p.tvFormat];
      const eps = p.episodes || tvFormatData.defaultEpisodes;
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

    if (p.format === 'tv' && p.tvFormat) {
      const tvFormatData = TV_FORMATS[p.tvFormat];
      const eps = p.episodes || tvFormatData.defaultEpisodes;

      if (p.releaseModel === 'binge') {
        p.weeklyRevenue *= randRange(tvFormatData.revenueDecayBinge - 0.1, tvFormatData.revenueDecayBinge + 0.1);

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
          p.weeklyRevenue *= randRange(tvFormatData.revenueDecayBinge - 0.1, tvFormatData.revenueDecayBinge + 0.1);
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
           p.weeklyRevenue *= randRange(tvFormatData.revenueDecayWeekly - 0.05, tvFormatData.revenueDecayWeekly + 0.05);

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
        update = `"${p.title}" completes its run — total gross: $${(p.revenue / 1_000_000).toFixed(1)}M`;
      }
    }
  }

  // Buzz drift during active phases
  if (p.status === 'development' || p.status === 'production') {
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentPoolMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as TalentProfile[]);
    const talentBuzzBonus = attachedTalent.reduce((sum, t) => sum + (t.draw / 50), 0);
    p.buzz = clamp(p.buzz + randRange(-4, 6) + talentBuzzBonus, 0, 100);
  }

  return { project: p, update };
}


function updateTalentStats(project: Project, contracts: Contract[], talentPoolMap: Map<string, TalentProfile>) {
  if (contracts.length === 0) return;

  const ROI = project.revenue / project.budget;

  // Define success/failure bounds
  let drawChange = 0;
  let prestigeChange = 0;
  let feeMultiplier = 1.0;

  if (ROI > 3.0) {
    // Massive hit
    drawChange = 10;
    prestigeChange = 5;
    feeMultiplier = 1.5;
  } else if (ROI > 1.5) {
    // Solid success
    drawChange = 5;
    prestigeChange = 2;
    feeMultiplier = 1.2;
  } else if (ROI < 0.5) {
    // Bomb
    drawChange = -10;
    prestigeChange = -5;
    feeMultiplier = 0.8;
  } else if (ROI < 1.0) {
    // Disappointment
    drawChange = -5;
    prestigeChange = -2;
    feeMultiplier = 0.9;
  }

  for (const contract of contracts) {
    const talent = talentPoolMap.get(contract.talentId);
    if (talent) {
      talent.draw = clamp(talent.draw + drawChange, 0, 100);
      talent.prestige = clamp(talent.prestige + prestigeChange, 0, 100);
      talent.fee = Math.max(50000, Math.floor(talent.fee * feeMultiplier));
    }
  }
}
