import { GameState, StateImpact } from '../../types';
import { RandomGenerator } from '../../utils/rng';

/**
 * IndustryRegulator - Anti-Trust & Economic Replenishment
 */
export class RegulatorSystem {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    
    // 1. Calculate Trailing 4-Week Revenue for all studios
    const calculateTrailingRevenue = (history: any[]) => {
      return (history || []).slice(0, 4).reduce((sum, h) => sum + (h.revenue?.theatrical || 0) + (h.revenue?.streaming || 0), 0);
    };

    const rivalsList = Object.values(state.entities.rivals || {});

    const studios = [
      { 
        id: 'player', 
        name: state.studio.name, 
        revenue: calculateTrailingRevenue(state.finance.weeklyHistory), 
        type: state.studio.archetype 
      },
      ...rivalsList.map(r => ({ 
        id: r.id, 
        name: r.name, 
        revenue: calculateTrailingRevenue(r.weeklyHistory || []), 
        type: r.archetype 
      }))
    ];

    const totalIndustryRevenue = studios.reduce((sum, s) => sum + s.revenue, 1);
    const threshold = 0.40; 

    studios.forEach(s => {
      const share = s.revenue / totalIndustryRevenue;
      if (share > threshold && s.type === 'major' && totalIndustryRevenue > 50_000_000) {
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
            id: rng.uuid('NWS'),
            headline: `Federal Trade Commission Fines ${s.name}`,
            description: `Cited for market dominance (${Math.round(share * 100)}%), ${s.name} has been issued a $25M penalty.`,
            category: 'market',
            publication: 'Financial Journal',
            week: state.week
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
    const calculateTrailingRevenue = (history: any[]) => {
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
  }

  /**
   * Calculate market share for a specific studio.
   */
  static getMarketShare(state: GameState, studioId: string): number {
    const calculateTrailingRevenue = (history: any[]) => {
      return (history || []).slice(0, 4).reduce((sum, h) => sum + (h.revenue?.theatrical || 0) + (h.revenue?.streaming || 0), 0);
    };

    const rivalsList = Object.values(state.entities.rivals || {});

    const studios = [
      { id: 'player', revenue: calculateTrailingRevenue(state.finance.weeklyHistory) },
      ...rivalsList.map(r => ({ id: r.id, revenue: calculateTrailingRevenue(r.weeklyHistory || []) }))
    ];

    const totalIndustryRevenue = studios.reduce((sum, s) => sum + s.revenue, 1);
    const target = studios.find(s => s.id === studioId);
    return (target?.revenue || 0) / (totalIndustryRevenue || 1);
  }
}
