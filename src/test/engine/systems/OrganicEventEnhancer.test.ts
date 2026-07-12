import { describe, it, expect } from 'vitest';
import {
  checkRelationshipCrises,
  checkCliqueCrises,
  generateRelationshipScandals,
  tickOrganicEvents,
  calculateSocialCrisisModifier,
} from '../../../engine/systems/talent/OrganicEventEnhancer';
import { RandomGenerator } from '../../../engine/utils/rng';
import { TalentRelationship } from '../../../engine/types/relationship.types';
import { Clique } from '../../../engine/types/clique.types';
import { createMockGameState, createMockTalent, createMockContract } from '../generators/mockFactory';

function makeRng(seed = 999): RandomGenerator { return new RandomGenerator(seed); }

function makeRel(o: Partial<TalentRelationship> = {}): TalentRelationship {
  return { id: 'REL-1', talentAId: 'TAL-1', talentBId: 'TAL-2', type: 'friend', strength: 50, isPublic: false, history: [], formedWeek: 1, lastUpdatedWeek: 1, ...o };
}

function makeClique(o: Partial<Clique> = {}): Clique {
  return { id: 'CLQ-1', name: 'Test Clique', members: ['TAL-1', 'TAL-2', 'TAL-3'], formedWeek: 1, status: 'active', fameBonus: 20, reputation: 'toxic', exclusivity: 50, combinedStarPower: 150, reunionPotential: 50, internalConflicts: [], ...o };
}

function setupState(rels: TalentRelationship[], talents: Record<string, any> = {}, overrides: Record<string, any> = {}): any {
  const relMap: Record<string, TalentRelationship> = {};
  for (const r of rels) relMap[r.id] = r;
  return { ...createMockGameState(overrides), entities: { ...createMockGameState().entities, talents }, relationships: { relationships: relMap, ...overrides.relationships } };
}

function tryTrigger(fn: (rng: RandomGenerator) => any, maxTries = 200): any | null {
  for (let i = 0; i < maxTries; i++) { const r = fn(makeRng(1 + i)); if (r) return r; }
  return null;
}

function contractsFor(projectId: string, ...talentIds: string[]): Record<string, any> {
  const out: Record<string, any> = {};
  talentIds.forEach((tid, i) => { out['C' + (i + 1)] = createMockContract({ id: 'C' + (i + 1), projectId, talentId: tid }); });
  return out;
}

function setContracts(s: any, projectId: string, ...talentIds: string[]) {
  s.entities.contracts = contractsFor(projectId, ...talentIds);
  s.entities.contractsByProjectId = { [projectId]: talentIds.map((_, i) => 'C' + (i + 1)) };
}

const PROJ = { id: 'PRJ-1', title: 'Test', state: 'production' } as any;

