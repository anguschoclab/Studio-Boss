import { GameState, StateImpact } from '../../types';
import { RandomGenerator } from '../../utils/rng';

export function evaluateActiveMergers(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const activeMergers = state.industry.activeMergers || [];
    
    for (const merger of activeMergers) {
        if (state.week >= (merger.activeUntilWeek || 0)) {
            impacts.push({
                type: 'MERGER_RESOLVED',
                payload: { mergerId: merger.id, status: 'completed' as const }
            });
            
            impacts.push({
                type: 'NEWS_ADDED',
                payload: {
                    id: rng.uuid('NWS'),
                    headline: `MERGER FINALIZED: ${merger.id}`,
                    description: `The acquisition process has officially concluded.`,
                    category: 'market'
                }
            });
        }
    }
    
    return impacts;
}
