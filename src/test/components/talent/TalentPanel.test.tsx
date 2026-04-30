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
          week: 1,
          industry: {
            talentPool: {
              't1': {
                id: 't1',
                name: 'Tom Hanks',
                roles: ['actor'],
                prestige: 95,
                fee: 20000000,
                draw: 90,
                temperament: 'normal',
                accessLevel: 'a-list',
                agencyId: 'a1',
                demographics: { age: 66, gender: 'MALE', ethnicity: 'Caucasian', country: 'USA' },
                psychology: { ego: 30, mood: 80, scandalRisk: 10, synergyAffinities: [], synergyConflicts: [] }
              },
              't2': {
                id: 't2',
                name: 'Steven Spielberg',
                roles: ['director', 'producer'],
                prestige: 98,
                fee: 30000000,
                draw: 85,
                temperament: 'normal',
                accessLevel: 'a-list',
                agencyId: 'a2',
                demographics: { age: 76, gender: 'MALE', ethnicity: 'Caucasian', country: 'USA' },
                psychology: { ego: 40, mood: 75, scandalRisk: 5, synergyAffinities: [], synergyConflicts: [] }
              }
            },
            agencies: [
              { id: 'a1', name: 'CAA' },
              { id: 'a2', name: 'WME' }
            ]
          }
        }
      };
      return selector(state as any);
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
    const directorButton = screen.getAllByText((content, element) => element?.textContent?.toLowerCase() === 'director').find(el => el.tagName === 'BUTTON');
    if (directorButton) fireEvent.click(directorButton);

    expect(screen.queryByText('Tom Hanks')).not.toBeInTheDocument();
    expect(screen.getByText('Steven Spielberg')).toBeInTheDocument();
  });

  it('shows empty state when no talent matches filter', () => {
    render(<TalentPanel />);

    const writerButton = screen.getAllByText((content, element) => element?.textContent?.toLowerCase() === 'writer').find(el => el.tagName === 'BUTTON');
    if (writerButton) fireEvent.click(writerButton);

    expect(screen.getByText('No talent found matching this filter.')).toBeInTheDocument();
  });
});
