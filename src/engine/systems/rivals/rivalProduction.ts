import {
  GameState,
  RivalStudio,
  Project,
  StateImpact,
  BudgetTierKey,
  ProjectType,
} from "@/engine/types";
import { RandomGenerator } from "@/engine/utils/rng";
import { BUDGET_TIERS } from "@/engine/data/budgetTiers";

const ARCHETYPE_SPAWN_CHANCE: Record<string, number> = {
  major: 0.5,
  "mid-tier": 0.3,
  indie: 0.2,
};

const GENRES = ["Action", "Drama", "Comedy", "Horror", "Sci-Fi", "Romance", "Thriller"];
const FORMATS: ProjectType[] = ["FILM", "SERIES"];

/**
 * Weekly rival studio production tick.
 *
 * 1. Spawns new development projects for rivals, gated by cash/strength and
 *    tagged with `ownerId` so the revenue calculator can attribute them.
 * 2. Advances existing rival-owned projects through their phase lifecycle
 *    (development -> production -> released) so they eventually feed box office.
 *
 * Emits PROJECT_CREATED / PROJECT_UPDATED impacts only — never mutates state.
 */
export function tickRivalProduction(state: GameState, rng: RandomGenerator): StateImpact[] {
  const rivalsObj = state.entities?.rivals || {};
  const rivals: RivalStudio[] = [];
  for (const rid in rivalsObj) {
    rivals.push(rivalsObj[rid]);
  }
  if (rivals.length === 0) return [];

  const impacts: StateImpact[] = [];
  const existing = state.entities?.projects ?? {};

  for (const rival of rivals) {
    // 1. Advance existing rival-owned projects.
    for (const pid in existing) {
      const project = existing[pid];
      if (project.ownerId !== rival.id) continue;
      const advanced = advanceRivalProject(project);
      if (advanced) {
        impacts.push({
          type: "PROJECT_UPDATED",
          payload: { projectId: advanced.id, update: advanced },
        });
      }
    }

    // 2. Possibly spawn a new project.
    const chance = ARCHETYPE_SPAWN_CHANCE[rival.archetype] ?? 0.3;
    if (rng.next() > chance) continue;

    const tier = pickAffordableTier(rng, rival);
    if (!tier) continue;

    const project = buildRivalProject(rival, tier, rng, state.week);
    impacts.push({
      type: "PROJECT_CREATED",
      payload: { project },
    });
  }

  return impacts;
}

function pickAffordableTier(rng: RandomGenerator, rival: RivalStudio): BudgetTierKey | null {
  // Weight tiers by rival strength, then filter to what they can afford.
  const s = Math.max(1, rival.strength);
  const weighted: { tier: BudgetTierKey; w: number }[] = [
    { tier: "low", w: Math.max(0.05, 1 - s / 100) },
    { tier: "mid", w: 0.8 },
    { tier: "high", w: Math.max(0.05, s / 120) },
    { tier: "blockbuster", w: Math.max(0.01, s / 200) },
  ];

  const affordable = weighted.filter((x) => BUDGET_TIERS[x.tier].budget <= rival.cash);
  if (affordable.length === 0) return null;

  const total = affordable.reduce((sum, x) => sum + x.w, 0);
  let roll = rng.next() * total;
  for (const x of affordable) {
    roll -= x.w;
    if (roll <= 0) return x.tier;
  }
  return affordable[affordable.length - 1].tier;
}

function buildRivalProject(
  rival: RivalStudio,
  tier: BudgetTierKey,
  rng: RandomGenerator,
  week: number
): Project {
  const data = BUDGET_TIERS[tier];
  const genre = GENRES[Math.floor(rng.next() * GENRES.length)];
  const type = FORMATS[Math.floor(rng.next() * FORMATS.length)];
  const id = `rival-${rival.id}-w${week}-${Math.floor(rng.next() * 1_000_000)}`;

  const base: Project = {
    id,
    title: `${rival.name} ${genre} ${tier}`,
    type,
    format: type === "SERIES" ? "tv" : "film",
    genre,
    budgetTier: tier,
    budget: data.budget,
    weeklyCost: data.weeklyCost,
    targetAudience: "Broad",
    flavor: `${rival.name} production`,
    state: "development",
    buzz: 40 + Math.floor(rng.next() * 30),
    weeksInPhase: 0,
    developmentWeeks: data.developmentWeeks,
    productionWeeks: data.productionWeeks,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
    ownerId: rival.id,
    reviewScore: 50,
    activeCrisis: null,
    momentum: 50,
    progress: 0,
    accumulatedCost: 0,
    activeRoles: [],
    scriptEvents: [],
    scriptHeat: 50,
  } as unknown as Project;

  if (type === "SERIES") {
    (base as any).tvDetails = {
      currentSeason: 1,
      episodesOrdered: 10,
      episodesCompleted: 0,
      episodesAired: 0,
      averageRating: 0,
      status: "IN_DEVELOPMENT",
    };
  }

  return base;
}

function advanceRivalProject(project: Project): Project | null {
  if (project.state === "released") return null;

  const weeksInPhase = (project.weeksInPhase ?? 0) + 1;

  if (project.state === "development") {
    if (weeksInPhase >= (project.developmentWeeks ?? 10)) {
      return { ...project, state: "production", weeksInPhase: 0 };
    }
    return { ...project, weeksInPhase };
  }

  if (project.state === "production") {
    if (weeksInPhase >= (project.productionWeeks ?? 20)) {
      return {
        ...project,
        state: "released",
        weeksInPhase: 0,
        releaseWeek: project.releaseWeek ?? 0,
        boxOffice: {
          openingWeekendDomestic: 0,
          openingWeekendForeign: 0,
          totalDomestic: 0,
          totalForeign: 0,
          multiplier: 1,
        },
        rating: "PG-13",
      } as unknown as Project;
    }
    return { ...project, weeksInPhase };
  }

  return null;
}
