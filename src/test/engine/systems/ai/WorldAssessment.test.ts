import { describe, it, expect } from "vitest";
import {
  buildWorldAssessment,
  cycleFromHeat,
  stanceFor,
} from "@/engine/systems/ai/WorldAssessment";
import {
  createMockGameState,
  createMockRival,
  createMockProject,
} from "../../generators/mockFactory";

describe("WorldAssessment — shared AI blackboard", () => {
  it("is a pure function of state (no RNG, deterministic)", () => {
    const state = createMockGameState({ week: 10 });
    const a = buildWorldAssessment(state);
    const b = buildWorldAssessment(state);
    expect(a).toEqual(b);
  });

  it("censuses rival-owned active projects from canonical entities, not rival.projects", () => {
    const rival = createMockRival({ id: "riv-1", projects: {} });
    const state = createMockGameState({ week: 10 });
    state.entities.rivals = { "riv-1": rival };
    state.entities.projects = {
      p1: createMockProject({
        id: "p1",
        ownerId: "riv-1",
        state: "production",
        weeklyCost: 1_000_000,
      }),
      p2: createMockProject({ id: "p2", ownerId: "riv-1", state: "marketing" }),
      p3: createMockProject({ id: "p3", ownerId: "riv-1", state: "released" }),
    };

    const world = buildWorldAssessment(state);
    expect(world.studioStandings["riv-1"].activeProjects).toBe(2);
    // runway = cash / weekly burn; cash 50M, burn 1M → 50 weeks
    expect(world.studioStandings["riv-1"].runwayWeeks).toBe(50);
  });

  it("marks negative-cash rivals distressed", () => {
    const rival = createMockRival({ id: "riv-1", cash: -5_000_000 });
    const state = createMockGameState({ week: 10 });
    state.entities.rivals = { "riv-1": rival };
    const world = buildWorldAssessment(state);
    expect(world.studioStandings["riv-1"].cashTier).toBe("distressed");
  });

  it("records genre saturation from active projects across all owners", () => {
    const state = createMockGameState({ week: 10 });
    state.entities.projects = {
      a: createMockProject({ id: "a", genre: "Horror", state: "development" }),
      b: createMockProject({ id: "b", genre: "Horror", state: "production" }),
      c: createMockProject({ id: "c", genre: "Drama", state: "released" }),
    };
    const world = buildWorldAssessment(state);
    expect(world.genreHeat["Horror"].activeProjects).toBe(2);
    // Released projects do not count toward saturation.
    expect(world.genreHeat["Drama"]?.activeProjects ?? 0).toBe(0);
  });

  it("cycleFromHeat buckets correctly", () => {
    expect(cycleFromHeat(1.2)).toBe("BOOM");
    expect(cycleFromHeat(1.05)).toBe("RECOVERY");
    expect(cycleFromHeat(0.9)).toBe("STABLE");
    expect(cycleFromHeat(0.75)).toBe("BEAR");
    expect(cycleFromHeat(0.5)).toBe("RECESSION");
  });
});

describe("stanceFor — relations ledger → posture", () => {
  const baseThreat = {
    marketShare: 0.1,
    prestige: 50,
    activeProjects: 2,
    recentWins: 0,
    recentHostilityByRival: {},
  };

  function stateWith(rel?: {
    playerOutbids: number;
    playerPoaches: number;
    lastHostileWeek: number;
  }) {
    const state = createMockGameState({ week: 100 });
    if (rel) {
      state.simMemory = {
        ...state.simMemory!,
        rivalRelations: { "riv-1": rel },
      };
    }
    return state;
  }

  it("neutral with no history", () => {
    expect(stanceFor(stateWith(), "riv-1", baseThreat)).toBe("neutral");
  });

  it("rivalrous after a single recent hostile interaction", () => {
    const state = stateWith({ playerOutbids: 1, playerPoaches: 0, lastHostileWeek: 95 });
    expect(stanceFor(state, "riv-1", baseThreat)).toBe("rivalrous");
  });

  it("hostile after 3+ recent hostile interactions", () => {
    const state = stateWith({ playerOutbids: 2, playerPoaches: 1, lastHostileWeek: 95 });
    expect(stanceFor(state, "riv-1", baseThreat)).toBe("hostile");
  });

  it("decays to neutral when hostility is older than 52 weeks", () => {
    const state = stateWith({ playerOutbids: 5, playerPoaches: 2, lastHostileWeek: 40 });
    expect(stanceFor(state, "riv-1", baseThreat)).toBe("neutral");
  });

  it("deferential when the player dominates the market", () => {
    expect(stanceFor(stateWith(), "riv-1", { ...baseThreat, marketShare: 0.6 })).toBe(
      "deferential"
    );
    expect(stanceFor(stateWith(), "riv-1", { ...baseThreat, recentWins: 3 })).toBe("deferential");
  });
});
