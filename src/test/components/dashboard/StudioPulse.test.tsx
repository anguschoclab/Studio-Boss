import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { StudioPulse } from "@/components/dashboard/StudioPulse";
import { useGameStore } from "@/store/gameStore";

// jsdom lacks ResizeObserver (used by chart/progress primitives).
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

// Characterization test for StudioPulse's derived health metrics.
// Guards the single-pass refactor (PR #895): weeklyBurn, runway,
// activeProjects, atRiskProjects, cashTrend must compute identically.
function setFixture() {
  useGameStore.setState({
    gameState: {
      week: 10,
      finance: {
        cash: 12_000_000,
        weeklyHistory: [{ cash: 10_000_000 }, { cash: 12_000_000 }],
        marketState: { sentiment: 60 },
      },
      studio: { prestige: 50 },
      entities: {
        projects: {
          p1: { state: "production", weeklyCost: 1_000_000, budget: 20_000_000 },
          p2: { state: "development", weeklyCost: 2_000_000, budget: 30_000_000 },
          p3: { state: "released" },
          p4: {
            state: "turnaround",
            weeklyCost: 0,
            accumulatedCost: 25_000_000,
            budget: 10_000_000,
          },
        },
        talents: { t1: {}, t2: {} },
      },
    },
  } as never);
}

describe("StudioPulse — derived health metrics", () => {
  beforeEach(() => {
    setFixture();
    render(<StudioPulse />);
  });

  it("renders runway as cash / weekly production+development burn", () => {
    // burn = 1M + 2M = 3M → runway = 12M/3M = 4 weeks
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("WKS")).toBeInTheDocument();
  });

  it("counts non-released/non-archived projects as the active slate", () => {
    // p1 + p2 + p4 = 3
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("counts turnaround/over-budget projects as at-risk and surfaces the alert", () => {
    // p4: turnaround + accumulatedCost(25M) > budget(10M) * 1.2
    expect(screen.getByText("PROJECTS AT RISK")).toBeInTheDocument();
  });

  it("warns on runway < 8 weeks", () => {
    expect(screen.getByText("LOW CASH RESERVES")).toBeInTheDocument();
  });

  it("derives health score = 100 - 15 (runway<8) - 5 (one at-risk)", () => {
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("renders the 8-week cash trend percentage", () => {
    // (12M - 10M) / 10M = +20%
    expect(screen.getByText("+20%")).toBeInTheDocument();
  });
});
