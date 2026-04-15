import { GameState, StateImpact, Talent, Project, Award } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import {
  RelationshipType,
  TalentRelationship,
  RelationshipEvent,
  RelationshipFormation,
  RomanceData
} from '../../types/relationship.types';

/**
 * Relationship System
 * Manages talent-talent relationships: friendships, rivalries, romance, mentorship.
 * Relationships form from shared projects, personality matches, and world events.
 * They affect casting chemistry, project outcomes, and create drama.
 */

// Relationship formation thresholds
const FRIENDSHIP_THRESHOLD = 60;
const RIVALRY_THRESHOLD = -60;
const ROMANCE_THRESHOLD = 70; // Must be friendly first
const MENTORSHIP_THRESHOLD = 50;

// Personality compatibility matrix
const PERSONALITY_COMPATIBILITY: Record<string, Record<string, number>> = {
  'perfectionist': { 'collaborative': -10, 'difficult': -20, 'charismatic': 5, 'pragmatic': 10 },
  'collaborative': { 'difficult': -30, 'charismatic': 15, 'pragmatic': 10, 'artistic': 10 },
  'difficult': { 'charismatic': -15, 'pragmatic': -10, 'artistic': -5 },
  'charismatic': { 'pragmatic': 5, 'artistic': 10, 'commercial': 10 },
  'pragmatic': { 'artistic': -5, 'commercial': 15 },
  'artistic': { 'commercial': -10 },
  'loyal': { 'loyal': 20, 'ambitious': -10 },
  'ambitious': { 'ambitious': -5 },
};

/**
 * Generate unique relationship key (alphabetically sorted)
 */
function getRelationshipKey(talentAId: string, talentBId: string): string {
  return talentAId < talentBId ? `${talentAId}-${talentBId}` : `${talentBId}-${talentAId}`;
}

/**
 * Get existing relationship or null
 */
function getRelationship(
  talentAId: string,
  talentBId: string,
  state: GameState
): TalentRelationship | null {
  const key = getRelationshipKey(talentAId, talentBId);
  return state.relationships?.relationships?.[key] as TalentRelationship || null;
}

/**
 * Calculate base compatibility between two talents
 */
function calculateCompatibility(talentA: Talent, talentB: Talent): number {
  let compatibility = 0;

  // Age similarity (within 10 years = bonus)
  const ageDiff = Math.abs(talentA.demographics.age - talentB.demographics.age);
  if (ageDiff <= 5) compatibility += 15;
  else if (ageDiff <= 10) compatibility += 5;
  else if (ageDiff > 20) compatibility -= 10;

  // Same country/origin bonus
  if (talentA.demographics.country === talentB.demographics.country) {
    compatibility += 10;
  }

  // Personality compatibility
  if (talentA.personality && talentB.personality) {
    const matrix = PERSONALITY_COMPATIBILITY[talentA.personality];
    if (matrix && matrix[talentB.personality]) {
      compatibility += matrix[talentB.personality];
    }
    // Check reverse too
    const reverseMatrix = PERSONALITY_COMPATIBILITY[talentB.personality];
    if (reverseMatrix && reverseMatrix[talentA.personality]) {
      compatibility += reverseMatrix[talentA.personality];
    }
  }

  // Same archetype bonus for actors
  if (talentA.actorArchetype && talentB.actorArchetype) {
    if (talentA.actorArchetype === talentB.actorArchetype) {
      compatibility += 5; // "You get me"
    } else if (
      (talentA.actorArchetype === 'movie_star' && talentB.actorArchetype === 'prestige_actor') ||
      (talentA.actorArchetype === 'prestige_actor' && talentB.actorArchetype === 'movie_star')
    ) {
      compatibility -= 10; // Creative differences
    }
  }

  // Tier differences (status dynamic)
  if (talentA.tier === talentB.tier) {
    compatibility += 10; // Peers understand each other
  } else if (Math.abs(talentA.tier - talentB.tier) === 1) {
    compatibility += 5;
  } else {
    compatibility -= 15; // Big status gap creates tension
  }

  return compatibility;
}

/**
 * Check if two talents worked together on a project
 */
