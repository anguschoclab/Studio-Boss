import { Project, Buyer, StreamingViewershipEntry, StreamingViewershipHistory } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Tracks streaming viewership for projects distributed to streaming platforms.
 * Uses real-world streaming metrics: binge vs weekly release patterns, completion rates.
 */
export class StreamingViewershipTracker {
  /**
   * Initialize viewership tracking when a project goes to streaming.
   */
  static initializeViewership(
    project: Project,
    platformId: string,
    platform: Buyer,
    currentWeek: number,
    rng: RandomGenerator
  ): StreamingViewershipHistory {
    const quality = project.reviewScore || 50;
    const buzz = project.buzz || 50;
    const platformReach = (platform as any).subscribers || 10_000_000;
    
    // Initial viewership estimate based on quality, buzz, and platform reach
    const initialViewers = Math.round(
      platformReach * 
      (quality / 100) * 
      (buzz / 100) * 
      0.05 // 5% of platform subscribers tune in week 1
    );
    
    const initialEntry: StreamingViewershipEntry = {
      week: currentWeek,
      hoursWatched: Math.round(initialViewers * 2.5), // Avg 2.5 hours per viewer
      uniqueViewers: initialViewers,
      completionRate: this.calculateInitialCompletionRate(quality, project.genre),
      dropoffRate: 0,
      platform: platformId
    };
    
    return {
      platform: platformId,
      entries: [initialEntry],
      totalHoursWatched: initialEntry.hoursWatched,
      peakViewers: initialViewers,
      peakWeek: currentWeek,
      averageCompletionRate: initialEntry.completionRate
    };
  }
  
  /**
   * Update weekly viewership for a streaming project.
   * Called in the finance tick for all released streaming projects.
   */
  static updateViewership(
    history: StreamingViewershipHistory,
    currentWeek: number,
    project: Project,
    rng: RandomGenerator
  ): StreamingViewershipHistory {
    const entries = [...history.entries];
    const lastEntry = entries[entries.length - 1];
    
    // Weeks since release
    const weeksSinceRelease = currentWeek - entries[0].week;
    
    // Decay pattern: streaming has longer tail than theatrical
    const decayFactor = this.calculateStreamingDecay(weeksSinceRelease, project);
    
    // Completion rate improves over time (word-of-mouth)
    const completionTrend = this.calculateCompletionTrend(weeksSinceRelease, lastEntry.completionRate);
    
    const newViewers = Math.max(
      Math.round(lastEntry.uniqueViewers * decayFactor),
      Math.round(lastEntry.uniqueViewers * 0.3) // Never below 30% of peak
    );
    
    const dropoffRate = lastEntry.uniqueViewers > 0
      ? ((lastEntry.uniqueViewers - newViewers) / lastEntry.uniqueViewers) * 100
      : 0;
    
    const newEntry: StreamingViewershipEntry = {
      week: currentWeek,
      hoursWatched: Math.round(newViewers * 2.5 * completionTrend),
      uniqueViewers: newViewers,
      completionRate: completionTrend,
      dropoffRate,
      platform: history.platform
    };
    
    entries.push(newEntry);
    
    // Update aggregates
    const totalHours = entries.reduce((sum, e) => sum + e.hoursWatched, 0);
    const peakEntry = entries.reduce((max, e) => e.uniqueViewers > max.uniqueViewers ? e : max, entries[0]);
    const avgCompletion = entries.reduce((sum, e) => sum + e.completionRate, 0) / entries.length;
    
    return {
      platform: history.platform,
      entries,
      totalHoursWatched: totalHours,
      peakViewers: peakEntry.uniqueViewers,
      peakWeek: peakEntry.week,
      averageCompletionRate: Math.round(avgCompletion)
    };
  }
  
  /**
   * Calculate streaming decay based on weeks since release.
   * Streaming has longer tail than theatrical (binge watching).
   */
  private static calculateStreamingDecay(weeksSinceRelease: number, project: Project): number {
    // Binge releases: sharp drop after week 1-2, then long tail
    const isBinge = (project as any).releaseModel === 'binge';
    
    if (isBinge) {
      if (weeksSinceRelease === 1) return 0.5; // 50% drop week 2
      if (weeksSinceRelease === 2) return 0.7; // 30% drop week 3
      if (weeksSinceRelease <= 4) return 0.85; // Gradual decay
      return 0.95; // Long tail
    }
    
    // Weekly releases: more gradual decay
    if (weeksSinceRelease === 1) return 0.8;
    if (weeksSinceRelease <= 4) return 0.9;
    return 0.95;
  }
  
  /**
   * Calculate initial completion rate based on quality and genre.
   * High-quality dramas have higher completion rates.
   */
  private static calculateInitialCompletionRate(quality: number, genre: string): number {
    let base = quality * 0.8; // Quality is primary driver
    
    const genreLower = genre.toLowerCase();
    if (['drama', 'thriller', 'crime'].includes(genreLower)) {
      base += 10; // Drama genres have higher completion
    }
    if (['comedy', 'animation', 'family'].includes(genreLower)) {
      base -= 5; // Lighter content may be sampled more
    }
    
    return Math.min(95, Math.max(20, base));
  }
  
  /**
   * Calculate completion rate trend over time.
   * Word-of-mouth improves completion for good shows.
   */
  private static calculateCompletionTrend(weeksSinceRelease: number, currentRate: number): number {
    if (weeksSinceRelease <= 2) return currentRate;
    
    // Gradual improvement due to word-of-mouth
    const improvement = Math.min(5, weeksSinceRelease * 0.5);
    return Math.min(95, currentRate + improvement);
  }
}
