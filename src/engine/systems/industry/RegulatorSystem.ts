import { GameState, StateImpact } from '../../types';
import { RandomGenerator } from '../../utils/rng';

/**
 * IndustryRegulator - Anti-Trust & Economic Replenishment
 */
export class RegulatorSystem {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    
    // 1. Market Share Monitoring (Revenue-based)
    const studios = [
      { id: 'player', name: state.studio.name, revenue: state.finance.weeklyHistory[0]?.revenue?.theatrical || 0, type: state.studio.archetype },
      ...state.industry.rivals.map(r => ({ id: r.id, name: r.name, revenue: 10_000_000, type: r.archetype })) // 🌌 PHASE 2: Fallback for rivals until they have history
    ];

    const totalIndustryRevenue = studios.reduce((sum, s) => sum + s.revenue, 1);
    const threshold = 0.40; 

    studios.forEach(s => {
      const share = s.revenue / totalIndustryRevenue;
      if (share > threshold && s.type === 'major') {
        const fine = 25_000_000; 

        impacts.push({
          type: 'FINANCE_TRANSACTION',
          payload: {
            amount: -fine,
            category: 'EXPENSE',
            description: `Anti-Trust Fine: ${s.name} Market Share (${Math.round(share * 100)}%)`,
            week: state.week,
            targetId: s.id // Route to the specific studio
          }
        });

        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('news'),
            headline: `Federal Trade Commission Fines ${s.name}`,
            description: `Cited for market dominance (${Math.round(share * 100)}%), ${s.name} has been issued a $25M penalty.`,
            category: 'market',
            publication: 'Financial Journal'
          }
        });
      }
    });

    return impacts;
  }

  /**
   * 🌌 PHASE 2: Consolidation Check.
   * prevents M&A that would result in >40% market share.
   */
  static isBlocked(
    state: GameState, 
    acquirerId: string, 
    targetId: string, 
    rng: RandomGenerator
  ): { blocked: boolean; reason?: string } {
    const totalRev = state.finance.weeklyHistory[0]?.revenue?.theatrical || 100_000_000;
    const playerRev = state.finance.weeklyHistory[0]?.revenue?.theatrical || 0;
    
    // Check if player current share + hypothetical target share > 40%
    if (acquirerId === 'player' && playerRev > totalRev * 0.40) {
      return { blocked: true, reason: 'Market Dominance Threshold' };
    }

    // Regulatory Random Audit (5% chance of block)
    if (rng.next() < 0.05) {
      return { blocked: true, reason: 'Ongoing Anti-Trust Investigation' };
    }

    return { blocked: false };
  }
}
