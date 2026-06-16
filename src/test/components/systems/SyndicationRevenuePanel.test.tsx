import React from 'react';
import { render, screen, cleanup, within } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { SyndicationRevenuePanel } from '@/components/distribution/SyndicationRevenuePanel';

// Mock recharts to avoid SVG/JSDOM issues
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="recharts-container">{children}</div>,
  Label: () => <div data-testid="label" />,
}));

describe('SyndicationRevenuePanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders summary cards with correct data', () => {
    const syndicationData = {
      byRegion: [],
      totalRevenue: 5000000,
      totalDeals: 12,
      topPerformingRegion: 'Europe',
    };

    render(<SyndicationRevenuePanel syndicationData={syndicationData} />);

    expect(screen.getByText((c) => c.includes('TOTAL REVENUE') || c.includes('Total Revenue'))).toBeInTheDocument();
    expect(screen.getByText('$5.0M')).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('ACTIVE DEALS') || c.includes('Active Deals'))).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('TOP PERFORMING REGION') || c.includes('Top Region'))).toBeInTheDocument();
    expect(screen.getByText('EUROPE')).toBeInTheDocument();
  });

  it('renders regional breakdown', () => {
    const { container } = render(
      <SyndicationRevenuePanel syndicationData={{
        byRegion: [
          {
            region: 'Asia Pacific',
            revenue: 2000000,
            deals: 5,
            trend: 'up' as const,
            growth: 15,
          },
          {
            region: 'Latin America',
            revenue: 1500000,
            deals: 4,
            trend: 'stable' as const,
            growth: 0,
          },
        ],
        totalRevenue: 3500000,
        totalDeals: 9,
        topPerformingRegion: 'Asia Pacific',
      }} />
    );

    const { getAllByText } = within(container);

    expect(getAllByText('Asia Pacific').length).toBeGreaterThan(0);
    expect(getAllByText('Latin America').length).toBeGreaterThan(0);
    expect(getAllByText('$2.0M').length).toBeGreaterThan(0);
    expect(getAllByText('$1.5M').length).toBeGreaterThan(0);
    expect(getAllByText('5 ACTIVE UNITS').length).toBeGreaterThan(0);
  });

  it('shows empty state when no syndication data', () => {
    const syndicationData = {
      byRegion: [],
      totalRevenue: 0,
      totalDeals: 0,
      topPerformingRegion: '',
    };

    render(<SyndicationRevenuePanel syndicationData={syndicationData} />);

    expect(screen.getByText((c) => c.includes('NO') && c.includes('SYNDICATION') || c.includes('No syndication'))).toBeInTheDocument();
  });
});
