import { GameState, StateImpact } from '@/engine/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'creative' | 'talent' | 'empire';
  unlocked: boolean;
  unlockedWeek?: number;
  progress?: number;  // 0-100 for partial display
  target?: number;    // numeric ceiling for progress achievements
  current?: number;   // current value toward target
}

// ---------------------------------------------------------------------------
// Achievement catalogue
// ---------------------------------------------------------------------------

/** Static catalogue — runtime state is NOT stored here. */
export const ACHIEVEMENT_CATALOGUE: Omit<Achievement, 'unlocked' | 'unlockedWeek' | 'progress' | 'current'>[] = [
  // Financial
  {
    id: 'first_million',
    name: 'First Million',
    description: 'Accumulate $1M in cash for the first time.',
    category: 'financial',
    target: 1_000_000,
  },
  {
    id: 'mogul',
    name: 'Mogul',
    description: 'Grow your cash reserves to $50M.',
    category: 'financial',
    target: 50_000_000,
  },
  {
    id: 'studio_empire',
    name: 'Studio Empire',
    description: 'Amass $200M in cash — you own this town.',
    category: 'financial',
    target: 200_000_000,
  },
  {
    id: 'debt_free',
    name: 'Debt Free',
    description: 'Fully repay all outstanding loans.',
    category: 'financial',
  },
  // Creative
  {
    id: 'critics_darling',
    name: "Critic's Darling",
    description: 'Release a film with a review score of 85 or higher.',
    category: 'creative',
    target: 85,
  },
  {
    id: 'box_office_champion',
    name: 'Box Office Champion',
    description: 'Earn $200M domestic gross on a single film.',
    category: 'creative',
    target: 200_000_000,
  },
  {
    id: 'award_season_sweep',
    name: 'Award Season Sweep',
    description: 'Win 3 or more awards in a single calendar year.',
    category: 'creative',
    target: 3,
  },
  {
    id: 'franchise_builder',
    name: 'Franchise Builder',
    description: 'Release 3 or more films under the same franchise.',
    category: 'creative',
    target: 3,
  },
  // Talent
  {
    id: 'star_maker',
    name: 'Star Maker',
    description: 'Sign a NEWCOMER who later achieves A_LIST status.',
    category: 'talent',
  },
  {
    id: 'big_agency_deal',
    name: 'Big Agency Deal',
    description: 'Sign a First Look deal with a powerhouse agency.',
    category: 'talent',
  },
  {
    id: 'scandal_survivor',
    name: 'Scandal Survivor',
    description: 'Resolve 5 on-set crises without losing a project.',
    category: 'talent',
    target: 5,
  },
  // Empire
  {
    id: 'decade_milestone',
    name: 'Decade Milestone',
    description: 'Survive 10 years in Hollywood (520 weeks).',
    category: 'empire',
    target: 520,
  },
  {
    id: 'prestige_peak',
    name: 'Prestige Peak',
    description: 'Reach a studio prestige score of 90.',
    category: 'empire',
    target: 90,
  },
  {
    id: 'market_dominator',
    name: 'Market Dominator',
    description: 'Outperform every rival studio in annual revenue.',
    category: 'empire',
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Win Best Picture AND earn $500M on a single film in the same calendar year.',
    category: 'empire',
  },
];

// ---------------------------------------------------------------------------
// Evaluation helpers
// ---------------------------------------------------------------------------

function alreadyUnlocked(state: GameState, id: string): boolean {
  const unlocked: string[] = (state.studio as unknown as unknown as import("@/engine/types").StateImpact).achievements ?? [];
  return unlocked.includes(id);
}

function buildUnlockImpacts(
  achievement: Omit<Achievement, 'unlocked' | 'unlockedWeek' | 'progress' | 'current'>,
  week: number,
  major: boolean,
): StateImpact[] {
  const impacts: StateImpact[] = [];

  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `ACHIEVEMENT UNLOCKED: ${achievement.name}`,
      description: achievement.description,
      category: 'general',
    },
  } as StateImpact);

  if (major) {
    impacts.push({
      type: 'MODAL_TRIGGERED',
      payload: {
        modalType: 'ACHIEVEMENT_UNLOCKED',
        priority: 80,
        payload: { achievementId: achievement.id, name: achievement.name, description: achievement.description, week },
      },
    } as StateImpact);
  }

  // Carry the achievement ID in a SYSTEM_TICK bag so the reducer can persist it
  impacts.push({
    type: 'SYSTEM_TICK' as unknown as unknown as import("@/engine/types").StateImpact,
    payload: { newAchievementId: achievement.id },
  } as StateImpact);

  return impacts;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * checkAchievements — called once per week.
 * Compares current state against each achievement condition and returns impacts
 * for newly unlocked achievements.
 */
