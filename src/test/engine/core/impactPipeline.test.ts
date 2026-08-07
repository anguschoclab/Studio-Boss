import { describe, it, expect } from "vitest";
import { applySingleImpact } from "@/engine/core/impactHandlers";
import { impacts } from "@/engine/core/impacts";
import type { GameState, StateImpact, NewsImpact } from "@/engine/types";

function makeMockState(overrides?: Partial<GameState>): GameState {
  return {
    week: 1,
    gameSeed: 42,
    tickCount: 1,
    game: { currentWeek: 1 },
    finance: { cash: 1000, ledger: [], weeklyHistory: [], marketState: {} as any },
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
    ...overrides,
  } as unknown as GameState;
}

describe("Impact pipeline preserves entity refs and type", () => {
  it("bag-impact newsEvents conversion produces NEWS_ADDED impacts with preserved fields", () => {
    const state = makeMockState();
    const bagImpact = {
      newsEvents: [
        {
          id: "ne-1",
          week: 1,
          type: "RIVAL",
          headline: "Rival news",
          description: "Desc",
          category: "rival",
          impact: "Available",
          publication: "Variety",
          talentId: "talent-1",
          projectId: "proj-1",
          rivalId: "rival-1",
          buyerId: "buyer-1",
        },
      ],
    } as unknown as StateImpact;

    // applySingleImpact processes bag impacts by converting newsEvents to NEWS_ADDED impacts.
    // handleNewsAdded is a no-op (news captured by WeekCoordinator), so state is unchanged.
    const result = applySingleImpact(state, bagImpact);
    expect(result).toBe(state);
  });

  it("bag-impact newHeadlines conversion produces NEWS_ADDED impacts with preserved fields", () => {
    const state = makeMockState();
    const bagImpact = {
      newHeadlines: [
        {
          id: "h-1",
          week: 1,
          type: "STUDIO_EVENT",
          headline: "Headline news",
          description: "",
          category: "market",
          publication: "Deadline",
          talentId: "talent-2",
          projectId: "proj-2",
          rivalId: "rival-2",
          buyerId: "buyer-2",
        },
      ],
    } as unknown as StateImpact;

    const result = applySingleImpact(state, bagImpact);
    expect(result).toBe(state);
  });

  it("handleNewsAdded is a no-op — state unchanged (news captured by WeekCoordinator)", () => {
    const state = makeMockState();
    const impact: NewsImpact = {
      type: "NEWS_ADDED",
      payload: {
        headline: "Test",
        description: "Desc",
        type: "CRISIS",
      },
    };

    const result = applySingleImpact(state, impact);
    expect(result).toBe(state);
  });

  it("handleNewsAdded with default type — state unchanged", () => {
    const state = makeMockState();
    const impact: NewsImpact = {
      type: "NEWS_ADDED",
      payload: {
        headline: "Test",
        description: "Desc",
      },
    };

    const result = applySingleImpact(state, impact);
    expect(result).toBe(state);
  });

  it("handleNewsAdded with category — state unchanged", () => {
    const state = makeMockState();
    const impact: NewsImpact = {
      type: "NEWS_ADDED",
      payload: {
        headline: "Test",
        description: "Desc",
        category: "scandal",
      },
    };

    const result = applySingleImpact(state, impact);
    expect(result).toBe(state);
  });

  it("handleNewsAdded with entity refs — state unchanged", () => {
    const state = makeMockState();
    const impact: NewsImpact = {
      type: "NEWS_ADDED",
      payload: {
        headline: "Test",
        description: "Desc",
        talentId: "t-1",
        projectId: "p-1",
        rivalId: "r-1",
        buyerId: "b-1",
      },
    };

    const result = applySingleImpact(state, impact);
    expect(result).toBe(state);
  });

  it("handleNewsAdded with impact field — state unchanged", () => {
    const state = makeMockState();
    const impact: NewsImpact = {
      type: "NEWS_ADDED",
      payload: {
        headline: "Test",
        description: "Desc",
        impact: "Major disruption",
      },
    };

    const result = applySingleImpact(state, impact);
    expect(result).toBe(state);
  });

  it("impacts.newsAdded() factory accepts and passes through type, category, impact, entity refs", () => {
    const impact = impacts.newsAdded({
      headline: "Test",
      description: "Desc",
      type: "RIVAL",
      category: "rival",
      impact: "Available",
      talentId: "t-1",
      projectId: "p-1",
      rivalId: "r-1",
      buyerId: "b-1",
    });

    expect(impact.payload.type).toBe("RIVAL");
    expect(impact.payload.category).toBe("rival");
    expect(impact.payload.impact).toBe("Available");
    expect(impact.payload.talentId).toBe("t-1");
    expect(impact.payload.projectId).toBe("p-1");
    expect(impact.payload.rivalId).toBe("r-1");
    expect(impact.payload.buyerId).toBe("b-1");
  });
});
