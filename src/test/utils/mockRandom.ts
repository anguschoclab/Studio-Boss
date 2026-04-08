import { RandomGenerator } from '../../engine/utils/rng';

/**
 * Returns a RandomGenerator initialized with a deterministic seed derived from a string.
 */
export const mockRandomSeed = (seedStr: string): RandomGenerator => {
  const seed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return new RandomGenerator(seed);
};
