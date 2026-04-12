import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SyndicationRevenuePanel } from '@/components/distribution/SyndicationRevenuePanel';

describe('SyndicationRevenuePanel', () => {
  it('renders summary cards with correct data', () => {
    const syndicationData = {
      byRegion: [],
      totalRevenue: 5000000,
      totalDeals: 12,
      topPerformingRegion: 'Europe',
    };

    render(<SyndicationRevenuePanel syndicationData={syndicationData} />);
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$5.0M')).toBeInTheDocument();
    expect(screen.getByText('Active Deals')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Top Region')).toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();
  });

  it('renders regional breakdown', () => {
    const syndicationData = {
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
    };

    render(<SyndicationRevenuePanel syndicationData={syndicationData} />);
    
    expect(screen.getByText('Asia Pacific')).toBeInTheDocument();
    expect(screen.getByText('Latin America')).toBeInTheDocument();
    expect(screen.getByText('$2.0M')).toBeInTheDocument();
    expect(screen.getByText('$1.5M')).toBeInTheDocument();
    expect(screen.getByText('5 deals')).toBeInTheDocument();
  });

  it('shows empty state when no syndication data', () => {
    const syndicationData = {
      byRegion: [],
      totalRevenue: 0,
      totalDeals: 0,
      topPerformingRegion: '',
    };

    render(<SyndicationRevenuePanel syndicationData={syndicationData} />);
    
    expect(screen.getByText('No syndication deals active')).toBeInTheDocument();
  });
});
