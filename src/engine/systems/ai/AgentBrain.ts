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
  
  if (motivation === 'THE_PACKAGER' || rng.next() < 0.15) {
    const otherClients = talentPool.filter(t => t.agencyId === agency.id && t.id !== leadTalent.id);
    
    if (otherClients.length > 0) {
      const bundled = rng.pick(otherClients);
      return {
        requiredTalentId: bundled.id,
        packageDiscount: 0.1,
        reason: `Agency policy: To secure ${leadTalent.name}, we require ${bundled.name}.`
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
        const rival = rng.pick(brands);
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

export interface ContractOffer {
  fee: number;
  backendPercent: number;
}

export function decideContractAcceptance(
  talent: Talent,
  offer: ContractOffer
): { accepted: boolean; counterOffer?: ContractOffer; reason: string } {
  if (offer.fee >= talent.fee) {
    return { accepted: true, reason: 'Fee meets expectation' };
  }
  return { accepted: false, counterOffer: { fee: talent.fee, backendPercent: offer.backendPercent }, reason: 'Fee too low' };
}

export function processContractNegotiation(
  talent: Talent,
  offer: ContractOffer
): StateImpact[] {
  const result = decideContractAcceptance(talent, offer);
  if (result.accepted) {
    // Return side effect as pure state impact instead of mutating state
    return [{ type: 'TALENT_UPDATED', payload: { talentId: talent.id, update: { assignedStudio: 'player' } } }];
  }
  return [];
}
