import { GameState, Talent, Project, Contract } from '../../../types';
import { RandomGenerator } from '../../../utils/rng';
import { GuestStarBooking } from '../../../types/discovery.types';

// Guest star thresholds
const MIN_STARMETER_FOR_GUEST = 60; // Must be somewhat famous
const GUEST_STAR_CHANCE = 0.1; // 10% per series per week

export function generateGuestStarBooking(
  series: Project,
  guestTalent: Talent,
  state: GameState,
  rng: RandomGenerator
): GuestStarBooking | null {
  // Check if series has regular cast
  const seriesContracts = Object.values(state.entities.contracts || {})
    .filter(c => c.projectId === series.id);

  if (seriesContracts.length === 0) return null;

  // Determine role type
  const roleTypes: Array<'cameo' | 'recurring_guest' | 'special_guest' | 'crossover'> = [
    'cameo', 'cameo', 'recurring_guest', 'special_guest'
  ];
  const roleType = rng.pick(roleTypes);

  // Calculate impact on ratings
  const baseImpact = (guestTalent.starMeter || 50) / 10;
  const chemistryBonus = rng.rangeInt(-5, 15); // Chemistry with cast
  const impact = Math.max(1, Math.min(20, baseImpact + chemistryBonus));

  // Cost based on talent tier and role
  const baseCost = guestTalent.tier === 1 ? 500000 :
                   guestTalent.tier === 2 ? 200000 :
                   guestTalent.tier === 3 ? 100000 : 50000;
  const cost = baseCost * (roleType === 'cameo' ? 0.3 : 1);

  // Fan reaction prediction
  const fanReactionRoll = rng.next();
  let fanReaction: GuestStarBooking['fanReaction'] = 'positive';
  if (fanReactionRoll < 0.05) fanReaction = 'negative';
  else if (fanReactionRoll < 0.15) fanReaction = 'mixed';
  else if (fanReactionRoll > 0.85 && guestTalent.starMeter && guestTalent.starMeter > 80) {
    fanReaction = 'viral';
  }

  // Get series details
  const seriesDetails = (series as any).tvSeasonDetails;
  const seasonNumber = seriesDetails?.currentSeason || 1;
  const episodeNumber = seriesDetails?.episodesOrdered || rng.rangeInt(1, 10);

  return {
    id: rng.uuid('GST'),
    talentId: guestTalent.id,
    seriesId: series.id,
    episodeNumber,
    seasonNumber,
    roleType,
    impact,
    cost,
    chemistryWithCast: Math.max(0, Math.min(100, 50 + chemistryBonus * 3)),
    fanReaction,
  };
}
