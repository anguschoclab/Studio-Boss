import { describe, it, expect } from "vitest";
import { calculateIPValue } from "../../../engine/systems/ipRetention";
import { Project } from "../../../engine/types";

describe("calculateIPValue", () => {
  const baseProject: Partial<Project> = {
    budget: 1000000,
    revenue: 5000000,
    genre: "Drama",
  };

  it("returns 10% of budget for early stages", () => {
    const devProject = { ...baseProject, status: "development" } as Project;
    const pitchingProject = { ...baseProject, status: "pitching" } as Project;
    const greenlightProject = { ...baseProject, status: "needs_greenlight" } as Project;

    expect(calculateIPValue(devProject)).toBe(100000);
    expect(calculateIPValue(pitchingProject)).toBe(100000);
    expect(calculateIPValue(greenlightProject)).toBe(100000);
  });

  it("returns 40% of revenue for released/other stages", () => {
    const releasedProject = { ...baseProject, status: "released" } as Project;
    expect(calculateIPValue(releasedProject)).toBe(2000000);
  });

  it("applies a 1.5x multiplier for high prestige score (> 80)", () => {
    const prestigeProject = {
      ...baseProject,
      status: "released",
      awardsProfile: { prestigeScore: 85, buzzMultiplier: 1.5, hypeMultiplier: 1.5 },
    } as Project;
    // 5000000 * 0.4 * 1.5 = 3000000
    expect(calculateIPValue(prestigeProject)).toBe(3000000);
  });

  it("does not apply prestige multiplier if score is exactly 80 or lower", () => {
    const midPrestigeProject = {
      ...baseProject,
      status: "released",
      awardsProfile: { prestigeScore: 80, buzzMultiplier: 1.0, hypeMultiplier: 1.0 },
    } as Project;
    // 5000000 * 0.4 = 2000000
    expect(calculateIPValue(midPrestigeProject)).toBe(2000000);
  });
});
