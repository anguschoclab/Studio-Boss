import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancialOverviewWidget } from '@/components/dashboard/FinancialOverviewWidget';
import { useGameStore } from '@/store/gameStore';

// Mock Recharts to avoid SVG/JSDOM issues
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="recharts-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  defs: ({ children }: { children: React.ReactNode }) => <defs>{children}</defs>,
  stop: () => <stop />,
  linearGradient: ({ children }: { children: React.ReactNode }) => <linearGradient>{children}</linearGradient>,
  filter: ({ children }: { children: React.ReactNode }) => <filter>{children}</filter>,
  feGaussianBlur: () => <feGaussianBlur />,
  feComposite: () => <feComposite />
}));

// Mock the Chart components to avoid context errors
vi.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content" />,
}));

// Mock the Zustand store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

// Mock formatCurrency for predictable output, but keep `cn` and other utils
vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/utils')>();
  return {
    ...actual,
    formatCurrency: (val: number) => {
      const sign = val < 0 ? '-' : '';
      return `${sign}$${Math.abs(val || 0).toLocaleString()}`;
    }
  };
});

describe('FinancialOverviewWidget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when finance state is null', () => {
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          finance: null,
          history: []
        }
      };
      return selector ? selector(state) : state;
    });

    const { container } = render(<FinancialOverviewWidget />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when history state is null', () => {
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: {
          finance: { cash: 1000 },
          history: null
        }
      };
      return selector ? selector(state) : state;
    });

    const { container } = render(<FinancialOverviewWidget />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with valid cash and history', () => {
    const mockGameState = {
      finance: {
        cash: 25000000,
      },
      history: [
        { week: 1, funds: 20000000 },
        { week: 2, funds: 22000000 },
      ]
    };

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameState: mockGameState,
      };
      return selector ? selector(state) : state;
    });

    render(<FinancialOverviewWidget />);

    // Should display the valuation title
    expect(screen.getByText('Studio Valuation')).toBeDefined();

    // Should display the formatted currency
    expect(screen.getByText('$25,000,000')).toBeDefined();

    // Should display the trend description
    expect(screen.getByText('12-Week Cash Flow Trend')).toBeDefined();

    // Should render the chart container
    expect(screen.getByTestId('chart-container')).toBeDefined();
  });
});
