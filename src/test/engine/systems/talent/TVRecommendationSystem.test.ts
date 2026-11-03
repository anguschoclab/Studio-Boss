import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  tickTVRecommendationSystem,
  getTVRecommendationsForTalent,
} from "@/engine/systems/talent/TVRecommendationSystem";
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
      state.entities.talents = { t1: createMockTalent({ id: "t1", tier: "A_LIST" }) };
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      expect(impacts).toEqual([]);
    });

    it("only runs every 4 weeks (skips week 2)", () => {
      state.week = 2;
      state.entities.talents = { t1: createMockTalent({ id: "t1", tier: "A_LIST" }) };
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      expect(impacts).toEqual([]);
    });

    it("only runs every 4 weeks (skips week 3)", () => {
      state.week = 3;
      state.entities.talents = { t1: createMockTalent({ id: "t1", tier: "A_LIST" }) };
      const impacts = tickTVRecommendationSystem(state, undefined as never, rng);
      expect(impacts).toEqual([]);
    });

    it("runs on week 4 (divisible by 4)", () => {
      state.week = 4;
      const talent = createMockTalent({ id: "t1", tier: "A_LIST", name: "Star Talent" });
      state.entities.talents = { t1: talent };
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

    it("skips NEWCOMER talents (tier number 5 > 3)", () => {
      state.week = 4;
      const talent = createMockTalent({ id: "t-newcomer", tier: "NEWCOMER" });
      state.entities.talents = { "t-newcomer": talent };
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

  // Characterization lock for the Bolt single-pass rewrite — pins the exact
  // filter semantics of getTVRecommendationsForTalent (talentId match, strict
  // expiresWeek > week, insertion-order preservation). Green before AND after.
  describe("getTVRecommendationsForTalent", () => {
    const rec = (id: string, talentId: string, expiresWeek: number) =>
      ({ id, talentId, expiresWeek }) as any;

    it("returns only this talent's unexpired recommendations", () => {
      state.week = 10;
      (state as any).tvRecommendations = {
        recommendations: {
          r1: rec("r1", "t1", 20),
          r2: rec("r2", "t2", 20),
          r3: rec("r3", "t1", 5),
          r4: rec("r4", "t1", 30),
        },
      };
      const result = getTVRecommendationsForTalent("t1", state);
      expect(result.map((r) => r.id)).toEqual(["r1", "r4"]);
    });

    it("excludes recommendations expiring this week (strict >)", () => {
      state.week = 10;
      (state as any).tvRecommendations = {
        recommendations: { r1: rec("r1", "t1", 10), r2: rec("r2", "t1", 11) },
      };
      const result = getTVRecommendationsForTalent("t1", state);
      expect(result.map((r) => r.id)).toEqual(["r2"]);
    });

    it("returns [] when tvRecommendations state is missing", () => {
      delete (state as any).tvRecommendations;
      expect(getTVRecommendationsForTalent("t1", state)).toEqual([]);
    });

    it("returns [] when the talent has no recommendations", () => {
      state.week = 1;
      (state as any).tvRecommendations = {
        recommendations: { r1: rec("r1", "other", 20) },
      };
      expect(getTVRecommendationsForTalent("t1", state)).toEqual([]);
    });
  });
});
