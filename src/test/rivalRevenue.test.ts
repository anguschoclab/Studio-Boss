import { describe, it, expect } from 'vitest';
import { RivalRevenueCalculator } from '@/engine/systems/rivals/RivalRevenueCalculator';
import { RivalStudio } from '@/engine/types';

describe('RivalRevenueCalculator', () => {
  it('calculates zero revenue for studio with no projects', () => {
    const rival: Partial<RivalStudio> = {
      projects: {}
    };
    
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(
      rival as RivalStudio, 1, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any
    );
    
    expect(revenue.total).toBe(0);
    expect(revenue.boxOffice).toBe(0);
    expect(revenue.streaming).toBe(0);
    expect(revenue.merch).toBe(0);
  });
  
  it('calculates annual revenue from history', () => {
    const rival: Partial<RivalStudio> = {
      revenueHistory: [
        { week: 1, revenue: 1000000, boxOffice: 500000, streaming: 300000, merch: 200000 },
        { week: 10, revenue: 2000000, boxOffice: 1000000, streaming: 600000, merch: 400000 },
        { week: 60, revenue: 1500000, boxOffice: 750000, streaming: 450000, merch: 300000 }, // Should be excluded (>52 weeks)
      ]
    };
    
    const annual = RivalRevenueCalculator.calculateAnnualRevenue(rival as RivalStudio, 53);
    
    expect(annual.annualRevenue).toBe(3000000); // Only weeks 1 and 10
    expect(annual.boxOfficeTotal).toBe(1500000); // Only weeks 1 and 10
  });
  
  it('calculates zero annual revenue for studio with no history', () => {
    const rival: Partial<RivalStudio> = {
      revenueHistory: []
    };
    
    const annual = RivalRevenueCalculator.calculateAnnualRevenue(rival as RivalStudio, 10);
    
    expect(annual.annualRevenue).toBe(0);
    expect(annual.boxOfficeTotal).toBe(0);
  });
  
  it('calculates theatrical revenue with decay', () => {
    const rival: Partial<RivalStudio> = {
      projects: {
        'p1': {
          id: 'p1',
          state: 'released',
          distributionStatus: 'theatrical',
          releaseWeek: 1,
          boxOffice: { openingWeekendDomestic: 10000000, openingWeekendForeign: 5000000, totalDomestic: 50000000, totalForeign: 25000000, multiplier: 1.5 },
          reviewScore: 75
        } as any
      }
    };
    
    const state = { entities: { projects: rival.projects } };
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(
      rival as RivalStudio, 2, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any, state as any
    );
    
    expect(revenue.boxOffice).toBeGreaterThan(0);
    expect(revenue.boxOffice).toBeLessThan(10000000); // Should be less than opening weekend due to decay
  });
  
  it('calculates streaming revenue for streaming projects', () => {
    const rival: Partial<RivalStudio> = {
      projects: {
        'p1': {
          id: 'p1',
          state: 'released',
          distributionStatus: 'streaming',
          reviewScore: 80,
          rating: 'TV-MA'
        } as any
      }
    };
    
    const state = { entities: { projects: rival.projects } };
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(
      rival as RivalStudio, 1, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any, state as any
    );
    
    expect(revenue.streaming).toBeGreaterThan(0);
    expect(revenue.boxOffice).toBe(0); // Not theatrical
  });
  
  it('calculates merch revenue for high-buzz projects', () => {
    const rival: Partial<RivalStudio> = {
      projects: {
        'p1': {
          id: 'p1',
          state: 'released',
          buzz: 85,
          franchiseId: 'franchise1',
          rating: 'PG'
        } as any
      }
    };
    
    const state = { entities: { projects: rival.projects } };
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(
      rival as RivalStudio, 1, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any, state as any
    );
    
    expect(revenue.merch).toBeGreaterThan(0);
  });
  
  it('calculates zero merch revenue for low-buzz projects', () => {
    const rival: Partial<RivalStudio> = {
      projects: {
        'p1': {
          id: 'p1',
          state: 'released',
          buzz: 50,
          rating: 'PG-13'
        } as any
      }
    };
    
    const state = { entities: { projects: rival.projects } };
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(
      rival as RivalStudio, 1, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any, state as any
    );
    
    expect(revenue.merch).toBe(0); // Buzz below 70 threshold
  });
  
  it('applies rating premium to streaming revenue', () => {
    const rivalTVMA: Partial<RivalStudio> = {
      projects: {
        'p1': {
          id: 'p1',
          state: 'released',
          distributionStatus: 'streaming',
          reviewScore: 70,
          rating: 'TV-MA'
        } as any
      }
    };
    
    const rivalPG13: Partial<RivalStudio> = {
      projects: {
        'p1': {
          id: 'p1',
          state: 'released',
          distributionStatus: 'streaming',
          reviewScore: 70,
          rating: 'PG-13'
        } as any
      }
    };
    
    const stateTVMA = { entities: { projects: rivalTVMA.projects } };
    const revenueTVMA = RivalRevenueCalculator.calculateWeeklyRevenue(
      rivalTVMA as RivalStudio, 1, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any, stateTVMA as any
    );
    
    const statePG13 = { entities: { projects: rivalPG13.projects } };
    const revenuePG13 = RivalRevenueCalculator.calculateWeeklyRevenue(
      rivalPG13 as RivalStudio, 1, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any, statePG13 as any
    );
    
    expect(revenueTVMA.streaming).toBeGreaterThan(revenuePG13.streaming); // TV-MA has premium
  });
});
