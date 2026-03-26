import { GameState, TalentProfile, Project, Contract, Award, Opportunity } from '@/engine/types';
import { generateOpportunity } from '../generators/opportunities';
import { clamp } from '../utils';
import { applyAwardBoostsToTalent } from './talentStats';

export interface TalentAdvanceResult {
  updatedOpportunities: Opportunity[];
  events: string[];
}

/**
 * TalentSystem encapsulates all logic related to talent lifecycle, 
 * stat progression, and market opportunity generation.
 */
export class TalentSystem {
  /**
   * Advances the talent-related aspects of the game world (weekly tick).
   */
  static advance(state: GameState): TalentAdvanceResult {
    const events: string[] = [];
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
    // Logic for generating new talent-driven opportunities
    const tryAddOpp = (opp: Opportunity, message?: string) => {
      if (!oppTitles.has(opp.title)) {
        updatedOpportunities.push(opp);
        oppTitles.add(opp.title);
        if (message) events.push(message);
        return true;
      }
      return false;
    };

    // Talent-specific opportunity (using existing studio talent)
    if (Math.random() < 0.25) {
      const activeTalentIds = new Set(state.studio.internal.contracts.map(c => c.talentId));
      const availableTalentIds = state.industry.talentPool
        .filter(t => !activeTalentIds.has(t.id))
        .map(t => t.id);

      if (availableTalentIds.length > 0) {
        const newOpp = generateOpportunity(availableTalentIds);
        tryAddOpp(newOpp, `A new package "${newOpp.title}" hit the market.`);
      }
    }

    // General opportunities
    if (Math.random() < 0.2) {
      tryAddOpp(generateOpportunity(), `A new script is doing the rounds in town.`);
    }

    if (Math.random() < 0.15) {
      tryAddOpp(generateOpportunity(), `New opportunities have hit the market!`);
    }

    // Fallback/Density control
    if (updatedOpportunities.length < 4 && Math.random() < 0.3) {
      tryAddOpp(generateOpportunity());
    }

    return { updatedOpportunities, events };
  }

  /**
   * Updates talent stats based on project performance and awards.
   */
  static applyProjectResults(
    project: Project,
    contracts: Contract[],
    talentPool: TalentProfile[],
    awards: Award[] = []
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

    const projectAwards = awards.filter(a => a.projectId === project.id);
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

        let qualifiesForBonus = false;
        if (award.category.includes('Director')) qualifiesForBonus = isDirector;
        else if (award.category.includes('Actor') || award.category.includes('Actress') || award.category.includes('Ensemble')) qualifiesForBonus = isActor;
        else if (award.category.includes('Screenplay')) qualifiesForBonus = isWriter;
        else qualifiesForBonus = true; // Best Picture etc.

        if (qualifiesForBonus) {
          const multiplier = (award.category.includes('Director') || award.category.includes('Actor') || award.category.includes('Actress') || award.category.includes('Screenplay')) ? 1.0 : 0.5;
          const isPrestige = ['Academy Awards', 'Cannes Film Festival', 'Venice Film Festival'].includes(award.body);
          
          const boosts = applyAwardBoostsToTalent(talent, award, multiplier, isPrestige);

          talentAwardsPrestigeBonus += boosts.prestigeBoost;
          talentAwardsDrawBonus += boosts.drawBoost;

          // feeMultiplier is multiplicative
          // (Note: previous code used additive `+=`, we can either add the net boost or change to multiplier)
          // The old code did `talentAwardsFeeMultiplier += (isPrestige ? 0.5 : 0.2) * multiplier;`
          // So we accumulate the boost amount above 1.0 returned by our function:
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
        ego: clamp((talent.ego || 50) + talentAwardsEgoBoost, 0, 100)
      };

      updatedTalent.push(newTalent);
    }

    return updatedTalent;
  }
}
