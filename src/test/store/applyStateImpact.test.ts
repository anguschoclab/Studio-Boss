import { describe, it, expect } from "vitest";
import { applyStateImpact } from "../../store/storeUtils";
import { GameState, Project, StateImpact } from "../../engine/types";

describe("applyStateImpact utility", () => {
  const getInitialMockState = (): GameState => ({
    week: 1,
    studio: {
      name: "Test Studio",
      archetype: "major",
      prestige: 50,
      internal: {
        projects: { 
          "proj-1": {
            id: "proj-1",
            title: "Test Project",
            state: "development",
            buzz: 50,
            weeksInPhase: 0,
            developmentWeeks: 10,
            productionWeeks: 10,
            budget: 5000000,
            budgetTier: 'mid',
            format: 'film',
            genre: 'Action',
            targetAudience: 'General',
            flavor: 'Test',
            weeklyCost: 100000,
            revenue: 0,
            weeklyRevenue: 0,
            releaseWeek: null
          } as Project 
        },
        contracts: [],
      }
    },
    industry: {
      rivals: [],
      newsHistory: [],
      talentPool: {},
    },
    market: {
        opportunities: [],
        buyers: []
    },
    finance: {
        cash: 1000000,
        ledger: []
    },
    news: {
        headlines: []
    }
  } as unknown as GameState);

  it("should update cash correctly", () => {
    const impact: StateImpact = { type: 'FUNDS_CHANGED', payload: { amount: -500000 } };
    const newState = applyStateImpact(getInitialMockState(), impact);
    expect(newState.finance.cash).toBe(500000);
  });

  it("should update project fields correctly", () => {
    const impact: StateImpact = {
      type: 'PROJECT_UPDATED',
      payload: {
        projectId: "proj-1",
        update: { state: "production", buzz: 70 }
      }
    };
    const newState = applyStateImpact(getInitialMockState(), impact);
    const updatedProject = newState.studio.internal.projects["proj-1"];
    expect(updatedProject?.state).toBe("production");
    expect(updatedProject?.buzz).toBe(70);
  });

  it("should update prestige correctly", () => {
    const impact: StateImpact = { type: 'PRESTIGE_CHANGED', payload: { amount: 10 } };
    const newState = applyStateImpact(getInitialMockState(), impact);
    expect(newState.studio.prestige).toBe(60);
  });

  it("should add news events", () => {
    const impact: StateImpact = {
      type: 'NEWS_ADDED',
      payload: { headline: "Award Won!", description: "Win" }
    };
    const newState = applyStateImpact(getInitialMockState(), impact);
    expect(newState.industry.newsHistory).toHaveLength(1);
    expect(newState.industry.newsHistory[0].headline).toBe("Award Won!");
  });
});
