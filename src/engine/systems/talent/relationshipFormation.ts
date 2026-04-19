import { GameState, StateImpact, Talent } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import { RelationshipFormation, RomanceData, TalentRelationship } from '../../types/relationship.types';
import {
  getRelationshipKey,
  calculateCompatibility,
  calculatePowerCoupleRating,
} from './relationshipCompatibility';

/**
 * Relationship formation logic
 * Handles: working-together checks, award competition checks,
 * natural formation rules, and relationship object construction.
 */

export function getRelationship(
  talentAId: string,
  talentBId: string,
  state: GameState
): TalentRelationship | null {
  const key = getRelationshipKey(talentAId, talentBId);
  return state.relationships?.relationships?.[key] || null;
}

export function haveWorkedTogether(
  talentAId: string,
  talentBId: string,
  state: GameState,
  projectTalentMap?: Map<string, Set<string>>
): boolean {
  if (projectTalentMap) {
    for (const talentSet of projectTalentMap.values()) {
      if (talentSet.has(talentAId) && talentSet.has(talentBId)) return true;
    }
    return false;
  }

  const projectsDict = state.entities.projects || {};
  for (const pid of Object.keys(projectsDict)) {
    const project = projectsDict[pid];
    const talentIds = project.attachedTalentIds || [];
    if (talentIds.includes(talentAId) && talentIds.includes(talentBId)) return true;
  }

  return false;
}

export function haveCompeted(
  talentAId: string,
  talentBId: string,
  state: GameState,
  awardedProjectsTalentSets?: Set<string>[]
): boolean {
  if (awardedProjectsTalentSets) {
    for (const talentSet of awardedProjectsTalentSets) {
      if (talentSet.has(talentAId) && talentSet.has(talentBId)) return true;
    }
    return false;
  }

  const awards = state.industry?.awards || [];
  const awardedProjectIds = awards.map(a => a.projectId);
  const projectsDict = state.entities.projects || {};

  for (const pid of Object.keys(projectsDict)) {
    const project = projectsDict[pid];
    if (!awardedProjectIds.includes(project.id)) continue;
    const talentIds = project.attachedTalentIds || [];
    if (talentIds.includes(talentAId) && talentIds.includes(talentBId)) return true;
  }

  return false;
}

export function checkNaturalFormation(
  talentA: Talent,
  talentB: Talent,
  state: GameState,
  rng: RandomGenerator,
  projectTalentMap?: Map<string, Set<string>>,
  awardedProjectsTalentSets?: Set<string>[]
): RelationshipFormation | null {
  const existing = getRelationship(talentA.id, talentB.id, state);
  if (existing) return null;

  const compatibility = calculateCompatibility(talentA, talentB);

  if (haveWorkedTogether(talentA.id, talentB.id, state, projectTalentMap)) {
    if (compatibility > 20 && rng.next() < 0.4) {
      return {
        talentAId: talentA.id, talentBId: talentB.id,
        type: 'friend', strength: Math.min(100, 50 + compatibility),
        reason: 'Bonded while working together on set',
      };
    }
    if (compatibility < -20 && rng.next() < 0.3) {
      return {
        talentAId: talentA.id, talentBId: talentB.id,
        type: 'rival', strength: Math.max(-100, -50 + compatibility),
        reason: 'Creative differences during production led to tension',
      };
    }
  }

  if (haveCompeted(talentA.id, talentB.id, state, awardedProjectsTalentSets) && rng.next() < 0.3) {
    return {
      talentAId: talentA.id, talentBId: talentB.id,
      type: 'rival', strength: -40,
      reason: 'Competitive tension after competing for the same award',
    };
  }

  if (compatibility > 30 && rng.next() < 0.1) {
    return {
      talentAId: talentA.id, talentBId: talentB.id,
      type: 'friend', strength: 40,
      reason: 'Met at industry event and hit it off immediately',
    };
  }

  const ageDiff = talentA.demographics.age - talentB.demographics.age;
  if (ageDiff > 15 && talentA.prestige > 70 && talentB.prestige < 60 && rng.next() < 0.15) {
    return {
      talentAId: talentA.id, talentBId: talentB.id,
      type: 'mentor', strength: 60,
      reason: `${talentA.name} took ${talentB.name} under their wing`,
    };
  }

  if (compatibility > 40 && rng.next() < 0.05) {
    const existingRelationships = state.relationships?.relationships || {};
    const existingRomance = Object.values(existingRelationships).some((r) =>
      (r.talentAId === talentA.id || r.talentBId === talentA.id ||
       r.talentAId === talentB.id || r.talentBId === talentB.id) &&
      r.type === 'romantic' && r.strength > 50
    );

    if (!existingRomance) {
      return {
        talentAId: talentA.id, talentBId: talentB.id,
        type: 'romantic', strength: 70,
        reason: 'Sparks flew at an after-party',
      };
    }
  }

  return null;
}

export function formRelationship(
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
    isPublic: type === 'rival' || type === 'romantic',
    history: [{ week, type: 'formed', impact: strength, description: reason }],
    formedWeek: week,
    lastUpdatedWeek: week,
  };

  if (type === 'romantic') {
    const talentA = state.entities.talents?.[talentAId];
    const talentB = state.entities.talents?.[talentBId];
    const powerCoupleRating = calculatePowerCoupleRating(talentA, talentB);

    const romanceRel = relationship as import('../../types/relationship.types').RomanticRelationship;
    romanceRel.romanceData = {
      isMarried: false,
      isSecret: rng.next() < 0.3,
      stability: 50 + rng.rangeInt(-20, 20),
      powerCoupleRating,
    };

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
