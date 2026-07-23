import { describe, it, expect } from "vitest";
import {
  selectAwardsEligibleProjects,
  selectAwardsOddsById,
} from "@/store/selectors";
import { createMockGameState } from "../mockFactory";
import type { Project, AwardsProfile } from "@/engine/types";

const mockAwardsProfile: AwardsProfile = {
  criticScore: 85,
  audienceScore: 80,
  prestigeScore: 75,
  craftScore: 90,
  culturalHeat: 70,
  campaignStrength: 65,
  controversyRisk: 20,
  festivalBuzz: 75,
  academyAppeal: 85,
  guildAppeal: 80,
  populistAppeal: 70,
  indieCredibility: 40,
  industryNarrativeScore: 75,
};

const makeProject = (overrides: Partial<Project> & { id: string }): Project =>
  ({
    id: overrides.id,
    title: overrides.title || `Project ${overrides.id}`,
    type: overrides.type || "FILM",
    format: overrides.format || "film",
    genre: overrides.genre || "Drama",
    budgetTier: overrides.budgetTier || "mid",
    budget: overrides.budget || 10000000,
    weeklyCost: overrides.weeklyCost || 250000,
    targetAudience: overrides.targetAudience || "General",
    flavor: overrides.flavor || "A drama",
    state: overrides.state || "released",
    buzz: overrides.buzz || 50,
    weeksInPhase: overrides.weeksInPhase || 0,
    developmentWeeks: overrides.developmentWeeks || 10,
    productionWeeks: overrides.productionWeeks || 20,
    revenue: overrides.revenue || 0,
    weeklyRevenue: overrides.weeklyRevenue || 0,
    releaseWeek: overrides.releaseWeek !== undefined ? overrides.releaseWeek : 5,
    activeCrisis: null,
    momentum: overrides.momentum || 50,
    progress: overrides.progress || 100,
    accumulatedCost: overrides.accumulatedCost || 10000000,
    awardsProfile: "awardsProfile" in overrides ? overrides.awardsProfile : mockAwardsProfile,
    reviewScore: overrides.reviewScore || 75,
    activeRoles: [],
    scriptEvents: [],
    scriptHeat: 50,
  }) as unknown as Project;

describe("selectAwardsEligibleProjects", () => {
  it("returns empty array for null state", () => {
    expect(selectAwardsEligibleProjects(null)).toEqual([]);
  });

  it("returns released projects with awardsProfile and non-null releaseWeek", () => {
    const state = createMockGameState({
      week: 10,
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", state: "released", releaseWeek: 5 }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsEligibleProjects(state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("proj-1");
  });

  it("returns post_release projects with awardsProfile and non-null releaseWeek", () => {
    const state = createMockGameState({
      week: 10,
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", state: "post_release", releaseWeek: 5 }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsEligibleProjects(state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("proj-1");
  });

  it("excludes development, production, post_production, marketing, archived projects", () => {
    const state = createMockGameState({
      week: 10,
      entities: {
        projects: {
          "dev": makeProject({ id: "dev", state: "development" }),
          "prod": makeProject({ id: "prod", state: "production" }),
          "post": makeProject({ id: "post", state: "post_production" }),
          "mkt": makeProject({ id: "mkt", state: "marketing" }),
          "arch": makeProject({ id: "arch", state: "archived" }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsEligibleProjects(state);
    expect(result).toEqual([]);
  });

  it("excludes released projects without awardsProfile", () => {
    const state = createMockGameState({
      week: 10,
      entities: {
        projects: {
          "no-profile": makeProject({ id: "no-profile", state: "released", awardsProfile: undefined }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsEligibleProjects(state);
    expect(result).toEqual([]);
  });

  it("excludes released projects with releaseWeek === null", () => {
    const state = createMockGameState({
      week: 10,
      entities: {
        projects: {
          "no-week": makeProject({ id: "no-week", state: "released", releaseWeek: null }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsEligibleProjects(state);
    expect(result).toEqual([]);
  });

  it("excludes projects older than 52 weeks", () => {
    const state = createMockGameState({
      week: 100,
      entities: {
        projects: {
          "old": makeProject({ id: "old", state: "released", releaseWeek: 10 }),
          "new": makeProject({ id: "new", state: "released", releaseWeek: 90 }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsEligibleProjects(state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("new");
  });

  it("includes project exactly at 52-week boundary (releaseWeek = week - 51)", () => {
    const state = createMockGameState({
      week: 60,
      entities: {
        projects: {
          "boundary": makeProject({ id: "boundary", state: "released", releaseWeek: 9 }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsEligibleProjects(state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("boundary");
  });
});

describe("selectAwardsOddsById", () => {
  it("returns empty object for null state", () => {
    expect(selectAwardsOddsById(null)).toEqual({});
  });

  it("returns Record<string, number> keyed by project id", () => {
    const state = createMockGameState({
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1" }),
          "proj-2": makeProject({ id: "proj-2" }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsOddsById(state);
    expect(result["proj-1"]).toBeDefined();
    expect(result["proj-2"]).toBeDefined();
    expect(typeof result["proj-1"]).toBe("number");
  });

  it("computes odds as Math.min(100, Math.round((criticScore + academyAppeal) / 2 + 5))", () => {
    const state = createMockGameState({
      entities: {
        projects: {
          "proj-1": makeProject({
            id: "proj-1",
            awardsProfile: {
              ...mockAwardsProfile,
              criticScore: 85,
              academyAppeal: 85,
            },
          }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsOddsById(state);
    expect(result["proj-1"]).toBe(90);
  });

  it("caps odds at 100", () => {
    const state = createMockGameState({
      entities: {
        projects: {
          "proj-1": makeProject({
            id: "proj-1",
            awardsProfile: {
              ...mockAwardsProfile,
              criticScore: 100,
              academyAppeal: 100,
            },
          }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsOddsById(state);
    expect(result["proj-1"]).toBe(100);
  });

  it("does not include projects without awardsProfile", () => {
    const state = createMockGameState({
      entities: {
        projects: {
          "no-profile": makeProject({ id: "no-profile", awardsProfile: undefined }),
          "with-profile": makeProject({ id: "with-profile" }),
        },
        contracts: {},
        talents: {},
        rivals: {},
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const result = selectAwardsOddsById(state);
    expect(result["no-profile"]).toBeUndefined();
    expect(result["with-profile"]).toBeDefined();
  });
});
