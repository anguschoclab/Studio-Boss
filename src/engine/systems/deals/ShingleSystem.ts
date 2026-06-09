import { GameState, StateImpact, Talent } from '@/engine/types';
import { ProducerShingle, ShingleDealType, ShingleMedium } from '@/engine/types/talent.types';
import { RandomGenerator } from '@/engine/utils/rng';
import { isPlayerOwner, getPlayerId } from '@/engine/utils/ownership';

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
  medium?: ShingleMedium;
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

// TV showrunner overall deals run an order of magnitude above film shingles.
// Shondaland/Netflix, Ryan Murphy/Netflix, Sheridan/Paramount all cleared $25M+/yr
// in real-world overhead. Top-tier (prestige >= 85) trends toward the $75M-$100M band.
const TV_OVERHEAD_RANGES: Record<ShingleDealType, [number, number]> = {
  FIRST_LOOK: [8_000_000, 30_000_000],
  // Top-tier marquee showrunners (prestige 85+, post-2010) command $75M-$150M/yr.
  // The prestige bias multiplier (up to ~1.25x) pushes the ceiling into that band.
  OVERALL: [30_000_000, 120_000_000],
  HOUSEKEEPING: [1_500_000, 5_000_000],
  POD: [4_000_000, 20_000_000]
};

const TERM_YEARS: Record<ShingleDealType, [number, number]> = {
  FIRST_LOOK: [2, 3],
  OVERALL: [3, 5],
  HOUSEKEEPING: [1, 2],
  POD: [2, 3]
};

const TV_TERM_YEARS: Record<ShingleDealType, [number, number]> = {
  FIRST_LOOK: [3, 4],
  OVERALL: [3, 7],
  HOUSEKEEPING: [1, 2],
  POD: [2, 4]
};

function streamingEraWeek(week: number): boolean {
  // Netflix original content era begins ~2010 (week 35 * 52 = 1820).
  return week >= 35 * 52;
}

function yearFromWeek(week: number): number {
  return 1975 + Math.floor(week / 52);
}

function getStudioName(state: GameState, studioId: string | null): string {
  if (!studioId) return 'free agent';
  if (studioId === 'PLAYER') return state.studio?.name || 'Player Studio';
  return state.entities.rivals[studioId]?.name || studioId;
}

function rollOverhead(rng: RandomGenerator, dealType: ShingleDealType, ownerPrestige: number, medium: ShingleMedium = 'FILM'): number {
  const ranges = medium === 'TV' ? TV_OVERHEAD_RANGES : OVERHEAD_RANGES;
  const [lo, hi] = ranges[dealType];
  const prestigeBias = Math.max(0, Math.min(1, (ownerPrestige - 60) / 40));
  // TV marquee deals reward top prestige more steeply (up to 1.4x on top-tier showrunners).
  const mult = medium === 'TV' ? (0.75 + prestigeBias * 0.85) : (0.75 + prestigeBias * 0.5);
  const raw = lo + rng.next() * (hi - lo);
  return Math.round((raw * mult) / 100_000) * 100_000;
}

