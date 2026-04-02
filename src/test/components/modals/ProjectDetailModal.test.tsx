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
window.ResizeObserver = MockResizeObserver;

vi.mock('@/store/gameStore');
vi.mock('@/store/uiStore');

describe('ProjectDetailModal', () => {
  const mockSelectProject = vi.fn();
  const mockSignContract = vi.fn();
  const mockGreenlightProject = vi.fn();
  const mockLockMarketingCampaign = vi.fn();
  const mockRenewProject = vi.fn();
  const mockExploitFranchise = vi.fn();

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
            }
          },
          industry: {
            talentPool: {},
          },
          finance: { cash: 100_000_000 },
        },
        signContract: mockSignContract,
        greenlightProject: mockGreenlightProject,
        lockMarketingCampaign: mockLockMarketingCampaign,
        renewProject: mockRenewProject,
        exploitFranchise: mockExploitFranchise,
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
          studio: {
            internal: {
              projects: { [mockProject.id]: mockProject },
              contracts: [],
            }
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
          studio: {
            internal: {
              projects: { [mockProject.id]: mockProject },
              contracts: [],
            }
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

    render(<TooltipProvider><ProjectDetailModal /></TooltipProvider>);

    const approveBtn = screen.getByText('Authorize Production');
    expect(approveBtn).toBeInTheDocument();

    fireEvent.click(approveBtn);
    expect(mockGreenlightProject).toHaveBeenCalledWith('P1');
    expect(mockSelectProject).toHaveBeenCalledWith(null);
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
          studio: {
            internal: {
              projects: { [mockProject.id]: mockProject },
              contracts: [],
            }
          },
          industry: {
            talentPool: {},
          },
          finance: { cash: 100_000_000 },
        },
        lockMarketingCampaign: mockLockMarketingCampaign,
      };
      return selector(state);
    });

    render(<TooltipProvider><ProjectDetailModal /></TooltipProvider>);

    const lockBtn = screen.getByText('Lock Campaign & Commit Capital');
    expect(lockBtn).toBeInTheDocument();

    fireEvent.click(lockBtn);
    expect(mockLockMarketingCampaign).toHaveBeenCalledWith('P1', 'none');
    expect(mockSelectProject).toHaveBeenCalledWith(null);
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
          studio: {
            internal: {
              projects: { [mockProject.id]: mockProject },
              contracts: [],
            }
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

    render(<TooltipProvider><ProjectDetailModal /></TooltipProvider>);

    const renewBtn = screen.getByText('Order Season 2');
    expect(renewBtn).toBeInTheDocument();

    fireEvent.click(renewBtn);
    expect(mockRenewProject).toHaveBeenCalledWith('P1');
    expect(mockSelectProject).toHaveBeenCalledWith(null);
  });
});
