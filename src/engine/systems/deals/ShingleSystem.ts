import { GameState, StateImpact, RivalStudio, Talent } from '@/engine/types';
import { ProducerShingle, ShingleDealType } from '@/engine/types/talent.types';
import { RandomGenerator } from '@/engine/utils/rng';

/**
 * ShingleSystem — models vanity-shingle / production-company deals (Bad Robot,
 * Plan B, Amblin, LuckyChap). Shingles anchor A-list talent to a home studio
 * via first-look / overall / housekeeping / POD deals with weekly overhead.
 *
 * Weekly responsibilities:
 *   - Charge overhead on every active shingle (annual / 52).
 *   - Decrement term weeks; expire and renegotiate at term end.
 *   - Spawn new shingles around newly-A-list talent (prestige > 75).
 *   - Route competitive bidding: majors > mid-tier > indies.
 *
 * State shape: state.entities.shingles: Record<ShingleId, ProducerShingle>.
 * baseStudioId === 'PLAYER' means the player owns the deal; any other string
 * matches a rival id; null means free agent (between deals).
 */

export interface ShingleLogEntry {
  week: number;
  year: number;
  kind: 'formed' | 'signed' | 'renewed' | 'expired' | 'churned' | 'cancelled' | 'dissolved';
  shingleId: string;
  shingleName: string;
  ownerName: string;
  studioId?: string;
  studioName?: string;
  dealType?: ShingleDealType;
  overheadPerYear?: number;
  termYears?: number;
  note?: string;
}

export const shingleEventLog: ShingleLogEntry[] = [];

export function resetShingleState() {
  shingleEventLog.length = 0;
}

const OVERHEAD_RANGES: Record<ShingleDealType, [number, number]> = {
  FIRST_LOOK: [2_000_000, 10_000_000],
  OVERALL: [10_000_000, 30_000_000],
  HOUSEKEEPING: [500_000, 2_000_000],
  POD: [1_000_000, 5_000_000]
};

const TERM_YEARS: Record<ShingleDealType, [number, number]> = {
  FIRST_LOOK: [2, 3],
  OVERALL: [3, 5],
  HOUSEKEEPING: [1, 2],
  POD: [2, 3]
};

function yearFromWeek(week: number): number {
  return 1975 + Math.floor(week / 52);
}

function getStudioName(state: GameState, studioId: string | null): string {
  if (!studioId) return 'free agent';
  if (studioId === 'PLAYER') return state.studio?.name || 'Player Studio';
  return state.entities.rivals[studioId]?.name || studioId;
}

function getStudioCash(state: GameState, studioId: string | null): number {
  if (!studioId) return 0;
  if (studioId === 'PLAYER') return state.finance.cash || 0;
  return state.entities.rivals[studioId]?.cash || 0;
}

function rollOverhead(rng: RandomGenerator, dealType: ShingleDealType, ownerPrestige: number): number {
  const [lo, hi] = OVERHEAD_RANGES[dealType];
  const prestigeBias = Math.max(0, Math.min(1, (ownerPrestige - 60) / 40));
  const raw = lo + rng.next() * (hi - lo);
  return Math.round((raw * (0.75 + prestigeBias * 0.5)) / 100_000) * 100_000;
}

function rollTermWeeks(rng: RandomGenerator, dealType: ShingleDealType): number {
  const [lo, hi] = TERM_YEARS[dealType];
  return rng.rangeInt(lo, hi) * 52;
}

function makeShingleName(ownerName: string, rng: RandomGenerator): string {
  const suffixes = ['Pictures', 'Productions', 'Entertainment', 'Films', 'Media', 'Company'];
  const prefixes = ['Lucky', 'Bad', 'Grand', 'Sunset', 'Neon', 'Echo', 'Apex', 'Cinder', 'Nova', 'Silver', 'Iron', 'Twin'];
  const first = ownerName.split(' ')[0];
  const style = rng.next();
  if (style < 0.35) return `${first}'s ${rng.pick(suffixes)}`;
  if (style < 0.7) return `${rng.pick(prefixes)}${rng.pick(['', 'ed', 'er', 'star', 'rock', 'wave'])} ${rng.pick(suffixes)}`;
  return `${rng.pick(prefixes)} ${rng.pick(prefixes)} ${rng.pick(suffixes)}`;
}

