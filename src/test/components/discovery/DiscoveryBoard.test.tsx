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
        return selector({ gameState: { opportunities: [] } });
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
        return selector({ gameState: { opportunities: [] } });
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
        genre: 'action',
        format: 'feature',
        budgetTier: 'high',
        flavor: 'Explosions everywhere.',
        weeksUntilExpiry: 5,
        targetAudience: 'broad',
        complexity: 3,
        qualityBonus: 0
      },
      {
        id: '2',
        title: 'Comedy Show',
        type: 'pitch',
        genre: 'comedy',
        format: 'series',
        budgetTier: 'low',
        flavor: 'Laugh out loud.',
        weeksUntilExpiry: 3,
        targetAudience: 'niche',
        complexity: 1,
        qualityBonus: 0
      },
    ];

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      if (typeof selector === 'function') {
        return selector({ gameState: { opportunities: mockOpportunities } });
      }
      return { acquireOpportunity: mockAcquireOpportunity };
    });

    render(<DiscoveryBoard />);

    expect(screen.getByText('Action Movie')).toBeDefined();
    expect(screen.getByText('Comedy Show')).toBeDefined();
    expect(screen.getByText('action • FEATURE • high budget')).toBeDefined();
    expect(screen.getByText('comedy • SERIES • low budget')).toBeDefined();
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
        genre: 'drama',
        format: 'feature',
        budgetTier: 'medium',
        flavor: 'Tearjerker.',
        weeksUntilExpiry: 4,
        targetAudience: 'broad',
        complexity: 2,
        qualityBonus: 0
      },
    ];

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      if (typeof selector === 'function') {
        return selector({ gameState: { opportunities: mockOpportunities } });
      }
      return { acquireOpportunity: mockAcquireOpportunity };
    });

    render(<DiscoveryBoard />);

    const acquireButton = screen.getByText('Acquire');
    fireEvent.click(acquireButton);

    expect(mockAcquireOpportunity).toHaveBeenCalledWith('opp-123');
  });
});
