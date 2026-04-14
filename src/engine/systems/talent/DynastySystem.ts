import { GameState, StateImpact, Talent, TalentTier, Family, DeathEvent } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import { generateTalent } from '../../generators/talent/index';

/**
 * Dynasty System
 * Handles parent-child relationships, nepo baby generation, and talent inheritance.
 * Children enter the talent pool at age 18 with traits inherited from parents.
 */

export interface Pregnancy {
  id: string;
  motherId: string;
  fatherId: string;
  conceptionWeek: number;
  birthWeek: number; // 40 weeks later
  isPublic: boolean;
}

export interface FamilyRelationship {
  parentId: string;
  childId: string;
  relationshipType: 'biological' | 'adopted' | 'step';
  acknowledged: boolean;
  influenceLevel: number; // 0-100
}

export interface Dynasty {
  id: string;
  founderId: string;
  members: string[];
  reputation: number; // Dynasty prestige
  scandals: number;
  foundedWeek: number;
}

// Pregnancy probability from romantic relationships
const PREGNANCY_BASE_CHANCE = 0.01; // 1% per week for public stable couples
const NEPO_BABY_AGE_ENTRY = 18; // Age when children enter talent pool

/**
 * Check for pregnancies from romantic couples
 */
export function checkPregnancies(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const newPregnancies: Pregnancy[] = [];

  // Get all public romantic pairs (would come from RelationshipSystem in full implementation)
  // For now, check married/coupled talent with spouseId
  const talents = Object.values(state.entities.talents || {});

  for (const talent of talents) {
    if (!talent.spouseId) continue; // Not in a relationship

    const spouse = state.entities.talents?.[talent.spouseId];
    if (!spouse) continue;

    // Only check once per couple (talent with lower ID)
    if (talent.id > spouse.id) continue;

    // Age check - both parents should be of appropriate age
    const mother = talent.demographics.gender === 'FEMALE' ? talent : spouse;
    const father = talent.demographics.gender === 'FEMALE' ? spouse : talent;

    if (mother.demographics.age < 18 || mother.demographics.age > 45) continue;
    if (father.demographics.age < 18 || father.demographics.age > 70) continue;

    // Check if already pregnant
    // In full implementation, check state.dynasty?.pregnancies
    // For now, skip if either already has children in pool (simplification)

    // Pregnancy check
    if (rng.next() < PREGNANCY_BASE_CHANCE) {
      const pregnancy: Pregnancy = {
        id: rng.uuid('PRG'),
        motherId: mother.id,
        fatherId: father.id,
        conceptionWeek: state.week,
        birthWeek: state.week + 40,
        isPublic: true, // Public couple = public pregnancy
      };

      newPregnancies.push(pregnancy);

      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          headline: `${mother.name} and ${father.name} Expecting!`,
          description: `The Hollywood power couple announced they are expecting their ${getChildOrdinal(mother.id, state)} child together.`,
          category: 'talent',
          publication: 'People Magazine',
        },
      });
    }
  }

  // Store pregnancies in state (would be in dynasty state slice)
  if (newPregnancies.length > 0) {
    impacts.push({
      type: 'SYSTEM_TICK',
      payload: {
        newPregnancies,
      },
    } as any);
  }

  return impacts;
}

/**
 * Process births from pregnancies reaching term
 */
export function processBirths(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  // Get active pregnancies from state
  // In full implementation: state.dynasty?.pregnancies || []
  // For now, we'll simulate occasional births

  return impacts;
}

/**
 * Calculate which children should enter talent pool (coming of age at 18)
 */
export function processComingOfAge(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const newTalents: Talent[] = [];

  // In full implementation, this would track children born 18 years ago
  // For now, occasionally generate nepo babies when:
  // 1. A tier 1 talent exists without children
  // 2. The talent is older (40+)
  // 3. Random chance

  const talents = Object.values(state.entities.talents || {});
  const existingNepoIds = new Set(
    talents.filter(t => t.isNepoBaby).map(t => t.parentIds || []).flat()
  );

  for (const parent of talents) {
    if (parent.demographics.age < 40) continue;
    if (parent.tier > 2) continue; // Only A-listers and B-listers have nepo babies

    // Skip if already has children in pool
    if (parent.childIds && parent.childIds.length > 0) continue;

    // Chance to have adult child enter pool
    if (rng.next() < 0.1) { // 10% chance per eligible parent per year
      const childTalent = generateNepoBaby(parent, state, rng);
      newTalents.push(childTalent);

      // Update parent with child reference
      impacts.push({
        type: 'TALENT_UPDATED',
        payload: {
          talentId: parent.id,
          update: {
            childIds: [...(parent.childIds || []), childTalent.id],
          },
        },
      });

      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          headline: `${childTalent.name}: The Next Generation`,
          description: `${parent.name}'s ${childTalent.demographics.gender === 'FEMALE' ? 'daughter' : 'son'} enters the industry, sparking nepotism debates and excitement alike.`,
          category: 'talent',
          publication: 'Variety',
        },
      });
    }
  }

  if (newTalents.length > 0) {
    impacts.push({
      type: 'TALENT_ADDED',
      payload: { newTalents },
    } as any);
  }

  return impacts;
}

/**
 * Generate a nepo baby talent with inherited traits
 */
