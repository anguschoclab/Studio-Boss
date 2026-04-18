import { Talent } from '../../types';

/**
 * Relationship compatibility scoring
 * Pure functions — no state access, no side effects.
 */

export const FRIENDSHIP_THRESHOLD = 60;
export const RIVALRY_THRESHOLD = -60;
export const ROMANCE_THRESHOLD = 70;
export const MENTORSHIP_THRESHOLD = 50;

export const PERSONALITY_COMPATIBILITY: Record<string, Record<string, number>> = {
  'perfectionist': { 'collaborative': -10, 'difficult': -20, 'charismatic': 5, 'pragmatic': 10 },
  'collaborative': { 'difficult': -30, 'charismatic': 15, 'pragmatic': 10, 'artistic': 10 },
  'difficult': { 'charismatic': -15, 'pragmatic': -10, 'artistic': -5 },
  'charismatic': { 'pragmatic': 5, 'artistic': 10, 'commercial': 10 },
  'pragmatic': { 'artistic': -5, 'commercial': 15 },
  'artistic': { 'commercial': -10 },
  'loyal': { 'loyal': 20, 'ambitious': -10 },
  'ambitious': { 'ambitious': -5 },
};

export function getRelationshipKey(talentAId: string, talentBId: string): string {
  return talentAId < talentBId ? `${talentAId}-${talentBId}` : `${talentBId}-${talentAId}`;
}

export function calculateCompatibility(talentA: Talent, talentB: Talent): number {
  let compatibility = 0;

  const ageDiff = Math.abs(talentA.demographics.age - talentB.demographics.age);
  if (ageDiff <= 5) compatibility += 15;
  else if (ageDiff <= 10) compatibility += 5;
  else if (ageDiff > 20) compatibility -= 10;

  if (talentA.demographics.country === talentB.demographics.country) {
    compatibility += 10;
  }

  if (talentA.personality && talentB.personality) {
    const matrix = PERSONALITY_COMPATIBILITY[talentA.personality];
    if (matrix && matrix[talentB.personality]) {
      compatibility += matrix[talentB.personality];
    }
    const reverseMatrix = PERSONALITY_COMPATIBILITY[talentB.personality];
    if (reverseMatrix && reverseMatrix[talentA.personality]) {
      compatibility += reverseMatrix[talentA.personality];
    }
  }

  if (talentA.actorArchetype && talentB.actorArchetype) {
    if (talentA.actorArchetype === talentB.actorArchetype) {
      compatibility += 5;
    } else if (
      (talentA.actorArchetype === 'movie_star' && talentB.actorArchetype === 'prestige_actor') ||
      (talentA.actorArchetype === 'prestige_actor' && talentB.actorArchetype === 'movie_star')
    ) {
      compatibility -= 10;
    }
  }

  if (talentA.tier === talentB.tier) {
    compatibility += 10;
  } else if (Math.abs(talentA.tier - talentB.tier) === 1) {
    compatibility += 5;
  } else {
    compatibility -= 15;
  }

  return compatibility;
}

export function calculatePowerCoupleRating(talentA?: Talent, talentB?: Talent): number {
  if (!talentA || !talentB) return 0;
  const fameA = (talentA.prestige || 50) + (talentA.draw || 50) + (talentA.starMeter || 50);
  const fameB = (talentB.prestige || 50) + (talentB.draw || 50) + (talentB.starMeter || 50);
  return fameA + fameB;
}
