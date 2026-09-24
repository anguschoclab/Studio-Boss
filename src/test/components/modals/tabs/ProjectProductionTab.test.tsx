import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {ProjectProductionTab} from "@/components/modals/tabs/ProjectProductionTab";
import {Tabs} from "@/components/ui/tabs";
import {createMockProject} from "../../../utils/mockFactories";

vi.mock("@/components/modals/DevelopmentLog", () => ({
  DevelopmentLog: () => <div data-testid="development-log" />,
}));

function renderTab(
  project = createMockProject(),
  greenlightReport: Parameters<typeof ProjectProductionTab>[0]["greenlightReport"] = null,
  onExecuteGreenlight = vi.fn()
) {
  return {
    onExecuteGreenlight,
    ...render(
      <Tabs defaultValue="production">
        <ProjectProductionTab
          project={project}
          greenlightReport={greenlightReport}
          onExecuteGreenlight={onExecuteGreenlight}
        />
      </Tabs>
    ),
  };
}

describe("ProjectProductionTab", () => {
  it("shows the development log and phase status during development", () => {
    renderTab(createMockProject({ state: "development", weeksInPhase: 3, developmentWeeks: 10 }));
    expect(screen.getByTestId("development-log")).toBeInTheDocument();
    expect(screen.getByText("Phase Status")).toBeInTheDocument();
    expect(screen.getByText("Drafting Progress")).toBeInTheDocument();
    expect(screen.getByText(/3\/10 wks/)).toBeInTheDocument();
  });

  it("shows the shoot progress panel during production", () => {
    renderTab(
      createMockProject({
        state: "production",
        title: "Rolling Film",
        weeksInPhase: 2,
        productionWeeks: 10,
      })
    );
    expect(screen.getByText("Principal Photography Active")).toBeInTheDocument();
    expect(screen.getByText("Shoot Completion")).toBeInTheDocument();
    expect(screen.getByText(/2\s*\/\s*10\s*Weeks/)).toBeInTheDocument();
  });

  it("renders the greenlight report and fires onExecuteGreenlight", () => {
    const onExecuteGreenlight = vi.fn();
    renderTab(
      createMockProject({ state: "needs_greenlight" }),
      {
        score: 72,
        recommendation: "Easy Greenlight",
        positives: ["Strong package"],
        negatives: ["Thin margin"],
        roleCompleteness: 80,
        scheduleCertainty: 90,
      },
      onExecuteGreenlight
    );
    expect(screen.getByText("Executive Greenlight")).toBeInTheDocument();
    expect(screen.getByText("Easy Greenlight")).toBeInTheDocument();
    expect(screen.getByText("Bull Case")).toBeInTheDocument();
    expect(screen.getByText("Strong package")).toBeInTheDocument();
    expect(screen.getByText("Bear Case")).toBeInTheDocument();
    expect(screen.getByText("Thin margin")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Execute Authorization & Release Budgets"));
    expect(onExecuteGreenlight).toHaveBeenCalledTimes(1);
  });

  it("renders nothing for needs_greenlight without a report", () => {
    renderTab(createMockProject({ state: "needs_greenlight" }), null);
    expect(screen.queryByText("Executive Greenlight")).not.toBeInTheDocument();
  });
});
