import { SeriesProject, Project } from '@/engine/types/project.types';
import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Nielsen-style TV Ratings System.
 * Simulates demographic viewership, share vs rating, time slots, and weekly rankings.
 */

// --- Time Slot System ---
export type TimeSlot = 
  | 'SUN_2000' | 'SUN_2100' | 'SUN_2200'
  | 'MON_2000' | 'MON_2100' | 'MON_2200'
  | 'TUE_2000' | 'TUE_2100' | 'TUE_2200'
  | 'WED_2000' | 'WED_2100' | 'WED_2200'
  | 'THU_2000' | 'THU_2100' | 'THU_2200'
  | 'FRI_2000' | 'FRI_2100' | 'FRI_2200'
  | 'SAT_2000' | 'SAT_2100' | 'SAT_2200'
  | 'LATE_NIGHT' | 'DAYTIME' | 'STREAMING_BINGE' | 'STREAMING_WEEKLY';

export interface TimeSlotConfig {
  id: TimeSlot;
  label: string;
  baseHouseholds: number; // Millions of households watching TV at this time (HUT)
  primeTimeMultiplier: number;
  demographics: Record<NielsenDemographic, number>; // Weight of each demo at this slot
}

export const TIME_SLOTS: Record<TimeSlot, TimeSlotConfig> = {
  'SUN_2000': { id: 'SUN_2000', label: 'Sun 8:00 PM', baseHouseholds: 48, primeTimeMultiplier: 1.1, demographics: { 'P2+': 1.1, 'A18-49': 0.9, 'A25-54': 1.0, 'A18-34': 0.8, 'W18-49': 1.0, 'M18-49': 0.8, 'K2-11': 1.4, 'T12-17': 1.2 } },
  'SUN_2100': { id: 'SUN_2100', label: 'Sun 9:00 PM', baseHouseholds: 52, primeTimeMultiplier: 1.2, demographics: { 'P2+': 1.0, 'A18-49': 1.3, 'A25-54': 1.2, 'A18-34': 1.1, 'W18-49': 1.2, 'M18-49': 1.4, 'K2-11': 0.4, 'T12-17': 0.8 } },
  'SUN_2200': { id: 'SUN_2200', label: 'Sun 10:00 PM', baseHouseholds: 42, primeTimeMultiplier: 1.1, demographics: { 'P2+': 0.9, 'A18-49': 1.1, 'A25-54': 1.3, 'A18-34': 0.8, 'W18-49': 1.1, 'M18-49': 1.0, 'K2-11': 0.1, 'T12-17': 0.4 } },
  'MON_2100': { id: 'MON_2100', label: 'Mon 9:00 PM', baseHouseholds: 55, primeTimeMultiplier: 1.3, demographics: { 'P2+': 1.0, 'A18-49': 1.4, 'A25-54': 1.1, 'A18-34': 1.2, 'W18-49': 1.0, 'M18-49': 1.5, 'K2-11': 0.3, 'T12-17': 0.7 } },
  'THU_2100': { id: 'THU_2100', label: 'Thu 9:00 PM', baseHouseholds: 50, primeTimeMultiplier: 1.2, demographics: { 'P2+': 1.0, 'A18-49': 1.3, 'A25-54': 1.1, 'A18-34': 1.3, 'W18-49': 1.2, 'M18-49': 1.2, 'K2-11': 0.4, 'T12-17': 0.9 } },
  // ... Fillers for other slots to satisfy the Record<TimeSlot, TimeSlotConfig>
  'MON_2000': { id: 'MON_2000', label: 'Mon 8:00 PM', baseHouseholds: 40, primeTimeMultiplier: 1.0, demographics: { 'P2+': 1.0, 'A18-49': 0.8, 'A25-54': 0.9, 'A18-34': 1.0, 'W18-49': 1.0, 'M18-49': 0.7, 'K2-11': 1.1, 'T12-17': 1.0 } },
  'MON_2200': { id: 'MON_2200', label: 'Mon 10:00 PM', baseHouseholds: 35, primeTimeMultiplier: 0.9, demographics: { 'P2+': 0.9, 'A18-49': 1.0, 'A25-54': 1.2, 'A18-34': 0.8, 'W18-49': 1.1, 'M18-49': 0.9, 'K2-11': 0.1, 'T12-17': 0.4 } },
  'TUE_2000': { id: 'TUE_2000', label: 'Tue 8:00 PM', baseHouseholds: 38, primeTimeMultiplier: 1.0, demographics: { 'P2+': 1.0, 'A18-49': 0.8, 'A25-54': 0.9, 'A18-34': 0.9, 'W18-49': 1.0, 'M18-49': 0.7, 'K2-11': 1.2, 'T12-17': 1.1 } },
  'TUE_2100': { id: 'TUE_2100', label: 'Tue 9:00 PM', baseHouseholds: 42, primeTimeMultiplier: 1.1, demographics: { 'P2+': 1.0, 'A18-49': 1.2, 'A25-54': 1.1, 'A18-34': 1.1, 'W18-49': 1.1, 'M18-49': 1.2, 'K2-11': 0.4, 'T12-17': 0.8 } },
  'TUE_2200': { id: 'TUE_2200', label: 'Tue 10:00 PM', baseHouseholds: 36, primeTimeMultiplier: 1.0, demographics: { 'P2+': 0.9, 'A18-49': 1.0, 'A25-54': 1.2, 'A18-34': 0.8, 'W18-49': 1.1, 'M18-49': 1.0, 'K2-11': 0.1, 'T12-17': 0.5 } },
  'WED_2000': { id: 'WED_2000', label: 'Wed 8:00 PM', baseHouseholds: 40, primeTimeMultiplier: 1.0, demographics: { 'P2+': 1.0, 'A18-49': 0.9, 'A25-54': 1.0, 'A18-34': 0.9, 'W18-49': 1.0, 'M18-49': 0.8, 'K2-11': 1.3, 'T12-17': 1.2 } },
  'WED_2100': { id: 'WED_2100', label: 'Wed 9:00 PM', baseHouseholds: 45, primeTimeMultiplier: 1.1, demographics: { 'P2+': 1.0, 'A18-49': 1.2, 'A25-54': 1.1, 'A18-34': 1.2, 'W18-49': 1.1, 'M18-49': 1.3, 'K2-11': 0.5, 'T12-17': 0.9 } },
  'WED_2200': { id: 'WED_2200', label: 'Wed 10:00 PM', baseHouseholds: 38, primeTimeMultiplier: 1.0, demographics: { 'P2+': 0.9, 'A18-49': 1.1, 'A25-54': 1.3, 'A18-34': 0.8, 'W18-49': 1.1, 'M18-49': 1.0, 'K2-11': 0.1, 'T12-17': 0.5 } },
  'THU_2000': { id: 'THU_2000', label: 'Thu 8:00 PM', baseHouseholds: 42, primeTimeMultiplier: 1.0, demographics: { 'P2+': 1.0, 'A18-49': 0.8, 'A25-54': 0.9, 'A18-34': 0.9, 'W18-49': 1.0, 'M18-49': 0.7, 'K2-11': 1.4, 'T12-17': 1.3 } },
  'THU_2200': { id: 'THU_2200', label: 'Thu 10:00 PM', baseHouseholds: 40, primeTimeMultiplier: 1.1, demographics: { 'P2+': 0.9, 'A18-49': 1.1, 'A25-54': 1.3, 'A18-34': 0.9, 'W18-49': 1.1, 'M18-49': 1.1, 'K2-11': 0.1, 'T12-17': 0.4 } },
  'FRI_2000': { id: 'FRI_2000', label: 'Fri 8:00 PM', baseHouseholds: 35, primeTimeMultiplier: 0.9, demographics: { 'P2+': 1.0, 'A18-49': 0.7, 'A25-54': 0.8, 'A18-34': 0.9, 'W18-49': 0.9, 'M18-49': 0.6, 'K2-11': 1.5, 'T12-17': 1.4 } },
  'FRI_2100': { id: 'FRI_2100', label: 'Fri 9:00 PM', baseHouseholds: 30, primeTimeMultiplier: 0.8, demographics: { 'P2+': 0.9, 'A18-49': 0.8, 'A25-54': 0.9, 'A18-34': 1.0, 'W18-49': 1.0, 'M18-49': 1.0, 'K2-11': 0.5, 'T12-17': 0.9 } },
  'FRI_2200': { id: 'FRI_2200', label: 'Fri 10:00 PM', baseHouseholds: 25, primeTimeMultiplier: 0.7, demographics: { 'P2+': 0.8, 'A18-49': 0.9, 'A25-54': 1.0, 'A18-34': 1.1, 'W18-49': 1.0, 'M18-49': 1.2, 'K2-11': 0.1, 'T12-17': 0.6 } },
  'SAT_2000': { id: 'SAT_2000', label: 'Sat 8:00 PM', baseHouseholds: 32, primeTimeMultiplier: 0.8, demographics: { 'P2+': 1.0, 'A18-49': 0.6, 'A25-54': 0.7, 'A18-34': 0.5, 'W18-49': 0.7, 'M18-49': 0.5, 'K2-11': 1.8, 'T12-17': 1.5 } },
  'SAT_2100': { id: 'SAT_2100', label: 'Sat 9:00 PM', baseHouseholds: 28, primeTimeMultiplier: 0.7, demographics: { 'P2+': 0.9, 'A18-49': 0.7, 'A25-54': 0.8, 'A18-34': 0.6, 'W18-49': 0.8, 'M18-49': 0.6, 'K2-11': 1.2, 'T12-17': 1.3 } },
  'SAT_2200': { id: 'SAT_2200', label: 'Sat 10:00 PM', baseHouseholds: 25, primeTimeMultiplier: 0.6, demographics: { 'P2+': 0.8, 'A18-49': 0.8, 'A25-54': 1.0, 'A18-34': 0.7, 'W18-49': 0.9, 'M18-49': 0.7, 'K2-11': 0.1, 'T12-17': 0.5 } },
  'LATE_NIGHT': { id: 'LATE_NIGHT', label: 'Late Night', baseHouseholds: 20, primeTimeMultiplier: 0.6, demographics: { 'P2+': 0.6, 'A18-49': 1.1, 'A25-54': 0.8, 'A18-34': 1.4, 'W18-49': 0.9, 'M18-49': 1.3, 'K2-11': 0.05, 'T12-17': 0.6 } },
  'DAYTIME': { id: 'DAYTIME', label: 'Daytime', baseHouseholds: 15, primeTimeMultiplier: 0.4, demographics: { 'P2+': 0.7, 'A18-49': 0.5, 'A25-54': 0.7, 'A18-34': 0.3, 'W18-49': 0.9, 'M18-49': 0.3, 'K2-11': 0.8, 'T12-17': 0.4 } },
  'STREAMING_BINGE': { id: 'STREAMING_BINGE', label: 'Streaming (Binge)', baseHouseholds: 65, primeTimeMultiplier: 0.9, demographics: { 'P2+': 0.9, 'A18-49': 1.5, 'A25-54': 1.2, 'A18-34': 1.7, 'W18-49': 1.3, 'M18-49': 1.4, 'K2-11': 0.5, 'T12-17': 1.2 } },
  'STREAMING_WEEKLY': { id: 'STREAMING_WEEKLY', label: 'Streaming (Weekly)', baseHouseholds: 60, primeTimeMultiplier: 0.85, demographics: { 'P2+': 0.9, 'A18-49': 1.4, 'A25-54': 1.1, 'A18-34': 1.6, 'W18-49': 1.2, 'M18-49': 1.3, 'K2-11': 0.6, 'T12-17': 1.3 } },
};