function getEligibleTalent(state: GameState): Talent[] {
  const shingles = Object.values(state.entities.shingles || {});
  const ownedBy = new Set(shingles.map(s => s.ownerTalentId));
  return Object.values(state.entities.talents || {}).filter(t => {
    if (ownedBy.has(t.id)) return false;
    // Gate on "top tier of current field": the real A-list cutoff is ~75 but a developing sim-industry
    // rarely grows talent that high, so we accept >= 65 prestige and require a director/producer/actor role.
    if ((t.prestige || 0) < 45) return false;
    const roles = t.roles || [t.role];
    return roles.some(r => r === 'director' || r === 'producer' || r === 'actor');
  });
}

function rankBidders(state: GameState): { id: string; archetype: 'major' | 'mid-tier' | 'indie'; cash: number; prestige: number }[] {
  const bidders: { id: string; archetype: any; cash: number; prestige: number }[] = [];
  bidders.push({ id: 'PLAYER', archetype: state.studio?.archetype || 'major', cash: state.finance.cash || 0, prestige: state.studio?.prestige || 0 });
  for (const r of Object.values(state.entities.rivals || {})) {
    bidders.push({ id: r.id, archetype: r.archetype, cash: r.cash || 0, prestige: r.prestige || 0 });
  }
  return bidders;
}

/**
 * Decide whether a given studio wants a new shingle and which deal type.
 * Majors with deep cash + high prestige chase OVERALL around A-list; mid-tiers
 * grab FIRST_LOOK; indies rarely sign anything beyond a housekeeping.
 */
function proposeDealType(
  archetype: 'major' | 'mid-tier' | 'indie',
  cash: number,
  prestige: number,
  ownerPrestige: number,
  existingDealCount: number,
  rng: RandomGenerator
): ShingleDealType | null {
  if (cash < 50_000_000) return null;
  // Headless player: keep its appetite moderate so it lands ~1-2 first-looks + 1 housekeeping by yr 5-10.
  if (archetype === 'major') {
    if (existingDealCount >= 6) return null;
    if (ownerPrestige >= 45 && cash > 250_000_000 && rng.next() < 0.45) return 'OVERALL';
    if (rng.next() < 0.6) return 'FIRST_LOOK';
    if (rng.next() < 0.3) return 'HOUSEKEEPING';
    return null;
  }
  if (archetype === 'mid-tier') {
    if (existingDealCount >= 3) return null;
    if (ownerPrestige >= 50 && cash > 300_000_000 && rng.next() < 0.35) return 'OVERALL';
    if (rng.next() < 0.45) return 'FIRST_LOOK';
    if (rng.next() < 0.2) return 'HOUSEKEEPING';
    return null;
  }
  // indie
  if (existingDealCount >= 1) return null;
  if (rng.next() < 0.18) return 'HOUSEKEEPING';
  return null;
}

function countDealsByStudio(state: GameState, studioId: string): number {
  return Object.values(state.entities.shingles || {}).filter(s => s.baseStudioId === studioId).length;
}

