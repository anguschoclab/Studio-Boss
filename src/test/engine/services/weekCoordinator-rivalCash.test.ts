import {describe, it, expect} from "vitest";
import {WeekCoordinator} from "@/engine/services/WeekCoordinator";
import {createMockGameState, createMockRival, createMockProject} from "../../utils/mockFactories";
import type {GameState, RivalStudio, StateImpact} from "@/engine/types";
import type {DistressedAssetOffer} from "@/engine/types/distress.types";

/**
 * Pipeline-level regression: rival cash writes must be additive deltas.
 *
 * Every tick's impacts are batched and applied once at the end of
 * WeekCoordinator.execute. Cash writes that carry absolute values computed
 * from pre-tick state overwrite each other — the last writer (the finance
 * filter's weekly revenue net) wins and silently deletes earlier credits.
 * These tests assert that event-driven rival cash (syndication income,
 * fire-sale proceeds) actually survives the full pipeline.
 */
function cashDeltas(impacts: StateImpact[], rivalId: string): number[] {
  return impacts
    .filter(
      (i) =>
        i.type === "FINANCE_TRANSACTION" &&
        (i.payload as { targetId?: string }).targetId === rivalId
    )
    .map((i) => (i.payload as { amount: number }).amount);
}

function expectCashConserved(
  state: GameState,
  result: { newState: GameState; impacts: StateImpact[] },
  rivalId: string
) {
  const before = state.entities.rivals[rivalId].cash;
  const after = result.newState.entities.rivals[rivalId].cash;
  const deltaSum = cashDeltas(result.impacts, rivalId).reduce((a, b) => a + b, 0);
  expect(after).toBe(before + deltaSum);
}

describe("WeekCoordinator — rival cash deltas survive the whole tick pipeline", () => {
  it("final rival cash equals pre-tick cash plus the sum of emitted deltas", () => {
    const rival: RivalStudio = createMockRival({ id: "r1", cash: 100_000_000 });
    const state = createMockGameState({ week: 10 });
    state.entities.rivals = { r1: rival };

    const result = WeekCoordinator.execute(state);
    expectCashConserved(state, result, "r1");
  });

  it("syndication revenue reaches a rival's cash end-to-end", () => {
    const rival = createMockRival({ id: "r1", cash: 100_000_000 });
    const state = createMockGameState({ week: 10 });
    state.entities.rivals = { r1: rival };
    state.entities.projects = {
      tv1: createMockProject({
        id: "tv1",
        type: "SERIES",
        format: "tv",
        genre: "Drama",
        state: "released",
        ownerId: "r1",
        tvDetails: {
          currentSeason: 5,
          episodesOrdered: 200,
          episodesCompleted: 200,
          episodesAired: 100,
          averageRating: 7,
          status: "SYNDICATED",
        },
      } as Parameters<typeof createMockProject>[0]),
    };

    const result = WeekCoordinator.execute(state);

    // GOLD syndication: $150k base * 3.5 = $525k
    expect(cashDeltas(result.impacts, "r1")).toContain(525_000);
    expectCashConserved(state, result, "r1");
  });

  it("does not emit syndication revenue for a rival with no TV catalog", () => {
    const rival = createMockRival({ id: "r1", cash: 100_000_000 });
    const state = createMockGameState({ week: 10 });
    state.entities.rivals = { r1: rival };

    const result = WeekCoordinator.execute(state);

    expect(cashDeltas(result.impacts, "r1")).not.toContain(525_000);
    expectCashConserved(state, result, "r1");
  });

  it("expired distressed offer proceeds reach the seller end-to-end", () => {
    const seller = createMockRival({ id: "r1", name: "Carolco", cash: -50_000_000, prestige: 30 });
    const buyer = createMockRival({ id: "r2", name: "Helix", cash: 800_000_000, prestige: 40 });
    const offer: DistressedAssetOffer = {
      id: "o1",
      sellerId: "r1",
      sellerName: "Carolco",
      assetKind: "franchise",
      assetId: "f1",
      assetLabel: "franchise 'Rambo'",
      price: 100_000_000,
      aiBuyerId: "r2",
      aiBuyerName: "Helix",
      createdWeek: 8,
      expiresWeek: 10,
    };
    const state = createMockGameState({ week: 10 });
    state.entities.rivals = { r1: seller, r2: buyer };
    state.ip.franchises = {
      f1: { id: "f1", name: "Rambo", ownerId: "r1" },
    } as unknown as GameState["ip"]["franchises"];
    state.industry.distressedOffers = [offer];

    const result = WeekCoordinator.execute(state);

    // Seller credited +100M; buyer debited -100M — both must survive the
    // finance filter's own cash update applied later in the same tick.
    expect(cashDeltas(result.impacts, "r1")).toContain(100_000_000);
    expect(cashDeltas(result.impacts, "r2")).toContain(-100_000_000);
    expectCashConserved(state, result, "r1");
    expectCashConserved(state, result, "r2");
  });
});
