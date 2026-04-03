import { GameState, StateImpact, Talent, TalentTier } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { generateTalent } from '../../generators/talent';

/**
 * Talent Lifecycle System
 * Handles aging, retirement, and recruitment to maintain a steady-state talent pool.
 */
export class TalentLifecycleSystem {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const isYearEnd = state.week % 52 === 0;

    const talentPool = Object.values(state.industry.talentPool);
    let retiredCount = 0;

    talentPool.forEach(talent => {
      // 1. Annual Aging
      if (isYearEnd) {
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: {
            talentId: talent.id,
            update: { demographics: { ...talent.demographics, age: talent.demographics.age + 1 } }
          }
        });
      }

      // 2. Retirement Evaluation
      const age = talent.demographics.age;
      let retirementChance = 0;

      if (age > 75) retirementChance = 0.3;
      else if (age > 65) retirementChance = 0.1;
      else if (age > 50 && talent.momentum < 20 && talent.prestige < 30) retirementChance = 0.05; // "Failed out"
      
      // S-List and A-List are less likely to retire early unless very old
      if (talent.tier === 'S_LIST' || talent.tier === 'A_LIST') {
        retirementChance *= 0.5;
      }

      if (rng.next() < retirementChance) {
        impacts.push({
          type: 'TALENT_REMOVED',
          payload: { talentId: talent.id, reason: age > 75 ? 'DEATH' : 'RETIREMENT' }
        });
        retiredCount++;
      }
    });

    // 3. Replenishment (Maintain ~2,500 talent pool)
    // If retiredCount > 0 or pool < 2500, generate new blood
    const targetPoolSize = 2500;
    const currentSize = talentPool.length - retiredCount;
    const needsReplacement = Math.max(0, targetPoolSize - currentSize);

    if (needsReplacement > 0) {
      for (let i = 0; i < needsReplacement; i++) {
        const tierRoll = rng.next();
        let tier: TalentTier = 'NEWCOMER';
        if (tierRoll > 0.90) tier = 'RISING_STAR'; // 10% chance for a hot prospect
        
        const roleRoll = rng.next();
        const role = roleRoll > 0.7 ? 'director' : (roleRoll > 0.5 ? 'writer' : (roleRoll > 0.4 ? 'producer' : 'actor'));

        const newTalent = generateTalent(rng, { role: role as any, tier });
        impacts.push({
          type: 'TALENT_ADDED',
          payload: { talent: newTalent }
        });
      }
    }

    return impacts;
  }
}
