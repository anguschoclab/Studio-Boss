import { GameState, StateImpact, StreamerPlatform, RivalStudio } from '@/engine/types';
import { RegulatorSystem } from './RegulatorSystem';
import { pick, secureRandom } from '../../utils';
import { isAcquirerBlockedByAntitrust } from './Antitrust';

export interface ConsolidationEvent {
  week: number;
  year: number;
  motive: 'strategic' | 'distressed' | 'platform';
  acquirerId: string;
  acquirerName: string;
  targetId: string;
  targetName: string;
  cost: number;
}

export const consolidationEventLog: ConsolidationEvent[] = [];
export function resetConsolidationState() { consolidationEventLog.length = 0; }

/**
 * Studio Boss - Consolidation Engine
 * Automates the mergers and acquisitions process for Rival Studios and Platforms.
 */
export function tickConsolidation(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const rivalsDict = state.entities.rivals || {};
  const buyers = state.market.buyers;

  // Replace Object.values().filter() chains with single for...in loop
  const majors: RivalStudio[] = [];
  for (const id in rivalsDict) {
    const r = rivalsDict[id];
    if (r.archetype === 'major' && r.cash > 250_000_000) {
      majors.push(r);
    }
  }

  // REMOVED: Financial stress simulation (ineffective and unrealistic)
  // Rivals now deploy capital proactively via FlopMechanics and other systems

  // Reduced skip probability for headless simulation (20% vs 60%)
  if (majors.length === 0 || secureRandom() < 0.20) return [];

  // Prefer non-antitrust-frozen acquirers so a single dominant frozen player doesn't
  // starve the whole engine for years.
  const freeAcquirers = majors.filter(r => !isAcquirerBlockedByAntitrust(r.id, state.week));
  const acquirer = pick(freeAcquirers.length > 0 ? freeAcquirers : majors);

  // Antitrust block: dominant players face M&A freeze.
  if (isAcquirerBlockedByAntitrust(acquirer.id, state.week)) {
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `ANTITRUST FREEZE: ${acquirer.name} blocked from pursuing acquisitions`,
        description: `Federal regulators have suspended M&A activity for ${acquirer.name} pending review of its market position.`,
        category: 'market'
      }
    });
    return impacts;
  }

  // Strategic targets: healthy-but-stagnant mid-tiers in the $100M-$2B cash range
  // are real-world acquisition targets (Disney/Fox, Amazon/MGM). Distress cascade
  // handles <$0 cash cases separately. Skip targets the acquirer can't afford.
  const STRATEGIC_CEILING = 2_000_000_000;
  const targets: RivalStudio[] = [];
  for (const id in rivalsDict) {
    const r = rivalsDict[id];
    if (
      r.id !== acquirer.id &&
      r.cash > 0 && r.cash < STRATEGIC_CEILING &&
      r.strength < 75 &&
      acquirer.cash > r.cash + (r.strength * 2_000_000)
    ) {
      targets.push(r);
    }
  }

  // Target: unowned Streaming Platform
  const platforms = buyers.filter(b => 
    b.archetype === 'streamer' && !b.ownerId && !b.acquiredBy
  ) as StreamerPlatform[];

  // Choose acquisition type
  const roll = secureRandom();
  if (roll < 0.5 && targets.length > 0) {
    const target = pick(targets);
    const cost = target.cash + (target.strength * 2_000_000);

    const reg = RegulatorSystem.isBlocked(state, acquirer.id, target.id);
    if (reg.blocked) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: `REGULATOR BLOCK: ${acquirer.name}'s bid for ${target.name} rejected on ${reg.reason}`,
          description: `The proposed acquisition of ${target.name} by ${acquirer.name} has been blocked by federal regulators citing ${reg.reason}.`,
          category: 'market'
        }
      });
      return impacts;
    }

    // Execute Acquisition
    impacts.push({
      type: 'RIVAL_UPDATED',
      payload: { rivalId: acquirer.id, update: { cash: acquirer.cash - cost, prestige: Math.min(100, acquirer.prestige + 10) } }
    });
    impacts.push({
      type: 'INDUSTRY_UPDATE',
      payload: {
        update: {},
        mergedRivalId: target.id,
        acquirerId: acquirer.id
      }
    });

    const motive: 'strategic' | 'distressed' = target.cash < 100_000_000 ? 'distressed' : 'strategic';
    const motiveLabel = motive === 'distressed' ? 'DISTRESSED M&A' : 'STRATEGIC M&A';
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `${motiveLabel}: ${acquirer.name} acquires ${target.name} for $${(cost / 1_000_000).toFixed(1)}M`,
        description: `In a major industry move, ${acquirer.name} today finalized the acquisition of ${target.name}, further consolidating the ${acquirer.archetype} tier.`,
        category: 'general'
      }
    });
    consolidationEventLog.push({
      week: state.week, year: Math.floor(state.week / 52) + 1975,
      motive,
      acquirerId: acquirer.id, acquirerName: acquirer.name,
      targetId: target.id, targetName: target.name,
      cost
    });
  } else if (platforms.length > 0) {
    // Platform Acquisition (Vertical Integration)
    const platform = pick(platforms);
    const cost = (platform.subscribers * 5) + (platform.contentLibraryQuality * 1_000_000);

    if (acquirer.cash < cost) return impacts;

    // Check Regulators
    const reg = RegulatorSystem.isBlocked(state, acquirer.id, platform.id);
    if (reg.blocked) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: `FEDERAL CRACKDOWN: ${platform.name} sale to ${acquirer.name} blocked`,
          description: `Regulators have intervened in the vertical integration of ${platform.name} into the ${acquirer.name} portfolio, citing market dominance concerns.`,
          category: 'market'
        }
      });
      return impacts;
    }

    // Execute Acquisition
    impacts.push({
      type: 'BUYER_UPDATED',
      payload: {
        buyerId: platform.id,
        update: { ownerId: acquirer.id, parentBrand: acquirer.parentBrand }
      }
    });

    impacts.push({
       type: 'RIVAL_UPDATED',
       payload: {
          rivalId: acquirer.id,
          update: { 
            cash: acquirer.cash - cost,
            ownedPlatforms: [...(acquirer.ownedPlatforms || []), platform.id]
          }
       }
    });

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `VERTICAL INTEGRATION: ${acquirer.name} buys ${platform.name}`,
        description: `In a strategic shift toward vertical integration, ${acquirer.name} has acquired the ${platform.name} streaming platform to secure direct audience access.`,
        category: 'market'
      }
    });
    consolidationEventLog.push({
      week: state.week, year: Math.floor(state.week / 52) + 1975,
      motive: 'platform',
      acquirerId: acquirer.id, acquirerName: acquirer.name,
      targetId: platform.id, targetName: platform.name,
      cost
    });
  }

  return impacts;
}
