import { GameState, TalentProfile, Opportunity } from '../types';
import { generateOpportunity } from '../generators/opportunities';

export interface TalentAdvanceResult {
  updatedOpportunities: Opportunity[];
  events: string[];
}

export function advanceTalent(
  state: GameState
): TalentAdvanceResult {
  const projectUpdates: string[] = [];
  const events: string[] = [];
  const updatedOpportunitiesCopy: Opportunity[] = [];
  const opportunities = state.opportunities || [];

  // Update opportunity expiry
  for (let i = 0; i < opportunities.length; i++) {
    const opp = opportunities[i];
    const newWeeks = opp.weeksUntilExpiry - 1;
    if (newWeeks > 0) {
      updatedOpportunitiesCopy.push({
        ...opp,
        weeksUntilExpiry: newWeeks,
      });
    }
  }

  let oppNames: Set<string> | null = null;
  const getOppNames = () => {
    if (!oppNames) {
      oppNames = new Set();
      for (let i = 0; i < updatedOpportunitiesCopy.length; i++) {
        oppNames.add(updatedOpportunitiesCopy[i].title);
      }
    }
    return oppNames;
  };

  // Opportunity 1 (Specific to available talent)
  if (Math.random() < 0.2) {
    const activeTalentIds = new Set<string>();
    for (let i = 0; i < state.contracts.length; i++) {
      activeTalentIds.add(state.contracts[i].talentId);
    }

    const availableTalentIds: string[] = [];
    for (let i = 0; i < state.talentPool.length; i++) {
      const t = state.talentPool[i];
      if (!activeTalentIds.has(t.id)) {
        availableTalentIds.push(t.id);
      }
    }

    if (availableTalentIds.length > 0) {
      const newOpp = generateOpportunity(availableTalentIds);
      if (!getOppNames().has(newOpp.title)) {
        updatedOpportunitiesCopy.push(newOpp);
        getOppNames().add(newOpp.title);
        events.push(`A new script "${newOpp.title}" hit the market.`);
      }
    }
  }

  // Opportunity 2 (General)
  if (Math.random() < 0.2) {
    const newOpp = generateOpportunity();
    if (!getOppNames().has(newOpp.title)) {
      updatedOpportunitiesCopy.push(newOpp);
      getOppNames().add(newOpp.title);
      events.push(`A new script "${newOpp.title}" just hit the market!`);
    }
  }

  // Opportunity 3 (General batch)
  if (Math.random() < 0.15) {
    const newOpp = generateOpportunity();
    if (!getOppNames().has(newOpp.title)) {
      updatedOpportunitiesCopy.push(newOpp);
      getOppNames().add(newOpp.title);
      events.push('New opportunities have hit the market!');
    }
  }

  // Opportunity 4 (Fallback)
  if (Math.random() < 0.15 && updatedOpportunitiesCopy.length < 3) {
    const newOpp = generateOpportunity();
    if (!getOppNames().has(newOpp.title)) {
      updatedOpportunitiesCopy.push(newOpp);
      getOppNames().add(newOpp.title);
      events.push(`A new ${newOpp.budgetTier} ${newOpp.format} package hit the market.`);
    }
  }

  return {
    updatedOpportunities: updatedOpportunitiesCopy,
    events,
  };
}
