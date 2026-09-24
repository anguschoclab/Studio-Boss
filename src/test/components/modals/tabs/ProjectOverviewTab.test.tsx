import {render, screen} from "@testing-library/react";
import {describe, it, expect} from "vitest";
import {ProjectOverviewTab} from "@/components/modals/tabs/ProjectOverviewTab";
import {Tabs} from "@/components/ui/tabs";
import {createMockProject} from "../../../utils/mockFactories";
import {ScriptedProject} from "@/engine/types";

function renderTab(
  project = createMockProject(),
  scriptedProject: ScriptedProject | null = project as ScriptedProject
) {
  return render(
    <Tabs defaultValue="overview">
      <ProjectOverviewTab project={project} scriptedProject={scriptedProject} />
    </Tabs>
  );
}

describe("ProjectOverviewTab", () => {
  it("renders package analysis with script heat and flavor", () => {
    const project = createMockProject({ scriptHeat: 75, flavor: "A test flavor line" });
    renderTab(project);
    expect(screen.getByText("Package Analysis")).toBeInTheDocument();
    expect(screen.getByText("Town Heat")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText(/A test flavor line/)).toBeInTheDocument();
  });

  it("falls back to 50% heat for non-scripted projects", () => {
    // buzz differs from the 50% heat fallback so the assertion is unambiguous
    renderTab(createMockProject({ buzz: 42 }), null);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("renders P&L forecast figures", () => {
    const project = createMockProject({
      accumulatedCost: 5_000_000,
      weeklyCost: 250_000,
      revenue: 0,
    });
    renderTab(project);
    expect(screen.getByText("P&L Forecast")).toBeInTheDocument();
    expect(screen.getByText("Accumulated Cost")).toBeInTheDocument();
    expect(screen.getByText("-$5.0M")).toBeInTheDocument();
    expect(screen.getByText("Weekly Burn")).toBeInTheDocument();
    expect(screen.getByText("Current Yield")).toBeInTheDocument();
  });

  it("renders the buzz / complexity / week stat cards", () => {
    const project = createMockProject({ buzz: 42, budgetTier: "mid", weeksInPhase: 3 });
    renderTab(project);
    expect(screen.getByText("Buzz")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText("Complexity")).toBeInTheDocument();
    expect(screen.getByText("MID")).toBeInTheDocument();
    expect(screen.getByText("Week")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
