import { pick } from '../../utils';
import { GameState, StateImpact, StreamerPlatform } from '@/engine/types';
import { RegulatorSystem } from './RegulatorSystem';
import { RandomGenerator } from '../../utils/rng';

/**
 * Studio Boss - Consolidation Engine
 * Automates the mergers and acquisitions process for Rival Studios and Platforms.
 */
export function tickConsolidation(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const rivalsMap = state.entities.rivals || {};
  const rivals = Object.values(rivalsMap);
  const buyers = state.market.buyers;

  // Potential Acquirers: Majors with surplus cash
  const majors = rivals.filter(r => r.archetype === 'major' && r.cash > 250_000_000);
  if (majors.length === 0 || rng.next() > 0.15) return []; // Only check 15% of the time (Phase 5 hardening)

  const acquirer = pick(majors, rng);

  // Target: studios with "Distress Signals" (isAcquirable) or those struggling
  const targets = rivals.filter(r => 
    r.id !== acquirer.id && 
    (r.isAcquirable || r.cash < 25_000_000 || r.strength < 20)
  );

  // Target: unowned Streaming Platform
  const platforms = buyers.filter(b => 
    b.archetype === 'streamer' && !b.ownerId && !b.acquiredBy
  ) as StreamerPlatform[];
  
  // Choose acquisition type
  const roll = rng.next();
  if (roll < 0.6 && targets.length > 0) {
    // Studio Acquisition
    const target = pick(targets, rng);
    // Base cost: liquidation value + strength premium
    const cost = Math.max(10_000_000, target.cash + (target.strength * 1_500_000));
    
    // Check Regulators
    const reg = RegulatorSystem.isBlocked(state, acquirer.id, target.id, rng);
    if (reg.blocked) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          headline: `REGULATOR BLOCK: ${acquirer.name}'s bid for ${target.name} rejected on ${reg.reason}`,
          description: `The proposed acquisition of ${target.name} by ${acquirer.name} has been blocked by federal regulators citing ${reg.reason}.`,
          category: 'market',
          week: state.week
        }
      });
      return impacts;
    }

    // Execute Acquisition (Using new Merger Payload from impactReducer)
    impacts.push({
      type: 'INDUSTRY_UPDATE',
      payload: { 
        acquirerId: acquirer.id,
        mergedRivalId: target.id 
      },
      cashChange: -cost // Cash deduction for acquirer will be handled by RIVAL_UPDATED/INDUSTRY_UPDATE mix
    });

    // Deduct cash from acquirer explicitly via RIVAL_UPDATED
    impacts.push({
        type: 'RIVAL_UPDATED',
        payload: {
            rivalId: acquirer.id,
            update: { cash: acquirer.cash - cost, prestige: Math.min(100, acquirer.prestige + 8) }
        }
    });

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        headline: `CONSOLIDATION: ${acquirer.name} acquires ${target.name} for $${(cost / 1_000_000).toFixed(1)}M`,
        description: `In a major industry move, ${acquirer.name} today finalized the acquisition of ${target.name}, consolidating its dominant market position.`,
        category: 'general',
        week: state.week
      }
    });
  } else if (platforms.length > 0) {
    // Platform Acquisition (Vertical Integration)
    const platform = pick(platforms, rng);
    const cost = (platform.subscribers * 5) + (platform.contentLibraryQuality * 1_000_000);

    if (acquirer.cash < cost) return impacts;

    // Check Regulators
    const reg = RegulatorSystem.isBlocked(state, acquirer.id, platform.id, rng);
    if (reg.blocked) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          headline: `FEDERAL CRACKDOWN: ${platform.name} sale to ${acquirer.name} blocked`,
          description: `Regulators have intervened in the vertical integration of ${platform.name} into the ${acquirer.name} portfolio, citing market dominance concerns.`,
          category: 'market',
          week: state.week
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
        id: rng.uuid('NWS'),
        headline: `VERTICAL INTEGRATION: ${acquirer.name} buys ${platform.name}`,
        description: `In a strategic shift toward vertical integration, ${acquirer.name} has acquired the ${platform.name} streaming platform to secure direct audience access.`,
        category: 'market',
        week: state.week
      }
    });
  }

  return impacts;
}
