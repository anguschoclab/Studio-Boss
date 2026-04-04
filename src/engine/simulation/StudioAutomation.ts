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
    const projects = isPlayer 
      ? Object.values(state.studio.internal.projects) 
      : []; // Rivals handled separately below

    if (isPlayer) {
      projects.forEach(p => {
        this.processProject(p, state, rng, impacts, 'PLAYER');
      });
    } else {
      state.industry.rivals.forEach(rival => {
        Object.values(rival.projects || {}).forEach(p => {
          this.processProject(p, state, rng, impacts, rival.id);
        });
      });
    }

    return impacts;
  }

  private static processProject(p: Project, state: GameState, rng: RandomGenerator, impacts: StateImpact[], studioId: string | 'PLAYER'): void {
    // 1. Resolve Pitching
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

    // 2. Resolve Greenlight
    if (p.state === 'needs_greenlight') {
      impacts.push(this.createUpdateImpact(studioId, p.id, { state: 'production', weeksInPhase: 0 }, state));
    }

    // 3. Resolve Marketing -> Release
    if (p.state === 'marketing') {
      const tiers: ('none' | 'basic' | 'blockbuster')[] = ['none', 'basic', 'blockbuster'];
      const tier = rng.pick(tiers);
      impacts.push(this.createUpdateImpact(studioId, p.id, { 
        state: 'released', 
        weeksInPhase: 0,
        marketingLevel: tier,
        releaseWeek: state.week
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