function rollTermWeeks(rng: RandomGenerator, dealType: ShingleDealType, medium: ShingleMedium = 'FILM'): number {
  const ranges = medium === 'TV' ? TV_TERM_YEARS : TERM_YEARS;
  const [lo, hi] = ranges[dealType];
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

function getTVEligibleTalent(state: GameState): Talent[] {
  // TV showrunner deals go to writers/producers with prestige > 70 who don't already
  // have a shingle. Real-world comps: Shonda Rhimes, Ryan Murphy, Taylor Sheridan, Kenya Barris.
  // ⚡ The Framerate Fanatic: Extracted Set creation and used for...in loops to avoid O(N) array allocation overhead
  const ownedBy = new Set<string>();
  const shingles = state.entities.shingles || {};
  for (const id in shingles) {
    ownedBy.add(shingles[id].ownerTalentId);
  }

  const results: Talent[] = [];
  const talents = state.entities.talents || {};
  for (const id in talents) {
    const t = talents[id];
    if (ownedBy.has(t.id)) continue;
    if ((t.prestige || 0) < 40) continue;
    const roles = t.roles || [t.role];
    if (roles.some(r => r === 'writer' || r === 'producer')) {
      results.push(t);
    }
  }
  return results;
}

function getEligibleTalent(state: GameState): Talent[] {
  // ⚡ The Framerate Fanatic: Extracted Set creation and used for...in loops to avoid O(N) array allocation overhead
  const ownedBy = new Set<string>();
  const shingles = state.entities.shingles || {};
  for (const id in shingles) {
    ownedBy.add(shingles[id].ownerTalentId);
  }

  const results: Talent[] = [];
  const talents = state.entities.talents || {};
  for (const id in talents) {
    const t = talents[id];
    if (ownedBy.has(t.id)) continue;
    // Gate on "top tier of current field": the real A-list cutoff is ~75 but a developing sim-industry
    // rarely grows talent that high, so we accept >= 65 prestige and require a director/producer/actor role.
    if ((t.prestige || 0) < 45) continue;
    const roles = t.roles || [t.role];
    // Pure writer-only or producer-only talents are reserved for TV showrunner deals —
    // exclude them from the film pool so TV has a supply post-2010.
    const hasDirOrActor = roles.some(r => r === 'director' || r === 'actor');
    if (hasDirOrActor) {
      results.push(t);
    }
  }
  return results;
}

function rankBidders(state: GameState): { id: string; archetype: string; cash: number; prestige: number }[] {
  const bidders: { id: string; archetype: string; cash: number; prestige: number }[] = [];
  bidders.push({ id: 'PLAYER', archetype: state.studio?.archetype || 'major', cash: state.finance.cash || 0, prestige: state.studio?.prestige || 0 });

  // ⚡ The Framerate Fanatic: Replaced Object.values with for...in loop
  const rivals = state.entities.rivals || {};
  for (const id in rivals) {
    const r = rivals[id];
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
  // ⚡ The Framerate Fanatic: Replaced Object.values().filter() with a direct for...in loop
  let count = 0;
  const shingles = state.entities.shingles || {};
  for (const id in shingles) {
    if (shingles[id].baseStudioId === studioId) {
      count++;
    }
  }
  return count;
}

function createShingle(
  state: GameState,
  owner: Talent,
  rng: RandomGenerator,
  impacts: StateImpact[],
  medium: ShingleMedium = 'FILM'
): ProducerShingle | null {
  // Rank bidders, filter by solvency + antitrust isn't our concern here.
  const bidders = rankBidders(state);
  // Each bidder evaluates whether it wants to bid — collect their offers.
  type Offer = { id: string; dealType: ShingleDealType; overhead: number; score: number };
  const offers: Offer[] = [];
  // TV deals gravitate toward majors with streamers; for TV we skip indies entirely.
  const streamerOwners = new Set<string>();
  // ⚡ The Framerate Fanatic: Replaced Object.values().filter().map() with a direct for...in loop
  const rivals = state.entities.rivals || {};
  for (const id in rivals) {
    if ((rivals[id].ownedPlatforms || []).length > 0) {
      streamerOwners.add(rivals[id].id);
    }
  }
  // Player owns a streamer at launch for major/mid-tier archetypes — treat as streamer owner too.
  if ((state.studio?.ownedPlatforms || []).length > 0) streamerOwners.add(getPlayerId(state));

  // D1 Player-preference: if the player studio has an active Contract with this talent
  // within the last 2 years, it should score a +20M-equivalent shingle bonus (studios
  // lock up talent they already work with).
  const twoYearWeek = Math.max(0, state.week - 104);
  // ⚡ The Framerate Fanatic: Replaced Object.values().some() with a direct for...in loop
  let playerHasRecentContractWithOwner = false;
  const contracts = state.entities.contracts || {};
  for (const id in contracts) {
    const c = contracts[id] as unknown as Record<string, unknown>;
    if (c.talentId === owner.id && (isPlayerOwner(state, c.ownerId) || !c.ownerId) && ((c.signedWeek || 0) >= twoYearWeek || (c.weeksRemaining || 0) > 0)) {
      playerHasRecentContractWithOwner = true;
      break;
    }
  }

  for (const b of bidders) {
    if (medium === 'TV' && b.archetype === 'indie') continue;
    const existing = countDealsByStudio(state, b.id);
    let dealType = proposeDealType(b.archetype as 'major' | 'mid-tier' | 'indie', b.cash, b.prestige, owner.prestige || 0, existing, rng);
    if (medium === 'TV') {
      // TV showrunner deals skew overall/first-look. Reroll toward OVERALL for high-prestige owners.
      if (!dealType) {
        if (b.cash > 300_000_000 && rng.next() < 0.5) dealType = 'OVERALL';
        else if (b.cash > 100_000_000 && rng.next() < 0.4) dealType = 'FIRST_LOOK';
      } else if (dealType === 'HOUSEKEEPING' || dealType === 'POD') {
        dealType = 'FIRST_LOOK';
      }
    }
    if (!dealType) continue;
    const overhead = rollOverhead(rng, dealType, owner.prestige || 0, medium);
    // TV deals have bigger overhead; require 2-yr coverage instead of 3 to keep mid-tier bidders in the race.
    const coverYears = medium === 'TV' ? 2 : 3;
    if (overhead * coverYears > b.cash) continue;
    // Score: higher cash + archetype weight + willingness => stronger bidder; overhead ties break by amount.
    const archetypeWeight = b.archetype === 'major' ? 1.4 : b.archetype === 'mid-tier' ? 1.0 : 0.6;
    // TV streaming-era bias: streamer-owning rivals are the aggressive post-2010 bidders
    // (Netflix/Shondaland, Netflix/Murphy, Paramount/Sheridan).
    const streamerBias = medium === 'TV' && streamerOwners.has(b.id)
      ? (streamingEraWeek(state.week) ? 20_000_000 : 5_000_000)
      : 0;
    const existingContractBias = (isPlayerOwner(state, b.id) && playerHasRecentContractWithOwner) ? 20_000_000 : 0;
    const score = overhead * archetypeWeight + b.prestige * 50_000 + streamerBias + existingContractBias + rng.next() * 500_000;
    offers.push({ id: b.id, dealType, overhead, score });
  }
  // D3 Housekeeping fallback — when an owner's prestige is low and no top-tier bidder
  // wanted them at OVERALL/FIRST_LOOK, mid-tiers/indies will still throw a cheap
  // housekeeping dev deal to keep them close (real-world backlot housekeeping).
  // Also fire when existing offers are all top-tier but the owner is only mid-prestige —
  // a housekeeping bid is the realistic outcome for a marginal A-list hopeful.
  const topTierOfferExists = offers.some(o => o.dealType === 'OVERALL' || o.dealType === 'FIRST_LOOK');
  const wantsFallback = medium === 'FILM' && (owner.prestige || 0) < 60 && (offers.length === 0 || !topTierOfferExists);
  if (wantsFallback) {
    for (const b of bidders) {
      if (b.cash < 20_000_000) continue;
      if (countDealsByStudio(state, b.id) >= 4) continue;
      if (rng.next() > 0.55) continue;
      const overhead = rollOverhead(rng, 'HOUSEKEEPING', owner.prestige || 0, 'FILM');
      if (overhead * 3 > b.cash) continue;
      const archetypeWeight = b.archetype === 'major' ? 1.2 : b.archetype === 'mid-tier' ? 1.0 : 0.8;
      offers.push({ id: b.id, dealType: 'HOUSEKEEPING', overhead, score: overhead * archetypeWeight + rng.next() * 500_000 });
    }
  }
  if (offers.length === 0) return null;
  offers.sort((a, b) => b.score - a.score);
  const winner = offers[0];
  const termWeeks = rollTermWeeks(rng, winner.dealType, medium);
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
    medium,
    historyTrail: [{ week: state.week, studioId: winner.id, dealType: winner.dealType, overhead: winner.overhead }]
  };
  impacts.push({ type: 'SHINGLE_CREATED', payload: { shingle } });
  const mediumLabel = medium === 'TV' ? 'TV showrunner ' : '';
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `${yearFromWeek(state.week)}: ${owner.name}'s ${shingle.name} signs ${mediumLabel}${winner.dealType.replace('_', '-').toLowerCase()} with ${getStudioName(state, winner.id)}, $${(winner.overhead / 1e6).toFixed(1)}M/yr, ${Math.round(termWeeks / 52)}yr`,
      description: `${owner.name} (prestige ${Math.round(owner.prestige || 0)}) has anchored ${shingle.name} at ${getStudioName(state, winner.id)}${medium === 'TV' ? ' as an exclusive TV showrunner' : ''}.`,
      category: 'market'
    }
  });
  shingleEventLog.push({
    week: state.week, year: yearFromWeek(state.week),
    kind: 'formed', shingleId: shingle.id, shingleName: shingle.name,
    ownerName: owner.name, studioId: winner.id, studioName: getStudioName(state, winner.id),
    dealType: winner.dealType, overheadPerYear: winner.overhead, termYears: Math.round(termWeeks / 52),
    medium
  });
  return shingle;
}

