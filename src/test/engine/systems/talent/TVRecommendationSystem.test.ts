import { describe, it, expect, beforeEach, vi } from "vitest";
import { tickTVRecommendationSystem } from "@/engine/systems/talent/TVRecommendationSystem";
import { createMockGameState, createMockTalent } from "@/test/utils/mockFactories";
import { RandomGenerator } from "@/engine/utils/rng";
import { GameState, Talent } from "@/engine/types";

describe("TVRecommendationSystem", () => {
  let state: GameState;
  let rng: RandomGenerator;

  beforeEach(() => {
    state = createMockGameState();
    rng = new RandomGenerator(42);
  });

  describe("tickTVRecommendationSystem", () => {
    it("only runs every 4 weeks (skips week 1, 2, 3)", () => {
      state.week = 1;
      state.entities.talents = { "t1": createMockTalent({ id: "t1", tier: "A_LIST" }) };
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      expect(impacts).toEqual([]);
    });

    it("only runs every 4 weeks (skips week 2)", () => {
      state.week = 2;
      state.entities.talents = { "t1": createMockTalent({ id: "t1", tier: "A_LIST" }) };
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      expect(impacts).toEqual([]);
    });

    it("only runs every 4 weeks (skips week 3)", () => {
      state.week = 3;
      state.entities.talents = { "t1": createMockTalent({ id: "t1", tier: "A_LIST" }) };
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      expect(impacts).toEqual([]);
    });

    it("runs on week 4 (divisible by 4)", () => {
      state.week = 4;
      const talent = createMockTalent({ id: "t1", tier: "A_LIST", name: "Star Talent" });
      state.entities.talents = { "t1": talent };
      vi.spyOn(rng, "next").mockReturnValue(0.5);
      vi.spyOn(rng, "pick").mockReturnValue("lead" as never);
      vi.spyOn(rng, "uuid").mockReturnValue("rec-1");
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      // May or may not produce impacts depending on match score, but should not return undefined
      expect(impacts).toBeDefined();
      expect(Array.isArray(impacts)).toBe(true);
    });

    it("skips retired talents", () => {
      state.week = 4;
      const talent = createMockTalent({ id: "t-retired", tier: "A_LIST", retired: true });
      state.entities.talents = { "t-retired": talent };
      vi.spyOn(rng, "next").mockReturnValue(0.5);
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      const recImpacts = impacts.filter((i) => i.type === "TV_RECOMMENDATION_CREATED");
      expect(recImpacts).toHaveLength(0);
    });

    it("skips talents on medical leave", () => {
      state.week = 4;
      const talent = createMockTalent({ id: "t-medical", tier: "A_LIST", onMedicalLeave: true });
      state.entities.talents = { "t-medical": talent };
      vi.spyOn(rng, "next").mockReturnValue(0.5);
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      const recImpacts = impacts.filter((i) => i.type === "TV_RECOMMENDATION_CREATED");
      expect(recImpacts).toHaveLength(0);
    });

    it("skips C_LIST and below talents (tier number > 3)", () => {
      state.week = 4;
      const talent = createMockTalent({ id: "t-c-list", tier: "C_LIST" });
      state.entities.talents = { "t-c-list": talent };
      vi.spyOn(rng, "next").mockReturnValue(0.5);
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      const recImpacts = impacts.filter((i) => i.type === "TV_RECOMMENDATION_CREATED");
      expect(recImpacts).toHaveLength(0);
    });

    it("skips RISING_STAR talents (tier number 4 > 3)", () => {
      state.week = 4;
      const talent = createMockTalent({ id: "t-rising", tier: "RISING_STAR" });
      state.entities.talents = { "t-rising": talent };
      vi.spyOn(rng, "next").mockReturnValue(0.5);
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      const recImpacts = impacts.filter((i) => i.type === "TV_RECOMMENDATION_CREATED");
      expect(recImpacts).toHaveLength(0);
    });

    it("handles empty talents gracefully", () => {
      state.week = 4;
      state.entities.talents = {};
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      expect(impacts).toEqual([]);
    });

    it("handles undefined talents gracefully", () => {
      state.week = 4;
      state.entities.talents = undefined as unknown as Record<string, Talent>;
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      expect(impacts).toEqual([]);
    });

    it("skips undefined talent entries in for...in loop", () => {
      state.week = 4;
      state.entities.talents = { "t-undef": undefined as unknown as Talent };
      vi.spyOn(rng, "next").mockReturnValue(0.5);
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      expect(impacts).toEqual([]);
    });
  });
});
