import { describe, it, expect } from 'vitest';
import { advanceIPRights, calculateIPValue, checkRightsExpiry, catalogValue } from '@/engine/systems/ipRetention';
import { Project, ProjectStatus } from '@/engine/types';

describe('ipRetention system', () => {

  const createMockProject = (overrides: Partial<Project>): Project => ({
    id: 'mock-1',
    title: 'Mock Project',
    format: 'film',
    genre: 'Drama',
    budgetTier: 'low',
    budget: 10000000,
    weeklyCost: 1000000,
    targetAudience: 'broad',
    flavor: 'Test',
    status: 'development',
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 10,
    productionWeeks: 10,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
    ...overrides
  });

  describe('calculateIPValue', () => {
    it('calculates speculative value for early stage projects', () => {
      const project = createMockProject({ status: 'development', budget: 10000000 });
      expect(calculateIPValue(project)).toBe(1000000); // 10% of 10M
    });

    it('calculates baseline catalog value based on revenue', () => {
      const project = createMockProject({ status: 'released', revenue: 50000000 });
      expect(calculateIPValue(project)).toBe(20000000); // 40% of 50M
    });

    it('applies prestige multiplier', () => {
      const project = createMockProject({
        status: 'released',
        revenue: 50000000,
        awardsProfile: {
          criticScore: 90,
          audienceScore: 90,
          prestigeScore: 85,
          craftScore: 90,
          culturalHeat: 90,
          campaignStrength: 90,
          controversyRisk: 10,
          festivalBuzz: 90,
          academyAppeal: 90,
          guildAppeal: 90,
          populistAppeal: 90,
          indieCredibility: 90,
          industryNarrativeScore: 90
        }
      });
      // 50M * 0.4 = 20M. 20M * 1.5 = 30M
      expect(calculateIPValue(project)).toBe(30000000);
    });

    it('applies genre multipliers', () => {
      const project = createMockProject({ status: 'released', revenue: 50000000, genre: 'Sci-Fi' });
      // 50M * 0.4 = 20M. 20M * 1.25 = 25M
      expect(calculateIPValue(project)).toBe(25000000);
    });

    it('combines multipliers', () => {
      const project = createMockProject({
        status: 'released',
        revenue: 50000000,
        genre: 'Sci-Fi',
        awardsProfile: {
          criticScore: 90,
          audienceScore: 90,
          prestigeScore: 85,
          craftScore: 90,
          culturalHeat: 90,
          campaignStrength: 90,
          controversyRisk: 10,
          festivalBuzz: 90,
          academyAppeal: 90,
          guildAppeal: 90,
          populistAppeal: 90,
          indieCredibility: 90,
          industryNarrativeScore: 90
        }
      });
      // 50M * 0.4 = 20M. 20M * 1.5 * 1.25 = 37.5M
      expect(calculateIPValue(project)).toBe(37500000);
    });
  });

  describe('checkRightsExpiry', () => {
    it('returns warning when 4 weeks left', () => {
      const project = createMockProject({
        title: 'Star Wars',
        ipRights: { rightsOwner: 'studio', reversionWeek: 104, catalogValue: 0 }
      });
      expect(checkRightsExpiry(project, 100)).toBe('WARNING: Rights to "Star Wars" revert in 4 weeks. Exploit or renew now!');
    });

    it('returns critical when 0 weeks left', () => {
      const project = createMockProject({
        title: 'Star Wars',
        ipRights: { rightsOwner: 'studio', reversionWeek: 100, catalogValue: 0 }
      });
      expect(checkRightsExpiry(project, 100)).toBe('CRITICAL: Rights to "Star Wars" have reverted. You no longer control this IP.');
    });

    it('returns null otherwise', () => {
      const project = createMockProject({
        title: 'Star Wars',
        ipRights: { rightsOwner: 'studio', reversionWeek: 105, catalogValue: 0 }
      });
      expect(checkRightsExpiry(project, 100)).toBeNull();

      const project2 = createMockProject({
        title: 'Star Wars',
        ipRights: { rightsOwner: 'studio', reversionWeek: 99, catalogValue: 0 }
      });
      expect(checkRightsExpiry(project2, 100)).toBeNull(); // It only warns exactly on 0
    });
  });

  describe('advanceIPRights', () => {
    it('handles projects without ipRights or reversionWeek', () => {
      const project = createMockProject({});
      const result = advanceIPRights([project], 100);
      expect(result.messages).toHaveLength(0);
      expect(result.projects[0]).toEqual(project);
    });

    it('reverts rights when currentWeek >= reversionWeek', () => {
      const project = createMockProject({
        title: 'Expiring Project',
        ipRights: { rightsOwner: 'studio', reversionWeek: 100, catalogValue: 1000 }
      });
      const result = advanceIPRights([project], 100);
      expect(result.messages).toContain('You lost the exclusive IP rights to Expiring Project.');
      expect(result.projects[0].ipRights?.rightsOwner).toBe('external');
      expect(result.projects[0].ipRights?.catalogValue).toBe(1000); // catalogValue not updated
    });

    it('updates catalogValue for active studio projects', () => {
      const project = createMockProject({
        budget: 10000000,
        status: 'development',
        ipRights: { rightsOwner: 'studio', reversionWeek: 150, catalogValue: 0 }
      });
      const result = advanceIPRights([project], 100);
      expect(result.messages).toHaveLength(0);
      expect(result.projects[0].ipRights?.rightsOwner).toBe('studio');
      expect(result.projects[0].ipRights?.catalogValue).toBe(1000000); // 10% of 10M
    });

    it('does not update catalogValue for external or shared projects', () => {
      const projectExternal = createMockProject({
        budget: 10000000,
        status: 'development',
        ipRights: { rightsOwner: 'external', catalogValue: 500 } // No reversionWeek so it doesn't expire
      });
      const projectShared = createMockProject({
        budget: 10000000,
        status: 'development',
        ipRights: { rightsOwner: 'shared', catalogValue: 500 }
      });

      const result = advanceIPRights([projectExternal, projectShared], 100);
      expect(result.projects[0].ipRights?.catalogValue).toBe(500); // Unchanged
      expect(result.projects[1].ipRights?.catalogValue).toBe(500); // Unchanged
    });
  });

  describe('catalogValue', () => {
    it('sums value properly based on rights owner', () => {
      const studioProject = createMockProject({
        budget: 10000000,
        status: 'development',
        ipRights: { rightsOwner: 'studio', catalogValue: 1000000 }
      });
      const sharedProject = createMockProject({
        budget: 10000000,
        status: 'development',
        ipRights: { rightsOwner: 'shared', catalogValue: 1000000 }
      });
      const externalProject = createMockProject({
        budget: 10000000,
        status: 'development',
        ipRights: { rightsOwner: 'external', catalogValue: 1000000 }
      });
      const noRightsProject = createMockProject({});

      const totalValue = catalogValue([studioProject, sharedProject, externalProject, noRightsProject]);
      // studio = 1M, shared = 0.5M, external = 0, noRights = 0
      expect(totalValue).toBe(1500000);
    });

    it('falls back to calculateIPValue if catalogValue is missing or falsy', () => {
       const studioProject = createMockProject({
        budget: 10000000,
        status: 'development',
        ipRights: { rightsOwner: 'studio', catalogValue: 0 } // 0 is falsy, should trigger fallback
      });
      expect(catalogValue([studioProject])).toBe(1000000); // calculateIPValue gives 1M
    });
  });

});
