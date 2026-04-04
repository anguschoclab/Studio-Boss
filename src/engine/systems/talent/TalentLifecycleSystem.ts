import { GameState, StateImpact, Talent, TalentTier } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import { generateTalent } from '../../generators/talent/index';

/**
 * Talent Lifecycle System
 * Handles aging, retirement, and recruitment to maintain a steady-state talent pool.
 */
export class TalentLifecycleSystem {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const isYearEnd = state.week % 52 === 0;

    const talentPool = Object.values(state.industry.talentPool) as Talent[];
    const retiredIds: string[] = [];

    talentPool.forEach(talent => {
      // 0. Medical leave expiry
      if (talent.onMedicalLeave && talent.medicalLeaveEndsWeek !== undefined && state.week >= talent.medicalLeaveEndsWeek) {
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: { talentId: talent.id, update: { onMedicalLeave: false, medicalLeaveEndsWeek: undefined } }
        });
        return; // skip rest of processing while recovering
      }
      if (talent.onMedicalLeave) return; // still on leave

      // 0b. Fatigue accumulation from active commitments
      const activeCommitments = (talent.commitments || []).filter(
        c => !c.isHoldingDeal && c.startWeek <= state.week && c.endWeek >= state.week
      );
      if (activeCommitments.length > 0) {
        const fatigueGain = activeCommitments.some(c => c.format === 'animation') ? 10 : 20;
        const newFatigue = Math.min(100, (talent.fatigue ?? 0) + fatigueGain * 0.1); // incremental weekly gain
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: { talentId: talent.id, update: { fatigue: newFatigue } }
        });

        // 0c. Burnout check
        if (newFatigue > 90 && rng.next() < 0.25) {
          impacts.push({
            type: 'MEDICAL_LEAVE_TRIGGERED',
            payload: { talentId: talent.id, weeks: 8 }
          });
          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              id: `burnout-${talent.id}-${state.week}`,
              headline: `${talent.name} steps back citing exhaustion`,
              description: `The talent will be on medical leave for approximately 8 weeks.`,
              category: 'talent',
              publication: 'The Hollywood Reporter'
            }
          });
          return;
        }
      } else {
        // Natural fatigue recovery when not committed
        const recovery = Math.min((talent.fatigue ?? 0), 5);
        if (recovery > 0) {
          impacts.push({
            type: 'TALENT_UPDATED',
            payload: { talentId: talent.id, update: { fatigue: Math.max(0, (talent.fatigue ?? 0) - recovery) } }
          });
        }
      }

      // 1. Annual Aging & Prestige Decay
      if (isYearEnd) {
        // Prestige Decay: -2 per year if no projects released in the last 52 weeks
        const weeksSinceLastRelease = state.week - (talent.lastReleaseWeek || 0);
        let decay = 0;
        if (weeksSinceLastRelease > 52) {
          decay = talent.tier === 'S_LIST' ? -4 : -2;
        }

        impacts.push({
          type: 'TALENT_UPDATED',
          payload: {
            talentId: talent.id,
            update: { 
              demographics: { ...talent.demographics, age: (talent.demographics.age || 40) + 1 },
              prestige: Math.max(0, (talent.prestige || 50) + decay)
            }
          }
        });
      }

      // 2. Retirement Evaluation
      const age = talent.demographics.age || 40;
      let retirementChance = 0;

      if (age > 75) retirementChance = 0.5; 
      else if (age > 65) retirementChance = 0.05; 
      else if (age > 55) retirementChance = 0.01; 
      
      // Momentum Traps: Burnout and Blacklisting for failing talent
      if (talent.momentum < 20 && talent.prestige < 30) {
        retirementChance += 0.02; // Significant increase for the "Momentum Trap"
      }
      
      if (rng.next() < 0.0001) retirementChance = 1.0; 

      if (talent.tier === 'S_LIST' || talent.tier === 'A_LIST') {
        retirementChance *= 0.2;
      }

      if (rng.next() < retirementChance) {
        impacts.push({
          type: 'TALENT_REMOVED',
          payload: { talentId: talent.id }
        });
        retiredIds.push(talent.id);
      }
    });

    // 3. Replenishment (Maintain ~2,500 talent pool)
    const targetPoolSize = 2500;
    const currentSize = talentPool.length - retiredIds.length;
    const needsReplacement = Math.max(0, targetPoolSize - currentSize);

    if (needsReplacement > 0) {
      const newTalents: Talent[] = [];
      for (let i = 0; i < needsReplacement; i++) {
        const tierRoll = rng.next();
        let tier: TalentTier = 'NEWCOMER';
        if (tierRoll > 0.90) tier = 'RISING_STAR';
        
        const roleRoll = rng.next();
        const role = roleRoll > 0.7 ? 'director' : (roleRoll > 0.5 ? 'writer' : (roleRoll > 0.4 ? 'producer' : 'actor'));

        newTalents.push(generateTalent(rng, { role: role as any, tier }));
      }
      impacts.push({
        type: 'TALENT_ADDED',
        newTalents
      } as any);
    }

    // Pass metadata to industry tick for metrics
    impacts.push({
      type: 'SYSTEM_TICK',
      payload: { 
        retiredCount: retiredIds.length 
      }
    } as any);

    return impacts;
  }
}