function haveWorkedTogether(talentAId: string, talentBId: string, state: GameState): boolean {
  // ⚡ Bolt: Replaced expensive O(C) contract filtering with O(1) attachedTalentIds lookup
  for (const projectId in state.entities.projects) {
    if (!Object.prototype.hasOwnProperty.call(state.entities.projects, projectId)) continue;
    const project = state.entities.projects[projectId];
    const talentIds = project.attachedTalentIds || [];
    if (talentIds.includes(talentAId) && talentIds.includes(talentBId)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if talents competed for same award
 * Awards are tied to projects, so we check if talents worked on award-winning/nominated projects
 */
export function haveCompeted(talentAId: string, talentBId: string, state: GameState): boolean {
  // Get all awards
  const awards = state.industry?.awards || [];
  if (awards.length === 0) return false;

  // ⚡ Bolt: Iterate over awards directly rather than filtering all projects via Object.values()
  for (const award of awards) {
    const project = state.entities.projects?.[award.projectId];
    if (project) {
      const talentIds = project.attachedTalentIds || [];
      if (talentIds.includes(talentAId) && talentIds.includes(talentBId)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Form a new relationship
 */
function formRelationship(
  formation: RelationshipFormation,
  week: number,
  state: GameState,
  rng: RandomGenerator
): { relationship: TalentRelationship; impacts: StateImpact[] } {
  const impacts: StateImpact[] = [];
  const { talentAId, talentBId, type, strength, reason } = formation;

  const relationship: TalentRelationship = {
    id: getRelationshipKey(talentAId, talentBId),
    talentAId: talentAId < talentBId ? talentAId : talentBId,
    talentBId: talentAId < talentBId ? talentBId : talentAId,
    type,
    strength,
    isPublic: type === 'rival' || type === 'romantic', // Rivalries and romance are often public
    history: [{
      week,
      type: 'formed',
      impact: strength,
      description: reason,
    }],
    formedWeek: week,
    lastUpdatedWeek: week,
  };

  // Romance has additional data
  if (type === 'romantic') {
    const talentA = state.entities.talents?.[talentAId];
    const talentB = state.entities.talents?.[talentBId];
    const powerCoupleRating = calculatePowerCoupleRating(talentA, talentB);

    (relationship as any).romanceData = {
      isMarried: false,
      isSecret: rng.next() < 0.3, // 30% secret relationships
      stability: 50 + rng.rangeInt(-20, 20),
      powerCoupleRating,
    };

    // Power couples get news
    if (powerCoupleRating > 150) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          headline: `Hollywood Power Couple Alert: ${talentA?.name} and ${talentB?.name}`,
          description: `Two of Hollywood's biggest stars have been spotted together, sparking rumors of a romance that could shake up the industry.`,
          category: 'talent',
          publication: 'People Magazine',
        },
      });
    }
  }

  // Public rivalries get news
  if (type === 'rival' && strength < -70) {
    const talentA = state.entities.talents?.[talentAId];
    const talentB = state.entities.talents?.[talentBId];

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        headline: `${talentA?.name} vs ${talentB?.name}: The Feud Escalates`,
        description: `Sources confirm the tension between these two stars has reached a boiling point. Industry insiders say they refuse to work together.`,
        category: 'talent',
        publication: 'The Hollywood Reporter',
      },
    });
  }

  return { relationship, impacts };
}

/**
 * Calculate power couple rating (combined fame)
 */
function calculatePowerCoupleRating(talentA?: Talent, talentB?: Talent): number {
  if (!talentA || !talentB) return 0;

  const fameA = (talentA.prestige || 50) + (talentA.draw || 50) + (talentA.starMeter || 50);
  const fameB = (talentB.prestige || 50) + (talentB.draw || 50) + (talentB.starMeter || 50);

  return fameA + fameB;
}

/**
 * Check for natural relationship formation from world events
 */
