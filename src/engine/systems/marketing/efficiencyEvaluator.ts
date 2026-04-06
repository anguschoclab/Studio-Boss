import { Project, MarketingCampaign } from '../../types';

export function evaluateMarketingEfficiency(
  project: Project,
  campaign: MarketingCampaign
): { multiplier: number; feedbackText: string } {
  let multiplier = 1.0;
  let feedbackText = "The marketing campaign has been launched.";

  const { primaryAngle, domesticBudget, foreignBudget, weeksInMarketing = 0 } = campaign;
  const totalBudget = domesticBudget + foreignBudget;

  // 1. Angle Match Logic
  const genre = (project.genre || 'DRAMA').toUpperCase();
  
  const matches: Record<string, string[]> = {
    'ACTION': ['SELL_THE_SPECTACLE', 'SELL_THE_STARS'],
    'SCI-FI': ['SELL_THE_SPECTACLE', 'SELL_THE_STORY'],
    'DRAMA': ['SELL_THE_STORY', 'AWARDS_PUSH'],
    'ANIMATION': ['FAMILY_ADVENTURE', 'SELL_THE_SPECTACLE'],
    'FAMILY': ['FAMILY_ADVENTURE'],
    'COMEDY': ['SELL_THE_STARS', 'SELL_THE_STORY'],
    'HORROR': ['SELL_THE_SPECTACLE', 'SELL_THE_STORY'],
    'ROMANCE': ['SELL_THE_STARS', 'SELL_THE_STORY'],
  };

  if (matches[genre]?.includes(primaryAngle)) {
    multiplier += 0.2;
    feedbackText = `The ${primaryAngle} angle resonates perfectly with the ${project.genre} audience.`;
  } else {
    multiplier -= 0.15;
    feedbackText = `Audience research suggests the ${primaryAngle} angle feels misleading for a ${project.genre} and has wasted some of the budget.`;
  }

  // 2. Budget Scale Logic
  if (totalBudget > project.budget * 0.8) {
    multiplier += 0.1; // "Market Dominance" bonus
  } else if (totalBudget < project.budget * 0.1) {
    multiplier -= 0.1; // "Under-marketed" penalty
  }

  // 3. Hype Decay (Stale Hype)
  // 5% decay per week after 4 weeks
  if (weeksInMarketing > 4) {
    const overdueWeeks = weeksInMarketing - 4;
    const decay = Math.pow(0.95, overdueWeeks);
    multiplier *= decay;
    feedbackText += " Hype has begun to sour as the film lingers in marketing for too long.";
  }

  return { 
    multiplier: Math.max(0.1, multiplier), 
    feedbackText 
  };
}
