import { GameState, StateImpact } from '../../types';
import { RandomGenerator } from '../../utils/rng';

/**
 * IndustryRegulator - Anti-Trust & Economic Replenishment
 */
export class IndustryRegulator {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    
    // 1. Anti-Trust Monitoring
    // If a major studio (rival or player) holds too much market cash, they face regulatory scrutiny.
    const studios = [
      { id: 'player', name: state.studio.name, cash: state.finance.cash, type: state.studio.archetype },
      ...state.industry.rivals.map(r => ({ id: r.id, name: r.name, cash: r.cash, type: r.archetype }))
    ];

    const totalIndustryCash = studios.reduce((sum, s) => sum + s.cash, 0);
    const threshold = 0.45; // 45% of total industry cash

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

    // 2. Talent Market Replenishment
    // Ensure the talent pool doesn't stagnate by injecting new talent.
    if (Object.keys(state.industry.talentPool).length < 200 || rng.next() < 0.1) {
        // This is handled by TalentSystem or gameInit in larger sweeps, 
        // but can trigger micro-injections here if needed.
    }

    return impacts;
  }
}
