import { describe, it, expect } from "vitest";
import { applySingleImpact } from "@/engine/core/impactHandlers";
import { GameState, StateImpact } from "@/engine/types";

function makeMockState(overrides: Partial<GameState> = {}): GameState {
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
    ...overrides,
  } as unknown as GameState;
}

describe("Previously unhandled impact types — now properly handled", () => {
  it("HEADLINE_POSTED impact adds headline to state.news.headlines", () => {
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
    expect(result.news?.headlines?.length ?? 0).toBe(1);
    expect(result.news!.headlines![0].id).toBe("HL-1-REG");
    expect(result.news!.headlines![0].text).toBe("Regulators express concern.");
  });

  it("INDUSTRY_RUMORS_UPDATED impact updates rumors and adds headlines", () => {
    const state = makeMockState();
    const newRumors = [
      { id: "r1", text: "Test rumor", week: 1, category: "talent", resolved: false },
    ];
    const impact = {
      type: "INDUSTRY_RUMORS_UPDATED",
      payload: {
        rumors: newRumors,
        headlines: [
          { id: "HL-2", week: 1, category: "rumor", text: "RUMOR: Test" },
        ],
      },
    } as unknown as StateImpact;

    const result = applySingleImpact(state, impact);
    expect(result.industry.rumors).toEqual(newRumors);
    expect(result.news?.headlines?.length ?? 0).toBe(1);
    expect(result.news!.headlines![0].text).toBe("RUMOR: Test");
  });

  it("IP_UPDATED impact updates the vault asset by assetId", () => {
    const state = makeMockState({
      ip: {
        vault: [
          { id: "asset-1", title: "Test IP", rightsOwner: "RIVAL" } as any,
        ],
        franchises: {},
      },
    });
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
    expect(result.ip.vault[0].rightsOwner).toBe("STUDIO");
    expect((result.ip.vault[0] as any).ownerStudioId).toBe("player");
  });

  it("IP_UPDATED impact leaves other assets unchanged", () => {
    const state = makeMockState({
      ip: {
        vault: [
          { id: "asset-1", title: "IP One", rightsOwner: "RIVAL" } as any,
          { id: "asset-2", title: "IP Two", rightsOwner: "RIVAL" } as any,
        ],
        franchises: {},
      },
    });
    const impact = {
      type: "IP_UPDATED",
      payload: {
        assetId: "asset-1",
        update: { rightsOwner: "STUDIO" },
      },
    } as unknown as StateImpact;

    const result = applySingleImpact(state, impact);
    expect(result.ip.vault[0].rightsOwner).toBe("STUDIO");
    expect(result.ip.vault[1].rightsOwner).toBe("RIVAL");
  });
});
