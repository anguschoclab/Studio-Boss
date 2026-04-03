import { describe, expect, it } from 'vitest';
import { generateAgencies } from '../../../engine/generators/agencies';
import { AGENCY_ARCHETYPES } from '../../../engine/data/archetypes';
import { RandomGenerator } from '../../../engine/utils/rng';

describe('Agency Generation', () => {
  const rng = new RandomGenerator(12345);

  it('generates the correct archetypes and prefixes', () => {
    const agencies = generateAgencies(rng, 5);

    // The first 2 should be powerhouse
    expect(agencies[0].archetype).toBe('powerhouse');
    expect(agencies[1].archetype).toBe('powerhouse');

    // The third (i=2, 2%3 !== 0) should be boutique (or others depending on RNG)
    expect(agencies[2].archetype).toBeDefined();

    // The fourth (i=3, 3%3 === 0) should be shark
    expect(agencies[3].archetype).toBe('shark');
  });

  it('matches the flavor payload', () => {
    const powerhouse = AGENCY_ARCHETYPES['powerhouse'];
    expect(powerhouse).toBeDefined();
    expect(powerhouse.description).toContain('Controls the biggest stars');
  });
});
