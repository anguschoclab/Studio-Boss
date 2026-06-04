import { Agency, Talent, GameState, StateImpact } from '@/engine/types';
import { MarketState } from '@/engine/types/state.types';
import { RandomGenerator } from '../../utils/rng';
import { AGENCY_ARCHETYPES } from '../../data/archetypes';
import { AgencyLeverageEngine } from './AgencyLeverage';

function getAgencyArchetype(agency: Agency) {
  const key = agency.archetype as keyof typeof AGENCY_ARCHETYPES;
  return AGENCY_ARCHETYPES[key] || AGENCY_ARCHETYPES.boutique;
}

/**
 * Evaluates whether an agency will attempt a forced package deal on the player.
 * Merges the richer archetype-aware logic from PackageEngine with the functional
 * AgentBrain signature (takes GameState, not loose MarketState).
 */
export function evaluatePackageOffer(
  agency: Agency,
  leadTalent: Talent,
  talentPool: Talent[],
  market: MarketState,
  rng: RandomGenerator
): { requiredTalentId?: string; packageDiscount?: number; reason: string } {
  const archetype = getAgencyArchetype(agency);
  const motivation = agency.currentMotivation || 'VOLUME_RETAIL';

  // 🎭 The Method Actor Tuning: Auteur directors have maximum leverage to force collaborator bundling.
  const isAuteur = leadTalent.roles?.includes('director') && leadTalent.prestige > 85;

  const leverage = AgencyLeverageEngine.calculateNegotiationLeverage(leadTalent, agency, undefined, market);

  const baseProbability = motivation === 'THE_PACKAGER' ? 0.40 : (isAuteur ? 0.50 : archetype.pact_aggression);
  const leverageBonus = (archetype.leverage_base / 100) * 0.3;
  const packageProbability = baseProbability + (leverage.score * 0.2) + leverageBonus;

  const prefersPackageDeal = isAuteur || archetype.negotiation_tactic_preferences.includes('PACKAGE_DEAL');

  if (prefersPackageDeal && rng.next() < packageProbability) {
    const otherClients = talentPool.filter(t => t.agencyId === agency.id && t.id !== leadTalent.id);

    if (otherClients.length > 0) {
      const bundled = rng.pick(otherClients);
      const discount = motivation === 'THE_PACKAGER' ? 0.20 : (isAuteur ? 0.15 : 0.10);

      return {
        requiredTalentId: bundled.id,
        packageDiscount: discount,
        reason: isAuteur
          ? `Creative Mandate: ${leadTalent.name} refuses to sign unless their frequent collaborator ${bundled.name} is attached.`
          : `Agency policy: To secure ${leadTalent.name}, we require you to also hire ${bundled.name}.`,
      };
    }
  }

  return { reason: 'No package deal offered.' };
}

/**
 * Agency Weekly Tick (Target C2).
 * Generates rumors, poach attempts, and package deal demands as discrete state impacts.
 */
