import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAwardsProfile, runAwardsCeremony } from "../../../engine/systems/awards";
import { Project, GameState } from "../../../engine/types";

describe("awards system", () => {
  describe("generateAwardsProfile", () => {
    const mockProject: Project = {
      id: "proj-1",
      title: "Test Project",
      format: "film",
      genre: "Drama",
      budgetTier: "mid",
      budget: 10000000,
      weeklyCost: 100000,
      targetAudience: "Adults",
      flavor: "Gritty drama",
      status: "released",
      buzz: 50,
      weeksInPhase: 0,
      developmentWeeks: 4,
      productionWeeks: 4,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: 10,
    };

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("should generate a profile with all scores between 0 and 100", () => {
      const profile = generateAwardsProfile(mockProject);

      Object.entries(profile).forEach(([, value]) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });

    it("should have a default campaignStrength of 10", () => {
      const profile = generateAwardsProfile(mockProject);
      expect(profile.campaignStrength).toBe(10);
    });

    it("should be influenced by budget for prestigeScore", () => {
      // Mock Math.random to return 0 for deterministic results
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const lowBudgetProject = { ...mockProject, budget: 1000000 };
      const highBudgetProject = { ...mockProject, budget: 100000000 };

      const lowProfile = generateAwardsProfile(lowBudgetProject);
      const highProfile = generateAwardsProfile(highBudgetProject);

      expect(highProfile.prestigeScore).toBeGreaterThan(lowProfile.prestigeScore);
    });

    it("should give higher indieCredibility potential to low budget projects", () => {
      // Mock Math.random to return 0.5
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const lowBudgetProject = { ...mockProject, budgetTier: "low" as const };
      const midBudgetProject = { ...mockProject, budgetTier: "mid" as const };

      const lowProfile = generateAwardsProfile(lowBudgetProject);
      const midProfile = generateAwardsProfile(midBudgetProject);

      // For 'low', indieCredibility = 0.5 * 80 + 20 = 60
      // For 'mid', indieCredibility = 0.5 * 30 = 15
      expect(lowProfile.indieCredibility).toBe(60);
      expect(midProfile.indieCredibility).toBe(15);
    });
  });

  describe("runAwardsCeremony", () => {
    const mockState: GameState = {
      studio: { name: "Test Studio", archetype: "major", prestige: 50 },
      projects: [],
      rivals: [],
      headlines: [],
      week: 100,
      cash: 1000000,
      financeHistory: [],
      talentPool: [],
      contracts: [],
      awards: [],
    buyers: [],
    families: [],
    opportunities: [],
    agencies: [],
    agents: [],
    };

    const eligibleProject: Project = {
      id: "proj-1",
      title: "Award Winner",
      format: "film",
      genre: "Drama",
      budgetTier: "mid",
      budget: 10000000,
      weeklyCost: 100000,
      targetAudience: "Adults",
      flavor: "Oscar bait",
      status: "released",
      buzz: 80,
      weeksInPhase: 0,
      developmentWeeks: 4,
      productionWeeks: 4,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: 80, // Released within 52 weeks of week 100
      awardsProfile: {
        criticScore: 90,
        audienceScore: 80,
        prestigeScore: 85,
        craftScore: 95,
        culturalHeat: 70,
        campaignStrength: 20,
        controversyRisk: 5,
        festivalBuzz: 90,
        academyAppeal: 90,
        guildAppeal: 85,
        populistAppeal: 60,
        indieCredibility: 40,
        industryNarrativeScore: 80
      }
    };

    const expectNoAwards = (projects: typeof eligibleProject[]) => {
      const state = { ...mockState, projects };
      const result = runAwardsCeremony(state, 62, 2024);
      expect(result.newAwards).toHaveLength(0);
      expect(result.prestigeChange).toBe(0);
    };

    it("should not return awards if no projects are eligible", () => {
      expectNoAwards([]);
    });

    it("should exclude projects released more than 52 weeks ago", () => {
      const oldProject = { ...eligibleProject, releaseWeek: 5 }; // 62 - 5 = 57 weeks ago
      expectNoAwards([oldProject]);
    });

    const checkBestPictureAward = (project: typeof eligibleProject, expectedStatus: 'won' | 'nominated') => {
      const state = { ...mockState, projects: [project] };
      const result = runAwardsCeremony(state, 62, 2024);
      const bestPictureAward = result.newAwards.find(a => a.category === "Best Picture" && a.body === "Academy Awards");
      expect(bestPictureAward).toBeDefined();
      expect(bestPictureAward?.status).toBe(expectedStatus);
      expect(result.projectUpdates.some(u => u.includes(`${expectedStatus === 'won' ? 'won' : 'nominated for'} Best Picture`))).toBe(true);
    };

    it("should award 'won' status for high scores (> 150)", () => {
      // Academy Awards Best Picture: academyAppeal (90) + prestigeScore (85) + narrative (80*0.5) = 90 + 85 + 40 = 215
      // 215 * (1 + 20/100) = 215 * 1.2 = 258
      checkBestPictureAward(eligibleProject, 'won');
    });

    it("should award 'nominated' status for medium scores (> 100)", () => {
       const modestProject = {
        ...eligibleProject,
        awardsProfile: {
          ...eligibleProject.awardsProfile!,
          academyAppeal: 30,
          prestigeScore: 30,
          industryNarrativeScore: 40,
          campaignStrength: 0
        }
      };
      // Score: 30 + 30 + 20 = 80 (too low)
      // Let's adjust to get between 100 and 150
      modestProject.awardsProfile.academyAppeal = 50;
      modestProject.awardsProfile.prestigeScore = 50;
      // Score: 50 + 50 + 20 = 120

      checkBestPictureAward(modestProject, 'nominated');
    });

    it("should correctly accumulate prestige change", () => {
      const state = { ...mockState, projects: [eligibleProject] };
      const result = runAwardsCeremony(state, 62, 2024);

      // It wins multiple awards in this mock setup
      // Academy Awards: Best Picture, Best Director
      // BAFTAs: Best Picture
      // Golden Globes: Best Picture
      // Independent Spirit: Best Picture
      // Prestige should be > 10
      expect(result.prestigeChange).toBeGreaterThanOrEqual(10);
    });

    it("should filter awards by project format", () => {
      const tvProject = { ...eligibleProject, format: "tv" as const, id: "tv-1" };
      const state = { ...mockState, projects: [tvProject] };
      const result = runAwardsCeremony(state, 37, 2024);

      // Should get Emmys (Best Series), but not Academy Awards (Best Picture/Director)
      expect(result.newAwards.some(a => a.body === "Primetime Emmys")).toBe(true);
      expect(result.newAwards.some(a => a.body === "Academy Awards")).toBe(false);
    });
    it("should award the highest scoring project when multiple are eligible", () => {
      const losingProject = {
        ...eligibleProject,
        id: "proj-loser",
        title: "Runner Up",
        awardsProfile: {
          ...eligibleProject.awardsProfile!,
          academyAppeal: 50,
          prestigeScore: 50,
          industryNarrativeScore: 50,
        }
      };

      const winningProject = {
        ...eligibleProject,
        id: "proj-winner",
        title: "The Champion",
        awardsProfile: {
          ...eligibleProject.awardsProfile!,
          academyAppeal: 100,
          prestigeScore: 100,
          industryNarrativeScore: 100,
        }
      };

      const state = { ...mockState, projects: [losingProject, winningProject] };
      const result = runAwardsCeremony(state, 62, 2024);

      const bestPictureAwards = result.newAwards.filter(a => a.category === "Best Picture" && a.body === "Academy Awards");
      // One winner
      expect(bestPictureAwards.find(a => a.status === "won")?.projectId).toBe("proj-winner");
      // The loser might get a nomination depending on the threshold
      expect(bestPictureAwards.find(a => a.status === "nominated")).toBeUndefined();
    });
    it("should exclude projects that are not released or archived", () => {
      const inDevProject = {
        ...eligibleProject,
        id: "proj-dev",
        status: "development" as const,
      };

      const inProdProject = {
        ...eligibleProject,
        id: "proj-prod",
        status: "production" as const,
      };

      const state = { ...mockState, projects: [inDevProject, inProdProject] };
      const result = runAwardsCeremony(state, 62, 2024);

      expect(result.newAwards).toHaveLength(0);
      expect(result.prestigeChange).toBe(0);
    });

    it("should include projects that are archived and within the 52 week window", () => {
      const archivedProject = {
        ...eligibleProject,
        id: "proj-archived",
        status: "archived" as const,
      };

      const state = { ...mockState, projects: [archivedProject] };
      const result = runAwardsCeremony(state, 62, 2024);

      expect(result.newAwards.length).toBeGreaterThan(0);
    });
    it("should allow a project with high campaignStrength to win against an identical project with low campaignStrength", () => {
      const lowCampaignProject = {
        ...eligibleProject,
        id: "proj-low-camp",
        title: "Low Campaign",
        awardsProfile: {
          ...eligibleProject.awardsProfile!,
          campaignStrength: 0,
        }
      };

      const highCampaignProject = {
        ...eligibleProject,
        id: "proj-high-camp",
        title: "High Campaign",
        awardsProfile: {
          ...eligibleProject.awardsProfile!,
          campaignStrength: 50,
        }
      };

      const state = { ...mockState, projects: [lowCampaignProject, highCampaignProject] };
      const result = runAwardsCeremony(state, 62, 2024);

      const bestPictureAwards = result.newAwards.filter(a => a.category === "Best Picture" && a.body === "Academy Awards");
      // The high campaign project should win due to the boost
      expect(bestPictureAwards.find(a => a.status === "won")?.projectId).toBe("proj-high-camp");
    });

    it("should exclude projects that do not have an awardsProfile", () => {
      const noProfileProject = {
        ...eligibleProject,
        id: "proj-no-profile",
        awardsProfile: undefined,
      };

      const state = { ...mockState, projects: [noProfileProject] };
      const result = runAwardsCeremony(state, 62, 2024);

      expect(result.newAwards).toHaveLength(0);
    });
  });
});
