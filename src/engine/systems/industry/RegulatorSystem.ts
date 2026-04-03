import { GameState, StateImpact } from '../../types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Industry Regulator System
 * Handles Anti-Trust, Market Replenishment, and Macro-Economic Stability.
 */
export class IndustryRegulator {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];

    // 1. Anti-Trust Monitoring
    const majors = state.industry.rivals.filter(r => r.archetype === 'major');
    const totalMarketCash = state.industry.rivals.reduce((sum, r) => sum + r.cash, 0);

    majors.forEach(major => {
        // If a major owns more than 40% of industry liquid cash, trigger anti-trust fine
        if (major.cash > totalMarketCash * 0.4) {
            impacts.push({
                type: 'LEDGER_UPDATED',
                payload: {
                    amount: -(major.cash * 0.05),
                    category: 'legal',
                    description: `Anti-Trust Fine: ${major.name}'s market dominance has triggered regulatory penalties.`,
                    rivalId: major.id
                }
            });

            impacts.push({
                type: 'NEWS_ADDED',
                payload: {
                    id: rng.uuid('news'),
                    headline: 'ANTITRUST PROBE',
                    description: `Federal regulators have opened an investigation into ${major.name} for anticompetitive behavior.`,
                    publication: 'Financial Journal',
                    category: 'market'
                }
            });
        }
    });

    // 2. Market Replenishment (Upstart entry)
    if (state.industry.rivals.length < 15 && rng.next() < 0.05) {
        // Potential for a new indie/mid-tier to enter
        impacts.push({
            type: 'INDUSTRY_UPDATE',
            payload: {
                // Logic for adding a new rival would go here or be triggered as an event
            }
        });
    }

    return impacts;
  }
}
