import React from 'react';
import { render, screen, cleanup, within } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { SyndicationRevenuePanel } from '@/components/distribution/SyndicationRevenuePanel';

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

    expect(screen.getByText('TOTAL_REVENUE')).toBeInTheDocument();
    expect(screen.getByText('$5.0M')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE_DEALS')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('TOP_PERFORMING_REGION')).toBeInTheDocument();
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
    expect(getAllByText('5_ACTIVE_UNITS').length).toBeGreaterThan(0);
  });

  it('shows empty state when no syndication data', () => {
    const syndicationData = {
      byRegion: [],
      totalRevenue: 0,
      totalDeals: 0,
      topPerformingRegion: '',
    };

    render(<SyndicationRevenuePanel syndicationData={syndicationData} />);

    expect(screen.getByText('NO_SYNDICATION_DEALS_ACTIVE_IN_BUFFER')).toBeInTheDocument();
  });
});
