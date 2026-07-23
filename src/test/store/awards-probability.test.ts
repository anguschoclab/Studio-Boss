import { describe, it, expect } from "vitest";
import { selectAwardsProbability } from "@/store/chartSelectors";
import { createMockGameState, createMockProject } from "@/test/utils/mockFactories";
import type { AwardsProfile } from "@/engine/types";
import { AWARD_CONFIGS } from "@/engine/data/awards.data";

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

const makeState = (projects: Record<string, any>) =>
  createMockGameState({
    entities: {
      projects,
      releasedProjectIds: [],
      contracts: {},
      talents: {},
      rivals: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
    } as any,
  });

describe("selectAwardsProbability (chartSelectors)", () => {
  it("returns empty array for null state", () => {
    expect(selectAwardsProbability(null)).toEqual([]);
  });

  it("returns multiple entries per project (one per matching AWARD_CONFIGS for the project's format)", () => {
    const project = createMockProject({
      id: "proj-1",
      title: "Awards Contender",
      format: "film",
      awardsProfile: mockAwardsProfile,
    });
    const state = makeState({ "proj-1": project });
    const result = selectAwardsProbability(state);
    const filmConfigs = AWARD_CONFIGS.filter(
      (c) => c.format === "film" || c.format === "both"
    );
    expect(result.length).toBe(filmConfigs.length);
  });

  it("each entry has projectTitle, awardBody, category, probability, trend", () => {
    const project = createMockProject({
      id: "proj-1",
      title: "Awards Contender",
      format: "film",
      awardsProfile: mockAwardsProfile,
    });
    const state = makeState({ "proj-1": project });
    const result = selectAwardsProbability(state);
    for (const entry of result) {
      expect(entry).toHaveProperty("projectTitle");
      expect(entry).toHaveProperty("awardBody");
      expect(entry).toHaveProperty("category");
      expect(entry).toHaveProperty("probability");
      expect(entry).toHaveProperty("trend");
      expect(entry.projectTitle).toBe("Awards Contender");
      expect(typeof entry.probability).toBe("number");
      expect(entry.trend).toBe("stable");
    }
  });

  it("awardBody matches real bodies from AWARD_CONFIGS", () => {
    const project = createMockProject({
      id: "proj-1",
      title: "Awards Contender",
      format: "film",
      awardsProfile: mockAwardsProfile,
    });
    const state = makeState({ "proj-1": project });
    const result = selectAwardsProbability(state);
    const bodies = [...new Set(result.map((r) => r.awardBody))];
    const configBodies = [...new Set(
      AWARD_CONFIGS.filter((c) => c.format === "film" || c.format === "both").map((c) => c.body)
    )];
    expect(bodies.sort()).toEqual(configBodies.sort());
  });

  it("category matches real categories from AWARD_CONFIGS", () => {
    const project = createMockProject({
      id: "proj-1",
      title: "Awards Contender",
      format: "film",
      awardsProfile: mockAwardsProfile,
    });
    const state = makeState({ "proj-1": project });
    const result = selectAwardsProbability(state);
    const categories = [...new Set(result.map((r) => r.category))];
    const configCategories = [...new Set(
      AWARD_CONFIGS.filter((c) => c.format === "film" || c.format === "both").map((c) => c.category)
    )];
    expect(categories.sort()).toEqual(configCategories.sort());
  });

  it("probability is normalized to 0-100 (evaluator score / 2, capped at 100)", () => {
    const project = createMockProject({
      id: "proj-1",
      title: "Awards Contender",
      format: "film",
      awardsProfile: mockAwardsProfile,
    });
    const state = makeState({ "proj-1": project });
    const result = selectAwardsProbability(state);
    for (const entry of result) {
      expect(entry.probability).toBeGreaterThanOrEqual(0);
      expect(entry.probability).toBeLessThanOrEqual(100);
    }
    // Verify specific calculation: Best Picture (Academy) evaluator = academyAppeal + prestigeScore + industryNarrativeScore * 0.5
    // = 85 + 75 + 75 * 0.5 = 197.5 → /2 = 99 (rounded)
    const bestPictureEntry = result.find(
      (r) => r.awardBody === "Academy Awards" && r.category === "Best Picture"
    );
    expect(bestPictureEntry).toBeDefined();
    expect(bestPictureEntry!.probability).toBe(Math.min(100, Math.round(197.5 / 2)));
  });

  it("probability caps at 100 for very high evaluator scores", () => {
    const highProfile: AwardsProfile = {
      ...mockAwardsProfile,
      criticScore: 100,
      audienceScore: 100,
      prestigeScore: 100,
      craftScore: 100,
      culturalHeat: 100,
      academyAppeal: 100,
      populistAppeal: 100,
      indieCredibility: 100,
      industryNarrativeScore: 100,
    };
    const project = createMockProject({
      id: "proj-1",
      title: "Perfect Film",
      format: "film",
      awardsProfile: highProfile,
      buzz: 100,
    });
    const state = makeState({ "proj-1": project });
    const result = selectAwardsProbability(state);
    // Critics Choice Best Picture: criticScore * 2 = 200 → /2 = 100
    const criticsChoice = result.find(
      (r) => r.awardBody === "Critics Choice Awards" && r.category === "Best Picture"
    );
    expect(criticsChoice).toBeDefined();
    expect(criticsChoice!.probability).toBe(100);
  });

  it("only includes projects with awardsProfile", () => {
    const withProfile = createMockProject({
      id: "with-profile",
      title: "With Profile",
      format: "film",
      awardsProfile: mockAwardsProfile,
    });
    const withoutProfile = createMockProject({
      id: "without-profile",
      title: "Without Profile",
      format: "film",
      awardsProfile: undefined,
    });
    const state = makeState({
      "with-profile": withProfile,
      "without-profile": withoutProfile,
    });
    const result = selectAwardsProbability(state);
    const titles = [...new Set(result.map((r) => r.projectTitle))];
    expect(titles).toEqual(["With Profile"]);
  });

  it("film projects get film-format configs (not TV-only configs)", () => {
    const project = createMockProject({
      id: "proj-1",
      title: "Film Only",
      format: "film",
      awardsProfile: mockAwardsProfile,
    });
    const state = makeState({ "proj-1": project });
    const result = selectAwardsProbability(state);
    const tvOnlyBodies = ["Primetime Emmys", "Peabody Awards"];
    const tvOnlyEntries = result.filter((r) => tvOnlyBodies.includes(r.awardBody));
    expect(tvOnlyEntries).toHaveLength(0);
  });

  it("TV projects get TV-format configs (not film-only configs)", () => {
    const project = createMockProject({
      id: "proj-1",
      title: "TV Show",
      format: "tv",
      awardsProfile: mockAwardsProfile,
    });
    const state = makeState({ "proj-1": project });
    const result = selectAwardsProbability(state);
    const tvConfigs = AWARD_CONFIGS.filter(
      (c) => c.format === "tv" || c.format === "both"
    );
    expect(result.length).toBe(tvConfigs.length);
    // Should not include film-only bodies like Cannes, Sundance, etc.
    const filmOnlyBodies = ["Cannes Film Festival", "Sundance Film Festival", "Academy Awards"];
    const filmOnlyEntries = result.filter((r) => filmOnlyBodies.includes(r.awardBody));
    expect(filmOnlyEntries).toHaveLength(0);
  });

  it("trend is always stable", () => {
    const project = createMockProject({
      id: "proj-1",
      title: "Awards Contender",
      format: "film",
      awardsProfile: mockAwardsProfile,
    });
    const state = makeState({ "proj-1": project });
    const result = selectAwardsProbability(state);
    for (const entry of result) {
      expect(entry.trend).toBe("stable");
    }
  });
});
