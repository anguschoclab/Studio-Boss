import { describe, it, expect } from "vitest";
import { tickTelevision } from "../../../../engine/systems/television/televisionTick";
import { evaluateRenewal } from "../../../../engine/systems/television/renewalEngine";
import { GameState, SeriesProject, StreamerPlatform } from "../../../../engine/types";
import { RandomGenerator } from "../../../../engine/utils/rng";

describe("Syndication Baron Mechanics", () => {
  it("should verify the default threshold behavior of evaluateRenewal", () => {
      // Create a mock project
      const mockProject = {
          id: "tv-test",
          budgetTier: "mid",
          tvDetails: {
              currentSeason: 1,
              episodesAired: 10,
              episodesOrdered: 10,
              status: "ON_AIR"
          }
      } as unknown as SeriesProject;

      // 4.5 is the BUBBLE for a 5.0 threshold.
      expect(evaluateRenewal(mockProject, 4.5)).toBe("ON_BUBBLE");

      // If we manually pass a 6.0 threshold (representing the flatline penalty), 4.5 is CANCELLED.
      expect(evaluateRenewal(mockProject, 4.5, 6.0)).toBe("CANCELLED");
  });
});
