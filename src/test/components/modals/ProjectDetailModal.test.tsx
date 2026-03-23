import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
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
  const mockLaunchMarketingCampaign = vi.fn();
  const mockRenewProject = vi.fn();
  const mockExploitFranchise = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: null,
      selectProject: mockSelectProject,
    } as unknown as ReturnType<typeof useUIStore>);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          projects: [],
          talentPool: [],
          contracts: [],
          cash: 100000000, // 100M
        },
        signContract: mockSignContract,
        greenlightProject: mockGreenlightProject,
        launchMarketingCampaign: mockLaunchMarketingCampaign,
        renewProject: mockRenewProject,
        exploitFranchise: mockExploitFranchise,
      };
      return selector(state);
    });
  });

  const generateMockProject = (id: string, overrides: Partial<Project> = {}): Project => ({
    id,
    title: `Mock Project ${id}`,
    genre: 'Action',
    budgetTier: 'low',
    budget: 10000000,
    weeklyCost: 1000000,
    developmentWeeks: 10,
    productionWeeks: 10,
    weeksInPhase: 0,
    status: 'development',
    buzz: 50,
    revenue: 0,
    weeklyRevenue: 0,
    format: 'film',
    ...overrides
  });

  it('renders nothing when no project is selected', () => {
    render(<ProjectDetailModal />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders project details when a project is selected', () => {
    const mockProject = generateMockProject('P1');

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: 'P1',
      selectProject: mockSelectProject,
    } as unknown as ReturnType<typeof useUIStore>);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          projects: [mockProject],
          talentPool: [],
          contracts: [],
          cash: 100000000,
        },
        signContract: mockSignContract,
      };
      return selector(state);
    });

    render(<ProjectDetailModal />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(mockProject.title)).toBeInTheDocument();
  });

  it('shows greenlight button when project needs greenlight', () => {
    const mockProject = generateMockProject('P1', { status: 'needs_greenlight' });

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: 'P1',
      selectProject: mockSelectProject,
    } as unknown as ReturnType<typeof useUIStore>);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          projects: [mockProject],
          talentPool: [],
          contracts: [],
          cash: 100000000,
        },
        greenlightProject: mockGreenlightProject,
      };
      return selector(state);
    });

    render(<ProjectDetailModal />);

    const approveBtn = screen.getByText('Approve Greenlight');
    expect(approveBtn).toBeInTheDocument();

    fireEvent.click(approveBtn);
    expect(mockGreenlightProject).toHaveBeenCalledWith('P1');
    expect(mockSelectProject).toHaveBeenCalledWith(null);
  });

  it('shows marketing configuration and handles launch campaign', () => {
    const mockProject = generateMockProject('P1', { status: 'marketing', budget: 10000000 });

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: 'P1',
      selectProject: mockSelectProject,
    } as unknown as ReturnType<typeof useUIStore>);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          projects: [mockProject],
          talentPool: [],
          contracts: [],
          cash: 100000000,
        },
        launchMarketingCampaign: mockLaunchMarketingCampaign,
      };
      return selector(state);
    });

    render(<ProjectDetailModal />);

    const launchBtn = screen.getByText('Launch Campaign & Release');
    expect(launchBtn).toBeInTheDocument();

    fireEvent.click(launchBtn);
    // Default marketing Budget is 0, domestic split is 50, angle is 'spectacle'
    expect(mockLaunchMarketingCampaign).toHaveBeenCalledWith('P1', 0, 50, 'spectacle');
    expect(mockSelectProject).toHaveBeenCalledWith(null);
  });

  it('shows renew button for tv project and handles renewal', () => {
    const mockProject = generateMockProject('P1', {
      status: 'archived',
      format: 'tv',
      renewable: true,
      season: 1,
    });

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: 'P1',
      selectProject: mockSelectProject,
    } as unknown as ReturnType<typeof useUIStore>);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          projects: [mockProject],
          talentPool: [],
          contracts: [],
          cash: 100000000,
        },
        renewProject: mockRenewProject,
      };
      return selector(state);
    });

    render(<ProjectDetailModal />);

    const renewBtn = screen.getByText('Renew for Season 2');
    expect(renewBtn).toBeInTheDocument();

    fireEvent.click(renewBtn);
    expect(mockRenewProject).toHaveBeenCalledWith('P1');
    expect(mockSelectProject).toHaveBeenCalledWith(null);
  });

  it('shows develop spinoff button for high revenue projects and handles exploitation', () => {
    const mockProject = generateMockProject('P1', {
      status: 'released',
      budget: 10000000,
      revenue: 20000000, // 20M > 1.5 * 10M
    });

    vi.mocked(useUIStore).mockReturnValue({
      selectedProjectId: 'P1',
      selectProject: mockSelectProject,
    } as unknown as ReturnType<typeof useUIStore>);

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          projects: [mockProject],
          talentPool: [],
          contracts: [],
          cash: 100000000,
        },
        exploitFranchise: mockExploitFranchise,
      };
      return selector(state);
    });

    render(<ProjectDetailModal />);

    const spinoffBtn = screen.getByText('Develop Spinoff');
    expect(spinoffBtn).toBeInTheDocument();

    fireEvent.click(spinoffBtn);
    expect(mockExploitFranchise).toHaveBeenCalledWith('P1');
    expect(mockSelectProject).toHaveBeenCalledWith(null);
  });
});
