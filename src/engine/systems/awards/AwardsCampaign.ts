import { GameState, StateImpact } from "@/engine/types";
import { CampaignData } from "@/engine/types/state.types";
import { RandomGenerator } from "../../utils/rng";
import { checkCampaignBacklash } from "../awards/NominationCalculator";
import { impacts as I } from "../../core/impacts";

export interface AwardsCampaignResult {
  campaign: CampaignData;
  impacts: StateImpact[];
  backlash: boolean;
  cost: number;
  rngState: number;
}

export function launchAwardsCampaign(
  state: GameState,
  projectId: string,
  tierKey: "Grassroots" | "Trade" | "Blitz",
  rng: RandomGenerator,
  targetCategories: string[] = ["Best Picture"]
): AwardsCampaignResult | null {
  const project = state.entities.projects[projectId];
  if (!project) return null;

  const tierCosts: Record<string, number> = {
    Grassroots: 250_000,
    Trade: 1_000_000,
    Blitz: 5_000_000,
  };
  const tierBuzz: Record<string, number> = {
    Grassroots: 5,
    Trade: 15,
    Blitz: 40,
  };
  const tierRisk: Record<string, number> = {
    Grassroots: 0,
    Trade: 2,
    Blitz: 12,
  };

  const cost = tierCosts[tierKey];
  if (state.finance.cash < cost) return null;

  const metaScore = project.reception?.metaScore || project.reviewScore || 60;
  const hasBacklash = checkCampaignBacklash(metaScore, tierKey, rng);

  const campaign: CampaignData = {
    id: rng.uuid("OPP"),
    projectId,
    budget: cost,
    targetCategories,
    buzzBonus: tierBuzz[tierKey],
    scandalRisk: tierRisk[tierKey],
  };

  const impacts: StateImpact[] = [];

  if (hasBacklash) {
    impacts.push(
      I.newsAdded({
        headline: `BACKLASH: Aggressive awards campaigning for "${project.title}" sparks industry outcry!`,
        description: ``,
        category: "scandal",
      }),
    );
  }

  return {
    campaign,
    impacts,
    backlash: hasBacklash,
    cost,
    rngState: rng.getState(),
  };
}