// --- Demographic System ---
export type NielsenDemographic = 'P2+' | 'A18-49' | 'A25-54' | 'A18-34' | 'W18-49' | 'M18-49' | 'K2-11' | 'T12-17';

export interface DemoRating {
  demo: NielsenDemographic;
  label: string;
  rating: number;   // % of that demographic watching (e.g., 2.5 = 2.5% of all A18-49 households)
  viewers: number;  // Raw viewer count in millions
}

export interface NielsenSnapshot {
  week: number;
  episodeNumber: number;
  householdRating: number;    // Overall household rating (% of all TV households)
  householdShare: number;     // Share (% of households watching TV at that time)
  totalViewers: number;       // In millions
  demoRatings: DemoRating[];
  keyDemo: number;            // A18-49 rating (the "money demo")
  timeSlot: TimeSlot;
  rank: number;               // Weekly rank among all shows
  trend: 'UP' | 'DOWN' | 'STABLE' | 'PREMIERE' | 'FINALE';
  liveSDViewers: number;      // Live + Same Day
  live7Viewers: number;       // Live + 7 day (DVR/streaming catch-up)
}

export interface NielsenProfile {
  snapshots: NielsenSnapshot[];
  seasonAvgHH: number;        // Season average household rating
  seasonAvgKeyDemo: number;   // Season average A18-49
  seasonAvgViewers: number;   // Season average total viewers (millions)
  timeSlot: TimeSlot;
  peakViewers: number;
  peakWeek: number;
  audienceRetention: number;  // % retained from premiere to latest
  dvrLift: number;            // % increase from L+SD to L+7
}

