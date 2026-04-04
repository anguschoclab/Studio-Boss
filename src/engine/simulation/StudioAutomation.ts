import { GameState, StateImpact, Project, RivalStudio } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

/**
 * Studio Automation
 * Automated operational decisions for any studio (Player or Rival).
 * Handles Greenlights, Pitches, and Releasing from Marketing.
 */
export class StudioAutomation {
  static tick(state: GameState, rng: RandomGenerator, isPlayer: boolean = false): StateImpact[] {
    const impacts: StateImpact[] = [];
    if (isPlayer) {
      const projects = Object.values(state.studio.internal.projects);
      projects.forEach(p => {
        this.processProject(p, state, rng, impacts, 'PLAYER');
      });
    } else {
      state.industry.rivals.forEach(rival => {
        let weeklyRivalRevenue = 0;
        const projects = Object.values(rival.projects || {});
        
        projects.forEach(p => {
          this.processProject(p, state, rng, impacts, rival.id);
          
          // Rival Revenue Collection
          if (p.state === 'released' || p.state === 'post_release') {
            weeklyRivalRevenue += (p.weeklyRevenue || 0) + (p.ancillaryRevenue || 0);
          }
        });

        // 4. Slate Management (Simulation Only)
        // If a rival has very few projects, force them to bid on something to keep the world alive
        if (projects.length < 2) {
            const opportunities = state.market.opportunities.filter(o => !o.bids[rival.id]);
            const bidAmount = rng.rangeInt(10, 500) * 1000;
            const canAfford = rival.cash > bidAmount * 1.5;
            const isSimulation = true;

            if (opportunities.length > 0 && (canAfford || isSimulation)) {
                const opp = rng.pick(opportunities);
                impacts.push({
                    type: 'OPPORTUNITY_UPDATED',
                    payload: {
                        opportunityId: opp.id,
                        rivalId: rival.id,
                        bid: { amount: Math.floor(opp.costToAcquire * 1.05), terms: 'standard' }
                    }
                });
            }
        }

        // 5. Maintenance Grant (Simulation Only)
        if (rival.cash < -50000000) {
           weeklyRivalRevenue += 100000000; // Reset them
        }

        if (weeklyRivalRevenue > 0) {
          impacts.push({
            type: 'RIVAL_UPDATED',
            payload: { rivalId: rival.id, update: { cash: rival.cash + weeklyRivalRevenue } }
          });
        }
      });

      // 6. Player Maintenance Grant
      if (state.finance.cash < -50000000) {
        impacts.push({
          type: 'FUNDS_CHANGED',
          payload: { amount: 100000000 }
        });
      }
    }

    return impacts;
  }

  private static processProject(p: Project, state: GameState, rng: RandomGenerator, impacts: StateImpact[], studioId: string | 'PLAYER'): void {
    // 1. Resolve Pitching (Random buyer pickup)
    if (p.state === 'pitching') {
      const eligibleBuyers = state.market.buyers.filter(b => b.archetype === 'streamer' || b.archetype === 'network');
      const buyer = rng.pick(eligibleBuyers);
      if (buyer) {
        impacts.push(this.createUpdateImpact(studioId, p.id, { 
          state: 'production', 
          weeksInPhase: 0,
          buyerId: buyer.id,
          distributionStatus: buyer.archetype === 'streamer' ? 'streaming' : 'theatrical'
        }, state));
      }
    }

    // 2. Resolve Greenlight (Immediate)
    if (p.state === 'needs_greenlight') {
      impacts.push(this.createUpdateImpact(studioId, p.id, { state: 'production', weeksInPhase: 0 }, state));
    }

    // 3. Resolve Marketing -> Release (Random marketing level)
    if (p.state === 'marketing') {
      const tiers: ('none' | 'basic' | 'blockbuster')[] = ['none', 'basic', 'blockbuster'];
      const tier = rng.pick(tiers);
      
      // Force completion if progress is 100% and it's been in marketing at least 1 week
      impacts.push(this.createUpdateImpact(studioId, p.id, { 
        state: 'released', 
        weeksInPhase: 0,
        marketingLevel: tier,
        releaseWeek: state.week,
        activeCrisis: null
      }, state));
    }
  }

  private static createUpdateImpact(studioId: string | 'PLAYER', projectId: string, update: Partial<Project>, state: GameState): StateImpact {
    if (studioId === 'PLAYER') {
      return {
        type: 'PROJECT_UPDATED',
        payload: { projectId, update }
      };
    } else {
      const rival = state.industry.rivals.find(r => r.id === studioId);
      const currentProjects = rival?.projects || {};
      const updatedProject = { ...currentProjects[projectId], ...update };
      
      return {
        type: 'RIVAL_UPDATED',
        payload: {
          rivalId: studioId,
          update: {
            projects: { ...currentProjects, [projectId]: updatedProject }
          }
        }
      };
    }
  }
}
