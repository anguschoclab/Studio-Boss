import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  tickAntitrust,
  isAcquirerBlockedByAntitrust,
  resetAntitrustState,

  antitrustBlockList,
} from "@/engine/systems/industry/Antitrust";
// import type { GameState } from "@/engine/types";
import { createMockGameState, createMockRival } from "../../generators/mockFactory";

import * as utils from "@/engine/utils";

function makeRivalDict(count: number, cash: number): Record<string, any> {
  const dict: Record<string, any> = {};
  for (let i = 0; i < count; i++) {
    dict[`rival-${i}`] = createMockRival({
      id: `rival-${i}`,
      name: `Rival ${i}`,
      cash,
      strength: 50,
    });
  }
  return dict;
}

describe("Antitrust System", () => {
  beforeEach(() => {
    resetAntitrustState();
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.001);
  });

  describe("computeConcentration (via tickAntitrust)", () => {
    it("returns empty impacts when not dominant", () => {
      const state = createMockGameState({
        week: 300,
        finance: { cash: 50_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: {
          projects: {},
          talents: {},
          contracts: {},
          rivals: makeRivalDict(6, 50_000_000),
        } as any,
      });

      const impacts = tickAntitrust(state);
      expect(impacts).toHaveLength(0);
    });

    it("returns empty impacts when positiveCount < MIN_POSITIVE_COUNT (5)", () => {
      const rivals = makeRivalDict(3, 50_000_000);
      const state = createMockGameState({
        week: 300,
        finance: { cash: 500_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
      });

      const impacts = tickAntitrust(state);
      expect(impacts).toHaveLength(0);
    });

    it("returns empty impacts during cooldown period", () => {
      const rivals = makeRivalDict(6, 10_000_000);
      const state = createMockGameState({
        week: 300,
        finance: { cash: 500_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
      });

      // First call triggers an action (secureRandom returns 0.001 ≤ 0.005)
      tickAntitrust(state);
      // Second call should be blocked by cooldown (260 weeks)
      const impacts2 = tickAntitrust({ ...state, week: 301 });
      expect(impacts2).toHaveLength(0);
    });

    it("produces divestiture impacts when single entity is dominant", () => {
      const rivals = makeRivalDict(6, 10_000_000);
      const dominantRival = createMockRival({
        id: "dominant-1",
        name: "Mega Corp",
        cash: 2_000_000_000,
        strength: 90,
      });
      rivals["dominant-1"] = dominantRival;

      const state = createMockGameState({
        week: 300,
        finance: { cash: 50_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
      });

      const impacts = tickAntitrust(state);
      const hasIndustryUpdate = impacts.some((i) => i.type === "INDUSTRY_UPDATE");
      const hasRivalUpdated = impacts.some((i) => i.type === "RIVAL_UPDATED");
      const hasNews = impacts.some((i) => i.type === "NEWS_ADDED");
      expect(hasIndustryUpdate).toBe(true);
      expect(hasRivalUpdated).toBe(true);
      expect(hasNews).toBe(true);
    });

    it("produces fine impacts (FUNDS_CHANGED) when player is the dominant entity", () => {
      const rivals = makeRivalDict(6, 10_000_000);
      const state = createMockGameState({
        week: 300,
        finance: { cash: 2_000_000_000, ledger: [], weeklyHistory: [] } as any,
        studio: {
          id: "PLAYER",
          name: "Player",
          archetype: "major",
          prestige: 50,
          internal: { projectHistory: [], firstLookDeals: [] },
        } as any,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
      });

      const impacts = tickAntitrust(state);
      const hasFundsChanged = impacts.some((i) => i.type === "FUNDS_CHANGED");
      const hasNews = impacts.some((i) => i.type === "NEWS_ADDED");
      expect(hasFundsChanged).toBe(true);
      expect(hasNews).toBe(true);
    });

    it("handles empty rivals dict gracefully", () => {
      const state = createMockGameState({
        week: 300,
        finance: { cash: 50_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: { projects: {}, talents: {}, contracts: {}, rivals: {} } as any,
      });

      const impacts = tickAntitrust(state);
      expect(impacts).toHaveLength(0);
    });

    it("handles null/undefined rivals gracefully", () => {
      const state = createMockGameState({
        week: 300,
        finance: { cash: 50_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: { projects: {}, talents: {}, contracts: {}, rivals: undefined as any } as any,
      });

      expect(() => tickAntitrust(state)).not.toThrow();
    });
  });

  describe("isAcquirerBlockedByAntitrust", () => {
    it("returns true when acquirer is on block list and week < untilWeek", () => {
      resetAntitrustState();
      antitrustBlockList.push({ acquirerId: "rival-1", untilWeek: 200 });
      expect(isAcquirerBlockedByAntitrust("rival-1", 100)).toBe(true);
    });

    it("returns false when block has expired", () => {
      resetAntitrustState();
      antitrustBlockList.push({ acquirerId: "rival-1", untilWeek: 200 });
      expect(isAcquirerBlockedByAntitrust("rival-1", 250)).toBe(false);
    });

    it("returns false when acquirer not on list", () => {
      resetAntitrustState();
      antitrustBlockList.push({ acquirerId: "rival-1", untilWeek: 200 });
      expect(isAcquirerBlockedByAntitrust("rival-2", 100)).toBe(false);
    });
  });
});
