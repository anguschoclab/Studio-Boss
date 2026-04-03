import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectCard } from '@/components/pipeline/ProjectCard';
import { useUIStore } from '@/store/uiStore';
import { Project } from '@/engine/types';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock the uiStore
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
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