function chargeOverhead(state: GameState, impacts: StateImpact[]) {
  // ⚡ The Framerate Fanatic: Replaced Object.values with for...in loop
  const shingles = state.entities.shingles || {};
  for (const id in shingles) {
    const s = shingles[id];
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
        });
      }
    }
  }
}

function decrementTerms(state: GameState, rng: RandomGenerator, impacts: StateImpact[]) {
  // ⚡ The Framerate Fanatic: Replaced Object.values with for...in loop
  const shingles = state.entities.shingles || {};
  for (const id in shingles) {
    const s = shingles[id];
    const next = (s.termWeeksRemaining || 0) - 1;
    if (next > 0) {
      impacts.push({ type: 'SHINGLE_UPDATED', payload: { shingleId: s.id, update: { termWeeksRemaining: next } } });
      continue;
    }
    // Term expired — renegotiate or churn.
    handleExpiry(state, s, rng, impacts);
  }
}

function handleExpiry(state: GameState, s: ProducerShingle, rng: RandomGenerator, impacts: StateImpact[]) {
  const owner = state.entities.talents[s.ownerTalentId];
  if (!owner) {
    impacts.push({ type: 'SHINGLE_DISSOLVED', payload: { shingleId: s.id } });
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
  const medium: ShingleMedium = (s as unknown as { medium?: string }).medium === 'TV' ? 'TV' : 'FILM';
  type Offer = { id: string; dealType: ShingleDealType; overhead: number; score: number };
  const offers: Offer[] = [];
  for (const b of bidders) {
    if (medium === 'TV' && b.archetype === 'indie') continue;
    const existing = countDealsByStudio(state, b.id);
    let dealType = proposeDealType(b.archetype as 'major' | 'mid-tier' | 'indie', b.cash, b.prestige, owner.prestige || 0, existing, rng);
    // Home studio gets a guaranteed renewal bid — real studios rarely let an overhead deal lapse silently.
    if (!dealType && b.id === s.baseStudioId && b.cash > s.overheadPerYear * 3) dealType = s.dealType;
    // Tier preservation: the home studio does NOT reroll a fresh tier on renewal — it
    // preserves the current dealType (OVERALL stays OVERALL) as long as the studio can
    // cover the overhead. Losing the deal entirely is the realistic alternative to downgrade.
    if (b.id === s.baseStudioId && dealType && dealType !== s.dealType) {
      dealType = s.dealType;
    }
    if (!dealType) continue;
    let overhead = rollOverhead(rng, dealType, owner.prestige || 0, medium);
    // Renewals within the SAME tier scale off the prior overhead with a slight escalation
    // (+5-15% for hits, flat for steady), not a fresh roll that can collapse a $30M/yr OVERALL
    // into $2M on bad luck.
    if (b.id === s.baseStudioId && dealType === s.dealType) {
      const escalation = hasHits ? 1 + 0.05 + rng.next() * 0.10 : 1 + rng.next() * 0.03;
      overhead = Math.max(overhead, Math.round(s.overheadPerYear * escalation / 100_000) * 100_000);
    }
    if (overhead * 3 > b.cash) continue;
    const archetypeWeight = b.archetype === 'major' ? 1.4 : b.archetype === 'mid-tier' ? 1.0 : 0.6;
    // Strong renewal bias: real studios keep their overhead homes ~80% of cycles; churn is the exception.
    const renewalBias = b.id === s.baseStudioId ? 8_000_000 : 0;
    const score = overhead * archetypeWeight + b.prestige * 50_000 + renewalBias + (hasHits ? 800_000 : 0) + rng.next() * 500_000;
    offers.push({ id: b.id, dealType, overhead, score });
  }
  if (offers.length === 0) {
    // Free agent now; will retry next year or pitch open market.
    impacts.push({ type: 'SHINGLE_UPDATED', payload: { shingleId: s.id, update: { baseStudioId: null, termWeeksRemaining: 52, dealType: 'HOUSEKEEPING', overheadPerYear: 0 } } });
    shingleEventLog.push({
      week: state.week, year: yearFromWeek(state.week), kind: 'expired',
      shingleId: s.id, shingleName: s.name, ownerName: owner.name,
      studioName: getStudioName(state, s.baseStudioId), note: 'No suitor, became free agent'
    });
    return;
  }
  offers.sort((a, b) => b.score - a.score);
  const winner = offers[0];
  const termWeeks = rollTermWeeks(rng, winner.dealType, medium);
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
  });
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
    medium,
    note: churned ? `Left ${prior}` : undefined
  });
}

