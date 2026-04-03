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
  const rivals = state.industry.rivals;
  const buyers = state.market.buyers;

  // Potential Acquirers: Majors with surplus cash
  const majors = rivals.filter(r => r.archetype === 'major' && r.cash > 250_000_000);
  if (majors.length === 0 || (rng && rng.next ? rng.next() : Math.random()) < 0.92) return []; // Only check 8% of the time

  const acquirer = (rng && rng.pick ? rng.pick.bind(rng) : pick)(majors);

  // Target: struggling Indie or Mid-tier studio
  const targets = rivals.filter(r => 
    r.id !== acquirer.id && 
    (r.cash < 50_000_000 || r.strength < 30)
  );

  // Target: unowned Streaming Platform
  const platforms = buyers.filter(b => 
    b.archetype === 'streamer' && !b.ownerId && !b.acquiredBy
  ) as StreamerPlatform[];

  // Choose acquisition type
  const roll = (rng && rng.next ? rng.next() : Math.random());
  if (roll < 0.5 && targets.length > 0) {
    // Studio Acquisition
    const target = (rng && rng.pick ? rng.pick.bind(rng) : pick)(targets);
    const cost = target.cash + (target.strength * 2_000_000);
    
    // Check Regulators
    const reg = RegulatorSystem.isBlocked(state, acquirer.id, target.id, rng);
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
      type: 'INDUSTRY_UPDATE',
      payload: { 
        update: {},
        rival: { rivalId: acquirer.id, update: { cash: acquirer.cash - cost, prestige: Math.min(100, acquirer.prestige + 10) } },
        mergedRivalId: target.id 
      }
    });

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `CONSOLIDATION: ${acquirer.name} acquires ${target.name} for $${(cost / 1_000_000).toFixed(1)}M`,
        description: `In a major industry move, ${acquirer.name} today finalized the acquisition of ${target.name}, further consolidating the ${acquirer.archetype} tier.`,
        category: 'general'
      }
    });
  } else if (platforms.length > 0) {
    // Platform Acquisition (Vertical Integration)
    const platform = (rng && rng.pick ? rng.pick.bind(rng) : pick)(platforms);
    const cost = (platform.subscribers * 5) + (platform.contentLibraryQuality * 1_000_000);

    if (acquirer.cash < cost) return impacts;

    // Check Regulators
    const reg = RegulatorSystem.isBlocked(state, acquirer.id, platform.id, rng);
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
  }

  return impacts;
}

