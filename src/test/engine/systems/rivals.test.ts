import { describe, it, expect } from "vitest";
import { updateRival, advanceRivals } from "../../../engine/systems/rivals";
import { RivalStudio, GameState, Talent } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

const mockRival: RivalStudio = {
  id: "rival-1",
  name: "Test Studio",
  motto: "The standard.",
  archetype: "major",
  strength: 50,
  cash: 100_000_000,
  prestige: 50,
  foundedWeek: 0,
  recentActivity: "Doing nothing",
  projectCount: 5,
  strategy: 'acquirer',
  projects: {},
  contracts: [],
  motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
  currentMotivation: 'STABILITY'
};

describe("rivals system", () => {
  const rng = new RandomGenerator(42);

  describe("updateRival", () => {
    it("returns partial updates for strength and cash", () => {
      const update = updateRival(rng, mockRival);
      expect(update.strength).toBeDefined();
      expect(update.cash).toBeDefined();
    });

    it("sets isAcquirable correctly on cash crunch", () => {
      // Create a deterministic RNG that rolls low
      const lowRng = new RandomGenerator(1); 
      const brokeRival = { ...mockRival, cash: -50_000_000, strength: 30 };
      const update = updateRival(lowRng, brokeRival);
      expect(update.isAcquirable).toBe(true);
      expect(update.recentActivity).toContain("buyer");
    });
  });

  describe("advanceRivals", () => {
    it("returns StateImpact with rivalUpdates for all rivals in state", () => {
      const state = {
        industry: {
          rivals: [mockRival],
          talentPool: {} as Record<string, Talent>,
          newsHistory: []
        },
        week: 1
      } as unknown as GameState;

      const impact = advanceRivals(rng, state);

      expect(impact.rivalUpdates).toHaveLength(1);
      expect(impact.rivalUpdates![0].rivalId).toBe(mockRival.id);
      expect(impact.rivalUpdates![0].update.cash).toBeDefined();
    });

    it("triggers news events for newly acquirable rivals", () => {
      const lowRng = new RandomGenerator(1);
      const brokeRival = { ...mockRival, cash: -50_000_000, strength: 30, isAcquirable: false };
      const state = {
        industry: {
          rivals: [brokeRival],
          talentPool: {},
          newsHistory: []
        },
        week: 1
      } as unknown as GameState;

      const impact = advanceRivals(lowRng, state);

      expect(impact.newsEvents?.some(ne => ne.type === 'RIVAL')).toBeTruthy();
      expect(impact.newsEvents?.some(ne => ne.headline.includes('Vulnerable'))).toBeTruthy();
    });
  });
});