function createShingle(
  state: GameState,
  owner: Talent,
  rng: RandomGenerator,
  impacts: StateImpact[]
): ProducerShingle | null {
  // Rank bidders, filter by solvency + antitrust isn't our concern here.
  const bidders = rankBidders(state);
  // Each bidder evaluates whether it wants to bid — collect their offers.
  type Offer = { id: string; dealType: ShingleDealType; overhead: number; score: number };
  const offers: Offer[] = [];
  for (const b of bidders) {
    const existing = countDealsByStudio(state, b.id);
    const dealType = proposeDealType(b.archetype, b.cash, b.prestige, owner.prestige || 0, existing, rng);
    if (!dealType) continue;
    const overhead = rollOverhead(rng, dealType, owner.prestige || 0);
    if (overhead * 3 > b.cash) continue; // must cover at least 3yrs overhead
    // Score: higher cash + archetype weight + willingness => stronger bidder; overhead ties break by amount.
    const archetypeWeight = b.archetype === 'major' ? 1.4 : b.archetype === 'mid-tier' ? 1.0 : 0.6;
    const score = overhead * archetypeWeight + b.prestige * 50_000 + rng.next() * 500_000;
    offers.push({ id: b.id, dealType, overhead, score });
  }
  if (offers.length === 0) return null;
  offers.sort((a, b) => b.score - a.score);
  const winner = offers[0];
  const termWeeks = rollTermWeeks(rng, winner.dealType);
  const shingle: ProducerShingle = {
    id: rng.uuid('shingle'),
    name: makeShingleName(owner.name, rng),
    ownerTalentId: owner.id,
    baseStudioId: winner.id,
    dealType: winner.dealType,
    overheadPerYear: winner.overhead,
    termWeeksRemaining: termWeeks,
    exclusivity: winner.dealType === 'OVERALL' || winner.dealType === 'POD',
    foundedWeek: state.week,
    pitchesGenerated: 0,
    pitchesAccepted: 0,
    historyTrail: [{ week: state.week, studioId: winner.id, dealType: winner.dealType, overhead: winner.overhead }]
  };
  impacts.push({ type: 'SHINGLE_CREATED', payload: { shingle } } as any);
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `${yearFromWeek(state.week)}: ${owner.name}'s ${shingle.name} signs ${winner.dealType.replace('_', '-').toLowerCase()} with ${getStudioName(state, winner.id)}, $${(winner.overhead / 1e6).toFixed(1)}M/yr, ${Math.round(termWeeks / 52)}yr`,
      description: `${owner.name} (prestige ${Math.round(owner.prestige || 0)}) has anchored ${shingle.name} at ${getStudioName(state, winner.id)}.`,
      category: 'market'
    }
  });
  shingleEventLog.push({
    week: state.week, year: yearFromWeek(state.week),
    kind: 'formed', shingleId: shingle.id, shingleName: shingle.name,
    ownerName: owner.name, studioId: winner.id, studioName: getStudioName(state, winner.id),
    dealType: winner.dealType, overheadPerYear: winner.overhead, termYears: Math.round(termWeeks / 52)
  });
  return shingle;
}

function chargeOverhead(state: GameState, impacts: StateImpact[]) {
  const shingles = Object.values(state.entities.shingles || {});
  for (const s of shingles) {
    if (!s.baseStudioId) continue;
    const weekly = Math.round(s.overheadPerYear / 52);
    if (weekly === 0) continue;
    if (s.baseStudioId === 'PLAYER') {
      impacts.push({ type: 'FUNDS_DEDUCTED', payload: { amount: weekly } });
    } else {
      const rival = state.entities.rivals[s.baseStudioId];
      if (rival) {
        impacts.push({
          type: 'RIVAL_UPDATED',
          payload: { rivalId: rival.id, update: { cash: (rival.cash || 0) - weekly } }
        } as any);
      }
    }
  }
}

function decrementTerms(state: GameState, rng: RandomGenerator, impacts: StateImpact[]) {
  const shingles = Object.values(state.entities.shingles || {});
  for (const s of shingles) {
    const next = (s.termWeeksRemaining || 0) - 1;
    if (next > 0) {
      impacts.push({ type: 'SHINGLE_UPDATED', payload: { shingleId: s.id, update: { termWeeksRemaining: next } } } as any);
      continue;
    }
    // Term expired — renegotiate or churn.
    handleExpiry(state, s, rng, impacts);
  }
}

