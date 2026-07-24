import { describe, it, expect } from "vitest";
import { calculateRivalMotivation, calculateMotivationScores, tickAIMinds } from "@/engine/systems/ai/motivationEngine";
import { RandomGenerator } from "@/engine/utils/rng";
import { createMockGameState, createMockRival } from "../../generators/mockFactory";
import type { StateImpact, SeriesProject, Project } from "@/engine/types";

describe("AI Motivation Engine (Target C1)", () => {
  const rng = new RandomGenerator(999);

  it("should switch to CASH_CRUNCH if cash is extremely low", () => {
    const mockRival = createMockRival({
      id: "r1",
      cash: 100_000, // Very low cash
      prestige: 80,
    });
    const state = createMockGameState();
    // In Phase 7, rivals are in entities.rivals
    state.entities.rivals = { [mockRival.id]: mockRival };

    const nextMotivation = calculateRivalMotivation(mockRival, state, rng);
    expect(nextMotivation).toBe("CASH_CRUNCH");
  });

  it("should switch to AWARD_CHASE if prestige is high but cash is fine", () => {
    const mockRival = createMockRival({
      id: "r1",
      cash: 50_000_000,
      prestige: 90,
    });
    const state = createMockGameState();
    state.entities.rivals = { [mockRival.id]: mockRival };

    const nextMotivation = calculateRivalMotivation(mockRival, state, rng);
    expect(nextMotivation).toBe("AWARD_CHASE");
  });
});

describe("tickAIMinds — prestige decay (lastAwardWin)", () => {
  function getMotivationFromImpacts(impacts: StateImpact[], rivalId: string): string | undefined {
    const rivalUpdate = impacts.find(
      (i) =>
        i.type === "RIVAL_UPDATED" &&
        (i.payload as { rivalId?: string }).rivalId === rivalId &&
        (i.payload as { update?: { currentMotivation?: string } }).update?.currentMotivation
    );
    return (rivalUpdate?.payload as { update?: { currentMotivation?: string } }).update
      ?.currentMotivation;
  }

  it("recent award win prevents AWARD_CHASE override (normal prestige)", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 50_000_000,
      prestige: 50,
      lastAwardWin: 190, // 10 weeks ago — well within 104-week threshold
    });
    state.entities.rivals = { [rival.id]: rival };

    // Run many times to account for the 15% RNG chance
    for (let seed = 1; seed <= 50; seed++) {
      const testRng = new RandomGenerator(seed);
      const impacts = tickAIMinds(state, testRng);
      const motivation = getMotivationFromImpacts(impacts, "r1");
      expect(motivation).not.toBe("AWARD_CHASE");
    }
  });

  it("recent award win prevents AWARD_CHASE override (high prestige)", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 3_000_000, // Low cash so CASH_CRUNCH (100) beats AWARD_CHASE (85)
      prestige: 80,
      lastAwardWin: 170, // 30 weeks ago — within 52-week threshold for high prestige
    });
    state.entities.rivals = { [rival.id]: rival };

    for (let seed = 1; seed <= 50; seed++) {
      const testRng = new RandomGenerator(seed);
      const impacts = tickAIMinds(state, testRng);
      const motivation = getMotivationFromImpacts(impacts, "r1");
      expect(motivation).not.toBe("AWARD_CHASE");
    }
  });

  it("old award win triggers AWARD_CHASE drift (normal prestige)", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 50_000_000,
      prestige: 50,
      lastAwardWin: 85, // 115 weeks ago — beyond 104-week threshold
    });
    state.entities.rivals = { [rival.id]: rival };

    let foundAwardChase = false;
    for (let seed = 1; seed <= 50; seed++) {
      const testRng = new RandomGenerator(seed);
      const impacts = tickAIMinds(state, testRng);
      const motivation = getMotivationFromImpacts(impacts, "r1");
      if (motivation === "AWARD_CHASE") {
        foundAwardChase = true;
        break;
      }
    }
    expect(foundAwardChase).toBe(true);
  });

  it("old award win triggers AWARD_CHASE drift (high prestige)", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 3_000_000, // Low cash so CASH_CRUNCH (100) beats AWARD_CHASE (85) naturally
      prestige: 80,
      lastAwardWin: 140, // 60 weeks ago — beyond 52-week threshold for high prestige
    });
    state.entities.rivals = { [rival.id]: rival };

    let foundAwardChase = false;
    for (let seed = 1; seed <= 50; seed++) {
      const testRng = new RandomGenerator(seed);
      const impacts = tickAIMinds(state, testRng);
      const motivation = getMotivationFromImpacts(impacts, "r1");
      if (motivation === "AWARD_CHASE") {
        foundAwardChase = true;
        break;
      }
    }
    expect(foundAwardChase).toBe(true);
  });

  it("undefined lastAwardWin treated as award-starved", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 50_000_000,
      prestige: 50,
      // lastAwardWin intentionally omitted
    });
    state.entities.rivals = { [rival.id]: rival };

    let foundAwardChase = false;
    for (let seed = 1; seed <= 50; seed++) {
      const testRng = new RandomGenerator(seed);
      const impacts = tickAIMinds(state, testRng);
      const motivation = getMotivationFromImpacts(impacts, "r1");
      if (motivation === "AWARD_CHASE") {
        foundAwardChase = true;
        break;
      }
    }
    expect(foundAwardChase).toBe(true);
  });

  it("already AWARD_CHASE is not overridden (no-op)", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 50_000_000,
      prestige: 90,
      lastAwardWin: 190, // recent win, but prestige is high enough to naturally get AWARD_CHASE
    });
    state.entities.rivals = { [rival.id]: rival };

    const testRng = new RandomGenerator(999);
    const impacts = tickAIMinds(state, testRng);
    const motivation = getMotivationFromImpacts(impacts, "r1");
    // With prestige 90 and high cash, calculateRivalMotivation returns AWARD_CHASE naturally.
    // The decay logic should not interfere since newMotivation is already AWARD_CHASE.
    expect(motivation).toBe("AWARD_CHASE");
  });
});

