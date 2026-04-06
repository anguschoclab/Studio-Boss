import { GameState, StateImpact, Project, RivalStudio, Opportunity, Contract } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { calculateOpeningWeekend } from '../systems/releaseSimulation';
import { RegulatorSystem } from '../systems/industry/RegulatorSystem';

export class StudioAutomation {
  /**
   * Main simulation tick for rival studios.
   * Handles project pitching, production, and high-level strategic adaptation.
   */
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    
    state.entities.rivals.forEach(rival => {
      // 1. Studio Status & Liquidation
      const isDistressed = (Number(rival.cash) || 0) < -50000000;
      
      if (isDistressed && (state.week % 4 === 0) && rng.next() < 0.1) {
          this.triggerLiquidation(rival, state, rng, impacts);
      } else if (rival.cash > 500000000 && (!rival.ownedPlatforms || rival.ownedPlatforms.length === 0)) {
          if (rng.next() < 0.05) {
              this.triggerPlatformLaunch(rival, state, rng, impacts);
          }
      }

      if (isDistressed !== rival.isAcquirable) {
          impacts.push({
            type: 'RIVAL_UPDATED',
            payload: { rivalId: rival.id, update: { isAcquirable: isDistressed } }
          });
      }

      // 2. Process Individual Projects
      let activeCount = 0;
      const expiredProjectIds: string[] = [];
      const rivalProjects = rival.projects || {};

      // ⚡ Bolt: Consolidated project iteration to prevent multiple filter/map array allocations
      for (const id in rivalProjects) {
        const p = rivalProjects[id];
        this.processProject(p, rival.id, state, rng, impacts);

        if (p.state !== 'archived') {
            if (p.state === 'released' && (state.week - (p.releaseWeek || 0)) > 4) {
                expiredProjectIds.push(p.id);
            } else {
                activeCount++;
            }
        }
      }

      // ⚡ Project Recycling (Keep memory usage low in long-term sims)
      if (expiredProjectIds.length > 0) {
          const updatedProjects = { ...rivalProjects };
          for (let i = 0; i < expiredProjectIds.length; i++) {
              const id = expiredProjectIds[i];
              updatedProjects[id] = { ...updatedProjects[id], state: 'archived' as any };
          }
          impacts.push({
              type: 'RIVAL_UPDATED',
              payload: { rivalId: rival.id, update: { projects: updatedProjects } }
          });
      }

      // 3. Pitch New Projects (If slot available)
      if (activeCount < 5 && rng.next() < 0.1) {
        this.pitchNewProject(rival, state, rng, impacts);
      }
    });