function handleExpiry(state: GameState, s: ProducerShingle, rng: RandomGenerator, impacts: StateImpact[]) {
  const owner = state.entities.talents[s.ownerTalentId];
  if (!owner) {
    impacts.push({ type: 'SHINGLE_DISSOLVED', payload: { shingleId: s.id } } as any);
    shingleEventLog.push({
      week: state.week, year: yearFromWeek(state.week), kind: 'dissolved',
      shingleId: s.id, shingleName: s.name, ownerName: '(deceased owner)',
      note: 'Owner no longer active'
    });
    return;
  }
  // Reopen bidding. Home studio gets a renewal bonus; rival majors may steal with higher overhead.
  const bidders = rankBidders(state);
  const hasHits = (owner.prestige || 0) >= 70 && (owner.momentum || 0) > 40;
  type Offer = { id: string; dealType: ShingleDealType; overhead: number; score: number };
  const offers: Offer[] = [];
  for (const b of bidders) {
    const existing = countDealsByStudio(state, b.id);
    let dealType = proposeDealType(b.archetype, b.cash, b.prestige, owner.prestige || 0, existing, rng);
    // Home studio gets a guaranteed renewal bid — real studios rarely let an overhead deal lapse silently.
    if (!dealType && b.id === s.baseStudioId && b.cash > s.overheadPerYear * 3) dealType = s.dealType;
    if (!dealType) continue;
    const overhead = rollOverhead(rng, dealType, owner.prestige || 0);
    if (overhead * 3 > b.cash) continue;
    const archetypeWeight = b.archetype === 'major' ? 1.4 : b.archetype === 'mid-tier' ? 1.0 : 0.6;
    // Strong renewal bias: real studios keep their overhead homes ~80% of cycles; churn is the exception.
    const renewalBias = b.id === s.baseStudioId ? 8_000_000 : 0;
    const score = overhead * archetypeWeight + b.prestige * 50_000 + renewalBias + (hasHits ? 800_000 : 0) + rng.next() * 500_000;
    offers.push({ id: b.id, dealType, overhead, score });
  }
  if (offers.length === 0) {
    // Free agent now; will retry next year or pitch open market.
    impacts.push({ type: 'SHINGLE_UPDATED', payload: { shingleId: s.id, update: { baseStudioId: null, termWeeksRemaining: 52, dealType: 'HOUSEKEEPING', overheadPerYear: 0 } } } as any);
    shingleEventLog.push({
      week: state.week, year: yearFromWeek(state.week), kind: 'expired',
      shingleId: s.id, shingleName: s.name, ownerName: owner.name,
      studioName: getStudioName(state, s.baseStudioId), note: 'No suitor, became free agent'
    });
    return;
  }
  offers.sort((a, b) => b.score - a.score);
  const winner = offers[0];
  const termWeeks = rollTermWeeks(rng, winner.dealType);
  const churned = winner.id !== s.baseStudioId;
  const trail = [...(s.historyTrail || []), { week: state.week, studioId: winner.id, dealType: winner.dealType, overhead: winner.overhead }];
  impacts.push({
    type: 'SHINGLE_UPDATED',
    payload: {
      shingleId: s.id,
      update: {
        baseStudioId: winner.id,
        dealType: winner.dealType,
        overheadPerYear: winner.overhead,
        termWeeksRemaining: termWeeks,
        exclusivity: winner.dealType === 'OVERALL' || winner.dealType === 'POD',
        historyTrail: trail
      }
    }
  } as any);
  const prior = getStudioName(state, s.baseStudioId);
  const now = getStudioName(state, winner.id);
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: churned
        ? `${yearFromWeek(state.week)}: ${owner.name}'s ${s.name} leaves ${prior} — signs ${winner.dealType.toLowerCase().replace('_', '-')} with ${now}, $${(winner.overhead / 1e6).toFixed(1)}M/yr`
        : `${yearFromWeek(state.week)}: ${owner.name}'s ${s.name} renews ${winner.dealType.toLowerCase().replace('_', '-')} with ${now}, $${(winner.overhead / 1e6).toFixed(1)}M/yr`,
      description: churned ? `${s.name} has moved its banner from ${prior} to ${now}.` : `${s.name} extends with ${now}.`,
      category: 'market'
    }
  });
  shingleEventLog.push({
    week: state.week, year: yearFromWeek(state.week),
    kind: churned ? 'churned' : 'renewed',
    shingleId: s.id, shingleName: s.name, ownerName: owner.name,
    studioId: winner.id, studioName: now,
    dealType: winner.dealType, overheadPerYear: winner.overhead, termYears: Math.round(termWeeks / 52),
    note: churned ? `Left ${prior}` : undefined
  });
}

