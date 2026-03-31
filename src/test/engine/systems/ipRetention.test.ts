import { describe, it, expect } from "vitest";
import { calculateIPValue } from "../../../engine/systems/ipRetention";
import { Project, AwardsProfile } from "../../../engine/types";

describe("calculateIPValue", () => {
  const baseProject: Project = {
    id: "p1",
    title: "Test Project",
    type: "FILM",
    format: "film",
    genre: "Drama",
    budgetTier: "mid",
    budget: 1_000_000,
    weeklyCost: 100_000,
    targetAudience: "General",
    flavor: "Test",
    state: "development",
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 10,
    productionWeeks: 10,
    revenue: 5_000_000,
    weeklyRevenue: 0,
    releaseWeek: null,
    activeCrisis: null,
    momentum: 50,
    progress: 0,
    accumulatedCost: 0,
    contentFlags: []
  } as Project;

  it("returns 10% of budget for early stages", () => {
    const devProject = { ...baseProject, state: "development" as const } as Project;
    const pitchingProject = { ...baseProject, state: "pitching" as const } as Project;
    const greenlightProject = { ...baseProject, state: "needs_greenlight" as const } as Project;

    expect(calculateIPValue(devProject)).toBe(100_000);
    expect(calculateIPValue(pitchingProject)).toBe(100_000);
    expect(calculateIPValue(greenlightProject)).toBe(100_000);
  });

  it("returns 40% of revenue for released/other stages", () => {
    const releasedProject = { ...baseProject, state: "released" as const } as Project;
    expect(calculateIPValue(releasedProject)).toBe(2_000_000);
  });

  it("applies a 1.5x multiplier for high prestige score (> 80)", () => {
    const prestigeProject = {
      ...baseProject,
      state: "released" as const,
      awardsProfile: { 
          criticScore: 90,
          audienceScore: 80,
          prestigeScore: 85,
          craftScore: 80,
          culturalHeat: 40,
          campaignStrength: 20,
          controversyRisk: 5,
          festivalBuzz: 0,
          academyAppeal: 80,
          guildAppeal: 75,
          populistAppeal: 30,
          indieCredibility: 95,
          industryNarrativeScore: 60
      } as AwardsProfile,
    } as Project;
    // 5000000 * 0.4 * 1.5 = 3000000
    expect(calculateIPValue(prestigeProject)).toBe(3_000_000);
  });
});
