import { describe, it, expect } from 'vitest';
import { generateOpportunity, generateProjectTitle } from '@/engine/generators/opportunities';
import { RandomGenerator } from '@/engine/utils/rng';

describe('Opportunity Generator', () => {
  const rng = new RandomGenerator(12345);

  it('should generate a valid opportunity', () => {
    const opp = generateOpportunity(rng);

    expect(opp).toBeDefined();
    expect(opp.id).toContain('opp-');
    expect(opp.title).toBeTypeOf('string');
    expect(['script', 'package', 'pitch', 'rights']).toContain(opp.type);
    expect(['open_spec', 'agency_package', 'writer_sample', 'heat_list', 'passion_project']).toContain(opp.origin);
    expect(opp.costToAcquire).toBeGreaterThanOrEqual(10000);
    expect(opp.weeksUntilExpiry).toBeGreaterThanOrEqual(4);
    expect(opp.weeksUntilExpiry).toBeLessThanOrEqual(12);
  });

  it('should generate attached talent if provided', () => {
    // Generate many to ensure randomness catches one with talent
    let foundTalent = false;
    for (let i = 0; i < 50; i++) {
      const opp = generateOpportunity(rng, ['t-1', 't-2']);
      if (opp.attachedTalentIds && opp.attachedTalentIds.length > 0) {
        foundTalent = true;
        expect(['t-1', 't-2']).toContain(opp.attachedTalentIds[0]);
        break;
      }
    }
    expect(foundTalent).toBe(true);
  });

  it('should populate TV specific fields if format is TV', () => {
    // Generate until we get a TV project
    let tvOpp;
    for (let i = 0; i < 50; i++) {
      const opp = generateOpportunity(rng);
      if (opp.format === 'tv') {
        tvOpp = opp;
        break;
      }
    }

    expect(tvOpp).toBeDefined();
    expect(tvOpp?.tvFormat).toBeDefined();
    expect(tvOpp?.episodes).toBeDefined();
    expect(tvOpp?.releaseModel).toBe('weekly');
  });

  it('should generate titles', () => {
    const title = generateProjectTitle(rng);
    expect(title).toBeTypeOf('string');
    expect(title.length).toBeGreaterThan(0);
  });
});
