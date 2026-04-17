import React from 'react';
import { render, screen, cleanup, within } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { MerchandiseRevenuePanel } from '@/components/ip/MerchandiseRevenuePanel';

describe('MerchandiseRevenuePanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders summary cards with correct data', () => {
    const merchandiseData = {
      byCategory: [],
      byFranchise: [],
      totalRevenue: 10000000,
      totalUnits: 50000,
    };

    render(<MerchandiseRevenuePanel merchandiseData={merchandiseData} />);
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$10,000,000')).toBeInTheDocument();
    expect(screen.getByText('Units Sold')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
    expect(screen.getByText('Avg per Unit')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('renders category breakdown', () => {
    const merchandiseData = {
      byCategory: [
        {
          category: 'Apparel',
          revenue: 3000000,
          units: 15000,
          growth: 10,
        },
        {
          category: 'Toys',
          revenue: 2000000,
          units: 10000,
          growth: -5,
        },
      ],
      byFranchise: [],
      totalRevenue: 5000000,
      totalUnits: 25000,
    };

    render(<MerchandiseRevenuePanel merchandiseData={merchandiseData} />);
    
    expect(screen.getByText('Apparel')).toBeInTheDocument();
    expect(screen.getByText('Toys')).toBeInTheDocument();
    expect(screen.getByText('$3,000,000')).toBeInTheDocument();
    expect(screen.getByText('$2,000,000')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('renders franchise merchandise data', () => {
    const { container } = render(
      <MerchandiseRevenuePanel merchandiseData={{
        byCategory: [],
        byFranchise: [
          {
            franchiseId: '1',
            franchiseName: 'Space Saga',
            totalRevenue: 5000000,
            topCategory: 'Apparel',
            tier: 'gold' as const,
          },
        ],
        totalRevenue: 5000000,
        totalUnits: 25000,
      }} />
    );

    const { getAllByText } = within(container);

    expect(getAllByText('Space Saga').length).toBeGreaterThan(0);
    expect(getAllByText('Top: Apparel').length).toBeGreaterThan(0);
    expect(getAllByText('$5,000,000').length).toBeGreaterThan(0);
  });

  it('shows empty states when no data', () => {
    const merchandiseData = {
      byCategory: [],
      byFranchise: [],
      totalRevenue: 0,
      totalUnits: 0,
    };

    render(<MerchandiseRevenuePanel merchandiseData={merchandiseData} />);
    
    expect(screen.getByText('No merchandise data available')).toBeInTheDocument();
    expect(screen.getByText('No franchise merchandise data')).toBeInTheDocument();
  });
});
