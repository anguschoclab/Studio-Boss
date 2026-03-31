import { Agency, Agent, Talent, GameState, StateImpact } from '@/engine/types';
import { pick, secureRandom } from '../../utils';

/**
 * Pure function to evaluate if an agency offers a "Package Deal".
 */
export function evaluatePackageOffer(
  agency: Agency, 
  leadTalent: Talent, 
  talentPool: Talent[]
): { requiredTalentId?: string; packageDiscount?: number; reason: string } {
  const motivation = agency.currentMotivation || 'VOLUME_RETAIL';
  
  if (motivation === 'THE_PACKAGER' || secureRandom() < 0.15) {
    const otherClients = talentPool.filter(t => t.agencyId === agency.id && t.id !== leadTalent.id);
    
    if (otherClients.length > 0) {
      const bundled = pick(otherClients);
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
export function tickAgencies(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];

  state.industry.agencies.forEach(agency => {
    // Aggressive agencies (Sharks) leak rumors
    if (agency.culture === 'shark' || agency.currentMotivation === 'THE_SHARK') {
      if (secureRandom() < 0.1) {
        const rival = pick(state.industry.rivals);
        if (rival) {
          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              headline: {
                week: state.week,
                category: 'rival',
                text: `${agency.name} is looking to poach top talent from ${rival.name}.`
              }
            }
          });
        }
      }
    }
  });

  return impacts;
}
