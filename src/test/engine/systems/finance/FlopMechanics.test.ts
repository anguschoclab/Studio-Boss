import { describe, it, expect, beforeEach } from "vitest";
import {
  FlopSeverity,
  calculateFlopSeverity,
  calculateFlopPenalties,
  shouldRestructureStudio,
  applyFlopPenalties,
  processFlops,
} from "../../../../engine/systems/finance/FlopMechanics";
import {
  createMockGameState,
  createMockProject,
  createMockRival,
} from "../../../utils/mockFactories";
import { GameState } from "../../../../engine/types";

describe("FlopMechanics", () => {
  describe("calculateFlopSeverity", () => {
    it("returns NONE for ratio >= 0.8", () => {
      const project = createMockProject({ revenue: 80, budget: 100 });
      expect(calculateFlopSeverity(project)).toBe(FlopSeverity.NONE);
    });

    it("returns MINOR for ratio >= 0.5 and < 0.8", () => {
      const project = createMockProject({ revenue: 50, budget: 100 });
      expect(calculateFlopSeverity(project)).toBe(FlopSeverity.MINOR);
    });

    it("returns MAJOR for ratio >= 0.25 and < 0.5", () => {
      const project = createMockProject({ revenue: 25, budget: 100 });
      expect(calculateFlopSeverity(project)).toBe(FlopSeverity.MAJOR);
    });

    it("returns CATASTROPHIC for ratio < 0.25", () => {
      const project = createMockProject({ revenue: 24, budget: 100 });
      expect(calculateFlopSeverity(project)).toBe(FlopSeverity.CATASTROPHIC);
    });

    it("handles negative budgets mathematically consistently (extreme edge case)", () => {
      // If budget is negative, ratio is revenue / budget.
      // Revenue 100, budget -50 => ratio -2. This is < 0.25, so catastrophic.
      const project = createMockProject({ revenue: 100, budget: -50 });
      expect(calculateFlopSeverity(project)).toBe(FlopSeverity.CATASTROPHIC);
    });

    it("handles 0 budget by defaulting to 1", () => {
      const project = createMockProject({ revenue: 0, budget: 0 });
      expect(calculateFlopSeverity(project)).toBe(FlopSeverity.CATASTROPHIC); // 0/1 = 0 < 0.25
    });
  });

  describe("calculateFlopPenalties", () => {
    it("calculates correct penalties for MINOR severity", () => {
      const project = createMockProject({ budget: 1000000, marketingBudget: 500000 });
      const penalties = calculateFlopPenalties(project, FlopSeverity.MINOR);
      expect(penalties.severity).toBe(FlopSeverity.MINOR);
      expect(penalties.writeOffCost).toBe(Math.floor(1500000 * 0.3));
      expect(penalties.prestigePenalty).toBe(-5);
      expect(penalties.ipDevaluation).toBe(0.2);
      expect(penalties.shouldRestructure).toBe(false);
    });

    it("calculates correct penalties for MAJOR severity", () => {
      const project = createMockProject({
        budget: 1000000,
      } as unknown as import("../../../../engine/types").Project);
      const penalties = calculateFlopPenalties(project, FlopSeverity.MAJOR);
      expect(penalties.writeOffCost).toBe(500000);
      expect(penalties.prestigePenalty).toBe(-10);
      expect(penalties.ipDevaluation).toBe(0.4);
      expect(penalties.shouldRestructure).toBe(false);
    });

    it("calculates correct penalties for CATASTROPHIC severity", () => {
      const project = createMockProject({
        budget: 1000000,
      } as unknown as import("../../../../engine/types").Project);
      const penalties = calculateFlopPenalties(project, FlopSeverity.CATASTROPHIC);
      expect(penalties.writeOffCost).toBe(700000);
      expect(penalties.prestigePenalty).toBe(-20);
      expect(penalties.ipDevaluation).toBe(0.6);
      expect(penalties.shouldRestructure).toBe(true);
    });

    it("handles negative budgets mathematically consistently", () => {
      const project = createMockProject({
        budget: -1000000,
        marketingBudget: 0,
      } as unknown as import("../../../../engine/types").Project);
      const penalties = calculateFlopPenalties(project, FlopSeverity.CATASTROPHIC);
      expect(penalties.writeOffCost).toBeLessThan(0); // 0.7 * -1000000
    });
  });

  describe("applyFlopPenalties", () => {
    let state: GameState;

    beforeEach(() => {
      state = createMockGameState({ week: 10 });
    });

    it("returns empty array if severity is NONE", () => {
      const project = createMockProject({ id: "p1", revenue: 100, budget: 100 });
      const impacts = applyFlopPenalties(state, project, state.studio.id);
      expect(impacts).toHaveLength(0);
    });

    it("applies penalties to PLAYER correctly for MAJOR flop", () => {
      const project = createMockProject({ id: "p1", title: "Test Flop", revenue: 25, budget: 100 }); // ratio 0.25 -> MAJOR
      const impacts = applyFlopPenalties(state, project, state.studio.id);

      const fundsDeducted = impacts.find((i) => i.type === "FUNDS_DEDUCTED");
      expect(fundsDeducted).toBeDefined();
      expect((fundsDeducted?.payload as { amount: number }).amount).toBe(50); // 0.5 * 100

      const prestigeChanged = impacts.find((i) => i.type === "PRESTIGE_CHANGED");
      expect(prestigeChanged).toBeDefined();
      expect((prestigeChanged?.payload as { amount: number }).amount).toBe(-10);

      const newsAdded = impacts.find((i) => i.type === "NEWS_ADDED");
      expect(newsAdded).toBeDefined();
    });

    it("applies penalties to RIVAL correctly for CATASTROPHIC flop and triggers restructuring if multiple major flops", () => {
      const rivalId = "rival-123";
      const rival = createMockRival({
        id: rivalId,
        name: "Rival Studio",
        cash: 1000000,
        prestige: 50,
      });
      state.entities.rivals[rivalId] = rival;

      const project = createMockProject({
        id: "p2",
        title: "Rival Flop",
        revenue: 0,
        budget: 1000000,
      }); // 0 / 1000000 = 0 -> CATASTROPHIC
      const impacts = applyFlopPenalties(state, project, rivalId);

      const rivalUpdates = impacts.filter((i) => i.type === "RIVAL_UPDATED");
      expect(rivalUpdates.length).toBeGreaterThan(0);

      // Check cash deduction
      const cashUpdate = rivalUpdates.find(
        (i) => (i.payload as { update?: { cash?: number } }).update?.cash !== undefined
      );
      expect(cashUpdate).toBeDefined();
      expect((cashUpdate?.payload as { update: { cash: number } }).update.cash).toBe(300000); // 1M - 700k

      // Because it's a catastrophic flop, restructuring should be triggered
      // It pushes a RIVAL_UPDATED with strategy update
      const restructureUpdate = rivalUpdates.find(
        (i) =>
          (i.payload as { update?: { strategy?: string } }).update?.strategy === "prestige_chaser"
      );
      expect(restructureUpdate).toBeDefined();

      const newsUpdates = impacts.filter((i) => i.type === "NEWS_ADDED");
      expect(newsUpdates.length).toBeGreaterThan(0);
    });
  });

  describe("shouldRestructureStudio", () => {
    it("returns false for unknown studio", () => {
      expect(shouldRestructureStudio("unknown-rival", 10)).toBe(false);
    });

    it("returns true if studio has 1 catastrophic flop via applyFlopPenalties", () => {
      const state = createMockGameState({ week: 10 });
      const rivalId = "rival-cat";
      state.entities.rivals[rivalId] = createMockRival({ id: rivalId });

      // First trigger a catastrophic flop to populate history
      applyFlopPenalties(state, createMockProject({ revenue: 0, budget: 1000 }), rivalId);

      // Then check restructuring directly
      expect(shouldRestructureStudio(rivalId, 10)).toBe(true);
    });

    it("returns true if studio has 3 major flops in 1 year", () => {
      const state = createMockGameState({ week: 10 });
      const rivalId = "rival-major-3";
      state.entities.rivals[rivalId] = createMockRival({ id: rivalId });

      // Add 3 major flops in the same week
      applyFlopPenalties(state, createMockProject({ revenue: 250, budget: 1000 }), rivalId);
      applyFlopPenalties(state, createMockProject({ revenue: 250, budget: 1000 }), rivalId);
      applyFlopPenalties(state, createMockProject({ revenue: 250, budget: 1000 }), rivalId);

      expect(shouldRestructureStudio(rivalId, 10)).toBe(true);
    });
  });

  describe("processFlops", () => {
    it("processes flops for released projects in current week", () => {
      const state = createMockGameState({ week: 10 });

      const p1 = createMockProject({
        id: "p1",
        state: "released",
        releaseWeek: 10,
        ownerId: "player-studio",
        revenue: 0,
        budget: 100,
      });
      const p2 = createMockProject({
        id: "p2",
        state: "released",
        releaseWeek: 9,
        ownerId: "player-studio",
        revenue: 0,
        budget: 100,
      }); // Not current week
      const p3 = createMockProject({
        id: "p3",
        state: "production",
        ownerId: "player-studio",
        revenue: 0,
        budget: 100,
      }); // Not released

      state.entities.projects["p1"] = p1;
      state.entities.projects["p2"] = p2;
      state.entities.projects["p3"] = p3;

      const impacts = processFlops(state);

      // Should have impacts from p1 only (CATASTROPHIC flop for PLAYER)
      const fundsDeducted = impacts.filter((i) => i.type === "FUNDS_DEDUCTED");
      expect(fundsDeducted).toHaveLength(1);
    });
  });

  describe("player ownership via real studio ID", () => {
    it("emits FUNDS_DEDUCTED and PRESTIGE_CHANGED for player-owned catastrophic flop", () => {
      const state = createMockGameState({ week: 10 });
      const playerId = state.studio.id;

      const project = createMockProject({
        id: "player-flop",
        state: "released",
        releaseWeek: 10,
        ownerId: playerId,
        revenue: 0,
        budget: 1000,
      });
      state.entities.projects["player-flop"] = project;

      const impacts = processFlops(state);

      const fundsDeducted = impacts.filter((i) => i.type === "FUNDS_DEDUCTED");
      const prestigeChanged = impacts.filter((i) => i.type === "PRESTIGE_CHANGED");
      expect(fundsDeducted).toHaveLength(1);
      expect(prestigeChanged).toHaveLength(1);
    });

    it("does NOT emit FUNDS_DEDUCTED when ownerId does not match player studio id", () => {
      const state = createMockGameState({ week: 10 });
      // Simulate an orphaned project with an outdated magic-string ownerId
      const project = createMockProject({
        id: "orphan-flop",
        state: "released",
        releaseWeek: 10,
        ownerId: "orphaned-legacy-id",
        revenue: 0,
        budget: 1000,
      });
      state.entities.projects["orphan-flop"] = project;

      const impacts = processFlops(state);

      const fundsDeducted = impacts.filter((i) => i.type === "FUNDS_DEDUCTED");
      // Because 'orphaned-legacy-id' !== state.studio.id, this should NOT deduct player funds
      expect(fundsDeducted).toHaveLength(0);
    });
  });
});
