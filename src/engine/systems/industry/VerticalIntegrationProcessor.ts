import { GameState, StateImpact, StreamerPlatform, RivalStudio } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Studio Boss - Vertical Integration Processor
 * Handles the financial link between studios and their owned platforms.
 */
export function tickVerticalIntegration(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  // Find all platforms with an ownerId
  const ownedPlatforms = state.market.buyers.filter(
    b => b.archetype === 'streamer' && b.ownerId
  ) as StreamerPlatform[];

  ownedPlatforms.forEach(platform => {
    // Calculate weekly P&L for the platform
    // Simplified: Revenue = subscribers * $0.20 (average weekly ARPU)
    // Costs = marketingSpend + contentLibraryQuality * $50k
    const weeklyRevenue = platform.subscribers * 0.20;
    const weeklyCosts = (platform.marketingSpend || 1_000_000) / 4 + (platform.contentLibraryQuality * 20_000);
    const netProfit = weeklyRevenue - weeklyCosts;

    // Apply netProfit to the owner's cash
    if (platform.ownerId === 'player') {
      impacts.push({
        type: 'FINANCE_TRANSACTION',
        payload: {
          amount: netProfit,
          description: `Platform P&L: ${platform.name}`,
        }
      });
    } else {
      // Rival owner
      const rival = state.industry.rivals.find(r => r.id === platform.ownerId);
      if (rival) {
        impacts.push({
          type: 'RIVAL_UPDATED',
          payload: {
            rivalId: rival.id,
            update: { cash: rival.cash + netProfit }
          }
        });
      }
    }

    // Add news if profit/loss is massive
    if (Math.abs(netProfit) > 5_000_000 && rng.next() < 0.1) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: netProfit > 0 
            ? `${platform.name} reports record weekly profits` 
            : `${platform.ownerId === 'player' ? state.studio.name : platform.name} shares tumble on streaming losses`,
          description: `Weekly platform earnings signal a major shift in distribution economics for ${platform.name}.`,
          category: 'market',
        }
      });
    }
  });

  return impacts;
}
