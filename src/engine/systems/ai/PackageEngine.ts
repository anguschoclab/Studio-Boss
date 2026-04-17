import { Agency, Talent, MarketState } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { AGENCY_ARCHETYPES } from '../../data/archetypes';
import { pick } from '../../utils';
import { AgencyLeverageEngine } from './AgencyLeverage';

function getAgencyArchetype(agency: Agency) {
  const key = agency.culture as keyof typeof AGENCY_ARCHETYPES;
  return AGENCY_ARCHETYPES[key] || AGENCY_ARCHETYPES.boutique;
}

export function evaluatePackageOffer(
  agency: Agency,
  leadTalent: Talent,
  talentPool: Talent[],
  market: MarketState,
  rng: RandomGenerator
): { requiredTalentId?: string; packageDiscount?: number; reason: string } {
  const archetype = getAgencyArchetype(agency);
  const motivation = agency.currentMotivation || 'VOLUME_RETAIL';

  // 🎭 The Method Actor Tuning: Agencies will actively attempt to force package deals when their lead talent is an Auteur director.
  const isAuteur = leadTalent.roles.includes('director') && leadTalent.prestige > 85;

  const leverage = AgencyLeverageEngine.calculateNegotiationLeverage(leadTalent, agency, undefined, market);

  const baseProbability = motivation === 'THE_PACKAGER' ? 0.40 : (isAuteur ? 0.50 : 0.15);
  const leverageBonus = (archetype.leverage_base / 100) * 0.3;
  const packageProbability = baseProbability + (leverage.score * 0.2) + leverageBonus;

  const prefersPackageDeal = isAuteur || archetype.negotiation_tactic_preferences.includes('PACKAGE_DEAL');

  if (prefersPackageDeal && rng.next() < packageProbability) {
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
