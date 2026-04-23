import { GameState, StateImpact, Contract, Project } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { evaluateGreenlight } from '../systems/greenlight';
import { executeGreenlight, executeMarketing } from '../systems/projects';
import { BudgetTierKey } from '../types/project.types';
import { StudioArchetype, AI_ARCHETYPES } from '../data/aiArchetypes';
import { processFlops } from '../systems/finance/FlopMechanics';
import { calculateOpeningWeekend } from '../systems/releaseSimulation';

/**
 * Headless Controller (AI for the Player Studio)
 * Automates decision-making to prevent the simulation from stalling.
 */
export class HeadlessController {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const contractsList = Object.values(state.entities.contracts || {});

    const contractsByProject = new Map<string, Contract[]>();
    contractsList.forEach((c: Contract) => {
      if (c.projectId) {
        let list = contractsByProject.get(c.projectId);
        if (!list) {
          list = [];
          contractsByProject.set(c.projectId, list);
        }
        list.push(c);
      }
    });

    // 0. Auto-Pitch New Projects (for headless simulation)
    const activePlayerProjects = Object.values(state.entities.projects).filter(p => p.ownerId === 'PLAYER' && p.state !== 'archived');
    let newlyPitchedProject: any = null;
    if (activePlayerProjects.length < 10 && rng.next() < 0.8) {
      const pitchResult = this.pitchNewProject(state, rng);
      if (pitchResult) {
        impacts.push(pitchResult);
        console.log(`[HeadlessController] Pitched new project for PLAYER`);
        // Extract the newly pitched project for immediate processing
        if (pitchResult.type === 'INDUSTRY_UPDATE' && pitchResult.payload.update['entities.projects']) {
          const newProjects = pitchResult.payload.update['entities.projects'] as any;
          const newProjectIds = Object.keys(newProjects).filter(id => !state.entities.projects[id]);
          if (newProjectIds.length > 0) {
            newlyPitchedProject = newProjects[newProjectIds[0]];
          }
        }
      }
    }

