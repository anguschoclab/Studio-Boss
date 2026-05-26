import { Agency, GameState, StateImpact, RivalStudio } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { AGENCY_ARCHETYPES } from '../../data/archetypes';
import { getStudioArchetype } from '../../data/aiArchetypes';
import { pick } from '../../utils';

function getAgencyArchetype(agency: Agency) {
  const key = agency.culture as keyof typeof AGENCY_ARCHETYPES;
  return AGENCY_ARCHETYPES[key] || AGENCY_ARCHETYPES.boutique;
}

export function tickAgencies(state: GameState, rng: RandomGenerator): StateImpact {
  const impacts: StateImpact[] = [];
  const uiNotifications: string[] = [];

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
           // 🎭 The Method Actor Tuning: Agencies are ruthless. They heavily target vulnerable studios (prestige < 40) for poaching, smelling blood in the water.
           const vulnerableRivals = rivalKeys.filter(k => rivalsObj[k].prestige < 40);
           if (vulnerableRivals.length > 0 && rng.next() < 0.9) {
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

          // Add to narrative events for weekly summary
          uiNotifications.push(`AGENCY: ${agency.name} is poaching talent from ${rival.name}`);
        }
      }
    }
  });

  // Add uiNotifications to the first impact
  if (uiNotifications.length > 0 && impacts.length > 0) {
    impacts[0].uiNotifications = uiNotifications;
  }

  return impacts;
}

export function shouldAttemptHostileTakeover(
  attacker: RivalStudio,
  target: RivalStudio,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _state: GameState
): boolean {
  if (attacker.id === target.id) return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const behaviorId = attacker.archetypeId || ('behaviorId' in attacker ? (attacker as any).behaviorId : undefined);
  const archetype = getStudioArchetype(behaviorId);
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
