import { GameState, StateImpact, StudioCulture } from '@/engine/types';

/**
 * StudioIdentitySystem
 *
 * Tracks the strategic axes for the studio based on recent releases (last 26 weeks).
 * This dynamically updates the state.studio.culture object.
 */

const NUDGE = 2; // Points shifted per week
const WINDOW = 26; // Weeks of history to evaluate

/**
 * Called weekly — adjusts culture axes based on recent releases then returns
 * a SYSTEM_TICK impact carrying the updated culture.
 */
export function tickStudioIdentity(state: GameState): StateImpact[] {
  const current: StudioCulture = state.studio.culture || {
    prestigeVsCommercial: 50,
    talentFriendlyVsControlling: 50,
    nicheVsBroad: 50,
    filmFirstVsTvFirst: 50,
    franchiseOriginal: 50
  };

  const currentWeek = state.week;
  let newPC = current.prestigeVsCommercial;
  let newFO = current.franchiseOriginal;

  let recentReleasesCount = 0;
  let prestigeCount = 0;
  let commercialCount = 0;
  let franchiseCount = 0;
  let originalCount = 0;

  // ⚡ The Framerate Fanatic: Replaced Object.values().filter() and secondary loops with a single O(N) for...in pass
  const projects = state.entities.projects || {};
  for (const id in projects) {
    const p = projects[id];
    if (p.state === 'released' && p.releaseWeek !== null && p.releaseWeek > currentWeek - WINDOW) {
      recentReleasesCount++;

      // Prestige vs Commercial
      const isAwardsPush = p.marketingAngle === 'AWARDS_PUSH';
      const reviewHigh = (p.reviewScore ?? 0) > 75;
      const lowBudget = p.budget < 20_000_000;
      const highBudget = p.budget > 80_000_000;
      const spectacle = p.marketingAngle === 'SELL_THE_SPECTACLE';

      if (isAwardsPush || reviewHigh || lowBudget) prestigeCount += 1;
      if (highBudget || spectacle) commercialCount += 1;

      // Franchise vs Original
      if (p.franchiseId) franchiseCount += 1;
      else originalCount += 1;
    }
  }

  if (recentReleasesCount === 0) {
    // No recent releases — gently drift toward centre
    const driftPC = newPC > 50 ? -1 : newPC < 50 ? 1 : 0;
    const driftFO = newFO > 50 ? -1 : newFO < 50 ? 1 : 0;
    newPC += driftPC;
    newFO += driftFO;
  } else {
    if (prestigeCount > commercialCount) newPC += NUDGE;
    else if (commercialCount > prestigeCount) newPC -= NUDGE;

    if (franchiseCount > originalCount) newFO += NUDGE;
    else if (originalCount > franchiseCount) newFO -= NUDGE;
  }

  const updatedCulture: StudioCulture = {
    ...current,
    prestigeVsCommercial: Math.max(0, Math.min(100, newPC)),
    franchiseOriginal: Math.max(0, Math.min(100, newFO)),
  };

  return [{
    type: 'SYSTEM_TICK' as unknown as 'STUDIO_CULTURE_UPDATED',
    payload: { studioCulture: updatedCulture },
  } as unknown as StateImpact];
}

/**
 * Returns a human-readable label for the studio's current identity.
 */
export function getIdentityLabel(culture: StudioCulture): string {
  const pc = culture.prestigeVsCommercial;
  const fo = culture.franchiseOriginal;

  if (pc > 70 && fo < 30) return 'Auteur Studio';
  if (pc > 70 && fo > 70) return 'Prestige Franchise Factory';
  if (pc < 30 && fo > 70) return 'Blockbuster Machine';
  if (pc < 30 && fo < 30) return 'Genre Indie';
  return 'Balanced Studio';
}
