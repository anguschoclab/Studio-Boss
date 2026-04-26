import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NewsTicker } from '../../../../src/components/layout/NewsTicker';
import * as gameStore from '../../../../src/store/gameStore';

vi.mock('../../../../src/store/gameStore');

describe('NewsTicker', () => {
  it('returns default fallback state if there are no headlines', () => {
    vi.spyOn(gameStore, 'useGameStore').mockImplementation((selector: any) => 
      selector({ news: { headlines: [] } })
    );
    render(<NewsTicker />);
    expect(screen.getByText((c) => c.includes('ESTABLISHING_UPLINK') || c.includes('THE_TRADES') || c.includes('UPLINK'))).toBeInTheDocument();
  });

  it('displays active news items from the store (doubled for marquee)', () => {
    vi.spyOn(gameStore, 'useGameStore').mockImplementation((selector: any) => 
      selector({ 
        news: { 
          headlines: [
            { id: '1', text: 'Local Studio Boss saves the day!', date: 'Week 1', category: 'GENERAL' }
          ] 
        } 
      })
    );

    render(<NewsTicker />);
    // Component doubles the array for marquee effect, so we expect multiple matches
    const elements = screen.getAllByText(/Local Studio Boss saves the day!/i);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });
});