    return impacts;
  }

  private static processProject(p: Project, studioId: string, state: GameState, rng: RandomGenerator, impacts: StateImpact[]): void {
    // 1. Resolve Pitching (Random buyer pickup)
    if (p.state === 'pitching') {
      const eligibleBuyers = state.market.buyers.filter(b => b.archetype === 'streamer' || b.archetype === 'network');
      const buyer = rng.pick(eligibleBuyers);
      if (buyer && rng.next() < 0.3) {
        const update: any = { state: 'production', weeksInPhase: 0 };
        impacts.push(this.createUpdateImpact(studioId, p.id, { 
          ...update,
          buyerId: buyer.id,
          distributionStatus: buyer.archetype === 'streamer' ? 'streaming' : 'theatrical'
        }, state));
      }
    }

    // 2. Resolve Greenlight (Immediate)
    if (p.state === 'needs_greenlight') {
      const { update, subImpacts } = this.initializeProduction(p, studioId, state, rng);
      impacts.push(...subImpacts);
      impacts.push(this.createUpdateImpact(studioId, p.id, update, state));
    }

    // 3. Resolve Marketing -> Release
    if (p.state === 'marketing') {
      const tiers: ('none' | 'basic' | 'blockbuster')[] = ['none', 'basic', 'blockbuster'];
      const tier = rng.pick(tiers);
      const budgetMap = { 'none': 0, 'basic': 5000000, 'blockbuster': 25000000 };
      const marketingBudget = budgetMap[tier];

      const rivalPrestige = studioId === 'PLAYER' ? state.studio.prestige : (state.entities.rivals.find(r => r.id === studioId)?.prestige || 50);
      const { project: releasedProject } = calculateOpeningWeekend(
          { ...p, marketingLevel: tier, marketingBudget }, 
          [], 
          rivalPrestige,
          rng
      );

      // Status Transition (TV Special Case)
      let nextStatus = 'released';
      let tvUpdate = {};
      if ((p.format === 'tv' || p.type === 'SERIES') && (p as any).tvDetails) {
          nextStatus = 'ON_AIR';
          tvUpdate = { tvDetails: { ...(p as any).tvDetails, status: 'ON_AIR' } };
      }

      impacts.push(this.createUpdateImpact(studioId, p.id, { 
        ...releasedProject,
        ...tvUpdate,
        state: nextStatus as any, 
        weeksInPhase: 0,
        releaseWeek: state.week,
        activeCrisis: null
      }, state));
    }
  }

  private static triggerLiquidation(rival: RivalStudio, state: GameState, rng: RandomGenerator, impacts: StateImpact[]): void {
      const ipAssets = Object.values(rival.ipAssets || {});
      if (ipAssets.length === 0) return;
      
      const asset = rng.pick(ipAssets);
      const bidPrice = (asset.baseValue || 10000000) * (0.5 + rng.next() * 0.5);
      
      impacts.push({
          type: 'NEWS_ADDED',
          payload: {
              headline: `LIQUIDATION: ${rival.name} auctions IP!`,
              description: `Facing financial pressure, ${rival.name} has sold ${asset.title} to the highest bidder for $${(bidPrice / 1000000).toFixed(1)}M.`,
              category: 'business'
          }
      });
      
      impacts.push({
          type: 'RIVAL_UPDATED',
          payload: { 
              rivalId: rival.id, 
              update: { 
                  cash: (Number(rival.cash) || 0) + bidPrice,
                  ipAssets: Object.fromEntries(Object.entries(rival.ipAssets || {}).filter(([id]) => id !== asset.id))
              } 
          }
      });
  }

  private static triggerPlatformLaunch(rival: RivalStudio, state: GameState, rng: RandomGenerator, impacts: StateImpact[]): void {
      const cost = 200000000;
      impacts.push({
          type: 'NEWS_ADDED',
          payload: {
              headline: `BUSINESS: ${rival.name} launches streaming service!`,
              description: `Aiming for vertical integration, ${rival.name} has invested $200M in a new SVOD platform.`,
              category: 'business'
          }
      });
      impacts.push({
          type: 'RIVAL_UPDATED',
          payload: { rivalId: rival.id, update: { cash: (Number(rival.cash) || 0) - cost } }
      });
  }

  private static pitchNewProject(rival: RivalStudio, state: GameState, rng: RandomGenerator, impacts: StateImpact[]): void {
    const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Family'];
    const genre = rng.pick(genres);
    const id = rng.uuid('p-auto');
    const format = rng.next() < 0.3 ? 'tv' : 'film';

    const project: any = {
      id,
      title: `${genre} ${rng.rangeInt(1, 100)}`,
      genre,
      format,
      type: format === 'tv' ? 'SERIES' : 'MOVIE',
      state: 'pitching',
      weeksInPhase: 0,
      budgetTier: rng.pick(['low', 'mid', 'high']),
      buzz: rng.rangeInt(20, 50),
      reviewScore: rng.rangeInt(40, 75),
    };

    if (format === 'tv') {
        project.tvDetails = {
            status: 'IN_DEVELOPMENT',
            episodesOrdered: rng.rangeInt(8, 13),
            episodesAired: 0,
            averageRating: 0
        };
    }

    impacts.push({
      type: 'RIVAL_UPDATED',
      payload: { rivalId: rival.id, update: { projects: { ...rival.projects, [id]: project } } }
    });
  }

  private static initializeProduction(p: Project, studioId: string, state: GameState, rng: RandomGenerator): { update: Partial<Project>; subImpacts: StateImpact[] } {
    const subImpacts: StateImpact[] = [];
    const update: any = {
      state: 'production',
      weeksInPhase: 0,
      productionWeeks: rng.rangeInt(12, 26),
      budget: p.budget || rng.rangeInt(10, 80) * 1_000_000,
      buzz: p.buzz || 40,
      rating: 'PG-13',
      activeCut: rng.next() < 0.2 ? 'sanitized' : 'theatrical'
    };
    return { update, subImpacts };
  }

  private static createUpdateImpact(studioId: string, projectId: string, update: Partial<Project>, state: GameState): StateImpact {
    if (studioId === 'PLAYER') {
      return { type: 'PROJECT_UPDATED', payload: { projectId, update } };
    } else {
      const rival = state.entities.rivals.find(r => r.id === studioId);
      const existingProject = rival?.projects?.[projectId] || {};
      return { 
        type: 'RIVAL_UPDATED', 
        payload: { rivalId: studioId, update: { projects: { ...rival?.projects, [projectId]: { ...existingProject, ...update } } } } 
      };
    }
  }
}
