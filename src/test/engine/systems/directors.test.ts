import { describe, it, expect } from "vitest";
import { hasCreativeControl } from "../../../engine/systems/directors";
import { GameState, Talent, Contract } from "../../../engine/types";

describe("hasCreativeControl", () => {
  const createMockState = (talentPool: Record<string, Talent>, contracts: Contract[]): GameState => {
    return {
      week: 1,
      gameSeed: 1,
      tickCount: 0,
      projects: { active: [] },
      game: { currentWeek: 1 },
      finance: { cash: 1_000_000, ledger: [] },
      news: { headlines: [] },
      ip: { vault: [], franchises: {} },
      studio: {
        name: 'Player Studio',
        archetype: 'major',
        prestige: 50,
        internal: {
          projects: {},
          contracts,
        },
      },
      market: { opportunities: [], buyers: [] },
      industry: {
        rivals: [],
        families: [],
        agencies: [],
        agents: [],
        talentPool,
        newsHistory: []
      },
      culture: { genrePopularity: {} },
      history: [],
      eventHistory: []
    } as unknown as GameState;
  };

  it("should return false if there is no contract for the given project", () => {
    const state = createMockState({}, []);
    expect(hasCreativeControl("proj-1", state)).toBe(false);
  });

  it("should return false if the contract exists but the talent is not a director", () => {
    const talent: Talent = { id: "t-1", roles: ["actor"] } as Talent;
    const contract: Contract = { id: "c-1", talentId: "t-1", projectId: "proj-1", creativeControl: true, fee: 100_000, backendPercent: 0 };
    const state = createMockState({ "t-1": talent }, [contract]);
    expect(hasCreativeControl("proj-1", state)).toBe(false);
  });

  it("should return true if the contract exists, talent is a director, and creativeControl is true", () => {
    const talent: Talent = { id: "t-1", roles: ["director"] } as Talent;
    const contract: Contract = { id: "c-1", talentId: "t-1", projectId: "proj-1", creativeControl: true, fee: 100_000, backendPercent: 0 };
    const state = createMockState({ "t-1": talent }, [contract]);
    expect(hasCreativeControl("proj-1", state)).toBe(true);
  });
});
