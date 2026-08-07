import { describe, it, expect } from "vitest";
import { applySingleImpact } from "@/engine/core/impactHandlers";
import { GameState, StateImpact } from "@/engine/types";

function makeMockState(): GameState {
  return {
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    game: { currentWeek: 1 },
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
      newsHistory: [],
    },
    culture: { genrePopularity: {} },
    history: [],
  } as unknown as GameState;
}

describe("Unhandled impact types — silently dropped by handler registry", () => {
  it("HEADLINE_POSTED impact is silently dropped (no handler exists)", () => {
    const state = makeMockState();
    const impact = {
      type: "HEADLINE_POSTED",
      payload: {
        id: "HL-1-REG",
        week: 1,
        category: "industry",
        text: "Regulators express concern.",
      },
    } as unknown as StateImpact;

    const result = applySingleImpact(state, impact);
    // The impact has no handler, so state is returned unchanged
    // This proves the bug: the headline is never added to state
    expect(result).toBe(state);
    expect(result.news?.headlines?.length ?? 0).toBe(0);
  });

  it("INDUSTRY_RUMORS_UPDATED impact is silently dropped (no handler exists)", () => {
    const state = makeMockState();
    const impact = {
      type: "INDUSTRY_RUMORS_UPDATED",
      payload: {
        rumors: [],
        headlines: [
          { id: "HL-2", week: 1, category: "rumor", text: "RUMOR: Test" },
        ],
      },
    } as unknown as StateImpact;

    const result = applySingleImpact(state, impact);
    // The impact has no handler, so state is returned unchanged
    expect(result).toBe(state);
    expect(result.news?.headlines?.length ?? 0).toBe(0);
  });

  it("IP_UPDATED impact is silently dropped (no handler exists)", () => {
    const state = makeMockState();
    const impact = {
      type: "IP_UPDATED",
      payload: {
        assetId: "asset-1",
        update: {
          rightsOwner: "STUDIO",
          ownerStudioId: "player",
        },
      },
    } as unknown as StateImpact;

    const result = applySingleImpact(state, impact);
    // The impact has no handler, so state is returned unchanged
    expect(result).toBe(state);
  });
});
