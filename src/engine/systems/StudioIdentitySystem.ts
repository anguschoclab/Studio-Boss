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
  const recentReleases = Object.values(state.entities.projects).filter(
    (p) =>
      p.state === 'released' &&
      p.releaseWeek !== null &&
      p.releaseWeek > currentWeek - WINDOW,
  );

  let newPC = current.prestigeVsCommercial;
  let newFO = current.franchiseOriginal;

  if (recentReleases.length === 0) {
    // No recent releases — gently drift toward centre
    const driftPC = newPC > 50 ? -1 : newPC < 50 ? 1 : 0;
    const driftFO = newFO > 50 ? -1 : newFO < 50 ? 1 : 0;
    newPC += driftPC;
    newFO += driftFO;
  } else {
    // --- Prestige vs Commercial ---
    let prestigeCount = 0;
    let commercialCount = 0;
    for (const p of recentReleases) {
      const isAwardsPush = p.marketingAngle === 'AWARDS_PUSH';
      const reviewHigh = (p.reviewScore ?? 0) > 75;
      const lowBudget = p.budget < 20_000_000;
      const highBudget = p.budget > 80_000_000;
      const spectacle = p.marketingAngle === 'SELL_THE_SPECTACLE';

      if (isAwardsPush || reviewHigh || lowBudget) prestigeCount += 1;
      if (highBudget || spectacle) commercialCount += 1;
    }

    if (prestigeCount > commercialCount) newPC += NUDGE;
    else if (commercialCount > prestigeCount) newPC -= NUDGE;

    // --- Franchise vs Original ---
    let franchiseCount = 0;
    let originalCount = 0;
    for (const p of recentReleases) {
      if (p.franchiseId) franchiseCount += 1;
      else originalCount += 1;
    }

    if (franchiseCount > originalCount) newFO += NUDGE;
    else if (originalCount > franchiseCount) newFO -= NUDGE;
  }

  const updatedCulture: StudioCulture = {
    ...current,
    prestigeVsCommercial: Math.max(0, Math.min(100, newPC)),
    franchiseOriginal: Math.max(0, Math.min(100, newFO)),
  };

  return [{
    type: 'SYSTEM_TICK' as any,
    payload: { studioCulture: updatedCulture },
  } as StateImpact];
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