describe('checkRelationshipCrises', () => {
  it('returns null when project has < 2 cast members', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1');
    expect(checkRelationshipCrises(PROJ, s, makeRng())).toBeNull();
  });

  it('returns null when no relationships exist between cast', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    expect(checkRelationshipCrises(PROJ, s, makeRng())).toBeNull();
  });

  it('returns null when only friendly relationships exist', () => {
    const s = setupState([makeRel({ type: 'friend', strength: 80 })], { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'A' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'B' }) });
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    expect(checkRelationshipCrises(PROJ, s, makeRng())).toBeNull();
  });

  it('returns MODAL_TRIGGERED crisis when feud exists and rng triggers', () => {
    const s = setupState([makeRel({ type: 'rival', strength: -50 })], { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'A' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'B' }) });
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    const r = tryTrigger(rng => checkRelationshipCrises(PROJ, s, rng));
    expect(r).not.toBeNull();
    expect(r.type).toBe('MODAL_TRIGGERED');
    expect((r.payload as any).modalType).toBe('CRISIS');
  });

  it('returns null when feud exists but rng does not trigger', () => {
    const s = setupState([makeRel({ type: 'rival', strength: -50 })], { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'A' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'B' }) });
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    let gotNull = false;
    for (let i = 0; i < 200; i++) { if (checkRelationshipCrises(PROJ, s, makeRng(1 + i)) === null) { gotNull = true; break; } }
    expect(gotNull).toBe(true);
  });

  it('sets severity high when |feud.strength| > 70', () => {
    const s = setupState([makeRel({ type: 'enemy', strength: -85 })], { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'A' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'B' }) });
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    const r = tryTrigger(rng => checkRelationshipCrises(PROJ, s, rng));
    expect(r).not.toBeNull();
    const crisis = (r.payload as any).payload.crisis;
    expect(crisis.severity).toBe('high');
    expect((r.payload as any).priority).toBe(90);
    expect(crisis.haltedProduction).toBe(true);
  });

  it('sets severity medium when |feud.strength| <= 70', () => {
    const s = setupState([makeRel({ type: 'rival', strength: -40 })], { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'A' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'B' }) });
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    const r = tryTrigger(rng => checkRelationshipCrises(PROJ, s, rng));
    expect(r).not.toBeNull();
    const crisis = (r.payload as any).payload.crisis;
    expect(crisis.severity).toBe('medium');
    expect((r.payload as any).priority).toBe(70);
    expect(crisis.haltedProduction).toBe(false);
  });

  it('only considers relationships where BOTH talents are in cast', () => {
    const s = setupState([makeRel({ talentAId: 'TAL-1', talentBId: 'TAL-3', type: 'rival', strength: -50 })], { 'TAL-1': createMockTalent({ id: 'TAL-1' }), 'TAL-2': createMockTalent({ id: 'TAL-2' }), 'TAL-3': createMockTalent({ id: 'TAL-3' }) });
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    expect(checkRelationshipCrises(PROJ, s, makeRng())).toBeNull();
  });

  it('returns null when referenced talents do not exist in state', () => {
    const s = setupState([makeRel({ type: 'rival', strength: -50 })], {});
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    for (let i = 0; i < 200; i++) { expect(checkRelationshipCrises(PROJ, s, makeRng(1 + i))).toBeNull(); }
  });
});

describe('checkCliqueCrises', () => {
  it('returns null when project has < 3 cast members', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    expect(checkCliqueCrises(PROJ, s, makeRng())).toBeNull();
  });

  it('returns null when no cliques have 2+ members on project', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2', 'TAL-3');
    s.relationships = { cliques: { cliques: { 'CLQ-1': makeClique() }, memberCliqueMap: { 'TAL-1': ['CLQ-1'] } } };
    expect(checkCliqueCrises(PROJ, s, makeRng())).toBeNull();
  });

  it('returns NEWS_ADDED when toxic clique has 2+ members and rng triggers', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2', 'TAL-3');
    s.relationships = { cliques: { cliques: { 'CLQ-1': makeClique({ name: 'Bad Blood', reputation: 'toxic' }) }, memberCliqueMap: { 'TAL-1': ['CLQ-1'], 'TAL-2': ['CLQ-1'], 'TAL-3': ['CLQ-1'] } } };
    const r = tryTrigger(rng => checkCliqueCrises(PROJ, s, rng));
    expect(r).not.toBeNull();
    expect(r.type).toBe('NEWS_ADDED');
    expect((r.payload as any).headline).toContain('Clique Drama');
    expect((r.payload as any).description).toContain('Bad Blood');
  });

  it('returns null when toxic clique has 2+ members but rng does not trigger', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2', 'TAL-3');
    s.relationships = { cliques: { cliques: { 'CLQ-1': makeClique({ reputation: 'toxic' }) }, memberCliqueMap: { 'TAL-1': ['CLQ-1'], 'TAL-2': ['CLQ-1'], 'TAL-3': ['CLQ-1'] } } };
    let gotNull = false;
    for (let i = 0; i < 200; i++) { if (checkCliqueCrises(PROJ, s, makeRng(1 + i)) === null) { gotNull = true; break; } }
    expect(gotNull).toBe(true);
  });

  it('returns null when clique is non-toxic', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2', 'TAL-3');
    s.relationships = { cliques: { cliques: { 'CLQ-1': makeClique({ reputation: 'cool' }) }, memberCliqueMap: { 'TAL-1': ['CLQ-1'], 'TAL-2': ['CLQ-1'], 'TAL-3': ['CLQ-1'] } } };
    for (let i = 0; i < 200; i++) { expect(checkCliqueCrises(PROJ, s, makeRng(1 + i))).toBeNull(); }
  });

  it('uses clique name in description when clique exists', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2', 'TAL-3');
    s.relationships = { cliques: { cliques: { 'CLQ-1': makeClique({ name: 'The Drama Club', reputation: 'toxic' }) }, memberCliqueMap: { 'TAL-1': ['CLQ-1'], 'TAL-2': ['CLQ-1'], 'TAL-3': ['CLQ-1'] } } };
    const r = tryTrigger(rng => checkCliqueCrises(PROJ, s, rng));
    expect(r).not.toBeNull();
    expect((r.payload as any).description).toContain('The Drama Club');
  });

  it('does NOT trigger drama when clique does not exist in cliques map', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2', 'TAL-3');
    s.relationships = { cliques: { cliques: {}, memberCliqueMap: { 'TAL-1': ['CLQ-999'], 'TAL-2': ['CLQ-999'], 'TAL-3': ['CLQ-999'] } } };
    for (let i = 0; i < 200; i++) { expect(checkCliqueCrises(PROJ, s, makeRng(1 + i))).toBeNull(); }
  });
});

