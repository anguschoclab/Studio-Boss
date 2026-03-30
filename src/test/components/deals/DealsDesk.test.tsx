import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DealsDesk } from '@/components/deals/DealsDesk';
import { useGameStore } from '@/store/gameStore';
import { calculateFitScore } from '@/engine/systems/buyers';
import { GameState } from '@/engine/types';

vi.mock('@/store/gameStore');
vi.mock('@/engine/systems/buyers', () => ({
  calculateFitScore: vi.fn(),
}));

describe('DealsDesk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main header and empty states', () => {
    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = {
        gameState: {
          week: 1,
          studio: { internal: { projects: [] } },
          market: { buyers: [] }
        }
      };
      return selector(state as unknown as GameState);
    });

    render(<DealsDesk />);
    expect(screen.getByText('Deals Desk & Distribution')).toBeInTheDocument();
    expect(screen.getByText(/0 Network Partners/i)).toBeInTheDocument();
    expect(screen.getByText('No Active Pitch Slate')).toBeInTheDocument();
  });

  it('renders buyers with mandates', () => {
    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = {
        gameState: {
          week: 1,
          studio: { internal: { projects: [] } },
          market: {
            buyers: [
              { id: 'b1', name: 'Netflix', archetype: 'streamer', currentMandate: { type: 'prestige', activeUntilWeek: 10 } },
              { id: 'b2', name: 'HBO', archetype: 'premium' }
            ]
          }
        }
      };
      return selector(state as unknown as GameState);
    });

    render(<DealsDesk />);
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('streamer')).toBeInTheDocument();
    expect(screen.getByText('prestige')).toBeInTheDocument();

    expect(screen.getByText('HBO')).toBeInTheDocument();
    expect(screen.getByText('premium')).toBeInTheDocument();
    expect(screen.getByText('Open Slate')).toBeInTheDocument();
  });

  it('renders active pitching slate projects', () => {
    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = {
        gameState: {
          week: 1,
          studio: {
            internal: {
              projects: [
                { id: 'p1', title: 'Pitch Project', status: 'pitching', genre: 'Action', budgetTier: 'high' },
                { id: 'p2', title: 'Dev Project', status: 'development', genre: 'Drama', budgetTier: 'low' },
                { id: 'p3', title: 'Prod Project', status: 'production', genre: 'Comedy', budgetTier: 'mid' }
              ]
            }
          },
          market: { buyers: [] }
        }
      };
      return selector(state as unknown as GameState);
    });

    render(<DealsDesk />);
    expect(screen.getByText('Pitch Project')).toBeInTheDocument();
    expect(screen.getByText('Dev Project')).toBeInTheDocument();
    expect(screen.queryByText('Prod Project')).not.toBeInTheDocument();
  });

  it('displays fit scores when projects and buyers are present', () => {
    vi.mocked(calculateFitScore).mockImplementation((project) => {
      return project.id === 'p1' ? 85 : 30;
    });

    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = {
        gameState: {
          week: 1,
          studio: {
            internal: {
              projects: [
                { id: 'p1', title: 'Fit Project', status: 'pitching', genre: 'Action', budgetTier: 'high' }
              ]
            }
          },
          market: {
            buyers: [
              { id: 'b1', name: 'Buyer 1', archetype: 'streamer' }
            ]
          }
        }
      };
      return selector(state as unknown as GameState);
    });

    render(<DealsDesk />);
    expect(screen.getByText('Acquisition Fit Analysis')).toBeInTheDocument();
    expect(screen.getAllByText('Fit Project').length).toBeGreaterThan(0);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});
