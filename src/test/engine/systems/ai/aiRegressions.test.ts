import { describe, it, expect } from "vitest";
import { RandomGenerator } from "@/engine/utils/rng";
import { OpportunitySystem } from "@/engine/systems/market/OpportunitySystem";
import { tickReleaseStrategy } from "@/engine/systems/ReleaseStrategySystem";
import { executePoach, executeSabotage } from "@/engine/systems/mergers";
import { tickBuyerMandates } from "@/engine/systems/ai/BuyerBrain";
import { tickTalentMinds } from "@/engine/systems/ai/TalentMind";
import { buildWorldAssessment } from "@/engine/systems/ai/WorldAssessment";
import {
  createMockGameState,
  createMockRival,
  createMockProject,
  createMockBuyer,
  createMockTalent,
} from "../../generators/mockFactory";
import type { Opportunity, StateImpact } from "@/engine/types";

/**
 * Permanent regression coverage for the validation-audit bugs (B1-B6) and
 * the simMemory relations ledger.
 */

describe("[B6] tickReleaseStrategy is owner-scoped", () => {
  it("never fires the player RELEASE_STRATEGY modal for rival-owned projects", () => {
    const state = createMockGameState({ week: 10 });
    state.entities.rivals = { "riv-1": createMockRival({ id: "riv-1" }) };
    state.entities.projects = {
      rp: createMockProject({
        id: "rp",
        ownerId: "riv-1",
        state: "marketing",
        releaseStrategy: undefined,
      }),
    };

    const impacts = tickReleaseStrategy(state);
    const modal = impacts.find(
      (i) =>
        i.type === "MODAL_TRIGGERED" &&
        (i.payload as { modalType?: string }).modalType === "RELEASE_STRATEGY"
    );
    expect(modal).toBeUndefined();
  });

  it("still fires for player-owned marketing projects", () => {
    const state = createMockGameState({ week: 10 });
    state.entities.projects = {
      pp: createMockProject({
        id: "pp",
        ownerId: "PLR-1",
        state: "marketing",
        releaseStrategy: undefined,
      }),
    };
    const impacts = tickReleaseStrategy(state);
    const modal = impacts.find(
      (i) =>
        i.type === "MODAL_TRIGGERED" &&
        (i.payload as { modalType?: string }).modalType === "RELEASE_STRATEGY"
    );
    expect(modal).toBeDefined();
  });
});

describe("Relations ledger — player hostility is remembered", () => {
  it("executePoach increments playerPoaches and stamps lastHostileWeek", () => {
    const state = createMockGameState({ week: 44 });
    state.finance.cash = 10_000_000;
    state.entities.rivals = { "riv-1": createMockRival({ id: "riv-1", strength: 50 }) };

    const { state: next } = executePoach(state, "riv-1");
    const rel = next.simMemory!.rivalRelations["riv-1"];
    expect(rel.playerPoaches).toBe(1);
    expect(rel.lastHostileWeek).toBe(44);
  });

  it("executeSabotage stamps lastHostileWeek", () => {
    const state = createMockGameState({ week: 44 });
    state.finance.cash = 10_000_000;
    state.entities.rivals = { "riv-1": createMockRival({ id: "riv-1" }) };

    const next = executeSabotage(state, "riv-1");
    const rel = next.simMemory!.rivalRelations["riv-1"];
    expect(rel.lastHostileWeek).toBe(44);
  });

  it("auction resolution records playerOutbids for every losing rival bidder", () => {
    const state = createMockGameState({ week: 12 });
    state.entities.rivals = {
      "riv-1": createMockRival({ id: "riv-1" }),
      "riv-2": createMockRival({ id: "riv-2" }),
    };
    const opp = {
      id: "opp-1",
      title: "Auction Test",
      type: "IP",
      genre: "Drama",
      format: "film",
      budgetTier: "low",
      targetAudience: "Broad",
      costToAcquire: 5_000_000,
      expirationWeek: 12, // expires this tick → resolves
      highestBidderId: "PLR-1",
      bids: {
        "PLR-1": { bidderId: "PLR-1", amount: 8_000_000, week: 10 },
        "riv-1": { bidderId: "riv-1", amount: 6_000_000, week: 10 },
        "riv-2": { bidderId: "riv-2", amount: 7_000_000, week: 10 },
      },
    } as unknown as Opportunity;
    state.market.opportunities = [opp];

    const impacts = OpportunitySystem.tick(state, new RandomGenerator(1));
    const ledgerWrites = impacts.filter(
      (i) =>
        i.type === "INDUSTRY_UPDATE" &&
        Object.keys((i.payload as { update?: Record<string, unknown> }).update || {}).some((k) =>
          k.startsWith("simMemory.rivalRelations.")
        )
    ) as StateImpact[];

    const written = new Set<string>();
    for (const w of ledgerWrites) {
      const upd = (w.payload as { update: Record<string, { playerOutbids: number }> }).update;
      for (const k in upd) {
        written.add(k);
        expect(upd[k].playerOutbids).toBe(1);
      }
    }
    expect(written.has("simMemory.rivalRelations.riv-1")).toBe(true);
    expect(written.has("simMemory.rivalRelations.riv-2")).toBe(true);
  });
});

describe("BuyerBrain — deterministic mandates", () => {
  it("same seed produces the same mandate rotation", () => {
    const state = createMockGameState({ week: 10 });
    state.market.buyers = [
      createMockBuyer({ id: "b1", mandate: { type: "PRESTIGE", activeUntilWeek: 5 } } as never),
    ];
    const world = buildWorldAssessment(state);
    const a = tickBuyerMandates(state, new RandomGenerator(5), world);
    const b = tickBuyerMandates(state, new RandomGenerator(5), world);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("rarely disturbs an active mandate (drift is ~4%)", () => {
    const state = createMockGameState({ week: 10 });
    state.market.buyers = [
      createMockBuyer({ id: "b1", currentMandate: { type: "PRESTIGE", activeUntilWeek: 99 } } as never),
    ];
    const world = buildWorldAssessment(state);
    let rotations = 0;
    for (let seed = 1; seed <= 50; seed++) {
      const impacts = tickBuyerMandates(state, new RandomGenerator(seed), world);
      if (impacts.some((i) => i.type === "BUYER_UPDATED")) rotations++;
    }
    expect(rotations).toBeLessThan(10); // ~4% drift, well under a hard rotation
  });
});

describe("TalentMind — dormant motivation fields activate", () => {
  it("writes currentMotivation via TALENT_UPDATED", () => {
    const state = createMockGameState({ week: 10 });
    const talent = createMockTalent({
      id: "tal-1",
      currentMotivation: "NONE",
      motivationProfile: { financial: 90, prestige: 10, legacy: 10, aggression: 10 },
    });
    state.entities.talents = { "tal-1": talent };
    const world = buildWorldAssessment(state);

    const impacts = tickTalentMinds(state, new RandomGenerator(3), world);
    const upd = impacts.find(
      (i) =>
        i.type === "TALENT_UPDATED" &&
        (i.payload as { talentId?: string }).talentId === "tal-1" &&
        (i.payload as { update?: { currentMotivation?: string } }).update?.currentMotivation
    );
    expect(upd).toBeDefined();
    expect(
      (upd!.payload as { update: { currentMotivation: string } }).update.currentMotivation
    ).toBe("MONEY_GRABBER");
  });
});
