import { GameState, Talent } from '@/engine/types';
import { StateImpact } from '../../types/state.types';
import { calculateStarMeter, calculateTalentTier } from './prestigeCalculator';
import { pick, secureRandom } from '../../utils';

export class WorldSimulator {
  /**
   * Weekly world-level simulation logic for "The Living World" (Phase 4).
   * Updates talent prestige, star meter, and triggers industry-wide headlines.
   */
  static processWorldState(state: GameState): StateImpact {
    const impact: StateImpact = {
      talentUpdates: [],
      newHeadlines: []
    };

    const talentPool = Object.values(state.industry.talentPool);
    const avgPrestige = talentPool.reduce((acc, t) => acc + t.prestige, 0) / Math.max(1, talentPool.length);

    // 1. Process Talent Drift (The "Fade" vs The "Momentum")
    for (const talent of talentPool) {
      const oldStarMeter = talent.starMeter || 50;
      const newStarMeter = calculateStarMeter(talent, avgPrestige);
      
      const updates: Partial<Talent> = {};
      
      if (newStarMeter !== oldStarMeter) {
        updates.starMeter = newStarMeter;
      }

      // If talent is elite but has no recent momentum, prestige slowly bleeds
      if (talent.prestige > 80 && (talent.momentum || 50) < 40 && secureRandom() < 0.1) {
        updates.prestige = talent.prestige - 1;
        impact.newHeadlines!.push({
          week: state.week,
          category: 'talent' as const,
          text: `IS THE SPARK GONE? Industry insiders whisper that ${talent.name}'s box office draw is softening.`
        });
      }

      if (Object.keys(updates).length > 0) {
        impact.talentUpdates!.push({ talentId: talent.id, update: updates });
      }
    }

    // 2. Generate Random Industry Moments (Headlines)
    if (secureRandom() < 0.1) {
       const aListers = talentPool.filter(t => t.prestige >= 80);
       if (aListers.length >= 2) {
          const t1 = pick(aListers);
          const t2 = pick(aListers.filter(t => t.id !== t1.id));
          impact.newHeadlines!.push({
             week: state.week,
             category: 'talent' as const,
             text: `POWER COUPLE? ${t1.name} and ${t2.name} spotted together at the Malibu beach house.`
          });
       }
    }

    return impact;
  }
}
