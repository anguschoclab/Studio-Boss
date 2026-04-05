import { pick } from '../../utils';
import { Agency, Agent, Talent, GameState, StateImpact, Project, RivalStudio } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { RIVAL_BEHAVIOR_CONFIGS, RivalArchetype } from '../../data/archetypes';
import { SeriesProject } from '@/engine/types/project.types';

/**
 * Pure function to evaluate if an agency offers a "Package Deal".
 */
export function evaluatePackageOffer(
  agency: Agency, 
  leadTalent: Talent, 
  talentPool: Talent[],
  rng: RandomGenerator
): { requiredTalentId?: string; packageDiscount?: number; reason: string } {
  const motivation = agency.currentMotivation || 'VOLUME_RETAIL';
  
  // 🎭 Method Actor Tuning: Auteurs heavily mandate their own creative teams, effectively overriding agency norms.
  const isAuteur = leadTalent.prestige > 85;
  const packageProbability = motivation === 'THE_PACKAGER' ? 0.40 : (isAuteur ? 0.35 : 0.15);

  if (rng.next() < packageProbability) {
    const otherClients = talentPool.filter(t => t.agencyId === agency.id && t.id !== leadTalent.id);
    
    if (otherClients.length > 0) {
      const bundled = pick(otherClients, rng);
      const discount = motivation === 'THE_PACKAGER' ? 0.20 : 0.10;

      return {
        requiredTalentId: bundled.id,
        packageDiscount: discount,
        reason: isAuteur ? `Creative Mandate: ${leadTalent.name} refuses to sign unless their frequent collaborator ${bundled.name} is attached.` : `Agency policy: To secure ${leadTalent.name}, we require you to also hire ${bundled.name}.`
      };
    }
  }

  return { reason: 'No package deal offered.' };
}

/**
 * Agency Weekly Tick (Target C2).
 * Generates rumors and poach attempts as discrete state impacts.
 */
export function tickAgencies(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  state.industry.agencies.forEach(agency => {
    // Aggressive agencies (Sharks) leak rumors
    if (agency.culture === 'shark' || agency.currentMotivation === 'THE_SHARK') {
      if (rng.next() < 0.1) {
        const brands = state.industry.rivals;
        const rival = pick(brands, rng);
        if (rival) {
          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              headline: `${agency.name} is looking to poach top talent from ${rival.name}.`,
              description: `Industry whispers suggest ${agency.name} is making aggressive overtures to talent currently under contract at ${rival.name}.`,
            }
          });
        }
      }
    }
  });

  return impacts;
}

/**
 * Generates a bid amount for a rival NPC studio at a festival market.
 * Returns null if the rival has no interest in the project.
 */
export function generateFestivalBid(
  rival: RivalStudio,
  project: Project,
  rng: RandomGenerator
): number | null {
  const config = RIVAL_BEHAVIOR_CONFIGS[(rival.archetype as RivalArchetype) ?? 'legacy_major'];
  const festivalWeight = config?.festivalParticipation ?? 0.3;

  if (rng.next() > festivalWeight) return null;

  const reviewScore = project.reviewScore ?? 55;
  const buzz = project.buzz ?? 40;
  const interest = (reviewScore * 0.6 + buzz * 0.4) / 100;
  if (interest < 0.4) return null;

  // 🎭 Method Actor Tuning: Rivals with FRANCHISE_BUILDING or AWARD_CHASE motivation will aggressively spend a much larger percentage of their cash on festival acquisitions.
  let maxBidPct = 0.05;
  if (rival.currentMotivation === 'AWARD_CHASE') maxBidPct = 0.10;
  if (rival.currentMotivation === 'FRANCHISE_BUILDING') maxBidPct = 0.15;
  const maxBid = rival.cash * maxBidPct;
  const bid = Math.round(project.budget * interest * rng.range(0.8, 1.4));
  return Math.min(bid, maxBid);
}

/**
 * Assigns a TV time slot to a project based on rival archetype preferences and genre.
 */
export function assignRivalTimeSlot(
  rival: RivalStudio,
  project: Project,
): 'monday_10pm' | 'sunday_9pm' | 'friday_8pm' | 'saturday_8pm' | null {
  if (project.type !== 'SERIES') return null;

  const series = project as SeriesProject;
  const genre = project.genre?.toLowerCase() ?? '';
  const archetype = (rival.archetype as RivalArchetype) ?? 'legacy_major';

  // Prestige dramas go to Sunday 9pm
  if (genre.includes('drama') || series.tvFormat === 'prestige_drama') {
    return 'sunday_9pm';
  }
  // Genre/action to Friday
  if (genre.includes('action') || genre.includes('sci-fi') || genre.includes('horror')) {
    return 'friday_8pm';
  }
  // Streaming giants don't do traditional slots
  if (archetype === 'streaming_giant') return null;
  // Default Monday prestige slot for majors
  return 'monday_10pm';
}

/**
 * Determines if a rival should attempt a hostile takeover of another rival this week.
 */
export function shouldAttemptHostileTakeover(
  attacker: RivalStudio,
  target: RivalStudio,
  state: GameState
): boolean {
  const config = RIVAL_BEHAVIOR_CONFIGS[(attacker.archetype as RivalArchetype) ?? 'legacy_major'];
  if (!config) return false;

  // Must have sufficient cash to make an offer
  const minimumOfferSize = target.cash * 2 + target.strength * 1_000_000;
  if (attacker.cash < minimumOfferSize * 0.8) return false;

  // Antitrust: combined market share must stay under 40%
  const attackerShare = attacker.marketShare ?? 0;
  const targetShare = target.marketShare ?? 0;
  if (attackerShare + targetShare > 0.40) return false;

  // Aggression check
  if (attacker.motivationProfile.aggression < 60) return false;

  return attacker.currentMotivation === 'FRANCHISE_BUILDING' || attacker.currentMotivation === 'MARKET_DISRUPTION';
}
