import { pick } from '../../utils';
import { Agency, Agent, Talent, GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

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
