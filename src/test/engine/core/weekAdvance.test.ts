import { describe, it, expect, vi } from "vitest";
import { advanceWeek } from "@/engine/core/weekAdvance";
import { initializeGame } from "@/engine/core/gameInit";
import * as utils from '../../../engine/utils';

describe("advanceWeek", () => {
  it("advances the game by one week and generates a summary", () => {
    const initialState = initializeGame("Test Studio", "indie");

    // Set up mock data
    initialState.studio.internal.contracts = [];
    initialState.industry.talentPool = [];
    initialState.industry.awards = [];

    const { newState, summary } = advanceWeek(initialState);

    expect(newState.week).toBe(2);
    expect(summary.fromWeek).toBe(1);
    expect(summary.toWeek).toBe(2);

    expect(summary.totalCosts).toBe(0);
    expect(summary.totalRevenue).toBe(0);
  });

  it("decreases opportunity expiry weeks and removes expired ones", () => {
    const initialState = initializeGame("Test Studio", "indie");

    // Add a custom opportunity that is about to expire
    initialState.market.opportunities = [
      {
        id: "opp-expire",
        title: "Expiring Script",
        type: "script",
        origin: "open_spec",
        format: "film",
        genre: "Horror",
        budgetTier: "low",
        targetAudience: "Teen",
        flavor: "Test",
        costToAcquire: 50000,
        weeksUntilExpiry: 1
      },
      {
        id: "opp-stay",
        title: "Staying Script",
        type: "script",
        origin: "open_spec",
        format: "film",
        genre: "Horror",
        budgetTier: "low",
        targetAudience: "Teen",
        flavor: "Test",
        costToAcquire: 50000,
        weeksUntilExpiry: 5
      }
    ];

    // Force Math.random to not generate new opportunities for this test
    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.9);

    const { newState } = advanceWeek(initialState);

    expect(newState.market.opportunities.length).toBe(1);
    expect(newState.market.opportunities[0].id).toBe("opp-stay");
    expect(newState.market.opportunities[0].weeksUntilExpiry).toBe(4);

    vi.restoreAllMocks();
  });

  it("sometimes spawns new opportunities", () => {
    const initialState = initializeGame("Test Studio", "indie");
    initialState.market.opportunities = [];

    // Force Math.random to < 0.3 to trigger opportunity spawn
    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.1);

    const { newState, summary } = advanceWeek(initialState);

    expect(newState.market.opportunities.length).toBeGreaterThan(0);
    expect(summary.events.some(e => e.includes('hit the market'))).toBeTruthy();

    vi.restoreAllMocks();
  });

  it("handles advancing a week with an entirely empty pipeline and empty world state without crashing", () => {
    const emptyState = initializeGame("Empty Studio", "major");

    // Explicitly empty arrays that might be pre-populated
    emptyState.studio.internal.projects = [];
    emptyState.studio.internal.contracts = [];
    emptyState.studio.internal.firstLookDeals = [];
    emptyState.market.opportunities = [];
    emptyState.market.buyers = [];
    emptyState.market.activeMarketEvents = [];
    emptyState.industry.rivals = [];
    emptyState.industry.headlines = [];
    emptyState.industry.families = [];
    emptyState.industry.agencies = [];
    emptyState.industry.agents = [];
    emptyState.industry.talentPool = [];
    emptyState.industry.awards = [];
    emptyState.industry.festivalSubmissions = [];
    emptyState.industry.rumors = [];
    emptyState.industry.scandals = [];

    let newState;
    let summary;
    expect(() => {
      const result = advanceWeek(emptyState);
      newState = result.newState;
      summary = result.summary;
    }).not.toThrow();

    expect(newState?.week).toBe(2);
    expect(newState?.studio.internal.projects).toHaveLength(0);
    expect(summary?.totalRevenue).toBe(0);
    expect(summary?.totalCosts).toBe(0);
  });
});
