import { Talent, Agent, Agency } from '../../types/talent.types';
import { GameState } from '../../types/studio.types';
import { TalentAgentRelationship } from './talentAgentInteractions';
import { RandomGenerator } from '../../utils/rng';

/**
 * Talent-Agent Event System
 * Handles event-based hiring and firing of agents by talents
 * Since the player is the studio, these events happen independently
 * and are observed through news feeds and talent cards
 */

/**
 * Determine if a talent should hire a new agent
 */
export function shouldTalentHireAgent(
  talent: Talent
): { shouldHire: boolean; preferredAgentId?: string } {
  // A_LIST and B_LIST talents without agents are likely to hire
  if (!talent.agentId && (talent.tier === 'A_LIST' || talent.tier === 'B_LIST')) {
    return { shouldHire: true };
  }

  // Rising stars may upgrade agents
  if (talent.careerTrajectory === 'rising' && talent.prestige > 70) {
    return { shouldHire: true };
  }

  // Recent success may trigger agent change
  // Note: filmography structure doesn't have reviewScore/week, so we skip this check for now
  // This can be enhanced later when filmography is expanded

  return { shouldHire: false };
}

/**
 * Determine if a talent should fire their agent
 */
export function shouldTalentFireAgent(
  talent: Talent,
  relationship: TalentAgentRelationship
): boolean {
  if (!talent.agentId) return false;

  // No bookings for over a year
  const commitments = (talent as any).commitments;
  const weeksSinceLastBooking = commitments?.length === 0 ? 53 : 0;
  if (weeksSinceLastBooking >= 52) return true;

  // Poor relationship
  if (relationship.relationshipScore < 20) return true;

  // Career decline with poor relationship
  if (talent.careerTrajectory === 'declining' && relationship.relationshipScore < 40) {
    return true;
  }

  // Multiple failed negotiations
  if (relationship.history.failedDeals >= 3 && 
      relationship.history.failedDeals > relationship.history.successfulDeals) {
    return true;
  }

  return false;
}

/**
 * Select an appropriate agent for a talent
 */
export function selectAgentForTalent(
  talent: Talent,
  state: GameState,
  rng: RandomGenerator
): Agent | undefined {
  const agencyMap = new Map<string, Agency>(state.industry.agencies.map(a => [a.id, a]));
  const availableAgents = state.industry.agents.filter(agent => {
    // Filter out agents already with the talent (if any)
    if (talent.agentId && agent.id === talent.agentId) return false;
    
    // A_LIST talents should only get agents from powerhouse or major agencies
    if (talent.tier === 'A_LIST') {
      const agency = agent.agencyId ? agencyMap.get(agent.agencyId) : undefined;
      return agency?.tier === 'powerhouse' || agency?.tier === 'major';
    }
    
    return true;
  });

  if (availableAgents.length === 0) return undefined;

  // Random selection weighted by agent prestige
  const totalPrestige = availableAgents.reduce((sum, agent) => sum + agent.prestige, 0);
  let randomValue = rng.next() * totalPrestige;
  
  for (const agent of availableAgents) {
    randomValue -= agent.prestige;
    if (randomValue <= 0) {
      return agent;
    }
  }

  return availableAgents[0];
}

/**
 * Create a hiring event for the news feed
 */
export function createAgentHiringEvent(
  talent: Talent,
  agent: Agent,
  week: number
): { id: string; text: string; week: number; category: string } {
  return {
    id: `hire-${talent.id}-${agent.id}-${week}`,
    text: `${talent.name} has hired ${agent.name} as their new agent.`,
    week,
    category: 'talent'
  };
}

/**
 * Create a firing event for the news feed
 */
export function createAgentFiringEvent(
  talent: Talent,
  agentId: string,
  week: number
): { id: string; text: string; week: number; category: string } {
  return {
    id: `fire-${talent.id}-${agentId}-${week}`,
    text: `${talent.name} has parted ways with their agent.`,
    week,
    category: 'talent'
  };
}
