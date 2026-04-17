import { GameState, StateImpact, RatingMarket, Project } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

export {
  generateScandals,
  advanceScandals,
  generateStudioRatingEvent,
  generateMarketBanScandal
} from './scandals/index';
export type { RatingEventType } from './scandals/index';
