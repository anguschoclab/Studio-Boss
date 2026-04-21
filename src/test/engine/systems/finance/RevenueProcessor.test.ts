import { describe, it, expect } from 'vitest';
import { RevenueProcessor } from '../../../../engine/systems/finance/RevenueProcessor';
import { Project, Buyer } from '../../../../engine/types';

describe('RevenueProcessor', () => {
  describe('calculateStreamingRevenue', () => {
    it('should calculate $20,000 for a quality 100 project on a 10% market share platform', () => {
      const mockProject = { reviewScore: 100 } as Project;
      const mockPlatform = { marketShare: 0.10 } as Buyer;
      
      const revenue = RevenueProcessor.calculateStreamingRevenue(mockProject, mockPlatform);
      expect(revenue).toBe(20000);
    });

    it('should scale revenue based on quality', () => {
      const mockProject = { reviewScore: 50 } as Project;
      const mockPlatform = { marketShare: 0.10 } as Buyer;
      
      const revenue = RevenueProcessor.calculateStreamingRevenue(mockProject, mockPlatform);
      expect(revenue).toBe(10000);
    });

    it('should scale revenue based on market share', () => {
      const mockProject = { reviewScore: 100 } as Project;
      const mockPlatform = { marketShare: 0.20 } as Buyer;
      
      const revenue = RevenueProcessor.calculateStreamingRevenue(mockProject, mockPlatform);
      expect(revenue).toBe(40000);
    });
  });

  describe('calculateTheatricalDecay', () => {
    it('should reduce revenue by 50% when decay rate is 0.5', () => {
      const revenue = RevenueProcessor.calculateTheatricalDecay(1000000, 0.5);
      expect(revenue).toBe(500000);
    });

    it('should reduce revenue by 75% over two weeks with 0.5 decay', () => {
      const week1 = 1000000;
      const week2 = RevenueProcessor.calculateTheatricalDecay(week1, 0.5);
      const week3 = RevenueProcessor.calculateTheatricalDecay(week2, 0.5);
      
      expect(week2).toBe(500000);
      expect(week3).toBe(250000);
    });
  });

  describe('calculateMerchRevenue', () => {
    it('should return 0 when hype is below 70', () => {
      const revenue = RevenueProcessor.calculateMerchRevenue(60, 80);
      expect(revenue).toBe(0);
    });

    it('should return non-zero passive revenue when hype is high', () => {
      const revenue = RevenueProcessor.calculateMerchRevenue(90, 80);
      expect(revenue).toBeGreaterThan(0);
    });
  });
});
