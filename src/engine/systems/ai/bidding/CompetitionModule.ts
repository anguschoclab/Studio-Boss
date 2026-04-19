import { GameState, StateImpact, Project } from '@/engine/types';
import { RandomGenerator } from '../../../utils/rng';
import { AgencyLeverageEngine } from '../AgencyLeverage';
import { TalentAgentInteractionEngine } from '../../talent/talentAgentInteractions';
import { calculateWillingness } from '../../talent/willingnessEngine';

export function tickTalentCompetition(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  if (state.week % 4 !== 0) return [];

  const rivalsList = Object.values(state.entities.rivals || {});
  const eligibleRivals = rivalsList.filter(r => r.cash > 100_000_000);
  if (eligibleRivals.length === 0) return [];

  const availableTalent: typeof state.entities.talents[string][] = [];
  const talents = state.entities.talents;
  for (const id in talents) {
    if (Object.prototype.hasOwnProperty.call(talents, id)) {
      const t = talents[id];
      if (t.prestige > 85 && !t.contractId) {
        availableTalent.push(t);
      }
    }
  }
  
  if (availableTalent.length === 0) return [];

  eligibleRivals.forEach(rival => {
    if (rng.next() < 0.1) {
      const target = rng.pick(availableTalent);

      const dummyProject: Project = {
        id: 'dummy-pact-project',
        title: 'First-Look Pact',
        genre: 'Drama',
        budget: rival.cash * 0.1,
        buzz: rival.prestige,
        reviewScore: 70,
        state: 'development',
        weeksInPhase: 0,
        ownerId: rival.id
      } as any;

      const willingnessReport = calculateWillingness(target, dummyProject, state);

      if (willingnessReport.finalVerdict === 'unwilling') {
        return;
      }

      const isAuteur = target.prestige > 85;
      const prestigeDelta = target.prestige - rival.prestige;
      const isMoneyGrabber = target.currentMotivation === 'MONEY_GRABBER';

      if (isAuteur && prestigeDelta > 20 && !isMoneyGrabber) {
          return;
      }

      let prestigePenalty = 0;
      if (isAuteur && !isMoneyGrabber) {
        if (prestigeDelta > 10) {
          prestigePenalty = prestigeDelta * 0.40;
        } else if (prestigeDelta < -10) {
          prestigePenalty = -0.6;
        } else if (prestigeDelta > 0) {
          prestigePenalty = prestigeDelta * 0.1;
        }
      }

      let lockFeeMultiplier = 1.5;
      if (isMoneyGrabber) {
        lockFeeMultiplier = 2.0;
      }

      // 🎭 The Method Actor Tuning: MARKET_DISRUPTION rivals overpay significantly for top talent and ignore standard prestige gap penalties.
      if (rival.currentMotivation === 'MARKET_DISRUPTION') {
        lockFeeMultiplier += 1.0;
        prestigePenalty = 0;
      }

      const lockFee = target.fee * (lockFeeMultiplier + rng.next() + prestigePenalty);
      
      const agency = target.agencyId ? state.industry.agencies.find(a => a.id === target.agencyId) : undefined;
      const agent = target.agentId ? state.industry.agents.find(a => a.id === target.agentId) : undefined;
      const leverage = AgencyLeverageEngine.calculateNegotiationLeverage(
        target,
        agency,
        agent,
        state.finance.marketState
      );
      let leveragedFee = AgencyLeverageEngine.getRequiredFee(lockFee, leverage);

      let relationshipBonus = 0;
      if (target.agentId) {
        const relationship = state.talentAgentRelationships[`${target.id}-${target.agentId}`];
        if (relationship) {
          relationshipBonus = TalentAgentInteractionEngine.getLoyaltyBonus(relationship);
          leveragedFee = leveragedFee * (1 - (relationshipBonus / 100));
        }
      }

      if (rival.cash > leveragedFee * 2) {
         impacts.push({
           type: 'RIVAL_UPDATED',
           payload: {
             rivalId: rival.id,
             update: {
               cash: rival.cash - leveragedFee
             }
           }
         });

         impacts.push({
           type: 'NEWS_ADDED',
           payload: {
             id: rng.uuid('NWS'),
             headline: `BIDDING WAR: ${rival.name} locks down ${target.name}`,
             description: `In a major coup, ${rival.name} has signed ${target.name} to an exclusive first-look deal worth an estimated $${(lockFee / 1000000).toFixed(1)}M.`,
             category: 'talent',
             week: state.week
           }
         });
      }
    }
  });

  return impacts;
}
