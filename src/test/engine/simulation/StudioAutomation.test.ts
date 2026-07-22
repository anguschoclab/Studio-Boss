import { describe, it, expect, beforeEach, vi } from "vitest";
import { StudioAutomation } from "@/engine/simulation/StudioAutomation";
import { createMockGameState, createMockRival, createMockProject } from "@/test/utils/mockFactories";
import { RandomGenerator } from "@/engine/utils/rng";
import { GameState, RivalStudio } from "@/engine/types";

describe("StudioAutomation", () => {
  let state: GameState;
  let rng: RandomGenerator;

  beforeEach(() => {
    state = createMockGameState();
    rng = new RandomGenerator(42);
  });

  describe("tick", () => {
    it("handles empty rivals gracefully", () => {
      state.entities.rivals = {};
      const impacts = StudioAutomation.tick(state, rng);
      expect(impacts).toEqual([]);
    });

    it("handles undefined rivals gracefully", () => {
      state.entities.rivals = undefined as unknown as Record<string, RivalStudio>;
      const impacts = StudioAutomation.tick(state, rng);
      expect(impacts).toEqual([]);
    });

    it("handles empty projects gracefully", () => {
      const rival = createMockRival({ id: "rival-1", cash: 100_000_000 });
      state.entities.rivals = { "rival-1": rival };
      state.entities.projects = {};
      vi.spyOn(rng, "next").mockReturnValue(0.99);
      const impacts = StudioAutomation.tick(state, rng);
      expect(impacts).toBeDefined();
      expect(Array.isArray(impacts)).toBe(true);
    });

    it("skips undefined rival entries in for...in loop", () => {
      state.entities.rivals = { "rival-undef": undefined as unknown as RivalStudio };
      vi.spyOn(rng, "next").mockReturnValue(0.99);
      const impacts = StudioAutomation.tick(state, rng);
      expect(impacts).toEqual([]);
    });

    it("archives old released projects for rivals", () => {
      const rival = createMockRival({ id: "rival-1" });
      const project = createMockProject({
        id: "proj-released",
        ownerId: "rival-1",
        state: "released",
        releaseWeek: 1,
      });
      state.entities.rivals = { "rival-1": rival };
      state.entities.projects = { "proj-released": project };
      state.week = 10;
      vi.spyOn(rng, "next").mockReturnValue(0.99);

      const impacts = StudioAutomation.tick(state, rng);
      const archiveImpact = impacts.find(
        (i) => i.type === "PROJECT_UPDATED" &&
        (i.payload as unknown as { update: { state?: string } }).update?.state === "archived"
      );
      expect(archiveImpact).toBeDefined();
    });

    it("updates isAcquirable flag for distressed rivals", () => {
      const rival = createMockRival({
        id: "rival-distressed",
        cash: -60_000_000,
        isAcquirable: false,
      });
      state.entities.rivals = { "rival-distressed": rival };
      vi.spyOn(rng, "next").mockReturnValue(0.99);

      const impacts = StudioAutomation.tick(state, rng);
      const rivalUpdate = impacts.find(
        (i) => i.type === "RIVAL_UPDATED" &&
        (i.payload as unknown as { update: { isAcquirable?: boolean } }).update?.isAcquirable === true
      );
      expect(rivalUpdate).toBeDefined();
    });
  });
});
