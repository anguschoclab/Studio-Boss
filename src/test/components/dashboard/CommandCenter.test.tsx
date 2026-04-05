import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandCenter } from '@/components/dashboard/CommandCenter';
import { useGameStore } from '@/store/gameStore';

vi.mock('@/store/gameStore');
vi.mock('@/components/dashboard/FinancialOverviewWidget', () => ({
  FinancialOverviewWidget: () => <div data-testid="mock-financial-widget">FinancialOverviewWidget</div>
}));
vi.mock('@/components/dashboard/DemographicsWidget', () => ({
  DemographicsWidget: () => <div data-testid="mock-demographics-widget">DemographicsWidget</div>
}));

describe('CommandCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders null when state is missing', () => {
    vi.mocked(useGameStore).mockImplementation(() => null);
    const { container } = render(<CommandCenter />);
    expect(container.firstChild).toBeNull();
  });

  it('renders studio details and KPI values correctly', () => {
    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = {
        gameState: {
          studio: {
            name: 'Acme Studios',
            archetype: 'boutique-indie',
            prestige: 42,
            internal: {
              projects: {
                p1: { state: 'development' },
                p2: { state: 'pre_production' },
                p3: { state: 'released' },
                p4: { state: 'archived' }
              }
            }
          },
          industry: {
            talentPool: {
              t1: { name: 'Actor 1' },
              t2: { name: 'Actor 2' },
              t3: { name: 'Director 1' }
            },
            rivals: [
              { id: 'r1' },
              { id: 'r2' }
            ],
            newsHistory: []
          }
        }
      };
      return selector(state as any);
    });

    render(<CommandCenter />);

    expect(screen.getByText('Acme Studios')).toBeInTheDocument();
    expect(screen.getByText('boutique indie')).toBeInTheDocument();

    const valueElements = screen.getAllByText('2');
    expect(valueElements.length).toBeGreaterThan(0);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    expect(screen.getByTestId('mock-financial-widget')).toBeInTheDocument();
    expect(screen.getByTestId('mock-demographics-widget')).toBeInTheDocument();
  });

  it('renders news history when available', () => {
    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = {
        gameState: {
          studio: {
            name: 'Acme Studios',
            archetype: 'boutique-indie',
            prestige: 42,
            internal: { projects: {} }
          },
          industry: {
            talentPool: {},
            rivals: [],
            newsHistory: [
              { id: 'n1', week: 12, headline: 'Huge Box Office', description: 'A movie made money' },
              { id: 'n2', week: 13, headline: 'Scandal!', description: 'Oh no' }
            ]
          }
        }
      };
      return selector(state as any);
    });

    render(<CommandCenter />);

    expect(screen.getByText('W12')).toBeInTheDocument();
    expect(screen.getByText('Huge Box Office')).toBeInTheDocument();
    expect(screen.getByText('A movie made money')).toBeInTheDocument();

    expect(screen.getByText('W13')).toBeInTheDocument();
    expect(screen.getByText('Scandal!')).toBeInTheDocument();
    expect(screen.getByText('Oh no')).toBeInTheDocument();
  });

  it('renders empty state for news history when empty', () => {
    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = {
        gameState: {
          studio: {
            name: 'Acme Studios',
            archetype: 'boutique-indie',
            prestige: 42,
            internal: { projects: {} }
          },
          industry: {
            talentPool: {},
            rivals: [],
            newsHistory: []
          }
        }
      };
      return selector(state as any);
    });

    render(<CommandCenter />);

    expect(screen.getByText('No recent industry activity logged in the global feed.')).toBeInTheDocument();
  });
});
