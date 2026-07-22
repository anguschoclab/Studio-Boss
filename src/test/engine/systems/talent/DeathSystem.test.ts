import { describe, it, expect, vi, beforeEach } from "vitest";
import { tickDeathSystem, getDeathStatistics } from "@/engine/systems/talent/DeathSystem";
import { createMockGameState, createMockTalent, createMockProject, createMockContract } from "@/test/utils/mockFactories";
import { RandomGenerator } from "@/engine/utils/rng";
import { GameState, Talent } from "@/engine/types";

describe("DeathSystem", () => {
  let state: GameState;
  let rng: RandomGenerator;

  beforeEach(() => {
    state = createMockGameState();
    rng = new RandomGenerator(42);
  });

  describe("tickDeathSystem", () => {
    it("handles empty talents gracefully", () => {
      state.entities.talents = {};
      const impacts = tickDeathSystem(state, rng);
      expect(impacts).toEqual([]);
    });

    it("handles undefined talents gracefully", () => {
      state.entities.talents = undefined as unknown as Record<string, Talent>;
      const impacts = tickDeathSystem(state, rng);
      expect(impacts).toEqual([]);
    });

    it("skips talents on medical leave", () => {
      const talent = createMockTalent({
        id: "t-medical",
        name: "Medical Talent",
        onMedicalLeave: true,
        demographics: { age: 80, gender: "MALE", ethnicity: "Caucasian", country: "USA" },
      });
      state.entities.talents = { "t-medical": talent };
      // Force rng to always trigger death
      vi.spyOn(rng, "next").mockReturnValue(0);
      const impacts = tickDeathSystem(state, rng);
      // Should not produce any death impacts for medical leave talent
      const deathImpacts = impacts.filter((i) => i.type === "TALENT_REMOVED");
      expect(deathImpacts).toHaveLength(0);
    });

    it("generates death event for old talent when death chance triggers", () => {
      const talent = createMockTalent({
        id: "t-old",
        name: "Old Talent",
        tier: "A_LIST",
        onMedicalLeave: false,
        demographics: { age: 90, gender: "MALE", ethnicity: "Caucasian", country: "USA" },
      });
      state.entities.talents = { "t-old": talent };
      // Force death to trigger
      vi.spyOn(rng, "next").mockReturnValue(0);
      vi.spyOn(rng, "pick").mockReturnValue("passed away peacefully in their sleep");
      vi.spyOn(rng, "uuid").mockReturnValue("death-1");
      vi.spyOn(rng, "rangeInt").mockReturnValue(4);

      const impacts = tickDeathSystem(state, rng);
      const removed = impacts.find((i) => i.type === "TALENT_REMOVED");
      expect(removed).toBeDefined();
      const news = impacts.find((i) => i.type === "NEWS_ADDED");
      expect(news).toBeDefined();
    });

    it("returns SYSTEM_TICK impact with deathEvents and deathCount when deaths occur", () => {
      const talent = createMockTalent({
        id: "t-die",
        name: "Doomed Talent",
        tier: "A_LIST",
        onMedicalLeave: false,
        demographics: { age: 95, gender: "MALE", ethnicity: "Caucasian", country: "USA" },
      });
      state.entities.talents = { "t-die": talent };
      vi.spyOn(rng, "next").mockReturnValue(0);
      vi.spyOn(rng, "pick").mockReturnValue("passed away peacefully in their sleep");
      vi.spyOn(rng, "uuid").mockReturnValue("death-1");
      vi.spyOn(rng, "rangeInt").mockReturnValue(4);

      const impacts = tickDeathSystem(state, rng);
      const systemTick = impacts.find((i) => i.type === "SYSTEM_TICK");
      expect(systemTick).toBeDefined();
      const payload = (systemTick as unknown as { payload: { deathEvents: unknown[]; deathCount: number } }).payload;
      expect(payload.deathEvents).toBeDefined();
      expect(payload.deathCount).toBeGreaterThan(0);
    });

    it("does not return SYSTEM_TICK impact when no deaths occur", () => {
      state.entities.talents = {};
      const impacts = tickDeathSystem(state, rng);
      const systemTick = impacts.find((i) => i.type === "SYSTEM_TICK");
      expect(systemTick).toBeUndefined();
    });

    it("skips undefined talent entries in for...in loop", () => {
      state.entities.talents = { "t-undef": undefined as unknown as Talent };
      vi.spyOn(rng, "next").mockReturnValue(0);
      const impacts = tickDeathSystem(state, rng);
      expect(impacts).toEqual([]);
    });
  });

  describe("getDeathStatistics", () => {
    it("returns zero statistics for empty state", () => {
      const stats = getDeathStatistics(state, 52);
      expect(stats.totalDeaths).toBe(0);
      expect(stats.duringProduction).toBe(0);
      expect(stats.byType.natural).toBe(0);
      expect(stats.byType.accident).toBe(0);
    });

    it("returns properly structured byType record", () => {
      const stats = getDeathStatistics(state, 52);
      expect(stats.byType).toHaveProperty("natural");
      expect(stats.byType).toHaveProperty("accident");
      expect(stats.byType).toHaveProperty("overdose");
      expect(stats.byType).toHaveProperty("suicide");
      expect(stats.byType).toHaveProperty("violence");
      expect(stats.byType).toHaveProperty("illness");
    });
  });
});