const DEMO_LABELS: Record<NielsenDemographic, string> = {
  'P2+': 'Total Viewers',
  'A18-49': 'Adults 18-49',
  'A25-54': 'Adults 25-54',
  'A18-34': 'Adults 18-34',
  'W18-49': 'Women 18-49',
  'M18-49': 'Men 18-49',
  'K2-11': 'Kids 2-11',
  'T12-17': 'Teens 12-17'
};

// --- Genre to Demographic Affinity ---
const GENRE_DEMO_AFFINITY: Record<string, Partial<Record<NielsenDemographic, number>>> = {
  'Drama': { 'A25-54': 1.3, 'W18-49': 1.2 },
  'Comedy': { 'A18-34': 1.3, 'A18-49': 1.2 },
  'Action': { 'M18-49': 1.4, 'A18-34': 1.2 },
  'Sci-Fi': { 'M18-49': 1.3, 'A18-34': 1.3 },
  'Horror': { 'A18-34': 1.4, 'T12-17': 1.2 },
  'Romance': { 'W18-49': 1.5, 'A18-34': 1.1 },
  'Family': { 'K2-11': 1.5, 'P2+': 1.2 },
  'Animation': { 'K2-11': 1.6, 'T12-17': 1.2 },
  'Crime': { 'A25-54': 1.4, 'M18-49': 1.2 },
  'Thriller': { 'A25-54': 1.2, 'M18-49': 1.3 },
  'Reality': { 'W18-49': 1.3, 'A18-34': 1.2, 'T12-17': 1.1 },
};

