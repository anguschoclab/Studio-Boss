import { GameState, StateImpact, RivalStudio } from '@/engine/types';
import { secureRandom, pick } from '../../utils';

/**
 * Antitrust — concentration monitor + occasional interventions.
 *
 * Real-world anchors: Paramount Decrees (1948), FTC/DOJ blocks on Disney/Fox
 * carveouts, EU blocking Penguin-RH/S&S (2022), FTC on Microsoft/Activision.
 * Two knobs trigger action: top-3 cash share > 65%, or top-1 > 35%.
 */

const TOP3_THRESHOLD = 0.70;
const TOP1_THRESHOLD = 0.40;
const ACTION_COOLDOWN_WEEKS = 260; // ~5 years between interventions so 50-year run yields ~2-3
const MIN_POSITIVE_COUNT = 5; // need enough solvent players for a share metric to be meaningful
const DIVEST_NAMES = ['Beacon Pictures', 'Resolute Films', 'Openfield Studios', 'Commons Media', 'Public Square Pictures'];

export interface AntitrustEvent {
  week: number;
  year: number;
  kind: 'block-warning' | 'divestiture' | 'fine';
  dominantId: string;
  dominantName: string;
  topShare: number;
  top3Share: number;
  note: string;
}

// Exposed module-level log; run-simulation reads it after the sim completes.
export const antitrustEventLog: AntitrustEvent[] = [];
export const antitrustBlockList: { acquirerId: string; untilWeek: number }[] = [];
let lastActionWeek = -9999;

export function resetAntitrustState() {
  antitrustEventLog.length = 0;
  antitrustBlockList.length = 0;
  lastActionWeek = -9999;
}

function computeConcentration(state: GameState) {
  // Replaced Object.values + array methods with single-pass for...in loop
  const FLOOR = 10_000_000;
  const playerCash = Math.max(FLOOR, state.finance?.cash || 0);
  const entries: { id: string; name: string; cash: number; positive: boolean }[] = [
    { id: 'PLAYER', name: state.studio?.name || 'Player', cash: playerCash, positive: (state.finance?.cash || 0) > 0 }
  ];

  let positiveCount = entries[0].positive ? 1 : 0;
  let total = entries[0].cash;

  const rivals = state.entities.rivals || {};
  for (const id in rivals) {
    if (Object.prototype.hasOwnProperty.call(rivals, id)) {
      const r = rivals[id];
      const cash = Math.max(FLOOR, r.cash || 0);
      const positive = (r.cash || 0) > 0;

      entries.push({ id: r.id, name: r.name, cash, positive });

      if (positive) positiveCount++;
      total += cash;
    }
  }

  entries.sort((a, b) => b.cash - a.cash);

  const top1 = entries[0].cash / total;
  const top3 = entries.slice(0, 3).reduce((s, e) => s + e.cash, 0) / total;

  return { top1, top3, leader: entries[0], sorted: entries, total, positiveCount };
}

export function isAcquirerBlockedByAntitrust(acquirerId: string, week: number): boolean {
  return antitrustBlockList.some(b => b.acquirerId === acquirerId && b.untilWeek > week);
}

export function tickAntitrust(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const { top1, top3, leader, positiveCount } = computeConcentration(state);
  const week = state.week;
  const year = Math.floor(week / 52) + 1975;

  // Expire stale blocks
  for (let i = antitrustBlockList.length - 1; i >= 0; i--) {
    if (antitrustBlockList[i].untilWeek <= week) antitrustBlockList.splice(i, 1);
  }

  const dominant = top1 > TOP1_THRESHOLD || top3 > TOP3_THRESHOLD;
  if (!dominant) return impacts;
  if (positiveCount < MIN_POSITIVE_COUNT) return impacts;
  if (week - lastActionWeek < ACTION_COOLDOWN_WEEKS) return impacts;
  // Low per-week probability so events are spread ~5-10 years apart even when triggers are chronic.
  if (secureRandom() > 0.005) return impacts;

  lastActionWeek = week;

  // Block dominant player from M&A for 2 years.
  antitrustBlockList.push({ acquirerId: leader.id, untilWeek: week + 104 });

  // Pick intervention: divestiture if top1 > 35%, else block-warning + fine.
  const kind: AntitrustEvent['kind'] = top1 > TOP1_THRESHOLD ? 'divestiture' : 'block-warning';

  if (kind === 'divestiture' && leader.id !== 'PLAYER') {
    // Spin off divested unit into a new indie — elegant refill mechanism.
    const spinoffName = pick(DISRUPTOR_SAFE(leader.name)) + ' ' + pick(['Pictures', 'Films', 'Studios']);
    const spinoffCash = leader.cash * 0.08;
    const spinoff: RivalStudio = {
      id: `divest-${week}-${Math.floor(secureRandom() * 1e6)}`,
      name: spinoffName,
      motto: 'Independence restored.',
      archetype: 'indie' as any,
      foundedWeek: week,
      parentBrand: spinoffName.split(' ')[0],
      strength: 40,
      cash: spinoffCash,
      prestige: 60,
      recentActivity: `Court-ordered divestiture from ${leader.name}.`,
      projects: {},
      contracts: [],
      projectCount: 0,
      motivationProfile: { financial: 50, prestige: 70, legacy: 50, aggression: 50 },
      currentMotivation: 'PRESTIGE_BUILDING' as any,
      ownedPlatforms: []
    };
    impacts.push({
      type: 'INDUSTRY_UPDATE',
      payload: {
        update: {},
        rival: { rivalId: spinoff.id, update: spinoff as unknown as Partial<RivalStudio> }
      }
    });
    // Penalize dominant: lose divested cash.
    impacts.push({
      type: 'RIVAL_UPDATED',
      payload: { rivalId: leader.id, update: { cash: leader.cash - spinoffCash } }
    });
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `ANTITRUST: Court orders ${leader.name} to divest; ${spinoffName} spun off`,
        description: `Regulators have ordered ${leader.name} to divest operations after its market share exceeded ${(top1 * 100).toFixed(1)}%. The divested unit relaunches as ${spinoffName}.`,
        category: 'market'
      }
    });
  } else {
    // Fine (cash penalty)
    const fine = Math.min(500_000_000, leader.cash * 0.03);
    if (leader.id !== 'PLAYER') {
      impacts.push({
        type: 'RIVAL_UPDATED',
        payload: { rivalId: leader.id, update: { cash: leader.cash - fine } }
      });
    } else {
      impacts.push({ type: 'FUNDS_CHANGED', payload: { amount: -fine } });
    }
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `ANTITRUST: ${leader.name} fined $${(fine / 1e6).toFixed(0)}M; pending M&A blocked`,
        description: `Regulators cite top-3 industry concentration at ${(top3 * 100).toFixed(1)}%. ${leader.name} is barred from further acquisitions for two years.`,
        category: 'market'
      }
    });
  }

  antitrustEventLog.push({
    week, year, kind,
    dominantId: leader.id,
    dominantName: leader.name,
    topShare: top1,
    top3Share: top3,
    note: kind === 'divestiture' ? 'Forced spinoff' : 'M&A freeze + fine'
  });

  return impacts;
}

function DISRUPTOR_SAFE(leaderName: string): string[] {
  // Shuffle a tiny name pool so the spinoff feels distinct from the parent.
  const base = DIVEST_NAMES.map(n => n.split(' ')[0]);
  return base.filter(b => !leaderName.toLowerCase().includes(b.toLowerCase()));
}
