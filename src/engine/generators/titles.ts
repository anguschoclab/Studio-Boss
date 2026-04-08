import { BardResolver } from '../systems/bardResolver';
import { RandomGenerator } from '../utils/rng';

/**
 * Generates a project title based on genre using the Bard Engine.
 * Replaces the legacy hardcoded grammar system.
 */
export function generateProjectTitle(genre: string, rng?: RandomGenerator): string {
  // Map internal genre names to archive keys if strictly necessary, 
  // but archive.json already uses standard genre names.
  
  return BardResolver.resolve({
    domain: 'Project',
    subDomain: 'Title',
    intensity: rng ? rng.range(0, 100) : 50,
    variant: genre,
    context: {} // Interpolation will pull from Dictionary domain if keys like {{ADJECTIVE}} are used
  });
}
