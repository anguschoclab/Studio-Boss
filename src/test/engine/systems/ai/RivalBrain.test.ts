import { describe, it, expect } from "vitest";
import { planRivalWeek, tickRivalPlans } from "@/engine/systems/ai/rival/RivalBrain";
import { buildWorldAssessment } from "@/engine/systems/ai/WorldAssessment";
import { RandomGenerator } from "@/engine/utils/rng";
import {
  createMockGameState,
  createMockRival,
  createMockProject,
  createMockTalent,
} from "../../generators/mockFactory";
import type { StateImpact, Opportunity } from "@/engine/types";

function planFor(
  rivalOverrides: Parameters<typeof createMockRival>[0] = {},
  stateOverrides: Parameters<typeof createMockGameState>[0] = {},
  seed = 42
) {
  const rival = createMockRival({ id: "riv-1", cash: 200_000_000, ...rivalOverrides });
  const state = createMockGameState({ week: 30, ...stateOverrides });
  state.entities.rivals = { "riv-1": rival };
  const world = buildWorldAssessment(state);
  const plan = planRivalWeek(rival, world, state, new RandomGenerator(seed));
  return { plan, rival, state, world };
}

describe("RivalBrain — determinism", () => {
  it("same inputs + same seed → identical plan", () => {
    const a = planFor({}, {}, 7).plan;
    const b = planFor({}, {}, 7).plan;
    expect(a).toEqual(b);
  });

  it("produces a reasons trail for every non-trivial plan", () => {
    const { plan } = planFor({ archetype: "major" });
    expect(plan.reasons.length).toBeGreaterThan(0);
  });
});

describe("RivalBrain — spite bidding (Phase 4)", () => {
  function stateWithAuction(bids: Record<string, number>, highestBidderId = "PLAYER") {
    const state = createMockGameState({ week: 30 });
    const opp: Opportunity = {
      id: "opp-1",
      title: "Hot IP",
      type: "IP",
      genre: "Action",
      costToAcquire: 5_000_000,
      expirationWeek: 40,
      highestBidderId,
      bids: Object.fromEntries(
        Object.entries(bids).map(([rid, amount]) => [rid, { bidderId: rid, amount, week: 29 }])
      ),
    } as unknown as Opportunity;
    state.market.opportunities = [opp];
    return state;
  }

  it("escalates bid by ≥35% when hostile and player is leading", () => {
    const rival = createMockRival({ id: "riv-1", cash: 500_000_000 });
    const state = stateWithAuction({ PLAYER: 5_000_000 }, "PLAYER");
    state.entities.rivals = { "riv-1": rival };
    state.simMemory = {
      ...state.simMemory!,
      rivalRelations: {
        "riv-1": { playerOutbids: 3, playerPoaches: 1, lastHostileWeek: 28 },
      },
    };
    const world = buildWorldAssessment(state);
    let sawSpite = false;
    for (let seed = 1; seed <= 60; seed++) {
      const plan = planRivalWeek(rival, world, state, new RandomGenerator(seed));
      const bid = plan.bids.find((b) => b.opportunityId === "opp-1");
      if (bid) {
        sawSpite = true;
        expect(bid.spiteBoost).toBeGreaterThanOrEqual(1.35);
      }
    }
    expect(sawSpite).toBe(true);
  });

  it("never spite-bids when neutral", () => {
    const rival = createMockRival({ id: "riv-1", cash: 500_000_000 });
    const state = stateWithAuction({ PLAYER: 5_000_000 }, "PLAYER");
    state.entities.rivals = { "riv-1": rival };
    const world = buildWorldAssessment(state);
    for (let seed = 1; seed <= 60; seed++) {
      const plan = planRivalWeek(rival, world, state, new RandomGenerator(seed));
      const bid = plan.bids.find((b) => b.opportunityId === "opp-1");
      if (bid) expect(bid.spiteBoost).toBeLessThanOrEqual(1.15);
    }
  });
});

