import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancePanel } from '@/components/finance/FinancePanel';
import { useGameStore } from '@/store/gameStore';

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
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
  Cell: () => <div data-testid="cell" />,
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
  calculateWeeklyCosts: vi.fn((projects: any[]) => projects.reduce((acc: number, p: any) => acc + (p.weeklyCost || 0), 0)),
  calculateWeeklyRevenue: vi.fn((projects: any[]) => projects.reduce((acc: number, p: any) => acc + (p.weeklyRevenue || 0), 0)),
  calculateStudioNetWorth: vi.fn(() => 10000000),
  generateCashflowForecast: vi.fn(() => []),
  calculateProjectROI: vi.fn(() => 1.5)
}));

describe('FinancePanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const generateMockProject = (id: string, state: string, cost: number, rev: number) => ({
      id, title: `Project ${id}`, state, weeklyCost: cost, weeklyRevenue: rev, budget: 1000000
  });

  it('renders gracefully with null/empty game state', () => {
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      if (!selector) return { snapshots: [] };
      return selector({ gameState: null, snapshots: [] } as any)
    });

    render(<FinancePanel />);

    expect(screen.getByText((content) => content.includes('FISCAL INTELLIGENCE') || content.includes('FISCAL'))).toBeDefined();
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
          weeklyHistory: [],
          ledger: [],
      },
      studio: {
        internal: {
          projects: mockProjects,
        }
      }
    };

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      if (!selector) return { snapshots: [] };
      return selector({ gameState: mockGameState, snapshots: [] } as any)
    });

    render(<FinancePanel />);

    expect(screen.getByText((content) => content.includes('FISCAL INTELLIGENCE') || content.includes('FISCAL'))).toBeDefined();
  });

  it('renders correctly with negative cash flow and negative cash', () => {
    const mockProjects = {
      '1': generateMockProject('Pit', 'production', 1000000, 0),
    };

    const mockGameState = {
      finance: {
          cash: -500000,
          weeklyHistory: [],
          ledger: [],
      },
      studio: {
        internal: {
          projects: mockProjects,
        }
      }
    };

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      if (!selector) return { snapshots: [] };
      return selector({ gameState: mockGameState, snapshots: [] } as any)
    });

    render(<FinancePanel />);

    expect(screen.getByText((content) => content.includes('FISCAL INTELLIGENCE') || content.includes('FISCAL'))).toBeDefined();
  });
});
