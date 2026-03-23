import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RivalsPanel } from '@/components/rivals/RivalsPanel';
import { useGameStore } from '@/store/gameStore';
import { ArchetypeKey } from '@/engine/types';

// Mock the game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('RivalsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with an empty rivals list', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => selector({ gameState: { industry: { rivals: [] } } } as any));
    render(<RivalsPanel />);
    expect(screen.getByText('Rival Studios')).toBeInTheDocument();
  });

  it('renders rivals correctly', () => {
    const mockRivals = [
      {
        id: 'r1',
        name: 'Alpha Pictures',
        archetype: 'major' as ArchetypeKey,
        recentActivity: 'Released a blockbuster',
        strength: 80,
        projectCount: 5,
        cash: 1000,
        prestige: 100,
        motto: 'Always winning',
      },
      {
        id: 'r2',
        name: 'Beta Indies',
        archetype: 'indie' as ArchetypeKey,
        recentActivity: 'Won a festival award',
        strength: 30,
        projectCount: 2,
        cash: 50,
        prestige: 60,
        motto: 'Art first',
      },
      {
        id: 'r3',
        name: 'Gamma Mid',
        archetype: 'mid-tier' as ArchetypeKey,
        recentActivity: 'Signed a new director',
        strength: 50,
        projectCount: 3,
        cash: 200,
        prestige: 50,
        motto: 'Middle of the road',
      }
    ];

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => selector({ gameState: { industry: { rivals: mockRivals } } } as any));
    render(<RivalsPanel />);

    // Check text elements
    expect(screen.getByText('Alpha Pictures')).toBeInTheDocument();
    expect(screen.getByText('Major')).toBeInTheDocument(); // split(' ')[0] of 'Major Studio'
    expect(screen.getByText('Released a blockbuster')).toBeInTheDocument();
    expect(screen.getByText('5 proj')).toBeInTheDocument();

    expect(screen.getByText('Beta Indies')).toBeInTheDocument();
    expect(screen.getByText('Indie')).toBeInTheDocument(); // split(' ')[0] of 'Indie Studio'
    expect(screen.getByText('Won a festival award')).toBeInTheDocument();
    expect(screen.getByText('2 proj')).toBeInTheDocument();

    expect(screen.getByText('Gamma Mid')).toBeInTheDocument();
    expect(screen.getByText('Mid-Tier')).toBeInTheDocument(); // split(' ')[0] of 'Mid-Tier Studio'
    expect(screen.getByText('Signed a new director')).toBeInTheDocument();
    expect(screen.getByText('3 proj')).toBeInTheDocument();
  });


  it('applies correct strength styling based on strength value', () => {
    const mockRivals = [
      {
        id: 'r1',
        name: 'Strong Rival',
        archetype: 'major' as ArchetypeKey,
        strength: 75,
        projectCount: 1,
        recentActivity: 'Strong',
        cash: 100,
        prestige: 100,
        motto: '1'
      },
      {
        id: 'r2',
        name: 'Medium Rival',
        archetype: 'mid-tier' as ArchetypeKey,
        strength: 50,
        projectCount: 1,
        recentActivity: 'Medium',
        cash: 100,
        prestige: 100,
        motto: '2'
      },
      {
        id: 'r3',
        name: 'Weak Rival',
        archetype: 'indie' as ArchetypeKey,
        strength: 30,
        projectCount: 1,
        recentActivity: 'Weak',
        cash: 100,
        prestige: 100,
        motto: '3'
      }
    ];

    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => selector({ gameState: { industry: { rivals: mockRivals } } } as any));

    const { container } = render(<RivalsPanel />);

    const strengthBars = container.querySelectorAll('.bg-muted\\/50 .rounded-full.transition-all');
    expect(strengthBars).toHaveLength(3);

    // Strong Rival >= 70
    expect(strengthBars[0].className).toContain('from-primary');

    // Medium Rival >= 45
    expect(strengthBars[1].className).toContain('from-secondary');

    // Weak Rival < 45
    expect(strengthBars[2].className).toContain('from-muted-foreground');
  });

});
