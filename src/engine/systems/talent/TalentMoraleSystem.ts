import { Talent, Project, Contract, StateImpact } from '@/engine/types';
import { TalentUpdate } from '@/engine/types/state.types';

/**
 * Talent Morale & Behavioral Psychology System
 * 
 * Logic:
 * - Talent mood (Morale) drifts toward 50 over time.
 * - Project delays or low momentum reduce mood.
 * - Scandals significantly tank mood.
 * - Working with "Conflict" talent (Ego clashes) reduces mood.
 */
export class TalentMoraleSystem {
  /**
   * Calculates the production speed multiplier based on the moods of attached talent.
   * If any major talent (Actor/Director) has very low mood (< 30), production slows down.
   */
  static getProductionSpeedMultiplier(talent: Talent[]): number {
    if (talent.length === 0) return 1.0;

    const lowMoraleTalent = talent.filter(t => t.psychology.mood < 30);
    if (lowMoraleTalent.length > 0) {
      // 20% drag if there's significant unhappiness
      return 0.8;
    }

    return 1.0;
  }

  /**
   * Calculates a quality multiplier for the final review score.
   * Low trust/morale leads to "onset friction" and a lower ceiling.
   */
  static getQualityMultiplier(talent: Talent[]): number {
    if (talent.length === 0) return 1.0;

    const avgMood = talent.reduce((acc, t) => acc + t.psychology.mood, 0) / talent.length;
    
    // Scale from 0.85 (miserable) to 1.1 (inspired)
    if (avgMood < 30) return 0.85;
    if (avgMood > 85) return 1.1;
    
    return 1.0;
  }

  /**
   * Updates talent psychology based on the current week's events.
   */
  static processWeeklyMorale(
    talent: Record<string, Talent>,
    projects: Record<string, Project>,
    contracts: Record<string, Contract>
  ): TalentUpdate[] {
    const updates: TalentUpdate[] = [];

    // Pre-compute O(1) lookups to avoid O(N*M) nested filtering
    const contractsByTalent = new Map<string, Contract[]>();
    for (const id in contracts) {
      const c = contracts[id];
      const arr = contractsByTalent.get(c.talentId);
      if (arr) {
        arr.push(c);
      } else {
        contractsByTalent.set(c.talentId, [c]);
      }
    }

    // ⚡ The Framerate Fanatic: Iterating directly over the record to avoid Object.values allocation
    for (const id in talent) {
      const t = talent[id];
      let moodChange = 0;
      
      // 1. Natural drift toward 50
      if (t.psychology.mood > 55) moodChange -= 1;
      else if (t.psychology.mood < 45) moodChange += 1;

      // 2. Project performance
      const activeContracts = contractsByTalent.get(t.id) || [];
      for (const c of activeContracts) {
        const p = projects[c.projectId];
        if (p) {
          // Momentum impact
          if (p.momentum < 30) moodChange -= 2;
          else if (p.momentum > 80) moodChange += 1;

            // Crisis impact
            if (p.activeCrisis && !p.activeCrisis.resolved) moodChange -= 5;
          }
        }

      if (moodChange !== 0) {
        updates.push({
          talentId: t.id,
          update: {
            psychology: {
              ...t.psychology,
              mood: Math.max(0, Math.min(100, t.psychology.mood + moodChange))
            }
          }
        });
      }
    }

    return updates;
  }
}
