/**
 * MacroCycle — industry-wide heat index + shock events.
 *
 * Pure / deterministic: given a week number, returns a multiplier in roughly
 * [0.55, 1.45] that modulates revenue, M&A probability, and pitch rate.
 *
 * The cycle stacks three forces:
 *   - a long ~60-week wage/budget inflation trend (handled in budgetInflation)
 *   - an 8.5-year boom/bust sine (primary cycle)
 *   - a 3.7-year secondary oscillation (short-term noise)
 *   - scheduled historical/future shocks (DVD peak, 2008, COVID, 2023 strike,
 *     projected AI-cost collapse 2033, platform consolidation 2040, etc.)
 *
 * Week 0 corresponds to sim year 1 (interpreted as ~1975 for historical feel).
 * Years mentioned below are sim-relative: year = week/52 + 1975.
 */

const WEEKS_PER_YEAR = 52;

import { getDifficultyParams } from '@/store/settingsStore';

interface Shock {
  startWeek: number;
  endWeek: number;
  magnitude: number; // multiplicative (e.g. 0.55 = -45%)
  label: string;
  // Which segments it affects — 'all' or tier/flag
  scope?: 'all' | 'theatrical' | 'ancillary';
}

// Sim-year to week helper: year 1 = week 0, year Y = (Y-1)*52
const y = (year: number) => Math.floor((year - 1) * WEEKS_PER_YEAR);

// Historical + projected shocks (sim year 1 ≈ 1975)
const SHOCKS: Shock[] = [
  // 2008 financial crisis → sim year 34
  { startWeek: y(34), endWeek: y(36), magnitude: 0.72, label: 'Global financial crisis', scope: 'all' },
  // 2019-20 COVID theatrical collapse → sim year 45-46
  { startWeek: y(45), endWeek: y(47), magnitude: 0.35, label: 'Pandemic theatrical shutdown', scope: 'theatrical' },
  // 2023 strike + streaming correction → sim year 49
  { startWeek: y(49), endWeek: y(50), magnitude: 0.70, label: 'Writers/actors strike + streaming correction', scope: 'all' },
  // Projected AI cost collapse + volume boom → sim year 58-60
  { startWeek: y(58), endWeek: y(60), magnitude: 1.25, label: 'AI production boom', scope: 'all' },
  // Projected platform consolidation wave → sim year 66
  { startWeek: y(66), endWeek: y(68), magnitude: 0.78, label: 'Platform consolidation shakeout', scope: 'all' },
];

/** Primary market heat index. Range ~[0.6, 1.4]. */
export function getMarketHeat(week: number, difficulty: 'relaxed' | 'standard' | 'cutthroat' = 'standard'): number {
  const primary = Math.sin((week / (WEEKS_PER_YEAR * 8.5)) * Math.PI * 2) * 0.28;
  const secondary = Math.sin((week / (WEEKS_PER_YEAR * 3.7)) * Math.PI * 2) * 0.10;
  let heat = 1.0 + primary + secondary;

  for (const s of SHOCKS) {
    if (week >= s.startWeek && week <= s.endWeek) {
      heat *= s.magnitude;
    }
  }

  // Difficulty scales the boom/bust amplitude (Design Bible §33.3).
  const { heatMultiplier } = getDifficultyParams(difficulty);
  // Pull heat toward 1.0 by the inverse of the multiplier so relaxed flattens,
  // cutthroat amplifies the deviation from the mean.
  heat = 1.0 + (heat - 1.0) * heatMultiplier;

  // Clamp: hard floor/ceiling so a stacked trough doesn't zero revenue.
  return Math.max(0.45, Math.min(1.55, heat));
}

/** Classify current regime so other systems can branch on it. */
export type MarketRegime = 'boom' | 'normal' | 'bust' | 'shock';
export function getMarketRegime(week: number): MarketRegime {
  const activeShock = SHOCKS.find(s => week >= s.startWeek && week <= s.endWeek);
  if (activeShock) return 'shock';
  const heat = getMarketHeat(week);
  if (heat > 1.15) return 'boom';
  if (heat < 0.85) return 'bust';
  return 'normal';
}

/** Active shock label, or null. */
export function getActiveShock(week: number): string | null {
  const s = SHOCKS.find(sh => week >= sh.startWeek && week <= sh.endWeek);
  return s ? s.label : null;
}

/**
 * Budget inflation: ~3.5%/year compound. Returned as a multiplier on baseline
 * costs. Year 0 = 1.0; year 50 ≈ 5.6x. The simulation currently uses fixed
 * dollar budgets so this is applied at release-cost normalization points.
 */
export function getBudgetInflation(week: number): number {
  const years = week / WEEKS_PER_YEAR;
  return Math.pow(1.035, years);
}

/**
 * Ancillary-revenue curve: models the DVD bubble — peaks ~sim year 22 (1997),
 * collapses to near-zero by sim year 40 (2015). Streaming partially refills
 * but at lower margin, modeled as a flat 0.25 tail from year 40 on.
 */
export function getAncillaryMultiplier(week: number): number {
  const year = week / WEEKS_PER_YEAR;
  if (year < 5) return 0.15;
  if (year < 22) return 0.15 + ((year - 5) / 17) * 0.35; // ramps to 0.5
  if (year < 40) return 0.5 - ((year - 22) / 18) * 0.45; // collapses to 0.05
  return 0.25; // streaming-era flat, lower margin ceiling
}

/**
 * Bankruptcy threshold check — cash sustained below floor for 52+ weeks.
 * Caller tracks the streak; this just returns the cash floor.
 */
export const BANKRUPTCY_CASH_FLOOR = -500_000_000;
export const BANKRUPTCY_WEEKS_REQUIRED = 52;
