import { GameState, RivalStudio, Agent, Family, Agency } from '@/engine/types';
import { StateImpact } from '../../types/state.types';
import { AgentBrain } from './AgentBrain';
import { pick, secureRandom } from '../../utils';

export class IndustryBrain {
  /**
   * Main weekly orchestrator for AI-driven industry entities.
   */
  static processIndustryWeekly(state: GameState): StateImpact {
    let finalImpact: StateImpact = {
      newHeadlines: [],
      newRumors: [],
      rivalUpdates: [],
      talentUpdates: [],
      newAwards: [],
      uiNotifications: []
    };

    // 1. Process Agency Actions (Packaging, Poaching, Rumors)
    const agencyImpact = AgentBrain.processAgencyWeekly(state);
    finalImpact = this.mergeImpacts(finalImpact, agencyImpact);

    // 2. Process Rival Studio Decisions (Budget, Projects, Aggression)
    const rivalImpact = this.processRivalDecisions(state);
    finalImpact = this.mergeImpacts(finalImpact, rivalImpact);

    // 3. Process Family Dynasties (Legacy influence)
    const familyImpact = this.processFamilyLegacy(state);
    finalImpact = this.mergeImpacts(finalImpact, familyImpact);

    return finalImpact;
  }

  private static processRivalDecisions(state: GameState): StateImpact {
    const impact: StateImpact = { rivalUpdates: [], newHeadlines: [] };

    for (const rival of state.industry.rivals) {
       const profile = rival.motivationProfile;
       const motivation = rival.currentMotivation;

       // A: Handle Cash Crunches
       if (rival.cash < 5_000_000 || motivation === 'CASH_CRUNCH') {
          if (secureRandom() < 0.2) {
             impact.newHeadlines!.push({
                week: state.week,
                category: 'market' as const,
                text: `${rival.name} aggressively sheds non-core properties to shore up balance sheet.`
             });
          }
       }

       // B: Aggression (Poaching/Sabotage)
       if (profile.aggression > 75 && secureRandom() < 0.05) {
          const targets = state.industry.rivals.filter(r => r.id !== rival.id);
          if (targets.length > 0) {
             const target = pick(targets);
             impact.newHeadlines!.push({
                week: state.week,
                category: 'rival' as const,
                text: `${rival.name} launches a targeted poach on ${target.name}'s development slate.`
             });
          }
       }
    }

    return impact;
  }

  private static processFamilyLegacy(state: GameState): StateImpact {
    const impact: StateImpact = { newHeadlines: [] };

    for (const family of state.industry.families) {
       // High volatility/scandal families trigger more news
       if (family.volatility > 80 && secureRandom() < 0.05) {
          impact.newHeadlines!.push({
             week: state.week,
             category: 'talent' as const,
             text: `CHAOS IN MALIBU: The ${family.name} family estate faces internal legal battle over inheritance rights.`
          });
       }
    }

    return impact;
  }

  private static mergeImpacts(base: StateImpact, next: StateImpact): StateImpact {
    return {
      ...base,
      newHeadlines: [...(base.newHeadlines || []), ...(next.newHeadlines || [])],
      newRumors: [...(base.newRumors || []), ...(next.newRumors || [])],
      rivalUpdates: [...(base.rivalUpdates || []), ...(next.rivalUpdates || [])],
      talentUpdates: [...(base.talentUpdates || []), ...(next.talentUpdates || [])],
      newAwards: [...(base.newAwards || []), ...(next.newAwards || [])],
      uiNotifications: [...(base.uiNotifications || []), ...(next.uiNotifications || [])],
    };
  }
}
