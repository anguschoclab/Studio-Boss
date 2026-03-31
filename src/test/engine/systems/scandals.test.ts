import { describe, it, expect, vi, beforeEach } from "vitest";
import { advanceScandals } from "../../../engine/systems/scandals";
import { GameState, Scandal } from "../../../engine/types";
import * as utils from "../../../engine/utils";

describe("scandals system", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("advanceScandals", () => {
    const createMockState = (scandals: Scandal[]): GameState => ({
      industry: { scandals },
      studio: {
        internal: {
          projects: {},
          contracts: [],
          talentPool: {}
        }
      }
    } as unknown as GameState);

    it("returns empty impact if there are no scandals", () => {
      const initialState = createMockState([]);
      const impact = advanceScandals(initialState);
      expect(impact.scandalUpdates).toBeDefined();
      expect(impact.scandalUpdates).toHaveLength(0);
    });

    it("decrements weeksRemaining for active scandals", () => {
      const s1: Scandal = { 
          id: "s1", 
          talentId: "t1", 
          severity: 50, 
          type: "personal", 
          weeksRemaining: 3 
      };
      
      const initialState = createMockState([s1]);
      const impact = advanceScandals(initialState);
      expect(impact.scandalUpdates![0].update.weeksRemaining).toBe(2);
    });

    it("removes expired scandals via removeScandalIds", () => {
      const s1: Scandal = { 
          id: "s1", 
          talentId: "t1", 
          severity: 50, 
          type: "legal", 
          weeksRemaining: 1 
      };
      
      const initialState = createMockState([s1]);
      const impact = advanceScandals(initialState);
      expect(impact.removeScandalIds).toContain("s1");
    });
  });
});
