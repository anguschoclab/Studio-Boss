import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AwardsHQ } from "@/components/awards/AwardsHQ";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import type { GameState, Project, AwardsProfile, CampaignData } from "@/engine/types";

// Mock ResizeObserver
(global as any).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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
  LabelList: ({ dataKey }: any) => <div data-testid="mock-label-list" data-datakey={dataKey} />,
}));

vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn(),
}));

vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn(),
}));

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

const makeProject = (overrides: Partial<Project> & { id: string }): Project =>
  ({
    id: overrides.id,
    title: overrides.title || `Project ${overrides.id}`,
    type: overrides.type || "FILM",
    format: overrides.format || "film",
    genre: overrides.genre || "Drama",
    budgetTier: overrides.budgetTier || "mid",
    budget: overrides.budget || 10000000,
    weeklyCost: overrides.weeklyCost || 250000,
    targetAudience: overrides.targetAudience || "General",
    flavor: overrides.flavor || "A drama",
    state: overrides.state || "released",
    buzz: overrides.buzz || 50,
    weeksInPhase: overrides.weeksInPhase || 0,
    developmentWeeks: overrides.developmentWeeks || 10,
    productionWeeks: overrides.productionWeeks || 20,
    revenue: overrides.revenue || 0,
    weeklyRevenue: overrides.weeklyRevenue || 0,
    releaseWeek: overrides.releaseWeek !== undefined ? overrides.releaseWeek : 5,
    activeCrisis: null,
    momentum: overrides.momentum || 50,
    progress: overrides.progress || 100,
    accumulatedCost: overrides.accumulatedCost || 10000000,
    awardsProfile: overrides.awardsProfile !== undefined ? overrides.awardsProfile : mockAwardsProfile,
    reviewScore: overrides.reviewScore || 75,
    reception: overrides.reception || { metaScore: 80 },
    activeRoles: [],
    scriptEvents: [],
    scriptHeat: 50,
  }) as unknown as Project;

const makeGameState = (overrides: Partial<GameState> = {}): GameState =>
  ({
    week: 10,
    gameSeed: 42,
    tickCount: 0,
    rngState: 12345,
    game: { currentWeek: 10 },
    entities: {
      projects: {},
      releasedProjectIds: [],
      contracts: {},
      talents: {},
      rivals: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
    },
    finance: { cash: 10_000_000, ledger: [], weeklyHistory: [], marketState: { baseRate: 0.05, debtRate: 0.08, savingsYield: 0.02, loanRate: 0.07, rateHistory: [] } },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    studio: {
      id: "studio-1",
      name: "Test Studio",
      archetype: "mid-tier",
      prestige: 75,
      internal: { projectHistory: [], projects: {}, contracts: [] },
      activeCampaigns: {},
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      families: [],
      agencies: [],
      agents: [],
      awards: [],
      newsHistory: [],
      scandals: [],
    },
    culture: { genrePopularity: {} },
    history: [],
    eventHistory: [],
    ...overrides,
  }) as unknown as GameState;

const mockSelectProject = vi.fn();
const mockLaunchAwardsCampaign = vi.fn();

const setupStores = (gameState: GameState | null) => {
  vi.mocked(useGameStore).mockImplementation((selector: any) => {
    if (typeof selector === "function") {
      return selector({
        gameState,
        launchAwardsCampaign: mockLaunchAwardsCampaign,
      });
    }
    return gameState;
  });
  vi.mocked(useUIStore).mockReturnValue({
    selectProject: mockSelectProject,
  } as any);
};

