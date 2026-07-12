import { describe, it, expect } from 'vitest';
import {
  addContractToIndex,
  addContractsToIndex,
  removeContractFromIndex,
  removeContractsByTalentFromIndex,
  getContractsByProjectId,
} from '@/engine/utils';
import { Contract } from '@/engine/types';

function makeContract(id: string, projectId: string, talentId: string): Contract {
  return {
    id,
    projectId,
    talentId,
    fee: 100000,
    role: 'actor',
    backendPercent: 0,
  } as Contract;
}

describe('addContractToIndex', () => {
  it('adds to empty index', () => {
    const result = addContractToIndex({}, 'p1', 'c1');
    expect(result).toEqual({ p1: ['c1'] });
  });

  it('adds to existing project', () => {
    const result = addContractToIndex({ p1: ['c1'] }, 'p1', 'c2');
    expect(result).toEqual({ p1: ['c1', 'c2'] });
  });

  it('dedup guard prevents duplicate', () => {
    const result = addContractToIndex({ p1: ['c1'] }, 'p1', 'c1');
    expect(result).toEqual({ p1: ['c1'] });
  });

  it('returns new object (immutability)', () => {
    const original = { p1: ['c1'] };
    const result = addContractToIndex(original, 'p1', 'c2');
    expect(original).toEqual({ p1: ['c1'] });
    expect(result).not.toBe(original);
  });
});

describe('addContractsToIndex', () => {
  it('batch add to empty index', () => {
    const contracts = [makeContract('c1', 'p1', 't1'), makeContract('c2', 'p1', 't2')];
    const result = addContractsToIndex({}, contracts);
    expect(result).toEqual({ p1: ['c1', 'c2'] });
  });

  it('multiple projects', () => {
    const contracts = [makeContract('c1', 'p1', 't1'), makeContract('c2', 'p2', 't2')];
    const result = addContractsToIndex({}, contracts);
    expect(result).toEqual({ p1: ['c1'], p2: ['c2'] });
  });

  it('mixed existing and new projects', () => {
    const contracts = [makeContract('c2', 'p1', 't2'), makeContract('c3', 'p2', 't3')];
    const result = addContractsToIndex({ p1: ['c1'] }, contracts);
    expect(result).toEqual({ p1: ['c1', 'c2'], p2: ['c3'] });
  });
});

describe('removeContractFromIndex', () => {
  it('removes from existing project', () => {
    const result = removeContractFromIndex({ p1: ['c1', 'c2'] }, 'p1', 'c1');
    expect(result).toEqual({ p1: ['c2'] });
  });

  it('handles missing project', () => {
    const result = removeContractFromIndex({ p1: ['c1'] }, 'p2', 'c1');
    expect(result).toEqual({ p1: ['c1'] });
  });

  it('handles missing contract ID', () => {
    const result = removeContractFromIndex({ p1: ['c1'] }, 'p1', 'c99');
    expect(result).toEqual({ p1: ['c1'] });
  });

  it('cleans up empty arrays', () => {
    const result = removeContractFromIndex({ p1: ['c1'] }, 'p1', 'c1');
    expect(result).toEqual({});
  });
});

describe('removeContractsByTalentFromIndex', () => {
  it('removes matching (projectId, talentId)', () => {
    const contracts: Record<string, Contract> = {
      c1: makeContract('c1', 'p1', 't1'),
      c2: makeContract('c2', 'p1', 't2'),
    };
    const result = removeContractsByTalentFromIndex({ p1: ['c1', 'c2'] }, contracts, 'p1', 't1');
    expect(result.index).toEqual({ p1: ['c2'] });
    expect(result.removedIds).toEqual(['c1']);
  });

  it('returns removed IDs', () => {
    const contracts: Record<string, Contract> = {
      c1: makeContract('c1', 'p1', 't1'),
      c2: makeContract('c2', 'p1', 't1'),
    };
    const result = removeContractsByTalentFromIndex({ p1: ['c1', 'c2'] }, contracts, 'p1', 't1');
    expect(result.removedIds).toEqual(['c1', 'c2']);
  });

  it('handles no matches', () => {
    const contracts: Record<string, Contract> = {
      c1: makeContract('c1', 'p1', 't1'),
    };
    const result = removeContractsByTalentFromIndex({ p1: ['c1'] }, contracts, 'p1', 't99');
    expect(result.index).toEqual({ p1: ['c1'] });
    expect(result.removedIds).toEqual([]);
  });

  it('cleans up empty arrays', () => {
    const contracts: Record<string, Contract> = {
      c1: makeContract('c1', 'p1', 't1'),
    };
    const result = removeContractsByTalentFromIndex({ p1: ['c1'] }, contracts, 'p1', 't1');
    expect(result.index).toEqual({});
  });
});

describe('getContractsByProjectId', () => {
  it('returns contracts for a project', () => {
    const index = { p1: ['c1', 'c2'] };
    const contracts: Record<string, Contract> = {
      c1: makeContract('c1', 'p1', 't1'),
      c2: makeContract('c2', 'p1', 't2'),
    };
    const result = getContractsByProjectId(index, contracts, 'p1');
    expect(result).toHaveLength(2);
    expect(result.map(c => c.id)).toEqual(['c1', 'c2']);
  });

  it('returns empty array for missing project', () => {
    const result = getContractsByProjectId({}, {}, 'p99');
    expect(result).toEqual([]);
  });

  it('handles undefined index', () => {
    const result = getContractsByProjectId(undefined, {}, 'p1');
    expect(result).toEqual([]);
  });

  it('skips missing contract IDs', () => {
    const index = { p1: ['c1', 'c99'] };
    const contracts: Record<string, Contract> = {
      c1: makeContract('c1', 'p1', 't1'),
    };
    const result = getContractsByProjectId(index, contracts, 'p1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });
});
