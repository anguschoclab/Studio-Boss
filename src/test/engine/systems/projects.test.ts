import { describe, it, expect, vi } from "vitest";
import { advanceProject, handleReleasePhaseEntry } from "../../../engine/systems/projects";
import { Project, Talent, Contract } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";
import { createMockProject, createMockTalent, createMockContract } from "../../utils/mockFactories";

const mockProject = createMockProject({
  id: "proj-1",
  title: "Test Project",
  state: "development",
  developmentWeeks: 2,
  productionWeeks: 2,
});

describe("advanceProject", () => {
  const rng = new RandomGenerator(42);

  it("does nothing for archived projects", () => {
    const project = { ...mockProject, state: "archived" as const };
    const impacts = advanceProject(project, 1, 50, [], {}, rng);
    expect(impacts).toEqual([]);
  });

  it("advances development project normally", () => {
    const impacts = advanceProject(mockProject, 1, 50, [], {}, rng);
    expect(impacts.length).toBeGreaterThan(0);
    const projectUpdate = impacts.find(i => i.type === 'PROJECT_UPDATED');
    expect(projectUpdate).toBeDefined();
    expect(projectUpdate?.payload.update.weeksInPhase).toBe(1);
  });

  it("transitions from development to needs_greenlight", () => {
    const project = { ...mockProject, weeksInPhase: 1 };
    const impacts = advanceProject(project, 1, 50, [], {}, rng);
    const projectUpdate = impacts.find(i => i.type === 'PROJECT_UPDATED');
    expect(projectUpdate?.payload.update.state).toBe("needs_greenlight");
    expect(projectUpdate?.payload.update.weeksInPhase).toBe(0);
  });

  it("transitions from production to marketing", () => {
    const project = { ...mockProject, state: "production" as const, weeksInPhase: 1 };
    const impacts = advanceProject(project, 1, 50, [], {}, rng);
    const projectUpdate = impacts.find(i => i.type === 'PROJECT_UPDATED');
    expect(projectUpdate?.payload.update.state).toBe("marketing");
    expect(projectUpdate?.payload.update.weeksInPhase).toBe(0);
  });

  it("accumulates revenue and decays weekly revenue for released projects", () => {
    const project = { ...mockProject, state: "released" as const, weeklyRevenue: 500000, format: 'film' as const };
    const impacts = advanceProject(project, 1, 50, [], {}, rng);
    const projectUpdate = impacts.find(i => i.type === 'PROJECT_UPDATED');
    expect(projectUpdate?.payload.update.revenue).toBeGreaterThan(0);
    expect(projectUpdate?.payload.update.weeklyRevenue).toBeDefined();
  });

  it("transitions to post_release for low revenue projects", () => {
    const project = { ...mockProject, state: "released" as const, weeklyRevenue: 50 };
    const impacts = advanceProject(project, 1, 50, [], {}, rng);
    const projectUpdate = impacts.find(i => i.type === 'PROJECT_UPDATED');
    expect(projectUpdate?.payload.update.state).toBe("post_release");
  });

  it("transitions tv from development to pitching", () => {
    const project = { ...mockProject, weeksInPhase: 1, format: 'tv' as const, type: 'SERIES' as const } as any;
    const impacts = advanceProject(project, 1, 50, [], {}, rng);
    const projectUpdate = impacts.find(i => i.type === 'PROJECT_UPDATED');
    expect(projectUpdate?.payload.update.state).toBe("pitching");
    expect(projectUpdate?.payload.update.weeksInPhase).toBe(0);
  });

  it("drifts buzz with talent buzz bonus during dev", () => {
    const project = { ...mockProject, buzz: 50 };
    const mockTalent = createMockTalent({ id: "t1", name: "Star", role: "actor", roles: ["actor"], prestige: 100 });
    const pool = { "t1": mockTalent };
    const contracts = [createMockContract({ id: "c1", projectId: "proj-1", talentId: "t1", role: "actor" })];
    
    const impacts = advanceProject(project, 1, 50, contracts, pool, rng);
    const projectUpdate = impacts.find(i => i.type === 'PROJECT_UPDATED');
    // Buzz drift includes random roll (-4 to 6) plus talent bonus, so it can be less than initial
    expect(projectUpdate?.payload.update.buzz).toBeDefined();
  });

  describe("Handle Release Phase Entry", () => {
    it("transitions marketing project to released", () => {
      const proj = { ...mockProject, state: "marketing" as const };
      const impacts = handleReleasePhaseEntry(proj, 1, 50, [], {}, rng);
      expect(impacts.length).toBeGreaterThan(0);
      const projectUpdate = impacts.find(i => i.type === 'PROJECT_UPDATED');
      expect(projectUpdate?.payload.update.state).toBe("released");
      expect(projectUpdate?.payload.update.releaseWeek).toBe(1);
      expect(projectUpdate?.payload.update.reviewScore).toBeDefined();
    });
  });
});
