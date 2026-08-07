import {describe it expect beforeEach} from "vitest";
import {WeekCoordinator TickContext} from "@/engine/services/WeekCoordinator";
import {GameState StateImpact} from "@/engine/types";
import {RandomGenerator} from "@/engine/utils/rng";
import {createMockGameState} from "@/test/utils/mockFactories";

describe("WeekCoordinator.buildSummary", () => {
  let beforeState: GameState;
  let afterState: GameState;
  let context: TickContext;

  beforeEach(() => {
    beforeState = createMockGameState({ week: 1, tickCount: 1 });
    afterState = createMockGameState({
      week: 2,
      tickCount: 2,
      finance: { ...beforeState.finance, cash: 11_000_000 },
    });

    context = {
      week: 2,
      tickCount: 2,
      rng: new RandomGenerator(42),
      timestamp: 2000,
      impacts: [],
      events: [],
    };
  });

  it("extracts LEDGER_UPDATED impact and computes totalRevenue/totalCosts", () => {
    context.impacts.push({
      type: "LEDGER_UPDATED",
      payload: {
        report: {
          week: 1,
          year: 1,
          startingCash: 10_000_000,
          revenue: { boxOffice: 1_000_000, distribution: 500_000, other: 200_000 },
          expenses: { production: 800_000, marketing: 300_000, overhead: 100_000, pacts: 50_000 },
          endingCash: 10_750_000,
          netProfit: 750_000,
        },
      },
    } as unknown as StateImpact);

    // Access private method via reflection
    const summary = (WeekCoordinator as unknown as {
      buildSummary: (b: GameState, a: GameState, c: TickContext) => unknown;
    }).buildSummary(beforeState, afterState, context);

    expect(summary).toHaveProperty("totalRevenue", 1_700_000);
    expect(summary).toHaveProperty("totalCosts", 1_200_000);
  });

  it("with no LEDGER_UPDATED impact has totalRevenue=0 and totalCosts=0", () => {
    const summary = (WeekCoordinator as unknown as {
      buildSummary: (b: GameState, a: GameState, c: TickContext) => unknown;
    }).buildSummary(beforeState, afterState, context);

    expect(summary).toHaveProperty("totalRevenue", 0);
    expect(summary).toHaveProperty("totalCosts", 0);
  });

  it("collects NEWS_ADDED impacts into newsEvents", () => {
    context.impacts.push({
      type: "NEWS_ADDED",
      payload: { headline: "Breaking News", category: "general", type: "CRISIS" },
    } as unknown as StateImpact);

    const summary = (WeekCoordinator as unknown as {
      buildSummary: (b: GameState, a: GameState, c: TickContext) => {
        newsEvents: { headline: string; type: string }[];
      };
    }).buildSummary(beforeState, afterState, context);

    expect(summary.newsEvents.length).toBeGreaterThan(0);
    expect(summary.newsEvents[0].headline).toBe("Breaking News");
    expect(summary.newsEvents[0].type).toBe("CRISIS");
  });

  it("newsEvents preserves entity refs from NEWS_ADDED impacts", () => {
    context.impacts.push({
      type: "NEWS_ADDED",
      payload: {
        headline: "Rival news",
        description: "Desc",
        type: "RIVAL",
        category: "rival",
        rivalId: "rival-1",
        talentId: "talent-1",
        projectId: "proj-1",
      },
    } as unknown as StateImpact);

    const summary = (WeekCoordinator as unknown as {
      buildSummary: (b: GameState, a: GameState, c: TickContext) => {
        newsEvents: { rivalId?: string; talentId?: string; projectId?: string }[];
      };
    }).buildSummary(beforeState, afterState, context);

    expect(summary.newsEvents[0].rivalId).toBe("rival-1");
    expect(summary.newsEvents[0].talentId).toBe("talent-1");
    expect(summary.newsEvents[0].projectId).toBe("proj-1");
  });

  it("collects compound newsEvents from bag impacts into newsEvents", () => {
    context.impacts.push({
      newsEvents: [
        {
          id: "ne-1",
          week: 2,
          type: "RIVAL",
          headline: "Compound news",
          description: "Desc",
          rivalId: "rival-2",
        },
      ],
    } as unknown as StateImpact);

    const summary = (WeekCoordinator as unknown as {
      buildSummary: (b: GameState, a: GameState, c: TickContext) => {
        newsEvents: { headline: string; rivalId?: string }[];
      };
    }).buildSummary(beforeState, afterState, context);

    expect(summary.newsEvents.some((e: any) => e.headline === "Compound news")).toBe(true);
    expect(summary.newsEvents.find((e: any) => e.headline === "Compound news")?.rivalId).toBe("rival-2");
  });

  it("collects compound newsEvents from bag impacts into summary newsEvents", () => {
    context.impacts.push({
      newsEvents: [
        {
          id: "h-1",
          week: 2,
          type: "STUDIO_EVENT",
          headline: "Bag headline news",
          description: "",
          category: "market",
        },
      ],
    } as unknown as StateImpact);

    const summary = (WeekCoordinator as unknown as {
      buildSummary: (b: GameState, a: GameState, c: TickContext) => {
        newsEvents: { headline: string; category?: string }[];
      };
    }).buildSummary(beforeState, afterState, context);

    expect(summary.newsEvents.some((e: any) => e.headline === "Bag headline news")).toBe(true);
    expect(summary.newsEvents.find((e: any) => e.headline === "Bag headline news")?.category).toBe("market");
  });

  it("collects PROJECT_UPDATED impacts into projectUpdates", () => {
    context.impacts.push({
      type: "PROJECT_UPDATED",
      payload: { projectId: "proj-1", update: { progress: 50 } },
    } as unknown as StateImpact);
    context.impacts.push({
      type: "PROJECT_UPDATED",
      payload: { projectId: "proj-2", update: { progress: 80 } },
    } as unknown as StateImpact);

    const summary = (WeekCoordinator as unknown as {
      buildSummary: (b: GameState, a: GameState, c: TickContext) => {
        projectUpdates: string[];
      };
    }).buildSummary(beforeState, afterState, context);

    expect(summary.projectUpdates).toContain("proj-1");
    expect(summary.projectUpdates).toContain("proj-2");
  });

  it("with multiple LEDGER_UPDATED impacts uses the first one", () => {
    context.impacts.push({
      type: "LEDGER_UPDATED",
      payload: {
        report: {
          week: 1,
          year: 1,
          startingCash: 10_000_000,
          revenue: { boxOffice: 1_000_000, distribution: 0, other: 0 },
          expenses: { production: 100_000, marketing: 0, overhead: 0, pacts: 0 },
          endingCash: 10_900_000,
          netProfit: 900_000,
        },
      },
    } as unknown as StateImpact);
    context.impacts.push({
      type: "LEDGER_UPDATED",
      payload: {
        report: {
          week: 1,
          year: 1,
          startingCash: 10_000_000,
          revenue: { boxOffice: 5_000_000, distribution: 0, other: 0 },
          expenses: { production: 500_000, marketing: 0, overhead: 0, pacts: 0 },
          endingCash: 14_500_000,
          netProfit: 4_500_000,
        },
      },
    } as unknown as StateImpact);

    const summary = (WeekCoordinator as unknown as {
      buildSummary: (b: GameState, a: GameState, c: TickContext) => {
        totalRevenue: number;
      };
    }).buildSummary(beforeState, afterState, context);

    // Should use the first LEDGER_UPDATED impact (revenue=1_000_000)
    expect(summary.totalRevenue).toBe(1_000_000);
  });

  it("detects quiet week correctly", () => {
    // No impacts, no events, no revenue/costs
    const summary = (WeekCoordinator as unknown as {
      buildSummary: (b: GameState, a: GameState, c: TickContext) => {
        isQuietWeek: boolean;
      };
    }).buildSummary(beforeState, afterState, context);

    expect(summary.isQuietWeek).toBe(true);
  });

  it("does not flag as quiet week when there are project updates", () => {
    context.impacts.push({
      type: "PROJECT_UPDATED",
      payload: { projectId: "proj-1", update: { progress: 50 } },
    } as unknown as StateImpact);

    const summary = (WeekCoordinator as unknown as {
      buildSummary: (b: GameState, a: GameState, c: TickContext) => {
        isQuietWeek: boolean;
      };
    }).buildSummary(beforeState, afterState, context);

    expect(summary.isQuietWeek).toBe(false);
  });
});