    // Process projects from current state (including newly pitched ones)
    const allProjects = Object.values(state.entities.projects);
    if (newlyPitchedProject) {
      allProjects.push(newlyPitchedProject);
    }
    allProjects.forEach(project => {
      // Track all player project states for debugging
      if (project.ownerId === 'PLAYER' && project.state !== 'archived') {
        if (project.state === 'production' && project.weeksInPhase === 0) {
          console.log(`[HeadlessController] Project ${project.title} entered production, productionWeeks: ${project.productionWeeks}`);
        } else if (project.state === 'post_production' && project.weeksInPhase === 0) {
          console.log(`[HeadlessController] Project ${project.title} entered post_production`);
        } else if (project.state === 'marketing' && project.weeksInPhase === 0) {
          console.log(`[HeadlessController] Project ${project.title} entered marketing`);
        } else if (project.state === 'released') {
          console.log(`[HeadlessController] Project ${project.title} RELEASED`);
        }
      }

      // 1. Auto-Greenlight
      if (project.state === 'needs_greenlight') {
        // In headless simulation, always greenlight projects
        const result = executeGreenlight(project);
        // Set productionWeeks for headless simulation (shorter duration)
        const productionWeeks = 4 + Math.floor(Math.random() * 4); // 4-8 weeks
        const updateWithProductionWeeks = {
          ...result.project,
          productionWeeks
        };
        console.log(`[HeadlessController] Greenlighting ${project.title}: state goes from ${project.state} to ${updateWithProductionWeeks.state}, productionWeeks: ${productionWeeks}`);
        
        // Use PROJECT_UPDATED (supported by impact reducer)
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: { projectId: project.id, update: updateWithProductionWeeks }
        });
        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            headline: `GREENLIGHT: ${state.studio.name} moves forward with "${project.title}"`,
            description: `Automated decision: Project greenlit in headless simulation.`,
            category: 'general'
          }
        });
      }

      // 1.5. Auto-advance production (for headless mode)
      if (project.state === 'production' && project.productionWeeks) {
        if (project.weeksInPhase >= project.productionWeeks) {
          // Transition to post_production
          const updateWithPostProduction = {
            ...project,
            state: 'post_production' as const,
            weeksInPhase: 0,
            postProductionWeeksRemaining: 1,
            progress: 100
          };
          console.log(`[HeadlessController] Advancing ${project.title} from production to post_production`);
          impacts.push({
            type: 'PROJECT_UPDATED',
            payload: { projectId: project.id, update: updateWithPostProduction }
          });
        } else {
          // Increment weeks in production
          const updateWithProgress = {
            ...project,
            weeksInPhase: project.weeksInPhase + 1,
            progress: Math.min(100, ((project.weeksInPhase + 1) / project.productionWeeks) * 100)
          };
          impacts.push({
            type: 'PROJECT_UPDATED',
            payload: { projectId: project.id, update: updateWithProgress }
          });
        }
      }

      // 1.6. Auto-advance post_production to marketing
      if (project.state === 'post_production') {
        const weeksRemaining = (project as any).postProductionWeeksRemaining || 1;
        if (project.weeksInPhase >= weeksRemaining) {
          // Transition to marketing
          const updateWithMarketing = {
            ...project,
            state: 'marketing' as const,
            weeksInPhase: 0,
            marketingCampaign: {
              primaryAngle: 'SELL_THE_STORY' as const,
              domesticBudget: project.budget * 0.25,
              foreignBudget: project.budget * 0.15,
              weeksInMarketing: 0
            }
          };
          console.log(`[HeadlessController] Advancing ${project.title} from post_production to marketing`);
          impacts.push({
            type: 'PROJECT_UPDATED',
            payload: { projectId: project.id, update: updateWithMarketing }
          });
        } else {
          // Increment weeks in post_production
          const updateWithProgress = {
            ...project,
            weeksInPhase: project.weeksInPhase + 1
          };
          impacts.push({
            type: 'PROJECT_UPDATED',
            payload: { projectId: project.id, update: updateWithProgress }
          });
        }
      }

      // 2. Auto-Release (Transition from marketing to released)
      if (project.state === 'marketing' && !project.releaseWeek) {
        // In headless mode, we just release immediately once in marketing
        const campaign = {
          primaryAngle: 'SELL_THE_STORY',
          domesticBudget: project.budget * 0.25,
          foreignBudget: project.budget * 0.15,
          weeksInMarketing: 1
        };
        const result = executeMarketing(project, campaign as any);
        const marketingBudget = campaign.domesticBudget + campaign.foreignBudget;
        const projectWithMarketing = { ...result.project, marketingBudget };
        const { project: releasedProject } = calculateOpeningWeekend(
          projectWithMarketing,
          [],
          state.studio.prestige || 50
        );
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: {
            projectId: project.id,
            update: {
              ...releasedProject,
              state: 'released',
              releaseWeek: state.week,
              marketingBudget
            }
          }
        });
        const netCash = (releasedProject.revenue || 0) - (project.budget || 0) - marketingBudget;
        impacts.push({
          type: 'FUNDS_CHANGED',
          payload: { amount: netCash }
        });
        console.log(`[HeadlessController] Released project: ${project.title}, net cash: $${(netCash/1_000_000).toFixed(1)}M`);
      }

      // Archive released player projects so the pitch gate isn't permanently saturated
      if (project.ownerId === 'PLAYER' && project.state === 'released' && project.releaseWeek && (state.week - project.releaseWeek) > 1) {
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: { projectId: project.id, update: { state: 'archived' } }
        });
      }
    });

    // Pre-calculate genre counts to avoid O(N) inside the loop
    const playerGenreCounts: Record<string, number> = {};
    for (let i = 0; i < allProjects.length; i++) {
      const g = allProjects[i].genre;
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
           const rivalBids: number[] = [];
           if (opportunity.bids) {
             for (const id in opportunity.bids) {
               if (Object.prototype.hasOwnProperty.call(opportunity.bids, id)) {
                 rivalBids.push(opportunity.bids[id].amount);
               }
             }
           }
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

    // Process flops for all released projects
    const flopImpacts = processFlops(state);
    impacts.push(...flopImpacts);

    return impacts;
  }

  private static pitchNewProject(state: GameState, rng: RandomGenerator): StateImpact | null {
    const id = rng.uuid('PRJ');
    const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Family'];
    const genre = genres[Math.floor(rng.next() * genres.length)];
    const formats = ['film', 'tv'];
    const format = formats[Math.floor(rng.next() * formats.length)] as 'film' | 'tv';
    const budgetTiers: BudgetTierKey[] = ['low', 'mid', 'high', 'blockbuster'];
    const budgetTier = budgetTiers[Math.floor(rng.next() * budgetTiers.length)] as BudgetTierKey;

    // Map budget tiers to actual budget values
    const budgetMap: Record<BudgetTierKey, number> = {
      low: 15_000_000,
      mid: 40_000_000,
      high: 80_000_000,
      blockbuster: 150_000_000
    };
    const budget = budgetMap[budgetTier];

    const project: any = {
      id,
      title: `${genre} ${rng.rangeInt(1, 100)}`,
      genre,
      format,
      type: format === 'tv' ? 'SERIES' : 'FILM',
      state: 'needs_greenlight',
      weeksInPhase: 0,
      budgetTier,
      budget,
      buzz: rng.rangeInt(20, 50),
      ownerId: 'PLAYER',
      quality: 50,
      scriptHeat: 50,
      progress: 0,
      accumulatedCost: 0,
      weeksInDevelopment: 0,
    };

    if (format === 'tv') {
      project.tvDetails = {
        status: 'IN_DEVELOPMENT',
        episodesOrdered: rng.rangeInt(8, 13),
        episodesAired: 0,
        averageRating: 0,
        currentSeason: 1,
        episodesCompleted: 0
      };
    }

    // Use PROJECT_CREATED by directly adding to state via a custom approach
    // Since INDUSTRY_UPDATE is not supported, we'll use a workaround
    return {
      type: 'PROJECT_CREATED' as any,
      payload: { project }
    };
  }


}