function spawnShingles(state: GameState, rng: RandomGenerator, impacts: StateImpact[]) {
  // ⚡ The Framerate Fanatic: Replaced Object.values().filter() with a single for...in loop for active counts
  let activeTotal = 0;
  let activeTV = 0;
  const shingles = state.entities.shingles || {};
  for (const id in shingles) {
    const s = shingles[id];
    if (s.baseStudioId) {
      activeTotal++;
      if (s.medium === 'TV') activeTV++;
    }
  }

  // TV showrunner overall deals first so writer/producer prestige talent has a shot at TV
  // before the film spawn claims them. Clustered post-2000 when streaming era unlocks
  // aggressive streamer bidding (Shondaland/Netflix, Murphy/Netflix, Sheridan/Paramount).
  const tvEligible = getTVEligibleTalent(state);
  const year = 1975 + Math.floor(state.week / 52);
  let tvGate = 0.0005;
  if (year >= 2010) tvGate = 0.008;
  else if (year >= 2000) tvGate = 0.0035;
  else if (year >= 1990) tvGate = 0.001;
  if (tvEligible.length > 0 && activeTV < 6 && rng.next() < tvGate) {
    const owner = rng.pick(tvEligible);
    if (owner) {
      const made = createShingle(state, owner, rng, impacts, 'TV');
      if (made) return; // one formation-attempt per tick keeps the news cycle legible
    }
  }

  // Film shingles: spawn target ~8-20 over 50 years.
  const eligible = getEligibleTalent(state);
  if (eligible.length > 0 && activeTotal < 12 && rng.next() < 0.008) {
    const owner = rng.pick(eligible);
    if (owner) createShingle(state, owner, rng, impacts, 'FILM');
  }
  // Housekeeping-tier spawn: a lower-prestige eligibility path runs occasionally so the
  // fallback D3 housekeeping bids actually get a supply of sub-A-list owners. This keeps
  // 3-6 HOUSEKEEPING formations across a 50-year run (realistic Carsey-Werner-style
  // backlot dev-deal presence).
  // ⚡ The Framerate Fanatic: Extracted Set creation and used for...in loop
  const ownedBy = new Set<string>();
  for (const id in shingles) {
    ownedBy.add(shingles[id].ownerTalentId);
  }

  const lowProspect: Talent[] = [];
  const talents = state.entities.talents || {};
  for (const id in talents) {
    const t = talents[id];
    if (ownedBy.has(t.id)) continue;
    const p = t.prestige || 0;
    if (p >= 30 && p < 50) {
      const roles = t.roles || [t.role];
      if (roles.some(r => r === 'director' || r === 'actor' || r === 'producer' || r === 'writer')) {
        lowProspect.push(t);
      }
    }
  }

  if (lowProspect.length > 0 && activeTotal < 14 && rng.next() < 0.004) {
    const owner = rng.pick(lowProspect);
    if (owner) createHousekeepingShingle(state, owner, rng, impacts);
  }

  // POD (Producer-On-Deal) path — writer-specialty mid-prestige talent get cheap
  // exclusive dev deals. Targets 1-3 per decade (~0.0006/wk baseline).
  // ⚡ The Framerate Fanatic: Extracted Set creation and used for...in loop (reusing ownedBy set)
  const podEligible: Talent[] = [];
  for (const id in talents) {
    const t = talents[id];
    if (ownedBy.has(t.id)) continue;
    const p = t.prestige || 0;
    if (p < 50 || p > 75) continue;
    const roles = t.roles || [t.role];
    if (roles.some(r => r === 'writer')) {
      podEligible.push(t);
    }
  }

  if (podEligible.length > 0 && activeTotal < 16 && rng.next() < 0.0008) {
    const owner = rng.pick(podEligible);
    if (owner) createPodShingle(state, owner, rng, impacts);
  }
}

