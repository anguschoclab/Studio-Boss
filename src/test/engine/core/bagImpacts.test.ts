import { describe, it, expect } from "vitest";
import { GameState, StateImpact } from "@/engine/types";
import { applySingleImpact } from "@/engine/core/impactHandlers";

function makeMockState(): GameState {
  return {
    week: 5,
    gameSeed: 1,
    tickCount: 0,
    projects: { active: [] },
    game: { currentWeek: 5 },
    finance: { cash: 1_000_000, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    entities: {
      projects: {},
      talents: {},
      contracts: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
      rivals: {},
    },
    studio: {
      name: "Test Studio",
      id: "PLAYER",
      archetype: "major",
      prestige: 50,
      cash: 1_000_000,
      internal: {
        projects: {},
        contracts: [],
      },
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
    },
    culture: { genrePopularity: {} },
    history: [],
  } as unknown as GameState;
}

describe("bag impacts (untyped BaseImpact fields)", () => {
  it("applies newRumors as a full-list replace of industry.rumors", () => {
    const state = makeMockState();
    const next = applySingleImpact(state, {
      newRumors: [
        { id: "r1", text: "x", week: 1, truthful: true, category: "talent", resolved: false },
      ],
    } as StateImpact);
    expect(next.industry.rumors).toHaveLength(1);
  });

  it("applies buyerUpdates by buyerId merge", () => {
    const state = makeMockState();
    state.market.buyers = [{ id: "b1", name: "Apex" }] as GameState["market"]["buyers"];
    const next = applySingleImpact(state, {
      buyerUpdates: [{ buyerId: "b1", update: { name: "Apex Prime" } }],
    } as StateImpact);
    expect(next.market.buyers[0].name).toBe("Apex Prime");
  });

  it("replaces industry.festivalSubmissions with newFestivalSubmissions", () => {
    const state = makeMockState();
    state.industry.festivalSubmissions = [{ id: "old" }] as never;
    const next = applySingleImpact(state, {
      newFestivalSubmissions: [{ id: "s1" }, { id: "s2" }],
    } as StateImpact);
    expect(next.industry.festivalSubmissions).toHaveLength(2);
    expect(next.industry.festivalSubmissions![0].id).toBe("s1");
  });

  it("appends newScandals to industry.scandals", () => {
    const state = makeMockState();
    state.industry.scandals = [
      { id: "s0", talentId: "t0", severity: 10, type: "personal", weeksRemaining: 2 },
    ] as never;
    const next = applySingleImpact(state, {
      newScandals: [
        { id: "s1", talentId: "t1", severity: 50, type: "legal", weeksRemaining: 6 },
      ],
    } as StateImpact);
    expect(next.industry.scandals).toHaveLength(2);
    expect(next.industry.scandals![1].id).toBe("s1");
  });

  it("replaces market.opportunities with newOpportunities", () => {
    const state = makeMockState();
    const next = applySingleImpact(state, {
      newOpportunities: [{ id: "opp1" }],
    } as StateImpact);
    expect(next.market.opportunities).toHaveLength(1);
  });

  it("applies newTrends via TRENDS_UPDATED to market.trends", () => {
    const state = makeMockState();
    const next = applySingleImpact(state, {
      newTrends: [{ genre: "Sci-Fi", heat: 80 }],
    } as unknown as StateImpact);
    expect(next.market.trends).toHaveLength(1);
  });

  it("applies newMarketEvents via MARKET_EVENT_UPDATED to market.activeMarketEvents", () => {
    const state = makeMockState();
    const next = applySingleImpact(state, {
      newMarketEvents: [{ id: "me1", type: "boom" }],
    } as unknown as StateImpact);
    expect(next.market.activeMarketEvents).toHaveLength(1);
  });

  it("applies talentUpdates via TALENT_UPDATED merge", () => {
    const state = makeMockState();
    state.entities.talents["t1"] = {
      id: "t1",
      name: "Star",
      prestige: 10,
    } as GameState["entities"]["talents"][string];
    const next = applySingleImpact(state, {
      talentUpdates: [{ talentId: "t1", update: { prestige: 60 } }],
    } as StateImpact);
    expect(next.entities.talents["t1"].prestige).toBe(60);
  });

  it("smoke: bag newsEvents dispatch without throwing (week forwarded in payload)", () => {
    const state = makeMockState();
    // handleNewsAdded is a documented no-op (coordinator collects summaries);
    // this pins that the bag dispatch path accepts the full payload incl. week.
    const next = applySingleImpact(state, {
      newsEvents: [{ id: "n1", headline: "h", week: 42, type: "CRISIS" }],
    } as unknown as StateImpact);
    // NEWS_ADDED handler is a documented no-op: state is returned unchanged.
    expect(next).toBe(state);
  });
});
