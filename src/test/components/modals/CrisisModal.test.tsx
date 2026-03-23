import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CrisisModal } from '@/components/modals/CrisisModal';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Project, ProjectFormat } from '@/engine/types';

// Mock the stores
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

// Mock Lucide icons properly
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    AlertTriangle: () => <div data-testid="alert-triangle" />,
    X: () => <div data-testid="x-icon" />,
  };
});

describe('CrisisModal', () => {
  const mockCloseCrisisModal = vi.fn();
  const mockResolveProjectCrisis = vi.fn();

  const mockProject: Project = {
    id: 'proj-123',
    title: 'Disaster Movie',
    format: 'film' as ProjectFormat,
    genre: 'action',
    budgetTier: 'high',
    budget: 100000000,
    weeklyCost: 1000000,
    targetAudience: 'broad',
    flavor: 'explosive',
    status: 'production',
    activeCrisis: {
      description: 'The set is on fire.',
      options: [
        { text: 'Put it out', effectDescription: 'Costs $1M' },
        { text: 'Let it burn', effectDescription: 'Delays 2 weeks' },
      ],
      resolved: false,
    },
    metrics: { buzz: 0, quality: 0, momentum: 0 },
    stats: { weeksInProduction: 0 },
    history: [],
  } as any;

  const mockGameState = {
    studio: {
      internal: {
        projects: [mockProject]
      }
    }
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      showCrisisModal: true,
      crisisProjectId: 'proj-123',
      closeCrisisModal: mockCloseCrisisModal,
    });

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        gameState: mockGameState,
        resolveProjectCrisis: mockResolveProjectCrisis,
      };
      return selector(state);
    });
  });

  it('renders nothing if gameState is missing', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        gameState: null,
        resolveProjectCrisis: mockResolveProjectCrisis,
      };
      return selector(state);
    });

    const { container } = render(<CrisisModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if crisisProjectId is missing', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      showCrisisModal: true,
      crisisProjectId: null,
      closeCrisisModal: mockCloseCrisisModal,
    });

    const { container } = render(<CrisisModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if project is not found', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      showCrisisModal: true,
      crisisProjectId: 'non-existent',
      closeCrisisModal: mockCloseCrisisModal,
    });

    const { container } = render(<CrisisModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if project has no active crisis', () => {
    const projectWithoutCrisis = { ...mockProject, activeCrisis: undefined };
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        gameState: { 
          studio: {
            internal: {
              projects: [projectWithoutCrisis]
            }
          }
        },
        resolveProjectCrisis: mockResolveProjectCrisis,
      } as any;
      return selector(state);
    });

    const { container } = render(<CrisisModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if crisis is already resolved', () => {
    const resolvedCrisisProject = {
      ...mockProject,
      activeCrisis: { ...mockProject.activeCrisis!, resolved: true },
    };
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        gameState: { 
          studio: {
            internal: {
              projects: [resolvedCrisisProject]
            }
          }
        },
        resolveProjectCrisis: mockResolveProjectCrisis,
      } as any;
      return selector(state);
    });

    const { container } = render(<CrisisModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal with crisis details correctly', () => {
    render(<CrisisModal />);

    expect(screen.getByText('Production Crisis: Disaster Movie')).toBeInTheDocument();
    expect(screen.getByText('The set is on fire.')).toBeInTheDocument();
    expect(screen.getByText('Put it out')).toBeInTheDocument();
    expect(screen.getByText('Costs $1M')).toBeInTheDocument();
    expect(screen.getByText('Let it burn')).toBeInTheDocument();
    expect(screen.getByText('Delays 2 weeks')).toBeInTheDocument();
    expect(screen.getAllByText('Choose this path')).toHaveLength(2);
  });

  it('calls resolveProjectCrisis and closeCrisisModal when an option is selected', () => {
    render(<CrisisModal />);

    const chooseButtons = screen.getAllByText('Choose this path');
    fireEvent.click(chooseButtons[0]);

    expect(mockResolveProjectCrisis).toHaveBeenCalledWith('proj-123', 0);
    expect(mockCloseCrisisModal).toHaveBeenCalledTimes(1);
  });
});
