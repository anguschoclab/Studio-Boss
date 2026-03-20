import { describe, it, expect } from "vitest";
import { advanceProject } from "../../../engine/systems/projects";
import { Project } from "../../../engine/types";

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
  format: "film",
  targetAudience: "General",
  flavor: "Quirky",
  releaseWeek: null,
  weeklyCost: 10000,
  buzz: 50,
  revenue: 0,
  weeklyRevenue: 0,
};

import { handleReleasePhaseEntry } from '@/engine/systems/projects';

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

  it("transitions from development to needs_greenlight", () => {
    const project = { ...mockProject, weeksInPhase: 1 };
    const { project: p, update } = advanceProject(project, 1, 10, [], new Map());
    expect(p.status).toBe("needs_greenlight");
    expect(p.weeksInPhase).toBe(0);
    expect(update).toContain("is ready for greenlight committee review");
  });

  it("transitions from production to marketing", () => {
    const project = { ...mockProject, status: "production" as const, weeksInPhase: 1 };
    const { project: p, update } = advanceProject(project, 1, 10, [], new Map());
    expect(p.status).toBe("marketing");
    expect(p.weeksInPhase).toBe(0);
    expect(update).toContain("has wrapped production");
  });

  it("handleReleasePhaseEntry transitions to released", () => {
    const project = { ...mockProject, status: "marketing" as const, weeksInPhase: 0 };
    handleReleasePhaseEntry(project, 1, 10, [], new Map());
    expect(project.status).toBe("released");
    expect(project.releaseWeek).toBe(1);
    expect(project.revenue).toBe(0);
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
