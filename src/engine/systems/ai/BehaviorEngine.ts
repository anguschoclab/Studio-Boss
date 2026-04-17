import { Agency, GameState, StateImpact, RivalStudio } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { AGENCY_ARCHETYPES } from '../../data/archetypes';
import { AI_ARCHETYPES } from '../../data/aiArchetypes';
import { pick } from '../../utils';

function getAgencyArchetype(agency: Agency) {
  const key = agency.culture as keyof typeof AGENCY_ARCHETYPES;
  return AGENCY_ARCHETYPES[key] || AGENCY_ARCHETYPES.boutique;
}

export function tickAgencies(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  state.industry.agencies.forEach(agency => {
    const archetype = getAgencyArchetype(agency);

    let poachProbability = archetype.pact_aggression * 0.3;

    if (agency.currentMotivation === 'THE_PACKAGER') {
       poachProbability *= 1.5;
    }

    if (rng.next() < poachProbability) {
      const rivalsObj = state.entities.rivals || {};
      const rivalKeys = Object.keys(rivalsObj);
      if (rivalKeys.length > 0) {
        let rivalKey = pick(rivalKeys, rng);
        let rival = rivalsObj[rivalKey];

        if (agency.currentMotivation === 'VOLUME_RETAIL') {
           const vulnerableRivals = rivalKeys.filter(k => rivalsObj[k].prestige < 50);
           if (vulnerableRivals.length > 0 && rng.next() < 0.7) {
             rivalKey = pick(vulnerableRivals, rng);
             rival = rivalsObj[rivalKey];
           }
        }

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

export function shouldAttemptHostileTakeover(
  attacker: RivalStudio,
  target: RivalStudio,
  state: GameState
): boolean {
  if (attacker.id === target.id) return false;

  const behaviorId = attacker.archetypeId || ('behaviorId' in attacker ? (attacker as any).behaviorId : undefined);
  const archetype = AI_ARCHETYPES.find(a => a.id === behaviorId);
  if (!archetype) return false;

  const minimumOfferSize = target.cash * 1.5 + (target.prestige * 1_000_000);
  if (attacker.cash < minimumOfferSize) return false;

  const attackerShare = attacker.marketShare ?? 0;
  const targetShare = target.marketShare ?? 0;
  if (attackerShare + targetShare > 0.40) return false;

  if (archetype.biddingAggression < 70) return false;
  if (archetype.strategy !== 'acquirer' && archetype.strategy !== 'poacher') return false;

  return attacker.currentMotivation === 'FRANCHISE_BUILDING' || attacker.currentMotivation === 'MARKET_DISRUPTION';
}
