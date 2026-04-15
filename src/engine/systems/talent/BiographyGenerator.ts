import { GameState, StateImpact, Talent } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import { TalentRelationship } from '../../types/relationship.types';
import { BreakoutStar } from '../../types/discovery.types';
import { Clique } from '../../types/clique.types';
import { TVShowRecommendation } from '../../types/tv-recommendations.types';

/**
 * Biography Generator System
 * Auto-generates and updates talent biographies based on life events,
 * relationships, cliques, breakouts, and career trajectory.
 */

interface BioSection {
  header: string;
  content: string;
}

/**
 * Generate TV recommendations section
 */
function generateTVRecommendationsSection(talent: Talent, state: GameState): string | null {
  const tvRecommendations = (state as any).tvRecommendations?.recommendations || {};
  const talentRecommendations = Object.values(tvRecommendations)
    .filter((r: any) => r.talentId === talent.id && r.expiresWeek > state.week && !r.accepted) as TVShowRecommendation[];

  if (talentRecommendations.length === 0) return null;

  // Get the highest-scoring recommendation
  const topRecommendation = talentRecommendations.sort((a, b) => b.matchScore - a.matchScore)[0];

  const parts: string[] = [];

  parts.push(`Considered a strong fit for ${topRecommendation.roleType.replace('_', ' ')} roles in ${topRecommendation.genre} series.`);

  if (topRecommendation.matchScore > 75) {
    parts.push(`Excellent match with ${topRecommendation.platform.replace('_', '-')} platforms.`);
  }

  if (topRecommendation.suggestedShowTitles.length > 0) {
    parts.push(`Potential projects include ${topRecommendation.suggestedShowTitles.slice(0, 2).join(' and ')}.`);
  }

  return parts.join(' ');
}

/**
 * Generate a comprehensive biography for a talent
 */
export function generateBiography(
  talent: Talent,
  state: GameState,
  rng: RandomGenerator
): string {
  const sections: string[] = [];

  // Opening: Basic info
  sections.push(generateOpening(talent));

  // Career Summary
  sections.push(generateCareerSummary(talent, state));

  // Relationships
  const relationshipSection = generateRelationshipsSection(talent, state);
  if (relationshipSection) sections.push(relationshipSection);

  // Personal Life (family, children)
  const personalSection = generatePersonalSection(talent, state);
  if (personalSection) sections.push(personalSection);

  // Recent Events
  const recentSection = generateRecentEventsSection(talent, state);
  if (recentSection) sections.push(recentSection);

  // TV Role Recommendations
  const tvSection = generateTVRecommendationsSection(talent, state);
  if (tvSection) sections.push(tvSection);

  // Personality/Work Style
  sections.push(generatePersonalitySection(talent));

  return sections.join(' ');
}

/**
 * Generate opening paragraph
 */
function generateOpening(talent: Talent): string {
  const age = talent.demographics?.age || 30;
  const ageBracket = age < 30 ? 'rising' : age < 50 ? 'established' : 'veteran';
  const role = talent.role || 'performer';
  const tier = talent.tier === 1 ? 'A-list' : talent.tier === 2 ? 'respected' : talent.tier === 3 ? 'working' : 'up-and-coming';

  const openers = [
    `${talent.name} is a ${ageBracket} ${tier} ${role} in Hollywood, currently ${age} years old.`,
    `At ${age}, ${talent.name} has become one of the industry's ${ageBracket} ${tier} ${role}s.`,
    `${talent.name}, ${age}, is a ${tier} talent known for their work as a ${role}.`,
  ];

  return openers[Math.floor(Math.random() * openers.length)];
}

/**
 * Generate career summary
 */
