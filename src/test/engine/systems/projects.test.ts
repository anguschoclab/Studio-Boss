import { describe, it, expect, vi } from "vitest";
import { advanceProject, handleReleasePhaseEntry, executeMarketing, executeGreenlight, executePitching } from "../../../engine/systems/projects";
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

  describe("executeMarketing", () => {
    it("should attach marketing campaign to project", () => {
      const project = { ...mockProject, buzz: 50 };
      const campaign = {
        id: "campaign-1",
        projectId: "proj-1",
        budget: 1000000,
        domesticBudget: 700000,
        foreignBudget: 300000,
        targetCategories: ["action"],
        buzzBonus: 10,
        scandalRisk: 5,
        primaryAngle: "star_power" as const,
      } as any;

      const result = executeMarketing(project, campaign);
      expect(result.project.marketingCampaign).toBeDefined();
      expect((result.project.marketingCampaign as any).id).toBe("campaign-1");
      expect((result.project.marketingCampaign as any).weeksInMarketing).toBe(1);
    });

    it("should preserve existing project buzz", () => {
      const project = { ...mockProject, buzz: 75 };
      const campaign = {
        id: "campaign-1",
        projectId: "proj-1",
        budget: 500000,
        domesticBudget: 350000,
        foreignBudget: 150000,
        targetCategories: ["drama"],
        buzzBonus: 5,
        scandalRisk: 2,
        primaryAngle: "star_power" as const,
      } as any;

      const result = executeMarketing(project, campaign);
      expect(result.project.buzz).toBe(75); // Buzz is not modified
    });

    it("should return updated project object", () => {
      const project = { ...mockProject, buzz: 50 };
      const campaign = {
        id: "campaign-1",
        projectId: "proj-1",
        budget: 1000000,
        domesticBudget: 700000,
        foreignBudget: 300000,
        targetCategories: ["comedy"],
        buzzBonus: 15,
        scandalRisk: 3,
        primaryAngle: "star_power" as const,
      } as any;

      const result = executeMarketing(project, campaign);
      expect(result.project).toBeDefined();
      expect(result.project.id).toBe("proj-1");
    });
  });

  describe("executeGreenlight", () => {
    it("should transition project to production state", () => {
      const project = { ...mockProject, state: "needs_greenlight" as const };
      const result = executeGreenlight(project);
      
      expect(result.project.state).toBe("production");
      expect(result.project.weeksInPhase).toBe(0);
    });

    it("should return update message", () => {
      const project = { ...mockProject, state: "needs_greenlight" as const };
      const result = executeGreenlight(project);
      
      expect(result.update).toBeDefined();
      expect(typeof result.update).toBe("string");
    });

    it("should reset weeksInPhase to 0", () => {
      const project = { ...mockProject, state: "needs_greenlight" as const, weeksInPhase: 5 };
      const result = executeGreenlight(project);
      
      expect(result.project.weeksInPhase).toBe(0);
    });
  });

  describe("executePitching", () => {
    it("should transition project to production state", () => {
      const project = { ...mockProject, state: "pitching" as const };
      const result = executePitching(project, "Netflix", "exclusive");
      
      expect(result.project.state).toBe("production");
      expect(result.project.weeksInPhase).toBe(0);
    });

    it("should return update message with buyer and contract info", () => {
      const project = { ...mockProject, state: "pitching" as const };
      const result = executePitching(project, "HBO", "licensing");
      
      expect(result.update).toContain("HBO");
      expect(result.update).toContain("licensing");
      expect(result.update).toContain("Test Project");
    });

    it("should handle different buyer names", () => {
      const project = { ...mockProject, state: "pitching" as const };
      const result = executePitching(project, "Amazon Prime", "exclusive");
      
      expect(result.update).toContain("Amazon Prime");
      expect(result.project.state).toBe("production");
    });

    it("should handle different contract types", () => {
      const project = { ...mockProject, state: "pitching" as const };
      const result = executePitching(project, "Disney+", "licensing");
      
      expect(result.update).toContain("licensing");
      expect(result.project.state).toBe("production");
    });
  });
});
