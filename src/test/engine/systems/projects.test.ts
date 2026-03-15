import { describe, it, expect } from "vitest";
import { advanceProject } from "../../../engine/systems/projects";
import { Project, Contract, TalentProfile } from "../../../engine/types";

const mockProject: Project = {
  id: "proj-1",
  title: "Test Project",
  budgetTier: "low",
  budget: 500000,
  genre: "Comedy",
  status: "development",
  developmentWeeks: 2,
  productionWeeks: 2,
  weeksInPhase: 0,
  revenue: 0,
  weeklyRevenue: 0,
  weeklyCost: 10000,
  buzz: 50,
};

describe("advanceProject", () => {
  it("does nothing for archived projects", () => {
    const project = { ...mockProject, status: "archived" as const };
    const { project: p, update } = advanceProject(project, 1, 10, [], new Map());
    expect(p.status).toBe("archived");
    expect(update).toBeNull();
  });

  it("advances development project normally", () => {
    const { project: p, update } = advanceProject(mockProject, 1, 10, [], new Map());
    expect(p.weeksInPhase).toBe(1);
    expect(p.status).toBe("development");
    expect(update).toBeNull();
  });

  it("transitions from development to production", () => {
    const project = { ...mockProject, weeksInPhase: 1 };
    const { project: p, update } = advanceProject(project, 1, 10, [], new Map());
    expect(p.status).toBe("production");
    expect(p.weeksInPhase).toBe(0);
    expect(update).toContain("enters production");
  });

  it("transitions from production to released", () => {
    const project = { ...mockProject, status: "production" as const, weeksInPhase: 1 };
    const { project: p, update } = advanceProject(project, 1, 10, [], new Map());
    expect(p.status).toBe("released");
    expect(p.weeksInPhase).toBe(0);
    expect(p.releaseWeek).toBe(1);
    expect(update).toContain("releases");
  });

  it("accumulates revenue and decays weekly revenue for released projects", () => {
    const project = { ...mockProject, status: "released" as const, weeklyRevenue: 500000 };
    const { project: p, update } = advanceProject(project, 1, 10, [], new Map());
    expect(p.revenue).toBe(500000);
    expect(p.weeklyRevenue).toBeLessThan(500000);
    expect(update).toBeNull(); // Update happens when archived
  });

  it("archives released project after its run", () => {
    const project = { ...mockProject, status: "released" as const, weeklyRevenue: 50000 };
    const { project: p, update } = advanceProject(project, 1, 10, [], new Map());
    expect(p.status).toBe("archived");
    expect(update).toContain("completes its run");
  });
});
