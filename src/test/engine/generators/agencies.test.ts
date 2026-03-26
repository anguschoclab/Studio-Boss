import { describe, expect, it } from 'bun:test';
import { generateAgencies } from '../../../engine/generators/agencies';
import { AGENCY_ARCHETYPES } from '../../../engine/data/archetypes';

describe('Agency Generation', () => {
  it('generates the correct archetypes and prefixes', () => {
    const agencies = generateAgencies(5);

    // The first 2 should be powerhouse
    expect(agencies[0].archetype).toBe('powerhouse');
    expect(agencies[1].archetype).toBe('powerhouse');

    // The third (i=2, 2%3 !== 0) should be boutique
    expect(agencies[2].archetype).toBe('boutique');

    // The fourth (i=3, 3%3 === 0) should be shark
    expect(agencies[3].archetype).toBe('shark');
  });

  it('matches the flavor payload', () => {
    const powerhouse = AGENCY_ARCHETYPES['powerhouse'];
    expect(powerhouse).toBeDefined();
    expect(powerhouse.description).toContain('Controls the biggest stars');
  });
});