// ─── Syndication Tracking Tests ──────────────────────────────────────────────

function createSeriesProject(
  id: string,
  ownerId: string,
  episodesAired: number,
  genre: string = "Drama",
  overrides: Partial<SeriesProject> = {}
): SeriesProject {
  return {
    id,
    title: `Test Series ${id}`,
    type: "SERIES",
    format: "tv",
    genre,
    budgetTier: "mid",
    budget: 10_000_000,
    weeklyCost: 250_000,
    targetAudience: "General",
    flavor: "A test series",
    state: "released",
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 10,
    productionWeeks: 20,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: 1,
    activeCrisis: null,
    momentum: 50,
    progress: 100,
    accumulatedCost: 0,
    ownerId,
    scriptHeat: 50,
    activeRoles: [],
    scriptEvents: [],
    tvDetails: {
      currentSeason: 1,
      episodesOrdered: 100,
      episodesCompleted: episodesAired,
      episodesAired,
      averageRating: 7,
      status: "ON_AIR",
    },
    ...overrides,
  } as unknown as SeriesProject;
}

function createFranchiseBuildingRival(overrides: Partial<ReturnType<typeof createMockRival>> = {}) {
  return createMockRival({
    id: "fb-rival",
    name: "Franchise Studios",
    cash: 50_000_000,
    prestige: 50,
    projects: { p1: {} as Project, p2: {} as Project, p3: {} as Project, p4: {} as Project },
    motivationProfile: { financial: 0, prestige: 0, legacy: 100, aggression: 0 },
    currentMotivation: "STABILITY", // stale — new code should use newMotivation
    ...overrides,
  });
}

function createStabilityRival(overrides: Partial<ReturnType<typeof createMockRival>> = {}) {
  return createMockRival({
    id: "stab-rival",
    name: "Stable Studios",
    cash: 6_000_000,
    prestige: 50,
    projects: {},
    motivationProfile: { financial: 50, prestige: 50, legacy: 0, aggression: 10 },
    currentMotivation: "STABILITY",
    ...overrides,
  });
}

function getRivalUpdates(impacts: StateImpact[], rivalId: string) {
  return impacts.filter(
    (i) =>
      i.type === "RIVAL_UPDATED" &&
      (i.payload as { rivalId?: string }).rivalId === rivalId
  );
}

function getNewsImpacts(impacts: StateImpact[]) {
  return impacts.filter((i) => i.type === "NEWS_ADDED");
}

