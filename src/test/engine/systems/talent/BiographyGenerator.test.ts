import { describe, it, expect } from "vitest";
import { tickBiographyGenerator } from "../../../../engine/systems/talent/BiographyGenerator";
import { RandomGenerator } from "../../../../engine/utils/rng";
import { GameState, Talent } from "../../../../engine/types";

function createMockState(overrides: Partial<GameState> = {}): GameState {
  const base: GameState = {
    week: 10,
    gameSeed: 1,
    tickCount: 0,
    game: { currentWeek: 10 },
    finance: { cash: 1_000_000, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    entities: {
      projects: {},
      releasedProjectIds: [],
      talents: {},
      contracts: {},
      rivals: {},
    },
    studio: {
      name: "Test Studio",
      id: "PLAYER",
      archetype: "major",
      prestige: 50,
      cash: 1_000_000,
      internal: { projects: {}, contracts: [] },
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      families: [],
      agencies: [],
      agents: [],
      newsHistory: [],
    },
    culture: { genrePopularity: {} },
    history: [],
    eventHistory: [],
  } as unknown as GameState;

  return { ...base, ...overrides } as unknown as GameState;
}

function createMockTalent(id: string, overrides: Partial<Talent> & Record<string, any> = {}): Talent {
  return {
    id,
    name: `Talent ${id}`,
    role: "actor",
    roles: ["actor"],
    tier: 'C_LIST',
    bio: "This Tier 3 talent is a rising star.",
    starMeter: 50,
    prestige: 50,
    demographics: { age: 30, gender: "MALE", ethnicity: "White", country: "USA" },
    psychology: { ego: 50, mood: 100, scandalRisk: 0, synergyAffinities: [], synergyConflicts: [] },
    ...overrides,
  } as unknown as Talent;
}

const rng = () => new RandomGenerator(42);

describe("tickBiographyGenerator", () => {
  it("returns empty impacts when no talents exist", () => {
    const state = createMockState();
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts).toEqual([]);
  });

  it("updates bio for talent with default bio", () => {
    const talent = createMockTalent("t1", {
      bio: "This Tier 3 talent is a rising star.",
    });
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts.length).toBe(1);
    expect(impacts[0].type).toBe("TALENT_UPDATED");
  });

  it("does not update bio when bio is custom and no triggers", () => {
    const talent = createMockTalent("t1", {
      bio: "A completely custom bio that doesn't match the default pattern.",
      isBreakout: false,
    } as any);
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts).toEqual([]);
  });

  it("updates bio for breakout talent", () => {
    const talent = createMockTalent("t1", {
      bio: "A completely custom bio that doesn't match default.",
      isBreakout: true,
    } as any);
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts.length).toBe(1);
    expect(impacts[0].type).toBe("TALENT_UPDATED");
  });

  it("updates bio for talent with recent relationship", () => {
    const talentA = createMockTalent("t1", {
      bio: "Custom bio no default markers here.",
    });
    const talentB = createMockTalent("t2", {
      bio: "Custom bio no default markers here.",
    });
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talentA, t2: talentB },
        contracts: {},
        rivals: {},
      },
      relationships: {
        relationships: {
          "t1-t2": {
            id: "t1-t2",
            talentAId: "t1",
            talentBId: "t2",
            type: "friend",
            strength: 50,
            isPublic: true,
            history: [],
            formedWeek: 8,
            lastUpdatedWeek: 8,
          },
        },
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    const updatedIds = impacts.map((i) => (i as any).payload?.talentId);
    expect(updatedIds).toContain("t1");
    expect(updatedIds).toContain("t2");
  });

  it("does not update bio for old relationship", () => {
    const talent = createMockTalent("t1", {
      bio: "Custom bio no default markers here.",
    });
    const state = createMockState({
      week: 20,
      game: { currentWeek: 20 },
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
      relationships: {
        relationships: {
          "t1-t2": {
            id: "t1-t2",
            talentAId: "t1",
            talentBId: "t2",
            type: "friend",
            strength: 50,
            isPublic: true,
            history: [],
            formedWeek: 5,
            lastUpdatedWeek: 5,
          },
        },
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts).toEqual([]);
  });

  it("updates bio for talent in recently formed clique", () => {
    const talent = createMockTalent("t1", {
      bio: "Custom bio no default markers here.",
    });
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
      relationships: {
        relationships: {},
        cliques: {
          cliques: {
            "clq1": {
              id: "clq1",
              name: "The Cool Kids",
              members: ["t1"],
              formedWeek: 8,
              status: "active",
              fameBonus: 10,
              reputation: "cool",
              exclusivity: 50,
              combinedStarPower: 100,
              reunionPotential: 30,
              internalConflicts: [],
            },
          },
          memberCliqueMap: { t1: ["clq1"] },
        },
      } as any,
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts.length).toBe(1);
    expect((impacts[0] as any).payload?.talentId).toBe("t1");
  });

  it("does not update bio for old clique", () => {
    const talent = createMockTalent("t1", {
      bio: "Custom bio no default markers here.",
    });
    const state = createMockState({
      week: 20,
      game: { currentWeek: 20 },
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
      relationships: {
        relationships: {},
        cliques: {
          cliques: {
            "clq1": {
              id: "clq1",
              name: "The Old Kids",
              members: ["t1"],
              formedWeek: 5,
              status: "active",
              fameBonus: 10,
              reputation: "cool",
              exclusivity: 50,
              combinedStarPower: 100,
              reunionPotential: 30,
              internalConflicts: [],
            },
          },
          memberCliqueMap: { t1: ["clq1"] },
        },
      } as any,
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts).toEqual([]);
  });

  it("updates bio for talent with active scandal", () => {
    const talent = createMockTalent("t1", {
      bio: "Custom bio no default markers here.",
    });
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
      industry: {
        families: [],
        agencies: [],
        agents: [],
        newsHistory: [],
        scandals: [
          {
            id: "sc1",
            talentId: "t1",
            severity: 60,
            type: "personal",
            weeksRemaining: 3,
          },
        ],
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts.length).toBe(1);
    expect((impacts[0] as any).payload?.talentId).toBe("t1");
  });

  it("does not update bio for resolved scandal", () => {
    const talent = createMockTalent("t1", {
      bio: "Custom bio no default markers here.",
    });
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
      industry: {
        families: [],
        agencies: [],
        agents: [],
        newsHistory: [],
        scandals: [
          {
            id: "sc1",
            talentId: "t1",
            severity: 60,
            type: "personal",
            weeksRemaining: 0,
          },
        ],
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts).toEqual([]);
  });

  it("impact payload contains talentId and bio update", () => {
    const talent = createMockTalent("t1", {
      bio: "This Tier 3 talent is a rising star.",
    });
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts.length).toBe(1);
    const impact = impacts[0] as any;
    expect(impact.type).toBe("TALENT_UPDATED");
    expect(impact.payload.talentId).toBe("t1");
    expect(typeof impact.payload.update.bio).toBe("string");
    expect(impact.payload.update.bio.length).toBeGreaterThan(0);
  });

  it("handles missing relationships gracefully", () => {
    const talent = createMockTalent("t1", {
      bio: "This Tier 3 talent is a rising star.",
    });
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts.length).toBe(1);
  });

  it("handles missing cliques gracefully", () => {
    const talent = createMockTalent("t1", {
      bio: "This Tier 3 talent is a rising star.",
    });
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
      relationships: {
        relationships: {},
      } as any,
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts.length).toBe(1);
  });

  it("handles missing scandals gracefully", () => {
    const talent = createMockTalent("t1", {
      bio: "This Tier 3 talent is a rising star.",
    });
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent },
        contracts: {},
        rivals: {},
      },
      industry: {
        families: [],
        agencies: [],
        agents: [],
        newsHistory: [],
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    expect(impacts.length).toBe(1);
  });

  it("processes multiple talents with mixed triggers", () => {
    const talent1 = createMockTalent("t1", {
      bio: "This Tier 3 talent is a rising star.",
    });
    const talent2 = createMockTalent("t2", {
      bio: "Custom bio no default markers.",
    });
    const talent3 = createMockTalent("t3", {
      bio: "Another custom bio with no triggers.",
    });
    const state = createMockState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { t1: talent1, t2: talent2, t3: talent3 },
        contracts: {},
        rivals: {},
      },
      relationships: {
        relationships: {
          "t2-tX": {
            id: "t2-tX",
            talentAId: "t2",
            talentBId: "tX",
            type: "friend",
            strength: 50,
            isPublic: true,
            history: [],
            formedWeek: 9,
            lastUpdatedWeek: 9,
          },
        },
      },
    });
    const impacts = tickBiographyGenerator(state, rng());
    const updatedIds = impacts.map((i) => (i as any).payload?.talentId);
    expect(updatedIds).toContain("t1");
    expect(updatedIds).toContain("t2");
    expect(updatedIds).not.toContain("t3");
    expect(impacts.length).toBe(2);
  });
});
