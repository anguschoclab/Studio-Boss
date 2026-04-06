import { Project, RivalStudio, GameState, StateImpact } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import { generateFestivalBid } from '../ai/AgentBrain';

export interface AuctionParticipant {
  id: string;
  name: string;
  isPlayer: boolean;
  cash: number;
  behaviorId?: string;
}

export interface AuctionState {
  project: Project;
  currentBid: number;
  highestBidderId: string | null;
  tickCount: number; // Ticks without a new bid
  active: boolean;
}

/**
 * Festival Auction Engine (Gavel Auction).
 * Simulates high-stakes competitive bidding for festival acquisitions.
 */
export class FestivalAuctionEngine {
  /**
   * Resolves a festival auction in a single tick (Headless Mode).
   * In a headless sim, we simulate the 'back and forth' until no one wants to bid higher.
   */
  static resolveHeadlessAuction(
    state: GameState,
    project: Project,
    rng: RandomGenerator
  ): StateImpact | null {
    let currentBid = Math.round(project.budget * 0.8); // Initial floor
    let highestBidderId: string | null = null;
    let auctionActive = true;

    const participants: AuctionParticipant[] = [
      ...state.entities.rivals.map(r => ({
        id: r.id,
        name: r.name,
        isPlayer: false,
        cash: r.cash,
        behaviorId: r.behaviorId
      }))
    ];

    // In headless mode, the player doesn't bid unless we have an AI for them or a scripted logic.
    // For now, we simulate rivals bidding against each other.

    while (auctionActive) {
      let bidThisRound = false;

      // Shuffle participants to avoid bias
      const biddingOrder = rng.shuffle([...participants]);

      for (const p of biddingOrder) {
          if (p.id === highestBidderId) continue;

          // Use AgentBrain to generate a bid
          // We wrap the participant in a dummy RivalStudio for the existing logic
          const dummyRival: Partial<RivalStudio> = {
            id: p.id,
            cash: p.cash,
            behaviorId: p.behaviorId
          };

          const potentialBid = generateFestivalBid(dummyRival as RivalStudio, project, rng);

          if (potentialBid && potentialBid > currentBid) {
            // Incremental bid: current + 5%
            const nextIncrementalBid = Math.round(currentBid * 1.05);
            
            if (potentialBid >= nextIncrementalBid && p.cash >= nextIncrementalBid) {
              currentBid = nextIncrementalBid;
              highestBidderId = p.id;
              bidThisRound = true;
            }
          }
      }

      if (!bidThisRound) {
        auctionActive = false; // No one raised the bid
      }
    }

    if (!highestBidderId) return null;

    const winner = participants.find(p => p.id === highestBidderId)!;

    return {
      type: 'RIVAL_UPDATED',
      payload: {
        rivalId: winner.id,
        update: {
          cash: winner.cash - currentBid,
          projects: {
             [project.id]: {
               ...project,
               state: 'released', // or post-production
               isAcquired: true,
               acquisitionCost: currentBid
             }
          }
        }
      },
      newHeadlines: [
        {
          id: rng.uuid('hl'),
          week: state.week,
          category: 'acquisition',
          text: `FESTIVAL: ${winner.name} wins bidding war for "${project.title}" for $${(currentBid / 1000000).toFixed(1)}M!`
        }
      ]
    };
  }
}
