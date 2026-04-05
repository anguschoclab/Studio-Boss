import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelevisionDashboard } from '@/components/pipeline/TelevisionDashboard';
import { useGameStore } from '@/store/gameStore';
import { Project, SeriesProject } from '@/engine/types';

vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Tv: () => <div data-testid="icon-tv" />,
  Activity: () => <div data-testid="icon-activity" />,
  Star: () => <div data-testid="icon-star" />,
  AlertCircle: () => <div data-testid="icon-alert" />,
  PlayCircle: () => <div data-testid="icon-play" />,
  Zap: () => <div data-testid="icon-zap" />,
  BarChart3: () => <div data-testid="icon-barchart" />,
  Users: () => <div data-testid="icon-users" />,
  TrendingUp: () => <div data-testid="icon-trendingup" />,
  TrendingDown: () => <div data-testid="icon-trendingdown" />,
  Minus: () => <div data-testid="icon-minus" />
}));

describe('TelevisionDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when there are no active series', () => {
    vi.mocked(useGameStore).mockReturnValue([]);
    render(<TelevisionDashboard />);

    expect(screen.getByText('No Active Series')).toBeInTheDocument();
    expect(screen.getByText('The small screen is currently dark.')).toBeInTheDocument();
  });

  it('renders series projects correctly', () => {
    const mockShows: Project[] = [
      {
        id: '1',
        title: 'Mock TV Show 1',
        type: 'SERIES',
        format: 'series',
        buzz: 75,
        reviewScore: 8.5,
        productionWeeks: 10,
        tvDetails: {
          status: 'ON_AIR',
          currentSeason: 2,
          episodesOrdered: 10,
          episodesAired: 5,
          averageRating: 8.5,
          viewership: 2000000
        }
      } as unknown as SeriesProject
    ];

    vi.mocked(useGameStore).mockReturnValue(mockShows);
    render(<TelevisionDashboard />);

    expect(screen.getByText('TV Empire Status')).toBeInTheDocument();
    expect(screen.getByText('Mock TV Show 1')).toBeInTheDocument();
    expect(screen.getByText('ON AIR')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL DARLING')).toBeInTheDocument();
    expect(screen.getByText('Currently Airing')).toBeInTheDocument();
  });

  it('does not render non-series projects', () => {
    const mockShows: Project[] = [
      {
        id: '1',
        title: 'Mock Movie 1',
        type: 'FILM',
        format: 'film',
        buzz: 75,
        reviewScore: 8.5,
        productionWeeks: 10,
      } as unknown as Project
    ];

    vi.mocked(useGameStore).mockReturnValue(mockShows);
    render(<TelevisionDashboard />);

    expect(screen.getByText('No Active Series')).toBeInTheDocument();
  });
});
