import { describe, it, expect, vi, beforeEach } from "vitest";
import { advanceScandals } from "../../../engine/systems/scandals";
import { GameState, Scandal } from "../../../engine/types";

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
      const impacts = advanceScandals(initialState);
      expect(impacts).toHaveLength(0);
    });

    it("removes expired scandals via SCANDAL_REMOVED", () => {
      const s1: Scandal = { 
          id: "s1", 
          talentId: "t1", 
          severity: 50, 
          type: "legal", 
          weeksRemaining: 1 
      };
      
      const initialState = createMockState([s1]);
      const impacts = advanceScandals(initialState);
      const removeImpact = impacts.find(i => i.type === 'SCANDAL_REMOVED');
      expect(removeImpact?.payload.scandalId).toBe("s1");
    });
  });
});
