import { describe, it, expect } from "vitest";
import { RandomGenerator } from "@/engine/utils/rng";
import { createMockGameState, createMockRival } from "../../generators/mockFactory";
import { tickRivalAwardsCampaigns } from "@/engine/systems/ai/RivalAwardsCampaigner";
import type { RivalStudio, Project, GameState, StateImpact } from "@/engine/types";

function createProject(
  id: string,
  ownerId: string,
  reviewScore: number,
  releaseWeek: number,
  buzz: number = 50
): Project {
  return {
    id,
    ownerId,
    title: `Project ${id}`,
    state: "released",
    releaseWeek,
    reviewScore,
    buzz,
    genre: "Drama",
  } as unknown as Project;
}

function setupState(
  rivals: RivalStudio[],
  projects: Project[] = [],
  week: number = 100
): GameState {
  const state = createMockGameState({ week });

  state.entities.rivals = {};
  for (const r of rivals) {
    state.entities.rivals[r.id] = r;
  }

  state.entities.projects = {};
  for (const p of projects) {
    state.entities.projects[p.id] = p;
  }

  return state;
}

function findImpact(impacts: StateImpact[], type: string): StateImpact | undefined {
  return impacts.find((i) => i.type === type);
}

function findRivalUpdated(impacts: StateImpact[], rivalId: string): StateImpact | undefined {
  return impacts.find(
    (i) => i.type === "RIVAL_UPDATED" && (i.payload as any).rivalId === rivalId
  );
}

function findProjectUpdated(impacts: StateImpact[], projectId: string): StateImpact | undefined {
  return impacts.find(
    (i) => i.type === "PROJECT_UPDATED" && (i.payload as any).projectId === projectId
  );
}

