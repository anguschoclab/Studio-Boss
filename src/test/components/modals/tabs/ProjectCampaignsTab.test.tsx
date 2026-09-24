import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {ProjectCampaignsTab} from "@/components/modals/tabs/ProjectCampaignsTab";
import {Tabs} from "@/components/ui/tabs";
import {createMockProject} from "../../../utils/mockFactories";
import {CampaignData} from "@/engine/types";

vi.mock("@/components/charts/SimpleBarChart", () => ({
  SimpleBarChart: () => <div data-testid="probability-chart" />,
}));

if (typeof window !== "undefined") {
  (window as any).PointerEvent = class PointerEvent extends Event {
    constructor(type: string, props: any = {}) {
      super(type, props);
    }
  };
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
}

function renderTab({
  project = createMockProject({ state: "released", awardsProfile: undefined }),
  activeCampaign,
  probabilityData = [],
  cash = 100_000_000,
  onSubmitFestival = vi.fn(),
  onLaunchAwards = vi.fn(),
}: Partial<Parameters<typeof ProjectCampaignsTab>[0]> = {}) {
  return {
    onSubmitFestival,
    onLaunchAwards,
    ...render(
      <Tabs defaultValue="campaigns">
        <ProjectCampaignsTab
          project={project}
          activeCampaign={activeCampaign}
          probabilityData={probabilityData}
          cash={cash}
          onSubmitFestival={onSubmitFestival}
          onLaunchAwards={onLaunchAwards}
        />
      </Tabs>
    ),
  };
}

describe("ProjectCampaignsTab", () => {
  it("renders the festival submission control and IP vault", () => {
    renderTab();
    expect(screen.getByText("Awards & Festivals Pipeline")).toBeInTheDocument();
    expect(screen.getByLabelText("Festival Submission")).toBeInTheDocument();
    expect(screen.getByText("Governance")).toBeInTheDocument();
    expect(screen.getByText("Internal Development")).toBeInTheDocument();
    expect(screen.getByText("Franchise Asset ID")).toBeInTheDocument();
    expect(screen.getByText("New/Standalone")).toBeInTheDocument();
    expect(screen.getByText("Library Residual Valuation")).toBeInTheDocument();
  });

  it("fires onLaunchAwards with the selected tier and default category", () => {
    const { onLaunchAwards } = renderTab();
    fireEvent.click(screen.getByText("Grassroots"));
    expect(onLaunchAwards).toHaveBeenCalledWith("Grassroots", ["Best Picture"]);
  });

  it("disables FYC tiers the studio cannot afford", () => {
    renderTab({ cash: 100_000 });
    expect(screen.getByText("Grassroots").closest("button")).toBeDisabled();
    expect(screen.getByText("Trade").closest("button")).toBeDisabled();
    expect(screen.getByText("Blitz").closest("button")).toBeDisabled();
  });

  it("shows the active outreach block when a campaign is running", () => {
    const activeCampaign = {
      id: "c1",
      projectId: "p1",
      budget: 1_000_000,
      targetCategories: ["Best Picture"],
      buzzBonus: 10,
      scandalRisk: 2,
    } as CampaignData;
    renderTab({ activeCampaign });
    expect(screen.getByText("Active Outreach")).toBeInTheDocument();
    expect(screen.getByText("+10 BUZZ")).toBeInTheDocument();
    expect(screen.queryByText("Grassroots")).not.toBeInTheDocument();
  });

  it("renders the probability chart when data exists", () => {
    renderTab({
      probabilityData: [{ category: "Best Picture", probability: 45 }],
    });
    expect(screen.getByTestId("probability-chart")).toBeInTheDocument();
  });
});