function getCashFromUpdates(impacts: StateImpact[], rivalId: string): number | undefined {
  const updates = getRivalUpdates(impacts, rivalId);
  for (const u of updates) {
    const cash = (u.payload as { update?: { cash?: number } }).update?.cash;
    if (cash !== undefined) return cash;
  }
  return undefined;
}

function getSyndicationPotential(impacts: StateImpact[], rivalId: string) {
  const updates = getRivalUpdates(impacts, rivalId);
  for (const u of updates) {
    const sp = (u.payload as { update?: { syndicationPotential?: unknown } }).update
      ?.syndicationPotential;
    if (sp !== undefined) return sp as { syndicatedCount: number; bestTier: string; nearSyndicationCount: number; weeklyRevenue: number };
  }
  return undefined;
}

describe("tickAIMinds — FRANCHISE_BUILDING syndication tracking", () => {
  it("generates Bronze syndication revenue for 65-episode Drama", () => {
    const rival = createFranchiseBuildingRival();
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    const project = createSeriesProject("tv1", rival.id, 65, "Drama");
    state.entities.projects = { tv1: project };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const cash = getCashFromUpdates(impacts, rival.id);
    expect(cash).toBeDefined();
    // $150k base * 1.4 Bronze multiplier = $210k
    expect(cash).toBe(rival.cash + 210_000);
  });

  it("generates more revenue for Gold (100 eps) than Bronze (65 eps)", () => {
    const rivalBronze = createFranchiseBuildingRival({ id: "rb" });
    const stateBronze = createMockGameState();
    stateBronze.entities.rivals = { [rivalBronze.id]: rivalBronze };
    stateBronze.entities.projects = {
      tv1: createSeriesProject("tv1", rivalBronze.id, 65, "Drama"),
    };

    const rivalGold = createFranchiseBuildingRival({ id: "rg" });
    const stateGold = createMockGameState();
    stateGold.entities.rivals = { [rivalGold.id]: rivalGold };
    stateGold.entities.projects = {
      tv1: createSeriesProject("tv1", rivalGold.id, 100, "Drama"),
    };

    const impactsBronze = tickAIMinds(stateBronze, new RandomGenerator(42));
    const impactsGold = tickAIMinds(stateGold, new RandomGenerator(42));

    const cashBronze = getCashFromUpdates(impactsBronze, "rb")!;
    const cashGold = getCashFromUpdates(impactsGold, "rg")!;

    const revBronze = cashBronze - rivalBronze.cash;
    const revGold = cashGold - rivalGold.cash;
    expect(revGold).toBeGreaterThan(revBronze);
    // Gold: $150k * 3.5 = $525k vs Bronze: $150k * 1.4 = $210k
    expect(revGold).toBe(525_000);
    expect(revBronze).toBe(210_000);
  });

  it("respects Animation genre modifier (Bronze at 52 episodes)", () => {
    const rival = createFranchiseBuildingRival();
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    const project = createSeriesProject("tv1", rival.id, 52, "Animation");
    state.entities.projects = { tv1: project };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const cash = getCashFromUpdates(impacts, rival.id);
    expect(cash).toBeDefined();
    // 52 episodes Animation → Bronze (0.8x modifier, ceil(65*0.8)=52)
    // Revenue: $150k * 1.4 = $210k
    expect(cash).toBe(rival.cash + 210_000);
  });

  it("does not generate syndication revenue for 64-episode Drama (below Bronze)", () => {
    const rival = createFranchiseBuildingRival();
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    const project = createSeriesProject("tv1", rival.id, 64, "Drama");
    state.entities.projects = { tv1: project };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const cash = getCashFromUpdates(impacts, rival.id);
    expect(cash).toBeUndefined();
  });

  it("tracks near-syndication shows (55 episodes Drama, progress >= 80%)", () => {
    const rival = createFranchiseBuildingRival();
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    const project = createSeriesProject("tv1", rival.id, 55, "Drama");
    state.entities.projects = { tv1: project };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const sp = getSyndicationPotential(impacts, rival.id);
    expect(sp).toBeDefined();
    expect(sp!.syndicatedCount).toBe(0);
    expect(sp!.nearSyndicationCount).toBe(1);
    expect(sp!.bestTier).toBe("NONE");
    expect(sp!.weeklyRevenue).toBe(0);
  });

  it("excludes non-TV (film) projects from syndication", () => {
    const rival = createFranchiseBuildingRival();
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    const film = {
      ...createSeriesProject("tv1", rival.id, 100, "Drama"),
      type: "FILM" as const,
      format: "film" as const,
      tvDetails: undefined,
    } as unknown as Project;
    state.entities.projects = { tv1: film };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const cash = getCashFromUpdates(impacts, rival.id);
    expect(cash).toBeUndefined();
  });

  it("excludes non-released TV projects from syndication", () => {
    const rival = createFranchiseBuildingRival();
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    const project = createSeriesProject("tv1", rival.id, 100, "Drama", {
      state: "production",
    });
    state.entities.projects = { tv1: project };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const cash = getCashFromUpdates(impacts, rival.id);
    expect(cash).toBeUndefined();
  });

  it("excludes TV projects owned by a different rival", () => {
    const rival = createFranchiseBuildingRival();
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    const project = createSeriesProject("tv1", "other-rival", 100, "Drama");
    state.entities.projects = { tv1: project };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const cash = getCashFromUpdates(impacts, rival.id);
    expect(cash).toBeUndefined();
  });

  it("populates syndicationPotential with multiple shows at different tiers", () => {
    const rival = createFranchiseBuildingRival();
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    state.entities.projects = {
      tv1: createSeriesProject("tv1", rival.id, 65, "Drama"),   // Bronze
      tv2: createSeriesProject("tv2", rival.id, 88, "Drama"),   // Silver
      tv3: createSeriesProject("tv3", rival.id, 100, "Drama"),  // Gold
      tv4: createSeriesProject("tv4", rival.id, 55, "Drama"),   // Near-syndication
    };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const sp = getSyndicationPotential(impacts, rival.id);
    expect(sp).toBeDefined();
    expect(sp!.syndicatedCount).toBe(3);
    expect(sp!.bestTier).toBe("GOLD");
    expect(sp!.nearSyndicationCount).toBe(1);
    // Bronze $210k + Silver $330k + Gold $525k = $1,065k
    expect(sp!.weeklyRevenue).toBe(210_000 + 330_000 + 525_000);
  });

  it("emits NEWS_ADDED on first syndication milestone", () => {
    const rival = createFranchiseBuildingRival();
    // No prior syndicationPotential
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    state.entities.projects = {
      tv1: createSeriesProject("tv1", rival.id, 65, "Drama"),
    };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const news = getNewsImpacts(impacts);
    expect(news.length).toBeGreaterThanOrEqual(1);
    const headline = (news[0].payload as { headline?: string }).headline;
    expect(headline).toContain(rival.name.toUpperCase());
  });

  it("does not emit NEWS_ADDED when rival already has syndicated shows", () => {
    const rival = createFranchiseBuildingRival({
      syndicationPotential: {
        syndicatedCount: 1,
        bestTier: "BRONZE",
        nearSyndicationCount: 0,
        weeklyRevenue: 210_000,
      },
    });
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    state.entities.projects = {
      tv1: createSeriesProject("tv1", rival.id, 65, "Drama"),
    };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const news = getNewsImpacts(impacts);
    // No new milestone news — the rival already had syndicated shows
    const syndicationNews = news.filter((n) => {
      const h = (n.payload as { headline?: string }).headline || "";
      return h.includes(rival.name.toUpperCase()) && h.includes("SYNDICATION");
    });
    expect(syndicationNews.length).toBe(0);
  });

  it("does not generate syndication impacts for non-FRANCHISE_BUILDING rivals", () => {
    const rival = createStabilityRival();
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    state.entities.projects = {
      tv1: createSeriesProject("tv1", rival.id, 100, "Drama"),
    };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const sp = getSyndicationPotential(impacts, rival.id);
    expect(sp).toBeUndefined();
    const cash = getCashFromUpdates(impacts, rival.id);
    // Cash should not include syndication revenue (may include other RIVAL_UPDATED cash though)
    // The only RIVAL_UPDATED should be the motivation update with no cash
    expect(cash).toBeUndefined();
  });

  it("sets syndicationPotential with all zeros when rival has no projects", () => {
    const rival = createFranchiseBuildingRival();
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    state.entities.projects = {};

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    const sp = getSyndicationPotential(impacts, rival.id);
    expect(sp).toBeDefined();
    expect(sp!.syndicatedCount).toBe(0);
    expect(sp!.bestTier).toBe("NONE");
    expect(sp!.nearSyndicationCount).toBe(0);
    expect(sp!.weeklyRevenue).toBe(0);
  });

  it("uses newMotivation (not stale currentMotivation) for syndication logic", () => {
    // Rival has currentMotivation STABILITY but will calculate to FRANCHISE_BUILDING
    const rival = createFranchiseBuildingRival({
      currentMotivation: "STABILITY",
    });
    const state = createMockGameState();
    state.entities.rivals = { [rival.id]: rival };
    state.entities.projects = {
      tv1: createSeriesProject("tv1", rival.id, 65, "Drama"),
    };

    const impacts = tickAIMinds(state, new RandomGenerator(42));

    // Should still generate syndication revenue because newMotivation is FRANCHISE_BUILDING
    const sp = getSyndicationPotential(impacts, rival.id);
    expect(sp).toBeDefined();
    expect(sp!.syndicatedCount).toBe(1);
  });
});

