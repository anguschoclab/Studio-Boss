import { describe, it, expect } from "vitest";
import { calculateFranchiseEquity } from "@/engine/systems/ip/EquityCalculator";
import { CROSSOVER_AFFINITY } from "@/engine/data/genres";
import { Franchise, IPAsset, Project } from "@/engine/types";

describe("calculateFranchiseEquity", () => {
  const mockFranchise: Franchise = {
    id: "f1",
    name: "Test Franchise",
    relevanceScore: 100,
    fatigueLevel: 0,
    audienceLoyalty: 50,
    totalEquity: 0,
    synergyMultiplier: 1.0,
    assetIds: ["ip-1", "ip-2"],
    activeProjectIds: [],
    lastReleaseWeeks: [100],
    creationWeek: 50,
  };

  const makeAsset = (id: string, projectId: string, baseValue = 1_000_000, decayRate = 0.5): IPAsset => ({
    id,
    originalProjectId: projectId,
    title: `Asset ${id}`,
    baseValue,
    decayRate,
    merchandisingMultiplier: 1.0,
    syndicationStatus: "NONE",
    syndicationTier: "NONE",
    totalEpisodes: 0,
    rightsExpirationWeek: 100,
    rightsOwner: "STUDIO",
  });

  const makeProject = (id: string, genre: string): Project =>
    ({
      id,
      title: `Project ${id}`,
      type: "FILM",
      format: "film",
      genre,
      budgetTier: "mid",
      budget: 10_000_000,
      weeklyCost: 250_000,
      targetAudience: "General",
      flavor: "",
      state: "released",
      buzz: 50,
      weeksInPhase: 0,
      developmentWeeks: 10,
      productionWeeks: 20,
      revenue: 50_000_000,
      weeklyRevenue: 0,
      releaseWeek: 100,
      activeCrisis: null,
      momentum: 50,
      progress: 100,
      accumulatedCost: 10_000_000,
      ownerId: "player-studio",
      reviewScore: 50,
      awards: [],
      awardsProfile: {
        criticScore: 0,
        audienceScore: 0,
        prestigeScore: 0,
        craftScore: 0,
        culturalHeat: 0,
        campaignStrength: 0,
        controversyRisk: 0,
        festivalBuzz: 0,
        academyAppeal: 0,
        guildAppeal: 0,
        populistAppeal: 0,
        indieCredibility: 0,
        industryNarrativeScore: 0,
      },
      activeRoles: [],
      scriptEvents: [],
      scriptHeat: 50,
    }) as unknown as Project;

  describe("genre normalization", () => {
    it("normalizes lowercase 'action' to 'Action' for synergy lookup", () => {
      const assets = [makeAsset("ip-1", "p1"), makeAsset("ip-2", "p2")];
      const projects: Record<string, Project> = {
        p1: makeProject("p1", "action"),
        p2: makeProject("p2", "sci-fi"),
      };
      const equity = calculateFranchiseEquity(mockFranchise, assets, projects);
      // If normalization works, Action and Sci-Fi are compatible → synergyHits > 0 → bonus
      // Base equity = 1M*0.5 + 1M*0.5 = 1M
      // With 2 assets: crossoverBonus starts at 1.05, plus synergy bonus
      expect(equity).toBeGreaterThan(1_000_000 * 1.05);
    });

    it("normalizes uppercase 'SCI-FI' to 'Sci-Fi' for synergy lookup", () => {
      const assets = [makeAsset("ip-1", "p1"), makeAsset("ip-2", "p2")];
      const projects: Record<string, Project> = {
        p1: makeProject("p1", "SCI-FI"),
        p2: makeProject("p2", "ACTION"),
      };
      const equity = calculateFranchiseEquity(mockFranchise, assets, projects);
      expect(equity).toBeGreaterThan(1_000_000 * 1.05);
    });

    it("normalizes mixed case 'Horror' correctly", () => {
      const assets = [makeAsset("ip-1", "p1"), makeAsset("ip-2", "p2")];
      const projects: Record<string, Project> = {
        p1: makeProject("p1", "Horror"),
        p2: makeProject("p2", "Sci-Fi"),
      };
      const equity = calculateFranchiseEquity(mockFranchise, assets, projects);
      // Horror and Sci-Fi are compatible per CROSSOVER_AFFINITY
      expect(equity).toBeGreaterThan(1_000_000 * 1.05);
    });

    it("falls back to original string for unknown genre (no synergy hits)", () => {
      const assets = [makeAsset("ip-1", "p1"), makeAsset("ip-2", "p2")];
      const projects: Record<string, Project> = {
        p1: makeProject("p1", "foobar"),
        p2: makeProject("p2", "bazqux"),
      };
      const equity = calculateFranchiseEquity(mockFranchise, assets, projects);
      // Unknown genres → no synergy hits → just base bonus (1.05 for < 3 assets)
      // baseEquity = 1M, crossoverBonus = 1.05, multiplier = 1.0
      expect(equity).toBe(Math.floor(1_000_000 * 1.05 * 1.0));
    });
  });

  describe("base equity calculation", () => {
    it("computes sum of baseValue * decayRate", () => {
      const franchise: Franchise = {
        ...mockFranchise,
        assetIds: ["ip-1"],
      };
      const assets = [
        makeAsset("ip-1", "p1", 2_000_000, 0.3),
        makeAsset("ip-2", "p2", 3_000_000, 0.4),
      ];
      // baseEquity = 2M*0.3 + 3M*0.4 = 600K + 1.2M = 1.8M
      // 2 assets, no sourceProjects → crossoverBonus = 1.05, multiplier = 1.0
      const equity = calculateFranchiseEquity(franchise, assets);
      expect(equity).toBe(Math.floor(1_800_000 * 1.05 * 1.0));
    });
  });

  describe("crossover synergy", () => {
    it("applies bonus for two compatible genres (Action + Sci-Fi)", () => {
      const assets = [makeAsset("ip-1", "p1"), makeAsset("ip-2", "p2")];
      const projects: Record<string, Project> = {
        p1: makeProject("p1", "Action"),
        p2: makeProject("p2", "Sci-Fi"),
      };
      const withSynergy = calculateFranchiseEquity(mockFranchise, assets, projects);
      const withoutSynergy = calculateFranchiseEquity(mockFranchise, assets);
      expect(withSynergy).toBeGreaterThan(withoutSynergy);
    });

    it("applies no synergy bonus for incompatible genres", () => {
      const assets = [makeAsset("ip-1", "p1"), makeAsset("ip-2", "p2")];
      // Romance and Documentary are not in each other's affinity lists
      const projects: Record<string, Project> = {
        p1: makeProject("p1", "Romance"),
        p2: makeProject("p2", "Documentary"),
      };
      const withGenres = calculateFranchiseEquity(mockFranchise, assets, projects);
      const withoutGenres = calculateFranchiseEquity(mockFranchise, assets);
      // No synergy hits → same as no sourceProjects (both get 1.05 base)
      expect(withGenres).toBe(withoutGenres);
    });
  });

  describe("edge cases", () => {
    it("skips genre bonuses when no sourceProjects provided", () => {
      const assets = [makeAsset("ip-1", "p1"), makeAsset("ip-2", "p2")];
      const equity = calculateFranchiseEquity(mockFranchise, assets);
      // No sourceProjects → crossoverBonus = 1.05 (2 assets < 3), multiplier = 1.0
      expect(equity).toBe(Math.floor(1_000_000 * 1.05 * 1.0));
    });

    it("skips genre bonuses for single asset", () => {
      const assets = [makeAsset("ip-1", "p1")];
      const projects: Record<string, Project> = {
        p1: makeProject("p1", "Action"),
      };
      const franchise: Franchise = { ...mockFranchise, assetIds: ["ip-1"] };
      const equity = calculateFranchiseEquity(franchise, assets, projects);
      // assets.length <= 1 → genre block skipped → 1.05 base, multiplier 1.0
      expect(equity).toBe(Math.floor(500_000 * 1.05 * 1.0));
    });

    it("applies synergy bonus for Cinematic Universe + Action (compatible genres)", () => {
      const assets = [makeAsset("ip-1", "p1"), makeAsset("ip-2", "p2")];
      const projects: Record<string, Project> = {
        p1: makeProject("p1", "Cinematic Universe"),
        p2: makeProject("p2", "Action"),
      };
      const equity = calculateFranchiseEquity(mockFranchise, assets, projects);
      // CU + Action are compatible → 1 synergy hit → crossoverBonus = 1.05 + 0.15 = 1.20
      expect(equity).toBe(Math.floor(1_000_000 * 1.20 * 1.0));
    });

    it("applies synergy bonus for Video Game Adaptation + Sci-Fi (compatible genres)", () => {
      const assets = [makeAsset("ip-1", "p1"), makeAsset("ip-2", "p2")];
      const projects: Record<string, Project> = {
        p1: makeProject("p1", "Video Game Adaptation"),
        p2: makeProject("p2", "Sci-Fi"),
      };
      const equity = calculateFranchiseEquity(mockFranchise, assets, projects);
      // VGA + Sci-Fi are compatible → 1 synergy hit → crossoverBonus = 1.05 + 0.15 = 1.20
      expect(equity).toBe(Math.floor(1_000_000 * 1.20 * 1.0));
    });
  });
});
