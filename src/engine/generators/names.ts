import { RandomGenerator } from '../utils/rng';
import { BardResolver } from '../systems/bardResolver';
import { generateProjectTitle } from './titles';
import { ProjectFormat } from '@/engine/types';

/**
 * Generates a studio name using the Bard Engine.
 */
export function generateStudioName(_existing: string[], rng: RandomGenerator): string {
  // We use intensity 50 as a neutral default for name generation
  const prefix = BardResolver.resolve({ 
    domain: 'Dictionary' as any, 
    subDomain: 'STUDIO_PREFIX', 
    intensity: rng.range(0, 100) 
  });
  const suffix = BardResolver.resolve({ 
    domain: 'Dictionary' as any, 
    subDomain: 'STUDIO_SUFFIX', 
    intensity: rng.range(0, 100) 
  });
  return `${prefix} ${suffix}`;
}

/**
 * Generates a studio motto using the Bard Engine.
 */
export function generateMotto(rng: RandomGenerator): string {
  return BardResolver.resolve({
    domain: 'Dictionary' as any,
    subDomain: 'STUDIO_MOTTO',
    intensity: rng.range(0, 100)
  });
}

/**
 * Generates a character name using the Bard Engine.
 */
export function generateDemographicName(
  gender: 'MALE' | 'FEMALE' | 'NON_BINARY', 
  _country: string, 
  _ethnicity: string, 
  rng: RandomGenerator
): string {
  const firstSubDomain = gender === 'FEMALE' ? 'FIRST_NAME_FEMALE' : 'FIRST_NAME_MALE';
  
  const first = BardResolver.resolve({
    domain: 'Dictionary' as any,
    subDomain: firstSubDomain,
    intensity: rng.range(0, 100)
  });
  
  const last = BardResolver.resolve({
    domain: 'Dictionary' as any,
    subDomain: 'LAST_NAME',
    intensity: rng.range(0, 100)
  });
  
  return `${first} ${last}`;
}

/**
 * Redirects to the centralized Project Title generator in the Bard Engine.
 */
export function generateProjectName(_format: ProjectFormat, genre: string, rng: RandomGenerator): string {
  return generateProjectTitle(genre, rng);
}
