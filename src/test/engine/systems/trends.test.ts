import { describe, it, expect } from "vitest";
import {
  initializeTrends,
  advanceTrends,
  getTrendMultiplier,
} from "../../../engine/systems/trends";

describe("Trends System", () => {
  it("initializes with a set of default genre trends", () => {
    const trends = initializeTrends();
    expect(trends.length).toBeGreaterThan(0);

    // Check structure
    expect(trends[0].genre).toBeDefined();
    expect(trends[0].heat).toBeGreaterThanOrEqual(10);
    expect(trends[0].heat).toBeLessThanOrEqual(100);
  });

  it("advances trends correctly over a week", () => {
    const initialTrends = initializeTrends();
    const impacts = advanceTrends(initialTrends);
    const trendImpact = impacts.find((i) => i.type === "TRENDS_UPDATED");
    const newTrends = trendImpact?.payload.trends;

    expect(newTrends?.length).toBeGreaterThanOrEqual(initialTrends.length - 1); // might drop if dead
    // Values should fluctuate but remain clamped
    newTrends?.forEach((trend: any) => {
      expect(trend.heat).toBeGreaterThanOrEqual(0);
      expect(trend.heat).toBeLessThanOrEqual(100);
    });
  });

  it("calculates the trend multiplier for a matching genre", () => {
    const trends = initializeTrends();
    // Force the first genre to have a very high heat
    trends[0].heat = 100;
    const state = { market: { trends } } as any;

    const multiplier = getTrendMultiplier({ genre: trends[0].genre, targetAudience: "Any" }, state);
    expect(multiplier).toBe(1.3); // 1.0 + 0.3 = 1.3
  });

  it("returns a multiplier of 1.0 for a missing genre", () => {
    const state = { market: { trends: [] } } as any;
    const multiplier = getTrendMultiplier({ genre: "Unknown Genre", targetAudience: "Any" }, state);
    expect(multiplier).toBe(1.0); // Fallback to 1.0
  });

  it("shifts directions properly based on thresholds", () => {
    let trends = initializeTrends();
    for (let i = 0; i < 50; i++) {
      const impacts = advanceTrends(trends);
      const trendImpact = impacts.find((i) => i.type === "TRENDS_UPDATED");
      trends = trendImpact?.payload.trends || [];
    }

    trends.forEach((trend) => {
      expect(["rising", "cooling", "stable", "dead"]).toContain(trend.direction);
    });
  });

  // Characterization lock for the Bolt fused-loop rewrite — pins the exact
  // removal predicate (post-map weeksRemaining > 0 AND newHeat > 0) and the
  // direction-boundary transitions. Green before AND after.
  describe("advanceTrends removal predicate", () => {
    const impactTrends = (impacts: any[]) =>
      impacts.find((i) => i.type === "TRENDS_UPDATED")?.payload.trends as any[];

    it("drops a trend whose weeksRemaining hits 0", () => {
      const trends = [
        { genre: "x", heat: 50, direction: "stable", weeksRemaining: 1 },
        { genre: "y", heat: 50, direction: "stable", weeksRemaining: 3 },
      ] as any[];
      const updated = impactTrends(advanceTrends(trends));
      const kept = updated.filter((t) => t.genre === "y");
      const dropped = updated.filter((t) => t.genre === "x");
      expect(kept[0]?.weeksRemaining).toBe(2);
      expect(dropped).toHaveLength(0);
    });

    it("drops a cooling trend whose heat reaches 0 even with weeks remaining", () => {
      const trends = [
        { genre: "z", heat: 5, direction: "cooling", weeksRemaining: 10 },
      ] as any[];
      const updated = impactTrends(advanceTrends(trends));
      expect(updated.filter((t) => t.genre === "z")).toHaveLength(0);
    });

    it("flips direction at heat boundaries (rising→stable at 100, cooling→dead at 0)", () => {
      const trends = [
        { genre: "hot", heat: 98, direction: "rising", weeksRemaining: 10 },
        { genre: "cold", heat: 3, direction: "cooling", weeksRemaining: 10 },
      ] as any[];
      const updated = impactTrends(advanceTrends(trends));
      const hot = updated.find((t) => t.genre === "hot");
      // cold hits heat 0 → dropped entirely by the >0 filter
      expect(hot.heat).toBe(100);
      expect(hot.direction).toBe("stable");
      expect(updated.find((t) => t.genre === "cold")).toBeUndefined();
    });
  });
});
