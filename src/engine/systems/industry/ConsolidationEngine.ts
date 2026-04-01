import { GameState, RivalStudio, StateImpact, Buyer, StreamerPlatform } from '@/engine/types';
import { RegulatorSystem } from './RegulatorSystem';
import { pick, secureRandom, randRange } from '../../utils';

/**
 * Studio Boss - Consolidation Engine
 * Automates the mergers and acquisitions process for Rival Studios and Platforms.
 */
export function tickConsolidation(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const rivals = state.industry.rivals;
  const buyers = state.market.buyers;

  // Potential Acquirers: Majors with surplus cash
  const majors = rivals.filter(r => r.archetype === 'major' && r.cash > 250_000_000);
  if (majors.length === 0 || secureRandom() < 0.92) return []; // Only check 8% of the time

  const acquirer = pick(majors);

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
  const roll = secureRandom();
  if (roll < 0.5 && targets.length > 0) {
    // Studio Acquisition
    const target = pick(targets);
    const cost = target.cash + (target.strength * 2_000_000);
    
    // Check Regulators
    const reg = RegulatorSystem.isBlocked(state, acquirer.id, target.id);
    if (reg.blocked) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: `REGULATOR BLOCK: ${acquirer.name}'s bid for ${target.name} rejected on ${reg.reason}`,
          category: 'market'
        }
      });
      return impacts;
    }

    // Execute Acquisition
    impacts.push({
      type: 'INDUSTRY_UPDATE',
      payload: { 
        rival: { ...acquirer, cash: acquirer.cash - cost, prestige: Math.min(100, acquirer.prestige + 10) },
        mergedRivalId: target.id 
      }
    });

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `CONSOLIDATION: ${acquirer.name} acquires ${target.name} for $${(cost / 1_000_000).toFixed(1)}M`,
        category: 'general'
      }
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
        category: 'market'
      }
    });
  }

  return impacts;
}
