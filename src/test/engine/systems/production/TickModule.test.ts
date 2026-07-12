import { describe, it, expect, vi, beforeEach } from "vitest";
import { tickProduction } from "@/engine/systems/production/TickModule";
import {
  createMockGameState,
  createMockProject,
  createMockTalent,
  createMockContract,
} from "@/test/utils/mockFactories";
import { RandomGenerator } from "@/engine/utils/rng";

describe("TickModule - tickProduction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("processes a project in production correctly", () => {
    const state = createMockGameState({ week: 10 });
    const project = createMockProject({
      id: "p1",
      state: "production",
      progress: 50,
      productionWeeks: 10,
      reviewScore: 50,
    });
    const talent = createMockTalent({ id: "t1", fatigue: 0 });
    const contract = createMockContract({ projectId: "p1", talentId: "t1" });

    state.entities.projects["p1"] = project;
    state.entities.talents["t1"] = talent;
    state.entities.contracts["c1"] = contract;
    state.entities.contractsByProjectId["p1"] = ["c1"];
    state.entities.contractsByTalentId["t1"] = ["c1"];

    const rng = new RandomGenerator(42);

    const impacts = tickProduction(state, rng);

    const industryUpdate = impacts.find((i) => i.type === "INDUSTRY_UPDATE");
    expect(industryUpdate).toBeDefined();

    const updatedProject = (industryUpdate?.payload as any).update["entities.projects"]["p1"];
    expect(updatedProject.progress).toBeGreaterThan(50);

    // We should also see TALENT_UPDATED because fatigue increases
    const talentUpdate = impacts.find(
      (i) => i.type === "TALENT_UPDATED" && (i.payload as any).talentId === "t1"
    );
    expect(talentUpdate).toBeDefined();
  });

  it("skips archived projects entirely", () => {
    const state = createMockGameState({ week: 10 });
    const project = createMockProject({ id: "p1", state: "archived" });
    state.entities.projects["p1"] = project;

    const rng = new RandomGenerator(42);

    const impacts = tickProduction(state, rng);

    const industryUpdate = impacts.find((i) => i.type === "INDUSTRY_UPDATE");
    // It shouldn't emit an INDUSTRY_UPDATE if projects haven't changed.
    expect(industryUpdate).toBeUndefined();
  });

  it("reduces fatigue for inactive talent", () => {
    const state = createMockGameState({ week: 10 });
    // Talent with no active contract attached to an active project
    const talent = createMockTalent({ id: "t1", fatigue: 50 });
    state.entities.talents["t1"] = talent;

    const rng = new RandomGenerator(42);
    const impacts = tickProduction(state, rng);

    const talentUpdate = impacts.find(
      (i) => i.type === "TALENT_UPDATED" && (i.payload as any).talentId === "t1"
    );
    expect(talentUpdate).toBeDefined();
    expect((talentUpdate?.payload as any).update.fatigue).toBeLessThan(50);
  });

  it("handles empty states gracefully", () => {
    const state = createMockGameState();
    const rng = new RandomGenerator(42);
    const impacts = tickProduction(state, rng);
    expect(impacts).toHaveLength(0); // No projects, no talent
  });

  it("advances weeks cleanly with an empty pipeline (no projects/contracts/talent)", () => {
    const state = createMockGameState({ week: 10 });
    state.entities.projects = {};
    state.entities.contracts = {};
    state.entities.talents = {};
    const rng = new RandomGenerator(42);

    const impacts = tickProduction(state, rng);

    expect(impacts).toBeDefined();
    expect(impacts).toHaveLength(0);
  });
});