function checkNaturalFormation(
  talentA: Talent,
  talentB: Talent,
  state: GameState,
  rng: RandomGenerator
): RelationshipFormation | null {
  // Skip if relationship already exists
  const existing = getRelationship(talentA.id, talentB.id, state);
  if (existing) return null;

  const compatibility = calculateCompatibility(talentA, talentB);

  // Worked together on project
  if (haveWorkedTogether(talentA.id, talentB.id, state)) {
    // High compatibility + worked together = friendship likely
    if (compatibility > 20 && rng.next() < 0.4) {
      return {
        talentAId: talentA.id,
        talentBId: talentB.id,
        type: 'friend',
        strength: Math.min(100, 50 + compatibility),
        reason: 'Bonded while working together on set',
      };
    }

    // Low compatibility + worked together = rivalry likely
    if (compatibility < -20 && rng.next() < 0.3) {
      return {
        talentAId: talentA.id,
        talentBId: talentB.id,
        type: 'rival',
        strength: Math.max(-100, -50 + compatibility),
        reason: 'Creative differences during production led to tension',
      };
    }
  }

  // Competed for award = rivalry
  if (haveCompeted(talentA.id, talentB.id, state) && rng.next() < 0.3) {
    return {
      talentAId: talentA.id,
      talentBId: talentB.id,
      type: 'rival',
      strength: -40,
      reason: 'Competitive tension after competing for the same award',
    };
  }

  // High compatibility but haven't worked together = potential friends
  if (compatibility > 30 && rng.next() < 0.1) {
    return {
      talentAId: talentA.id,
      talentBId: talentB.id,
      type: 'friend',
      strength: 40,
      reason: 'Met at industry event and hit it off immediately',
    };
  }

  // Mentor relationship (older + prestige guides younger)
  const ageDiff = talentA.demographics.age - talentB.demographics.age;
  if (ageDiff > 15 && talentA.prestige > 70 && talentB.prestige < 60 && rng.next() < 0.15) {
    return {
      talentAId: talentA.id,
      talentBId: talentB.id,
      type: 'mentor',
      strength: 60,
      reason: `${talentA.name} took ${talentB.name} under their wing`,
    };
  }

  // Romance formation (must be friendly first or high chemistry)
  if (compatibility > 40 && rng.next() < 0.05) { // Rare - 5% chance
    // Check if either is already in public relationship
    const existingRelationships = (state as any).relationships?.relationships || {};
    const existingRomance = Object.values(existingRelationships)
      .some((r: any) =>
        (r.talentAId === talentA.id || r.talentBId === talentA.id ||
         r.talentAId === talentB.id || r.talentBId === talentB.id) &&
        r.type === 'romantic' &&
        r.strength > 50
      );

    if (!existingRomance) {
      return {
        talentAId: talentA.id,
        talentBId: talentB.id,
        type: 'romantic',
        strength: 70,
        reason: 'Sparks flew at an after-party',
      };
    }
  }

  return null;
}

/**
 * Evolve existing relationships
 */
function evolveRelationship(
  relationship: TalentRelationship,
  state: GameState,
  rng: RandomGenerator
): { updated: TalentRelationship; impacts: StateImpact[] } {
  const impacts: StateImpact[] = [];
  const talentA = state.entities.talents?.[relationship.talentAId];
  const talentB = state.entities.talents?.[relationship.talentBId];

  if (!talentA || !talentB) {
    // One talent died or left - relationship ends
    return { updated: relationship, impacts };
  }

  let strengthChange = 0;
  let eventType: RelationshipEvent['type'] | null = null;
  let description = '';

  // Random drift
  strengthChange += rng.rangeInt(-5, 5);

  // Working together affects relationship
  if (haveWorkedTogether(talentA.id, talentB.id, state)) {
    if (relationship.type === 'friend') {
      strengthChange += 5;
      eventType = 'strengthened';
      description = 'Reunited on set and their friendship deepened';
    } else if (relationship.type === 'rival') {
      strengthChange -= 5;
      eventType = 'weakened';
      description = 'Being forced to work together intensified their feud';
    }
  }

  // Award competition affects rivals
  if (relationship.type === 'rival' && haveCompeted(talentA.id, talentB.id, state)) {
    strengthChange -= 10;
    eventType = 'weakened';
    description = `Competing for the same award reignited their rivalry`;
  }

  // Romance stability
  if (relationship.type === 'romantic') {
    const romanceData = (relationship as any).romanceData as RomanceData;

    // Secret relationships have pressure
    if (romanceData?.isSecret && rng.next() < 0.1) {
      strengthChange -= 3;
      description = 'The pressure of keeping their relationship secret is taking a toll';
    }

    // Long relationships gain stability
    const weeksTogether = state.week - relationship.formedWeek;
    if (weeksTogether > 52 && rng.next() < 0.3) {
      strengthChange += 10;
      eventType = 'strengthened';
      description = `Celebrated ${Math.floor(weeksTogether / 52)} year anniversary`;
    }

    // Breakup chance (high when strength drops)
    if (relationship.strength < 30 && rng.next() < 0.2) {
      // Convert to ex
      relationship.type = 'ex';
      relationship.strength = -20;
      eventType = 'breakup';
      description = `${talentA.name} and ${talentB.name} have called it quits`;

      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          headline: `It's Over: ${talentA.name} and ${talentB.name} Split`,
          description: `After weeks of speculation, sources confirm the couple has gone their separate ways.`,
          category: 'talent',
          publication: 'People Magazine',
        },
      });

      // Update spouseId if married
      if (talentA.spouseId === talentB.id) {
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: {
            talentId: talentA.id,
            update: { spouseId: undefined },
          },
        });
      }
      if (talentB.spouseId === talentA.id) {
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: {
            talentId: talentB.id,
            update: { spouseId: undefined },
          },
        });
      }
    }
  }

  // Apply change
  const newStrength = Math.max(-100, Math.min(100, relationship.strength + strengthChange));

  if (newStrength !== relationship.strength && eventType) {
    relationship.strength = newStrength;
    relationship.lastUpdatedWeek = state.week;
    relationship.history.push({
      week: state.week,
      type: eventType,
      impact: strengthChange,
      description,
    });
  }

  return { updated: relationship, impacts };
}

