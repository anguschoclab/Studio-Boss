import { GameState, Project, Franchise, IPAsset, StateImpact } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import {
  calculateFranchiseEquity,
  updateFranchiseHub,
  calculateFranchiseEvolutionImpacts,
  tickIPVault
} from './index';

/**
 * Franchise Coordinator.
 * Orchestrates the Shared Universe Hub and calculates "Enterprise Value" for multi-format brands.
 * Re-exports functions from specialized modules for backward compatibility.
 */

export { calculateFranchiseEquity, updateFranchiseHub, calculateFranchiseEvolutionImpacts, tickIPVault };
