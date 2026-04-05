import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectCard } from '@/components/pipeline/ProjectCard';
import { useUIStore } from '@/store/uiStore';
import { Project } from '@/engine/types';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useGameStore } from '@/store/gameStore';

// Mock the uiStore
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

// Mock the gameStore
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

const mockSelectProject = vi.fn();
const mockOpenPitchProject = vi.fn();
const mockEnqueueModal = vi.fn();

const baseProject: Project = {
  id: 'test-project-1',
  title: 'Test Movie',
  type: 'FILM',
  format: 'film',
  genre: 'Action',
  budgetTier: 'mid',
  budget: 25000000,
  weeklyCost: 2000000,
  targetAudience: 'General',
  flavor: 'Explosions',
  state: 'development',
  buzz: 50,
  weeksInPhase: 4,
  developmentWeeks: 8,
  productionWeeks: 12,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
  activeCrisis: null,
  momentum: 50,
  progress: 50,
  accumulatedCost: 10000000,
} as Project;

describe('ProjectCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectProject: mockSelectProject,
      openPitchProject: mockOpenPitchProject,
      enqueueModal: mockEnqueueModal,
    });
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      return selector({
        gameState: {
          market: {
            buyers: [
              { id: 'buyer-1', name: 'Netflix' },
              { id: 'buyer-2', name: 'Warner Bros' }
            ]
          }
        }
      });
    });
  });

  it('renders basic project details correctly', () => {
    render(<TooltipProvider><ProjectCard project={baseProject} /></TooltipProvider>);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('$30M')).toBeInTheDocument(); // Label for 'mid' tier
    expect(screen.getByText('FILM')).toBeInTheDocument();
  });

  it('calls selectProject when the main card is clicked', () => {
    render(<TooltipProvider><ProjectCard project={baseProject} /></TooltipProvider>);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockSelectProject).toHaveBeenCalledWith('test-project-1');
  });

  it('calls selectProject when the main card receives Enter keydown', () => {
    render(<TooltipProvider><ProjectCard project={baseProject} /></TooltipProvider>);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(mockSelectProject).toHaveBeenCalledWith('test-project-1');
  });

  it('calls selectProject when the main card receives Space keydown', () => {
    render(<TooltipProvider><ProjectCard project={baseProject} /></TooltipProvider>);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ', code: 'Space', charCode: 32 });

    expect(mockSelectProject).toHaveBeenCalledWith('test-project-1');
  });

  it('shows Executive Review button for needs_greenlight state', () => {
     const project = { ...baseProject, state: 'needs_greenlight' as const };
    render(<TooltipProvider><ProjectCard project={project} /></TooltipProvider>);

    const button = screen.getByRole('button', { name: /Executive Review/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockSelectProject).toHaveBeenCalledWith('test-project-1');
  });

  it('shows Pitch Pipeline button for pitching state', () => {
    const project = { ...baseProject, state: 'pitching' as const };
    render(<TooltipProvider><ProjectCard project={project} /></TooltipProvider>);

    const button = screen.getByRole('button', { name: /Pitch Pipeline/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockOpenPitchProject).toHaveBeenCalledWith('test-project-1');
  });

  it('shows Neutralize Crisis button when there is an unresolved crisis', () => {
    const project = {
      ...baseProject,
      activeCrisis: {
        id: 'crisis-1',
        title: 'Star walked off set',
        description: '...',
        options: [],
        resolved: false,
        weekTriggered: 1,
      },
    } as any;
    render(<TooltipProvider><ProjectCard project={project} /></TooltipProvider>);

    const button = screen.getByRole('button', { name: /Neutralize Crisis/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockEnqueueModal).toHaveBeenCalledWith('CRISIS', { projectId: 'test-project-1' });
  });

  it('renders progress text for development state', () => {
    render(<TooltipProvider><ProjectCard project={baseProject} /></TooltipProvider>);
    const devElements = screen.getAllByText((content, element) => element?.textContent?.includes('development') ?? false);
    expect(devElements.length).toBeGreaterThan(0);
    expect(screen.getByText('4/8w')).toBeInTheDocument();
  });

  it('renders recoupment status for released state', () => {
    const project = { 
      ...baseProject, 
      state: 'released' as const, 
      revenue: 50000000, 
      budget: 25000000,
      marketingBudget: 5000000 
    }; // Total investment: 30M, Revenue: 50M -> Profitable
    render(<TooltipProvider><ProjectCard project={project} /></TooltipProvider>);

    expect(screen.getByText('Profitable')).toBeInTheDocument();
  });

  it('renders distribution deal info for streaming status', () => {
    const project = {
      ...baseProject,
      distributionStatus: 'streaming' as const,
      buyerId: 'buyer-1',
      budget: 1000000, // 2% of 1M is 20k
    };

    render(<TooltipProvider><ProjectCard project={project} /></TooltipProvider>);

    // Check buyer name
    expect(screen.getByText('Netflix')).toBeInTheDocument();

    // Check weekly revenue forecast
    expect(screen.getByText('$20K/wk')).toBeInTheDocument();
  });

  it('renders distribution deal info for theatrical status', () => {
    const project = {
      ...baseProject,
      distributionStatus: 'theatrical' as const,
      buyerId: 'buyer-2',
      budget: 1000000, // 3% of 1M is 30k
    };

    render(<TooltipProvider><ProjectCard project={project} /></TooltipProvider>);

    // Check buyer name
    expect(screen.getByText('Warner Bros')).toBeInTheDocument();

    // Check weekly revenue forecast
    expect(screen.getByText('$30K/wk')).toBeInTheDocument();
  });

  it('renders TV format correctly', () => {
    const tvProject = {
      ...baseProject,
      type: 'SERIES' as const,
      format: 'tv' as const,
      tvDetails: {
        currentSeason: 2,
        episodesOrdered: 10,
        episodesCompleted: 0,
        episodesAired: 0,
        averageRating: 0,
        status: 'IN_DEVELOPMENT'
      },
      tvFormat: 'sitcom' as const,
    } as any;
    render(<TooltipProvider><ProjectCard project={tvProject} /></TooltipProvider>);

    expect(screen.getByText('S2')).toBeInTheDocument();
  });
});
