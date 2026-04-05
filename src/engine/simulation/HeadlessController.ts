import { GameState, StateImpact, Project, Talent, Contract } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { evaluateGreenlight } from '../systems/greenlight';
import { executeGreenlight, executeMarketing } from '../systems/projects';

/**
 * Headless Controller (AI for the Player Studio)
 * Automates decision-making to prevent the simulation from stalling.
 */
export class HeadlessController {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const internalProjects = Object.values(state.studio.internal.projects);

    internalProjects.forEach(project => {
      // 1. Auto-Greenlight
      if (project.state === 'needs_greenlight') {
        const attachedTalent = this.getAttachedTalent(project, state.studio.internal.contracts, state.industry.talentPool);
        const report = evaluateGreenlight(project, state.finance.cash, attachedTalent, state.week, internalProjects);
        
        if (report.score > 60 || (state.finance.cash > project.budget * 3)) {
          const result = executeGreenlight(project);
          impacts.push({
            type: 'PROJECT_UPDATED',
            payload: { projectId: project.id, update: result.project }
          });
          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              headline: `GREENLIGHT: ${state.studio.name} moves forward with "${project.title}"`,
              description: `Automated decision: Project evaluation score ${report.score}. ${result.update}`,
              category: 'general'
            }
          });
        }
      }

      // 2. Auto-Release (Transition from marketing to released)
      if (project.state === 'marketing' && !project.releaseWeek) {
        // In headless mode, we just release immediately once in marketing
        const campaign = {
          primaryAngle: 'SELL_THE_STORY',
          domesticBudget: project.budget * 0.1,
          foreignBudget: project.budget * 0.05,
          weeksInMarketing: 1
        };
        const result = executeMarketing(project, campaign as any);
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: { 
            projectId: project.id, 
            update: { 
              ...result.project, 
              state: 'released',
              marketingBudget: campaign.domesticBudget + campaign.foreignBudget
            } 
          }
        });
      }
    });

    // Pre-calculate genre counts to avoid O(N) inside the loop
    const playerGenreCounts: Record<string, number> = {};
    for (let i = 0; i < internalProjects.length; i++) {
      const g = internalProjects[i].genre;
      if (g) {
        playerGenreCounts[g] = (playerGenreCounts[g] || 0) + 1;
      }
    }

    // 3. Auto-Bidding on Opportunities
    state.market.opportunities.forEach(opportunity => {
      const isAlreadyBid = !!opportunity.bids['PLAYER'];
      const isSimulation = true; // We are in headless mode
      
      let shouldBid = !isAlreadyBid && (state.finance.cash > opportunity.costToAcquire * 2 || isSimulation);
      
      // Persona Overrides
      const persona = (state as any).persona || 'balanced';
      
      // Genre Saturation Guard for Player (Limit to 2 same-genre projects)
      const isSaturated = (playerGenreCounts[opportunity.genre] || 0) >= 2;

      if (persona === 'frugal') {
        // Frugal only bids on low/mid if cash is tight, or any if cash is high
        if (opportunity.budgetTier === 'blockbuster' || opportunity.budgetTier === 'high') {
          if (state.finance.cash < 100000000) shouldBid = false; 
        }
      } else if (persona === 'aggressive') {
        // Aggressive always bids if not already bid
        shouldBid = !isAlreadyBid;
      }
      
      if (isSaturated) shouldBid = false;

      if (shouldBid) {
        let bidAmount = Math.floor(opportunity.costToAcquire * 1.05);
        
        // Predatory Bidding (Top the highest rival bid if Aggressive)
        if (persona === 'aggressive') {
           const rivalBids = Object.values(opportunity.bids || {}).map(b => b.amount);
           if (rivalBids.length > 0) {
             const highestRival = Math.max(...rivalBids);
             bidAmount = Math.max(bidAmount, Math.floor(highestRival * 1.05));
           }
        }

        impacts.push({
          type: 'OPPORTUNITY_UPDATED',
          payload: {
            opportunityId: opportunity.id,
            rivalId: 'PLAYER',
            bid: { amount: bidAmount, terms: 'standard' }
          }
        });
      }
    });

    return impacts;
  }

  private static getAttachedTalent(project: Project, contracts: Contract[], talentPool: Record<string, Talent>): Talent[] {
    const projectContracts = contracts.filter(c => c.projectId === project.id);
    return projectContracts.map(c => talentPool[c.talentId]).filter(Boolean);
  }
}
