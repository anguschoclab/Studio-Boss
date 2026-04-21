import { describe, it, expect } from 'vitest';
import { ExpenseProcessor } from '../../../../engine/systems/finance/ExpenseProcessor';
import { Project } from '../../../../engine/types';

describe('ExpenseProcessor', () => {
  describe('calculateStudioBurn', () => {
    it('should calculate $1.25M for studio level 1 with 0 active projects', () => {
      const burn = ExpenseProcessor.calculateStudioBurn(1, 0);
      expect(burn).toBe(750000); // 500k + (1 * 250k) + (0 * 50k)
    });

    it('should calculate $1.45M for studio level 3 with 4 active projects', () => {
      const burn = ExpenseProcessor.calculateStudioBurn(3, 4);
      expect(burn).toBe(500000 + (3 * 250000) + (4 * 50000));
    });
    
    it('should exceed base rent for higher levels', () => {
      const level3Burn = ExpenseProcessor.calculateStudioBurn(3, 0);
      expect(level3Burn).toBeGreaterThan(500000); 
    });
  });

  describe('calculateMarketingBurn', () => {
    it('should return 0 for no active marketing campaigns', () => {
      const mockProjects = [
        { state: 'production' } as Project
      ];
      const burn = ExpenseProcessor.calculateMarketingBurn(mockProjects);
      expect(burn).toBe(0);
    });

    it('should correctly deduct from cash per tick for active marketing', () => {
      const mockProjects = [
        { state: 'marketing', marketingBudget: 300000 } as Project
      ];
      const burn = ExpenseProcessor.calculateMarketingBurn(mockProjects);
      expect(burn).toBe(50000); // 300k / 6
    });
  });
});
