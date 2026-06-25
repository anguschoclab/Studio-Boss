import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiveAuctionDashboard } from '@/components/discovery/LiveAuctionDashboard';
import { useGameStore } from '@/store/gameStore';
import { Opportunity } from '@/engine/types';

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...rest }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">{children}</button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock('lucide-react', () => ({
  Gavel: () => <div data-testid="icon" />,
  Clock: () => <div data-testid="icon" />,
  History: () => <div data-testid="icon" />,
  AlertCircle: () => <div data-testid="icon" />,
  Zap: () => <div data-testid="icon" />,
  Target: () => <div data-testid="icon" />,
  Trophy: () => <div data-testid="icon" />,
  Ban: () => <div data-testid="icon" />,
}));

vi.mock('@/engine/utils', () => ({
  formatMoney: (n: number) => `$${n.toLocaleString()}`,
}));

function makeOpp(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'opp-1',
    title: 'Test Script',
    type: 'script',
    format: 'film',
    genre: 'Action',
    budgetTier: 'blockbuster',
    targetAudience: 'General',
    flavor: 'Cool',
    origin: 'open_spec',
    costToAcquire: 0,
    weeksUntilExpiry: 10,
    expirationWeek: 10,
    bids: {},
    bidHistory: [],
    ...overrides,
  } as Opportunity;
}

describe('discovery/LiveAuctionDashboard — currentHighest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      gameState: {
        finance: { cash: 100_000_000 },
        entities: { rivals: {} },
        studio: { id: 'PLR-1' },
        week: 1,
      },
      placeBid: vi.fn(),
      acquireOpportunity: vi.fn(),
    } as any);
  });

  it('returns 0 when no bids exist', () => {
    const opp = makeOpp({ bids: {} });
    render(<LiveAuctionDashboard opportunity={opp} onClose={vi.fn()} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('returns highest bid amount from bids dict', () => {
    const opp = makeOpp({
      bids: {
        'rival-1': { amount: 8_000_000, terms: 'standard' },
        'rival-2': { amount: 12_000_000, terms: 'standard' },
      },
    });
    render(<LiveAuctionDashboard opportunity={opp} onClose={vi.fn()} />);
    expect(screen.getByText('$12,000,000')).toBeInTheDocument();
  });

  it('handles single bid correctly', () => {
    const opp = makeOpp({
      bids: {
        'rival-1': { amount: 5_000_000, terms: 'standard' },
      },
    });
    render(<LiveAuctionDashboard opportunity={opp} onClose={vi.fn()} />);
    expect(screen.getByText('$5,000,000')).toBeInTheDocument();
  });
});