describe('generateRelationshipScandals', () => {
  it('returns empty array when no relationships exist', () => {
    const s = setupState([]);
    expect(generateRelationshipScandals(s, makeRng())).toEqual([]);
  });

  it('generates scandal impacts for secret romance with spouse', () => {
    const talents = { 'TAL-1': { ...createMockTalent({ id: 'TAL-1', name: 'Alice' }), spouseId: 'TAL-3' }, 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'Bob' }), 'TAL-3': createMockTalent({ id: 'TAL-3', name: 'Carol' }) };
    const s = setupState([makeRel({ id: 'R1', talentAId: 'TAL-1', talentBId: 'TAL-2', type: 'romantic', isPublic: false, strength: 80 })], talents, { week: 10 });
    for (let i = 0; i < 200; i++) {
      const impacts = generateRelationshipScandals(s, makeRng(1 + i));
      if (impacts.length > 0) {
        expect(impacts.filter(x => x.type === 'SCANDAL_ADDED').length).toBe(2);
        expect(impacts.filter(x => (x as any).type === 'RELATIONSHIP_UPDATED').length).toBe(1);
        expect(impacts.filter(x => x.type === 'NEWS_ADDED').length).toBe(1);
        return;
      }
    }
    expect.fail('Should have triggered at least once');
  });

  it('does not generate scandal for secret romance without spouse', () => {
    const talents = { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'Alice' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'Bob' }) };
    const s = setupState([makeRel({ type: 'romantic', isPublic: false, strength: 80 })], talents, { week: 10 });
    for (let i = 0; i < 200; i++) { expect(generateRelationshipScandals(s, makeRng(1 + i))).toEqual([]); }
  });

  it('does not treat secret romance with strength <= 60 as secret romance', () => {
    const talents = { 'TAL-1': { ...createMockTalent({ id: 'TAL-1', name: 'Alice' }), spouseId: 'TAL-3' }, 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'Bob' }), 'TAL-3': createMockTalent({ id: 'TAL-3', name: 'Carol' }) };
    const s = setupState([makeRel({ type: 'romantic', isPublic: false, strength: 60 })], talents, { week: 10 });
    for (let i = 0; i < 200; i++) { expect(generateRelationshipScandals(s, makeRng(1 + i))).toEqual([]); }
  });

  it('generates NEWS_ADDED for public romance with recent breakup', () => {
    const talents = { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'Alice' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'Bob' }) };
    const s = setupState([makeRel({ type: 'romantic', isPublic: true, strength: 50, history: [{ week: 8, type: 'breakup', impact: -20, description: 'Split' }] })], talents, { week: 10 });
    const impacts = generateRelationshipScandals(s, makeRng());
    const news = impacts.filter(x => x.type === 'NEWS_ADDED');
    expect(news.length).toBe(1);
    expect((news[0].payload as any).headline).toContain('Power Couple Splits');
  });

  it('does not generate news for public romance with old breakup (> 4 weeks ago)', () => {
    const talents = { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'Alice' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'Bob' }) };
    const s = setupState([makeRel({ type: 'romantic', isPublic: true, strength: 50, history: [{ week: 5, type: 'breakup', impact: -20, description: 'Split' }] })], talents, { week: 10 });
    const impacts = generateRelationshipScandals(s, makeRng());
    expect(impacts.filter(x => x.type === 'NEWS_ADDED').length).toBe(0);
  });

  it('does not generate news for public romance with no breakup in history', () => {
    const talents = { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'Alice' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'Bob' }) };
    const s = setupState([makeRel({ type: 'romantic', isPublic: true, strength: 50, history: [{ week: 5, type: 'strengthened', impact: 10, description: 'Stronger' }] })], talents, { week: 10 });
    expect(generateRelationshipScandals(s, makeRng())).toEqual([]);
  });

  it('ignores non-romantic relationships', () => {
    const talents = { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'Alice' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'Bob' }) };
    const s = setupState([makeRel({ type: 'friend', strength: 80, isPublic: false }), makeRel({ id: 'R2', type: 'rival', strength: -80, isPublic: true })], talents, { week: 10 });
    for (let i = 0; i < 200; i++) { expect(generateRelationshipScandals(s, makeRng(1 + i))).toEqual([]); }
  });

  it('processes both secret and public romances in a single call', () => {
    const talents = { 'TAL-1': { ...createMockTalent({ id: 'TAL-1', name: 'Alice' }), spouseId: 'TAL-3' }, 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'Bob' }), 'TAL-3': createMockTalent({ id: 'TAL-3', name: 'Carol' }), 'TAL-4': createMockTalent({ id: 'TAL-4', name: 'Dave' }) };
    const s = setupState([makeRel({ type: 'romantic', isPublic: false, strength: 80 }), makeRel({ id: 'R2', talentAId: 'TAL-3', talentBId: 'TAL-4', type: 'romantic', isPublic: true, strength: 50, history: [{ week: 9, type: 'breakup', impact: -20, description: 'Split' }] })], talents, { week: 10 });
    const impacts = generateRelationshipScandals(s, makeRng(42));
    const hasBreakupNews = impacts.some(x => x.type === 'NEWS_ADDED' && (x.payload as any).headline.includes('Power Couple Splits'));
    expect(hasBreakupNews).toBe(true);
  });
});

