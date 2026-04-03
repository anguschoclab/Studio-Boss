import { GameState } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Studio Boss - Regulator System (Anti-Trust)
 * Assesses whether a merger or acquisition should be blocked.
 */
export class RegulatorSystem {
  /**
   * Calculates the current market share of a studio.
   * Market share is a weighted average of prestige and subscriber counts.
   */
  static getMarketShare(state: GameState, studioId: string | 'player'): number {
    const totalPrestige = state.industry.rivals.reduce((acc, r) => acc + r.prestige, state.studio.prestige);
    const studioPrestige = studioId === 'player' 
      ? state.studio.prestige 
      : state.industry.rivals.find(r => r.id === studioId)?.prestige || 0;

    const totalSubs = state.market.buyers
      .filter(b => b.archetype === 'streamer')
      .reduce((acc, b) => acc + ((b as any).subscribers || 0), 0);
    
    const studioSubs = state.market.buyers
      .filter(b => b.archetype === 'streamer' && b.ownerId === studioId)
      .reduce((acc, b) => acc + ((b as any).subscribers || 0), 0);

    const prestigeShare = (studioPrestige / totalPrestige) * 100;
    const subShare = totalSubs > 0 ? (studioSubs / totalSubs) * 100 : 0;

    // Weighted share: 60% prestige, 40% audience reach
    return (prestigeShare * 0.6) + (subShare * 0.4);
  }

  /**
   * Evaluates if a merger between an acquirer and a target should be blocked.
   * Returns true if the merger is BLOCKED.
   */
  static isBlocked(state: GameState, acquirerId: string | 'player', targetId: string, rng: RandomGenerator): { blocked: boolean; sharePreview: number; reason?: string } {
    const currentShare = this.getMarketShare(state, acquirerId);
    const targetShare = this.getMarketShare(state, targetId);
    const combinedShare = currentShare + targetShare;

    // Regulators become concerned at > 25% share, and aggressively block at > 35%.
    let blockChance = 0;
    if (combinedShare > 35) {
      blockChance = 0.9; // 90% chance of blockage
    } else if (combinedShare > 25) {
      blockChance = 0.4 + (combinedShare - 25) * 0.05; // Sliding scale
    }

    if ((rng && rng.next ? rng.next() : Math.random()) < blockChance) {
      return { 
        blocked: true, 
        sharePreview: combinedShare, 
        reason: combinedShare > 35 ? 'Severe Concentration of Media Power' : 'Competition Concerns' 
      };
    }

    return { blocked: false, sharePreview: combinedShare };
  }
}
