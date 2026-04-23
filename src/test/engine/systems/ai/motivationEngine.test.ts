import { describe, it, expect } from 'vitest';
import { RivalStudio } from '@/engine/types';
import { calculateRivalMotivation } from '@/engine/systems/ai/motivationEngine';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockGameState, createMockRival } from '../../generators/mockFactory';

describe('AI Motivation Engine (Target C1)', () => {
  const rng = new RandomGenerator(999);
  
  it('should switch to CASH_CRUNCH if cash is extremely low', () => {
    const mockRival = createMockRival({
        id: 'r1',
        cash: 100_000, // Very low cash
        prestige: 80,
    });
    const state = createMockGameState();
    // In Phase 7, rivals are in entities.rivals
    state.entities.rivals = { [mockRival.id]: mockRival };

    const nextMotivation = calculateRivalMotivation(mockRival, state, rng);
    expect(nextMotivation).toBe('CASH_CRUNCH');
  });

  it('should switch to AWARD_CHASE if prestige is high but cash is fine', () => {
    const mockRival = createMockRival({
        id: 'r1',
        cash: 5_000_000, // Enough to be stable but not trigger FRANCHISE_BUILDING which is heavily buffed now at 10_000_000
        prestige: 90
    });
    const state = createMockGameState();
    state.entities.rivals = { [mockRival.id]: mockRival };

    const nextMotivation = calculateRivalMotivation(mockRival, state, rng);
    expect(nextMotivation).toBe('AWARD_CHASE');
  });
});