// ─── Flop-History-Aware Motivation Tests (Gap 3) ─────────────────────────────

import type { StudioFlopHistory } from "@/engine/types/state.types";

function createFlopHistory(
  rivalId: string,
  majorFlops: number,
  catastrophicFlops: number,
  flopWeeks: number[]
): StudioFlopHistory {
  return { rivalId, majorFlops, catastrophicFlops, flopWeeks };
}

function getStateWithFlops(
  rival: ReturnType<typeof createMockRival>,
  flops: StudioFlopHistory | null,
  week: number = 60
) {
  const state = createMockGameState({ week });
  state.entities.rivals = { [rival.id]: rival };
  if (flops) {
    state.simMemory = {
      ...state.simMemory!,
      flops: { [rival.id]: flops },
    };
  }
  return state;
}

function getMotivationScores(
  rival: ReturnType<typeof createMockRival>,
  state: ReturnType<typeof createMockGameState>,
  seeds: number = 50
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (let seed = 1; seed <= seeds; seed++) {
    const r = new RandomGenerator(seed);
    const m = calculateRivalMotivation(rival, state, r);
    counts[m] = (counts[m] || 0) + 1;
  }
  return counts;
}

function getAverageScores(
  rival: ReturnType<typeof createMockRival>,
  state: ReturnType<typeof createMockGameState>,
  seeds: number = 100
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (let seed = 1; seed <= seeds; seed++) {
    const r = new RandomGenerator(seed);
    const scores = calculateMotivationScores(rival, state, r);
    for (const key of Object.keys(scores)) {
      totals[key] = (totals[key] || 0) + scores[key as keyof typeof scores];
    }
  }
  for (const key of Object.keys(totals)) {
    totals[key] /= seeds;
  }
  return totals;
}

