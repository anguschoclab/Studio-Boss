import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DemographicsWidget } from '@/components/dashboard/DemographicsWidget';

// In vitest we have to import vi from vitest, and then call vi.mock

vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    BarChart: ({ data, children }: any) => (
      <div data-testid="mock-barchart">
        {data?.map((d: any, i: number) => (
          <div key={i} data-testid={`mock-bar-${i}`} data-genre={d.genre} data-popularity={d.popularity}>
            {d.genre}: {d.popularity}
          </div>
        ))}
        {children}
      </div>
    ),
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Cell: () => null,
    ChartTooltip: () => null,
  };
});

vi.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}));

const mockUseGameStore = vi.fn();
vi.mock('@/store/gameStore', () => ({
  useGameStore: (selector: any) => mockUseGameStore(selector),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: (fn: any) => fn,
}));

describe('DemographicsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders null when culture state is missing', () => {
    mockUseGameStore.mockReturnValue(undefined);
    const { container } = render(<DemographicsWidget />);
    expect(container.firstChild).toBeNull();
  });

  it('renders component correctly and transforms data when culture state exists', () => {
    const mockCulture = {
      genrePopularity: {
        action: 0.85,
        comedy: 0.45,
        drama: 0.65,
        horror: 0.95,
        scifi: 0.35,
        romance: 0.25,
      },
    };

    mockUseGameStore.mockImplementation((selector: any) => {
      return selector({ gameState: { culture: mockCulture } });
    });

    render(<DemographicsWidget />);

    expect(screen.getByText('Audience Trends')).toBeInTheDocument();

    const chart = screen.getByTestId('mock-barchart');
    expect(chart).toBeInTheDocument();

    expect(screen.getByTestId('mock-bar-0')).toHaveAttribute('data-genre', 'Horror');
    expect(screen.getByTestId('mock-bar-0')).toHaveAttribute('data-popularity', '95');

    expect(screen.getByTestId('mock-bar-1')).toHaveAttribute('data-genre', 'Action');
    expect(screen.getByTestId('mock-bar-1')).toHaveAttribute('data-popularity', '85');

    expect(screen.getByTestId('mock-bar-4')).toHaveAttribute('data-genre', 'Scifi');
    expect(screen.getByTestId('mock-bar-4')).toHaveAttribute('data-popularity', '35');

    expect(screen.queryByTestId('mock-bar-5')).toBeNull();
  });
});
