import { describe, it, expect } from 'vitest';
import { ExpenseProcessor } from '../../../../engine/systems/finance/ExpenseProcessor';
import { Project } from '../../../../engine/types';

describe('ExpenseProcessor', () => {
  describe('calculateStudioBurn', () => {
    it('should calculate $500k for studio level 1 with 0 active projects', () => {
      const burn = ExpenseProcessor.calculateStudioBurn(1, 0);
      expect(burn).toBe(500000); // Base rent * 1.25^0 + 0
    });

    it('should calculate $1.3625M for studio level 3 with 4 active projects', () => {
      const burn = ExpenseProcessor.calculateStudioBurn(3, 4);
      expect(burn).toBe(1362500); // 500k * 1.25^2 + (4 * 145312.5)
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
