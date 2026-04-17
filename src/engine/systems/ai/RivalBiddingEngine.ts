import { Project, RivalStudio } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { AI_ARCHETYPES } from '../../data/aiArchetypes';
import { SeriesProject } from '@/engine/types/project.types';
import { assignTimeSlot, TimeSlot } from '../television/nielsenSystem';

export function generateFestivalBid(
  rival: RivalStudio,
  project: Project,
  rng: RandomGenerator
): number | null {
  const behaviorId = rival.archetypeId || ('behaviorId' in rival ? (rival as any).behaviorId : undefined);
  const archetype = AI_ARCHETYPES.find(a => a.id === behaviorId) || AI_ARCHETYPES[5];

  const bidChance = (archetype.riskAppetite + archetype.biddingAggression) / 200;
  if (rng.next() > bidChance) return null;

  const reviewScore = project.reviewScore ?? 55;
  const buzz = project.buzz ?? 40;
  
  if (rival.currentMotivation === 'CASH_CRUNCH') {
    if (project.budget > rival.cash * 0.3) return null;
    if (buzz < 50) return null;
  }

  let interest = (reviewScore * (archetype.awardObsession / 100) + buzz * (1 - archetype.awardObsession / 100)) / 100;
  
  if (archetype.genreFocus.includes(project.genre) || archetype.genreFocus.includes('Any')) {
    interest *= 1.3;
  }

  if (rival.currentMotivation === 'FRANCHISE_BUILDING' && ['Sci-Fi', 'Action', 'Fantasy'].includes(project.genre)) {
    interest *= 2.0;
  }

  if (rival.currentMotivation === 'AWARD_CHASE' && reviewScore > 75) {
    interest *= 1.4;
  }

  if (rival.currentMotivation === 'MARKET_DISRUPTION') {
    interest *= 1.5;
  }

  if (rival.currentMotivation === 'CASH_CRUNCH' && buzz > 70 && project.budget < rival.cash * 0.15) {
    interest *= 1.8;
  }

  if (interest < 0.4) return null;

  let maxBidPct = (0.05 + (archetype.riskAppetite / 1000));
  if (rival.currentMotivation === 'FRANCHISE_BUILDING' && ['Sci-Fi', 'Action', 'Fantasy'].includes(project.genre)) {
    maxBidPct += 0.25;
  }
  if (rival.currentMotivation === 'AWARD_CHASE' && reviewScore > 75) {
    maxBidPct += 0.30;
  }
  if (rival.currentMotivation === 'MARKET_DISRUPTION') {
    maxBidPct += 0.35;
  }
  const maxBid = rival.cash * maxBidPct;
  const bid = Math.round(project.budget * interest * rng.range(0.9, 1.6));
  
  return Math.min(bid, maxBid);
}

export function assignRivalTimeSlot(
  rival: RivalStudio,
  project: Project,
): TimeSlot | null {
  if (project.type !== 'SERIES') return null;
  return assignTimeSlot(project as SeriesProject);
}
