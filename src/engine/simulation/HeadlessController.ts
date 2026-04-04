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

    // 3. Auto-Bidding on Opportunities
    state.market.opportunities.forEach(opportunity => {
      const isAlreadyBid = !!opportunity.bids['PLAYER'];
      if (!isAlreadyBid && state.finance.cash > opportunity.costToAcquire * 2) {
        const bidAmount = Math.floor(opportunity.costToAcquire * 1.1);
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
