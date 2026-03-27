import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscoveryBoard } from '../../../components/discovery/DiscoveryBoard';
import { useGameStore } from '../../../store/gameStore';
import { useUIStore } from '../../../store/uiStore';
import { Opportunity } from '../../../engine/types';

vi.mock('../../../store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

vi.mock('../../../store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('DiscoveryBoard', () => {
  const mockOpenCreateProject = vi.fn();
  const mockAcquireOpportunity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      openCreateProject: mockOpenCreateProject,
    });
  });

  it('renders empty state when there are no opportunities', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      if (typeof selector === 'function') {
        return selector({ 
          gameState: { 
            market: { opportunities: [], trends: [] },
            industry: { newsHistory: [] } 
          } 
        });
      }
      return { acquireOpportunity: mockAcquireOpportunity };
    });

    render(<DiscoveryBoard />);

    expect(screen.getByText('Discovery Market')).toBeDefined();
    expect(screen.getByText('The town is quiet. No active scripts or pitches.')).toBeDefined();
  });

  it('calls openCreateProject when Create Original button is clicked', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      if (typeof selector === 'function') {
        return selector({ 
          gameState: { 
            market: { opportunities: [], trends: [] },
            industry: { newsHistory: [] } 
          } 
        });
      }
      return { acquireOpportunity: mockAcquireOpportunity };
    });

    render(<DiscoveryBoard />);

    const createButton = screen.getByText('Create Original');
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
        costToAcquire: 0
      },
      {
        id: '2',
        title: 'Comedy Show',
        type: 'pitch',
        genre: 'Comedy',
        format: 'tv',
        budgetTier: 'low',
        flavor: 'Laugh out loud.',
        weeksUntilExpiry: 3,
        targetAudience: 'Niche',
        qualityBonus: 0,
        origin: 'agency_package',
        costToAcquire: 10000
      },
    ];

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      if (typeof selector === 'function') {
        return selector({ 
          gameState: { 
            market: { opportunities: mockOpportunities, trends: [] },
            industry: { newsHistory: [] }
          } 
        });
      }
      return { acquireOpportunity: mockAcquireOpportunity };
    });

    render(<DiscoveryBoard />);

    expect(screen.getByText('Action Movie')).toBeDefined();
    expect(screen.getByText('Comedy Show')).toBeDefined();
    // Updated to match actual component case
    expect(screen.getByText(/Action/i)).toBeDefined();
    expect(screen.getByText(/FILM/i)).toBeDefined();
    expect(screen.getAllByText(/BUDGET/i)).toBeDefined();
    expect(screen.getByText('"Explosions everywhere."')).toBeDefined();
    expect(screen.getByText('"Laugh out loud."')).toBeDefined();
    expect(screen.getByText('5 weeks left')).toBeDefined();
    expect(screen.getByText('3 weeks left')).toBeDefined();
  });

  it('calls acquireOpportunity when Acquire button is clicked on a card', () => {
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
        costToAcquire: 0
      },
    ];

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      if (typeof selector === 'function') {
        return selector({ 
          gameState: { 
            market: { opportunities: mockOpportunities, trends: [] },
            industry: { newsHistory: [] }
          } 
        });
      }
      return { acquireOpportunity: mockAcquireOpportunity };
    });

    render(<DiscoveryBoard />);

    const acquireButton = screen.getByText('Acquire');
    fireEvent.click(acquireButton);

    expect(mockAcquireOpportunity).toHaveBeenCalledWith('opp-123');
  });
});
