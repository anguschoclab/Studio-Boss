import { GameState, StateImpact } from '@/engine/types';

/**
 * StudioIdentitySystem
 *
 * Tracks two strategic axes for the studio:
 *   prestigeCommercial — 0 = pure commercial, 100 = pure prestige/art
 *   franchiseOriginal  — 0 = pure originals, 100 = pure franchise
 *
 * Both axes shift weekly based on recent releases (last 26 weeks).
 */

export interface StudioIdentityAxes {
  prestigeCommercial: number; // 0-100
  franchiseOriginal: number;  // 0-100
}

const DEFAULT_AXES: StudioIdentityAxes = {
  prestigeCommercial: 50,
  franchiseOriginal: 50,
};

const NUDGE = 2; // Points shifted per week
const WINDOW = 26; // Weeks of history to evaluate

/**
 * Called weekly — adjusts identity axes based on recent releases then returns
 * a SYSTEM_TICK impact carrying the updated axes in payload.studioIdentity.
 */
export function tickStudioIdentity(state: GameState): StateImpact[] {
  const current: StudioIdentityAxes = {
    ...DEFAULT_AXES,
    ...((state.studio as any).identity ?? {}),
  };

  const currentWeek = state.week;
  const recentReleases = Object.values(state.entities.projects).filter(
    (p) =>
      p.state === 'released' &&
      p.releaseWeek !== null &&
      p.releaseWeek > currentWeek - WINDOW,
  );

  if (recentReleases.length === 0) {
    // No recent releases — gently drift toward centre
    const driftPC = current.prestigeCommercial > 50 ? -1 : current.prestigeCommercial < 50 ? 1 : 0;
    const driftFO = current.franchiseOriginal > 50 ? -1 : current.franchiseOriginal < 50 ? 1 : 0;
    return [buildImpact(clampAxes({ prestigeCommercial: current.prestigeCommercial + driftPC, franchiseOriginal: current.franchiseOriginal + driftFO }))];
  }

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

  let newPC = current.prestigeCommercial;
  if (prestigeCount > commercialCount) newPC += NUDGE;
  else if (commercialCount > prestigeCount) newPC -= NUDGE;

  // --- Franchise vs Original ---
  let franchiseCount = 0;
  let originalCount = 0;
  for (const p of recentReleases) {
    if (p.franchiseId) franchiseCount += 1;
    else originalCount += 1;
  }

  let newFO = current.franchiseOriginal;
  if (franchiseCount > originalCount) newFO += NUDGE;
  else if (originalCount > franchiseCount) newFO -= NUDGE;

  const updated = clampAxes({ prestigeCommercial: newPC, franchiseOriginal: newFO });
  return [buildImpact(updated)];
}

/**
 * Returns a human-readable label for the studio's current identity.
 */
export function getIdentityLabel(axes: StudioIdentityAxes): string {
  const { prestigeCommercial, franchiseOriginal } = axes;

  if (prestigeCommercial > 70 && franchiseOriginal < 30) return 'Auteur Studio';
  if (prestigeCommercial > 70 && franchiseOriginal > 70) return 'Prestige Franchise Factory';
  if (prestigeCommercial < 30 && franchiseOriginal > 70) return 'Blockbuster Machine';
  if (prestigeCommercial < 30 && franchiseOriginal < 30) return 'Genre Indie';
  return 'Balanced Studio';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampAxes(axes: StudioIdentityAxes): StudioIdentityAxes {
  return {
    prestigeCommercial: Math.max(0, Math.min(100, axes.prestigeCommercial)),
    franchiseOriginal: Math.max(0, Math.min(100, axes.franchiseOriginal)),
  };
}

function buildImpact(studioIdentity: StudioIdentityAxes): StateImpact {
  return {
    type: 'SYSTEM_TICK' as any,
    payload: { studioIdentity },
  } as StateImpact;
}
