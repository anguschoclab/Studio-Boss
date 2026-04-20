import { Project, Buyer } from '@/engine/types';
import { StreamingViewershipHistory } from '@/engine/types/project.types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Tracks streaming viewership for projects distributed to streaming platforms.
 * Uses real-world streaming metrics: binge vs weekly release patterns, completion rates.
 */
export const StreamingViewershipTracker = {
  /**
   * Initialize viewership tracking when a project goes to streaming.
   */
  initializeViewership(
    project: Project,
    platformId: string,
    platform: Buyer,
    currentWeek: number,
    rng: RandomGenerator
  ): StreamingViewershipHistory {
    const quality = project.reviewScore || 50;
    const buzz = project.buzz || 0;
    
    // Initial viewership is driven by platform market share and project buzz
    const platformPotential = platform.marketShare * 1000000; // Base: 1M per 100% share
    const buzzMultiplier = 1.0 + (buzz / 100);
    const initialViewers = Math.round(platformPotential * buzzMultiplier * (0.8 + rng.next() * 0.4));

    return {
      platformId,
      platformName: platform.name,
      startWeek: currentWeek,
      totalHoursWatched: 0,
      peakViewers: initialViewers,
      completionRate: this.calculateInitialCompletionRate(quality, project.genre || 'Action'),
      entries: [
        {
          week: currentWeek,
          viewers: initialViewers,
          hoursWatched: initialViewers * 4, // Assume average 4 hours per viewer in first week
          retention: 1.0
        }
      ]
    };
  },

  /**
   * Update weekly viewership for a streaming project.
   * Called in the finance tick for all released streaming projects.
   */
  updateViewership(
    history: StreamingViewershipHistory,
    currentWeek: number,
    project: Project,
    rng: RandomGenerator
  ): StreamingViewershipHistory {
    const weeksSinceRelease = currentWeek - history.startWeek;
    if (weeksSinceRelease <= 0) return history;

    const lastEntry = history.entries[history.entries.length - 1];
    const decay = this.calculateStreamingDecay(weeksSinceRelease, project);
    
    // Quality affects decay (better shows decay slower)
    const quality = project.reviewScore || 50;
    const qualityFactor = 1.0 + (quality - 50) / 200; // ±25%
    
    const newViewers = Math.round(lastEntry.viewers * decay * qualityFactor * (0.9 + rng.next() * 0.2));
    const retention = Math.min(1.0, decay * qualityFactor);
    
    // Completion rate improves slightly over time for good shows
    const newCompletionRate = this.calculateCompletionTrend(weeksSinceRelease, history.completionRate);

    const hoursPerViewer = 2 + (newCompletionRate / 50); // More completion = more hours
    const hoursWatched = newViewers * hoursPerViewer;

    const newEntry = {
      week: currentWeek,
      viewers: newViewers,
      hoursWatched: Math.round(hoursWatched),
      retention
    };

    return {
      ...history,
      totalHoursWatched: history.totalHoursWatched + newEntry.hoursWatched,
      peakViewers: Math.max(history.peakViewers, newViewers),
      completionRate: newCompletionRate,
      entries: [...history.entries, newEntry]
    };
  },

  /**
   * Calculate streaming decay based on weeks since release.
   * Streaming has longer tail than theatrical (binge watching).
   */
  calculateStreamingDecay(weeksSinceRelease: number, project: Project): number {
    // Binge releases: sharp drop after week 1-2, then long tail
    const isBinge = (project as any).releaseModel === 'binge';
    
    if (weeksSinceRelease === 1) return isBinge ? 0.7 : 0.9;
    if (weeksSinceRelease === 2) return isBinge ? 0.5 : 0.85;
    if (weeksSinceRelease <= 4) return 0.8;
    if (weeksSinceRelease <= 8) return 0.9; // Long tail stabilization
    
    return 0.95; // Very slow decay after 2 months
  },

  /**
   * Calculate initial completion rate based on quality and genre.
   * High-quality dramas have higher completion rates.
   */
  calculateInitialCompletionRate(quality: number, genre: string): number {
    let base = quality * 0.8; // Quality is primary driver
    
    const genreLower = genre.toLowerCase();
    if (genreLower.includes('drama') || genreLower.includes('thriller')) base += 10;
    if (genreLower.includes('comedy')) base += 5;
    if (genreLower.includes('horror')) base -= 5;
    
    return Math.min(95, Math.max(10, base));
  },

  /**
   * Calculate completion rate trend over time.
   * Word-of-mouth improves completion for good shows.
   */
  calculateCompletionTrend(weeksSinceRelease: number, currentRate: number): number {
    if (weeksSinceRelease <= 2) return currentRate;
    
    // Gradual improvement due to word-of-mouth
    const improvement = currentRate > 70 ? 0.5 : -0.2;
    return Math.min(95, currentRate + improvement);
  }
};