function generateCareerSummary(talent: Talent, state: GameState): string {
  const parts: string[] = [];

  // Star meter/prestige
  const starMeter = talent.starMeter || 50;
  const prestige = talent.prestige || 50;

  if (starMeter > 80) {
    parts.push(`Currently at the peak of their fame with a Star Meter of ${starMeter}, they are one of the most sought-after talents in the industry.`);
  } else if (starMeter > 60) {
    parts.push(`With a solid Star Meter of ${starMeter}, they maintain steady industry relevance.`);
  } else if (starMeter < 30) {
    parts.push(`Currently experiencing a quieter period in their career with lower visibility.`);
  }

  // Breakout status
  const isBreakout = (talent as any).isBreakout;
  if (isBreakout) {
    const breakouts = Object.values((state as any).relationships?.discovery?.breakoutStars || {})
      .filter((b: any) => b.talentId === talent.id) as BreakoutStar[];

    if (breakouts.length > 0) {
      const breakout = breakouts[0];
      parts.push(`Recently broke out as a major star, jumping ${breakout.starMeterJump} points in Star Meter following their breakout performance.`);
    }
  }

  // Awards
  const awards = (talent as any).awards || [];
  if (awards.length > 0) {
    const majorWins = awards.filter((a: any) => a.status === 'won').length;
    if (majorWins > 0) {
      parts.push(`An acclaimed talent with ${majorWins} major award${majorWins > 1 ? 's' : ''} to their name.`);
    }
  }

  // Career trajectory
  if (talent.careerTrajectory) {
    const trajectoryDescriptions: Record<string, string> = {
      'rising': 'Their career is on a clear upward trajectory.',
      'plateau': 'They have maintained consistent success over the years.',
      'declining': 'Recently facing career challenges but with potential for a comeback.',
      'comeback': 'In the midst of an impressive career resurgence.',
    };
    parts.push(trajectoryDescriptions[talent.careerTrajectory] || '');
  }

  return parts.filter(p => p).join(' ');
}

/**
 * Generate relationships section
 */
function generateRelationshipsSection(talent: Talent, state: GameState): string | null {
  const relationships = Object.values((state as any).relationships?.relationships || {})
    .filter((r: any) => r.talentAId === talent.id || r.talentBId === talent.id) as TalentRelationship[];

  if (relationships.length === 0) return null;

  const parts: string[] = [];

  // Romantic relationships
  const romances = relationships.filter(r => r.type === 'romantic');
  if (romances.length > 0) {
    const currentRomance = romances.find(r => r.strength > 50); // Strong relationship
    if (currentRomance) {
      const partnerId = currentRomance.talentAId === talent.id ? currentRomance.talentBId : currentRomance.talentAId;
      const partner = state.entities.talents?.[partnerId];
      if (partner) {
        parts.push(`Currently in a high-profile relationship with ${partner.name}.`);
      }
    }
  }

  // Famous friends
  const friends = relationships.filter(r => r.type === 'friend' && r.strength > 30);
  if (friends.length > 0) {
    const friendNames = friends
      .slice(0, 2)
      .map(r => {
        const friendId = r.talentAId === talent.id ? r.talentBId : r.talentAId;
        return state.entities.talents?.[friendId]?.name;
      })
      .filter(Boolean);

    if (friendNames.length > 0) {
      parts.push(`Known to be close friends with ${friendNames.join(' and ')}.`);
    }
  }

  // Rivals
  const rivals = relationships.filter(r => r.type === 'rival');
  if (rivals.length > 0) {
    const rivalNames = rivals
      .slice(0, 2)
      .map(r => {
        const rivalId = r.talentAId === talent.id ? r.talentBId : r.talentAId;
        return state.entities.talents?.[rivalId]?.name;
      })
      .filter(Boolean);

    if (rivalNames.length > 0) {
      parts.push(`Has a well-documented rivalry with ${rivalNames.join(' and ')}.`);
    }
  }

  // Clique membership
  const memberCliqueMap = (state as any).relationships?.cliques?.memberCliqueMap || {};
  const cliqueIds = memberCliqueMap[talent.id] || [];
  if (cliqueIds.length > 0) {
    const cliques = (state as any).relationships?.cliques?.cliques || {};
    const cliqueNames = cliqueIds
      .map((id: string) => (cliques[id] as Clique)?.name)
      .filter(Boolean);

    if (cliqueNames.length > 0) {
      parts.push(`Member of the exclusive Hollywood group "${cliqueNames[0]}"."`);
    }
  }

  return parts.length > 0 ? parts.join(' ') : null;
}

/**
 * Generate personal life section
 */
function generatePersonalSection(talent: Talent, state: GameState): string | null {
  const parts: string[] = [];

  // Nepo baby
  if (talent.isNepoBaby && talent.parentIds && talent.parentIds.length > 0) {
    const parent = state.entities.talents?.[talent.parentIds[0]];
    if (parent) {
      parts.push(`The ${talent.demographics?.gender === 'FEMALE' ? 'daughter' : 'son'} of acclaimed ${parent.role} ${parent.name}, they entered the industry with significant family connections.`);
    }
  }

  // Spouse
  if (talent.spouseId) {
    const spouse = state.entities.talents?.[talent.spouseId];
    if (spouse) {
      parts.push(`Married to fellow industry professional ${spouse.name}.`);
    }
  }

  // Children
  if (talent.childIds && talent.childIds.length > 0) {
    const childCount = talent.childIds.length;
    parts.push(`Parent to ${childCount} ${childCount === 1 ? 'child' : 'children'} in the industry.`);
  }

  return parts.length > 0 ? parts.join(' ') : null;
}