/**
 * Main relationship system tick
 */
export function tickRelationshipSystem(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const talents = Object.values(state.entities.talents || {});

  // 1. Check for new relationship formations
  for (let i = 0; i < talents.length; i++) {
    for (let j = i + 1; j < talents.length; j++) {
      const formation = checkNaturalFormation(talents[i], talents[j], state, rng);

      if (formation) {
        const { relationship, impacts: formationImpacts } = formRelationship(
          formation,
          state.week,
          state,
          rng
        );

        impacts.push(...formationImpacts);

        // Add to state
        const key = getRelationshipKey(formation.talentAId, formation.talentBId);
        impacts.push({
          type: 'RELATIONSHIP_FORMED',
          payload: {
            key,
            relationship,
          },
        } as any);

        // Update spouseId for public romantic relationships
        if (relationship.type === 'romantic' && relationship.isPublic) {
          impacts.push({
            type: 'TALENT_UPDATED',
            payload: {
              talentId: relationship.talentAId,
              update: { spouseId: relationship.talentBId },
            },
          });
          impacts.push({
            type: 'TALENT_UPDATED',
            payload: {
              talentId: relationship.talentBId,
              update: { spouseId: relationship.talentAId },
            },
          });
        }
      }
    }
  }

  // 2. Evolve existing relationships
  const existingRelationships = Object.values((state as any).relationships?.relationships || {}) as TalentRelationship[];
  for (const relationship of existingRelationships) {
    // 30% chance to evolve each existing relationship per week
    if (rng.next() < 0.3) {
      const { updated, impacts: evolutionImpacts } = evolveRelationship(relationship, state, rng);

      if (updated !== relationship) {
        const key = getRelationshipKey(relationship.talentAId, relationship.talentBId);
        impacts.push({
          type: 'RELATIONSHIP_UPDATED',
          payload: {
            key,
            relationship: updated,
          },
        } as any);
      }

      impacts.push(...evolutionImpacts);
    }
  }

  return impacts;
}

/**
 * Check if two talents are friends
 */
export function areFriends(talentAId: string, talentBId: string, state: GameState): boolean {
  const rel = getRelationship(talentAId, talentBId, state);
  return rel?.type === 'friend' && rel.strength > 40;
}

/**
 * Check if two talents are rivals/enemies
 */
export function areRivals(talentAId: string, talentBId: string, state: GameState): boolean {
  const rel = getRelationship(talentAId, talentBId, state);
  return (rel?.type === 'rival' || rel?.type === 'enemy') && rel.strength < -40;
}

/**
 * Check if two talents are romantically involved
 */
export function areRomantic(talentAId: string, talentBId: string, state: GameState): boolean {
  const rel = getRelationship(talentAId, talentBId, state);
  return rel?.type === 'romantic' && rel.strength > 50;
}

/**
 * Get all relationships for a talent
 */
export function getTalentRelationships(talentId: string, state: GameState): TalentRelationship[] {
  return Object.values((state as any).relationships?.relationships || {})
    .filter((r: any) => r.talentAId === talentId || r.talentBId === talentId) as TalentRelationship[];
}

/**
 * Get casting chemistry modifier for two talents
 * Returns bonus/penalty (-20 to +20) to project quality
 */
export function getCastingChemistry(
  talentAId: string,
  talentBId: string,
  state: GameState,
  rng?: RandomGenerator
): number {
  const rel = getRelationship(talentAId, talentBId, state);

  if (!rel) return 0; // Neutral

  switch (rel.type) {
    case 'friend':
    case 'mentor':
      return Math.floor(rel.strength / 10); // Up to +10 for best friends
    case 'romantic':
      return Math.floor(rel.strength / 8) + 5; // Bonus for real couples +5
    case 'rival':
    case 'enemy':
      return Math.floor(rel.strength / 10); // Negative, up to -10
    case 'ex':
      return -15; // Awkward!
    case 'frenemy':
      return rng && rng.next() < 0.5 ? 5 : -5; // Unpredictable
    default:
      return 0;
  }
}
