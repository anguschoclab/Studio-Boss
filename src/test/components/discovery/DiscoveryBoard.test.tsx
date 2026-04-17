import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscoveryBoard } from '../../../components/discovery/DiscoveryBoard';
import { useGameStore } from '../../../store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Opportunity } from '../../../engine/types';
import { TooltipProvider } from '@/components/ui/tooltip';

vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

// Mock NewsFeed and TrendBoard to avoid nested store dependency issues
vi.mock('@/components/news/NewsFeed', () => ({ NewsFeed: () => <div data-testid="news-feed">News Feed</div> }));
vi.mock('@/components/trends/TrendBoard', () => ({ TrendBoard: () => <div data-testid="trend-board">Trend Board</div> }));

describe('DiscoveryBoard', () => {
  const mockOpenCreateProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUIStore).mockReturnValue({
      openCreateProject: mockOpenCreateProject,
    } as any);
  });

  const getBaseGameState = (opportunities: Opportunity[] = []) => ({
    market: { opportunities, trends: [] },
    industry: { newsHistory: [] },
    finance: { cash: 1000000, ledger: [], marketState: { interestRate: 0.05, inflation: 0.02, consumerConfidence: 0.8, rateHistory: [] } },
    studio: { internal: { projects: {} } }
  });

  it('renders empty state when there are no opportunities', () => {
    const gameState = getBaseGameState([]);
    useGameStore.setState({
      gameState,
      finance: gameState.finance,
    } as any);

    render(<TooltipProvider><DiscoveryBoard /></TooltipProvider>);

    expect(screen.getByText('The Trades')).toBeDefined();
    expect(screen.getByText(/No active scripts/i)).toBeDefined();
  });

  it('calls openCreateProject when Create Original button is clicked', () => {
    const gameState = getBaseGameState([]);
    useGameStore.setState({
      gameState,
      finance: gameState.finance,
    } as any);

    render(<TooltipProvider><DiscoveryBoard /></TooltipProvider>);

    const createButton = screen.getByText('Original IP Concept');
    fireEvent.click(createButton);

    expect(mockOpenCreateProject).toHaveBeenCalledTimes(1);
  });

  it('renders opportunity cards when there are opportunities', () => {
    const mockOpportunities: Opportunity[] = [
      {
        id: '1',
        title: 'Action Movie',
        type: 'script',
        genre: 'Action',
        format: 'film',
        budgetTier: 'high',
        flavor: 'Explosions everywhere.',
        weeksUntilExpiry: 5,
        targetAudience: 'Broad',
        qualityBonus: 0,
        origin: 'open_spec',
        costToAcquire: 0,
        bids: {},
        expirationWeek: 10,
        bidHistory: []
      },
    ];

    const gameState = getBaseGameState(mockOpportunities);
    useGameStore.setState({
      gameState,
      finance: gameState.finance,
    } as any);

    render(<TooltipProvider><DiscoveryBoard /></TooltipProvider>);

    expect(screen.getByText('Action Movie')).toBeDefined();
    expect(screen.getAllByText(/Action/i)).toBeDefined();
    expect(screen.getByText('"Explosions everywhere."')).toBeDefined();
  });

  it('opens auction dashboard when Enter War button is clicked on a card', () => {
    const mockOpportunities: Opportunity[] = [
      {
        id: 'opp-123',
        title: 'Drama Film',
        type: 'script',
        genre: 'Drama',
        format: 'film',
        budgetTier: 'mid',
        flavor: 'Tearjerker.',
        weeksUntilExpiry: 4,
        targetAudience: 'Broad',
        qualityBonus: 0,
        origin: 'open_spec',
        costToAcquire: 0,
        bids: {},
        expirationWeek: 9,
        bidHistory: []
      },
    ];

    const gameState = getBaseGameState(mockOpportunities);
    useGameStore.setState({
      gameState,
      finance: gameState.finance,
    } as any);

    render(<TooltipProvider><DiscoveryBoard /></TooltipProvider>);

    const acquireButton = screen.getByText('Enter War');
    fireEvent.click(acquireButton);

    // LiveAuctionDashboard should appear in the DOM
    expect(screen.getByText('Market Valuation')).toBeInTheDocument();
    expect(screen.getByText('Your Action')).toBeInTheDocument();
    // Select the one in the auction header (h2) to be specific
    expect(screen.getByRole('heading', { level: 2, name: 'Drama Film' })).toBeInTheDocument();
  });
});
