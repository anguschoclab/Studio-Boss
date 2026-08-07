import {describe, it, expect} from "vitest";
import {generateCashflowForecast} from "@/engine/systems/finance";
import {createMockGameState} from "../../generators/mockFactory";

describe("ForecastModule - generateCashflowForecast", () => {
  it("returns forecast array with correct length (default 12 weeks)", () => {
    const state = createMockGameState({ week: 10 });
    const forecast = generateCashflowForecast(state);
    expect(forecast).toHaveLength(12);
  });

  it("returns forecast array with custom week count", () => {
    const state = createMockGameState({ week: 10 });
    const forecast = generateCashflowForecast(state, 4);
    expect(forecast).toHaveLength(4);
  });

  it("projects running cash based on net profit compounding", () => {
    const state = createMockGameState({ week: 10 });
    state.finance.cash = 1_000_000;
    const forecast = generateCashflowForecast(state, 3);
    expect(forecast[0].week).toBe(11);
    expect(forecast[1].week).toBe(12);
    expect(forecast[2].week).toBe(13);
    // Each week should be previous + netProfit
    const diff1 = forecast[1].projected - forecast[0].projected;
    const diff0 = forecast[0].projected - 1_000_000;
    expect(diff1).toBe(diff0); // same net profit each week
  });

  it("handles empty projects state without crashing", () => {
    const state = createMockGameState({ week: 1 });
    state.studio.internal.projects = {};
    const forecast = generateCashflowForecast(state, 4);
    expect(forecast).toHaveLength(4);
  });

  it("handles undefined contractsByProjectId without crashing", () => {
    const state = createMockGameState({ week: 1 });
    state.entities.contractsByProjectId = undefined as any;
    const forecast = generateCashflowForecast(state, 2);
    expect(forecast).toHaveLength(2);
  });
});
