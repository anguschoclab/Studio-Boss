import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TalentPanel } from '@/components/talent/TalentPanel';
import { useGameStore } from '@/store/gameStore';

vi.mock('@/store/gameStore');

describe('TalentPanel', () => {
  beforeEach(() => {
    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = {
        gameState: {
          talentPool: [
            {
              id: 't1',
              name: 'Tom Hanks',
              roles: ['actor'],
              prestige: 95,
              fee: 20000000,
              draw: 90,
              temperament: 80,
              accessLevel: 'a-list',
              agencyId: 'a1'
            },
            {
              id: 't2',
              name: 'Steven Spielberg',
              roles: ['director', 'producer'],
              prestige: 98,
              fee: 30000000,
              draw: 85,
              temperament: 75,
              accessLevel: 'a-list',
              agencyId: 'a2'
            }
          ],
          agencies: [
            { id: 'a1', name: 'CAA' },
            { id: 'a2', name: 'WME' }
          ]
        }
      };
      return selector(state);
    });
  });

  it('renders talent roster', () => {
    render(<TalentPanel />);
    expect(screen.getByText('Talent Roster')).toBeInTheDocument();
    expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
    expect(screen.getByText('Steven Spielberg')).toBeInTheDocument();
  });

  it('filters talent by role', () => {
    render(<TalentPanel />);

    // Initial state: both should be visible
    expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
    expect(screen.getByText('Steven Spielberg')).toBeInTheDocument();

    // Filter by director
    fireEvent.click(screen.getByText('DIRECTOR'));

    expect(screen.queryByText('Tom Hanks')).not.toBeInTheDocument();
    expect(screen.getByText('Steven Spielberg')).toBeInTheDocument();
  });

  it('shows empty state when no talent matches filter', () => {
    render(<TalentPanel />);

    fireEvent.click(screen.getByText('WRITER'));

    expect(screen.getByText('No talent found matching this filter.')).toBeInTheDocument();
  });
});
