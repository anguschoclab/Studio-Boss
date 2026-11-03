import { describe, expect } from "vitest";
import { calculateWeeklyRevenue } from "../../../engine/systems/finance";
import { Project } from "../../../engine/types";

describe("Finance: Cult Classic Revenue", () => {
  const baseProject: Project = {
    id: "p1",
    title: "Flop",
    format: "film",
    genre: "Drama",
    budgetTier: "low",
    budget: 1000000,
    weeklyCost: 10000,
    targetAudience: "General Audience",
    flavor: "A nice drama",
    state: "released",
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 4,
    productionWeeks: 4,
    revenue: 0,
    weeklyRevenue: 50000,
    releaseWeek: null,
    distributionStatus: "theatrical",
  } as Project;

  it("Cult Classic projects generate long-tail revenue minimums", () => {
    // Normal project: 50000 * 0.35 decay = 17500
    const normalProject = { ...baseProject, weeklyRevenue: 50000 };
    const revNormal = calculateWeeklyRevenue([normalProject]);
    expect(revNormal).toBe(17500);

    // Cult classic: Math.max(17500 * 2, 50000) = 50000
    const cultProject = { ...baseProject, isCultClassic: true, weeklyRevenue: 50000 };
    const revCult = calculateWeeklyRevenue([cultProject]);
    expect(revCult).toBe(50000);
  });
});