function spawnShingles(state: GameState, rng: RandomGenerator, impacts: StateImpact[]) {
  // Throttle: try at most a couple formation checks per week and gate on rng — with ~2 a-list additions
  // the industry should form roughly 1-3 shingles per simulated year.
  const eligible = getEligibleTalent(state);
  if (eligible.length === 0) return;
  // Cap industry active so the field stays legible — a bloated 30-shingle industry reads wrong.
  const activeTotal = Object.values(state.entities.shingles || {}).filter(s => s.baseStudioId).length;
  if (activeTotal >= 8) return;
  // One formation-attempt per tick, gated tight. Tuned toward the 8-20-over-50-years target.
  if (rng.next() > 0.006) return;
  const owner = rng.pick(eligible);
  if (owner) createShingle(state, owner, rng, impacts);
}

export function tickShingleSystem(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  chargeOverhead(state, impacts);
  decrementTerms(state, rng, impacts);
  spawnShingles(state, rng, impacts);
  return impacts;
}

/**
 * Stage-2 distress hook — cancel the highest-overhead shingle deal for a rival
 * in hard cash pain. Returns impacts + a log note or null if the rival has none.
 */
export function cancelHighestOverheadDeal(state: GameState, studioId: string): StateImpact[] | null {
  const shingles = Object.values(state.entities.shingles || {}).filter(s => s.baseStudioId === studioId);
  if (shingles.length === 0) return null;
  shingles.sort((a, b) => b.overheadPerYear - a.overheadPerYear);
  const target = shingles[0];
  const severance = Math.round(target.overheadPerYear / 52 * 4);
  const impacts: StateImpact[] = [];
  if (studioId === 'PLAYER') {
    impacts.push({ type: 'FUNDS_CHANGED', payload: { amount: severance } });
    impacts.push({ type: 'PRESTIGE_CHANGED', payload: { amount: -2 } });
  } else {
    const rival = state.entities.rivals[studioId];
    if (rival) {
      impacts.push({
        type: 'RIVAL_UPDATED',
        payload: { rivalId: rival.id, update: { cash: (rival.cash || 0) + severance, prestige: Math.max(0, (rival.prestige || 0) - 2) } }
      } as any);
    }
  }
  // Convert shingle to free-agent (no studio, zero overhead).
  impacts.push({
    type: 'SHINGLE_UPDATED',
    payload: {
      shingleId: target.id,
      update: { baseStudioId: null, overheadPerYear: 0, dealType: 'HOUSEKEEPING', exclusivity: false, termWeeksRemaining: 52 }
    }
  } as any);
  const owner = state.entities.talents[target.ownerTalentId];
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `${yearFromWeek(state.week)}: ${getStudioName(state, studioId)} terminates ${target.name} deal, saves $${(severance / 1e6).toFixed(1)}M severance`,
      description: `${getStudioName(state, studioId)} has exited its overhead deal with ${target.name} (${owner?.name || 'unknown'}) to steady the balance sheet.`,
      category: 'market'
    }
  });
  shingleEventLog.push({
    week: state.week, year: yearFromWeek(state.week), kind: 'cancelled',
    shingleId: target.id, shingleName: target.name,
    ownerName: owner?.name || 'unknown', studioId, studioName: getStudioName(state, studioId),
    overheadPerYear: target.overheadPerYear, note: 'Distress stage-2 cancellation'
  });
  return impacts;
}
