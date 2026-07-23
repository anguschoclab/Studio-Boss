import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectDetailModal } from "@/components/modals/ProjectDetailModal";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { Project, AwardsProfile } from "@/engine/types";

// Mock ResizeObserver for Radix UI Slider component
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver;

// Mock recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="mock-responsive-container">{children}</div>
  ),
  BarChart: ({ children }: any) => <div data-testid="mock-bar-chart">{children}</div>,
  Bar: ({ children }: any) => <div data-testid="mock-bar">{children}</div>,
  XAxis: ({ dataKey }: any) => <div data-testid="mock-x-axis" data-datakey={dataKey} />,
  YAxis: ({ dataKey }: any) => <div data-testid="mock-y-axis" data-datakey={dataKey} />,
  Tooltip: () => <div data-testid="mock-tooltip" />,
  Cell: ({ fill }: any) => <div data-testid="mock-cell" data-fill={fill} />,
  CartesianGrid: () => <div data-testid="mock-cartesian-grid" />,
  AreaChart: ({ children }: any) => <div data-testid="mock-area-chart">{children}</div>,
  Area: () => <div data-testid="mock-area" />,
}));

vi.mock("@/store/gameStore");
vi.mock("@/store/uiStore");

describe("ProjectDetailModal", () => {
  const mockSelectProject = vi.fn();
  const mockSignContract = vi.fn();
  const mockGreenlightProject = vi.fn();
  const mockLaunchMarketingCampaign = vi.fn();
  const mockRenewProject = vi.fn();
  const mockExploitFranchise = vi.fn();
  const mockLaunchAwardsCampaign = vi.fn();
  const mockSubmitToFestival = vi.fn();

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

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: null,
      selectProject: mockSelectProject,
    } as any);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          studio: {
            internal: {
              projects: {},
              contracts: [],
            },
          },
          entities: {
            projects: {},
            releasedProjectIds: [],
            talents: {},
            contracts: {},
            rivals: {},
            contractsByProjectId: {},
          },
          industry: {
            talentPool: {},
          },
          finance: { cash: 100_000_000 },
        },
        signContract: mockSignContract,
        greenlightProject: mockGreenlightProject,
        launchMarketingCampaign: mockLaunchMarketingCampaign,
      };
      return selector(state);
    });
  });

  const generateMockProject = (id: string, overrides: Partial<Project> = {}): Project =>
    ({
      id,
      title: `Mock Project ${id}`,
      type: "FILM",
      genre: "Action",
      budgetTier: "low",
      budget: 10_000_000,
      weeklyCost: 1_000_000,
      developmentWeeks: 10,
      productionWeeks: 10,
      weeksInPhase: 0,
      state: "development",
      buzz: 50,
      revenue: 0,
      weeklyRevenue: 0,
      format: "film",
      targetAudience: "General",
      flavor: "Test Flavor",
      releaseWeek: null,
      activeCrisis: null,
      momentum: 50,
      progress: 0,
      accumulatedCost: 0,
      contentFlags: [],
      ...overrides,
    }) as Project;

  it("renders nothing when no project is selected", () => {
    render(<ProjectDetailModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders project details when a project is selected", () => {
    const mockProject = generateMockProject("P1");

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: "P1",
      selectProject: mockSelectProject,
    } as any);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          studio: {
            internal: {
              projects: { [mockProject.id]: mockProject },
              contracts: [],
            },
          },
          entities: {
            projects: {},
            releasedProjectIds: [],
            talents: {},
            contracts: {},
            rivals: {},
            contractsByProjectId: {},
          },
          industry: {
            talentPool: {},
          },
          finance: { cash: 100_000_000 },
        },
        signContract: mockSignContract,
      };
      return selector(state);
    });

    render(<ProjectDetailModal />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(mockProject.title)).toBeInTheDocument();
  });

  it("shows greenlight button when project needs greenlight", () => {
    const mockProject = generateMockProject("P1", { state: "needs_greenlight" });

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: "P1",
      selectProject: mockSelectProject,
    } as any);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          studio: {
            internal: {
              projects: { [mockProject.id]: mockProject },
              contracts: [],
            },
          },
          entities: {
            projects: {},
            releasedProjectIds: [],
            talents: {},
            contracts: {},
            rivals: {},
            contractsByProjectId: {},
          },
          industry: {
            talentPool: {},
          },
          finance: { cash: 100_000_000 },
        },
        greenlightProject: mockGreenlightProject,
      };
      return selector(state);
    });

    render(<ProjectDetailModal />);

    const approveBtn = screen.getByText("Execute Authorization & Release Budgets");
    expect(approveBtn).toBeInTheDocument();

    fireEvent.click(approveBtn);
    expect(mockGreenlightProject).toHaveBeenCalledWith("P1");
    expect(mockSelectProject).toHaveBeenCalledWith(null);
  });

  it("shows marketing configuration and handles lock campaign", () => {
    const mockProject = generateMockProject("P1", { state: "marketing", budget: 10_000_000 });

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: "P1",
      selectProject: mockSelectProject,
    } as any);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          studio: {
            internal: {
              projects: { [mockProject.id]: mockProject },
              contracts: [],
            },
          },
          entities: {
            projects: {},
            releasedProjectIds: [],
            talents: {},
            contracts: {},
            rivals: {},
            contractsByProjectId: {},
          },
          industry: {
            talentPool: {},
          },
          finance: { cash: 100_000_000 },
        },
        launchMarketingCampaign: mockLaunchMarketingCampaign,
      };
      return selector(state);
    });

    render(<ProjectDetailModal />);

    // Select 'basic' tier (Targeted Digital) before clicking authorize
    const targetedDigitalBtn = screen.getByText("Targeted Digital");
    fireEvent.click(targetedDigitalBtn);

    const lockBtn = screen.getByText("Authorize Global Release & Dedicate Reserves");
    expect(lockBtn).toBeInTheDocument();

    fireEvent.click(lockBtn);
    expect(mockLaunchMarketingCampaign).toHaveBeenCalledWith(
      "P1",
      "Standard",
      "SELL_THE_STORY",
      "four_quadrant"
    );
    expect(mockSelectProject).toHaveBeenCalledWith(null);
  });

  it("shows renew button for tv project and handles renewal", () => {
    const mockProject = generateMockProject("P1", {
      state: "archived",
      type: "SERIES",
      format: "tv",
      tvDetails: {
        currentSeason: 1,
        episodesOrdered: 10,
        episodesCompleted: 10,
        episodesAired: 10,
        averageRating: 70,
        status: "SYNDICATED",
      },
    });

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: "P1",
      selectProject: mockSelectProject,
    } as any);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          studio: {
            internal: {
              projects: { [mockProject.id]: mockProject },
              contracts: [],
            },
          },
          entities: {
            projects: {},
            releasedProjectIds: [],
            talents: {},
            contracts: {},
            rivals: {},
            contractsByProjectId: {},
          },
          industry: {
            talentPool: {},
          },
          finance: { cash: 100_000_000 },
        },
        renewProject: mockRenewProject,
      };
      return selector(state);
    });

    render(<ProjectDetailModal />);

    const renewBtn = screen.getByText("Order Next Season (Production)");
    expect(renewBtn).toBeInTheDocument();

    fireEvent.click(renewBtn);
    expect(mockRenewProject).toHaveBeenCalledWith("P1");
    expect(mockSelectProject).toHaveBeenCalledWith(null);
  });

  describe("Campaigns tab (released projects)", () => {
    const setupReleasedProject = (
      projectOverrides: Partial<Project> = {},
      stateOverrides: Record<string, any> = {}
    ) => {
      const mockProject = generateMockProject("P1", {
        state: "released",
        releaseWeek: 5,
        format: "film",
        genre: "Drama",
        awardsProfile: mockAwardsProfile,
        ...projectOverrides,
      });

      vi.mocked(useUIStore).mockReturnValue({
        selectedProjectId: "P1",
        selectProject: mockSelectProject,
      } as any);

      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        const state = {
          gameState: {
            studio: {
              id: "studio-1",
              name: "Test Studio",
              archetype: "mid-tier",
              prestige: 75,
              internal: {
                projects: { [mockProject.id]: mockProject },
                contracts: [],
              },
              activeCampaigns: stateOverrides.activeCampaigns || {},
            },
            entities: {
              projects: { [mockProject.id]: mockProject },
              releasedProjectIds: [mockProject.id],
              talents: {},
              contracts: {},
              rivals: {},
              contractsByProjectId: {},
            },
            industry: {
              talentPool: {},
              awards: [],
            },
            finance: { cash: stateOverrides.cash ?? 100_000_000 },
          },
          signContract: mockSignContract,
          greenlightProject: mockGreenlightProject,
          launchMarketingCampaign: mockLaunchMarketingCampaign,
          launchAwardsCampaign: mockLaunchAwardsCampaign,
          submitToFestival: mockSubmitToFestival,
        };
        return selector(state);
      });

      return mockProject;
    };

    it("renders 3 campaign tier buttons (Grassroots, Trade, Blitz) when no active campaign", () => {
      setupReleasedProject();
      render(<ProjectDetailModal />);
      const campaignsTab = screen.getByRole("tab", { name: /buzz/i });
      fireEvent.mouseDown(campaignsTab);
      expect(screen.getByText("Grassroots")).toBeInTheDocument();
      expect(screen.getByText("Trade")).toBeInTheDocument();
      expect(screen.getByText("Blitz")).toBeInTheDocument();
    });

    it("disables Trade button when finance.cash < 1_000_000", () => {
      setupReleasedProject({}, { cash: 500_000 });
      render(<ProjectDetailModal />);
      const campaignsTab = screen.getByRole("tab", { name: /buzz/i });
      fireEvent.mouseDown(campaignsTab);
      const tradeButton = screen.getByText("Trade").closest("button");
      expect(tradeButton).toBeDisabled();
    });

    it("disables Blitz button when finance.cash < 5_000_000", () => {
      setupReleasedProject({}, { cash: 2_000_000 });
      render(<ProjectDetailModal />);
      const campaignsTab = screen.getByRole("tab", { name: /buzz/i });
      fireEvent.mouseDown(campaignsTab);
      const blitzButton = screen.getByText("Blitz").closest("button");
      expect(blitzButton).toBeDisabled();
    });

    it("renders Active Campaign card with buzz bonus when campaign exists", () => {
      setupReleasedProject({}, {
        activeCampaigns: {
          P1: {
            id: "camp-1",
            projectId: "P1",
            budget: 1_000_000,
            targetCategories: ["Best Picture"],
            buzzBonus: 15,
            scandalRisk: 2,
          },
        },
      });
      render(<ProjectDetailModal />);
      const campaignsTab = screen.getByRole("tab", { name: /buzz/i });
      fireEvent.mouseDown(campaignsTab);
      expect(screen.getByText(/\+15 BUZZ/i)).toBeInTheDocument();
    });

    it("calls launchAwardsCampaign with project id, tier, and selected categories on button click", () => {
      setupReleasedProject();
      render(<ProjectDetailModal />);
      const campaignsTab = screen.getByRole("tab", { name: /buzz/i });
      fireEvent.mouseDown(campaignsTab);
      fireEvent.click(screen.getByText("Grassroots").closest("button")!);
      expect(mockLaunchAwardsCampaign).toHaveBeenCalledWith(
        "P1",
        "Grassroots",
        expect.arrayContaining([expect.any(String)])
      );
    });

    it("renders per-project probability chart when project has awardsProfile", () => {
      setupReleasedProject();
      render(<ProjectDetailModal />);
      const campaignsTab = screen.getByRole("tab", { name: /buzz/i });
      fireEvent.mouseDown(campaignsTab);
      expect(screen.getByText(/Category Win Probability/i)).toBeInTheDocument();
    });

    it("does NOT render per-project probability chart when project has no awardsProfile", () => {
      setupReleasedProject({ awardsProfile: undefined });
      render(<ProjectDetailModal />);
      const campaignsTab = screen.getByRole("tab", { name: /buzz/i });
      fireEvent.mouseDown(campaignsTab);
      expect(screen.queryByText(/Category Win Probability/i)).not.toBeInTheDocument();
    });
  });
});
