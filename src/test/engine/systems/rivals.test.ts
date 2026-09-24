import {describe, it, expect, beforeEach} from "vitest";
import {updateRival, advanceRivals} from "../../../engine/systems/rivals";
import {createMockGameState, createMockRival} from "../generators/mockFactory";
import {setDeterministicSeed} from "../../../engine/utils";

describe("rivals system", () => {
  beforeEach(() => {
    // Seed 777: first rand() is approx 0.787
    setDeterministicSeed(777);
  });

  describe("updateRival", () => {
    it("returns partial updates plus bounded cash and stat deltas", () => {
      const mockRival = createMockRival({ strength: 50, cash: 100_000_000 });
      const { update, cashDelta, statDeltas } = updateRival(mockRival);

      // Seed 777 first rand() -> 0.686378...
      // strength drift = 0.686378 * 6 - 3 = 1.1182 — a delta, not an absolute write
      expect(statDeltas.strength).toBeCloseTo(1.12, 1);
      expect(update.strength).toBeUndefined();

      // Seed 777 second rand() -> 0.03445...
      // mid-tier drift = 0.03445 * 20M - 5M = 0.689M - 5M = -4.311M
      expect(cashDelta).toBeCloseTo(-4_311_000, -3);
      // Cash itself is no longer part of the partial update — it is a delta
      expect(update.cash).toBeUndefined();
    });

    it("sets isAcquirable correctly on cash crunch", () => {
      const brokeRival = createMockRival({ cash: -50_000_000, strength: 30 });
      const { update } = updateRival(brokeRival);
      expect(update.isAcquirable).toBe(true);
      expect(update.recentActivity).toContain("buyer");
    });
  });

  describe("advanceRivals", () => {
    it("returns impacts: RIVAL_UPDATED + FINANCE_TRANSACTION for each rival", () => {
      const mockRival = createMockRival({ id: "rival-1" });
      const state = createMockGameState();
      state.entities.rivals = { [mockRival.id]: mockRival };

      const impacts = advanceRivals(state);
      expect(Array.isArray(impacts)).toBe(true);

      const rivalUpdates = impacts.filter((i) => i.type === "RIVAL_UPDATED");
      expect(rivalUpdates).toHaveLength(1);
      expect(
        (rivalUpdates[0].payload as { rivalId: string }).rivalId
      ).toBe(mockRival.id);
      const payload = rivalUpdates[0].payload as {
        update: { strength?: number };
        deltas?: { strength?: number };
      };
      expect(payload.update.strength).toBeUndefined();
      expect(typeof payload.deltas?.strength).toBe("number");

      const deltas = impacts.filter(
        (i) =>
          i.type === "FINANCE_TRANSACTION" &&
          (i.payload as { targetId?: string }).targetId === mockRival.id
      );
      expect(deltas).toHaveLength(1);
    });

    it("triggers news events for newly acquirable rivals", () => {
      const brokeRival = createMockRival({
        id: "broke-1",
        cash: -50_000_000,
        strength: 30,
        isAcquirable: false,
      });
      const state = createMockGameState();
      state.entities.rivals = { [brokeRival.id]: brokeRival };

      const impacts = advanceRivals(state);

      const news = impacts.filter((i) => i.type === "NEWS_ADDED");
      expect(
        news.some((n) =>
          (n.payload as { headline?: string }).headline?.includes("Vulnerable")
        )
      ).toBeTruthy();
    });
  });
});
