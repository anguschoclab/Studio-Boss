import { describe, it, expect } from 'vitest';
import { StreamingViewershipTracker } from '@/engine/systems/production/StreamingViewershipTracker';
import { Project, Buyer } from '@/engine/types';
import { StreamingViewershipHistory } from '@/engine/types/project.types';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockProject, createMockBuyer } from './utils/mockFactories';

describe('StreamingViewershipTracker', () => {
  const rng = new RandomGenerator(123);

  it('initializes viewership with realistic values', () => {
    const project = createMockProject({
      reviewScore: 75,
      buzz: 80,
      genre: 'Drama'
    });
    
    const platform = createMockBuyer({
      id: 'netflix',
      name: 'Netflix',
      archetype: 'streamer',
      marketShare: 0.3
    });
    
    const history = StreamingViewershipTracker.initializeViewership(
      project, 'netflix', platform, 1, rng
    );
    
    expect(history.entries.length).toBe(1);
    expect(history.entries[0].viewers).toBeGreaterThan(0);
    expect(history.peakViewers).toBe(history.entries[0].viewers);
    expect(history.platformId).toBe('netflix');
  });
  
  it('applies decay pattern correctly for binge releases', () => {
    const history: StreamingViewershipHistory = {
      platformId: 'netflix',
      platformName: 'Netflix',
      startWeek: 1,
      entries: [{ week: 1, viewers: 1000000, hoursWatched: 2500000, completionRate: 70, retention: 1.0 }],
      totalHoursWatched: 2500000,
      peakViewers: 1000000,
      peakWeek: 1,
      completionRate: 70
    };
    
    const project = createMockProject({
      type: 'SERIES',
      releaseModel: 'binge',
      genre: 'Drama'
    });
    
    const updated = StreamingViewershipTracker.updateViewership(
      history, 2, project, rng
    );
    
    expect(updated.entries[1].viewers).toBeLessThan(1000000); // Decay applied
    expect(updated.entries[1].retention).toBeLessThan(1.0);
    expect(updated.entries.length).toBe(2);
  });
  
  it('applies decay pattern correctly for weekly releases', () => {
    const history: StreamingViewershipHistory = {
      platformId: 'netflix',
      platformName: 'Netflix',
      startWeek: 1,
      entries: [{ week: 1, viewers: 1000000, hoursWatched: 2500000, completionRate: 70, retention: 1.0 }],
      totalHoursWatched: 2500000,
      peakViewers: 1000000,
      peakWeek: 1,
      completionRate: 70
    };
    
    const project = createMockProject({
      type: 'SERIES',
      releaseModel: 'weekly',
      genre: 'Drama'
    });
    
    const updated = StreamingViewershipTracker.updateViewership(
      history, 2, project, rng
    );
    
    expect(updated.entries[1].viewers).toBeLessThan(1000000); // Decay applied
    expect(updated.entries[1].viewers).toBeGreaterThan(700000); // But less severe than binge
  });
  
  it('calculates initial completion rate based on quality and genre', () => {
    const project = createMockProject({
      reviewScore: 85,
      genre: 'Drama'
    });
    
    const platform = createMockBuyer({
        id: 'netflix',
        name: 'Netflix',
        archetype: 'streamer',
        marketShare: 0.3
    });
    
    const history = StreamingViewershipTracker.initializeViewership(
      project, 'netflix', platform, 1, rng
    );
    
    expect(history.entries[0].viewers).toBeGreaterThan(0); 
    expect(history.completionRate).toBeGreaterThan(70); // High quality + drama genre
    expect(history.completionRate).toBeLessThanOrEqual(95);
  });
  
  it('improves completion rate over time due to word-of-mouth', () => {
    const history: StreamingViewershipHistory = {
      platformId: 'netflix',
      platformName: 'Netflix',
      startWeek: 1,
      entries: [
        { week: 1, viewers: 1000000, hoursWatched: 2500000, retention: 1.0 },
        { week: 2, viewers: 800000, hoursWatched: 2000000, retention: 0.8 },
        { week: 3, viewers: 700000, hoursWatched: 1750000, retention: 0.8 }
      ],
      totalHoursWatched: 6250000,
      peakViewers: 1000000,
      peakWeek: 1,
      completionRate: 70
    };
    
    const project = createMockProject({
      type: 'SERIES',
      releaseModel: 'binge',
      genre: 'Drama'
    });
    
    const updated = StreamingViewershipTracker.updateViewership(
      history, 4, project, rng
    );
    
    expect(updated.entries[3].viewers).toBeDefined();
    expect(updated.completionRate).toBeGreaterThan(70); // Improvement over time
  });
  
  it('updates peak viewers and peak week correctly', () => {
    const history: StreamingViewershipHistory = {
      platformId: 'netflix',
      platformName: 'Netflix',
      startWeek: 1,
      entries: [{ week: 1, viewers: 1000000, hoursWatched: 2500000, retention: 1.0 }],
      totalHoursWatched: 2500000,
      peakViewers: 1000000,
      peakWeek: 1,
      completionRate: 70
    };
    
    const project = createMockProject({
      type: 'SERIES',
      releaseModel: 'binge',
      genre: 'Drama'
    });
    
    const updated = StreamingViewershipTracker.updateViewership(
      history, 2, project, rng
    );
    
    expect(updated.peakViewers).toBe(1000000); // Still the peak
    expect(updated.peakWeek).toBe(1); // Still week 1
  });
  
  it('calculates total hours watched correctly', () => {
    const history: StreamingViewershipHistory = {
      platformId: 'netflix',
      platformName: 'Netflix',
      startWeek: 1,
      entries: [{ week: 1, viewers: 1000000, hoursWatched: 2500000, retention: 1.0 }],
      totalHoursWatched: 2500000,
      peakViewers: 1000000,
      peakWeek: 1,
      completionRate: 70
    };
    
    const project = createMockProject({
      type: 'SERIES',
      releaseModel: 'binge',
      genre: 'Drama'
    });
    
    const updated = StreamingViewershipTracker.updateViewership(
      history, 2, project, rng
    );
    
    expect(updated.totalHoursWatched).toBeGreaterThan(2500000); // Should increase with new entry
  });
});
