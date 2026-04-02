import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DealsDesk } from '@/components/deals/DealsDesk';
import { useGameStore } from '@/store/gameStore';
import { calculateFitScore } from '@/engine/systems/buyers';
import { GameState, Project, Buyer } from '@/engine/types';

vi.mock('@/store/gameStore');
vi.mock('@/engine/systems/buyers', () => ({
  calculateFitScore: vi.fn(),
}));

describe('DealsDesk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const generateMockProject = (id: string, state: string, genre: string, tier: string) => ({
      id, title: `${id} Project`, state, genre, budgetTier: tier, budget: 1000000
  } as Project);

  const generateMockBuyer = (id: string, name: string, archetype: string, mandate?: any) => ({
      id, name, archetype, currentMandate: mandate
  } as Buyer);

  it('renders main header and empty states', () => {
    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = {
        gameState: {
          week: 1,
          studio: { internal: { projects: {}, contracts: [] } },
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
          studio: { internal: { projects: {}, contracts: [] } },
          market: {
            buyers: [
              generateMockBuyer('b1', 'Netflix', 'streamer', { type: 'prestige', activeUntilWeek: 10 }),
              generateMockBuyer('b2', 'HBO', 'premium')
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
              projects: {
                'p1': generateMockProject('Pitch', 'pitching', 'Action', 'high'),
                'p2': generateMockProject('Dev', 'development', 'Drama', 'low'),
                'p3': generateMockProject('Prod', 'production', 'Comedy', 'mid')
              },
              contracts: []
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
              projects: {
                'p1': { id: 'p1', title: 'Fit Project', state: 'pitching', genre: 'Action', budgetTier: 'high', budget: 1000000 } as Project
              },
              contracts: []
            }
          },
          market: {
            buyers: [
              generateMockBuyer('b1', 'Buyer 1', 'streamer')
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
