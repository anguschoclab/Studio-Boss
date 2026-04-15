import { GameState } from '../../types';
import { TickContext, WeekFilter } from './types';

// System Imports
import { TalentSystem } from '../../systems/TalentSystem';
import { TalentLifecycleSystem } from '../../systems/talent/TalentLifecycleSystem';
import { tickDeathSystem } from '../../systems/talent/DeathSystem';
import { tickDynastySystem } from '../../systems/talent/DynastySystem';
import { tickRelationshipSystem } from '../../systems/talent/RelationshipSystem';
import { tickCliqueSystem } from '../../systems/talent/CliqueSystem';
import { tickProductionEnhancementSystem } from '../../systems/talent/ProductionEnhancementSystem';
import { tickMarketingPromotionSystem } from '../../systems/talent/MarketingPromotionSystem';
import { tickTalentDiscoverySystem } from '../../systems/talent/TalentDiscoverySystem';
import { tickCastingConstraintSystem } from '../../systems/talent/CastingConstraintSystem';
import { tickBiographyGenerator } from '../../systems/talent/BiographyGenerator';
import { tickOrganicEvents } from '../../systems/talent/OrganicEventEnhancer';
import { tickTVRecommendationSystem } from '../../systems/talent/TVRecommendationSystem';
import { TalentMoraleSystem } from '../../systems/talent/TalentMoraleSystem';
import { shouldTalentHireAgent, selectAgentForTalent, shouldTalentFireAgent, createAgentHiringEvent, createAgentFiringEvent } from '../../systems/talent/talentAgentEvents';
import { TalentAgentInteractionEngine } from '../../systems/talent/talentAgentInteractions';

/**
 * Talent Filter
 * Handles talent lifecycle, morale, agent relationships, and various talent systems
 */
export class TalentFilter implements WeekFilter {
  name = 'TalentFilter';

  execute(state: GameState, context: TickContext): void {
    // Core talent systems
    context.impacts.push(TalentSystem.advance(state, context.rng));
    context.impacts.push(...TalentLifecycleSystem.tick(state, context.rng));
    context.impacts.push(...tickDeathSystem(state, context.rng));
    context.impacts.push(...tickDynastySystem(state, context.rng));
    context.impacts.push(...tickRelationshipSystem(state, context.rng));
    context.impacts.push(...tickCliqueSystem(state, context.rng));
    context.impacts.push(...tickProductionEnhancementSystem(state, context.rng));
    context.impacts.push(...tickMarketingPromotionSystem(state, context.rng));
    context.impacts.push(...tickTalentDiscoverySystem(state, context.rng));
    context.impacts.push(...tickCastingConstraintSystem(state, context.rng));
    context.impacts.push(...tickBiographyGenerator(state, context.rng));
    context.impacts.push(...tickOrganicEvents(state, context.rng));
    context.impacts.push(...tickTVRecommendationSystem(state, undefined, context.rng));

    // Phase 1: Register Weekly Morale
    const talentDict = state.entities.talents;
    const projectsDict = state.entities.projects;
    const contractsDict = state.entities.contracts;
    const moraleUpdates = TalentMoraleSystem.processWeeklyMorale(talentDict, projectsDict, contractsDict);
    
    for (const update of moraleUpdates) {
      context.impacts.push({
        type: 'TALENT_UPDATED',
        payload: { talentId: update.talentId, update: update.update }
      });
    }

    // Phase 3: Talent-Agent Hiring/Firing Events
    for (const [talentId, talent] of Object.entries(talentDict)) {
      const hiringCheck = shouldTalentHireAgent(talent, state, context.rng);
      if (hiringCheck.shouldHire) {
        const newAgent = selectAgentForTalent(talent, state, context.rng);
        if (newAgent) {
          // Fire current agent if exists
          if (talent.agentId) {
            const currentRelationshipId = `${talentId}-${talent.agentId}`;
            const newRelationships = { ...state.talentAgentRelationships };
            delete newRelationships[currentRelationshipId];
            
            context.impacts.push({
              type: 'TALENT_UPDATED',
              payload: {
                talentId,
                update: { agentId: undefined, agencyId: undefined }
              }
            });
          }

          // Create new relationship
          const agentPersonality = newAgent.personality || derivePersonalityFromAgent(newAgent);
          const agency = state.industry.agencies.find(a => a.id === newAgent.agencyId);
          TalentAgentInteractionEngine.createRelationship(
            talentId,
            newAgent.id,
            talent.personality || 'pragmatic',
            agentPersonality,
            agency?.tier
          );

          context.impacts.push({
            type: 'TALENT_UPDATED',
            payload: {
              talentId,
              update: { agentId: newAgent.id, agencyId: newAgent.agencyId }
            }
          });

          context.impacts.push({
            type: 'NEWS_ADDED',
            payload: createAgentHiringEvent(talent, newAgent, context.week)
          });
        }
      }

      if (talent.agentId) {
        const relationship = state.talentAgentRelationships[`${talentId}-${talent.agentId}`];
        if (relationship && shouldTalentFireAgent(talent, relationship, state)) {
          context.impacts.push({
            type: 'NEWS_ADDED',
            payload: createAgentFiringEvent(talent, talent.agentId, context.week)
          });

          context.impacts.push({
            type: 'TALENT_UPDATED',
            payload: {
              talentId,
              update: { agentId: undefined, agencyId: undefined }
            }
          });

          // Note: Relationship removal will be handled by impact reducer when talent agentId is cleared
        }
      }

      // Phase 6: Weekly Relationship Evolution
      if (talent.agentId) {
        const relationshipId = `${talentId}-${talent.agentId}`;
        const relationship = state.talentAgentRelationships[relationshipId];
        if (relationship) {
          // Evolve relationship over time
          // Use 0 for weeksSinceLastInteraction since we don't track last interaction week
          TalentAgentInteractionEngine.evolveRelationship(
            relationship,
            0,
            context.rng
          );

          // Note: Relationship updates will be handled by impact reducer in a future update
          // For now, we track evolution but don't update state directly
        }
      }
    }

    function derivePersonalityFromAgent(agent: { negotiationTactic: string }): import('../../systems/talent/talentAgentInteractions').AgentPersonality {
      const tacticMap: Record<string, import('../../systems/talent/talentAgentInteractions').AgentPersonality> = {
        'SHARK': 'shark',
        'DIPLOMAT': 'diplomat',
        'VOLUME': 'volume',
        'PRESTIGE': 'prestige'
      };
      return tacticMap[agent.negotiationTactic] || 'diplomat';
    }
  }
}
