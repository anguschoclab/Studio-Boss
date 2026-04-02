import { describe, expect, it } from 'vitest';
import { generateAgencies } from '../../../engine/generators/agencies';
import { AGENCY_ARCHETYPES } from '../../../engine/data/archetypes';

describe('Agency Generation', () => {
  it('generates the correct archetypes and prefixes', () => {
    const agencies = generateAgencies(5);

    // The first 2 should be powerhouse
    expect(agencies[0].archetype).toBe('powerhouse');
    expect(agencies[1].archetype).toBe('powerhouse');

    // The third (i=2, 2%3 !== 0) should be one of the remaining specialists/boutiques
    expect(['comedy_specialist', 'mega_corp', 'boutique', 'indie_darling', 'international_broker', 'nepotism_mill', 'lit_agency', 'streaming_titan', 'legacy_defenders', 'genre_kings', 'influencer_syndicate']).toContain(agencies[2].archetype);

    // The fourth (i=3, 3%3 === 0) should be shark
    expect(agencies[3].archetype).toBe('shark');
  });

  it('matches the flavor payload', () => {
    const powerhouse = AGENCY_ARCHETYPES['powerhouse'];
    expect(powerhouse).toBeDefined();
    expect(powerhouse.description).toContain('Controls the biggest stars');
  });
});
