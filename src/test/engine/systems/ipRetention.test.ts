import { describe, it, expect } from "vitest";
import { calculateIPValue } from "../../../engine/systems/ipRetention";
import { Project } from "../../../engine/types";

describe("calculateIPValue", () => {
  const baseProject: Project = {
    id: "p1",
    title: "Test Project",
    format: "film",
    budgetTier: "mid",
    targetAudience: "General",
    flavor: "Test",
    status: "development",
    weeksInPhase: 0,
    developmentWeeks: 10,
    productionWeeks: 10,
    weeklyCost: 10000,
    buzz: 50,
    revenue: 5000000,
    weeklyRevenue: 0,
    releaseWeek: null,
    budget: 1000000,
    genre: "Drama",
  };

  it("returns 10% of budget for early stages", () => {
    const devProject = { ...baseProject, status: "development" as const };
    const pitchingProject = { ...baseProject, status: "pitching" as const };
    const greenlightProject = { ...baseProject, status: "needs_greenlight" as const };

    expect(calculateIPValue(devProject)).toBe(100000);
    expect(calculateIPValue(pitchingProject)).toBe(100000);
    expect(calculateIPValue(greenlightProject)).toBe(100000);
  });

  it("returns 40% of revenue for released/other stages", () => {
    const releasedProject = { ...baseProject, status: "released" as const };
    expect(calculateIPValue(releasedProject)).toBe(2000000);
  });

  it("applies a 1.5x multiplier for high prestige score (> 80)", () => {
    const prestigeProject = {
      ...baseProject,
      status: "released" as const,
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
      },
    } as Project;
    // 5000000 * 0.4 * 1.5 = 3000000
    expect(calculateIPValue(prestigeProject)).toBe(3000000);
  });
});
