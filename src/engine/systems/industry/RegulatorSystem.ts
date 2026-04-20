import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * IndustryRegulator - Anti-Trust & Economic Replenishment
 */
export const RegulatorSystem = {
  tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    
    // 1. Calculate Trailing 4-Week Revenue for all studios
    const calculateTrailingRevenue = (history: import('../types/state.types').FinancialSnapshot[]) => {
      return (history || []).slice(0, 4).reduce((sum, h) => sum + (h.revenue?.theatrical || 0) + (h.revenue?.streaming || 0), 0);
    };

    const studios = [
      { id: 'player', revenue: calculateTrailingRevenue(state.finance.weeklyHistory) },
      ...Object.values(state.entities.rivals || {}).map(r => ({
        id: r.id,
        revenue: calculateTrailingRevenue(r.weeklyHistory || [])
      }))
    ];

    const totalIndustryRevenue = studios.reduce((sum, s) => sum + s.revenue, 0);

    // 2. Identify Monopolies/Dominant Players (>40% share)
    studios.forEach(studio => {
      const share = studio.revenue / (totalIndustryRevenue || 1);
      
      if (share > 0.40 && totalIndustryRevenue > 100_000_000) {
        // Enforce anti-trust fine or penalty
        impacts.push({
          type: 'STUDIO_IMPACT',
          studioId: studio.id,
          notifications: [
            {
              id: `reg-fine-${studio.id}-${state.week}`,
              title: 'Anti-Trust Investigation',
              message: `The regulator has identified ${studio.id === 'player' ? 'your studio' : studio.id} as a dominant market force. A market correction fine of $1M has been applied.`,
              type: 'critical',
              week: state.week
            }
          ]
        });

        // Apply financial impact
        impacts.push({
          type: 'FINANCE_IMPACT',
          amount: -1000000,
          category: 'other',
          studioId: studio.id
        });
      }
    });

    // 3. Periodic Economic Stimulus for smaller players
    studios.forEach(studio => {
      const share = studio.revenue / (totalIndustryRevenue || 1);
      if (share < 0.05 && totalIndustryRevenue > 50_000_000 && rng.next() < 0.1) {
        impacts.push({
          type: 'STUDIO_IMPACT',
          studioId: studio.id,
          notifications: [
            {
              id: `reg-grant-${studio.id}-${state.week}`,
              title: 'Independent Production Grant',
              message: 'Your studio has qualified for an independent production replenishment grant of $500k.',
              type: 'positive',
              week: state.week
            }
          ]
        });
      }
    });

    return impacts;
  },

  /**
   * 🌌 PHASE 2: Consolidation Check.
   * prevents M&A that would result in >40% market share.
   */
  isBlocked(
    state: GameState, 
    acquirerId: string, 
    targetId: string, 
    rng: RandomGenerator
  ): { blocked: boolean; reason?: string } {
    const calculateTrailingRevenue = (history: import('../types/state.types').FinancialSnapshot[]) => {
      return (history || []).slice(0, 4).reduce((sum, h) => sum + (h.revenue?.theatrical || 0) + (h.revenue?.streaming || 0), 0);
    };

    const rivalsList = Object.values(state.entities.rivals || {});

    const totalRev = calculateTrailingRevenue(state.finance.weeklyHistory) + 
                   rivalsList.reduce((sum, r) => sum + calculateTrailingRevenue(r.weeklyHistory || []), 0);
    
    let acquirerRev = 0;
    if (acquirerId === 'player') {
      acquirerRev = calculateTrailingRevenue(state.finance.weeklyHistory);
    } else {
      const acquirer = state.entities.rivals[acquirerId];
      acquirerRev = calculateTrailingRevenue(acquirer?.weeklyHistory || []);
    }
    
    // Check if acquirer current share > 40% (Consolidation Barrier)
    if (acquirerRev > totalRev * 0.40 && totalRev > 100_000_000) {
      return { blocked: true, reason: 'Market Dominance Threshold' };
    }

    // Regulatory Random Audit (5% chance of block)
    if (rng.next() < 0.05) {
      return { blocked: true, reason: 'Ongoing Anti-Trust Investigation' };
    }

    return { blocked: false };
  },

  /**
   * Calculate market share for a specific studio.
   */
  getMarketShare(state: GameState, studioId: string): number {
    const calculateTrailingRevenue = (history: import('../types/state.types').FinancialSnapshot[]) => {
      return (history || []).slice(0, 4).reduce((sum, h) => sum + (h.revenue?.theatrical || 0) + (h.revenue?.streaming || 0), 0);
    };

    const rivalsList = Object.values(state.entities.rivals || {});
    const totalIndustryRevenue = calculateTrailingRevenue(state.finance.weeklyHistory) + 
                                rivalsList.reduce((sum, r) => sum + calculateTrailingRevenue(r.weeklyHistory || []), 0);

    const studios = [
      { id: 'player', revenue: calculateTrailingRevenue(state.finance.weeklyHistory) },
      ...rivalsList.map(r => ({
        id: r.id,
        revenue: calculateTrailingRevenue(r.weeklyHistory || [])
      }))
    ];

    const target = studios.find(s => s.id === studioId);
    return (target?.revenue || 0) / (totalIndustryRevenue || 1);
  }
};
