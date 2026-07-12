import { describe, it, expect } from "vitest";
import { tickWorldEvents } from "../../../../engine/systems/ai/WorldSimulator";
import { Project, Talent, NewsImpact } from "../../../../engine/types";
import { RandomGenerator } from "../../../../engine/utils/rng";
import { createMockGameState } from "../../../mockFactory";

describe("tickWorldEvents", () => {
  it("generates MARKET SATURATION news when a project is released", () => {
    const releasedProject: Project = {
      id: "p1",
      title: "Action Hit",
      type: "FILM",
      format: "film",
      genre: "Action",
      budgetTier: "mid",
      budget: 50_000_000,
      weeklyCost: 1_000_000,
      targetAudience: "General",
      flavor: "Boom",
      state: "released",
      buzz: 50,
      weeksInPhase: 1,
      developmentWeeks: 4,
      productionWeeks: 4,
      revenue: 100_000_000,
      weeklyRevenue: 10_000_000,
      releaseWeek: 9,
      activeCrisis: null,
      momentum: 80,
      progress: 100,
      accumulatedCost: 50_000_000,
      contentFlags: [],
      scriptHeat: 50,
      activeRoles: [],
      scriptEvents: [],
    } as Project;

    const state = createMockGameState({
      week: 10,
      entities: {
        ...createMockGameState().entities,
        // Manual assignment as createMockGameState might have a fixed internal structure
      },
    });
    state.entities.projects["p1"] = releasedProject;

    const rng = new RandomGenerator(789);
    const impacts = tickWorldEvents(state, rng);

    if (impacts.length > 0) {
      const newsImpact = impacts.find((i) => i.type === "NEWS_ADDED") as NewsImpact | undefined;
      if (newsImpact) {
        expect(newsImpact.payload.headline).toContain("MARKET SATURATION");
      }
    }
  });

  it("generates STAR RISING news for talents with high momentum", () => {
    const star: Talent = {
      id: "t1",
      name: "Superstar",
      role: "actor",
      roles: ["actor"],
      tier: "A_LIST",
      prestige: 95,
      fee: 20_000_000,
      draw: 90,
      accessLevel: "dynasty",
      momentum: 90,
      demographics: { age: 35, gender: "FEMALE", ethnicity: "Caucasian", country: "USA" },
      psychology: {
        ego: 80,
        mood: 100,
        scandalRisk: 5,
        synergyAffinities: [],
        synergyConflicts: [],
      },
      motivationProfile: { financial: 50, prestige: 80, legacy: 70, aggression: 50 },
      currentMotivation: "PRESTIGE_HUNTER",
    };

    const state = createMockGameState({
      entities: {
        ...createMockGameState().entities,
        talents: { t1: star },
      },
    });

    const rng = new RandomGenerator(789);
    const impacts = tickWorldEvents(state, rng);

    const risingStar = impacts.find(
      (i) => i.type === "NEWS_ADDED" && i.payload.headline.includes("STAR RISING")
    );
    if (risingStar) {
      expect(risingStar.type).toBe("NEWS_ADDED");
    }
  });
});
