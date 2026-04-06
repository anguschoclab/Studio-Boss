import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SBDBView } from '@/components/sbdb/SBDBView';
import { useGameStore } from '@/store/gameStore';
import { Talent } from '@/engine/types';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock the game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

// Mock the TalentCard component
vi.mock('@/components/talent/TalentCard', () => ({
  TalentCard: ({ talent }: { talent: Talent }) => (
    <div data-testid={`talent-card-${talent.id}`}>{talent.name}</div>
  ),
}));

const mockTalentPool: Record<string, Talent> = {
  't1': { id: 't1', name: 'Alice Actor', roles: ['actor'], prestige: 85, starMeter: 90 } as Talent,
  't2': { id: 't2', name: 'Bob Director', roles: ['director'], prestige: 65, starMeter: 70 } as Talent,
  't3': { id: 't3', name: 'Charlie Rising', roles: ['actor'], prestige: 50, starMeter: 55 } as Talent,
  't4': { id: 't4', name: 'Dave Unknown', roles: ['writer'], prestige: 20, starMeter: 10 } as Talent,
};

describe('SBDBView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        gameState: {
          entities: {
            talents: mockTalentPool,
            projects: {},
            contracts: {},
            rivals: {}
          },
          industry: {
            talentPool: mockTalentPool,
          },
        },
      };
      return selector(state);
    });
  });

  it('renders the header and subtitle', () => {
    render(<TooltipProvider><SBDBView /></TooltipProvider>);
    expect(screen.getByText('Studio Boss Database')).toBeInTheDocument();
    expect(screen.getByText('The definitive industry database of talent, producers, and stars.')).toBeInTheDocument();
  });

  it('renders all talent cards when no filters are applied', () => {
    render(<TooltipProvider><SBDBView /></TooltipProvider>);
    expect(screen.getByTestId('talent-card-t1')).toBeInTheDocument();
    expect(screen.getByTestId('talent-card-t2')).toBeInTheDocument();
    expect(screen.getByTestId('talent-card-t3')).toBeInTheDocument();
    expect(screen.getByTestId('talent-card-t4')).toBeInTheDocument();
  });

  it('filters talent by search text', () => {
    render(<TooltipProvider><SBDBView /></TooltipProvider>);

    const searchInput = screen.getByPlaceholderText('Search SBDB...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByTestId('talent-card-t1')).toBeInTheDocument();
    expect(screen.queryByTestId('talent-card-t2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('talent-card-t3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('talent-card-t4')).not.toBeInTheDocument();
  });

  it('filters talent by role', () => {
    render(<TooltipProvider><SBDBView /></TooltipProvider>);

    const allRolesTrigger = screen.getByText('All Roles');
    fireEvent.click(allRolesTrigger);

    const actorsOption = screen.getByText('Actors');
    fireEvent.click(actorsOption);

    expect(screen.getByTestId('talent-card-t1')).toBeInTheDocument();
    expect(screen.queryByTestId('talent-card-t2')).not.toBeInTheDocument(); // Director
    expect(screen.getByTestId('talent-card-t3')).toBeInTheDocument();
    expect(screen.queryByTestId('talent-card-t4')).not.toBeInTheDocument(); // Writer
  });

  it('filters talent by tier (A-List)', () => {
    render(<TooltipProvider><SBDBView /></TooltipProvider>);

    const allTiersTrigger = screen.getByText('All Tiers');
    fireEvent.click(allTiersTrigger);

    const aListOption = screen.getByText('A-List (80+)');
    fireEvent.click(aListOption);

    expect(screen.getByTestId('talent-card-t1')).toBeInTheDocument(); // prestige 85
    expect(screen.queryByTestId('talent-card-t2')).not.toBeInTheDocument(); // prestige 65
    expect(screen.queryByTestId('talent-card-t3')).not.toBeInTheDocument(); // prestige 50
    expect(screen.queryByTestId('talent-card-t4')).not.toBeInTheDocument(); // prestige 20
  });

  it('shows empty state when no talent matches criteria', () => {
    render(<TooltipProvider><SBDBView /></TooltipProvider>);

    const searchInput = screen.getByPlaceholderText('Search SBDB...');
    fireEvent.change(searchInput, { target: { value: 'Zebra' } });

    expect(screen.queryByTestId('talent-card-t1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('talent-card-t2')).not.toBeInTheDocument();
    expect(screen.getByText('No talent found matching your criteria.')).toBeInTheDocument();
  });

  it('returns null if gameState is null', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({ gameState: null }));
    const { container } = render(<TooltipProvider><SBDBView /></TooltipProvider>);
    expect(container.firstChild).toBeNull();
  });
});
