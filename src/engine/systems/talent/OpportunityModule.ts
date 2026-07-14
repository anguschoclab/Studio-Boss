import { GameState, Opportunity } from "@/engine/types";
import { RandomGenerator } from "../../utils/rng";
import { generateOpportunity } from "../../generators/opportunities";
import { getContractsByTalentId } from "../../utils";

export function advanceOpportunityLifecycle(
  state: GameState,
  rng: RandomGenerator
): { updatedOpportunities: Opportunity[]; uiNotifications: string[] } {
  const uiNotifications: string[] = [];
  const currentOpportunities = state.market.opportunities || [];
  const updatedOpportunities: Opportunity[] = [];

  for (const opp of currentOpportunities) {
    if (opp.weeksUntilExpiry > 1) {
      updatedOpportunities.push({
        ...opp,
        weeksUntilExpiry: opp.weeksUntilExpiry - 1,
      });
    }
  }

  const oppTitles = new Set(updatedOpportunities.map((o) => o.title));

  const tryAddOpp = (opp: Opportunity, message?: string) => {
    if (!oppTitles.has(opp.title)) {
      updatedOpportunities.push(opp);
      oppTitles.add(opp.title);
      if (message) uiNotifications.push(message);
      return true;
    }
    return false;
  };

  const activeTalentIds = new Set<string>();
  const contractsMap = state.entities.contracts || {};
  const talentIdx = state.entities.contractsByTalentId || {};
  for (const talentId in talentIdx) {
    if (Object.prototype.hasOwnProperty.call(talentIdx, talentId)) {
      const talentContracts = getContractsByTalentId(talentIdx, contractsMap, talentId);
      if (talentContracts.length > 0) {
        activeTalentIds.add(talentId);
      }
    }
  }
  const availableTalentIds: string[] = [];
  for (const id in state.entities.talents) {
    if (!activeTalentIds.has(id)) availableTalentIds.push(id);
  }

  if (rng.next() < 0.25 && availableTalentIds.length > 0) {
    const newOpp = generateOpportunity();
    tryAddOpp(newOpp, `A new package "${newOpp.title}" hit the market.`);
  }

  if (rng.next() < 0.2) {
    tryAddOpp(
      generateOpportunity(),
      `A new script is doing the rounds in town.`
    );
  }

  if (rng.next() < 0.15) {
    tryAddOpp(
      generateOpportunity(),
      `New opportunities have hit the market!`
    );
  }

  if (updatedOpportunities.length < 4 && rng.next() < 0.3) {
    tryAddOpp(generateOpportunity());
  }

  return { updatedOpportunities, uiNotifications };
}