function generateNepoBaby(parent: Talent, state: GameState, rng: RandomGenerator): Talent {
  // Determine child's role (often same as parent, but can differ)
  const roleRoll = rng.next();
  let childRole = parent.role as any;

  // 30% chance to choose different role
  if (roleRoll < 0.3) {
    const roles = ['actor', 'director', 'writer', 'producer'] as const;
    childRole = rng.pick(roles.filter(r => r !== parent.role));
  }

  // Generate base talent
  const childTalent = generateTalent(rng, {
    role: childRole,
    tier: 4, // Start as new talent
  });

  // Override with nepo baby characteristics
  const lastName = parent.name.split(' ').pop() || 'Legacy';
  const firstNames = childTalent.demographics.gender === 'FEMALE'
    ? ['Emma', 'Olivia', 'Sophia', 'Ava', 'Mia', 'Charlotte', 'Amelia', 'Harper']
    : ['Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas'];

  childTalent.name = `${rng.pick(firstNames)} ${lastName}`;

  // Age: Enter at 18-22
  childTalent.demographics.age = rng.rangeInt(18, 22);

  // Mark as nepo baby
  childTalent.isNepoBaby = true;
  childTalent.parentIds = [parent.id];
  childTalent.familyId = parent.familyId; // Same family

  // Inherit traits from parent
  // Skills: Blend parent skills with child's random skills, weighted toward parent
  if (parent.skills) {
    const inheritFactor = 0.4; // 40% inheritance
    childTalent.skills = {
      acting: Math.round(childTalent.skills.acting * (1 - inheritFactor) + (parent.skills.acting || 50) * inheritFactor),
      directing: Math.round(childTalent.skills.directing * (1 - inheritFactor) + (parent.skills.directing || 50) * inheritFactor),
      writing: Math.round(childTalent.skills.writing * (1 - inheritFactor) + (parent.skills.writing || 50) * inheritFactor),
      stardom: Math.round(childTalent.skills.stardom * (1 - inheritFactor) + (parent.skills.stardom || 50) * inheritFactor),
    };
  }

  // Nepo baby bonuses
  const parentPrestige = parent.prestige || 50;
  const nepoBonus = parent.tier === 1 ? 25 : parent.tier === 2 ? 15 : 10;

  childTalent.prestige = Math.min(100, childTalent.prestige + nepoBonus);
  childTalent.draw = Math.min(100, childTalent.draw + nepoBonus);
  childTalent.fee = childTalent.fee + (parent.tier === 1 ? 1_000_000 : 500_000);

  // Archetype inheritance tendency
  if (parent.actorArchetype && childRole === 'actor') {
    // 60% chance to inherit parent's archetype
    if (rng.next() < 0.6) {
      childTalent.actorArchetype = parent.actorArchetype;
    }
  }

  // Personality can be inherited too
  if (parent.personality && rng.next() < 0.5) {
    childTalent.personality = parent.personality;
  }

  // Bio mentions parent
  childTalent.bio = `${childTalent.name} is the ${childTalent.demographics.gender === 'FEMALE' ? 'daughter' : 'son'} of acclaimed ${parent.role} ${parent.name}. With a famous last name and undeniable talent, they're poised to make their own mark in Hollywood.`;

  // Access level - nepo babies get better access
  if (parent.accessLevel === 'dynasty' || parent.accessLevel === 'legacy') {
    childTalent.accessLevel = 'soft-access';
  }

  return childTalent;
}

/**
 * Calculate dynasty reputation based on family members
 */
export function calculateDynastyReputation(familyId: string, state: GameState): number {
  const familyMembers = Object.values(state.entities.talents || {})
    .filter(t => t.familyId === familyId);

  if (familyMembers.length === 0) return 50;

  const avgPrestige = familyMembers.reduce((sum, t) => sum + (t.prestige || 50), 0) / familyMembers.length;
  const tier1Count = familyMembers.filter(t => t.tier === 1).length;
  const tierBonus = tier1Count * 10;

  return Math.min(100, avgPrestige + tierBonus);
}

/**
 * Handle talent death effects on family
 */
export function processDeathInFamily(
  deathEvent: DeathEvent,
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const deceased = state.entities.talents?.[deathEvent.talentId];

  if (!deceased || !deceased.familyId) return impacts;

  // Update family reputation (may decrease if scandalous death)
  const familyReputation = calculateDynastyReputation(deceased.familyId, state);

  // Affect children - may gain sympathy prestige
  if (deceased.childIds) {
    for (const childId of deceased.childIds) {
      const child = state.entities.talents?.[childId];
      if (!child) continue;

      // Child gains some prestige from parent's legacy
      const legacyBoost = deceased.tier === 1 ? 5 : deceased.tier === 2 ? 3 : 1;

      impacts.push({
        type: 'TALENT_UPDATED',
        payload: {
          talentId: childId,
          update: {
            prestige: Math.min(100, child.prestige + legacyBoost),
            bio: `${child.name} continues the legacy of their late ${deceased.demographics.gender === 'FEMALE' ? 'mother' : 'father'}, ${deceased.name}.`,
          },
        },
      });
    }
  }

  return impacts;
}

/**
 * Main dynasty system tick
 */
export function tickDynastySystem(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  // Check for new pregnancies
  impacts.push(...checkPregnancies(state, rng));

  // Process births
  impacts.push(...processBirths(state, rng));

  // Process children coming of age
  impacts.push(...processComingOfAge(state, rng));

  return impacts;
}

/**
 * Helper: Get ordinal for child number
 */
function getChildOrdinal(parentId: string, state: GameState): string {
  const parent = state.entities.talents?.[parentId];
  const childCount = parent?.childIds?.length || 0;

  const ordinals = ['first', 'second', 'third', 'fourth', 'fifth'];
  return ordinals[childCount] || `${childCount + 1}th`;
}

/**
 * Create a new family/dynasty
 */
export function createFamily(
  founderId: string,
  familyName: string,
  state: GameState,
  rng: RandomGenerator
): Family {
  return {
    id: rng.uuid('FAM'),
    name: familyName,
    recognition: 50,
    prestigeLegacy: 50,
    commercialLegacy: 50,
    scandalLegacy: 0,
    volatility: rng.rangeInt(20, 80),
    status: 'active',
  };
}