/**
 * Assign a time slot based on genre/format/budget.
 */
export function assignTimeSlot(project: SeriesProject): TimeSlot {
  if (project.distributionStatus === 'streaming') {
    return project.releaseModel === 'binge' ? 'STREAMING_BINGE' : 'STREAMING_WEEKLY';
  }
  
  const format = project.tvFormat || project.format;
  if (typeof format === 'string') {
    if (format.includes('late_night') || format.includes('sketch')) return 'LATE_NIGHT';
    if (format.includes('daytime') || format.includes('soap')) return 'DAYTIME';
  }

  // Prime Time Matrix Assignment
  if (project.genre === 'Drama' || project.genre === 'Crime') {
    if (project.budgetTier === 'blockbuster') return 'MON_2100'; // Tentpole Monday
    return 'SUN_2100'; // Prestige Sunday
  }
  
  if (project.genre === 'Family' || project.genre === 'Animation') {
    return 'SUN_2000'; // Family Sunday
  }

  if (project.genre === 'Comedy') {
    return 'THU_2100'; // Comedy Thursday
  }

  return 'TUE_2100'; // Default Midweek
}

/**
 * Calculate a full Nielsen snapshot for a single episode airing.
 */
export function calculateNielsenRatings(
  project: SeriesProject,
  episodeNumber: number,
  totalShows: number,
  rng: RandomGenerator
): NielsenSnapshot {
  const timeSlot: TimeSlot = (project as any).nielsenProfile?.timeSlot || assignTimeSlot(project);
  const slotConfig = TIME_SLOTS[timeSlot];
  const buzz = project.buzz || 50;
  const quality = project.reviewScore || 50;

  // Base household rating: buzz and quality driven
  const buzzFactor = (buzz / 100) * 6; // 0-6 rating points from buzz
  const qualityFactor = (quality / 100) * 4; // 0-4 from quality
  let baseHHRating = (buzzFactor + qualityFactor) * slotConfig.primeTimeMultiplier;

  // Premiere/Finale boosts
  const isPremiere = episodeNumber === 1;
  const isFinalWeek = episodeNumber >= (project.tvDetails?.episodesOrdered || 8);
  if (isPremiere) baseHHRating *= 1.3;
  if (isFinalWeek) baseHHRating *= 1.25;

  // Episode decay (mid-season dip)
  const midSeasonDip = episodeNumber > 2 && !isFinalWeek
    ? Math.pow(0.97, episodeNumber - 2)
    : 1.0;
  baseHHRating *= midSeasonDip;

  // Stochastic variance +/- 8%
  const variance = 0.92 + rng.next() * 0.16;
  baseHHRating *= variance;
  baseHHRating = Math.max(0.1, Math.round(baseHHRating * 100) / 100);

  // Share = rating / HUT level (% of TVs on)
  const hutLevel = 0.55 + rng.next() * 0.15; // 55-70% of households have TV on
  const share = Math.round((baseHHRating / (hutLevel * 100)) * 1000) / 10;

  // Total viewers (millions)
  const totalHouseholds = 131; // ~131M US TV households
  const totalViewers = Math.round((baseHHRating / 100) * totalHouseholds * 2.3 * 100) / 100; // 2.3 viewers per household avg

  // Demographic breakdowns
  const genreAffinity = GENRE_DEMO_AFFINITY[project.genre] || {};
  const demoRatings: DemoRating[] = (Object.keys(DEMO_LABELS) as NielsenDemographic[]).map(demo => {
    const slotWeight = slotConfig.demographics[demo] || 1.0;
    const genreWeight = genreAffinity[demo] || 1.0;
    const demoRating = baseHHRating * slotWeight * genreWeight * (0.9 + rng.next() * 0.2);
    const demoViewers = (demoRating / 100) * totalHouseholds * (demo === 'P2+' ? 2.3 : demo.startsWith('K') ? 0.4 : demo.startsWith('T') ? 0.3 : 0.8);
    return {
      demo,
      label: DEMO_LABELS[demo],
      rating: Math.round(demoRating * 100) / 100,
      viewers: Math.round(demoViewers * 100) / 100
    };
  });

  const keyDemo = demoRatings.find(d => d.demo === 'A18-49')?.rating || 0;

  // DVR/Streaming lift (L+7 is typically 30-60% higher)
  const dvrLiftPct = 0.3 + rng.next() * 0.3;
  const live7 = Math.round(totalViewers * (1 + dvrLiftPct) * 100) / 100;

  // Trend determination
  let trend: NielsenSnapshot['trend'] = 'STABLE';
  if (isPremiere) trend = 'PREMIERE';
  else if (isFinalWeek) trend = 'FINALE';
  else if (variance > 1.04) trend = 'UP';
  else if (variance < 0.96) trend = 'DOWN';

  return {
    week: 0, // Set by caller
    episodeNumber,
    householdRating: baseHHRating,
    householdShare: Math.max(1, share),
    totalViewers,
    demoRatings,
    keyDemo: Math.round(keyDemo * 100) / 100,
    timeSlot,
    rank: 0, // Computed after all shows are rated
    trend,
    liveSDViewers: totalViewers,
    live7Viewers: live7
  };
}

