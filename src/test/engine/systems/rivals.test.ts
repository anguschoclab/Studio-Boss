import { describe, it, expect, beforeEach } from "vitest";
import { updateRival, advanceRivals } from "../../../engine/systems/rivals";
import { createMockGameState, createMockRival } from "../generators/mockFactory";
import { setDeterministicSeed } from "../../../engine/utils";

describe("rivals system", () => {
  beforeEach(() => {
    // Seed 777: first rand() is approx 0.787
    setDeterministicSeed(777);
  });

  describe("updateRival", () => {
    it("returns partial updates for strength and cash", () => {
      const mockRival = createMockRival({ strength: 50, cash: 100_000_000 });
      const update = updateRival(mockRival);

      // Seed 777 first rand() -> 0.686378...
      // 50 + (0.686378 * 6 - 3) = 50 + (4.1182 - 3) = 51.1182
      expect(update.strength).toBeCloseTo(51.12, 1);

      // Seed 777 second rand() -> 0.03445...
      // 100M + (0.03445 * 20M - 5M) = 100M + 0.689M - 5M = 95.689M
      expect(update.cash).toBeCloseTo(95_689_000, -3);
    });

    it("sets isAcquirable correctly on cash crunch", () => {
      const brokeRival = createMockRival({ cash: -50_000_000, strength: 30 });
      const update = updateRival(brokeRival);
      expect(update.isAcquirable).toBe(true);
      expect(update.recentActivity).toContain("buyer");
    });
  });

  describe("advanceRivals", () => {
    it("returns StateImpact with rivalUpdates for all rivals in state", () => {
      const mockRival = createMockRival({ id: "rival-1" });
      const state = createMockGameState();
      state.entities.rivals = { [mockRival.id]: mockRival };

      const impact = advanceRivals(state);

      expect(impact.rivalUpdates).toHaveLength(1);
      expect(impact.rivalUpdates![0].rivalId).toBe(mockRival.id);
      expect(impact.rivalUpdates![0].update.cash).toBeDefined();
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

      const impact = advanceRivals(state);

      expect(impact.newsEvents?.some((ne) => ne.type === "RIVAL")).toBeTruthy();
      expect(impact.newsEvents?.some((ne) => ne.headline.includes("Vulnerable"))).toBeTruthy();
    });
  });
});
