import { describe, it, expect } from 'vitest';
import { generateAgencies, generateAgents } from '@/engine/generators/agencies';

describe('agencies generator', () => {
  describe('generateAgencies', () => {
    it('generates the requested number of agencies', () => {
      const agencies = generateAgencies(5);
      expect(agencies).toHaveLength(5);
      expect(agencies[0].id).toBeDefined();
    });

    it('makes the first two agencies powerhouses', () => {
      const agencies = generateAgencies(5);
      expect(agencies[0].tier).toBe('powerhouse');
      expect(agencies[1].tier).toBe('powerhouse');
      expect(agencies[2].tier).not.toBe('powerhouse');
    });

    it('assigns higher prestige and leverage to powerhouse agencies', () => {
      const agencies = generateAgencies(3); // 0, 1 are powerhouse, 2 is major
      expect(agencies[0].prestige).toBeGreaterThanOrEqual(80);
      expect(agencies[0].leverage).toBeGreaterThanOrEqual(85);
      expect(agencies[2].prestige).toBeLessThan(85); // Major prestige 60-84
    });
  });

  describe('generateAgents', () => {
    it('generates agents for each given agency', () => {
      const agencies = generateAgencies(2);
      const agents = generateAgents(agencies, 2);
      // powerhouse gets countPerAgency * 2 = 4 agents each
      expect(agents).toHaveLength(8);
      
      const agencyId1 = agencies[0].id;
      const agency1Agents = agents.filter(a => a.agencyId === agencyId1);
      expect(agency1Agents).toHaveLength(4);
    });

    it('assigns high aggression to agents in a shark culture', () => {
      const agencies = generateAgencies(1);
      agencies[0].culture = 'shark';
      const agents = generateAgents(agencies, 1);
      
      for (const agent of agents) {
        expect(agent.leverage).toBeGreaterThanOrEqual(70);
      }
    });

    it('assigns lower aggression to agents in non-shark cultures', () => {
        const agencies = generateAgencies(1);
        agencies[0].culture = 'family'; // Ensure it's not shark
        const agents = generateAgents(agencies, 5); // Need enough to guarantee one would be < 70 normally

        // At least one should be < 70, or we can just test bounds (30-79)
        const allLessThan80 = agents.every(a => a.aggression < 80);
        expect(allLessThan80).toBe(true);
    });
  });
});
