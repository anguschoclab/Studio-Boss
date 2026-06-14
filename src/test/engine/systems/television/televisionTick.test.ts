import { describe, it, expect } from "vitest";
import { tickTelevision } from "../../../../engine/systems/television/televisionTick";
import { GameState, SeriesProject } from "../../../../engine/types";
import { RandomGenerator } from "../../../../engine/utils/rng";

describe("Television Tick System (Guild Auditor)", () => {
  const getMockState = (): GameState =>
    ({
      week: 1,
      entities: {
        projects: {},
        talents: {},
        contracts: {},
        rivals: {},
      },
      studio: {
        name: "Player",
        prestige: 50,
        archetype: "major",
        internal: { projects: {}, contracts: [] },
      },
      industry: {
        rivals: [],
        families: [],
        agencies: [],
        agents: [],
        talentPool: {},
        newsHistory: [],
        rumors: [],
      },
      market: { opportunities: [], buyers: [], activeMarketEvents: [] },
      culture: { genrePopularity: {} },
      finance: {
        cash: 100,
        ledger: [],
        weeklyHistory: [],
        marketState: {
          baseRate: 0.04,
          savingsYield: 0.02,
          debtRate: 0.08,
          loanRate: 0.06,
          rateHistory: [],
        },
      },
      news: { headlines: [] },
      ip: { vault: [], franchises: {} },
      game: { currentWeek: 1 },
      history: [],
      eventHistory: [],
    }) as unknown as GameState;

  const mockSeries: SeriesProject = {
    id: "tv-1",
    title: "Test Show",
    type: "SERIES",
    format: "tv",
    genre: "Comedy",
    budgetTier: "mid",
    budget: 10_000_000,
    weeklyCost: 1_000_000,
    targetAudience: "General",
    flavor: "Quirky",
    state: "released", // or post_release for some, but let's say ON_AIR
    buzz: 50,
    weeksInPhase: 1,
    developmentWeeks: 10,
    productionWeeks: 10,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: 1,
    activeCrisis: null,
    momentum: 50,
    progress: 100,
    accumulatedCost: 10_000_000,
    contentFlags: [],
    reviewScore: 50,
    scriptHeat: 50,
    scriptEvents: [],
    activeRoles: [],
    tvDetails: {
      episodesAired: 0,
      episodesOrdered: 10,
      status: "ON_AIR",
      averageRating: 0,
      currentSeason: 1,
      episodesCompleted: 10,
    },
  } as SeriesProject;

  it("handles empty state gracefully", () => {
    const state = getMockState();
    const rng = new RandomGenerator(42);
    const impacts = tickTelevision(state, rng);
    expect(impacts.length).toBe(0);
  });

  it("processes an airing show correctly", () => {
    const state = getMockState();
    state.entities.projects["tv-1"] = { ...mockSeries };
    const rng = new RandomGenerator(42);

    const impacts = tickTelevision(state, rng);

    expect(impacts.length).toBe(1);
    expect(impacts[0].type).toBe("PROJECT_UPDATED");

    const update = (impacts[0].payload as any).update;
    expect(update.tvDetails.episodesAired).toBe(1);
    expect(update.tvDetails.averageRating).toBeGreaterThan(0);
    expect(update.nielsenProfile).toBeDefined();
    expect(update.nielsenProfile.snapshots.length).toBe(1);
  });

  it("cancels a show if it finishes its run with a poor rating", () => {
    const state = getMockState();
    const poorShow = {
      ...mockSeries,
      reviewScore: 0,
      buzz: 0,
      tvDetails: {
        ...mockSeries.tvDetails,
        episodesAired: 9, // Next episode will be the 10th (last)
        episodesOrdered: 10,
        averageRating: 0.1, // Terrible
      },
    } as SeriesProject;
    state.entities.projects["tv-1"] = poorShow;

    const rng = new RandomGenerator(42);

    poorShow.tvDetails.episodesAired = 10;

    const impacts = tickTelevision(state, rng);

    // We expect PROJECT_UPDATED and PROJECT_REMOVED (since it's cancelled)
    const updateImpact = impacts.find((i) => i.type === "PROJECT_UPDATED");
    const removeImpact = impacts.find((i) => i.type === "PROJECT_REMOVED");

    expect(updateImpact).toBeDefined();
    expect((updateImpact!.payload as any).update.tvDetails.status).toBe("CANCELLED");
    expect(removeImpact).toBeDefined();
  });

  it("renews a show if it finishes its run with a great rating", () => {
    const state = getMockState();
    const hitShow = {
      ...mockSeries,
      reviewScore: 100,
      buzz: 100,
      tvDetails: {
        ...mockSeries.tvDetails,
        episodesAired: 10,
        episodesOrdered: 10,
        averageRating: 9.5, // Great
      },
    } as SeriesProject;
    state.entities.projects["tv-1"] = hitShow;

    const rng = new RandomGenerator(42);

    const impacts = tickTelevision(state, rng);

    const updateImpact = impacts.find((i) => i.type === "PROJECT_UPDATED");

    expect(updateImpact).toBeDefined();
    expect((updateImpact!.payload as any).update.tvDetails.status).toBe("RENEWED");
  });

  it("ignores shows that are not ON_AIR", () => {
    const state = getMockState();
    const devShow = {
      ...mockSeries,
      tvDetails: {
        ...mockSeries.tvDetails,
        status: "IN_DEVELOPMENT",
      },
    } as SeriesProject;
    state.entities.projects["tv-1"] = devShow;

    const rng = new RandomGenerator(42);

    const impacts = tickTelevision(state, rng);

    expect(impacts.length).toBe(0);
  });
});
