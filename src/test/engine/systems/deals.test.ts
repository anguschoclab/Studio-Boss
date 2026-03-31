import { vi } from "vitest";
import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateFirstLookDeal, offerFirstLookDeal, advanceDeals } from '../../../engine/systems/deals';
import { TalentProfile, GameState, FirstLookDeal } from '../../../engine/types';
import * as utils from '../../../engine/utils';

describe('Deals System', () => {
  let mockTalent: TalentProfile;

  beforeEach(() => {
    mockTalent = {
      id: "t1",
      name: "Super Star",
      roles: ["director", "actor"],
      prestige: 90,
      draw: 85,
      fee: 2_000_000,
      temperament: "Normal",
      accessLevel: "soft-access",
      age: 40,
      gender: "male",
      ethnicity: "white",
      nationality: "USA",
      traits: [],
      stats: { acting: 90, directing: 85, writing: 0, production: 0 },
      workHistory: []
    } as any;
  });

  it('evaluates whether talent will accept a first-look deal based on prestige', () => {
    const poorState = { studio: { prestige: 20 } } as unknown as GameState;
    const okState = { studio: { prestige: 90 } } as unknown as GameState;

    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5); // mid roll = 50

    // 20 prestige vs 90 -> chance = 50 + (20-90) = -20. Clamped to 5.
    // Random 50 <= 5 is false
    const lowOffer = evaluateFirstLookDeal(mockTalent, poorState);
    expect(lowOffer).toBe(false);

    // 90 vs 90 -> chance = 50 (base) + 20 (soft-access bonus) = 70. 
    // Random 50 <= 70 is true
    const highOffer = evaluateFirstLookDeal(mockTalent, okState);
    expect(highOffer).toBe(true);
  });

  it('offers a deal and returns StateImpact if accepted', () => {
    const state = {
        studio: { name: 'Test Studio', prestige: 90 },
        industry: { talentPool: { [mockTalent.id]: mockTalent } }
    } as unknown as GameState;
    
    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.01); // Trigger success
    
    const impact = offerFirstLookDeal(state, mockTalent.id, 52, true);
    expect(impact.uiNotifications).toBeDefined();
    expect(impact.uiNotifications![0]).toContain(mockTalent.name);
    expect(impact.uiNotifications![0]).toContain("signs");
  });

  it('returns expiry notification in StateImpact during advanceDeals', () => {
    const deal: FirstLookDeal = {
      id: 'd1',
      talentId: 't1',
      weeksRemaining: 1,
      exclusivity: true
    };
    
    const impact = advanceDeals([deal]);
    expect(impact.uiNotifications).toHaveLength(1);
    expect(impact.uiNotifications![0]).toContain("expired");
  });
});