describe("tickRivalAwardsCampaigns", () => {
  it("launches campaign for AWARD_CHASE rival with high-review project", () => {
    const rival = createMockRival({
      id: "r1",
      cash: 100_000_000,
      currentMotivation: "AWARD_CHASE",
      archetypeId: "PRESTIGE_PURIST",
    });
    const project = createProject("p1", rival.id, 85, 90, 50);
    const state = setupState([rival], [project]);
    const rng = new RandomGenerator(42);

    const impacts = tickRivalAwardsCampaigns(state, rng);

    const rivalUpdate = findRivalUpdated(impacts, rival.id);
    expect(rivalUpdate).toBeDefined();
    expect((rivalUpdate!.payload as any).update.cash).toBeLessThan(rival.cash);

    const projectUpdate = findProjectUpdated(impacts, "p1");
    expect(projectUpdate).toBeDefined();
    const updatedBuzz = (projectUpdate!.payload as any).update.buzz;
    expect(updatedBuzz).toBeGreaterThan(50);
  });

  it("does not launch campaign for non-AWARD_CHASE rival", () => {
    const rival = createMockRival({
      id: "r1",
      cash: 100_000_000,
      currentMotivation: "STABILITY",
      archetypeId: "BALANCED_GIANT",
    });
    const project = createProject("p1", rival.id, 85, 90, 50);
    const state = setupState([rival], [project]);
    const rng = new RandomGenerator(42);

    const impacts = tickRivalAwardsCampaigns(state, rng);

    expect(findRivalUpdated(impacts, rival.id)).toBeUndefined();
    expect(findProjectUpdated(impacts, "p1")).toBeUndefined();
  });

  it("skips projects with reviewScore below 70", () => {
    const rival = createMockRival({
      id: "r1",
      cash: 100_000_000,
      currentMotivation: "AWARD_CHASE",
      archetypeId: "PRESTIGE_PURIST",
    });
    const project = createProject("p1", rival.id, 60, 90, 50);
    const state = setupState([rival], [project]);
    const rng = new RandomGenerator(42);

    const impacts = tickRivalAwardsCampaigns(state, rng);

    expect(findRivalUpdated(impacts, rival.id)).toBeUndefined();
    expect(findProjectUpdated(impacts, "p1")).toBeUndefined();
  });

  it("skips projects released more than 52 weeks ago", () => {
    const rival = createMockRival({
      id: "r1",
      cash: 100_000_000,
      currentMotivation: "AWARD_CHASE",
      archetypeId: "PRESTIGE_PURIST",
    });
    const project = createProject("p1", rival.id, 85, 10, 50); // released at week 10, current week 100
    const state = setupState([rival], [project], 100);
    const rng = new RandomGenerator(42);

    const impacts = tickRivalAwardsCampaigns(state, rng);

    expect(findRivalUpdated(impacts, rival.id)).toBeUndefined();
  });

  it("selects Blitz tier for high awardObsession archetype with sufficient cash", () => {
    // PRESTIGE_PURIST has awardObsession: 95
    const rival = createMockRival({
      id: "r1",
      cash: 100_000_000,
      currentMotivation: "AWARD_CHASE",
      archetypeId: "PRESTIGE_PURIST",
    });
    const project = createProject("p1", rival.id, 85, 90, 50);
    const state = setupState([rival], [project]);
    const rng = new RandomGenerator(42);

    const impacts = tickRivalAwardsCampaigns(state, rng);

    const rivalUpdate = findRivalUpdated(impacts, rival.id);
    expect(rivalUpdate).toBeDefined();
    // Blitz costs $5M
    expect((rivalUpdate!.payload as any).update.cash).toBe(rival.cash - 5_000_000);
  });

  it("selects Trade tier when high awardObsession but cash below $50M", () => {
    // PRESTIGE_PURIST has awardObsession: 95
    const rival = createMockRival({
      id: "r1",
      cash: 20_000_000,
      currentMotivation: "AWARD_CHASE",
      archetypeId: "PRESTIGE_PURIST",
    });
    const project = createProject("p1", rival.id, 85, 90, 50);
    const state = setupState([rival], [project]);
    const rng = new RandomGenerator(42);

    const impacts = tickRivalAwardsCampaigns(state, rng);

    const rivalUpdate = findRivalUpdated(impacts, rival.id);
    expect(rivalUpdate).toBeDefined();
    // Trade costs $1M
    expect((rivalUpdate!.payload as any).update.cash).toBe(rival.cash - 1_000_000);
  });

  it("selects Grassroots tier for low awardObsession archetype", () => {
    // CASH_COW has awardObsession: 5
    const rival = createMockRival({
      id: "r1",
      cash: 100_000_000,
      currentMotivation: "AWARD_CHASE",
      archetypeId: "CASH_COW",
    });
    const project = createProject("p1", rival.id, 75, 90, 50);
    const state = setupState([rival], [project]);
    const rng = new RandomGenerator(42);

    const impacts = tickRivalAwardsCampaigns(state, rng);

    const rivalUpdate = findRivalUpdated(impacts, rival.id);
    expect(rivalUpdate).toBeDefined();
    // Grassroots costs $250K
    expect((rivalUpdate!.payload as any).update.cash).toBe(rival.cash - 250_000);
  });

  it("caps buzz at 100", () => {
    const rival = createMockRival({
      id: "r1",
      cash: 100_000_000,
      currentMotivation: "AWARD_CHASE",
      archetypeId: "PRESTIGE_PURIST",
    });
    const project = createProject("p1", rival.id, 85, 90, 95);
    const state = setupState([rival], [project]);
    const rng = new RandomGenerator(42);

    const impacts = tickRivalAwardsCampaigns(state, rng);

    const projectUpdate = findProjectUpdated(impacts, "p1");
    expect(projectUpdate).toBeDefined();
    expect((projectUpdate!.payload as any).update.buzz).toBeLessThanOrEqual(100);
  });

  it("does not launch campaign when rival cannot afford any tier", () => {
    const rival = createMockRival({
      id: "r1",
      cash: 100_000,
      currentMotivation: "AWARD_CHASE",
      archetypeId: "PRESTIGE_PURIST",
    });
    const project = createProject("p1", rival.id, 85, 90, 50);
    const state = setupState([rival], [project]);
    const rng = new RandomGenerator(42);

    const impacts = tickRivalAwardsCampaigns(state, rng);

    expect(findRivalUpdated(impacts, rival.id)).toBeUndefined();
  });

  it("processes multiple eligible rivals", () => {
    const rival1 = createMockRival({
      id: "r1",
      cash: 100_000_000,
      currentMotivation: "AWARD_CHASE",
      archetypeId: "PRESTIGE_PURIST",
    });
    const rival2 = createMockRival({
      id: "r2",
      cash: 100_000_000,
      currentMotivation: "AWARD_CHASE",
      archetypeId: "INDIE_DARLING",
    });
    const project1 = createProject("p1", rival1.id, 85, 90, 50);
    const project2 = createProject("p2", rival2.id, 80, 91, 50);
    const state = setupState([rival1, rival2], [project1, project2]);
    const rng = new RandomGenerator(42);

    const impacts = tickRivalAwardsCampaigns(state, rng);

    expect(findRivalUpdated(impacts, "r1")).toBeDefined();
    expect(findRivalUpdated(impacts, "r2")).toBeDefined();
  });
});