describe('calculateSocialCrisisModifier', () => {
  it('returns 1.0 when project has < 2 cast members', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1');
    expect(calculateSocialCrisisModifier('PRJ-1', s)).toBe(1.0);
  });

  it('returns 1.0 when no feuds and no toxic cliques', () => {
    const s = setupState([makeRel({ type: 'friend', strength: 80 })], { 'TAL-1': createMockTalent({ id: 'TAL-1' }), 'TAL-2': createMockTalent({ id: 'TAL-2' }) });
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    expect(calculateSocialCrisisModifier('PRJ-1', s)).toBe(1.0);
  });

  it('adds 0.15 per feud relationship', () => {
    const s = setupState([makeRel({ type: 'rival', strength: -50 }), makeRel({ id: 'R2', talentAId: 'TAL-1', talentBId: 'TAL-3', type: 'enemy', strength: -60 })], { 'TAL-1': createMockTalent({ id: 'TAL-1' }), 'TAL-2': createMockTalent({ id: 'TAL-2' }), 'TAL-3': createMockTalent({ id: 'TAL-3' }) });
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2', 'TAL-3');
    expect(calculateSocialCrisisModifier('PRJ-1', s)).toBeCloseTo(1.3);
  });

  it('adds 0.10 per toxic clique member', () => {
    const s: any = createMockGameState();
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2', 'TAL-3');
    s.relationships = { relationships: {}, cliques: { cliques: { 'CLQ-1': makeClique({ reputation: 'toxic' }) }, memberCliqueMap: { 'TAL-1': ['CLQ-1'], 'TAL-2': ['CLQ-1'] } } };
    expect(calculateSocialCrisisModifier('PRJ-1', s)).toBeCloseTo(1.2);
  });

  it('caps at 2.0 maximum', () => {
    const rels: TalentRelationship[] = [];
    for (let i = 0; i < 10; i++) { rels.push(makeRel({ id: 'R' + i, talentAId: 'TAL-1', talentBId: 'T' + (i + 2), type: 'rival', strength: -50 })); }
    const talents: Record<string, any> = { 'TAL-1': createMockTalent({ id: 'TAL-1' }) };
    for (let i = 0; i < 10; i++) { talents['T' + (i + 2)] = createMockTalent({ id: 'T' + (i + 2) }); }
    const s = setupState(rels, talents);
    const ct: Record<string, any> = {};
    for (let i = 0; i < 11; i++) { ct['C' + (i + 1)] = createMockContract({ id: 'C' + (i + 1), projectId: 'PRJ-1', talentId: i === 0 ? 'TAL-1' : 'T' + (i + 1) }); }
    s.entities.contracts = ct;
    s.entities.contractsByProjectId = { 'PRJ-1': Object.keys(ct) };
    expect(calculateSocialCrisisModifier('PRJ-1', s)).toBe(2.0);
  });

  it('only counts feuds between cast members', () => {
    const s = setupState([makeRel({ talentAId: 'TAL-1', talentBId: 'TAL-9', type: 'rival', strength: -50 })], { 'TAL-1': createMockTalent({ id: 'TAL-1' }), 'TAL-2': createMockTalent({ id: 'TAL-2' }), 'TAL-9': createMockTalent({ id: 'TAL-9' }) });
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    expect(calculateSocialCrisisModifier('PRJ-1', s)).toBe(1.0);
  });
});