export function tickAgencies(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  // ⚡ Bolt: Pre-group talents into O(1) lookups to avoid O(N*M) filtering inside the agency loop.
  const allTalents = Object.values(state.entities.talents || {});
  const talentsByAgency: Record<string, Talent[]> = {};

  for (let i = 0; i < allTalents.length; i++) {
    const t = allTalents[i];
    if (!talentsByAgency[t.agencyId]) talentsByAgency[t.agencyId] = [];
    talentsByAgency[t.agencyId].push(t);
  }

  const playerStudioId = state.studio.id;

  // Collect player project IDs for ownership checks
  const playerProjectIds = new Set<string>();
  for (const id in state.entities.projects || {}) {
    if (state.entities.projects[id].ownerId === playerStudioId) {
      playerProjectIds.add(id);
    }
  }

  // Find talent currently under contract to player projects
  const playerContractedTalentIds = new Set<string>();
  for (const cId in state.entities.contracts || {}) {
    const contract = state.entities.contracts[cId];
    if (playerProjectIds.has(contract.projectId)) {
      playerContractedTalentIds.add(contract.talentId);
    }
  }

  // ⚡ Bolt: Cache array to avoid Object.values on every tick iteration
  const brands = Object.values(state.entities.rivals || {});

  state.industry.agencies.forEach(agency => {
    const archetype = getAgencyArchetype(agency);

    // --- Rumor / Poach Pass ---
    if (agency.culture === 'shark' || agency.currentMotivation === 'THE_SHARK') {
      if (rng.next() < 0.1) {
        if (brands.length > 0) {
          let rival = rng.pick(brands);

          // 🎭 The Method Actor Tuning: Shark agencies smell blood in the water and specifically target vulnerable studios.
          const vulnerableRivals = brands.filter(r => r.prestige < 50 || r.currentMotivation === 'CASH_CRUNCH' || (r.prestige < 60 && r.cash > 10_000_000));
          if (vulnerableRivals.length > 0 && rng.next() < 0.8) {
            rival = rng.pick(vulnerableRivals);
          }

          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              headline: `${agency.name} is looking to poach top talent from ${rival.name}.`,
              description: `Industry whispers suggest ${agency.name} is making aggressive overtures to talent currently under contract at ${rival.name}.`,
            },
          });
        }
      }
    }

    // --- Package Deal Pass ---
    if (archetype.pact_aggression > 0 && rng.next() < archetype.pact_aggression) {
      // Find the highest-prestige player-contracted talent at this agency
      const agencyPlayerTalents = (talentsByAgency[agency.id] || [])
        .filter(t => playerContractedTalentIds.has(t.id))
        .sort((a, b) => b.prestige - a.prestige);

      if (agencyPlayerTalents.length > 0) {
        const leadTalent = agencyPlayerTalents[0];
        const marketState = state.finance?.marketState ?? { baseRate: 0.045, savingsYield: 0.025, debtRate: 0.095, loanRate: 0.07, rateHistory: [] };
        const result = evaluatePackageOffer(agency, leadTalent, allTalents, marketState, rng);

        if (result.requiredTalentId) {
          const bundledTalent = state.entities.talents?.[result.requiredTalentId];
          impacts.push({
            type: 'MODAL_TRIGGERED',
            payload: {
              modalType: 'PACKAGE_DEAL_OFFERED',
              priority: 75,
              payload: {
                agencyId: agency.id,
                agencyName: agency.name,
                agencyArchetype: archetype.name,
                agencyDescription: archetype.description,
                leadTalentId: leadTalent.id,
                leadTalentName: leadTalent.name,
                bundledTalentId: result.requiredTalentId,
                bundledTalentName: bundledTalent?.name ?? 'Unknown',
                packageDiscount: result.packageDiscount ?? 0,
                reason: result.reason,
              },
            },
          });
          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              headline: `${agency.name} demands package deal: ${leadTalent.name} + ${bundledTalent?.name ?? 'Unknown'}`,
              description: result.reason,
              category: 'talent',
            },
          });
        }
      }
    }
  });

  // Rival production setbacks
  // ⚡ Bolt: Reuse cached brands array instead of a new loop iteration over state.entities.rivals
  brands.forEach(rival => {
    if (rival.currentMotivation === 'CASH_CRUNCH') return;

    if (rng.next() < 0.02) {
      const crisisCost = rival.cash * 0.05;
      impacts.push({
        type: 'RIVAL_UPDATED',
        payload: {
          rivalId: rival.id,
          update: { cash: Math.max(0, rival.cash - crisisCost) },
        },
      });
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: `${rival.name} faces production setback, sources say costs have escalated.`,
          description: `Industry sources confirm ${rival.name} is dealing with an unexpected production issue that has impacted their Q${Math.floor(state.week / 13) + 1} budget.`,
        },
      });
    }
  });

  return impacts;
}
