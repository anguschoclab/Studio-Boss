import { describe, it, expect } from 'vitest';
import { StreamingViewershipTracker } from '@/engine/systems/production/StreamingViewershipTracker';
import { Project } from '@/engine/types';

describe('StreamingViewershipTracker', () => {
  it('initializes viewership with realistic values', () => {
    const project: Partial<Project> = {
      reviewScore: 75,
      buzz: 80,
      genre: 'Drama'
    };
    
    const platform = {
      id: 'netflix',
      name: 'Netflix',
      archetype: 'streamer' as const,
      marketShare: 0.3,
      reach: 90,
      subscribers: 200_000_000,
      churnRate: 0.05,
      contentLibraryQuality: 75,
      marketingSpend: 5000000,
      subscriberHistory: [],
      activeLicenses: [],
      foundedWeek: 1
    };
    
    const history = StreamingViewershipTracker.initializeViewership(
      project as Project, 'netflix', platform, 1, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any
    );
    
    expect(history.entries.length).toBe(1);
    expect(history.entries[0].uniqueViewers).toBeGreaterThan(0);
    expect(history.peakViewers).toBe(history.entries[0].uniqueViewers);
    expect(history.platform).toBe('netflix');
  });
  
  it('applies decay pattern correctly for binge releases', () => {
    const history: any = {
      platform: 'netflix',
      entries: [{ week: 1, uniqueViewers: 1000000, hoursWatched: 2500000, completionRate: 70, dropoffRate: 0, platform: 'netflix' }],
      totalHoursWatched: 2500000,
      peakViewers: 1000000,
      peakWeek: 1,
      averageCompletionRate: 70
    };
    
    const project: Partial<Project> = {
      releaseModel: 'binge',
      genre: 'Drama'
    };
    
    const updated = StreamingViewershipTracker.updateViewership(
      history, 2, project as Project, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any
    );
    
    expect(updated.entries[1].uniqueViewers).toBeLessThan(1000000); // Decay applied
    expect(updated.entries[1].dropoffRate).toBeGreaterThan(0);
    expect(updated.entries.length).toBe(2);
  });
  
  it('applies decay pattern correctly for weekly releases', () => {
    const history: any = {
      platform: 'netflix',
      entries: [{ week: 1, uniqueViewers: 1000000, hoursWatched: 2500000, completionRate: 70, dropoffRate: 0, platform: 'netflix' }],
      totalHoursWatched: 2500000,
      peakViewers: 1000000,
      peakWeek: 1,
      averageCompletionRate: 70
    };
    
    const project: Partial<Project> = {
      releaseModel: 'weekly',
      genre: 'Drama'
    };
    
    const updated = StreamingViewershipTracker.updateViewership(
      history, 2, project as Project, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any
    );
    
    expect(updated.entries[1].uniqueViewers).toBeLessThan(1000000); // Decay applied
    expect(updated.entries[1].uniqueViewers).toBeGreaterThan(700000); // But less severe than binge
  });
  
  it('calculates initial completion rate based on quality and genre', () => {
    const project: Partial<Project> = {
      reviewScore: 85,
      genre: 'Drama'
    };
    
    const platform = {
      id: 'netflix',
      name: 'Netflix',
      archetype: 'streamer' as const,
      marketShare: 0.3,
      reach: 90,
      subscribers: 100_000_000,
      churnRate: 0.05,
      contentLibraryQuality: 75,
      marketingSpend: 5000000,
      subscriberHistory: [],
      activeLicenses: [],
      foundedWeek: 1
    };
    
    const history = StreamingViewershipTracker.initializeViewership(
      project as Project, 'netflix', platform, 1, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any
    );
    
    expect(history.entries[0].completionRate).toBeGreaterThan(70); // High quality + drama genre
    expect(history.entries[0].completionRate).toBeLessThanOrEqual(95);
  });
  
  it('improves completion rate over time due to word-of-mouth', () => {
    const history: any = {
      platform: 'netflix',
      entries: [
        { week: 1, uniqueViewers: 1000000, hoursWatched: 2500000, completionRate: 70, dropoffRate: 0, platform: 'netflix' },
        { week: 2, uniqueViewers: 800000, hoursWatched: 2000000, completionRate: 70, dropoffRate: 20, platform: 'netflix' },
        { week: 3, uniqueViewers: 700000, hoursWatched: 1750000, completionRate: 70, dropoffRate: 12.5, platform: 'netflix' }
      ],
      totalHoursWatched: 6250000,
      peakViewers: 1000000,
      peakWeek: 1,
      averageCompletionRate: 70
    };
    
    const project: Partial<Project> = {
      releaseModel: 'binge',
      genre: 'Drama'
    };
    
    const updated = StreamingViewershipTracker.updateViewership(
      history, 4, project as Project, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any
    );
    
    expect(updated.entries[3].completionRate).toBeGreaterThan(70); // Improvement over time
  });
  
  it('updates peak viewers and peak week correctly', () => {
    const history: any = {
      platform: 'netflix',
      entries: [{ week: 1, uniqueViewers: 1000000, hoursWatched: 2500000, completionRate: 70, dropoffRate: 0, platform: 'netflix' }],
      totalHoursWatched: 2500000,
      peakViewers: 1000000,
      peakWeek: 1,
      averageCompletionRate: 70
    };
    
    const project: Partial<Project> = {
      releaseModel: 'binge',
      genre: 'Drama'
    };
    
    const updated = StreamingViewershipTracker.updateViewership(
      history, 2, project as Project, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any
    );
    
    expect(updated.peakViewers).toBe(1000000); // Still the peak
    expect(updated.peakWeek).toBe(1); // Still week 1
  });
  
  it('calculates total hours watched correctly', () => {
    const history: any = {
      platform: 'netflix',
      entries: [{ week: 1, uniqueViewers: 1000000, hoursWatched: 2500000, completionRate: 70, dropoffRate: 0, platform: 'netflix' }],
      totalHoursWatched: 2500000,
      peakViewers: 1000000,
      peakWeek: 1,
      averageCompletionRate: 70
    };
    
    const project: Partial<Project> = {
      releaseModel: 'binge',
      genre: 'Drama'
    };
    
    const updated = StreamingViewershipTracker.updateViewership(
      history, 2, project as Project, { next: () => 0.5, rangeInt: () => 10, uuid: () => 'id' } as any
    );
    
    expect(updated.totalHoursWatched).toBeGreaterThan(2500000); // Should increase with new entry
  });
});
