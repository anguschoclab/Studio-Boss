import { describe, it, expect } from "vitest";
import { applyStateImpact } from "../../store/storeUtils";
import { GameState, Project } from "../../engine/types";

describe("applyStateImpact utility", () => {
  const mockState: GameState = {
    week: 1,
    cash: 1000000,
    studio: {
      name: "Test Studio",
      archetype: "major",
      prestige: 50,
      internal: {
        projects: { "proj-1": {
          id: "proj-1",
          title: "Test Project",
          status: "development",
          buzz: 50,
          productionWeeks: 10
        } as Project },
        contracts: [],
        financeHistory: []
      }
    },
    industry: {
      headlines: [],
      newsHistory: []
    }
  } as unknown as GameState;

  it("should update cash correctly", () => {
    const impact = { cashChange: -500000 };
    const newState = applyStateImpact(mockState, impact);
    expect(newState.cash).toBe(500000);
  });

  it("should update project fields correctly", () => {
    const impact = {
      projectUpdates: [{
        projectId: "proj-1",
        update: { status: "production" as const, buzz: 70 }
      }]
    };
    const newState = applyStateImpact(mockState, impact);
    const updatedProject = newState.studio.internal.projects["proj-1"];
    expect(updatedProject?.status).toBe("production");
    expect(updatedProject?.buzz).toBe(70);
  });

  it("should update prestige correctly", () => {
    const impact = { prestigeChange: 10 };
    const newState = applyStateImpact(mockState, impact);
    expect(newState.studio.prestige).toBe(60);
  });

  it("should add headlines and news events", () => {
    const impact = {
      newHeadlines: [{ id: "h1", text: "News!", week: 1, category: "market" as const }],
      newsEvents: [{ type: "AWARD", headline: "Award Won!", description: "Win", impact: "+10 Prestige" }]
    };
    const newState = applyStateImpact(mockState, impact);
    expect(newState.industry.headlines).toHaveLength(1);
    expect(newState.industry.newsHistory).toHaveLength(1);
    expect(newState.industry.newsHistory[0].headline).toBe("Award Won!");
  });
});