export function checkAchievements(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const cash = state.finance.cash;
  const week = state.week;

  // Helper: push impacts if newly unlocked
  const check = (
    id: string,
    condition: boolean,
    major = false,
  ) => {
    if (condition && !alreadyUnlocked(state, id)) {
      const def = ACHIEVEMENT_CATALOGUE.find((a) => a.id === id)!;
      impacts.push(...buildUnlockImpacts(def, week, major));
    }
  };

  // --- FINANCIAL ---
  check('first_million', cash >= 1_000_000);
  check('mogul', cash >= 50_000_000);
  check('studio_empire', cash >= 200_000_000, true);

  // Debt Free: assume no debt when finance has no negative entries in weeklyHistory
  // Use a simple proxy: cash positive and no ledger entries showing net < 0 recently
  // (A more precise check would require a loans field on finance state.)
  // For now we skip automatic unlock — it requires explicit loan tracking.

  // ⚡ Bolt: Single pass over projects to aggregate all creative stats, replacing multiple Object.values + filter + some calls
  let hasCriticsDarling = false;
  let boxOfficeChampion = false;
  const awardsByYear: Record<number, number> = {};
  const franchiseFilmCounts: Record<string, number> = {};
  const bestPictureYears = new Set<number>();
  const highGrossingYears = new Set<number>();

  for (const id in state.entities.projects) {
    const p = state.entities.projects[id];

    if (p.state !== 'released' && p.state !== 'post_release' && p.state !== 'archived') {
      continue;
    }

    if ((p.reviewScore ?? 0) >= 85) hasCriticsDarling = true;

    const domGross = p.boxOffice?.totalDomestic ?? 0;
    const totalGross = domGross + (p.boxOffice?.totalForeign ?? 0);

    if (domGross >= 200_000_000) boxOfficeChampion = true;

    for (const award of (p.awards ?? [])) {
      if (award.status === 'won') {
        awardsByYear[award.year] = (awardsByYear[award.year] ?? 0) + 1;
        if (award.category === 'Best Picture') {
          bestPictureYears.add(award.year);
        }
      }
    }

    if (p.franchiseId) {
      franchiseFilmCounts[p.franchiseId] = (franchiseFilmCounts[p.franchiseId] ?? 0) + 1;
    }

    if (totalGross >= 500_000_000 && p.releaseWeek !== null) {
      highGrossingYears.add(Math.floor(p.releaseWeek / 52));
    }
  }

  // --- CREATIVE ---
  check('critics_darling', hasCriticsDarling);
  check('box_office_champion', boxOfficeChampion, true);

  // Award season sweep — 3+ award wins in the same calendar year
  let hasSweep = false;
  for (const year in awardsByYear) {
    if (awardsByYear[year] >= 3) {
      hasSweep = true;
      break;
    }
  }
  check('award_season_sweep', hasSweep);

  // Franchise builder — franchise with 3+ films
  let hasFranchise3 = false;
  for (const franchiseId in franchiseFilmCounts) {
    if (franchiseFilmCounts[franchiseId] >= 3) {
      hasFranchise3 = true;
      break;
    }
  }
  check('franchise_builder', hasFranchise3);

  // --- TALENT ---
  // Star Maker: any A_LIST talent that was originally a NEWCOMER
  let hasStarMaker = false;
  for (const id in state.entities.talents) {
    const t = state.entities.talents[id];
    if (t.tier === 'A_LIST' && (t as unknown as unknown as import("@/engine/types").StateImpact).wasNewcomerWhenSigned === true) {
      hasStarMaker = true;
      break;
    }
  }
  check('star_maker', hasStarMaker);

  // Big Agency Deal — First Look deal with a powerhouse agency
  const firstLookDeals = state.studio.internal.firstLookDeals ?? [];
  const hasPowerhouseDeal = firstLookDeals.some((deal) => {
    const agency = state.industry.agencies.find((a) => a.id === state.entities.talents[deal.talentId]?.agencyId);
    return agency?.tier === 'powerhouse';
  });
  check('big_agency_deal', hasPowerhouseDeal);

  // Scandal Survivor — resolved 5 crises; tracked via studioCrisisResolved counter
  const resolvedCrises: number = (state.studio as unknown as unknown as import("@/engine/types").StateImpact).resolvedCrisesCount ?? 0;
  check('scandal_survivor', resolvedCrises >= 5);

  // --- EMPIRE ---
  check('decade_milestone', week >= 520, true);
  check('prestige_peak', state.studio.prestige >= 90);

  // Market Dominator — player cash > all rivals
  let isMarketDominator = true;
  let hasRivals = false;
  for (const id in state.entities.rivals) {
    hasRivals = true;
    if (cash <= state.entities.rivals[id].cash) {
      isMarketDominator = false;
      break;
    }
  }
  if (!hasRivals) isMarketDominator = false;
  check('market_dominator', isMarketDominator, true);

  // Legend — Best Picture win AND $500M film in the same year
  let hasLegend = false;
  for (const year of bestPictureYears) {
    if (highGrossingYears.has(year)) {
      hasLegend = true;
      break;
    }
  }
  check('legend', hasLegend, true);

  return impacts;
}
