import { describe, it, expect } from "vitest";
import { generateHeadlines } from "../../../engine/generators/headlines";
import { RivalStudio } from "../../../engine/types";

describe("generateHeadlines", () => {
  it("should generate between 1 and 3 headlines", () => {
    const week = 1;
    const rivals: RivalStudio[] = [];
    const headlines = generateHeadlines(week, rivals);

    expect(headlines.length).toBeGreaterThanOrEqual(1);
    expect(headlines.length).toBeLessThanOrEqual(3);
  });

  it("should return headlines with the correct structure", () => {
    const week = 5;
    const rivals: RivalStudio[] = [];
    const headlines = generateHeadlines(week, rivals);

    headlines.forEach((headline) => {
      expect(headline).toHaveProperty("id");
      expect(typeof headline.id).toBe("string");
      expect(headline.id.startsWith("h-")).toBe(true);

      expect(headline).toHaveProperty("text");
      expect(typeof headline.text).toBe("string");

      expect(headline).toHaveProperty("week");
      expect(headline.week).toBe(week);

      expect(headline).toHaveProperty("category");
      expect(["rival", "market", "talent"]).toContain(headline.category);
    });
  });

  it("should generate rival headlines if rivals are provided", () => {
    const week = 10;
    const rivals: RivalStudio[] = [
      {
        id: "rival-1",
        name: "Global Pictures",
        cash: 100000000,
        projectCount: 5,
        motto: "Bigger is Better",
        archetype: "major",
        strength: 80,
        prestige: 80,
        recentActivity: "Signing stars",
        motivationProfile: { financial: 0.8, prestige: 0.8, legacy: 0.5, aggression: 0.5 },
        currentMotivation: "prestige" as any,
        projects: {},
        contracts: [],
        foundedWeek: 1,
      },
      {
        id: "rival-2",
        name: "Indie Art",
        cash: 1000000,
        projectCount: 2,
        motto: "Art First",
        archetype: "major",
        strength: 20,
        prestige: 60,
        recentActivity: "Festivals",
        motivationProfile: { financial: 0.2, prestige: 0.9, legacy: 0.8, aggression: 0.3 },
        currentMotivation: "legacy" as any,
        projects: {},
        contracts: [],
        foundedWeek: 1,
      },
    ];

    // Run multiple times to ensure we hit the 35% chance for a rival headline
    let foundRivalHeadline = false;
    for (let i = 0; i < 20; i++) {
      const headlines = generateHeadlines(week, rivals);
      if (headlines.some((h) => h.category === "rival")) {
        foundRivalHeadline = true;
        break;
      }
    }

    expect(foundRivalHeadline).toBe(true);
  });

  it("should NOT generate rival headlines if NO rivals are provided", () => {
    const week = 10;
    const rivals: RivalStudio[] = [];

    // Run multiple times to ensure we don't accidentally generate a rival headline
    for (let i = 0; i < 20; i++) {
      const headlines = generateHeadlines(week, rivals);
      const hasRivalHeadline = headlines.some((h) => h.category === "rival");
      expect(hasRivalHeadline).toBe(false);
    }
  });

  it("should interpolate talent headlines with project and director names", () => {
    const rivals: RivalStudio[] = [];
    const projects = [
      {
        id: "p1",
        title: "Test Movie",
        format: "film",
        genre: "action" as any,
        budgetTier: "mid",
        budget: 1000000,
        weeklyCost: 10000,
        targetAudience: "General Audience",
        flavor: "Test package",
        state: "production" as const,
        weeksInPhase: 0,
        developmentWeeks: 4,
        productionWeeks: 8,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        buzz: 50,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        activeCrisis: null,
        type: "FILM",
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: [],
      } as unknown as import("../../../engine/types").Project,
    ];
    const talent = [
      {
        id: "t1",
        name: "James Cameron",
        roles: ["director"],
        prestige: 100,
        salary: 100000,
        buzz: 100,
        marketability: 100,
        skill: 100,
      },
    ];
    const contracts = [
      {
        id: "c1",
        projectId: "p1",
        talentId: "t1",
        role: "director" as any,
        salary: 100000,
        length: 1,
        weekStarted: 1,
      },
    ];

    const contractsRecord: Record<string, (typeof contracts)[number]> = {};
    const contractsByProjectId: Record<string, string[]> = {};
    contracts.forEach((c) => {
      contractsRecord[c.id] = c;
      if (!contractsByProjectId[c.projectId]) contractsByProjectId[c.projectId] = [];
      contractsByProjectId[c.projectId].push(c.id);
    });

    let foundInterpolatedHeadline = false;
    for (let i = 0; i < 50; i++) {
      const headlines = generateHeadlines(
        1,
        rivals,
        projects as any,
        talent as any,
        contractsByProjectId,
        contractsRecord as any
      );
      const talentHeadline = headlines.find((h) => h.category === "talent");
      if (talentHeadline) {
        if (
          talentHeadline.text.includes("Test Movie") ||
          talentHeadline.text.includes("James Cameron")
        ) {
          foundInterpolatedHeadline = true;
          break;
        }
      }
    }
    expect(foundInterpolatedHeadline).toBe(true);
  });

  it("should filter projects to only those with director contracts", () => {
    const rivals: RivalStudio[] = [];
    const projects = [
      {
        id: "p-dir",
        title: "Director Project",
        format: "film",
        genre: "action" as any,
        budgetTier: "mid",
        budget: 1000000,
        weeklyCost: 10000,
        targetAudience: "General Audience",
        flavor: "Test",
        state: "production" as const,
        weeksInPhase: 0,
        developmentWeeks: 4,
        productionWeeks: 8,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        buzz: 50,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        activeCrisis: null,
        type: "FILM",
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: [],
      } as unknown as import("../../../engine/types").Project,
      {
        id: "p-actor",
        title: "Actor Only Project",
        format: "film",
        genre: "comedy" as any,
        budgetTier: "mid",
        budget: 1000000,
        weeklyCost: 10000,
        targetAudience: "General Audience",
        flavor: "Test",
        state: "production" as const,
        weeksInPhase: 0,
        developmentWeeks: 4,
        productionWeeks: 8,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        buzz: 50,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        activeCrisis: null,
        type: "FILM",
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: [],
      } as unknown as import("../../../engine/types").Project,
      {
        id: "p-none",
        title: "No Contracts Project",
        format: "film",
        genre: "horror" as any,
        budgetTier: "mid",
        budget: 1000000,
        weeklyCost: 10000,
        targetAudience: "General Audience",
        flavor: "Test",
        state: "production" as const,
        weeksInPhase: 0,
        developmentWeeks: 4,
        productionWeeks: 8,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        buzz: 50,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        activeCrisis: null,
        type: "FILM",
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: [],
      } as unknown as import("../../../engine/types").Project,
    ];
    const talent = [
      {
        id: "t-dir",
        name: "Steven Spielberg",
        roles: ["director"],
        prestige: 100,
        salary: 100000,
        buzz: 100,
        marketability: 100,
        skill: 100,
      },
      {
        id: "t-act",
        name: "Tom Hanks",
        roles: ["actor"],
        prestige: 90,
        salary: 80000,
        buzz: 80,
        marketability: 90,
        skill: 90,
      },
    ];
    const contracts = [
      {
        id: "c-dir",
        projectId: "p-dir",
        talentId: "t-dir",
        role: "director" as any,
        salary: 100000,
        length: 1,
        weekStarted: 1,
      },
      {
        id: "c-act",
        projectId: "p-actor",
        talentId: "t-act",
        role: "actor" as any,
        salary: 80000,
        length: 1,
        weekStarted: 1,
      },
    ];

    const contractsRecord: Record<string, (typeof contracts)[number]> = {};
    const contractsByProjectId: Record<string, string[]> = {};
    contracts.forEach((c) => {
      contractsRecord[c.id] = c;
      if (!contractsByProjectId[c.projectId]) contractsByProjectId[c.projectId] = [];
      contractsByProjectId[c.projectId].push(c.id);
    });

    // With a director project available, talent headlines should reference
    // "Director Project" or "Steven Spielberg", never "Actor Only Project"
    let foundDirectorProject = false;
    for (let i = 0; i < 50; i++) {
      const headlines = generateHeadlines(
        1,
        rivals,
        projects as any,
        talent as any,
        contractsByProjectId,
        contractsRecord as any
      );
      const talentHeadline = headlines.find((h) => h.category === "talent");
      if (talentHeadline) {
        if (
          talentHeadline.text.includes("Director Project") ||
          talentHeadline.text.includes("Steven Spielberg")
        ) {
          foundDirectorProject = true;
          break;
        }
        // Should never reference the actor-only project when a director project exists
        expect(talentHeadline.text.includes("Actor Only Project")).toBe(false);
      }
    }
    expect(foundDirectorProject).toBe(true);
  });

  it("should handle empty talent pool gracefully", () => {
    const rivals: RivalStudio[] = [];
    const projects = [
      {
        id: "p1",
        title: "Test Movie",
        format: "film",
        genre: "action" as any,
        budgetTier: "mid",
        budget: 1000000,
        weeklyCost: 10000,
        targetAudience: "General Audience",
        flavor: "Test",
        state: "production" as const,
        weeksInPhase: 0,
        developmentWeeks: 4,
        productionWeeks: 8,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        buzz: 50,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        activeCrisis: null,
        type: "FILM",
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: [],
      } as unknown as import("../../../engine/types").Project,
    ];
    const contracts = [
      {
        id: "c1",
        projectId: "p1",
        talentId: "t1",
        role: "director" as any,
        salary: 100000,
        length: 1,
        weekStarted: 1,
      },
    ];

    const contractsRecord: Record<string, (typeof contracts)[number]> = {};
    const contractsByProjectId: Record<string, string[]> = {};
    contracts.forEach((c) => {
      contractsRecord[c.id] = c;
      if (!contractsByProjectId[c.projectId]) contractsByProjectId[c.projectId] = [];
      contractsByProjectId[c.projectId].push(c.id);
    });

    // Should not crash with empty talent pool
    const headlines = generateHeadlines(
      1,
      rivals,
      projects as any,
      [],
      contractsByProjectId,
      contractsRecord as any
    );

    expect(headlines.length).toBeGreaterThanOrEqual(1);
    expect(headlines.length).toBeLessThanOrEqual(3);
    headlines.forEach((h) => {
      expect(["rival", "market", "talent"]).toContain(h.category);
    });
  });

  it("should handle orphaned contract talentId (talent not in pool)", () => {
    const rivals: RivalStudio[] = [];
    const projects = [
      {
        id: "p1",
        title: "Orphan Movie",
        format: "film",
        genre: "drama" as any,
        budgetTier: "mid",
        budget: 1000000,
        weeklyCost: 10000,
        targetAudience: "General Audience",
        flavor: "Test",
        state: "production" as const,
        weeksInPhase: 0,
        developmentWeeks: 4,
        productionWeeks: 8,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        buzz: 50,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        activeCrisis: null,
        type: "FILM",
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: [],
      } as unknown as import("../../../engine/types").Project,
    ];
    // Talent pool does NOT contain "nonexistent"
    const talent = [
      {
        id: "t-real",
        name: "Real Director",
        roles: ["director"],
        prestige: 80,
        salary: 50000,
        buzz: 70,
        marketability: 70,
        skill: 80,
      },
    ];
    const contracts = [
      {
        id: "c1",
        projectId: "p1",
        talentId: "nonexistent",
        role: "director" as any,
        salary: 100000,
        length: 1,
        weekStarted: 1,
      },
    ];

    const contractsRecord: Record<string, (typeof contracts)[number]> = {};
    const contractsByProjectId: Record<string, string[]> = {};
    contracts.forEach((c) => {
      contractsRecord[c.id] = c;
      if (!contractsByProjectId[c.projectId]) contractsByProjectId[c.projectId] = [];
      contractsByProjectId[c.projectId].push(c.id);
    });

    // Should not crash; falls back to default names
    for (let i = 0; i < 10; i++) {
      const headlines = generateHeadlines(
        1,
        rivals,
        projects as any,
        talent as any,
        contractsByProjectId,
        contractsRecord as any
      );
      expect(headlines.length).toBeGreaterThanOrEqual(1);
      headlines.forEach((h) => {
        expect(["rival", "market", "talent"]).toContain(h.category);
      });
    }
  });

  it("should select correct director from project with multiple contracts", () => {
    const rivals: RivalStudio[] = [];
    const projects = [
      {
        id: "p1",
        title: "Multi Contract Movie",
        format: "film",
        genre: "action" as any,
        budgetTier: "mid",
        budget: 1000000,
        weeklyCost: 10000,
        targetAudience: "General Audience",
        flavor: "Test",
        state: "production" as const,
        weeksInPhase: 0,
        developmentWeeks: 4,
        productionWeeks: 8,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        buzz: 50,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        activeCrisis: null,
        type: "FILM",
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: [],
      } as unknown as import("../../../engine/types").Project,
    ];
    const talent = [
      {
        id: "t-actor",
        name: "Actor Person",
        roles: ["actor"],
        prestige: 80,
        salary: 50000,
        buzz: 70,
        marketability: 70,
        skill: 80,
      },
      {
        id: "t-writer",
        name: "Writer Person",
        roles: ["writer"],
        prestige: 70,
        salary: 40000,
        buzz: 60,
        marketability: 50,
        skill: 75,
      },
      {
        id: "t-director",
        name: "Christopher Nolan",
        roles: ["director"],
        prestige: 100,
        salary: 100000,
        buzz: 100,
        marketability: 100,
        skill: 100,
      },
    ];
    const contracts = [
      {
        id: "c-actor",
        projectId: "p1",
        talentId: "t-actor",
        role: "actor" as any,
        salary: 50000,
        length: 1,
        weekStarted: 1,
      },
      {
        id: "c-writer",
        projectId: "p1",
        talentId: "t-writer",
        role: "writer" as any,
        salary: 40000,
        length: 1,
        weekStarted: 1,
      },
      {
        id: "c-director",
        projectId: "p1",
        talentId: "t-director",
        role: "director" as any,
        salary: 100000,
        length: 1,
        weekStarted: 1,
      },
    ];

    const contractsRecord: Record<string, (typeof contracts)[number]> = {};
    const contractsByProjectId: Record<string, string[]> = {};
    contracts.forEach((c) => {
      contractsRecord[c.id] = c;
      if (!contractsByProjectId[c.projectId]) contractsByProjectId[c.projectId] = [];
      contractsByProjectId[c.projectId].push(c.id);
    });

    // The director should be Christopher Nolan, not Actor Person or Writer Person
    let foundCorrectDirector = false;
    for (let i = 0; i < 50; i++) {
      const headlines = generateHeadlines(
        1,
        rivals,
        projects as any,
        talent as any,
        contractsByProjectId,
        contractsRecord as any
      );
      const talentHeadline = headlines.find((h) => h.category === "talent");
      if (talentHeadline && talentHeadline.text.includes("Christopher Nolan")) {
        foundCorrectDirector = true;
        break;
      }
    }
    expect(foundCorrectDirector).toBe(true);
  });

  it("should fall back to any project when no projects have directors", () => {
    const rivals: RivalStudio[] = [];
    const projects = [
      {
        id: "p1",
        title: "No Director Movie A",
        format: "film",
        genre: "comedy" as any,
        budgetTier: "mid",
        budget: 1000000,
        weeklyCost: 10000,
        targetAudience: "General Audience",
        flavor: "Test",
        state: "production" as const,
        weeksInPhase: 0,
        developmentWeeks: 4,
        productionWeeks: 8,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        buzz: 50,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        activeCrisis: null,
        type: "FILM",
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: [],
      } as unknown as import("../../../engine/types").Project,
      {
        id: "p2",
        title: "No Director Movie B",
        format: "film",
        genre: "horror" as any,
        budgetTier: "mid",
        budget: 1000000,
        weeklyCost: 10000,
        targetAudience: "General Audience",
        flavor: "Test",
        state: "production" as const,
        weeksInPhase: 0,
        developmentWeeks: 4,
        productionWeeks: 8,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        buzz: 50,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        activeCrisis: null,
        type: "FILM",
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: [],
      } as unknown as import("../../../engine/types").Project,
    ];
    const talent = [
      {
        id: "t-act",
        name: "Action Star",
        roles: ["actor"],
        prestige: 80,
        salary: 50000,
        buzz: 70,
        marketability: 70,
        skill: 80,
      },
    ];
    const contracts = [
      {
        id: "c1",
        projectId: "p1",
        talentId: "t-act",
        role: "actor" as any,
        salary: 50000,
        length: 1,
        weekStarted: 1,
      },
    ];

    const contractsRecord: Record<string, (typeof contracts)[number]> = {};
    const contractsByProjectId: Record<string, string[]> = {};
    contracts.forEach((c) => {
      contractsRecord[c.id] = c;
      if (!contractsByProjectId[c.projectId]) contractsByProjectId[c.projectId] = [];
      contractsByProjectId[c.projectId].push(c.id);
    });

    // With no director projects, should fall back to all projects
    let foundProjectName = false;
    for (let i = 0; i < 50; i++) {
      const headlines = generateHeadlines(
        1,
        rivals,
        projects as any,
        talent as any,
        contractsByProjectId,
        contractsRecord as any
      );
      const talentHeadline = headlines.find((h) => h.category === "talent");
      if (
        talentHeadline &&
        (talentHeadline.text.includes("No Director Movie A") ||
          talentHeadline.text.includes("No Director Movie B"))
      ) {
        foundProjectName = true;
        break;
      }
    }
    expect(foundProjectName).toBe(true);
  });

  it("should handle large talent pool without performance degradation", () => {
    const rivals: RivalStudio[] = [];
    const projects: any[] = [];
    const talent: any[] = [];
    const contracts: any[] = [];

    // Build 1000 talent entries
    for (let i = 0; i < 1000; i++) {
      const isDirector = i % 3 === 0;
      talent.push({
        id: `t-${i}`,
        name: `Talent ${i}`,
        roles: isDirector ? ["director"] : ["actor"],
        prestige: 80,
        salary: 50000,
        buzz: 70,
        marketability: 70,
        skill: 80,
        draw: isDirector ? 50 : 75,
      });
    }

    // Build 50 projects with 4 contracts each (200 contracts total)
    for (let p = 0; p < 50; p++) {
      projects.push({
        id: `p-${p}`,
        title: `Project ${p}`,
        format: "film",
        genre: "action",
        budgetTier: "mid",
        budget: 1000000,
        weeklyCost: 10000,
        targetAudience: "General Audience",
        flavor: "Test",
        state: "production",
        weeksInPhase: 0,
        developmentWeeks: 4,
        productionWeeks: 8,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        buzz: 50,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        activeCrisis: null,
        type: "FILM",
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: [],
      });
      for (let c = 0; c < 4; c++) {
        const talentIdx = p * 4 + c;
        contracts.push({
          id: `c-${p}-${c}`,
          projectId: `p-${p}`,
          talentId: `t-${talentIdx}`,
          role: c === 0 ? "director" : "actor",
          salary: 50000,
          length: 1,
          weekStarted: 1,
        });
      }
    }

    const contractsRecord: Record<string, any> = {};
    const contractsByProjectId: Record<string, string[]> = {};
    contracts.forEach((c) => {
      contractsRecord[c.id] = c;
      if (!contractsByProjectId[c.projectId]) contractsByProjectId[c.projectId] = [];
      contractsByProjectId[c.projectId].push(c.id);
    });

    // Should complete quickly even with 1000 talent × 50 projects × 200 contracts
    const start = performance.now();
    const headlines = generateHeadlines(
      1,
      rivals,
      projects,
      talent,
      contractsByProjectId,
      contractsRecord
    );
    const elapsed = performance.now() - start;

    expect(headlines.length).toBeGreaterThanOrEqual(1);
    expect(headlines.length).toBeLessThanOrEqual(3);
    // Should complete in well under 100ms with the Map optimization
    expect(elapsed).toBeLessThan(100);
  });
});
