import { GameState, StateImpact, Talent } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import {
  Clique,
  CliqueReputation,
  CLIQUE_NAME_PATTERNS,
} from '../../types/clique.types';
import {
  areFriends,
} from './RelationshipSystem';

/**
 * Clique System
 * Manages talent cliques (Rat Pack style groups) that form, gain fame together, and sometimes break up.
 * Cliques provide fame bonuses but may have drama and conflicts.
 */

// Minimum members to form a clique
const MIN_CLIQUE_SIZE = 3;
const MAX_CLIQUE_SIZE = 8;

// Friendship strength threshold for clique formation
const CLIQUE_FRIENDSHIP_THRESHOLD = 60;

// Fame bonus per member (capped)
const FAME_BONUS_PER_MEMBER = 8; // 8% per member, max 48% for 6 members

/**
 * Generate a clique name based on era, location, or personality
 */
function generateCliqueName(members: Talent[], week: number, rng: RandomGenerator): string {
  const decade = Math.floor((week / 52 + 2020) / 10) * 10;
  const locations = ['Hollywood', 'Beverly Hills', 'Malibu', 'New York', 'London'];
  const location = rng.pick(locations);

  const patterns = [
    ...CLIQUE_NAME_PATTERNS.eraBased.map(p => p.replace('{decade}', String(decade))),
    ...CLIQUE_NAME_PATTERNS.locationBased.map(p => p.replace('{location}', location)),
    ...CLIQUE_NAME_PATTERNS.personalityBased,
  ];

  return rng.pick(patterns);
}

/**
 * Calculate clique reputation based on member personalities and scandals
 */
function calculateCliqueReputation(members: Talent[], rng: RandomGenerator): CliqueReputation {
  const scandalRisks = members.map(m => m.psychology?.scandalRisk || 50);
  const avgScandalRisk = scandalRisks.reduce((a, b) => a + b, 0) / scandalRisks.length;

  const difficultCount = members.filter(m => m.personality === 'difficult').length;
  const prestigiousCount = members.filter(m => m.prestige > 80).length;

  // Determine reputation
  if (avgScandalRisk > 70 || difficultCount >= 2) {
    return rng.next() < 0.5 ? 'scandalous' : 'toxic';
  }
  if (prestigiousCount >= members.length / 2) {
    return 'prestigious';
  }
  if (members.every(m => m.accessLevel === 'dynasty' || m.accessLevel === 'legacy')) {
    return 'elitist';
  }

  return 'cool';
}

/**
 * Calculate combined star power of clique
 */
function calculateCombinedStarPower(members: Talent[]): number {
  return members.reduce((sum, m) => sum + (m.starMeter || 50), 0);
}

/**
 * Calculate clique exclusivity (how hard to join)
 */
function calculateExclusivity(members: Talent[]): number {
  // Based on member tier and dynasty status
  let exclusivity = 50;

  const dynastyMembers = members.filter(m => m.accessLevel === 'dynasty').length;
  const tier1Count = members.filter(m => m.tier === 'A_LIST').length;

  exclusivity += dynastyMembers * 10;
  exclusivity += tier1Count * 15;

  return Math.min(100, exclusivity);
}

/**
 * Find potential cliques (groups of mutually friendly talents)
 */
function findPotentialCliques(state: GameState, _rng: RandomGenerator): string[][] {
  const potentialCliques: string[][] = [];
  const talentsObj = state.entities.talents || {};

  // Pre-compute friends adjacency map: talentId → friendId[]
  const friendsMap = new Map<string, Set<string>>();
  for (const tId in talentsObj) {
    if (!Object.prototype.hasOwnProperty.call(talentsObj, tId)) continue;
    const talent = talentsObj[tId];
    if (!talent) continue;
    const relationshipsObj = (state.relationships as unknown as { relationships?: Record<string, { talentAId: string; talentBId: string; type: string; strength: number }> })?.relationships || {};
    const friends = new Set<string>();
    for (const rId in relationshipsObj) {
      if (!Object.prototype.hasOwnProperty.call(relationshipsObj, rId)) continue;
      const r = relationshipsObj[rId];
      if (r.type !== 'friend' || r.strength < CLIQUE_FRIENDSHIP_THRESHOLD) continue;
      if (r.talentAId === tId) friends.add(r.talentBId);
      else if (r.talentBId === tId) friends.add(r.talentAId);
    }
    if (friends.size > 0) friendsMap.set(tId, friends);
  }

  // Check each talent as a potential clique center
  for (const tId in talentsObj) {
    if (!Object.prototype.hasOwnProperty.call(talentsObj, tId)) continue;
    const center = talentsObj[tId];
    if (!center) continue;

    const centerFriends = friendsMap.get(tId);
    if (!centerFriends || centerFriends.size < MIN_CLIQUE_SIZE - 1) continue;

    const friendIds = Array.from(centerFriends);

    // Check which friends are also friends with each other
    const mutuallyFriendly: string[] = [center.id];

    for (const friendId of friendIds) {
      let mutualFriendCount = 0;
      const friendFriends = friendsMap.get(friendId);

      for (const otherFriendId of friendIds) {
        if (friendId === otherFriendId) continue;
        // Check friendship via adjacency map or areFriends fallback
        if (friendFriends?.has(otherFriendId) || areFriends(friendId, otherFriendId, state)) {
          mutualFriendCount++;
        }
      }

      // If this friend is friends with at least half the others, include them
      if (mutualFriendCount >= Math.floor(friendIds.length / 2)) {
        mutuallyFriendly.push(friendId);
      }
    }

    // Check if we have enough for a clique
    if (mutuallyFriendly.length >= MIN_CLIQUE_SIZE) {
      // Sort to ensure consistent keys
      const sortedIds = mutuallyFriendly.slice(0, MAX_CLIQUE_SIZE).sort();

      // Check if this exact clique already exists
      const cliquesRecord = (state.relationships as unknown as { cliques?: { cliques?: Record<string, Clique> } })?.cliques?.cliques || {};
      let alreadyExists = false;
      for (const cliqueId in cliquesRecord) {
        if (!Object.prototype.hasOwnProperty.call(cliquesRecord, cliqueId)) continue;
        const c = cliquesRecord[cliqueId];
        if (c.members.length === sortedIds.length && c.members.every(id => sortedIds.includes(id))) {
          alreadyExists = true;
          break;
        }
      }

      if (!alreadyExists) {
        potentialCliques.push(sortedIds);
      }
    }
  }

  return potentialCliques;
}

