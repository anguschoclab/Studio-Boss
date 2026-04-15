import { GameState, StateImpact, Project, RivalStudio } from '@/engine/types';
import { BudgetTierKey } from '@/engine/types/project.types';
import { RandomGenerator } from '../utils/rng';
import { calculateOpeningWeekend } from '../systems/releaseSimulation';
import { StreamingViewershipTracker } from '../systems/production/StreamingViewershipTracker';
import { StudioArchetype, AI_ARCHETYPES } from '../data/aiArchetypes';

export class StudioAutomation {
  /**
   * Helper function to get the StudioArchetype for a rival studio.
   * Uses archetypeId if available, falls back to behaviorId for backward compatibility.
   */
  private static getRivalArchetype(rival: RivalStudio): StudioArchetype {
    const archetypeId = rival.archetypeId || ('behaviorId' in rival ? (rival as any).behaviorId : undefined);
    if (archetypeId) {
      const archetype = AI_ARCHETYPES.find(a => a.id === archetypeId);
      if (archetype) return archetype;
    }
    // Default to BALANCED_GIANT if no archetype found
    return AI_ARCHETYPES.find(a => a.id === 'BALANCED_GIANT') || AI_ARCHETYPES[5];
  }

  /**
   * Main simulation tick for rival studios.
   * Handles project pitching, production, and high-level strategic adaptation.
   */
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];

    const rivalsList = Object.values(state.entities.rivals || {});

    rivalsList.forEach(rival => {
      // Get archetype for archetype-driven decisions
      const archetype = this.getRivalArchetype(rival);

      // 1. Studio Status & Liquidation (use ma_willingness for platform launch decision)
      const isDistressed = (Number(rival.cash) || 0) < -50000000;

      if (isDistressed && (state.week % 4 === 0) && rng.next() < 0.1) {
          this.triggerLiquidation(rival, state, rng, impacts);
      } else if (rival.cash > 500000000 && (!rival.ownedPlatforms || rival.ownedPlatforms.length === 0)) {
          // Use ma_willingness for platform launch decision
          if (rng.next() < (0.05 * archetype.ma_willingness)) {
              this.triggerPlatformLaunch(rival, state, rng, impacts);
          }
      }

      if (isDistressed !== rival.isAcquirable) {
          impacts.push({
            type: 'RIVAL_UPDATED',
            payload: { rivalId: rival.id, update: { isAcquirable: isDistressed } }
          });
      }

      // 2. Process Individual Projects (backward compatibility for projects field)
      let activeCount = 0;
      const expiredProjectIds: string[] = [];
      const rivalProjects = ('projects' in rival && rival.projects) ? (rival as any).projects : {};

      // ⚡ Bolt: Consolidated project iteration to prevent multiple filter/map array allocations
      for (const id in rivalProjects) {
        const p = rivalProjects[id];
        this.processProject(p, rival.id, state, rng, impacts, archetype);

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

      // 3. Pitch New Projects (If slot available) - use archetype for decisions
      if (activeCount < 5 && rng.next() < 0.1) {
        this.pitchNewProject(rival, state, rng, impacts, archetype);
      }
    });

    return impacts;
  }

  private static processProject(p: Project, studioId: string, state: GameState, rng: RandomGenerator, impacts: StateImpact[], archetype: StudioArchetype): void {
    // 1. Resolve Pitching (Random buyer pickup)
    if (p.state === 'pitching') {
      const eligibleBuyers = state.market.buyers.filter(b => b.archetype === 'streamer' || b.archetype === 'network');
      const buyer = rng.pick(eligibleBuyers);
      if (buyer && rng.next() < 0.3) {
        const update: Partial<Project> = { state: 'production', weeksInPhase: 0 };
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

      const rivalPrestige = studioId === 'PLAYER' ? state.studio.prestige : (state.entities.rivals[studioId]?.prestige || 50);
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

      // Initialize streaming viewership for streaming distribution
      let streamingUpdate = {};
      if (p.distributionStatus === 'streaming' && p.buyerId) {
        const platform = state.market.buyers.find(b => b.id === p.buyerId);
        if (platform) {
          const streamingViewership = StreamingViewershipTracker.initializeViewership(
            p,
            platform.id,
            platform,
            state.week,
            rng
          );
          // Store as array to match type definition (streamingViewership?: StreamingViewershipHistory[])
          streamingUpdate = { streamingViewership: [streamingViewership] };
        }
      }

      impacts.push(this.createUpdateImpact(studioId, p.id, {
        ...releasedProject,
        ...tvUpdate,
        ...streamingUpdate,
        state: nextStatus as any,
        weeksInPhase: 0,
        releaseWeek: state.week,
        activeCrisis: null
      }, state));
    }
  }

  private static triggerLiquidation(rival: RivalStudio, state: GameState, rng: RandomGenerator, impacts: StateImpact[]): void {
      // Backward compatibility for ipAssets field
      const ipAssets = ('ipAssets' in rival && rival.ipAssets) ? Object.values((rival as any).ipAssets) : [];
      if (ipAssets.length === 0) return;

      const asset = rng.pick(ipAssets) as any;
      const bidPrice = (asset.baseValue || 10000000) * (0.5 + rng.next() * 0.5);

      impacts.push({
          type: 'NEWS_ADDED',
          payload: {
              id: rng.uuid('NWS'),
              headline: `LIQUIDATION: ${rival.name} auctions IP!`,
              description: `Facing financial pressure, ${rival.name} has sold ${asset.title} to the highest bidder for $${(bidPrice / 1000000).toFixed(1)}M.`,
              category: 'business',
              week: state.week
          }
      });

      impacts.push({
          type: 'RIVAL_UPDATED',
          payload: {
              rivalId: rival.id,
              update: {
                  cash: (Number(rival.cash) || 0) + bidPrice,
                  ipAssets: Object.fromEntries(Object.entries((rival as any).ipAssets || {}).filter(([id]) => id !== asset.id))
              }
          }
      });
  }

  private static triggerPlatformLaunch(rival: RivalStudio, state: GameState, rng: RandomGenerator, impacts: StateImpact[]): void {
      const cost = 200000000;
      impacts.push({
          type: 'NEWS_ADDED',
          payload: {
              id: rng.uuid('NWS'),
              headline: `BUSINESS: ${rival.name} launches streaming service!`,
              description: `Aiming for vertical integration, ${rival.name} has invested $200M in a new SVOD platform.`,
              category: 'business',
              week: state.week
          }
      });
      impacts.push({
          type: 'RIVAL_UPDATED',
          payload: { rivalId: rival.id, update: { cash: (Number(rival.cash) || 0) - cost } }
      });
  }

  private static pitchNewProject(rival: RivalStudio, state: GameState, rng: RandomGenerator, impacts: StateImpact[], archetype: StudioArchetype): void {
    const id = rng.uuid('PRJ');

    // Use archetype properties for decision making
    // greenlight_bias: ProjectFormat[] - determines format bias
    const formatBias = archetype.greenlight_bias;
    const format = formatBias.length > 0 ? rng.pick(formatBias) : (rng.next() < 0.3 ? 'tv' : 'film');

    // genreFocus: string[] - determines genre preference
    const genreFocus = archetype.genreFocus;
    const genres = genreFocus.length > 0 && genreFocus[0] !== 'Any' ? genreFocus : ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Family'];
    const genre = rng.pick(genres);

    // budget_tier_weights: Record<BudgetTierKey, number> - determines budget tier
    const budgetTiers: BudgetTierKey[] = ['indie', 'low', 'mid', 'high', 'blockbuster'];
    const weights = budgetTiers.map(tier => archetype.budget_tier_weights[tier]);
    const budgetTier = this.weightedRandom(budgetTiers, weights, rng);

    const project: any = {
      id,
      title: `${genre} ${rng.rangeInt(1, 100)}`,
      genre,
      format,
      type: format === 'tv' ? 'SERIES' : 'FILM',
      state: 'pitching',
      weeksInPhase: 0,
      budgetTier,
      buzz: rng.rangeInt(20, 50),
      reviewScore: rng.rangeInt(40, 75),
      ownerId: rival.id, // Set ownerId for unified storage
      archetypeId: archetype.id, // Set archetypeId for archetype-driven behavior
    };

    if (format === 'tv') {
        project.tvDetails = {
            status: 'IN_DEVELOPMENT',
            episodesOrdered: rng.rangeInt(8, 13),
            episodesAired: 0,
            averageRating: 0
        };
    }

    // Backward compatibility for projects field
    const rivalProjects = ('projects' in rival && rival.projects) ? (rival as any).projects : {};
    impacts.push({
      type: 'RIVAL_UPDATED',
      payload: { rivalId: rival.id, update: { projects: { ...rivalProjects, [id]: project } } }
    });
  }

  /**
   * Helper function for weighted random selection based on weights
   */
  private static weightedRandom<T>(items: T[], weights: number[], rng: RandomGenerator): T {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = rng.next() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  private static initializeProduction(p: Project, studioId: string, state: GameState, rng: RandomGenerator): { update: Partial<Project>; subImpacts: StateImpact[] } {
    const subImpacts: StateImpact[] = [];
    const update: Partial<Project> = {
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
      const rival = state.entities.rivals[studioId];
      // Backward compatibility for projects field
      const rivalProjects = ('projects' in rival && rival.projects) ? (rival as any).projects : {};
      const existingProject = rivalProjects[projectId] || {};
      return {
        type: 'RIVAL_UPDATED',
        payload: { rivalId: studioId, update: { projects: { ...rivalProjects, [projectId]: { ...existingProject, ...update } } } }
      };
    }
  }
}
