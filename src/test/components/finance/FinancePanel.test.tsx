import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancePanel } from '@/components/finance/FinancePanel';
import { useGameStore } from '@/store/gameStore';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Recharts to avoid SVG/JSDOM issues
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="recharts-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div data-testid="composed-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  LinearGradient: ({ children }: { children: React.ReactNode }) => <div data-testid="linear-gradient">{children}</div>,
  defs: ({ children }: { children: React.ReactNode }) => <defs>{children}</defs>,
  stop: () => <stop />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Label: () => <div data-testid="label" />,
}));

// Mock the Zustand store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

// Mock formatMoney for predictable output in tests
vi.mock('@/engine/utils', () => ({
  formatMoney: (val: number) => {
      const sign = val < 0 ? '-' : '';
      return `${sign}$${Math.abs(val || 0).toLocaleString()}`;
  }
}));

// Mock finance calculation functions
vi.mock('@/engine/systems/finance', () => ({
  calculateWeeklyCosts: vi.fn((state: any) => {
    const projects = state?.entities?.projects ? Object.values(state.entities.projects) : [];
    return projects.reduce((acc: number, p: any) => acc + (p.weeklyCost || 0), 0);
  }),
  calculateWeeklyRevenue: vi.fn((state: any) => {
    const projects = state?.entities?.projects ? Object.values(state.entities.projects) : [];
    return projects.reduce((acc: number, p: any) => acc + (p.weeklyRevenue || 0), 0);
  }),
  calculateStudioNetWorth: vi.fn(() => 10000000),
  generateCashflowForecast: vi.fn(() => []),
  calculateProjectROI: vi.fn(() => 1.5)
}));

describe('FinancePanel Component', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const generateMockProject = (id: string, state: string, cost: number, rev: number) => ({
      id, title: `Project ${id}`, state, weeklyCost: cost, weeklyRevenue: rev, budget: 1000000
  });

  const mockMarketState = {
    baseRate: 0.05,
    savingsYield: 0.03,
    debtRate: 0.08,
    inflation: 0.02,
    consumerConfidence: 0.8,
    rateHistory: [{ week: 1, rate: 0.05 }, { week: 2, rate: 0.05 }]
  };

  it('renders gracefully with null/empty game state', () => {
    const mockGameState = {
      finance: {
        cash: 0,
        ledger: [],
        marketState: mockMarketState,
      },
      studio: { internal: { projects: {} } },
      entities: { projects: {} }
    } as any;

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = { 
        gameState: mockGameState, 
        finance: mockGameState.finance,
        snapshots: [] 
      };
      return selector ? selector(state) : state;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider><FinancePanel /></TooltipProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('Financials & Forecasts')).toBeDefined();
    expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
  });

  it('renders correctly with positive cash flow and active projects', () => {
    const mockProjects = {
      '1': generateMockProject('A', 'development', 50000, 0),
      '2': generateMockProject('B', 'production', 150000, 0),
      '3': generateMockProject('C', 'released', 0, 500000),
    };

    const mockGameState = {
      finance: {
          cash: 2500000,
          marketState: mockMarketState,
          ledger: [
            { id: 'h1', week: 1, type: 'income', amount: 500000, category: 'box_office', endingCash: 2500000, revenue: { boxOffice: 500000, distribution: 0, other: 0 }, expenses: { production: 0, marketing: 0, overhead: 0 } }
          ],
      },
      studio: {
        internal: {
          projects: mockProjects,
        }
      },
      entities: {
        projects: mockProjects
      }
    };

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = { 
        gameState: mockGameState, 
        finance: (mockGameState as any).finance,
        snapshots: [] 
      };
      return selector ? selector(state) : state;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider><FinancePanel /></TooltipProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('$2,500,000')).toBeDefined();
    expect(screen.getAllByText(/\$200,000/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\+\$300,000/).length).toBeGreaterThan(0);
  });

  it('renders correctly with negative cash flow and negative cash', () => {
    const mockProjects = {
      '1': generateMockProject('Pit', 'production', 1000000, 0),
    };

    const mockGameState = {
      finance: {
          cash: -500000,
          marketState: { ...mockMarketState, baseRate: 0.1 },
          ledger: [],
      },
      studio: {
        internal: {
          projects: mockProjects,
        }
      },
      entities: {
        projects: mockProjects
      }
    } as any;

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = { 
        gameState: mockGameState, 
        finance: mockGameState.finance,
        snapshots: [] 
      };
      return selector ? selector(state) : state;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider><FinancePanel /></TooltipProvider>
      </QueryClientProvider>
    );

    // Cash on hand should be negative
    expect(screen.getByText('-$500,000')).toBeDefined();
    // Revenue is 0
    expect(screen.getByText('$0')).toBeDefined();
    // Costs are 1M
    expect(screen.getAllByText('-$1,000,000/wk').length).toBeGreaterThan(0);
  });
});
