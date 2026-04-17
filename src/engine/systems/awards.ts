import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

export {
  isCannesEquivalentFestival,
  isSundanceEquivalentFestival,
  isMajorCategoryNomination,
  isSupportingCategoryNomination,
  calculateNominationWeight,
  checkCampaignBacklash,
  runAwardsCeremony,
  processRazzies
} from './awards/index';