describe('tickOrganicEvents', () => {
  it('returns empty array when no projects exist', () => {
    const s: any = createMockGameState();
    expect(tickOrganicEvents(s, makeRng())).toEqual([]);
  });

  it('skips projects not in production-like states', () => {
    const s: any = createMockGameState();
    s.entities.projects = { 'PRJ-1': { id: 'PRJ-1', title: 'Dev', state: 'development' } };
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    s.relationships = { relationships: { 'R1': makeRel({ type: 'rival', strength: -50 }) } };
    expect(tickOrganicEvents(s, makeRng())).toEqual([]);
  });

  it('aggregates impacts from crisis checks and scandal generation', () => {
    const talents = { 'TAL-1': createMockTalent({ id: 'TAL-1', name: 'A' }), 'TAL-2': createMockTalent({ id: 'TAL-2', name: 'B' }) };
    const s = setupState([makeRel({ type: 'romantic', isPublic: true, strength: 50, history: [{ week: 9, type: 'breakup', impact: -20, description: 'Split' }] })], talents, { week: 10 });
    s.entities.projects = { 'PRJ-1': { id: 'PRJ-1', title: 'Test', state: 'production' } };
    setContracts(s, 'PRJ-1', 'TAL-1', 'TAL-2');
    const impacts = tickOrganicEvents(s, makeRng());
    expect(impacts.length).toBeGreaterThan(0);
    expect(impacts.some(x => x.type === 'NEWS_ADDED')).toBe(true);
  });
});
