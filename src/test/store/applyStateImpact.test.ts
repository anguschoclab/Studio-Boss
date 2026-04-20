import { describe, it, expect } from "vitest";
import { applyStateImpact } from "../../store/storeUtils";
import { GameState, StateImpact, IndustryUpdateImpact } from "../../engine/types";
import { createMockGameState, createMockProject } from "../utils/mockFactories";

describe("applyStateImpact utility", () => {
  const getInitialMockState = (): GameState => {
    const state = createMockGameState();
    const project = createMockProject({
      id: "proj-1",
      title: "Test Project",
      state: "development",
      buzz: 50
    });
    
    state.entities.projects["proj-1"] = project;
    state.finance.cash = 1000000;
    return state;
  };

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
    const updatedProject = newState.entities.projects["proj-1"];
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
      payload: { id: "news-1", headline: "Award Won!", description: "Win", category: 'market' }
    };
    const newState = applyStateImpact(getInitialMockState(), impact);
    expect(newState.industry.newsHistory).toHaveLength(1);
    expect(newState.industry.newsHistory[0].headline).toBe("Award Won!");
    expect(newState.industry.newsHistory[0].id).toBe("news-1");
  });

  it("should process INDUSTRY_UPDATE impact", () => {
    const impact: IndustryUpdateImpact = {
        type: 'INDUSTRY_UPDATE',
        payload: {
            projects: [
                { projectId: 'proj-1', update: { buzz: 99 } }
            ]
        }
    };
    
    const newState = applyStateImpact(getInitialMockState(), impact as any as StateImpact);
    expect(newState.entities.projects['proj-1']?.buzz).toBe(99);
  });
});
