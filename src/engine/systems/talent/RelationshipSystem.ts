import { GameState, StateImpact, Talent } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import {
  TalentRelationship,
  RelationshipEvent,
  RomanceData
} from '../../types/relationship.types';
import { getRelationshipKey } from './relationshipCompatibility';
import {
  getRelationship,
  haveWorkedTogether,
  haveCompeted,
  checkNaturalFormation,
  formRelationship,
} from './relationshipFormation';

export { haveCompeted } from './relationshipFormation';

function evolveRelationship(
  relationship: TalentRelationship,
  state: GameState,
  rng: RandomGenerator
): { updated: TalentRelationship; impacts: StateImpact[] } {
  const impacts: StateImpact[] = [];
  const talentA = state.entities.talents?.[relationship.talentAId];
  const talentB = state.entities.talents?.[relationship.talentBId];

  if (!talentA || !talentB) {
    return { updated: relationship, impacts };
  }

  let strengthChange = 0;
  let eventType: RelationshipEvent['type'] | null = null;
  let description = '';

  strengthChange += rng.rangeInt(-5, 5);

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

  if (relationship.type === 'rival' && haveCompeted(talentA.id, talentB.id, state)) {
    strengthChange -= 10;
    eventType = 'weakened';
    description = `Competing for the same award reignited their rivalry`;
  }

  if (relationship.type === 'romantic') {
    const romanceData = (relationship as any).romanceData as RomanceData;

    if (romanceData?.isSecret && rng.next() < 0.1) {
      strengthChange -= 3;
      description = 'The pressure of keeping their relationship secret is taking a toll';
    }

    const weeksTogether = state.week - relationship.formedWeek;
    if (weeksTogether > 52 && rng.next() < 0.3) {
      strengthChange += 10;
      eventType = 'strengthened';
      description = `Celebrated ${Math.floor(weeksTogether / 52)} year anniversary`;
    }

    if (relationship.strength < 30 && rng.next() < 0.2) {
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

      if (talentA.spouseId === talentB.id) {
        impacts.push({ type: 'TALENT_UPDATED', payload: { talentId: talentA.id, update: { spouseId: undefined } } });
      }
      if (talentB.spouseId === talentA.id) {
        impacts.push({ type: 'TALENT_UPDATED', payload: { talentId: talentB.id, update: { spouseId: undefined } } });
      }
    }
  }

  const newStrength = Math.max(-100, Math.min(100, relationship.strength + strengthChange));

  if (newStrength !== relationship.strength && eventType) {
    relationship.strength = newStrength;
    relationship.lastUpdatedWeek = state.week;
    relationship.history.push({ week: state.week, type: eventType, impact: strengthChange, description });
  }

  return { updated: relationship, impacts };
}

export function tickRelationshipSystem(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const talents = Object.values(state.entities.talents || {});
  // ⚡ Bolt: Use Object.keys iteration to prevent massive intermediate array allocation
  const projectsDict = state.entities.projects || {};
  const projects = Object.keys(projectsDict).map(pid => projectsDict[pid]);
  const awards = state.industry?.awards || [];
  const awardedProjectIds = new Set(awards.map(a => a.projectId));

  // ⚡ The Framerate Fanatic: Massive O(N²) optimization.
  // Instead of checking all pairs, we check project interactions and a random sample of the rest.
  
  // 1. Pre-index talent clusters by project
  const projectTalentMap = new Map<string, Set<string>>();
  const awardedProjectsTalentSets: Set<string>[] = [];

  for (const project of projects) {
    const attachedIds = (project as any).attachedTalentIds || [];
    if (attachedIds.length < 2) continue;
    
    const set = new Set<string>(attachedIds);
    projectTalentMap.set(project.id, set);
    if (awardedProjectIds.has(project.id)) {
      awardedProjectsTalentSets.push(set);
    }
  }

  // Candidates for relationship formation
  const formationCandidates: [Talent, Talent][] = [];

  // A. Same project candidates (High probability)
  for (const talentSet of projectTalentMap.values()) {
    const ids = Array.from(talentSet);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const tA = state.entities.talents[ids[i]];
        const tB = state.entities.talents[ids[j]];
        if (tA && tB) formationCandidates.push([tA, tB]);
      }
    }
  }

  // B. Random sample for world events (Prevents O(N²) cross-product)
  const RANDOM_SAMPLES = 200;
  for (let i = 0; i < RANDOM_SAMPLES; i++) {
    const idxA = rng.rangeInt(0, talents.length - 1);
    const idxB = rng.rangeInt(0, talents.length - 1);
    if (idxA === idxB) continue;
    formationCandidates.push([talents[idxA], talents[idxB]]);
  }

  // 2. Process Candidates
  for (const [talentA, talentB] of formationCandidates) {
    const formation = checkNaturalFormation(talentA, talentB, state, rng, projectTalentMap, awardedProjectsTalentSets);

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
