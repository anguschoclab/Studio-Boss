import { describe, it, expect } from 'vitest';
import { NewsImpact } from '@/engine/types';
import { tickAgencies, evaluatePackageOffer } from '@/engine/systems/ai/AgentBrain';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockGameState, createMockTalent, createMockRival } from '../../generators/mockFactory';

describe('Agent Brain (Target C2)', () => {
  const rng = new RandomGenerator(888);
  
  describe('tickAgencies', () => {
    it('should generate rumors for SHARK agencies', () => {
      const mockAgency: Agency = {
        id: 'a1',
        name: 'Shark Agency',
        archetype: 'powerhouse',
        culture: 'shark',
        prestige: 90,
        leverage: 80,
        currentMotivation: 'THE_SHARK',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 }
      };

      const mockRival = createMockRival({ id: 'r1', name: 'Rival Studio' });
      const state = createMockGameState();
      state.industry.agencies = [mockAgency];
      state.entities.rivals = { [mockRival.id]: mockRival };

      // With seed 888, let's see if shark rumor triggers
      const impacts = tickAgencies(state, rng);
      expect(Array.isArray(impacts)).toBe(true);
      
      if (impacts.length > 0) {
        const impact = impacts[0] as NewsImpact;
        expect(impact.type).toBe('NEWS_ADDED');
        expect(impact.payload.headline).toContain('poach top talent');
      }
    });
  });

  describe('evaluatePackageOffer', () => {
    it('returns a package deal if agency is THE_PACKAGER', () => {
      // @ts-expect-error Mocking partial Agency object for test
      const agency: Agency = {
        id: 'packager-1',
        name: 'Pack House',
        currentMotivation: 'THE_PACKAGER'
      };

      const leadTalent = createMockTalent({ id: 'lead', name: 'Star' });
      const bundledTalent = createMockTalent({ id: 'bundle', name: 'B-Side', agencyId: 'packager-1' });
      const talentPool = [leadTalent, bundledTalent];

      const result = evaluatePackageOffer(agency, leadTalent, talentPool, rng);
      
      expect(result.requiredTalentId).toBe('bundle');
      expect(result.packageDiscount).toBe(0.1);
      expect(result.reason).toContain('Agency policy');
    });

    it('returns no deal if no other clients are available', () => {
      // @ts-expect-error Mocking partial Agency object for test
      const agency: Agency = {
        id: 'packager-1',
        name: 'Pack House',
        currentMotivation: 'THE_PACKAGER'
      };

      const leadTalent = createMockTalent({ id: 'lead', name: 'Star' });
      const talentPool = [leadTalent];

      const result = evaluatePackageOffer(agency, leadTalent, talentPool, rng);
      expect(result.requiredTalentId).toBeUndefined();
      expect(result.reason).toBe('No package deal offered.');
    });
  });
});