describe("RivalBrain — counter-programming (Phase 4)", () => {
  it("hostile rival parks a tentpole on the player's release week", () => {
    const rival = createMockRival({ id: "riv-1", cash: 300_000_000 });
    const state = createMockGameState({ week: 30 });
    state.entities.rivals = { "riv-1": rival };
    state.entities.projects = {
      rp: createMockProject({
        id: "rp",
        ownerId: "riv-1",
        state: "post_production",
        budgetTier: "blockbuster",
        budget: 200_000_000,
      }),
      pp: createMockProject({
        id: "pp",
        ownerId: "PLR-1",
        state: "marketing",
        releaseWeek: 40,
      }),
    };
    state.simMemory = {
      ...state.simMemory!,
      rivalRelations: {
        "riv-1": { playerOutbids: 4, playerPoaches: 0, lastHostileWeek: 28 },
      },
    };
    const world = buildWorldAssessment(state);
    const plan = planRivalWeek(rival, world, state, new RandomGenerator(42));
    expect(plan.releaseIntent).toEqual({ projectId: "rp", targetWeek: 40 });
    expect(plan.reasons.some((r) => r.toLowerCase().includes("counter-programming"))).toBe(true);
  });

  it("deferential rival shifts away from the player's window", () => {
    const rival = createMockRival({ id: "riv-1", cash: 300_000_000 });
    const state = createMockGameState({ week: 30 });
    state.entities.rivals = { "riv-1": rival };
    // Player blockbuster released this week with massive gross → marketShare high.
    state.entities.projects = {
      rp: createMockProject({
        id: "rp",
        ownerId: "riv-1",
        state: "post_production",
        budgetTier: "blockbuster",
        budget: 200_000_000,
      }),
      pp: createMockProject({
        id: "pp",
        ownerId: "PLR-1",
        state: "marketing",
        releaseWeek: 40,
      }),
      pw: createMockProject({
        id: "pw",
        ownerId: "PLR-1",
        state: "released",
        releaseWeek: 28,
        budget: 10_000_000,
        boxOffice: { totalDomestic: 400_000_000, totalForeign: 300_000_000 },
      } as Parameters<typeof createMockProject>[0]),
    };
    const world = buildWorldAssessment(state);
    const plan = planRivalWeek(rival, world, state, new RandomGenerator(42));
    expect(world.playerThreat.marketShare).toBeGreaterThan(0.5);
    expect(plan.stance).toBe("deferential");
    expect(plan.releaseIntent).toEqual({ projectId: "rp", targetWeek: 44 });
  });
});

describe("RivalBrain — poach-on-delay (Phase 4)", () => {
  it("circles prestige talent on a stalled player project when rivalrous", () => {
    const rival = createMockRival({ id: "riv-1", cash: 300_000_000, archetypeId: "poacher" });
    const state = createMockGameState({ week: 30 });
    state.entities.rivals = { "riv-1": rival };
    const talent = createMockTalent({ id: "tal-1", prestige: 80 });
    state.entities.talents = { "tal-1": talent };
    state.entities.projects = {
      pp: createMockProject({
        id: "pp",
        ownerId: "PLR-1",
        state: "development",
        weeksInPhase: 10,
      }),
    };
    state.entities.contracts = {
      c1: { id: "c1", projectId: "pp", talentId: "tal-1", fee: 1_000_000, backendPercent: 0 },
    };
    state.entities.contractsByProjectId = { pp: ["c1"] };
    state.simMemory = {
      ...state.simMemory!,
      rivalRelations: {
        "riv-1": { playerOutbids: 1, playerPoaches: 0, lastHostileWeek: 28 },
      },
    };
    const world = buildWorldAssessment(state);
    const plan = planRivalWeek(rival, world, state, new RandomGenerator(42));
    const intent = plan.talent.find((t) => t.approach === "poach");
    expect(intent).toBeDefined();
    expect(intent!.talentId).toBe("tal-1");
    expect(intent!.reason).toBe("delay_response");
  });
});

describe("RivalBrain — intel payload", () => {
  it("tickRivalPlans writes rival.intel via RIVAL_UPDATED", () => {
    const { rival, state } = planFor();
    const impacts: StateImpact[] = [];
    const plans = tickRivalPlans(state, {
      week: 30,
      rng: new RandomGenerator(1),
      impacts,
    });
    expect(plans[rival.id]).toBeDefined();
    const upd = impacts.find(
      (i) =>
        i.type === "RIVAL_UPDATED" &&
        (i.payload as { rivalId: string }).rivalId === rival.id &&
        (i.payload as { update: { intel?: unknown } }).update.intel
    );
    expect(upd).toBeDefined();
    const intel = (upd!.payload as { update: { intel: Record<string, unknown> } }).update.intel;
    expect(intel.motivation).toBe(plans[rival.id].motivation);
    expect(intel.stance).toBe(plans[rival.id].stance);
    expect(intel.updatedWeek).toBe(30);
    expect(Array.isArray(intel.planSummary)).toBe(true);
    expect(Array.isArray(intel.reasons)).toBe(true);
  });
});