/**
 * Build/update the NielsenProfile from snapshot history.
 */
export function buildNielsenProfile(snapshots: NielsenSnapshot[], timeSlot: TimeSlot): NielsenProfile {
  if (snapshots.length === 0) {
    return {
      snapshots: [], seasonAvgHH: 0, seasonAvgKeyDemo: 0, seasonAvgViewers: 0,
      timeSlot, peakViewers: 0, peakWeek: 0, audienceRetention: 100, dvrLift: 0
    };
  }

  const avgHH = snapshots.reduce((s, snap) => s + snap.householdRating, 0) / snapshots.length;
  const avgDemo = snapshots.reduce((s, snap) => s + snap.keyDemo, 0) / snapshots.length;
  const avgViewers = snapshots.reduce((s, snap) => s + snap.totalViewers, 0) / snapshots.length;
  const peak = snapshots.reduce((best, snap) => snap.totalViewers > best.totalViewers ? snap : best, snapshots[0]);
  const premiere = snapshots[0];
  const latest = snapshots[snapshots.length - 1];
  const retention = premiere.totalViewers > 0 ? (latest.totalViewers / premiere.totalViewers) * 100 : 100;
  const avgDvrLift = snapshots.reduce((s, snap) => s + ((snap.live7Viewers - snap.liveSDViewers) / Math.max(snap.liveSDViewers, 0.1)), 0) / snapshots.length * 100;

  return {
    snapshots,
    seasonAvgHH: Math.round(avgHH * 100) / 100,
    seasonAvgKeyDemo: Math.round(avgDemo * 100) / 100,
    seasonAvgViewers: Math.round(avgViewers * 100) / 100,
    timeSlot,
    peakViewers: peak.totalViewers,
    peakWeek: peak.week,
    audienceRetention: Math.round(retention),
    dvrLift: Math.round(avgDvrLift)
  };
}

/**
 * Rank all airing shows by A18-49 demo rating for the week.
 * Returns updated snapshots with rank fields filled in.
 */
export function rankShows(snapshots: Map<string, NielsenSnapshot>): Map<string, NielsenSnapshot> {
  const entries = Array.from(snapshots.entries());
  entries.sort((a, b) => b[1].keyDemo - a[1].keyDemo);
  const ranked = new Map<string, NielsenSnapshot>();
  entries.forEach(([id, snap], idx) => {
    ranked.set(id, { ...snap, rank: idx + 1 });
  });
  return ranked;
}
