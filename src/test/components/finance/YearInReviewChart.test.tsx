import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { YearInReviewChart } from '../../../../src/components/finance/YearInReviewChart';
import * as gameStore from '../../../../src/store/gameStore';

// Mock the Zustand store
vi.mock('../../../../src/store/gameStore');

// Provide a basic ResizeObserver mock for Recharts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

describe('YearInReviewChart', () => {
  it('renders initializing state message when ledger is empty', () => {
    vi.spyOn(gameStore, 'useGameStore').mockImplementation((selector: any) => 
      selector({ finance: { ledger: [], cash: 0 } })
    );

    render(<YearInReviewChart />);
    expect(screen.getByText(/Initializing Financial Ledger/i)).toBeInTheDocument();
  });

  it('renders chart data when ledger has entries', () => {
    const mockLedger = [
      { 
        week: 1, 
        year: 2026,
        startingCash: 100,
        endingCash: 110,
        netProfit: 1000000, 
        revenue: { boxOffice: 2000000, distribution: 0, other: 0 }, 
        expenses: { production: 1000000, marketing: 0, overhead: 0 } 
      }
    ];
    vi.spyOn(gameStore, 'useGameStore').mockImplementation((selector: any) => 
      selector({ finance: { ledger: mockLedger, cash: 110 } })
    );

    const { container } = render(<YearInReviewChart />);
    // Verify the Recharts container renders
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
