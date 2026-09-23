import {Project, MarketingCampaign} from "@/engine/types";

export function executeMarketing(
  project: Project,
  campaign: MarketingCampaign
): { project: Project } {
  const p = {
    ...project,
    marketingCampaign: {
      ...campaign,
      weeksInMarketing: 1, // Starts at week 1
    },
  };
  return { project: p };
}

export function executeGreenlight(project: Project): { project: Project; update: string } {
  const p = { ...project, state: "production" as const, weeksInPhase: 0 };
  return {
    project: p,
    update: `"${project.title}" receives full greenlight and enters production.`,
  };
}

export function executePitching(
  project: Project,
  buyerName: string,
  contractType: string
): { project: Project; update: string } {
  const p = { ...project, state: "production" as const, weeksInPhase: 0 };
  return {
    project: p,
    update: `${buyerName} officially picks up "${project.title}" on a ${contractType} deal.`,
  };
}