function createPodShingle(state: GameState, owner: Talent, rng: RandomGenerator, impacts: StateImpact[]): ProducerShingle | null {
  const bidders = rankBidders(state);
  type Offer = { id: string; overhead: number; score: number };
  const offers: Offer[] = [];
  for (const b of bidders) {
    if (b.archetype === 'indie') continue;
    if (b.cash < 30_000_000) continue;
    if (countDealsByStudio(state, b.id) >= 5) continue;
    if (rng.next() > 0.5) continue;
    const overhead = rollOverhead(rng, 'POD', owner.prestige || 0, 'FILM');
    if (overhead * 3 > b.cash) continue;
    const archetypeWeight = b.archetype === 'major' ? 1.3 : 1.0;
    offers.push({ id: b.id, overhead, score: overhead * archetypeWeight + rng.next() * 500_000 });
  }
  if (offers.length === 0) return null;
  offers.sort((a, b) => b.score - a.score);
  const winner = offers[0];
  const termWeeks = rollTermWeeks(rng, 'POD', 'FILM');
  const shingle: ProducerShingle = {
    id: rng.uuid('shingle'),
    name: makeShingleName(owner.name, rng),
    ownerTalentId: owner.id,
    baseStudioId: winner.id,
    dealType: 'POD',
    overheadPerYear: winner.overhead,
    termWeeksRemaining: termWeeks,
    exclusivity: true,
    foundedWeek: state.week,
    pitchesGenerated: 0,
    pitchesAccepted: 0,
    medium: 'FILM',
    historyTrail: [{ week: state.week, studioId: winner.id, dealType: 'POD', overhead: winner.overhead }]
  };
  impacts.push({ type: 'SHINGLE_CREATED', payload: { shingle } });
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `${yearFromWeek(state.week)}: ${owner.name} signs POD deal with ${getStudioName(state, winner.id)}, $${(winner.overhead / 1e6).toFixed(1)}M/yr`,
      description: `${owner.name} has an exclusive producer-on-deal arrangement at ${getStudioName(state, winner.id)}.`,
      category: 'market'
    }
  });
  shingleEventLog.push({
    week: state.week, year: yearFromWeek(state.week),
    kind: 'formed', shingleId: shingle.id, shingleName: shingle.name,
    ownerName: owner.name, studioId: winner.id, studioName: getStudioName(state, winner.id),
    dealType: 'POD', overheadPerYear: winner.overhead, termYears: Math.round(termWeeks / 52),
    medium: 'FILM'
  });
  return shingle;
}

