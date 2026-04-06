import { describe, it, expect } from 'vitest';
import { calculateFranchiseFatigue, calculateReleaseGapImpact } from '../../../engine/systems/ip/fatigueEngine';
import { Franchise } from '../../../engine/types';

describe('Fatigue Engine', () => {
  const mockFranchise: Franchise = {
    id: 'f1',
    name: 'Galaxy Wars',
    activeProjectIds: ['p1'],
    assetIds: ['ip1'],
    fatigueLevel: 0,
    audienceLoyalty: 50,
    synergyMultiplier: 1.0,
    totalEquity: 1000000,
    relevanceScore: 100,
    lastReleaseWeeks: [100],
    creationWeek: 50
  };

  it('calculates high fatigue for a heavily penalized oversaturated genre (Superhero)', () => {
    const fatigue = calculateFranchiseFatigue(mockFranchise, 2, 'Superhero');
    // baseRate is 1.20 now.
    // activeCount (1) * 1.20 = 1.20
    // rivalPenalty (2/10 * 0.15 * 1.0) = 0.03
    // loyaltyShield (50/100 * 0.3) = 0.15
    // 1.20 + 0.03 - 0.15 = 1.08 -> clamped to 1.0
    expect(fatigue).toBeCloseTo(1.0, 2);
  });

  it('applies exponential dilution for multiple active projects', () => {
    const crowdedFranchise = { ...mockFranchise, activeProjectIds: ['p1', 'p2', 'p3'], audienceLoyalty: 0 };
    const fatigue = calculateFranchiseFatigue(crowdedFranchise, 0, 'Action');
    // activeCount (3) * 0.50 * 2.5 * 3.0 = 11.25 (clamped to 1.0)
    expect(fatigue).toBe(1.0);
  });

  it('triggers Nostalgia Spike for 10+ year gaps', () => {
    const impact = calculateReleaseGapImpact([100], 620); // 520 weeks = 10 years
    expect(impact.buzzBonus).toBe(50);
    expect(impact.fatigueReset).toBe(true);
  });

  it('identifies The Dead Zone for 4.5 year gaps', () => {
    const impact = calculateReleaseGapImpact([100], 334); // ~4.5 years
    expect(impact.buzzBonus).toBe(-25);
    expect(impact.label).toContain('Dead Zone');
  });
});
