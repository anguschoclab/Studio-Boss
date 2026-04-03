import { GameState, StateImpact } from '../../types';
import { RandomGenerator } from '../../utils/rng';

/**
 * IndustryRegulator - Anti-Trust & Economic Replenishment
 */
export class RegulatorSystem {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    
    // 1. Anti-Trust Monitoring
    // If a major studio (rival or player) holds too much market cash, they face regulatory scrutiny.
    const studios = [
      { id: 'player', name: state.studio.name, cash: state.finance.cash, type: state.studio.archetype },
      ...state.industry.rivals.map(r => ({ id: r.id, name: r.name, cash: r.cash, type: r.archetype }))
    ];

    const totalIndustryCash = studios.reduce((sum, s) => sum + s.cash, 0);
    const threshold = 0.40; // 🌌 PHASE 2: Anti-Trust cap moved to 40% per TDD.

    studios.forEach(s => {
      if (s.cash > totalIndustryCash * threshold && s.type === 'major') {
        const excess = s.cash - (totalIndustryCash * threshold);
        const fine = Math.min(excess * 0.2, 50_000_000); // 20% of excess, capped at 50M

        if (s.id === 'player') {
          impacts.push({
            type: 'FINANCE_TRANSACTION',
            payload: {
              amount: -fine,
              category: 'EXPENSE',
              description: 'Anti-Trust Regulatory Fine (Excessive Market Concentration)',
              week: state.week
            }
          });
          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              id: rng.uuid('news'),
              headline: `SEC Fines ${s.name} for Monopolistic Cash Reserves`,
              category: 'market',
              publication: 'Financial Journal'
            }
          });
        } else {
          impacts.push({
             type: 'INDUSTRY_UPDATE',
             payload: {
               rivalUpdates: [{
                 rivalId: s.id,
                 cashChange: -fine,
                 recentActivity: 'Navigating regulatory scrutiny over market concentration.'
               }]
             }
          });
        }
      }
    });

    return impacts;
  }

  /**
   * 🌌 PHASE 2: Consolidation Check.
   * prevents M&A that would result in >40% market share or cash dominance.
   */
  static isBlocked(
    state: GameState, 
    acquirerId: string, 
    targetId: string, 
    rng: RandomGenerator
  ): { blocked: boolean; reason?: string } {
    const acquirer = acquirerId === 'player' ? state.studio : state.industry.rivals.find(r => r.id === acquirerId);
    const target = state.industry.rivals.find(r => r.id === targetId) || state.market.buyers.find(b => b.id === targetId);
    
    if (!acquirer || !target) return { blocked: false };

    // 1. Absolute Dominance Check
    const totalCash = (state.finance.cash) + state.industry.rivals.reduce((sum, r) => sum + r.cash, 0);
    const acquirerCash = acquirerId === 'player' ? state.finance.cash : (acquirer as import('@/engine/types').RivalStudio).cash;
    
    if (acquirerCash > totalCash * 0.45) {
      return { blocked: true, reason: 'Market Dominance Threshold' };
    }

    // 2. Regulatory Random Audit (5% chance of block for major mergers)
    if (rng.next() < 0.05) {
      return { blocked: true, reason: 'Anti-Trust Investigation' };
    }

    return { blocked: false };
  }
}
