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

vi.mock('@/engine/utils/impactUtils', () => ({
  getCrisisData: vi.fn(),
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


// Mock the Dialog components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, onOpenChange }: any) => (
    <div data-testid="mock-dialog" onClick={() => onOpenChange?.(false)}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: any) => <div data-testid="mock-dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="mock-dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="mock-dialog-title">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="mock-dialog-desc">{children}</div>,
}));

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
      crisisId: 'test-crisis',
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
    entities: {
      projects: { [mockProject.id]: mockProject }
    }
  } as any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Default mock implementations
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { type: 'CRISIS', payload: { projectId: 'proj-123', crisis: mockProject.activeCrisis } },
      resolveCurrentModal: mockCloseCrisisModal,
    });

    const impactUtils = await import('@/engine/utils/impactUtils');
    (impactUtils.getCrisisData as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      id: 'test-crisis',
      description: 'The set is on fire.',
      options: [
        { text: 'Put it out', effectDescription: 'Costs $1M' },
        { text: 'Let it burn', effectDescription: 'Delays 2 weeks' },
      ],
    });

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        gameState: mockGameState,
        resolveProjectCrisis: mockResolveProjectCrisis,
      };
      return selector ? selector(state) : state;
    });
  });

  it('renders nothing if gameState is missing', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        gameState: null,
        resolveProjectCrisis: mockResolveProjectCrisis,
      };
      return selector ? selector(state) : state;
    });

    const { container } = render(<CrisisModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if crisisProjectId is missing', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { type: 'CRISIS', payload: { projectId: null, crisis: mockProject.activeCrisis } },
      resolveCurrentModal: mockCloseCrisisModal,
    });

    const { container } = render(<CrisisModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if project is not found and no modalCrisis is provided', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { type: 'CRISIS', payload: { projectId: 'non-existent' } },
      resolveCurrentModal: mockCloseCrisisModal,
    });

    const { container } = render(<CrisisModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing and calls resolveCurrentModal if activeCrisis is missing', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { type: 'CRISIS', payload: { projectId: 'proj-123' } },
      resolveCurrentModal: mockCloseCrisisModal,
    });

    const projectWithoutCrisis = { ...mockProject, activeCrisis: undefined };
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          week: 1,
          entities: { projects: {}, talents: {}, contracts: {}, rivals: {} },
          market: { buyers: [] }
        },
        resolveProjectCrisis: mockResolveProjectCrisis,
      };
      return selector ? selector(state) : state;
    });

    const { container } = render(<CrisisModal />);
    expect(mockCloseCrisisModal).toHaveBeenCalled();
    expect(container.firstChild).toBeNull();
  });

  it('warns and resolves modal if crisis has no options', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const projectWithNoOptionsCrisis = {
      ...mockProject,
      activeCrisis: {
        crisisId: 'no-options-crisis',
        description: 'Test',
        options: [],
        resolved: false
      }
    };

    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeModal: { type: 'CRISIS', payload: { projectId: 'proj-123', crisis: projectWithNoOptionsCrisis.activeCrisis } },
      resolveCurrentModal: mockCloseCrisisModal,
    });

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          entities: {
            projects: { [projectWithNoOptionsCrisis.id]: projectWithNoOptionsCrisis }
          }
        },
        resolveProjectCrisis: mockResolveProjectCrisis,
      };
      return selector ? selector(state) : state;
    });

    const impactUtils = await import('@/engine/utils/impactUtils');
    (impactUtils.getCrisisData as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      id: 'no-options-crisis',
      description: 'Test',
      options: [],
    });

    const { container } = render(<CrisisModal />);
    expect(warnSpy).toHaveBeenCalledWith('Crisis no-options-crisis has no resolution options.');
    expect(mockCloseCrisisModal).toHaveBeenCalled();
    expect(container.firstChild).toBeNull();

    warnSpy.mockRestore();
  });

  it('does nothing on OpenChange(false)', () => {
    render(<CrisisModal />);
    fireEvent.click(screen.getByTestId('mock-dialog'));
    expect(screen.getByText(/Production Crisis/i)).toBeInTheDocument();
  });

  it('renders the modal with crisis details correctly', () => {
    render(<CrisisModal />);

    expect(screen.getByText(/Production Crisis/i)).toBeInTheDocument();
    expect(screen.getByText('The set is on fire.')).toBeInTheDocument();
    expect(screen.getByText('Put it out')).toBeInTheDocument();
    expect(screen.getByText('Costs $1M')).toBeInTheDocument();
    expect(screen.getByText('Let it burn')).toBeInTheDocument();
    expect(screen.getByText('Delays 2 weeks')).toBeInTheDocument();
  });

  it('calls resolveProjectCrisis and closeCrisisModal when an option is selected', () => {
    render(<CrisisModal />);

    const chooseButtons = screen.getAllByRole('button');
    // Button 0 is the first option
    fireEvent.click(chooseButtons[0]);

    expect(mockResolveProjectCrisis).toHaveBeenCalledWith('proj-123', 0);
    expect(mockCloseCrisisModal).toHaveBeenCalledTimes(1);
  });
});