/**
 * Generate recent events section
 */
function generateRecentEventsSection(talent: Talent, state: GameState): string | null {
  const parts: string[] = [];

  // Breakout star status
  const isBreakout = (talent as any).isBreakout;
  if (isBreakout) {
    const breakouts = Object.values((state as any).relationships?.discovery?.breakoutStars || {})
      .filter((b: any) => b.talentId === talent.id && (b as BreakoutStar).hypeWeeksRemaining > 0) as BreakoutStar[];

    if (breakouts.length > 0) {
      parts.push(`Currently experiencing breakout star status with intense media attention.`);
    }
  }

  // Recent scandal
  const scandals = Object.values(state.industry?.scandals || {})
    .filter((s: any) => s.talentId === talent.id && (s as any).weeksRemaining > 0);

  if (scandals.length > 0) {
    parts.push(`Recently navigated through personal challenges that captured public attention.`);
  }

  // Medical leave
  if ((talent as any).onMedicalLeave) {
    parts.push(`Currently taking time away from the spotlight for personal health.`);
  }

  return parts.length > 0 ? parts.join(' ') : null;
}

/**
 * Generate personality section
 */
function generatePersonalitySection(talent: Talent): string {
  const personality = talent.personality;
  if (!personality) return '';

  const descriptions: Record<string, string> = {
    'charismatic': 'Known for their magnetic screen presence and ability to light up any set.',
    'difficult': 'Their intense dedication to craft sometimes creates on-set tension, but yields powerful results.',
    'perfectionist': 'A meticulous artist who demands excellence from themselves and their collaborators.',
    'collaborative': 'Prized for their team-first attitude and ability to elevate everyone around them.',
  };

  return descriptions[personality] || '';
}

/**
 * Main biography tick - updates bios weekly
 */
export function tickBiographyGenerator(
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const talents = Object.values(state.entities.talents || {});

  for (const talent of talents) {
    // Only update bio if significant events occurred or bio is empty/default
    const currentBio = talent.bio || '';
    const isDefaultBio = currentBio.includes('Tier') && currentBio.includes('is a');

    // Check for triggers that warrant bio update
    const shouldUpdate = isDefaultBio || shouldUpdateBio(talent, state);

    if (shouldUpdate) {
      const newBio = generateBiography(talent, state, rng);

      if (newBio !== currentBio) {
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: {
            talentId: talent.id,
            update: {
              bio: newBio,
            },
          },
        });
      }
    }
  }

  return impacts;
}

/**
 * Determine if bio should be updated based on recent events
 */
function shouldUpdateBio(talent: Talent, state: GameState): boolean {
  // Update if breakout just happened
  if ((talent as any).isBreakout) return true;

  // Update if relationship status changed recently
  const relationships = Object.values((state as any).relationships?.relationships || {})
    .filter((r: any) => (r.talentAId === talent.id || r.talentBId === talent.id) && r.formedWeek > state.week - 4);
  if (relationships.length > 0) return true;

  // Update if clique membership changed
  const memberCliqueMap = (state as any).relationships?.cliques?.memberCliqueMap || {};
  const recentCliqueActivity = Object.values((state as any).relationships?.cliques?.cliques || {})
    .some((c: any) => c.memberIds?.includes(talent.id) && c.formedWeek > state.week - 4);
  if (recentCliqueActivity) return true;

  // Update if major award won recently
  // Update if scandal active
  const activeScandal = Object.values(state.industry?.scandals || {})
    .some((s: any) => s.talentId === talent.id && (s as any).weeksRemaining > 0);
  if (activeScandal) return true;

  return false;
}

/**
 * Generate a brief bio update for a specific event
 */
export function generateEventBioUpdate(
  talent: Talent,
  eventType: 'breakout' | 'relationship' | 'clique' | 'award' | 'scandal',
  eventData: any,
  state: GameState
): string {
  const currentBio = talent.bio || '';

  switch (eventType) {
    case 'breakout':
      return `${currentBio} Recently skyrocketed to fame as Hollywood's newest breakout sensation.`;

    case 'relationship':
      if (eventData.type === 'romantic' && eventData.status === 'active') {
        return `${currentBio} Currently in a high-profile relationship with ${eventData.partnerName}.`;
      }
      return currentBio;

    case 'clique':
      return `${currentBio} Member of the exclusive Hollywood group "${eventData.cliqueName}".`;

    case 'award':
      return `${currentBio} Award-winning talent with recent recognition for excellence.`;

    case 'scandal':
      return `${currentBio} Recently navigated through public challenges with resilience.`;

    default:
      return currentBio;
  }
}
