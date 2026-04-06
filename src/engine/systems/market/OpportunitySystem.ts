import { GameState, StateImpact, Opportunity, Project, Contract, RivalStudio } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { buildProjectAndContracts } from '../../../store/storeUtils';
import { generateOpportunity } from '../../generators/opportunities';

/**
 * Opportunity System
 * Handles the resolution of expired project auctions.
 */
export class OpportunitySystem {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const expired = state.market.opportunities.filter(o => o.expirationWeek <= state.week);

    expired.forEach(opp => {
      // 1. Resolve Highest Bidder
      const bidders = Object.entries(opp.bids);
      if (bidders.length === 0) {
        // No one bid, just expire it
        impacts.push({
            type: 'OPPORTUNITY_UPDATED', // We'll use this to signal removal in the future or just handle it below
            payload: { opportunityId: opp.id, action: 'EXPIRE' } 
        });
        return;
      }

      // Find winner
      const sortedBids = bidders.sort((a, b) => b[1].amount - a[1].amount);
      const [winnerId, bidData] = sortedBids[0];

      // 2. Build Project
      const params = {
        title: opp.title,
        format: opp.format,
        genre: opp.genre,
        budgetTier: opp.budgetTier,
        targetAudience: opp.targetAudience,
        flavor: opp.flavor,
        tvFormat: opp.tvFormat,
        unscriptedFormat: opp.unscriptedFormat,
        episodes: opp.episodes,
        releaseModel: opp.releaseModel,
        initialBuzzBonus: opp.qualityBonus || 0,
        attachedTalentIds: opp.attachedTalentIds
      };

      const { project, newContracts } = buildProjectAndContracts(state, params as any, rng);
      
      // Update project with auction specific data
      const winnerProject = { 
        ...project, 
        budget: project.budget + bidData.amount, // Acquisition cost added to budget? Or just paid from cash?
        isAcquired: true 
      };

      // 3. Apply Impacts based on Winner
      if (winnerId === 'PLAYER') {
        impacts.push({
          type: 'FUNDS_DEDUCTED',
          payload: { amount: bidData.amount }
        });
        impacts.push({
          type: 'PROJECT_ADDED_FROM_AUCTION', // Custom type just for clarity
          newProjects: [winnerProject],
          newContracts: (newContracts as any)
        } as any);
        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            headline: `AUCTION WON: ${state.studio.name} acquires "${opp.title}"`,
            description: `After a competitive bidding process, ${state.studio.name} secured the rights for $${(bidData.amount / 1000000).toFixed(1)}M.`,
            category: 'general'
          }
        });
      } else {
        // Rival Winner
        const rival = state.entities.rivals[winnerId];
        if (rival) {
          impacts.push({
            type: 'RIVAL_UPDATED',
            payload: {
              rivalId: winnerId,
              update: {
                cash: rival.cash - bidData.amount,
                projects: { ...rival.projects, [winnerProject.id]: winnerProject }
              }
            }
          });
          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              headline: `AUCTION LOST: ${rival.name} outbids competition for "${opp.title}"`,
              description: `${rival.name} has emerged victorious in the bidding for ${opp.title}, paying a premium $${(bidData.amount / 1000000).toFixed(1)}M.`,
              category: 'general'
            }
          });
        }
      }
    });

    // 5. Cleanup & Replenishment
    const remainingOpportunities = state.market.opportunities.filter(o => o.expirationWeek > state.week);
    
    if (expired.length > 0 || remainingOpportunities.length < 8) {
        const toGenerate = Math.max(0, 8 - remainingOpportunities.length);
        const talentPoolIds = Object.keys(state.entities.talents);
        const newOpps = Array.from({ length: toGenerate }, () => generateOpportunity(rng, state.week, talentPoolIds));
        
        impacts.push({
            type: 'INDUSTRY_UPDATE',
            payload: { 'market.opportunities': [...remainingOpportunities, ...newOpps] }
        });
    }

    return impacts;
  }
}
