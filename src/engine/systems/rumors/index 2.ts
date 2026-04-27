export { RumorProcessor } from './RumorProcessor';

import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { RumorProcessor } from './RumorProcessor';

/**
 * Legacy-compatible wrapper for advanceRumors.
 */
export function advanceRumors(state: GameState, week: number, rng: RandomGenerator): StateImpact {
  return RumorProcessor.advanceRumors(state, week, rng);
}
