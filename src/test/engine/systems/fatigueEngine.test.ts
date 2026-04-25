import { describe, it, expect } from "vitest";
import {
  calculateFranchiseFatigue,
  calculateReleaseGapImpact,
} from "../../../engine/systems/ip/fatigueEngine";
import { Franchise } from "../../../engine/types";

describe("Fatigue Engine", () => {
  const mockFranchise: Franchise = {
    id: "f1",
    name: "Galaxy Wars",
    activeProjectIds: ["p1"],
    assetIds: ["ip1"],
    fatigueLevel: 0,
    audienceLoyalty: 50,
    synergyMultiplier: 1.0,
    totalEquity: 1000000,
    relevanceScore: 100,
    lastReleaseWeeks: [100],
    creationWeek: 50,
  };

  it("calculates high fatigue for a heavily penalized oversaturated genre (Superhero)", () => {
    const fatigue = calculateFranchiseFatigue(mockFranchise, 2, "Superhero");
    // activeCount (1) * 0.15 = 0.15
    // rivalPenalty (2/12 * 0.1) = 0.016
    // loyaltyShield (50/100 * 0.3) = 0.15
    // 0.15 + 0.016 - 0.15 = 0.016
    expect(fatigue).toBeCloseTo(0.666, 2);
  });

  it("applies exponential dilution for multiple active projects", () => {
    const crowdedFranchise = {
      ...mockFranchise,
      activeProjectIds: ["p1", "p2", "p3"],
      audienceLoyalty: 0,
    };
    const fatigue = calculateFranchiseFatigue(crowdedFranchise, 0, "Action");
    // activeCount (3) * 0.15 * 2.5 = 1.125 (clamped to 1.0)
    expect(fatigue).toBe(1.0);
  });

  it("triggers Nostalgia Spike for 10+ year gaps", () => {
    const impact = calculateReleaseGapImpact([100], 620); // 520 weeks = 10 years
    expect(impact.buzzBonus).toBe(40);
    expect(impact.fatigueReset).toBe(true);
  });

  it("identifies The Dead Zone for 5 year gaps", () => {
    const impact = calculateReleaseGapImpact([100], 360); // ~5 years
    expect(impact.buzzBonus).toBe(-15);
    expect(impact.label).toContain("Dead Zone");
  });

  it("calculates high fatigue for a heavily penalized oversaturated genre (Multiverse)", () => {
    const fatigue = calculateFranchiseFatigue(mockFranchise, 7, "Multiverse");
    // activeCount (1) * 0.85 = 0.85
    // rivalPenalty ((7/12) * 0.1) * 2.5 = 0.145833
    // loyaltyShield (50/100 * 0.3) = 0.15
    // 0.85 + 0.145833 - 0.15 = 0.845833
    expect(fatigue).toBeCloseTo(0.846, 3);
  });

  it("calculates high fatigue for a heavily penalized oversaturated genre (IP Mashup)", () => {
    const fatigue = calculateFranchiseFatigue(mockFranchise, 8, "IP Mashup");
    // activeCount (1) * 0.7 = 0.7
    // rivalPenalty ((8/12) * 0.1) * 2.2 = 0.146666
    // loyaltyShield (50/100 * 0.3) = 0.15
    // 0.7 + 0.146666 - 0.15 = 0.696666
    expect(fatigue).toBeCloseTo(0.697, 3);
  });
});
