import { describe, it, expect } from "vitest";
import type {
  NewsEvent,
  Headline,
  WeekSummary,
} from "@/engine/types";
import type { NewsImpact } from "@/engine/types/state.types";
import type { GameState } from "@/engine/types/studio.types";

describe("NewsEvent type", () => {
  it("includes category field as optional HeadlineCategory", () => {
    const event: NewsEvent = {
      id: "test-1",
      week: 1,
      type: "STUDIO_EVENT",
      headline: "Test",
      description: "Test desc",
      category: "general",
    };
    expect(event.category).toBe("general");
  });

  it("allows category to be undefined", () => {
    const event: NewsEvent = {
      id: "test-2",
      week: 1,
      type: "CRISIS",
      headline: "Test",
      description: "Test desc",
    };
    expect(event.category).toBeUndefined();
  });

  it("includes entity reference fields as optional", () => {
    const event: NewsEvent = {
      id: "test-3",
      week: 1,
      type: "RIVAL",
      headline: "Test",
      description: "Test desc",
      talentId: "talent-1",
      projectId: "proj-1",
      rivalId: "rival-1",
      buyerId: "buyer-1",
    };
    expect(event.talentId).toBe("talent-1");
    expect(event.projectId).toBe("proj-1");
    expect(event.rivalId).toBe("rival-1");
    expect(event.buyerId).toBe("buyer-1");
  });

  it("allows entity refs to be undefined", () => {
    const event: NewsEvent = {
      id: "test-4",
      week: 1,
      type: "AWARD",
      headline: "Test",
      description: "Test desc",
    };
    expect(event.talentId).toBeUndefined();
    expect(event.projectId).toBeUndefined();
    expect(event.rivalId).toBeUndefined();
    expect(event.buyerId).toBeUndefined();
  });
});

describe("Headline type (migration alias)", () => {
  it("is assignable to NewsEvent", () => {
    const headline: Headline = {
      id: "h-1",
      week: 1,
      type: "STUDIO_EVENT",
      headline: "Test headline",
      description: "",
      category: "general",
    };
    expect(headline.headline).toBe("Test headline");
  });
});

describe("WeekSummary type", () => {
  it("has newsEvents as a required field", () => {
    const summary: WeekSummary = {
      fromWeek: 1,
      toWeek: 2,
      cashBefore: 1000,
      cashAfter: 2000,
      totalRevenue: 500,
      totalCosts: 300,
      projectUpdates: [],
      newHeadlines: [],
      newsEvents: [],
      events: [],
    };
    expect(summary.newsEvents).toEqual([]);
  });

  it("newsEvents accepts NewsEvent objects with entity refs", () => {
    const event: NewsEvent = {
      id: "ne-1",
      week: 2,
      type: "RIVAL",
      headline: "Rival news",
      description: "Desc",
      category: "rival",
      rivalId: "rival-1",
    };
    const summary: WeekSummary = {
      fromWeek: 1,
      toWeek: 2,
      cashBefore: 1000,
      cashAfter: 2000,
      totalRevenue: 0,
      totalCosts: 0,
      projectUpdates: [],
      newHeadlines: [],
      newsEvents: [event],
      events: [],
    };
    expect(summary.newsEvents[0].rivalId).toBe("rival-1");
  });
});

describe("NewsImpact payload type", () => {
  it("includes type, category, impact, and entity ref fields", () => {
    const impact: NewsImpact = {
      type: "NEWS_ADDED",
      payload: {
        headline: "Test headline",
        description: "Test desc",
        type: "RIVAL",
        category: "rival",
        impact: "Available for acquisition",
        talentId: "talent-1",
        projectId: "proj-1",
        rivalId: "rival-1",
        buyerId: "buyer-1",
      },
    };
    expect(impact.payload.type).toBe("RIVAL");
    expect(impact.payload.category).toBe("rival");
    expect(impact.payload.impact).toBe("Available for acquisition");
    expect(impact.payload.talentId).toBe("talent-1");
    expect(impact.payload.projectId).toBe("proj-1");
    expect(impact.payload.rivalId).toBe("rival-1");
    expect(impact.payload.buyerId).toBe("buyer-1");
  });
});

describe("GameState type", () => {
  it("includes weekSummaries field", () => {
    const state = {
      week: 1,
      gameSeed: 42,
      tickCount: 1,
      game: { currentWeek: 1 },
      finance: { cash: 1000, ledger: [] },
      news: { headlines: [] },
      ip: { vault: [], franchises: {} },
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
      studio: {
        id: "player",
        name: "Test",
        archetype: "indie",
        prestige: 0,
        internal: { projectHistory: [], projects: {}, contracts: [] },
      },
      market: { opportunities: [], buyers: [] },
      industry: {
        families: [],
        agencies: [],
        agents: [],
      },
      culture: { genrePopularity: {} },
      history: [],
      eventHistory: [],
      weekSummaries: [],
    } as unknown as GameState;
    expect(state.weekSummaries).toEqual([]);
  });
});
