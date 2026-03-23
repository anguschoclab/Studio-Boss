import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateBuyers, calculateFitScore, negotiateContract } from "../../../engine/systems/buyers";


import { Buyer, Project, MandateType } from "../../../engine/types";

const mockBuyer: Buyer = {
  id: "b1",
  name: "StreamCo",
  archetype: "streamer",
};

const mockProject: Project = {
  id: "p1",
  title: "Test Film",
  format: "film",
  genre: "Sci-Fi",
  budgetTier: "mid",
  budget: 20000000,
  weeklyCost: 500000,
  targetAudience: "General",
  flavor: "Space stuff",
  status: "development",
  buzz: 50,
  weeksInPhase: 0,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
};

describe("buyers system", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("updateBuyers", () => {
    it("generates specific headlines for all mandate types", () => {
      const testBuyer: Buyer = {
        ...mockBuyer,
        currentMandate: { type: "sci-fi", activeUntilWeek: 100 }
      };

      // Since pick uses Math.floor(Math.random() * arr.length), we can control the picked index
      // The array is MANDATE_TYPES.filter(m => m !== 'sci-fi')
      // Original: ['sci-fi', 'comedy', 'drama', 'budget_freeze', 'broad_appeal', 'prestige']
      // Filtered: ['comedy', 'drama', 'budget_freeze', 'broad_appeal', 'prestige']
      // Index 0: comedy (0.01)
      // Index 1: drama (0.3)
      // Index 3: broad_appeal (0.7)

      // comedy
      // rand for early shift: < 0.05. rand for pick: index 0 (0). rand for headline: < 0.6.
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.01).mockReturnValueOnce(0.01).mockReturnValueOnce(0.01).mockReturnValueOnce(0.01);
      let result = updateBuyers([testBuyer], 1);
      expect(result.newHeadlines).toContain(`${testBuyer.name} shifts focus, seeking half-hour comedies for their upcoming slate.`);

      // drama
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.01).mockReturnValueOnce(0.3).mockReturnValueOnce(0.01).mockReturnValueOnce(0.01);
      result = updateBuyers([testBuyer], 1);
      expect(result.newHeadlines).toContain(`New mandate at ${testBuyer.name}: high-stakes drama is the priority.`);

      // budget_freeze
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.01).mockReturnValueOnce(0.5).mockReturnValueOnce(0.01).mockReturnValueOnce(0.01);
      result = updateBuyers([testBuyer], 1);
      expect(result.newHeadlines).toContain(`Austerity hits ${testBuyer.name}! Execs are instituting a sudden budget freeze on new pitches.`);

      // prestige
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.01).mockReturnValueOnce(0.9).mockReturnValueOnce(0.01).mockReturnValueOnce(0.01);
      result = updateBuyers([testBuyer], 1);
      expect(result.newHeadlines).toContain(`Awards chase: ${testBuyer.name} announces a massive fund specifically for prestige projects.`);

      // broad_appeal
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.01).mockReturnValueOnce(0.7).mockReturnValueOnce(0.01).mockReturnValueOnce(0.01);
      result = updateBuyers([testBuyer], 1);
      expect(result.newHeadlines).toContain(`${testBuyer.name} pivots to four-quadrant, broad appeal projects after subscriber churn.`);
    });

    it("shifts mandate if buyer has no current mandate", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99); // ensure headline triggers based on randRange
      const { updatedBuyers } = updateBuyers([mockBuyer], 1);

      expect(updatedBuyers[0].currentMandate).toBeDefined();
      expect(updatedBuyers[0].currentMandate!.activeUntilWeek).toBeGreaterThan(1);
    });

    it("shifts mandate if current mandate is expired", () => {
      const expiredBuyer: Buyer = {
        ...mockBuyer,
        currentMandate: { type: "comedy", activeUntilWeek: 0 }
      };

      const { updatedBuyers } = updateBuyers([expiredBuyer], 1);

      expect(updatedBuyers[0].currentMandate!.type).not.toBe("comedy"); // Because logic filters out current
      expect(updatedBuyers[0].currentMandate!.activeUntilWeek).toBeGreaterThan(1);
    });

    it("shifts mandate early due to random 5% chance", () => {
      const activeBuyer: Buyer = {
        ...mockBuyer,
        currentMandate: { type: "drama", activeUntilWeek: 100 }
      };

      vi.spyOn(Math, 'random').mockReturnValue(0.04); // < 0.05 triggers early shift
      const { updatedBuyers } = updateBuyers([activeBuyer], 1);

      expect(updatedBuyers[0].currentMandate!.type).not.toBe("drama");
      expect(updatedBuyers[0].currentMandate!.activeUntilWeek).toBeGreaterThan(1);
    });

    it("maintains mandate if active and random chance fails", () => {
      const activeBuyer: Buyer = {
        ...mockBuyer,
        currentMandate: { type: "drama", activeUntilWeek: 100 }
      };

      vi.spyOn(Math, 'random').mockReturnValue(0.06); // >= 0.05
      const { updatedBuyers } = updateBuyers([activeBuyer], 1);

      expect(updatedBuyers[0].currentMandate!.type).toBe("drama");
      expect(updatedBuyers[0].currentMandate!.activeUntilWeek).toBe(100);
    });
  });

  describe("calculateFitScore", () => {

    it("applies extreme market saturation penalty for 5 or more recent similar projects", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange = 0
      const activeBuyer = { ...mockBuyer, currentMandate: null };

      // Create 5 recent similar projects
      const allProjects = Array.from({ length: 5 }).map((_, i) => ({
        ...mockProject,
        id: `recent${i}`,
        status: "released" as const,
        genre: "Sci-Fi",
        releaseWeek: 50 + i,
      }));

      const currentWeek = 60;

      // Base: 50
      // 5 similar projects => saturationPenalty = (5 * 5) = 25
      // length >= 5 => penalty += 20 (Total 45)
      // Score = 50 - 45 = 5
      const score = calculateFitScore(mockProject, activeBuyer, currentWeek, allProjects);
      expect(score).toBe(5);
    });

    it("matches genres correctly for sci-fi/fantasy, comedy, and drama", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange 0

      const sciFiBuyer = { ...mockBuyer, currentMandate: { type: "sci-fi" as const, activeUntilWeek: 100 } };
      const comedyBuyer = { ...mockBuyer, currentMandate: { type: "comedy" as const, activeUntilWeek: 100 } };
      const dramaBuyer = { ...mockBuyer, currentMandate: { type: "drama" as const, activeUntilWeek: 100 } };

      const fantasyProject = { ...mockProject, genre: "Fantasy", buzz: 50 }; // sci-fi matches fantasy
      const comedyProject = { ...mockProject, genre: "Comedy", buzz: 50 };
      const dramaProject = { ...mockProject, genre: "Drama", buzz: 50 };

      // Base 50 + Match 30 + Buzz 10 + randRange 0 = 90
      expect(calculateFitScore(fantasyProject, sciFiBuyer)).toBe(90);
      expect(calculateFitScore(comedyProject, comedyBuyer)).toBe(90);
      expect(calculateFitScore(dramaProject, dramaBuyer)).toBe(90);
    });

    it("boosts score for prestige mandate based on budget tiers", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange 0
      const prestigeBuyer = { ...mockBuyer, currentMandate: { type: "prestige" as const, activeUntilWeek: 100 } };

      const highProject = { ...mockProject, budgetTier: "high" as const, buzz: 50 };
      const blockbusterProject = { ...mockProject, budgetTier: "blockbuster" as const, buzz: 50 };
      const lowProject = { ...mockProject, budgetTier: "low" as const, buzz: 50 };

      // Base 50 + Match 20 + Buzz 10 = 80
      expect(calculateFitScore(highProject, prestigeBuyer)).toBe(80);

      // Base 50 + Match 10 + Buzz 10 = 70
      expect(calculateFitScore(blockbusterProject, prestigeBuyer)).toBe(70);

      // Base 50 - Match 20 + Buzz 10 = 40
      expect(calculateFitScore(lowProject, prestigeBuyer)).toBe(40);
    });

    it("boosts score for broad_appeal mandate with family audience and mid/high budget", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange 0
      const broadBuyer = { ...mockBuyer, currentMandate: { type: "broad_appeal" as const, activeUntilWeek: 100 } };

      const midFamilyProject = { ...mockProject, budgetTier: "mid" as const, targetAudience: "Family-Friendly", buzz: 50 };
      const highAdultProject = { ...mockProject, budgetTier: "high" as const, targetAudience: "Adult", buzz: 50 };

      // mid/high (+20), family (+15)
      // Base 50 + Budget 20 + Family 15 + Buzz 10 = 95
      expect(calculateFitScore(midFamilyProject, broadBuyer)).toBe(95);

      // Base 50 + Budget 20 + Buzz 10 = 80
      expect(calculateFitScore(highAdultProject, broadBuyer)).toBe(80);
    });

    it("penalizes low budget projects for premium archetype buyers", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange 0
      const premiumBuyer = { ...mockBuyer, archetype: "premium" as const, currentMandate: { type: "drama" as const, activeUntilWeek: 100 } };

      const lowProject = { ...mockProject, budgetTier: "low" as const, genre: "Action", buzz: 50 }; // no genre match to isolate archetype penalty

      // Base 50 - Premium/Low 30 + Buzz 10 = 30
      expect(calculateFitScore(lowProject, premiumBuyer)).toBe(30);
    });

    it("applies market saturation penalty for similar projects released within 52 weeks", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange = 0
      const activeBuyer: Buyer = { ...mockBuyer, currentMandate: undefined }; // No mandate, score should just be 50 - penalty

      const recentSimilarProject1: Project = {
        ...mockProject,
        id: "recent1",
        status: "released",
        genre: "Sci-Fi",
        releaseWeek: 10,
      };

      const recentSimilarProject2: Project = {
        ...mockProject,
        id: "recent2",
        status: "released",
        genre: "Sci-Fi",
        releaseWeek: 50,
      };

      const oldSimilarProject: Project = {
        ...mockProject,
        id: "old1",
        status: "released",
        genre: "Sci-Fi",
        releaseWeek: 5, // older than 52 weeks from 60
      };

      const currentWeek = 60;

      // Test without allProjects
      let score = calculateFitScore(mockProject, activeBuyer, currentWeek);
      expect(score).toBe(50); // early returns base 50 if no mandate

      // Test with allProjects (2 within 52 weeks, 1 outside)
      // recent1 (week 10, current 60, diff 50 <= 52)
      // recent2 (week 50, current 60, diff 10 <= 52)
      // old1 (week 5, current 60, diff 55 > 52)
      const allProjects = [recentSimilarProject1, recentSimilarProject2, oldSimilarProject];

      score = calculateFitScore(mockProject, activeBuyer, currentWeek, allProjects);
      // penalty = 2 * 5 = 10
      // 50 - 10 = 40
      expect(score).toBe(40);
    });

    it("returns exactly 50 if buyer has no mandate (early return check)", () => {
      // Logic inside calculateFitScore early returns `score` (50) if `!buyer.currentMandate`
      const score = calculateFitScore(mockProject, mockBuyer);
      expect(score).toBe(50);
    });

    it("applies extreme buzz multipliers correctly with negative buzz", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange = 0
      const activeBuyer = { ...mockBuyer, currentMandate: { type: "sci-fi" as MandateType, activeUntilWeek: 100 } };

      const deadBuzzProject = { ...mockProject, buzz: -100 }; // Extreme negative buzz
      const score = calculateFitScore(deadBuzzProject, activeBuyer);

      // Base: 50. Match: +30. buzz = -100 -> factor = (-100/100)*20 = -20
      // 80 - 20 = 60
      expect(score).toBe(60);
    });

    it("clamps score between 0 and 100", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99); // randRange +10

      const perfectBuyer: Buyer = { ...mockBuyer, currentMandate: { type: "sci-fi", activeUntilWeek: 100 } };
      const hypeProject = { ...mockProject, buzz: 200, genre: "Sci-Fi" }; // Extreme high buzz

      const score = calculateFitScore(hypeProject, perfectBuyer);

      // Base: 50. Sci-Fi Match: +30. Buzz: (200/100)*20 = +40. Rand: +10. Total: 130 -> Clamped 100.
      expect(score).toBe(100);
    });

    it("handles budget freeze mandate with extreme blockbuster budget", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange 0

      const freezeBuyer: Buyer = { ...mockBuyer, currentMandate: { type: "budget_freeze", activeUntilWeek: 100 } };
      const hugeProject = { ...mockProject, budgetTier: "blockbuster" as const, buzz: 50 };

      const score = calculateFitScore(hugeProject, freezeBuyer);

      // Base: 50. Freeze + Blockbuster: -50. Buzz: +10. Rand: 0. Total: 10
      expect(score).toBe(10);
    });

    it("handles broad appeal mandate with niche indie project", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange 0

      const broadBuyer: Buyer = { ...mockBuyer, currentMandate: { type: "broad_appeal", activeUntilWeek: 100 } };
      const lowProject = { ...mockProject, budgetTier: "low" as const, targetAudience: "Niche Critics", buzz: 50 };

      const score = calculateFitScore(lowProject, broadBuyer);

      // Base: 50. No budget match. No audience match. Buzz: +10. Total: 60
      expect(score).toBe(60);
    });

    it("applies archetype specific penalties (network vs blockbuster)", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const networkBuyer: Buyer = { ...mockBuyer, archetype: "network" };
      // Assign dummy mandate to trigger mandate logic blocks even if type doesn't match
      networkBuyer.currentMandate = { type: "comedy", activeUntilWeek: 100 };

      const blockbusterProject = { ...mockProject, budgetTier: "blockbuster" as const, buzz: 50 };

      const score = calculateFitScore(blockbusterProject, networkBuyer);

      // Base: 50. Network+Blockbuster: -20. Buzz: +10. Total: 40
      expect(score).toBe(40);
    });
  });

  describe("negotiateContract", () => {
    it("requires a higher score (65) for upfront contracts", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange = 0
      const buyer: Buyer = { ...mockBuyer, currentMandate: { type: "sci-fi", activeUntilWeek: 100 } };
      // Score will be 50 + 30 (sci-fi) + 10 (buzz) = 90

      expect(negotiateContract(mockProject, buyer, 'upfront')).toBe(true);

      // Lower buzz to miss threshold
      const lowBuzzProject = { ...mockProject, buzz: -100 }; // buzz -20 -> score 50 + 30 - 20 = 60
      expect(negotiateContract(lowBuzzProject, buyer, 'upfront')).toBe(false);
    });

    it("requires a lower score (40) for standard/deficit contracts", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange = 0
      const buyer: Buyer = { ...mockBuyer, currentMandate: { type: "sci-fi", activeUntilWeek: 100 } };

      const lowBuzzProject = { ...mockProject, buzz: -100 }; // score 60

      expect(negotiateContract(lowBuzzProject, buyer, 'standard')).toBe(true);
      expect(negotiateContract(lowBuzzProject, buyer, 'deficit')).toBe(true);
    });

    it("tests explicit fit score boundaries for contract acceptance", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange = 0
      // Base score without mandates is 50, but let's give the buyer a mandate to bypass the early return
      const buyer: Buyer = { ...mockBuyer, currentMandate: { type: "broad_appeal", activeUntilWeek: 100 } };

      // 50 (base) + 20 (broad_appeal mid tier) = 70.

      // Exact threshold test for standard (40). Need score to drop by 30. Buzz -150 gives factor -30.
      const exactStandardProject = { ...mockProject, buzz: -150 };
      expect(negotiateContract(exactStandardProject, buyer, 'standard')).toBe(true); // 40 >= 40

      // Just below threshold for standard (39). Need score to drop by 31. Buzz -155 gives factor -31.
      const belowStandardProject = { ...mockProject, buzz: -155 };
      expect(negotiateContract(belowStandardProject, buyer, 'standard')).toBe(false); // 39 < 40

      // Exact threshold test for upfront (65). Need score to drop by 5. Buzz -25 gives factor -5.
      const exactUpfrontProject = { ...mockProject, buzz: -25 };
      expect(negotiateContract(exactUpfrontProject, buyer, 'upfront')).toBe(true); // 65 >= 65

      // Just below threshold for upfront (64). Need score to drop by 6. Buzz -30 gives factor -6.
      const belowUpfrontProject = { ...mockProject, buzz: -30 };
      expect(negotiateContract(belowUpfrontProject, buyer, 'upfront')).toBe(false); // 64 < 65
    });
  });
});
