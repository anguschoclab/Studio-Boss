import { describe, it, expect, vi } from "vitest";
import { advanceWeek } from "@/engine/core/weekAdvance";
import { initializeGame } from "@/engine/core/gameInit";
import * as utils from '../../../engine/utils';

describe("advanceWeek", () => {
  it("advances the game by one week and generates a summary", () => {
    const initialState = initializeGame("Test Studio", "major");

    // Set up mock data
    initialState.studio.internal.contracts = [];
    initialState.industry.talentPool = {};
    initialState.industry.awards = [];

    const { newState, summary } = advanceWeek(initialState);

    expect(newState.week).toBe(2);
    expect(summary.fromWeek).toBe(1);
    expect(summary.toWeek).toBe(2);

    expect(summary.totalCosts).toBe(500000);
    expect(summary.totalRevenue).toBe(0);
  });

  it("decreases opportunity expiry weeks and removes expired ones", () => {
    const initialState = initializeGame("Test Studio", "major");

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

    // Force Math.random to not generate new opportunities for this test in TalentSystem.advance
    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.9);

    const { newState } = advanceWeek(initialState);

    expect(newState.market.opportunities.length).toBe(1);
    expect(newState.market.opportunities[0].id).toBe("opp-stay");
    expect(newState.market.opportunities[0].weeksUntilExpiry).toBe(4);

    vi.restoreAllMocks();
  });

  it("sometimes spawns new opportunities", () => {
    const initialState = initializeGame("Test Studio", "major");
    initialState.market.opportunities = [];

    // Force Math.random to < 0.2 to trigger opportunity spawn in TalentSystem.advance
    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.01);

    const { newState, summary } = advanceWeek(initialState);

    expect(newState.market.opportunities.length).toBeGreaterThan(0);
    // UI notifications from TalentSystem.advance
    expect((summary.newsEvents || []).length + (summary.projectUpdates || []).length).toBeGreaterThan(0);

    vi.restoreAllMocks();
  });

  it("handles advancing a week with an entirely empty pipeline and empty world state without crashing", () => {
    const emptyState = initializeGame("Empty Studio", "major");

    // Explicitly empty Records and arrays
    emptyState.studio.internal.projects = {};
    emptyState.projects = { active: [] };
    emptyState.game = { currentWeek: 1 };
    emptyState.finance = { cash: 1000000, ledger: [] };
    emptyState.news = { headlines: [] };
    emptyState.culture = { genrePopularity: {} };
    emptyState.studio.internal.contracts = [];
    emptyState.studio.internal.firstLookDeals = [];
    emptyState.market.opportunities = [];
    emptyState.market.buyers = [];
    emptyState.market.activeMarketEvents = [];
    emptyState.industry.rivals = [];
    emptyState.news.headlines = [];
    emptyState.industry.talentPool = {};
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
    expect(Object.keys(newState?.studio.internal.projects || {}).length).toBe(0);
    expect(summary?.totalRevenue).toBe(0);
    expect(summary?.totalCosts).toBe(500000);
  });
});