describe("calculateRivalMotivation — flop history influence", () => {
  it("boosts CASH_CRUNCH score when rival has 1+ recent major flops", () => {
    const rival = createMockRival({
      id: "flop-r1",
      cash: 50_000_000,
      prestige: 50,
      motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    });
    const baselineState = getStateWithFlops(rival, null);
    const flopState = getStateWithFlops(
      rival,
      createFlopHistory(rival.id, 1, 0, [50])
    );

    const baselineScores = getAverageScores(rival, baselineState);
    const flopScores = getAverageScores(rival, flopState);

    expect(flopScores["CASH_CRUNCH"]).toBeGreaterThan(baselineScores["CASH_CRUNCH"]);
  });

  it("boosts STABILITY score when rival has 2+ recent major flops", () => {
    const rival = createMockRival({
      id: "flop-r2",
      cash: 50_000_000,
      prestige: 50,
      motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    });
    const baselineState = getStateWithFlops(rival, null);
    const flopState = getStateWithFlops(
      rival,
      createFlopHistory(rival.id, 2, 0, [50, 55])
    );

    const baselineScores = getAverageScores(rival, baselineState);
    const flopScores = getAverageScores(rival, flopState);

    expect(flopScores["STABILITY"]).toBeGreaterThan(baselineScores["STABILITY"]);
  });

  it("penalizes FRANCHISE_BUILDING when rival has recent major flops", () => {
    const rival = createMockRival({
      id: "flop-r3",
      cash: 50_000_000,
      prestige: 50,
      projects: { p1: {} as Project, p2: {} as Project, p3: {} as Project, p4: {} as Project },
      motivationProfile: { financial: 0, prestige: 0, legacy: 100, aggression: 0 },
    });
    const baselineState = getStateWithFlops(rival, null);
    const flopState = getStateWithFlops(
      rival,
      createFlopHistory(rival.id, 2, 0, [50, 55])
    );

    const baselineScores = getAverageScores(rival, baselineState);
    const flopScores = getAverageScores(rival, flopState);

    expect(flopScores["FRANCHISE_BUILDING"]).toBeLessThan(baselineScores["FRANCHISE_BUILDING"]);
  });

  it("penalizes MARKET_DISRUPTION when rival has recent major flops", () => {
    const rival = createMockRival({
      id: "flop-r4",
      cash: 50_000_000,
      prestige: 50,
      motivationProfile: { financial: 0, prestige: 0, legacy: 0, aggression: 100 },
    });
    const baselineState = getStateWithFlops(rival, null);
    const flopState = getStateWithFlops(
      rival,
      createFlopHistory(rival.id, 2, 0, [50, 55])
    );

    const baselineScores = getAverageScores(rival, baselineState);
    const flopScores = getAverageScores(rival, flopState);

    expect(flopScores["MARKET_DISRUPTION"]).toBeLessThan(baselineScores["MARKET_DISRUPTION"]);
  });

  it("applies larger penalty for catastrophic flops", () => {
    const rival = createMockRival({
      id: "flop-r5",
      cash: 50_000_000,
      prestige: 50,
      motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    });
    const majorFlopState = getStateWithFlops(
      rival,
      createFlopHistory(rival.id, 1, 0, [50])
    );
    const catastrophicFlopState = getStateWithFlops(
      rival,
      createFlopHistory(rival.id, 0, 1, [50])
    );

    const majorScores = getAverageScores(rival, majorFlopState);
    const catastrophicScores = getAverageScores(rival, catastrophicFlopState);

    // Catastrophic flop should boost CASH_CRUNCH more than a single major flop
    expect(catastrophicScores["CASH_CRUNCH"]).toBeGreaterThan(majorScores["CASH_CRUNCH"]);
  });

  it("does not apply flop penalty for flops older than 52 weeks", () => {
    const rival = createMockRival({
      id: "flop-r6",
      cash: 50_000_000,
      prestige: 50,
      motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    });
    const baselineState = getStateWithFlops(rival, null, 70);
    const oldFlopState = getStateWithFlops(
      rival,
      createFlopHistory(rival.id, 2, 0, [8, 9]),
      70
    );

    const baselineScores = getAverageScores(rival, baselineState);
    const oldFlopScores = getAverageScores(rival, oldFlopState);

    // Scores should be the same (no flop influence from old flops)
    expect(oldFlopScores).toEqual(baselineScores);
  });

  it("does not override motivation when no flop history exists", () => {
    const rival = createMockRival({
      id: "flop-r7",
      cash: 50_000_000,
      prestige: 50,
      motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    });
    const state = getStateWithFlops(rival, null);

    const scores = getMotivationScores(rival, state);

    // Should have results (no crash, no flop adjustment)
    expect(Object.keys(scores).length).toBeGreaterThan(0);
  });

  it("graduated adjustments do not force a motivation override", () => {
    // High-prestige rival with 2 recent major flops — AWARD_CHASE should still win naturally
    const rival = createMockRival({
      id: "flop-r8",
      cash: 20_000_000,
      prestige: 90,
      motivationProfile: { financial: 0, prestige: 100, legacy: 0, aggression: 0 },
    });
    const flopState = getStateWithFlops(
      rival,
      createFlopHistory(rival.id, 2, 0, [50, 55])
    );

    const scores = getMotivationScores(rival, flopState);

    // AWARD_CHASE should still be the dominant motivation despite flop adjustments
    expect((scores["AWARD_CHASE"] || 0)).toBeGreaterThan((scores["CASH_CRUNCH"] || 0));
  });
});
