import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { updateRival, advanceRivals } from "../../../engine/systems/rivals";
import { RivalStudio, GameState, Talent } from "../../../engine/types";
import * as utils from '../../../engine/utils';

const mockRival: RivalStudio = {
  id: "rival-1",
  name: "Test Studio",
  motto: "The standard.",
  archetype: "major",
  strength: 50,
  cash: 100_000_000,
  prestige: 50,
  recentActivity: "Doing nothing",
  projectCount: 5,
  strategy: 'acquirer',
  projects: {},
  contracts: [],
  motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
  currentMotivation: 'STABILITY'
} as RivalStudio;

describe("rivals system", () => {
  beforeEach(() => {
    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("updateRival", () => {
    it("returns partial updates for strength and cash", () => {
      const update = updateRival(mockRival);
      expect(update.strength).toBe(50); // 50 + (0.5 * 6 - 3) = 50
      expect(update.cash).toBe(110_000_000); // 100M + (0.5 * 40M - 10M) = 110M
    });

    it("sets isAcquirable correctly on cash crunch", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0); // lowest values
      const brokeRival = { ...mockRival, cash: -50_000_000, strength: 30 };
      const update = updateRival(brokeRival);
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
        }
      } as unknown as GameState;

      const impact = advanceRivals(state);

      expect(impact.rivalUpdates).toHaveLength(1);
      expect(impact.rivalUpdates![0].rivalId).toBe(mockRival.id);
      expect(impact.rivalUpdates![0].update.cash).toBeDefined();
    });

    it("triggers news events for newly acquirable rivals", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0);
      const brokeRival = { ...mockRival, cash: -50_000_000, strength: 30, isAcquirable: false };
      const state = {
        industry: {
          rivals: [brokeRival],
          talentPool: {},
          newsHistory: []
        }
      } as unknown as GameState;

      const impact = advanceRivals(state);

      expect(impact.newsEvents?.some(ne => ne.type === 'RIVAL')).toBeTruthy();
      expect(impact.newsEvents?.some(ne => ne.headline.includes('Vulnerable'))).toBeTruthy();
    });
  });
});
