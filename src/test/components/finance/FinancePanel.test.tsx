import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancePanel } from '@/components/finance/FinancePanel';
import { useGameStore } from '@/store/gameStore';

// Mock Recharts to avoid SVG/JSDOM issues
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="recharts-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock the Zustand store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

// Mock formatMoney since it's a utility we don't need to test here directly
vi.mock('@/engine/utils', () => ({
  formatMoney: (val: number) => `$${val.toLocaleString()}`,
}));

// Mock finance calculation functions to return predictable values based on mock data length/properties
vi.mock('@/engine/systems/finance', () => ({
  calculateWeeklyCosts: vi.fn((projects: any[]) => projects.reduce((acc: number, p: any) => acc + (p.weeklyCost || 0), 0)),
  calculateWeeklyRevenue: vi.fn((projects: any[]) => projects.reduce((acc: number, p: any) => acc + (p.weeklyRevenue || 0), 0)),
}));

describe('FinancePanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders gracefully with null/empty game state', () => {
    vi.mocked(useGameStore).mockImplementation((selector) => selector({ gameState: null } as any));

    render(<FinancePanel />);

    // Should render empty states and $0 values
    expect(screen.getByText('Financials')).toBeDefined();
    expect(screen.getByText('$0')).toBeDefined(); // Cash on Hand

    // Revenue and Net Delta both evaluate to "+$0" when they are 0
    const plusZeroElements = screen.getAllByText('+$0');
    expect(plusZeroElements.length).toBe(2); // Weekly Revenue and Net Delta

    // Weekly Costs evaluates to "-$0", but there are two elements with "-$0/wk" and one with "-$0"
    expect(screen.getByText('-$0')).toBeDefined(); // Weekly Costs summary
    expect(screen.getByText('-$0/wk')).toBeDefined(); // Weekly Costs active

    // Should show empty projects message
    expect(screen.getByText('No active projects')).toBeDefined();
  });

  it('renders correctly with positive cash flow and active projects', () => {
    const mockProjects = [
      { id: '1', title: 'Project A', status: 'development', weeklyCost: 50000, weeklyRevenue: 0 },
      { id: '2', title: 'Project B', status: 'production', weeklyCost: 150000, weeklyRevenue: 0 },
      { id: '3', title: 'Project C', status: 'released', weeklyCost: 0, weeklyRevenue: 500000 },
    ];

    const mockGameState = {
      cash: 2500000,
      financeHistory: [
        { id: 'h1', week: 1, type: 'income', amount: 500000, category: 'box_office', cash: 2500000 }
      ],
      projects: mockProjects,
    };

    vi.mocked(useGameStore).mockImplementation((selector) => selector({ gameState: mockGameState } as any));

    render(<FinancePanel />);

    // Check summaries
    expect(screen.getByText('$2,500,000')).toBeDefined(); // Cash on Hand
    expect(screen.getByText('+$500,000')).toBeDefined(); // Weekly Revenue (Project C)
    expect(screen.getByText('-$200,000')).toBeDefined(); // Weekly Costs (Project A + B)
    expect(screen.getByText('+$300,000')).toBeDefined(); // Net Delta

    // Check active projects (only A and B are active 'development' or 'production')
    expect(screen.getByText('Project A')).toBeDefined();
    expect(screen.getByText('-$50,000/wk')).toBeDefined();

    expect(screen.getByText('Project B')).toBeDefined();
    expect(screen.getByText('-$150,000/wk')).toBeDefined();

    // Released project C should not be in the active costs list
    expect(screen.queryByText('Project C')).toBeNull();
  });

  it('renders correctly with negative cash flow and negative cash', () => {
    const mockProjects = [
      { id: '1', title: 'Money Pit', status: 'production', weeklyCost: 1000000, weeklyRevenue: 0 },
    ];

    const mockGameState = {
      cash: -500000,
      financeHistory: [],
      projects: mockProjects,
    };

    vi.mocked(useGameStore).mockImplementation((selector) => selector({ gameState: mockGameState } as any));

    render(<FinancePanel />);

    // Cash on hand should be negative
    expect(screen.getByText('$-500,000')).toBeDefined();

    // Revenue is 0 (and Net Delta is negative, so it doesn't have a +)
    expect(screen.getByText('+$0')).toBeDefined();

    // Costs are 1M
    expect(screen.getByText('-$1,000,000')).toBeDefined();

    // Net Delta is negative
    expect(screen.getByText('$-1,000,000')).toBeDefined();
  });
});
