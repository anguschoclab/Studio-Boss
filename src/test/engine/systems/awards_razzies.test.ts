import { describe, it, expect } from "vitest";
import { processRazzies } from "../../../engine/systems/awards/RazzieProcessor";
import { Project, Talent, Contract } from "../../../engine/types";
import { createMockGameState } from "../../utils/mockFactories";
import { RandomGenerator } from "../../../engine/utils/rng";

describe("Razzies Award System", () => {
  const createProject = (
    id: string,
    budget: number,
    score: number,
    flavor: string,
    genre: string
  ): Project =>
    ({
      id,
      title: `Title ${id}`,
      type: "FILM",
      format: "film",
      genre,
      budgetTier: "high",
      budget,
      weeklyCost: 10,
      targetAudience: "General Audience",
      flavor,
      state: "released",
      buzz: 50,
      weeksInPhase: 1,
      developmentWeeks: 1,
      productionWeeks: 1,
      revenue: 10,
      weeklyRevenue: 10,
      releaseWeek: 1,
      reviewScore: score,
      activeCrisis: null,
      momentum: 50,
      progress: 100,
      accumulatedCost: budget,
      contentFlags: [],
      scriptHeat: 50,
      activeRoles: [],
      scriptEvents: [],
    }) as Project;

  it("Razzies are only awarded to projects with Budget >= 50M and Score <= 30", () => {
    const goodProject = createProject("good", 100_000_000, 80, "", "Action");
    const cheapFlop = createProject("cheap", 10_000_000, 10, "", "Action");
    const bigFlop = createProject("big", 60_000_000, 20, "", "Action");
    bigFlop.ownerId = "player-studio";

    const state = createMockGameState({
      week: 4,
      entities: {
        projects: {
          good: goodProject,
          cheap: cheapFlop,
          big: bigFlop,
        },
        releasedProjectIds: ["good", "cheap", "big"],
        talents: {},
        contracts: {},
        rivals: {},
        contractsByProjectId: {},
      },
    });
    state.studio.id = "player-studio";

    const rng = new RandomGenerator(12345);
    const impacts = processRazzies(state, 4, rng);

    // Only the bigFlop is eligible. Worst Picture should trigger a news impact.
    const newsImpacts = impacts.filter((i) => i.type === "NEWS_ADDED");
    expect(newsImpacts.length).toBeGreaterThan(0);

    const prestigeImpact = impacts.find((i) => i.type === "PRESTIGE_CHANGED");
    expect(prestigeImpact).toBeDefined();
    expect((prestigeImpact!.payload as any).amount).toBeLessThan(0);
  });

  it("Razzie win triggers Studio Prestige penalty and marks cult classic if absurd", () => {
    const absurdFlop = createProject(
      "absurd",
      60_000_000,
      20,
      "a bizarre and absurd mess",
      "Action"
    );
    absurdFlop.ownerId = "player-studio";
    const state = createMockGameState({
      week: 4,
      entities: {
        projects: { absurd: absurdFlop },
        releasedProjectIds: ["absurd"],
        talents: {},
        contracts: {},
        rivals: {},
        contractsByProjectId: {},
      },
    });
    state.studio.id = "player-studio";

    const rng = new RandomGenerator(12345);
    const impacts = processRazzies(state, 4, rng);

    const prestigeImpact = impacts.find((i) => i.type === "PRESTIGE_CHANGED");
    expect(prestigeImpact).toBeDefined();
    expect((prestigeImpact!.payload as any).amount).toBeLessThan(0);

    // Check for cult classic project update impact
    const cultImpact = impacts.find(
      (i) => i.type === "PROJECT_UPDATED" && (i.payload as any)?.update?.isCultClassic === true
    );
    expect(cultImpact).toBeDefined();
  });

  it("processRazzies finds worst lead talent via contractsByProjectId index and produces TALENT_UPDATED with razzieWinner: true", () => {
    const bigFlop = createProject("big", 60_000_000, 20, "", "Action");
    bigFlop.ownerId = "player-studio";

    const starTalent: Talent = {
      id: "star-1",
      name: "Big Star",
      role: "actor",
      roles: ["actor"],
      draw: 85,
    } as unknown as Talent;

    const starContract: Contract = {
      id: "con-star",
      projectId: "big",
      talentId: "star-1",
      fee: 5_000_000,
      role: "actor",
      backendPercent: 0,
    } as Contract;

    const state = createMockGameState({
      week: 4,
      entities: {
        projects: { big: bigFlop },
        releasedProjectIds: ["big"],
        talents: { "star-1": starTalent },
        contracts: { "con-star": starContract },
        contractsByProjectId: { big: ["con-star"] },
        rivals: {},
      },
    });
    state.studio.id = "player-studio";

    const rng = new RandomGenerator(12345);
    const impacts = processRazzies(state, 4, rng);

    const talentImpact = impacts.find(
      (i) => i.type === "TALENT_UPDATED" && (i.payload as any)?.talentId === "star-1"
    );
    expect(talentImpact).toBeDefined();
    expect((talentImpact!.payload as any)?.update?.razzieWinner).toBe(true);
  });

  it("processRazzies produces news impact for worst lead talent", () => {
    const bigFlop = createProject("big", 60_000_000, 20, "", "Action");
    bigFlop.ownerId = "player-studio";

    const starTalent: Talent = {
      id: "star-1",
      name: "Big Star",
      role: "actor",
      roles: ["actor"],
      draw: 85,
    } as unknown as Talent;

    const starContract: Contract = {
      id: "con-star",
      projectId: "big",
      talentId: "star-1",
      fee: 5_000_000,
      role: "actor",
      backendPercent: 0,
    } as Contract;

    const state = createMockGameState({
      week: 4,
      entities: {
        projects: { big: bigFlop },
        releasedProjectIds: ["big"],
        talents: { "star-1": starTalent },
        contracts: { "con-star": starContract },
        contractsByProjectId: { big: ["con-star"] },
        rivals: {},
      },
    });
    state.studio.id = "player-studio";

    const rng = new RandomGenerator(12345);
    const impacts = processRazzies(state, 4, rng);

    const talentNews = impacts.find(
      (i) => i.type === "NEWS_ADDED" && (i.payload as any)?.headline?.includes("Big Star")
    );
    expect(talentNews).toBeDefined();
    expect((talentNews!.payload as any)?.headline).toContain("Worst Lead");
  });

  it("processRazzies handles missing index entries gracefully (empty index for project with no contracts)", () => {
    const bigFlop = createProject("big", 60_000_000, 20, "", "Action");
    bigFlop.ownerId = "player-studio";

    const state = createMockGameState({
      week: 4,
      entities: {
        projects: { big: bigFlop },
        releasedProjectIds: ["big"],
        talents: {},
        contracts: {},
        contractsByProjectId: {},
        rivals: {},
      },
    });
    state.studio.id = "player-studio";

    const rng = new RandomGenerator(12345);
    const impacts = processRazzies(state, 4, rng);

    // Should still produce project-level impacts but no TALENT_UPDATED
    const talentImpact = impacts.find((i) => i.type === "TALENT_UPDATED");
    expect(talentImpact).toBeUndefined();
  });

  it("processRazzies handles undefined contractsByProjectId gracefully", () => {
    const bigFlop = createProject("big", 60_000_000, 20, "", "Action");
    bigFlop.ownerId = "player-studio";

    const state = createMockGameState({
      week: 4,
      entities: {
        projects: { big: bigFlop },
        releasedProjectIds: ["big"],
        talents: {},
        contracts: {},
        contractsByProjectId: {},
        rivals: {},
      },
    });
    // Deliberately set contractsByProjectId to undefined to test null-safety
    (state.entities as any).contractsByProjectId = undefined;
    state.studio.id = "player-studio";

    const rng = new RandomGenerator(12345);
    expect(() => processRazzies(state, 4, rng)).not.toThrow();
  });

  it("processRazzies assigns razzieCategory based on score thresholds", () => {
    const worstFlop = createProject("worst", 60_000_000, 5, "", "Action");
    worstFlop.ownerId = "player-studio";

    const state = createMockGameState({
      week: 4,
      entities: {
        projects: { worst: worstFlop },
        releasedProjectIds: ["worst"],
        talents: {},
        contracts: {},
        contractsByProjectId: {},
        rivals: {},
      },
    });
    state.studio.id = "player-studio";

    const rng = new RandomGenerator(12345);
    const impacts = processRazzies(state, 4, rng);

    const projectUpdate = impacts.find(
      (i) => i.type === "PROJECT_UPDATED" && (i.payload as any)?.projectId === "worst"
    );
    expect(projectUpdate).toBeDefined();
    expect((projectUpdate!.payload as any)?.update?.razzieCategory).toBe("Worst Picture");
  });

  it("processRazzies multi-nominee structure (up to 3 nominees) still works with contract-level logic", () => {
    const flop1 = createProject("f1", 60_000_000, 5, "", "Action");
    flop1.ownerId = "player-studio";
    const flop2 = createProject("f2", 60_000_000, 10, "", "Action");
    flop2.ownerId = "player-studio";
    const flop3 = createProject("f3", 60_000_000, 15, "", "Action");
    flop3.ownerId = "player-studio";
    const flop4 = createProject("f4", 60_000_000, 25, "", "Action");
    flop4.ownerId = "player-studio";

    const state = createMockGameState({
      week: 4,
      entities: {
        projects: { f1: flop1, f2: flop2, f3: flop3, f4: flop4 },
        releasedProjectIds: ["f1", "f2", "f3", "f4"],
        talents: {},
        contracts: {},
        contractsByProjectId: {},
        rivals: {},
      },
    });
    state.studio.id = "player-studio";

    const rng = new RandomGenerator(12345);
    const impacts = processRazzies(state, 4, rng);

    // Should only have 3 nominees (the 3 worst scores)
    const projectUpdates = impacts.filter(
      (i) => i.type === "PROJECT_UPDATED" && (i.payload as any)?.update?.razzieWinner === true
    );
    expect(projectUpdates).toHaveLength(3);
  });
});
