import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RivalsPanel } from '@/components/rivals/RivalsPanel';
import { useGameStore } from '@/store/gameStore';
import { ArchetypeKey } from '@/engine/types';
import { TooltipProvider } from '@/components/ui/tooltip';

describe('RivalsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      gameState: {
        entities: {
          rivals: {},
          projects: {},
          talents: {},
          contracts: {}
        }
      }
    } as any);
  });

  it('renders correctly with an empty rivals list', () => {
    render(<TooltipProvider><RivalsPanel /></TooltipProvider>);
    expect(screen.getByText('Competitive Landscape')).toBeInTheDocument();
  });

  const generateMockRivalsMap = (rivals: any[]) => {
    return rivals.reduce((acc, r) => {
      acc[r.id] = r;
      return acc;
    }, {} as Record<string, any>);
  };

  it('renders rivals correctly', () => {
    const mockRivalsArray = [
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

    useGameStore.setState({
      gameState: {
        entities: {
          rivals: generateMockRivalsMap(mockRivalsArray),
          projects: {},
          talents: {},
          contracts: {}
        }
      }
    } as any);
    render(<TooltipProvider><RivalsPanel /></TooltipProvider>);

    // Check text elements
    expect(screen.getByText('Alpha Pictures')).toBeInTheDocument();
    expect(screen.getByText(/MAJOR/i)).toBeInTheDocument();
    expect(screen.getByText('Released a blockbuster')).toBeInTheDocument();
    
    expect(screen.getByText('Beta Indies')).toBeInTheDocument();
    expect(screen.getByText(/INDIE/i)).toBeInTheDocument();
    expect(screen.getByText('Won a festival award')).toBeInTheDocument();

    expect(screen.getByText('Gamma Mid')).toBeInTheDocument();
    expect(screen.getByText(/MID-TIER/i)).toBeInTheDocument();
    expect(screen.getByText('Signed a new director')).toBeInTheDocument();
  });


  it('applies correct strength styling based on strength value', () => {
    const mockRivalsArray = [
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

    useGameStore.setState({
      gameState: {
        entities: {
          rivals: generateMockRivalsMap(mockRivalsArray),
          projects: {},
          talents: {},
          contracts: {}
        }
      }
    } as any);

    const { container } = render(<TooltipProvider><RivalsPanel /></TooltipProvider>);

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
