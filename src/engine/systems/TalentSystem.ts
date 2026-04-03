import { GameState, Talent, Project, Contract, Award, Opportunity } from '@/engine/types';
type TalentProfile = Talent;
import { StateImpact } from '../types/state.types';
import { generateOpportunity } from '../generators/opportunities';
import { clamp } from '../utils';
import { RandomGenerator } from '../utils/rng';
import { applyAwardBoostsToTalent } from './talentStats';

/**
 * TalentSystem encapsulates all logic related to talent lifecycle, 
 * stat progression, and market opportunity generation.
 */
export class TalentSystem {
  /**
   * Advances the talent-related aspects of the game world (weekly tick).
   */
  static advance(state: GameState, rng: RandomGenerator): StateImpact {
    const uiNotifications: string[] = [];
    
    const currentOpportunities = state.market.opportunities || [];
    const updatedOpportunities: Opportunity[] = [];

    // 1. Opportunity Lifecycle (Expiry)
    for (const opp of currentOpportunities) {
      if (opp.weeksUntilExpiry > 1) {
        updatedOpportunities.push({
          ...opp,
          weeksUntilExpiry: opp.weeksUntilExpiry - 1,
        });
      }
    }

    const oppTitles = new Set(updatedOpportunities.map(o => o.title));

    // 2. Market Generation Logic
    const tryAddOpp = (opp: Opportunity, message?: string) => {
      if (!oppTitles.has(opp.title)) {
        updatedOpportunities.push(opp);
        oppTitles.add(opp.title);
        if (message) uiNotifications.push(message);
        return true;
      }
      return false;
    };

    // Talent-specific opportunity (using existing studio talent)
    if (rng.next() < 0.25) {
      const activeTalentIds = new Set<string>();
      for (let i = 0; i < state.studio.internal.contracts.length; i++) {
        activeTalentIds.add(state.studio.internal.contracts[i].talentId);
      }
      const availableTalentIds: string[] = [];
      for (const id in state.industry.talentPool) {
        if (!activeTalentIds.has(id)) availableTalentIds.push(id);
      }

      if (availableTalentIds.length > 0) {
        const newOpp = generateOpportunity(availableTalentIds, rng);
        tryAddOpp(newOpp, `A new package "${newOpp.title}" hit the market.`);
      }
    }

    // General opportunities
    if (rng.next() < 0.2) {
      tryAddOpp(generateOpportunity(undefined, rng), `A new script is doing the rounds in town.`);
    }

    if (rng.next() < 0.15) {
      tryAddOpp(generateOpportunity(undefined, rng), `New opportunities have hit the market!`);
    }

    // Fallback/Density control
    if (updatedOpportunities.length < 4 && rng.next() < 0.3) {
      tryAddOpp(generateOpportunity(undefined, rng));
    }

    return {
      newOpportunities: updatedOpportunities,
      uiNotifications
    };
  }


  /**
   * Updates talent stats based on project performance and awards.
   */
  static applyProjectResults(
    project: Project,
    contracts: Contract[],
    talentPool: TalentProfile[],
    projectAwards: Award[] = []
  ): TalentProfile[] {
    if (contracts.length === 0) return [];

    const talentPoolMap = new Map(talentPool.map(t => [t.id, t]));
    const totalCost = project.budget + (project.marketingBudget || 0);
    const ROI = totalCost > 0 ? project.revenue / totalCost : 0;

    // Define success/failure bounds
    let drawChange = 0;
    let prestigeChange = 0;
    let feeMultiplier = 1.0;

    if (ROI > 4.0) { drawChange = 12; prestigeChange = 6; feeMultiplier = 1.6; }
    else if (ROI > 2.0) { drawChange = 6; prestigeChange = 3; feeMultiplier = 1.3; }
    else if (ROI > 1.0) { drawChange = 2; prestigeChange = 1; feeMultiplier = 1.1; }
    else if (ROI < 0.4) { drawChange = -12; prestigeChange = -6; feeMultiplier = 0.75; }
    else if (ROI < 0.8) { drawChange = -6; prestigeChange = -3; feeMultiplier = 0.85; }

    const updatedTalent: TalentProfile[] = [];

    for (const contract of contracts) {
      const talent = talentPoolMap.get(contract.talentId);
      if (!talent) continue;

      let talentAwardsDrawBonus = 0;
      let talentAwardsPrestigeBonus = 0;
      let talentAwardsFeeMultiplier = 1.0;
      let talentAwardsEgoBoost = 0;

      for (const award of projectAwards) {
        const isDirector = talent.roles.includes('director');
        const isActor = talent.roles.includes('actor');
        const isWriter = talent.roles.includes('writer');

        let qualifiesForBonus;
        if (award.category.includes('Director')) { qualifiesForBonus = isDirector; }
        else if (award.category.includes('Actor') || award.category.includes('Actress') || award.category.includes('Ensemble')) { qualifiesForBonus = isActor; }
        else if (award.category.includes('Screenplay')) { qualifiesForBonus = isWriter; }
        else { qualifiesForBonus = true; } // Best Picture etc.

        if (qualifiesForBonus) {
          const multiplier = (award.category.includes('Director') || award.category.includes('Actor') || award.category.includes('Actress') || award.category.includes('Screenplay')) ? 1.0 : 0.5;
          const isPrestige = ['Academy Awards', 'Cannes Film Festival', 'Venice Film Festival'].includes(award.body);
          
          const boosts = applyAwardBoostsToTalent(talent, award, multiplier, isPrestige);

          talentAwardsPrestigeBonus += boosts.prestigeBoost;
          talentAwardsDrawBonus += boosts.drawBoost;

          // feeMultiplier is multiplicative
          talentAwardsFeeMultiplier += (boosts.feeMultiplier - 1.0);
          talentAwardsEgoBoost += boosts.egoBoost;
        }
      }

      const finalFeeMultiplier = feeMultiplier * talentAwardsFeeMultiplier;
      
      const newTalent = {
        ...talent,
        draw: clamp(talent.draw + drawChange + talentAwardsDrawBonus, 0, 100),
        prestige: clamp(talent.prestige + prestigeChange + talentAwardsPrestigeBonus, 0, 100),
        fee: Math.round(clamp(talent.fee * finalFeeMultiplier, 10000, 75000000)),
        ego: clamp((talent.psychology?.ego || 50) + talentAwardsEgoBoost, 0, 100)
      };

      updatedTalent.push(newTalent);
    }

    return updatedTalent;
  }
}