/**
 * Creates a HOUSEKEEPING-only shingle (D3 housekeeping pipeline). Real studios maintain
 * a stable of sub-A-list producers under cheap dev deals; this ensures 3-6 form over 50yr.
 */
function createHousekeepingShingle(state: GameState, owner: Talent, rng: RandomGenerator, impacts: StateImpact[]): ProducerShingle | null {
  const bidders = rankBidders(state);
  type Offer = { id: string; overhead: number; score: number };
  const offers: Offer[] = [];
  for (const b of bidders) {
    if (b.cash < 20_000_000) continue;
    if (countDealsByStudio(state, b.id) >= 4) continue;
    if (rng.next() > 0.4) continue;
    const overhead = rollOverhead(rng, 'HOUSEKEEPING', owner.prestige || 0, 'FILM');
    if (overhead * 3 > b.cash) continue;
    const archetypeWeight = b.archetype === 'major' ? 1.2 : b.archetype === 'mid-tier' ? 1.1 : 0.9;
    offers.push({ id: b.id, overhead, score: overhead * archetypeWeight + rng.next() * 500_000 });
  }
  if (offers.length === 0) return null;
  offers.sort((a, b) => b.score - a.score);
  const winner = offers[0];
  const termWeeks = rollTermWeeks(rng, 'HOUSEKEEPING', 'FILM');
  const shingle: ProducerShingle = {
    id: rng.uuid('shingle'),
    name: makeShingleName(owner.name, rng),
    ownerTalentId: owner.id,
    baseStudioId: winner.id,
    dealType: 'HOUSEKEEPING',
    overheadPerYear: winner.overhead,
    termWeeksRemaining: termWeeks,
    exclusivity: false,
    foundedWeek: state.week,
    pitchesGenerated: 0,
    pitchesAccepted: 0,
    medium: 'FILM',
    historyTrail: [{ week: state.week, studioId: winner.id, dealType: 'HOUSEKEEPING', overhead: winner.overhead }]
  };
  impacts.push({ type: 'SHINGLE_CREATED', payload: { shingle } });
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `${yearFromWeek(state.week)}: ${owner.name} signs housekeeping with ${getStudioName(state, winner.id)}, $${(winner.overhead / 1e6).toFixed(1)}M/yr`,
      description: `${owner.name} has set up a cheap dev deal at ${getStudioName(state, winner.id)}.`,
      category: 'market'
    }
  });
  shingleEventLog.push({
    week: state.week, year: yearFromWeek(state.week),
    kind: 'formed', shingleId: shingle.id, shingleName: shingle.name,
    ownerName: owner.name, studioId: winner.id, studioName: getStudioName(state, winner.id),
    dealType: 'HOUSEKEEPING', overheadPerYear: winner.overhead, termYears: Math.round(termWeeks / 52),
    medium: 'FILM'
  });
  return shingle;
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
  // ⚡ The Framerate Fanatic: Replaced Object.values().filter() with a for...in loop
  const shinglesList: ProducerShingle[] = [];
  const shingles = state.entities.shingles || {};
  for (const id in shingles) {
    if (shingles[id].baseStudioId === studioId) {
      shinglesList.push(shingles[id]);
    }
  }
  if (shinglesList.length === 0) return null;
  shinglesList.sort((a, b) => b.overheadPerYear - a.overheadPerYear);
  const target = shinglesList[0];
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
      });
    }
  }
  // Convert shingle to free-agent (no studio, zero overhead).
  impacts.push({
    type: 'SHINGLE_UPDATED',
    payload: {
      shingleId: target.id,
      update: { baseStudioId: null, overheadPerYear: 0, dealType: 'HOUSEKEEPING', exclusivity: false, termWeeksRemaining: 52 }
    }
  });
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