describe("AwardsHQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null when gameState is null", () => {
    setupStores(null);
    const { container } = render(<AwardsHQ />);
    expect(container.firstChild).toBeNull();
  });

  it("renders empty state message when no eligible projects", () => {
    const state = makeGameState();
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.getByText(/No projects released in the last year/i)).toBeInTheDocument();
  });

  it("renders project title, genre, format, release week for each eligible project", () => {
    const state = makeGameState({
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait", genre: "Drama", format: "film", releaseWeek: 5 }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.getByText("Oscar Bait")).toBeInTheDocument();
    expect(screen.getByText(/Drama.*film.*Released W5/i)).toBeInTheDocument();
  });

  it("renders win odds percentage per project", () => {
    const state = makeGameState({
      entities: {
        projects: {
          "proj-1": makeProject({
            id: "proj-1",
            title: "Oscar Bait",
            awardsProfile: { ...mockAwardsProfile, criticScore: 85, academyAppeal: 85 },
          }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.getByText(/Win Odds/i)).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("renders three campaign tier buttons when no active campaign", () => {
    const state = makeGameState({
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait" }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.getByText("Grassroots")).toBeInTheDocument();
    expect(screen.getByText("Trade")).toBeInTheDocument();
    expect(screen.getByText("Blitz")).toBeInTheDocument();
  });

  it("disables campaign buttons when finance.cash < tier.cost", () => {
    const state = makeGameState({
      finance: { cash: 100_000, ledger: [], weeklyHistory: [], marketState: { baseRate: 0.05, debtRate: 0.08, savingsYield: 0.02, loanRate: 0.07, rateHistory: [] } } as any,
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait" }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    const tradeButton = screen.getByText("Trade").closest("button");
    expect(tradeButton).toBeDisabled();
  });

  it("renders Active Campaign with buzz bonus when campaign exists", () => {
    const campaign: CampaignData = {
      id: "camp-1",
      projectId: "proj-1",
      budget: 1_000_000,
      targetCategories: ["Best Picture"],
      buzzBonus: 15,
      scandalRisk: 2,
    };
    const state = makeGameState({
      studio: {
        id: "studio-1",
        name: "Test Studio",
        archetype: "mid-tier",
        prestige: 75,
        internal: { projectHistory: [], projects: {}, contracts: [] },
        activeCampaigns: { "proj-1": campaign },
      } as any,
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait" }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.getByText("Active Campaign")).toBeInTheDocument();
    expect(screen.getByText(/\+15 BUZZ/i)).toBeInTheDocument();
  });

  it("does NOT render hardcoded Season Rank", () => {
    const state = makeGameState({
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait" }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.queryByText(/Season Rank/i)).not.toBeInTheDocument();
  });

  it("calls launchAwardsCampaign on campaign button click", () => {
    const state = makeGameState({
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait" }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    fireEvent.click(screen.getByText("Grassroots").closest("button")!);
    expect(mockLaunchAwardsCampaign).toHaveBeenCalled();
  });

  it("calls selectProject on title click", () => {
    const state = makeGameState({
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait" }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    fireEvent.click(screen.getByText("Oscar Bait"));
    expect(mockSelectProject).toHaveBeenCalledWith("proj-1");
  });

  it("renders format filter dropdown with All/Film/TV options", () => {
    const state = makeGameState({
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait" }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.getByText(/All Formats/i)).toBeInTheDocument();
  });

  it("Total Accolades stat only counts wins from current season", () => {
    const currentSeason = Math.floor(10 / 52) + 1;
    const state = makeGameState({
      industry: {
        families: [],
        agencies: [],
        agents: [],
        newsHistory: [],
        scandals: [],
        awards: [
          { id: "a1", projectId: "p1", name: "Best Picture", category: "Best Picture", body: "Academy Awards", status: "won", year: currentSeason },
          { id: "a2", projectId: "p2", name: "Best Director", category: "Best Director", body: "Academy Awards", status: "won", year: currentSeason + 1 },
          { id: "a3", projectId: "p3", name: "Best Actor", category: "Best Actor", body: "Academy Awards", status: "nominated", year: currentSeason },
        ],
      } as any,
    });
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.getByText("Season Wins")).toBeInTheDocument();
    const seasonWinsLabel = screen.getByText("Season Wins");
    const statValue = seasonWinsLabel.closest("div")?.parentElement?.querySelector(".text-2xl");
    expect(statValue?.textContent).toBe("1");
  });

  it("renders 'Awards Probability Outlook' heading when projects have awardsProfile", () => {
    const state = makeGameState({
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait" }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.getByText("Awards Probability Outlook")).toBeInTheDocument();
  });

  it("does NOT render 'Awards Probability Outlook' when no projects have awardsProfile", () => {
    const state = makeGameState({
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait", awardsProfile: null as any }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.queryByText("Awards Probability Outlook")).not.toBeInTheDocument();
  });

  it("renders probability bar chart when probability data exists", () => {
    const state = makeGameState({
      entities: {
        projects: {
          "proj-1": makeProject({ id: "proj-1", title: "Oscar Bait" }),
        },
        releasedProjectIds: ["proj-1"],
        contracts: {},
        talents: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    setupStores(state);
    render(<AwardsHQ />);
    expect(screen.getByTestId("mock-bar-chart")).toBeInTheDocument();
  });
});
