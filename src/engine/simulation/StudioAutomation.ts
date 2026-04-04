import { GameState, StateImpact, Project, RivalStudio, Contract, Talent } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { calculateOpeningWeekend } from '../systems/releaseSimulation';

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
        const projects = Object.values(rival.projects || {});
        
        projects.forEach(p => {
          this.processProject(p, state, rng, impacts, rival.id);
        });

        // 4. Dynamic Persona Shifting
        let persona: 'frugal' | 'aggressive' | 'balanced' = 'balanced';
        if (rival.cash < 10000000) persona = 'frugal';
        else if (rival.cash > 100000000) persona = 'aggressive';

        // 5. Slate Management (Simulation Only)
        const maxProjects = persona === 'frugal' ? 2 : (persona === 'aggressive' ? 6 : 4);
        
        if (projects.length < maxProjects) {
            const opportunities = state.market.opportunities.filter(o => !o.bids[rival.id]);
            if (opportunities.length > 0) {
                const myGenres = projects.map(p => p.genre);
                const candidates = opportunities.filter(o => myGenres.filter(g => g === o.genre).length < 2);
                
                if (candidates.length > 0) {
                    const trends = state.market.trends || [];
                    const topTrends = trends.filter(t => t.heat > 70).map(t => t.genre);
                    const trendMatch = candidates.find(o => topTrends.includes(o.genre));
                    const opp = trendMatch || rng.pick(candidates);
                    
                    let bidMult = topTrends.includes(opp.genre) ? 1.25 : 1.05;

                    impacts.push({
                        type: 'OPPORTUNITY_UPDATED',
                        payload: {
                            opportunityId: opp.id,
                            rivalId: rival.id,
                            bid: { amount: Math.floor(opp.costToAcquire * bidMult), terms: 'standard' }
                        }
                    });
                }
            }
        }

        // 6. Distress Signal & Consolidation Readiness
        const isDistressed = rival.cash < 0;

        // Phase 5 Strategic Adaptation
        if (rival.cash < -50000000) {
            this.triggerLiquidation(rival, state, rng, impacts);
        } else if (rival.cash > 500000000 && (!rival.ownedPlatforms || rival.ownedPlatforms.length === 0)) {
            if (rng.next() < 0.05) { // 5% weekly chance for a surge
                this.triggerPlatformLaunch(rival, state, rng, impacts);
            }
        }

        if (isDistressed !== rival.isAcquirable) {
          impacts.push({
            type: 'RIVAL_UPDATED',
            payload: { 
              rivalId: rival.id, 
              update: { 
                isAcquirable: isDistressed 
              } 
            }
          });
        }
      });
    }

    return impacts;
  }

  private static processProject(p: Project, state: GameState, rng: RandomGenerator, impacts: StateImpact[], studioId: string | 'PLAYER'): void {
    // 1. Resolve Pitching (Random buyer pickup)
    if (p.state === 'pitching') {
      const eligibleBuyers = state.market.buyers.filter(b => b.archetype === 'streamer' || b.archetype === 'network');
      const buyer = rng.pick(eligibleBuyers);
      if (buyer) {
        const { update, subImpacts } = this.initializeProduction(p, studioId, state, rng);
        impacts.push(...subImpacts);
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

    // 3. Resolve Marketing -> Release (Opening Weekend Simulation)
    if (p.state === 'marketing') {
      const tiers: ('none' | 'basic' | 'blockbuster')[] = ['none', 'basic', 'blockbuster'];
      const tier = rng.pick(tiers);
      const budgetMap = { 'none': 0, 'basic': 5000000, 'blockbuster': 25000000 };
      const marketingBudget = budgetMap[tier];

      // ⚡ Phase 5 Hyper-Simulation: Rivals now use the same opening weekend logic as the player
      const rivalPrestige = studioId === 'PLAYER' ? state.studio.prestige : (state.industry.rivals.find(r => r.id === studioId)?.prestige || 50);
      const { project: releasedProject } = calculateOpeningWeekend(
          { ...p, marketingLevel: tier, marketingBudget }, 
          [], // Talent filtered out for simulation speed unless needed
          rivalPrestige,
          rng
      );

      impacts.push(this.createUpdateImpact(studioId, p.id, { 
        ...releasedProject,
        state: 'released', 
        weeksInPhase: 0,
        releaseWeek: state.week,
        activeCrisis: null
      }, state));
    }
  }

  private static initializeProduction(p: Project, studioId: string | 'PLAYER', state: GameState, rng: RandomGenerator): { update: Partial<Project>; subImpacts: StateImpact[] } {
    const subImpacts: StateImpact[] = [];
    const contracts: Contract[] = [];
    const update: Partial<Project> = {
      state: 'production',
      weeksInPhase: 0,
      productionWeeks: rng.rangeInt(12, 26),
      budget: p.budget || rng.rangeInt(10, 80) * 1_000_000,
      buzz: p.buzz || 40,
      rating: 'PG-13',
      activeCut: rng.next() < 0.2 ? 'sanitized' : 'theatrical'
    };

    if (studioId !== 'PLAYER') {
      const pool = Object.values(state.industry.talentPool).filter(t => !t.contractId);
      const directors = pool.filter(t => t.role === 'director');
      const actors = pool.filter(t => t.role === 'actor');

      const director = rng.pick(directors);
      if (director) {
        const contractId = rng.uuid('c-auto');
        contracts.push({ id: contractId, talentId: director.id, projectId: p.id, role: 'director' as any, status: 'active', fee: director.fee } as any);
        subImpacts.push({ type: 'TALENT_UPDATED', payload: { talentId: director.id, update: { contractId: contractId } } });
      }

      const lead = rng.pick(actors);
      if (lead) {
        const contractId = rng.uuid('c-auto');
        contracts.push({ id: contractId, talentId: lead.id, projectId: p.id, role: 'lead' as any, status: 'active', fee: lead.fee * 1.2 } as any);
        subImpacts.push({ type: 'TALENT_UPDATED', payload: { talentId: lead.id, update: { contractId: contractId } } });
      }
    }

    return { 
      update: { ...update, contracts: contracts as any } as any, 
      subImpacts 
    };
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

  private static triggerLiquidation(rival: RivalStudio, state: GameState, rng: RandomGenerator, impacts: StateImpact[]): void {
    // 1. Identify IP Assets to liquidate
    const myAssets = state.ip.vault.filter(a => a.ownerStudioId === rival.id);
    if (myAssets.length > 0) {
        const asset = rng.pick(myAssets);
        // Create an Opportunity for others to buy
        impacts.push({
            type: 'INDUSTRY_UPDATE',
            payload: {
                update: {
                    [`market.opportunities.${rng.uuid('opp-liq')}`]: {
                        id: rng.uuid('opp-liq'),
                        type: 'rights',
                        title: `${asset.title} (Library Rights)`,
                        format: 'film',
                        genre: 'Unknown',
                        budgetTier: 'high',
                        costToAcquire: Math.floor((asset.baseValue || 10000000) * 0.8), // Liquidation discount
                        origin: 'agency_package',
                        episodes: 0,
                        bids: {},
                        bidHistory: [],
                        expirationWeek: state.week + 4,
                        weeksUntilExpiry: 4,
                        originalProjectId: asset.id // Link back to the original IP
                    }
                }
            }
        });
        
        impacts.push({
            type: 'NEWS_ADDED',
            payload: {
                headline: `DISTRESS SALE: ${rival.name} liquidating IPs`,
                description: `Facing severe liquidity constraints, ${rival.name} has put the rights to "${asset.title}" up for auction.`,
                category: 'market'
            }
        });
    }
  }

  private static triggerPlatformLaunch(rival: RivalStudio, state: GameState, rng: RandomGenerator, impacts: StateImpact[]): void {
    const cost = 250_000_000; // Expensive to launch
    const platformId = rng.uuid('streamer');
    
    impacts.push({
        type: 'INDUSTRY_UPDATE',
        payload: {
            update: {
                [`market.buyers.${platformId}`]: {
                    id: platformId,
                    name: `${rival.name}+`,
                    archetype: 'streamer',
                    ownerId: rival.id,
                    parentBrand: rival.name,
                    subscribers: 5_000_000,
                    contentLibraryQuality: 40,
                    activeLicenses: []
                }
            }
        }
    });

    impacts.push({
        type: 'RIVAL_UPDATED',
        payload: {
            rivalId: rival.id,
            update: { 
                cash: rival.cash - cost,
                ownedPlatforms: [platformId]
            }
        }
    });

    impacts.push({
        type: 'NEWS_ADDED',
        payload: {
            headline: `STREAMING WARS: ${rival.name} launches ${rival.name}+`,
            description: `In a major strategic expansion, ${rival.name} has officially joined the streaming wars with the launch of their new platform.`,
            category: 'market'
        }
    });
  }
}
