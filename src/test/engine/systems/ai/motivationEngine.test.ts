import { describe, it, expect } from 'vitest';
import { RivalStudio, GameState } from '@/engine/types';
import { calculateRivalMotivation } from '@/engine/systems/ai/motivationEngine';

describe('AI Motivation Engine (Target C1)', () => {
  const mockRival: RivalStudio = {
    id: 'r1',
    name: 'Universal Pictures Clone',
    cash: 100000, // Very low cash
    prestige: 80,
    motivationProfile: {
      financial: 50,
      prestige: 50,
      legacy: 50,
      aggression: 50
    },
    currentMotivation: 'STABILITY',
    projects: {}
  } as unknown as RivalStudio;

  const mockState = {
    week: 1,
    industry: {
      rivals: [mockRival]
    }
  } as unknown as GameState;

  it('should switch to CASH_CRUNCH if cash is extremely low', () => {
    const nextMotivation = calculateRivalMotivation(mockRival, mockState);
    expect(nextMotivation).toBe('CASH_CRUNCH');
  });

  it('should switch to AWARD_CHASE if prestige is high but awards are low', () => {
    const richRival = { ...mockRival, cash: 50000000, prestige: 90 };
    const nextMotivation = calculateRivalMotivation(richRival, mockState);
    expect(nextMotivation).toBe('AWARD_CHASE');
  });
});
