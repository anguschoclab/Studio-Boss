import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Project } from '@/engine/types';

// Mock ResizeObserver for Radix UI Slider component
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

vi.mock('@/store/gameStore');
vi.mock('@/store/uiStore');

describe('ProjectDetailModal', () => {
  const mockSelectProject = vi.fn();
  const mockSignContract = vi.fn();
  const mockGreenlightProject = vi.fn();
  const mockLockMarketingCampaign = vi.fn();
  const mockRenewProject = vi.fn();
  const mockExploitFranchise = vi.fn();
  const mockSubmitToFestival = vi.fn();
  const mockLaunchAwardsCampaign = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: null,
      selectProject: mockSelectProject,
    } as any);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          entities: {
            projects: {},
            talents: {},
            contracts: {},
            rivals: {}
          },
          studio: {
            activeCampaigns: {},
            prestige: 50,
            reputation: 50
          },
          finance: { cash: 100_000_000 },
          deals: { activeDeals: [] }
        },
        signContract: mockSignContract,
        greenlightProject: mockGreenlightProject,
        lockMarketingCampaign: mockLockMarketingCampaign,
        renewProject: mockRenewProject,
        exploitFranchise: mockExploitFranchise,
        submitToFestival: mockSubmitToFestival,
        launchAwardsCampaign: mockLaunchAwardsCampaign,
      };
      return selector(state);
    });
  });

  const generateMockProject = (id: string, overrides: Partial<Project> = {}): Project => ({
    id,
    title: `Mock Project ${id}`,
    type: 'FILM',
    genre: 'Action',
    budgetTier: 'low',
    budget: 10_000_000,
    weeklyCost: 1_000_000,
    developmentWeeks: 10,
    productionWeeks: 10,
    weeksInPhase: 0,
    state: 'development',
    buzz: 50,
    revenue: 0,
    weeklyRevenue: 0,
    format: 'film',
    targetAudience: 'General',
    flavor: 'Test Flavor',
    releaseWeek: null,
    activeCrisis: null,
    momentum: 50,
    progress: 0,
    accumulatedCost: 0,
    contentFlags: [],
    ...overrides
  } as Project);

  it('renders nothing when no project is selected', () => {
    render(<TooltipProvider><ProjectDetailModal /></TooltipProvider>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders project details when a project is selected', () => {
    const mockProject = generateMockProject('P1');

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: 'P1',
      selectProject: mockSelectProject,
    } as any);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          entities: {
            projects: { [mockProject.id]: mockProject },
            talents: {},
            contracts: {},
            rivals: {}
          },
          studio: { activeCampaigns: {} },
          finance: { cash: 100_000_000 },
          deals: { activeDeals: [] }
        },
      };
      return selector(state);
    });

    render(<TooltipProvider><ProjectDetailModal /></TooltipProvider>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(mockProject.title)).toBeInTheDocument();
  });

  it('shows greenlight button when project needs greenlight', () => {
    const mockProject = generateMockProject('P1', { state: 'needs_greenlight' });

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: 'P1',
      selectProject: mockSelectProject,
    } as any);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          entities: {
            projects: { [mockProject.id]: mockProject },
            talents: {},
            contracts: {},
            rivals: {}
          },
          studio: { activeCampaigns: {} },
          finance: { cash: 100_000_000 },
          deals: { activeDeals: [] }
        },
        greenlightProject: mockGreenlightProject,
      };
      return selector(state);
    });

    render(<TooltipProvider><ProjectDetailModal /></TooltipProvider>);
    const approveBtn = screen.getByText('Execute Authorization & Release Budgets');
    expect(approveBtn).toBeInTheDocument();

    fireEvent.click(approveBtn);
    expect(mockGreenlightProject).toHaveBeenCalledWith('P1');
  });

  it('shows marketing configuration and handles lock campaign', () => {
    const mockProject = generateMockProject('P1', { state: 'marketing', budget: 10_000_000 });

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: 'P1',
      selectProject: mockSelectProject,
    } as any);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          entities: {
            projects: { [mockProject.id]: mockProject },
            talents: {},
            contracts: {},
            rivals: {}
          },
          studio: { activeCampaigns: {} },
          finance: { cash: 100_000_000 },
          deals: { activeDeals: [] }
        },
        lockMarketingCampaign: mockLockMarketingCampaign,
      };
      return selector(state);
    });

    render(<TooltipProvider><ProjectDetailModal /></TooltipProvider>);
    const lockBtn = screen.getByText('Authorize Global Release & Dedicate Reserves');
    expect(lockBtn).toBeInTheDocument();

    fireEvent.click(lockBtn);
    expect(mockLockMarketingCampaign).toHaveBeenCalledWith('P1', 'none');
  });

  it('shows renew button for tv project and handles renewal', () => {
    const mockProject = generateMockProject('P1', {
      state: 'archived',
      type: 'SERIES',
      format: 'tv',
      tvDetails: {
          currentSeason: 1,
          episodesOrdered: 10,
          episodesCompleted: 10,
          episodesAired: 10,
          averageRating: 70,
          status: 'SYNDICATED'
      }
    });

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: 'P1',
      selectProject: mockSelectProject,
    } as any);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          entities: {
            projects: { [mockProject.id]: mockProject },
            talents: {},
            contracts: {},
            rivals: {}
          },
          studio: { activeCampaigns: {} },
          finance: { cash: 100_000_000 },
          deals: { activeDeals: [] }
        },
        renewProject: mockRenewProject,
      };
      return selector(state);
    });

    render(<TooltipProvider><ProjectDetailModal /></TooltipProvider>);
    const renewBtn = screen.getByText('Order Next Season (Production)');
    expect(renewBtn).toBeInTheDocument();

    fireEvent.click(renewBtn);
    expect(mockRenewProject).toHaveBeenCalledWith('P1');
  });
});
