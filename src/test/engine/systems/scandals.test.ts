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
      entities: {
        projects: {},
        contracts: {},
        talents: {},
        rivals: {}
      },
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

    it("updates existing scandals via SCANDAL_UPDATED", () => {
      const s1: Scandal = {
          id: "s1",
          talentId: "t1",
          severity: 50,
          type: "legal",
          weeksRemaining: 5
      };

      const initialState = createMockState([s1]);
      const impacts = advanceScandals(initialState);
      const updateImpact = impacts.find(i => i.type === 'SCANDAL_UPDATED');
      expect(updateImpact).toBeDefined();
      expect(updateImpact?.payload.scandalId).toBe("s1");
      expect(updateImpact?.payload.update.weeksRemaining).toBe(4);
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