/**
 * Form a new clique
 */
function formClique(
  memberIds: string[],
  week: number,
  state: GameState,
  rng: RandomGenerator
): { clique: Clique; impacts: StateImpact[] } {
  const impacts: StateImpact[] = [];

  const members = memberIds
    .map(id => state.entities.talents?.[id])
    .filter((m): m is Talent => !!m);

  const name = generateCliqueName(members, week, rng);
  const reputation = calculateCliqueReputation(members, rng);
  const fameBonus = Math.min(50, members.length * FAME_BONUS_PER_MEMBER);
  const combinedStarPower = calculateCombinedStarPower(members);
  const exclusivity = calculateExclusivity(members);

  const clique: Clique = {
    id: rng.uuid('CLQ'),
    name,
    members: memberIds,
    formedWeek: week,
    status: 'active',
    fameBonus,
    reputation,
    exclusivity,
    combinedStarPower,
    reunionPotential: 50,
    internalConflicts: [],
  };

  // News about new clique formation
  const memberNames = members.map(m => m.name).join(', ');
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      id: rng.uuid('NWS'),
      headline: `Hollywood's New Power Clique: "${name}"`,
      description: `${memberNames} have formed an exclusive ${reputation} clique that everyone wants to join. Industry insiders say this group is reshaping Hollywood's social hierarchy.`,
      category: 'talent',
      publication: 'The Hollywood Reporter',
    },
  });

  return { clique, impacts };
}

/**
 * Evolve an existing clique
 */
function evolveClique(
  clique: Clique,
  state: GameState,
  rng: RandomGenerator
): { updated: Clique; impacts: StateImpact[] } {
  const impacts: StateImpact[] = [];
  const updated = { ...clique };

  // Get current members (filter out deceased)
  const livingMembers = clique.members
    .map(id => state.entities.talents?.[id])
    .filter((m): m is Talent => !!m);

  // Check if clique should disband
  if (livingMembers.length < MIN_CLIQUE_SIZE) {
    updated.status = 'disbanded';
    updated.disbandedWeek = state.week;

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        headline: `"${clique.name}" Disbands`,
        description: `After losing key members, the famous clique has officially disbanded. Fans are mourning the end of an era.`,
        category: 'talent',
        publication: 'Variety',
      },
    });

    return { updated, impacts };
  }

  // Update combined star power
  updated.combinedStarPower = calculateCombinedStarPower(livingMembers);

  // Internal conflicts (5% chance per week for active cliques)
  if (clique.status === 'active' && rng.next() < 0.05) {
    // Find two members who might have tension
    const potentialConflicts: [string, string][] = [];

    for (let i = 0; i < livingMembers.length; i++) {
      for (let j = i + 1; j < livingMembers.length; j++) {
        // Check if they're NOT friends (neutral or rivals)
        if (!areFriends(livingMembers[i].id, livingMembers[j].id, state)) {
          potentialConflicts.push([livingMembers[i].id, livingMembers[j].id]);
        }
      }
    }

    if (potentialConflicts.length > 0 && rng.next() < 0.3) {
      const [memberA, memberB] = rng.pick(potentialConflicts);
      const conflictKey = memberA < memberB ? `${memberA}-${memberB}` : `${memberB}-${memberA}`;

      if (!updated.internalConflicts.includes(conflictKey)) {
        updated.internalConflicts.push(conflictKey);

        const talentA = livingMembers.find(m => m.id === memberA);
        const talentB = livingMembers.find(m => m.id === memberB);

        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('NWS'),
            headline: `Tension in "${clique.name}"`,
            description: `Sources report friction between ${talentA?.name} and ${talentB?.name} within the exclusive clique.`,
            category: 'talent',
            publication: 'Page Six',
          },
        });
      }
    }
  }

  // Check for disbandment due to too many conflicts
  if (updated.internalConflicts.length >= 2 && rng.next() < 0.1) {
    updated.status = 'disbanded';
    updated.disbandedWeek = state.week;

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        headline: `"${clique.name}" Implodes Amid Drama`,
        description: `Internal conflicts have torn the clique apart. Members are going their separate ways.`,
        category: 'talent',
        publication: 'The Hollywood Reporter',
      },
    });
  }

  // Check for reunion (disbanded cliques with high reunionPotential)
  if (clique.status === 'disbanded' && rng.next() < (clique.reunionPotential / 5200)) {
    // 5200 weeks = 100 years, so very rare
    updated.status = 'active';
    updated.reunionPotential = Math.max(0, updated.reunionPotential - 20);

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        headline: `"${clique.name}" Reunites!`,
        description: `In a stunning move, the legendary clique has reunited. Nostalgia and mutual respect brought them back together.`,
        category: 'talent',
        publication: 'Variety',
      },
    });
  }

  // Reputation can shift
  if (rng.next() < 0.02) {
    const oldReputation = updated.reputation;
    updated.reputation = calculateCliqueReputation(livingMembers, rng);

    if (updated.reputation !== oldReputation) {
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          headline: `"${clique.name}" Rebrands as ${updated.reputation}`,
          description: `The clique's public image has shifted from ${oldReputation} to ${updated.reputation}.`,
          category: 'talent',
          publication: 'The Hollywood Reporter',
        },
      });
    }
  }

  return { updated, impacts };
}

