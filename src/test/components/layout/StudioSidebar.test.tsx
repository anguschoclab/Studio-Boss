import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudioSidebar } from '@/components/layout/StudioSidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock recharts
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: any) => <div data-testid="mock-responsive-container">{children}</div>,
    LineChart: ({ children }: any) => <div data-testid="mock-line-chart">{children}</div>,
    Line: () => <div data-testid="mock-line" />
  };
});

// Mock Zustand stores
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn()
}));

vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn()
}));

// Mock icons
vi.mock('lucide-react', () => {
  return {
    LayoutDashboard: () => <div data-testid="icon" />,
    Film: () => <div data-testid="icon" />,
    Library: () => <div data-testid="icon" />,
    Globe: () => <div data-testid="icon" />,
    Users: () => <div data-testid="icon" />,
    Briefcase: () => <div data-testid="icon" />,
    Newspaper: () => <div data-testid="icon" />,
    Building2: () => <div data-testid="icon" />,
    ChevronLeft: () => <div data-testid="icon" />,
    ChevronRight: () => <div data-testid="icon" />,
    LogOut: () => <div data-testid="icon" />,
    Settings: () => <div data-testid="icon" />,
    DollarSign: () => <div data-testid="icon" />,
    Star: () => <div data-testid="icon" />,
    Clapperboard: () => <div data-testid="icon" />
  };
});

// Setup router for the component
const rootRoute = createRootRoute({
  component: () => <StudioSidebar />
});
const router = createRouter({ routeTree: rootRoute });

const renderSidebar = () => {
  return render(<TooltipProvider><RouterProvider router={router} /></TooltipProvider>);
};

describe('StudioSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    (useUIStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({ activeTab: 'command', setActiveTab: vi.fn() });
      }
      return { activeTab: 'command', setActiveTab: vi.fn() };
    });
  });

  it('renders without crashing when no game state', () => {
    (useGameStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({ gameState: null, clearGame: vi.fn() });
      }
      return { gameState: null, clearGame: vi.fn() };
    });

    const { container } = renderSidebar();
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with basic game state', () => {
    (useGameStore as any).mockImplementation((selector: any) => {
      const mockState = {
        gameState: {
          finance: { cash: 1000000 },
          studio: { prestige: 10, internal: { projects: {} } }
        },
        clearGame: vi.fn()
      };
      if (typeof selector === 'function') {
        return selector(mockState);
      }
      return mockState;
    });

    renderSidebar();
    expect(screen.getByText('BOSS')).toBeDefined();
    expect(screen.getByText('Cash')).toBeDefined();
    expect(screen.queryByTestId('mock-line-chart')).toBeNull();
  });

  it('renders sparkline when historical financial data is present', async () => {
    (useGameStore as any).mockImplementation((selector: any) => {
      const mockState = {
        gameState: {
          finance: {
            cash: 1000000,
            weeklyHistory: [
              { week: 1, cash: 500000 },
              { week: 2, cash: 750000 },
              { week: 3, cash: 1000000 },
            ]
          },
          studio: { prestige: 10, internal: { projects: {} } }
        },
        clearGame: vi.fn()
      };
      if (typeof selector === 'function') {
        return selector(mockState);
      }
      return mockState;
    });

    renderSidebar();
    expect(await screen.findByTestId('mock-responsive-container')).toBeDefined();
    expect(screen.getByTestId('mock-line-chart')).toBeDefined();
    expect(screen.getByTestId('mock-line')).toBeDefined();
  });
});
