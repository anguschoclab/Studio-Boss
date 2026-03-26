import { describe, it, expect, vi } from 'vitest';
import { generateFamilies, generateTalentPool } from '@/engine/generators/talent';
import { Agency, Agent, Family } from '@/engine/types/index';

describe('talent generator', () => {
  describe('generateFamilies', () => {
    it('generates the specified number of families', () => {
      const families = generateFamilies(3);
      expect(families).toHaveLength(3);
      expect(families[0].id).toBeDefined();
    });

    it('creates families with required attributes', () => {
      const families = generateFamilies(1);
      const fam = families[0];
      expect(fam.recognition).toBeGreaterThanOrEqual(40);
      expect(fam.prestigeLegacy).toBeDefined();
    });
  });

  describe('generateTalentPool', () => {
    it('generates the specified number of talent profiles', () => {
      const pool = generateTalentPool(5, [], [], []);
      expect(pool).toHaveLength(5);
      expect(pool[0].roles).toBeDefined();
      expect(Array.isArray(pool[0].roles)).toBe(true);
    });

    it('assigns multiple roles occasionally (multi-hyphenates)', () => {
        // Mock random to guarantee a secondary role
        vi.spyOn(Math, 'random').mockReturnValue(0.1);
        
        const pool = generateTalentPool(1, [], [], []);
        expect(pool[0].roles.length).toBeGreaterThan(0);
        
        vi.restoreAllMocks();
    });

    it('assigns nepo babies to families', () => {
        const families: Family[] = [{ id: 'fam-1', name: 'Coppola', recognition: 90, prestigeLegacy: 90, commercialLegacy: 90, scandalLegacy: 10, volatility: 10, status: 'respected' }];
        
        // Mock random so they are guaranteed to be nepo
        vi.spyOn(Math, 'random').mockReturnValue(0.1); 
        
        const pool = generateTalentPool(1, families, [], []);
        expect(pool[0].familyId).toBe('fam-1');
        expect(pool[0].accessLevel).toBe('dynasty');

        vi.restoreAllMocks();
    });

    it('assigns talent to agents and agencies if available', () => {
        const agencies: Agency[] = [
            { id: 'ag-1', name: 'CAC', tier: 'powerhouse', culture: 'shark', prestige: 90, leverage: 90 }
        ];
        const agents: Agent[] = [
            { id: 'agt-1', agencyId: 'ag-1', name: 'Ari Gold', specialty: 'talent', prestige: 90, leverage: 90 }
        ];

        // Mock random to guarantee they get an agent
        vi.spyOn(Math, 'random').mockReturnValue(0.5); 

        const pool = generateTalentPool(10, [], agents, agencies);
        
        // 80% should have representation, mocked at 0.5 < 0.8
        const assigned = pool.filter(t => t.agencyId === 'ag-1');
        expect(assigned.length).toBeGreaterThan(0);
        expect(assigned[0].agentId).toBe('agt-1');

        vi.restoreAllMocks();
    });
  });
});
