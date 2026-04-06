import { describe, it, expect, beforeEach, vi } from 'vitest';
import { evaluateFirstLookDeal, offerFirstLookDeal, advanceDeals, evaluatePackageStrength } from '../../../engine/systems/deals';
import { Talent, GameState, TalentPact, Agency } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';
import { createMockGameState } from '../../utils/mockFactories';

describe('Deals System', () => {
  let mockTalent: Talent;
  const rng = new RandomGenerator(888);

  beforeEach(() => {
    mockTalent = {
      id: "t1",
      name: "Super Star",
      roles: ["director", "actor"],
      prestige: 90,
      draw: 85,
      fee: 2_000_000,
      personality: "Normal",
      accessLevel: "soft-access",
    } as any;
  });

  it('evaluates whether talent will accept a first-look deal based on prestige', () => {
    const poorState = createMockGameState({ studio: { prestige: 20 } as any });
    const okState = createMockGameState({ studio: { prestige: 90 } as any });

    const luckyRng = new RandomGenerator(123);
    vi.spyOn(luckyRng, 'next').mockReturnValue(0.5); // mid roll = 50

    // 20 prestige vs 90 -> chance = 50 + (20-90) = -20. Clamped to 5.
    // Random 50 <= 5 is false
    const lowOffer = evaluateFirstLookDeal(mockTalent, poorState, luckyRng);
    expect(lowOffer).toBe(false);

    // 90 vs 90 -> chance = 50 (base) + 20 (soft-access bonus) = 70. 
    // Random 50 <= 70 is true
    const highOffer = evaluateFirstLookDeal(mockTalent, okState, luckyRng);
    expect(highOffer).toBe(true);
  });

  it('offers a deal and returns newsEvents impact if accepted', () => {
    const state = createMockGameState({
        week: 10,
        studio: { name: 'Test Studio', prestige: 90 } as any
    });
    state.entities.talents[mockTalent.id] = mockTalent;
    
    const luckyRng = new RandomGenerator(456);
    vi.spyOn(luckyRng, 'next').mockReturnValue(0.01); // Trigger success
    
    const impacts = offerFirstLookDeal(state, mockTalent.id, luckyRng);
    const newsImpact = impacts.find(i => i.newsEvents && i.newsEvents.length > 0);
    expect(newsImpact).toBeDefined();
    expect(newsImpact?.newsEvents![0].headline).toContain("signs");
  });

  it('returns expiry notification in newsEvents impact during advanceDeals', () => {
    const deal = {
      id: 'd1',
      talentId: 't1',
      studioId: 's1',
      type: 'first_look',
      startDate: 1,
      endDate: 10,
      weeklyOverhead: 1000,
      exclusivity: true,
      status: 'active'
    } as any;
    
    const impacts = advanceDeals([deal], 10, rng);
    const newsImpact = impacts.find(i => i.newsEvents && i.newsEvents.length > 0);
    expect(newsImpact).toBeDefined();
    expect(newsImpact?.newsEvents![0].description).toContain("expired");
  });
});
