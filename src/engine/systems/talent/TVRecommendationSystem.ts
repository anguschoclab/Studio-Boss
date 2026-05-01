import { GameState, StateImpact, Talent } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import {
  TVShowRecommendation,
  TVRecommendationCriteria,
  TVRecommendationConfig,
  TVRoleType,
  TVGenre,
  TVPlatform,
  DEFAULT_TV_RECOMMENDATION_CONFIG,
  PLATFORM_PRESTIGE,
  ROLE_PRESTIGE_MULTIPLIERS,
  TV_SHOW_TEMPLATES,
} from '../../types/tv-recommendations.types';

/**
 * TV Show Recommendation System
 * Generates intelligent TV role recommendations for talents based on their attributes,
  career trajectory, and market conditions.
 */

/**
 * Calculate match score between talent and TV role
 */
function calculateMatchScore(
  criteria: TVRecommendationCriteria,
  roleType: TVRoleType,
  genre: TVGenre,
  platform: TVPlatform,
  config: TVRecommendationConfig
): number {
  let score = 50; // Base score

  // Tier alignment
  const tierRoleMap: Record<number, TVRoleType[]> = {
    1: ['lead', 'showrunner', 'creator'],
    2: ['lead', 'series_regular', 'showrunner'],
    3: ['series_regular', 'recurring', 'guest_star'],
    4: ['guest_star', 'recurring'],
  };

  const appropriateRoles = tierRoleMap[criteria.currentTier] || ['guest_star'];
  if (appropriateRoles.includes(roleType)) {
    score += 20;
  } else {
    score -= 15;
  }

  // Genre preference alignment
  if (criteria.preferredGenres.some(g => g.toLowerCase().includes(genre))) {
    score += 15;
  }

  // Platform prestige alignment with talent prestige
  const platformPrestige = PLATFORM_PRESTIGE[platform];
  if (Math.abs(platformPrestige - criteria.currentPrestige) < 20) {
    score += 10;
  } else if (platformPrestige > criteria.currentPrestige + 30) {
    score -= 10; // Platform too prestigious
  }

  // Personality fit
  const personalityGenreMap: Record<string, TVGenre[]> = {
    'charismatic': ['comedy', 'romance', 'action'],
    'difficult': ['drama', 'thriller'],
    'perfectionist': ['drama', 'thriller', 'sci-fi'],
    'collaborative': ['comedy', 'drama'],
  };

  if (criteria.personality && personalityGenreMap[criteria.personality]?.includes(genre)) {
    score += 10;
  }

  // Career trajectory alignment
  if (criteria.careerTrajectory === 'rising' && roleType === 'series_regular') {
    score += 15;
  } else if (criteria.careerTrajectory === 'comeback' && roleType === 'guest_star') {
    score += 10;
  } else if (criteria.careerTrajectory === 'plateau' && roleType === 'recurring') {
    score += 10;
  }

  // Skill alignment
  if (roleType === 'showrunner' || roleType === 'creator') {
    score += (criteria.skills.writing * 0.3) + (criteria.skills.directing * 0.2);
  } else if (roleType === 'lead') {
    score += (criteria.skills.acting * 0.4) + (criteria.skills.stardom * 0.3);
  } else {
    score += (criteria.skills.acting * 0.3) + (criteria.skills.stardom * 0.2);
  }

  // Age appropriateness for role
  if (criteria.age < 25 && (roleType === 'lead' || roleType === 'showrunner')) {
    score -= 10;
  } else if (criteria.age > 55 && roleType === 'guest_star') {
    score += 10; // Veteran guest stars
  }

  // Apply genre and platform weights
  score *= (config.genreWeights[genre] || 1.0);
  score *= (config.platformWeights[platform] || 1.0);

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate reasoning for a recommendation
 */
function generateReasoning(
  criteria: TVRecommendationCriteria,
  roleType: TVRoleType,
  genre: TVGenre,
  platform: TVPlatform,
  matchScore: number
): string[] {
  const reasons: string[] = [];

  if (matchScore > 75) {
    reasons.push(`Strong match based on ${criteria.preferredGenres[0] || 'genre'} preference`);
  }

  if (criteria.preferredGenres.some(g => g.toLowerCase().includes(genre))) {
    reasons.push(`Aligns with preferred genre: ${genre}`);
  }

  if (PLATFORM_PRESTIGE[platform] > 60 && criteria.currentPrestige > 60) {
    reasons.push(`High-prestige platform matches talent's current status`);
  }

  if (criteria.personality) {
    reasons.push(`${criteria.personality} personality suits ${genre} content`);
  }

  if (criteria.careerTrajectory === 'rising' && roleType === 'series_regular') {
    reasons.push(`Career trajectory suggests ready for series regular role`);
  }

  if (criteria.skills.acting > 70 && roleType !== 'showrunner' && roleType !== 'creator') {
    reasons.push(`Strong acting skills (${criteria.skills.acting}) support this role`);
  }

  if (criteria.skills.writing > 70 && (roleType === 'showrunner' || roleType === 'creator')) {
    reasons.push(`Strong writing skills (${criteria.skills.writing}) suitable for creative leadership`);
  }

  if (reasons.length === 0) {
    reasons.push(`Based on overall talent profile and market fit`);
  }

  return reasons;
}

/**
 * Generate suggested show titles
 */
function generateShowTitles(
  genre: TVGenre,
  platform: TVPlatform,
  rng: RandomGenerator
): string[] {
  const templates = TV_SHOW_TEMPLATES[genre]?.[platform] || ['Untitled Series'];
  const titles: string[] = [];

  for (let i = 0; i < 3; i++) {
    const template = rng.pick(templates);
    const adjectives = ['The New', 'Lost', 'Dark', 'Secret', 'American', 'Modern', 'Final', 'Eternal'];
    const nouns = ['Chronicles', 'Stories', 'Legacy', 'Mystery', 'Saga', 'Tales', 'Files', 'Diaries'];
    const locations = ['of Hollywood', 'in the City', 'from the Studio', 'Behind the Scenes', 'Uncovered'];

    if (rng.next() < 0.3) {
      titles.push(`${rng.pick(adjectives)} ${template}`);
    } else if (rng.next() < 0.5) {
      titles.push(`${template} ${rng.pick(locations)}`);
    } else {
      titles.push(`${template}: ${rng.pick(nouns)}`);
    }
  }

  return titles;
}

/**
 * Generate a single TV recommendation
 */
function generateRecommendation(
  criteria: TVRecommendationCriteria,
  config: TVRecommendationConfig,
  rng: RandomGenerator
): TVShowRecommendation | null {
  // Determine eligible role types based on tier
  const eligibleRoles: TVRoleType[] = [];
  if (criteria.currentTier === 1) {
    eligibleRoles.push('lead', 'showrunner', 'creator');
  } else if (criteria.currentTier === 2) {
    eligibleRoles.push('lead', 'series_regular', 'showrunner', 'recurring');
  } else if (criteria.currentTier === 3) {
    eligibleRoles.push('series_regular', 'recurring', 'guest_star');
  } else {
    eligibleRoles.push('guest_star', 'recurring');
  }

  const roleType = rng.pick(eligibleRoles);

  // Select genre (weighted by preferences)
  const genres: TVGenre[] = ['drama', 'comedy', 'thriller', 'sci-fi', 'horror', 'action', 'romance', 'reality', 'documentary'];
  let genre = rng.pick(genres);

  // Prefer talent's preferred genres
  if (criteria.preferredGenres.length > 0 && rng.next() < 0.6) {
    const preferredGenre = rng.pick(criteria.preferredGenres);
    const matchedGenre = genres.find(g => preferredGenre.toLowerCase().includes(g));
    if (matchedGenre) genre = matchedGenre;
  }

  // Select platform
  const platforms: TVPlatform[] = ['broadcast', 'cable', 'streaming', 'premium_cable'];
  const platform = rng.pick(platforms);

  // Calculate match score
  const matchScore = calculateMatchScore(criteria, roleType, genre, platform, config);

  if (matchScore < config.minMatchScore) {
    return null;
  }

  // Generate reasoning
  const reasoning = generateReasoning(criteria, roleType, genre, platform, matchScore);

  // Generate show titles
  const suggestedShowTitles = generateShowTitles(genre, platform, rng);

  // Calculate estimated fee and boosts
  const baseFee = criteria.currentTier === 1 ? 500000 : criteria.currentTier === 2 ? 200000 : criteria.currentTier === 3 ? 50000 : 10000;
  const roleMultiplier = ROLE_PRESTIGE_MULTIPLIERS[roleType];
  const platformMultiplier = PLATFORM_PRESTIGE[platform] / 50;
  const estimatedFee = Math.floor(baseFee * roleMultiplier * platformMultiplier);

  const prestigeBoost = Math.floor((PLATFORM_PRESTIGE[platform] * roleMultiplier) / 10);
  const starMeterBoost = Math.floor((platformMultiplier * 10) + (matchScore / 10));

  return {
    id: rng.uuid('TVR'),
    talentId: criteria.talentId,
    roleType,
    genre,
    platform,
    matchScore,
    reasoning,
    suggestedShowTitles,
    estimatedFee,
    prestigeBoost,
    starMeterBoost,
    generatedWeek: criteria.currentTier, // This should be the actual week, will fix in main function
    expiresWeek: criteria.currentTier + config.recommendationLifetimeWeeks,
  };
}

/**
 * Generate TV recommendations for a talent
 */
export function generateTVRecommendationsForTalent(
  talent: Talent,
  state: GameState,
  config: TVRecommendationConfig = DEFAULT_TV_RECOMMENDATION_CONFIG,
  rng: RandomGenerator
): TVShowRecommendation[] {
  const recommendations: TVShowRecommendation[] = [];

  // Build criteria from talent
  const criteria: TVRecommendationCriteria = {
    talentId: talent.id,
    currentTier: talent.tier,
    currentPrestige: talent.prestige || 50,
    starMeter: talent.starMeter || 50,
    preferredGenres: talent.preferredGenres || [],
    personality: talent.personality || '',
    careerTrajectory: talent.careerTrajectory || 'plateau',
    skills: talent.skills || { acting: 50, writing: 50, directing: 50, stardom: 50 },
    recentProjectTypes: [],
    age: talent.demographics?.age || 30,
    gender: talent.demographics?.gender || 'MALE',
  };

  // Generate multiple recommendations
  const attempts = config.maxRecommendationsPerTalent * 3;
  for (let i = 0; i < attempts; i++) {
    if (recommendations.length >= config.maxRecommendationsPerTalent) break;

    const recommendation = generateRecommendation(criteria, config, rng);
    if (recommendation) {
      // Fix the week fields
      recommendation.generatedWeek = state.week;
      recommendation.expiresWeek = state.week + config.recommendationLifetimeWeeks;

      // Check for duplicates
      const isDuplicate = recommendations.some(
        r => r.roleType === recommendation.roleType && r.genre === recommendation.genre
      );

      if (!isDuplicate) {
        recommendations.push(recommendation);
      }
    }
  }

  // Sort by match score
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  return recommendations;
}

/**
 * Main tick function for TV recommendation system
 */
export function tickTVRecommendationSystem(
  state: GameState,
  config: TVRecommendationConfig = DEFAULT_TV_RECOMMENDATION_CONFIG,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];

  // Only generate recommendations every 4 weeks
  if (state.week % 4 !== 0) {
    return impacts;
  }

  const talents = Object.values(state.entities.talents || {});

  for (const talent of talents) {
    // Only generate for active talents (not retired, not on medical leave)
    if (talent.retired || talent.onMedicalLeave) {
      continue;
    }

    // Only generate for mid-tier and higher talents
    if (talent.tier > 3) {
      continue;
    }

    const recommendations = generateTVRecommendationsForTalent(talent, state, config, rng);

    if (recommendations.length > 0) {
      for (const recommendation of recommendations) {
        impacts.push({
          type: 'TV_RECOMMENDATION_CREATED',
          payload: {
            recommendation,
            notification: `TV Opportunity: ${talent.name} recommended for ${recommendation.roleType} role in ${recommendation.genre} series`,
          },
        });
      }
    }
  }

  return impacts;
}

/**
 * Get TV recommendations for a specific talent
 */
export function getTVRecommendationsForTalent(
  talentId: string,
  state: GameState
): import('../../types/tv-recommendations.types').TVShowRecommendation[] {
  const recommendations = state.tvRecommendations?.recommendations || {};
  return Object.values(recommendations)
    .filter((r) => r.talentId === talentId && r.expiresWeek > state.week);
}

/**
 * Accept a TV recommendation (would trigger a project creation or contract)
 */
export function acceptTVRecommendation(
  recommendationId: string,
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];

  const recommendations = state.tvRecommendations?.recommendations || {};
  const recommendation = recommendations[recommendationId];

  if (!recommendation) {
    return impacts;
  }

  // Mark as accepted
  impacts.push({
    type: 'TV_RECOMMENDATION_ACCEPTED',
    payload: {
      recommendationId,
      talentId: recommendation.talentId,
      notification: `${recommendation.talentId} accepted TV role recommendation`,
    },
  });

  // This would typically trigger project creation or contract signing
  // For now, we just mark it as accepted

  return impacts;
}
