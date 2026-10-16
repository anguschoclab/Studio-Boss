import { describe, it, expect } from "vitest";
import { tickRivalSlate } from "@/engine/systems/ai/rival/RivalSlateExecutor";
import { RivalPlan } from "@/engine/systems/ai/rival/plan.types";
import { RivalRevenueCalculator } from "@/engine/systems/rivals/RivalRevenueCalculator";
import { applyImpacts } from "@/engine/core/impactReducer";
import { RandomGenerator } from "@/engine/utils/rng";
import { createMockGameState, createMockRival, createMockProject } from "../../generators/mockFactory";
import type { Project } from "@/engine/types";

function emptyPlan(rivalId: string, week: number): RivalPlan {
  return {
    rivalId,
    week,
    motivation: "STABILITY",
    stance: "neutral",
    slate: { count: 0, budgetTiers: [], preferredGenres: [], preferTv: false },
    bids: [],
    marketing: {},
    strategic: { mna: [], awardsPush: [] },
    talent: [],
    series: [],
    rivalSpend: 0,
    reasons: [],
  };
}

function stateWithRival(week = 10, cash = 500_000_000) {
  const rival = createMockRival({ id: "riv-1", cash, prestige: 60 });
  const state = createMockGameState({ week });
  state.entities.rivals = { "riv-1": rival };
  return { state, rival };
}

function projectOf(state: ReturnType<typeof createMockGameState>, id: string): Project {
  return state.entities.projects[id];
}

describe("RivalSlateExecutor — unified rival lifecycle", () => {
  it("spawns a plan-declared slate entry owned by the rival in canonical storage", () => {
    const { state, rival } = stateWithRival();
    const plan = emptyPlan(rival.id, state.week);
    plan.slate = { count: 1, budgetTiers: ["mid"], preferredGenres: ["Drama"], preferTv: false };

    const impacts = tickRivalSlate(state, new RandomGenerator(7), { "riv-1": plan });
    const created = impacts.find((i) => i.type === "PROJECT_CREATED");
    expect(created).toBeDefined();
    const project = (created!.payload as { project: Project }).project;
    expect(project.ownerId).toBe("riv-1");
    expect(project.state).toBe("pitching");
    expect(project.genre).toBe("Drama");
    expect(project.budgetTier).toBe("mid");
  });

  it("spawns nothing without a plan — no ghost slates", () => {
    const { state } = stateWithRival();
    const impacts = tickRivalSlate(state, new RandomGenerator(7), {});
    expect(impacts.filter((i) => i.type === "PROJECT_CREATED")).toHaveLength(0);
  });

  it("[B1] a released rival film carries distributionStatus + real box office and earns revenue", () => {
    const { state, rival } = stateWithRival(10);
    state.entities.projects = {
      rp: createMockProject({
        id: "rp",
        ownerId: "riv-1",
        state: "marketing",
        weeksInPhase: 2, // MARKETING_WEEKS = 3 → releases this tick
        budget: 60_000_000,
        budgetTier: "mid",
        genre: "Action",
        buzz: 80,
        scriptHeat: 80,
        marketingCampaign: { domesticBudget: 10_000_000, foreignBudget: 5_000_000, primaryAngle: "SELL_THE_SPECTACLE", weeksInMarketing: 2 },
      } as Partial<Project>),
    };

    const impacts = tickRivalSlate(state, new RandomGenerator(42), {});
    const next = applyImpacts(state, impacts);
    const released = projectOf(next, "rp");

    expect(released.state).toBe("released");
    expect(released.releaseWeek).toBe(10);
    // distributionStatus is set — the old pipeline released with it undefined
    // and rival box office was zeroed, starving the rival economy.
    expect(released.distributionStatus).toBeDefined();
    expect(released.boxOffice?.openingWeekendDomestic ?? 0).toBeGreaterThan(0);

    // The live revenue pipeline attributes this release to the rival.
    const rev = RivalRevenueCalculator.calculateWeeklyRevenue(rival, 10, new RandomGenerator(1), next);
    expect(rev.boxOffice).toBeGreaterThan(0);
    expect(rev.total).toBeGreaterThan(0);

    // Opening revenue is credited to the rival, not the player.
    const credit = impacts.find(
      (i) =>
        i.type === "FINANCE_TRANSACTION" &&
        (i.payload as { targetId?: string; amount: number }).targetId === "riv-1" &&
        (i.payload as { amount: number }).amount > 0
    );
    expect(credit).toBeDefined();
  });

  it("[owner scoping] never touches player-owned projects", () => {
    const { state } = stateWithRival();
    state.entities.projects = {
      pp: createMockProject({
        id: "pp",
        ownerId: "PLR-1",
        state: "pitching",
        weeksInPhase: 0,
      }),
    };
    const impacts = tickRivalSlate(state, new RandomGenerator(1), {});
    const touched = impacts.filter(
      (i) => i.type === "PROJECT_UPDATED" && (i.payload as { projectId: string }).projectId === "pp"
    );
    expect(touched).toHaveLength(0);
  });

  it("releaseIntent defers a marketing project until the plan's target week", () => {
    const { state, rival } = stateWithRival(10);
    state.entities.projects = {
      rp: createMockProject({
        id: "rp",
        ownerId: "riv-1",
        state: "marketing",
        weeksInPhase: 5, // past normal release readiness
        budget: 60_000_000,
      }),
    };
    const plan = emptyPlan(rival.id, 10);
    plan.releaseIntent = { projectId: "rp", targetWeek: 20 };

    const impacts = tickRivalSlate(state, new RandomGenerator(1), { "riv-1": plan });
    const upd = impacts.find(
      (i) => i.type === "PROJECT_UPDATED" && (i.payload as { projectId: string }).projectId === "rp"
    );
    expect(upd).toBeDefined();
    expect((upd!.payload as { update: Project }).update.state).not.toBe("released");
  });

  it("advances a production project toward post_production on schedule", () => {
    const { state } = stateWithRival(10);
    state.entities.projects = {
      rp: createMockProject({
        id: "rp",
        ownerId: "riv-1",
        state: "production",
        weeksInPhase: 7,
        productionWeeks: 8,
      }),
    };
    const impacts = tickRivalSlate(state, new RandomGenerator(1), {});
    const upd = impacts.find(
      (i) => i.type === "PROJECT_UPDATED" && (i.payload as { projectId: string }).projectId === "rp"
    );
    expect((upd!.payload as { update: Partial<Project> }).update.state).toBe("post_production");
  });

  it("marks a cash-distressed rival acquirable", () => {
    const { state } = stateWithRival(10, -60_000_000);
    const impacts = tickRivalSlate(state, new RandomGenerator(1), {});
    const upd = impacts.find(
      (i) =>
        i.type === "RIVAL_UPDATED" &&
        (i.payload as { update: { isAcquirable?: boolean } }).update.isAcquirable === true
    );
    expect(upd).toBeDefined();
  });

  it("is deterministic: same seed + state → identical impacts", () => {
    const { state } = stateWithRival(10);
    state.entities.projects = {
      rp: createMockProject({ id: "rp", ownerId: "riv-1", state: "production", weeksInPhase: 3 }),
    };
    const plan = emptyPlan("riv-1", 10);
    plan.slate = { count: 1, budgetTiers: ["low"], preferredGenres: ["Comedy"], preferTv: false };
    const a = tickRivalSlate(state, new RandomGenerator(99), { "riv-1": plan });
    const b = tickRivalSlate(state, new RandomGenerator(99), { "riv-1": plan });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