/**
 * Main clique system tick
 */
export function tickCliqueSystem(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  // 1. Check for new clique formations
  const potentialCliques = findPotentialCliques(state, rng);

  for (const memberIds of potentialCliques) {
    // 20% chance to form per week when criteria met
    if (rng.next() < 0.2) {
      const { clique, impacts: formationImpacts } = formClique(memberIds, state.week, state, rng);

      impacts.push(...formationImpacts);

      // Store in state
      impacts.push({
        type: 'CLIQUE_FORMED',
        payload: {
          cliqueId: clique.id,
          clique,
        },
      } as any);

      // Update member clique map for each member
      for (const memberId of memberIds) {
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: {
            talentId: memberId,
            update: {
              // Store clique membership in talent (if we add a field for it)
              // For now, just use the clique state
            },
          },
        });
      }
    }
  }

  // 2. Evolve existing cliques
  const cliquesRecord = (state.relationships as unknown as { cliques?: { cliques?: Record<string, Clique> } })?.cliques?.cliques || {};

  for (const cliqueId in cliquesRecord) {
    if (!Object.prototype.hasOwnProperty.call(cliquesRecord, cliqueId)) continue;
    const clique = cliquesRecord[cliqueId];
    if (rng.next() < 0.3) { // 30% chance to evolve each clique per week
      const { updated, impacts: evolutionImpacts } = evolveClique(clique, state, rng);

      if (updated !== clique) {
        impacts.push({
          type: 'CLIQUE_UPDATED',
          payload: {
            cliqueId: clique.id,
            clique: updated,
          },
        } as any);
      }

      impacts.push(...evolutionImpacts);
    }
  }

  return impacts;
}

/**
 * Get fame bonus for a talent based on clique membership
 */
export function getCliqueFameBonus(talentId: string, state: GameState): number {
  const cliquesRecord = (state.relationships as unknown as { cliques?: { cliques?: Record<string, Clique> } })?.cliques?.cliques || {};

  let maxBonus = 0;
  for (const cliqueId in cliquesRecord) {
    if (!Object.prototype.hasOwnProperty.call(cliquesRecord, cliqueId)) continue;
    const c = cliquesRecord[cliqueId];
    if (c.status === 'active' && c.members.includes(talentId)) {
      if (c.fameBonus > maxBonus) {
        maxBonus = c.fameBonus;
      }
    }
  }

  return maxBonus;
}

/**
 * Check if casting entire clique would provide bonus
 */
export function getCliqueCastingBonus(cliqueId: string, castTalentIds: string[], state: GameState): number {
  const clique = (state as any).relationships?.cliques?.cliques?.[cliqueId] as Clique | undefined;
  if (!clique || clique.status !== 'active') return 0;

  const membersInCast = clique.members.filter(id => castTalentIds.includes(id)).length;
  const memberPercentage = membersInCast / clique.members.length;

  // If at least 60% of clique is cast, provide full bonus
  if (memberPercentage >= 0.6) {
    return clique.fameBonus;
  }

  // Partial bonus for partial casting
  return Math.floor(clique.fameBonus * memberPercentage);
}
