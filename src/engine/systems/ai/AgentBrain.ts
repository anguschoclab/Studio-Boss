import { pick } from '../../utils';
import { Agency, Talent, GameState, StateImpact, Project, RivalStudio } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { AI_ARCHETYPES } from '../../data/aiArchetypes';
import { SeriesProject } from '@/engine/types/project.types';
import { assignTimeSlot, TimeSlot } from '../television/nielsenSystem';

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
        const brands = state.entities.rivals;
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
 * Phase 2: Uses behavioral AI_ARCHETYPES.
 */
export function generateFestivalBid(
  rival: RivalStudio,
  project: Project,
  rng: RandomGenerator
): number | null {
  const archetype = AI_ARCHETYPES.find(a => a.id === rival.behaviorId) || AI_ARCHETYPES[5]; // Default to Balanced
  
  // Chance to bid based on risk and aggression
  const bidChance = (archetype.riskAppetite + archetype.biddingAggression) / 200;
  if (rng.next() > bidChance) return null;

  const reviewScore = project.reviewScore ?? 55;
  const buzz = project.buzz ?? 40;
  
  // Interest calculation weighted by archetype obsession
  let interest = (reviewScore * (archetype.awardObsession / 100) + buzz * (1 - archetype.awardObsession / 100)) / 100;
  
  // Genre focus bonus
  if (archetype.genreFocus.includes(project.genre) || archetype.genreFocus.includes('Any')) {
    interest *= 1.3;
  }

  // 🎭 The Method Actor Tuning: Adjusted AgentBrain to make rival studios aggressively outbid for IP.
  if (rival.currentMotivation === 'FRANCHISE_BUILDING' && ['Sci-Fi', 'Action', 'Fantasy'].includes(project.genre)) {
    interest *= 1.5;
  }

  if (interest < 0.4) return null;

  let maxBidPct = (0.05 + (archetype.riskAppetite / 1000)); // riskier rivals bid more of their total cash
  if (rival.currentMotivation === 'FRANCHISE_BUILDING' && ['Sci-Fi', 'Action', 'Fantasy'].includes(project.genre)) {
    maxBidPct += 0.15; // aggressive outbidding
  }
  const maxBid = rival.cash * maxBidPct;
  const bid = Math.round(project.budget * interest * rng.range(0.9, 1.6));
  
  return Math.min(bid, maxBid);
}

/**
 * Assigns a TV time slot. Now uses central nielsenSystem logic for parity.
 */
export function assignRivalTimeSlot(
  rival: RivalStudio,
  project: Project,
): TimeSlot | null {
  if (project.type !== 'SERIES') return null;
  return assignTimeSlot(project as SeriesProject);
}

/**
 * Determines if a rival should attempt a hostile takeover of another rival this week.
 * Phase 2: Strict 40% combined market share anti-trust cap.
 */
export function shouldAttemptHostileTakeover(
  attacker: RivalStudio,
  target: RivalStudio,
  state: GameState
): boolean {
  if (attacker.id === target.id) return false;
  
  const archetype = AI_ARCHETYPES.find(a => a.id === attacker.behaviorId);
  if (!archetype) return false;

  // Must have sufficient cash to make an offer
  const minimumOfferSize = target.cash * 1.5 + (target.prestige * 1_000_000);
  if (attacker.cash < minimumOfferSize) return false;

  // ⚖️ Anti-Trust Barrier: Hostile takeovers are strictly prohibited if the combined market share exceeds 40%.
  const attackerShare = attacker.marketShare ?? 0;
  const targetShare = target.marketShare ?? 0;
  if (attackerShare + targetShare > 0.40) return false;

  // Aggression and Strategy check
  if (archetype.biddingAggression < 70) return false;
  if (archetype.strategy !== 'acquirer' && archetype.strategy !== 'poacher') return false;

  return attacker.currentMotivation === 'FRANCHISE_BUILDING' || attacker.currentMotivation === 'MARKET_DISRUPTION';
}
