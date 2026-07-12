import { describe, it, expect } from 'vitest';
import {
  tickDynastySystem,
  processComingOfAge,
  calculateDynastyReputation,
  processDeathInFamily,
} from '@/engine/systems/talent/DynastySystem';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockGameState, createMockTalent } from '../../generators/mockFactory';
import type { DeathEvent } from '@/engine/systems/talent/DeathSystem';

const baseEntities = {
  projects: {},
  releasedProjectIds: [],
  contracts: {},
  rivals: {},
  contractsByProjectId: {},
  contractsByTalentId: {},
};

function makeMockRng(nextValue: number = 0.05): RandomGenerator {
  return {
    next: () => nextValue,
    uuid: () => 'mock-uuid',
    pick: (arr: any[]) => arr[0],
    rangeInt: (min: number, max: number) => Math.floor((min + max) / 2),
    getState: () => ({ seed: 12345 }),
  } as unknown as RandomGenerator;
}

describe('DynastySystem', () => {
  describe('processComingOfAge', () => {
    it('skips C_LIST parents (tier > B_LIST)', () => {
      const parent = createMockTalent({
        id: 'TAL-P1',
        name: 'C List Parent',
        tier: 'C_LIST',
        demographics: { age: 45, gender: 'MALE', ethnicity: 'Unknown', country: 'USA' },
      });
      const state = createMockGameState({
        week: 10,
        entities: {
          ...baseEntities,
          talents: { 'TAL-P1': parent },
        },
      });
      const rng = makeMockRng(0.01); // low rng so the 10% check passes
      const impacts = processComingOfAge(state, rng);
      const talentAdded = impacts.find((i: any) => i.type === 'TALENT_ADDED');
      expect(talentAdded).toBeUndefined();
    });

    it('processes A_LIST parents (tier is A_LIST)', () => {
      const parent = createMockTalent({
        id: 'TAL-P2',
        name: 'A List Parent',
        tier: 'A_LIST',
        demographics: { age: 45, gender: 'MALE', ethnicity: 'Unknown', country: 'USA' },
      });
      const state = createMockGameState({
        week: 10,
        entities: {
          ...baseEntities,
          talents: { 'TAL-P2': parent },
        },
      });
      const rng = makeMockRng(0.01); // low rng so 10% check passes
      const impacts = processComingOfAge(state, rng);
      const talentAdded = impacts.find((i: any) => i.type === 'TALENT_ADDED');
      expect(talentAdded).toBeDefined();
    });

    it('processes B_LIST parents (tier is B_LIST)', () => {
      const parent = createMockTalent({
        id: 'TAL-P3',
        name: 'B List Parent',
        tier: 'B_LIST',
        demographics: { age: 45, gender: 'FEMALE', ethnicity: 'Unknown', country: 'USA' },
      });
      const state = createMockGameState({
        week: 10,
        entities: {
          ...baseEntities,
          talents: { 'TAL-P3': parent },
        },
      });
      const rng = makeMockRng(0.01);
      const impacts = processComingOfAge(state, rng);
      const talentAdded = impacts.find((i: any) => i.type === 'TALENT_ADDED');
      expect(talentAdded).toBeDefined();
    });

    it('generated nepo baby has valid tier (not undefined)', () => {
      const parent = createMockTalent({
        id: 'TAL-P4',
        name: 'Star Parent',
        tier: 'A_LIST',
        demographics: { age: 50, gender: 'MALE', ethnicity: 'Unknown', country: 'USA' },
      });
      const state = createMockGameState({
        week: 10,
        entities: {
          ...baseEntities,
          talents: { 'TAL-P4': parent },
        },
      });
      const rng = makeMockRng(0.01);
      const impacts = processComingOfAge(state, rng);
      const talentAdded = impacts.find((i: any) => i.type === 'TALENT_ADDED') as any;
      if (talentAdded) {
        const newTalents = talentAdded.payload.newTalents || talentAdded.newTalents;
        if (newTalents && newTalents.length > 0) {
          expect(newTalents[0].tier).toBeDefined();
          expect(typeof newTalents[0].tier).toBe('string');
          expect(newTalents[0].tier).toBe('NEWCOMER');
        }
      }
    });
  });

  describe('calculateDynastyReputation', () => {
    it('counts A_LIST members for tier bonus', () => {
      const talents = {
        'TAL-1': createMockTalent({ id: 'TAL-1', tier: 'A_LIST', prestige: 60, familyId: 'FAM-1' }),
        'TAL-2': createMockTalent({ id: 'TAL-2', tier: 'A_LIST', prestige: 60, familyId: 'FAM-1' }),
        'TAL-3': createMockTalent({ id: 'TAL-3', tier: 'C_LIST', prestige: 60, familyId: 'FAM-1' }),
      };
      const state = createMockGameState({
        entities: {
          ...baseEntities,
          talents,
        },
      });
      const rep = calculateDynastyReputation('FAM-1', state);
      // avgPrestige = 60, tier1Count = 2, tierBonus = 20 → 80
      expect(rep).toBe(80);
    });

    it('returns 50 for empty family', () => {
      const state = createMockGameState();
      const rep = calculateDynastyReputation('FAM-NONEXIST', state);
      expect(rep).toBe(50);
    });
  });

  describe('processDeathInFamily', () => {
    it('applies +5 legacy boost for A_LIST deceased', () => {
      const deceased = createMockTalent({
        id: 'TAL-D1',
        tier: 'A_LIST',
        familyId: 'FAM-1',
        demographics: { age: 70, gender: 'MALE', ethnicity: 'Unknown', country: 'USA' },
      } as any);
      (deceased as any).childIds = ['TAL-C1'];
      const child = createMockTalent({
        id: 'TAL-C1',
        prestige: 50,
        familyId: 'FAM-1',
      });
      const state = createMockGameState({
        entities: {
          ...baseEntities,
          talents: { 'TAL-D1': deceased, 'TAL-C1': child },
        },
      });
      const deathEvent: DeathEvent = {
        id: 'DTH-1',
        talentId: 'TAL-D1',
        week: 10,
        type: 'natural',
        cause: 'passed away',
        location: 'at home',
        isPublic: true,
        impactsProduction: false,
        griefLevel: 80,
        isDuringProduction: false,
      };
      const rng = makeMockRng(0.5);
      const impacts = processDeathInFamily(deathEvent, state, rng);
      const updateImpact = impacts.find(
        (i: any) => i.type === 'TALENT_UPDATED' && i.payload.talentId === 'TAL-C1'
      ) as any;
      expect(updateImpact).toBeDefined();
      expect(updateImpact.payload.update.prestige).toBe(55);
    });

    it('applies +3 legacy boost for B_LIST deceased', () => {
      const deceased = createMockTalent({
        id: 'TAL-D2',
        tier: 'B_LIST',
        familyId: 'FAM-2',
        demographics: { age: 70, gender: 'FEMALE', ethnicity: 'Unknown', country: 'USA' },
      } as any);
      (deceased as any).childIds = ['TAL-C2'];
      const child = createMockTalent({
        id: 'TAL-C2',
        prestige: 50,
        familyId: 'FAM-2',
      });
      const state = createMockGameState({
        entities: {
          ...baseEntities,
          talents: { 'TAL-D2': deceased, 'TAL-C2': child },
        },
      });
      const deathEvent: DeathEvent = {
        id: 'DTH-2',
        talentId: 'TAL-D2',
        week: 10,
        type: 'natural',
        cause: 'passed away',
        location: 'at home',
        isPublic: true,
        impactsProduction: false,
        griefLevel: 60,
        isDuringProduction: false,
      };
      const rng = makeMockRng(0.5);
      const impacts = processDeathInFamily(deathEvent, state, rng);
      const updateImpact = impacts.find(
        (i: any) => i.type === 'TALENT_UPDATED' && i.payload.talentId === 'TAL-C2'
      ) as any;
      expect(updateImpact).toBeDefined();
      expect(updateImpact.payload.update.prestige).toBe(53);
    });
  });

  describe('tickDynastySystem', () => {
    it('runs without crashing on empty state', () => {
      const state = createMockGameState();
      const rng = new RandomGenerator(12345);
      const impacts = tickDynastySystem(state, rng);
      expect(impacts).toBeDefined();
      expect(Array.isArray(impacts)).toBe(true);
    });
  });
});
