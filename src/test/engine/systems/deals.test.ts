import { vi } from "vitest";
import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateFirstLookDeal, offerFirstLookDeal } from '../../../engine/systems/deals';
import { TalentProfile, FirstLookDeal } from '../../../engine/types';

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
      accessLevel: "soft-access"
    };
  });

  it('evaluates whether talent will accept a first-look deal based on prestige and access levels', () => {
    const poorState = { studio: { prestige: 20 } } as any;
    const okState = { studio: { prestige: 90 } } as any;
    const dynastyTalent = { ...mockTalent, accessLevel: 'dynasty' };

    vi.spyOn(Math, 'random').mockReturnValue(0.5); // mid roll = 50 

    // 20 prestige vs 90 -> chance = 50 + (20-90) = -20 clamped to 5
    // Random 50 <= 5 is false
    const lowOffer = evaluateFirstLookDeal(mockTalent, poorState);
    expect(lowOffer).toBe(false);

    // 90 vs 90 -> chance = 50. Random 50 <= 50 is true
    const highOffer = evaluateFirstLookDeal(mockTalent, okState);
    expect(highOffer).toBe(true);
  });

  it('offers a deal and returns a valid FirstLookDeal object if accepted', () => {
    // 90 prestige talent with 2 million fee evaluating a deal
    const state = {
        studio: { prestige: 90 }, // Studio prestige matches talent
        industry: { talentPool: [mockTalent] }
    } as any;
    
    // We can't guarantee random acceptance, so let's mock Math.random
    vi.spyOn(Math, 'random').mockReturnValue(0.01); // 1% random check <= 50% acceptance chance = true
    
    const deal = offerFirstLookDeal(state, mockTalent.id, 52, true);
    expect(deal).not.toBeNull();
    expect(deal?.talentId).toBe(mockTalent.id);
    expect(deal?.weeksRemaining).toBe(52);
  });
});
