import { Opportunity, RivalStudio } from '../../types';
import { clamp, randRange } from '../../utils';

export function calculateAIBid(
  studio: RivalStudio,
  opportunity: Opportunity,
  leadingBid: number
): number {
  let desireMultiplier = 1.0;

  // 1. Archetype Match (+25% weight for projects matching the studio's focus)
  const isMajorForBlockbuster = studio.archetype === 'major' && opportunity.budgetTier === 'blockbuster';
  const isIndieForDrama = studio.archetype === 'indie' && (opportunity.genre === 'Drama' || opportunity.genre === 'Horror');
  
  if (isMajorForBlockbuster || isIndieForDrama) {
    desireMultiplier += 0.25;
  }

  // 2. Multi-Round Counter-Offer Weight (+10% over the current leading bid)
  const baseBid = leadingBid > 0 ? leadingBid * 1.1 : opportunity.costToAcquire * randRange(0.9, 1.3);
  
  // 3. Quality Premium (+15% bid for projects with quality > 80)
  if (opportunity.qualityBonus && opportunity.qualityBonus > 80) {
    desireMultiplier += 0.15;
  }

  const finalBid = baseBid * desireMultiplier;

  // 4. Budget Safeguard (AI will NOT re-bid if the total bid exceeds 40% of its current cash)
  const budgetCap = studio.cash * 0.4;
  
  return Math.floor(Math.min(finalBid, budgetCap));
}

export function shouldStudioRebid(
  studio: RivalStudio,
  opportunity: Opportunity,
  currentHighestBid: number
): boolean {
  // If the highest bid is already from this studio, don't rebid
  const myBid = opportunity.bids[studio.id] || 0;
  if (myBid >= currentHighestBid) return false;

  // AI calculates if it has the desire and budget to stay in the war
  const bidCap = studio.cash * 0.4;
  if (currentHighestBid > bidCap) return false;

  // Bidding Strategy: Sharks rebid quickly, Mid-tier is cautious
  let aggression = 0.5;
  if (studio.strategy === 'acquirer') aggression = 0.8;
  if (studio.archetype === 'major') aggression = 0.7;

  return Math.random() < aggression;
}
