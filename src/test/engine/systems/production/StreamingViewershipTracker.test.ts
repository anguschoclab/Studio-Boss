import { describe, it, expect } from 'vitest';
import { StreamingViewershipTracker } from '@/engine/systems/production/StreamingViewershipTracker';
import { createMockProject, createMockBuyer } from '@/test/utils/mockFactories';
import { RandomGenerator } from '@/engine/utils/rng';

describe('StreamingViewershipTracker', () => {
  describe('initializeViewership', () => {
    it('initializes correctly with standard values', () => {
      const project = createMockProject();
      project.reviewScore = 80;
      project.buzz = 80;
      project.genre = 'Drama';

      // platform reach = 20M. So 20,000,000 * 0.8 * 0.8 * 0.05 = 640,000
      const platform = createMockBuyer();
      (platform as any).subscribers = 20_000_000;

      const rng = new RandomGenerator(42);

      const history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);

      expect(history.peakViewers).toBe(640000);
      expect(history.platform).toBe('platform-1');
      expect(history.peakWeek).toBe(10);
      expect(history.entries).toHaveLength(1);

      const entry = history.entries[0];
      expect(entry.uniqueViewers).toBe(640000);
      expect(entry.hoursWatched).toBe(1600000); // 640000 * 2.5
      expect(entry.dropoffRate).toBe(0);

      // Completion rate: 80 * 0.8 = 64. Genre is 'Drama' -> +10 = 74.
      expect(entry.completionRate).toBe(74);
      expect(history.averageCompletionRate).toBe(74);
    });

    it('handles extremely low quality and buzz (0 viewers)', () => {
      const project = createMockProject();
      // Use something just above 0 because `quality = project.reviewScore || 50` will reset 0 to 50
      project.reviewScore = 1;
      project.buzz = 1;

      const platform = createMockBuyer();
      (platform as any).subscribers = 10_000_000;
      const rng = new RandomGenerator(42);

      const history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);

      // 10M * 0.01 * 0.01 * 0.05 = 50
      expect(history.peakViewers).toBe(50);
      const entry = history.entries[0];
      expect(entry.uniqueViewers).toBe(50);
      expect(entry.hoursWatched).toBe(125);
    });

    it('applies genre modifiers to completion rate correctly', () => {
      const platform = createMockBuyer();
      const rng = new RandomGenerator(42);

      const dramaProject = createMockProject({ genre: 'Crime' }); // Drama genre +10
      dramaProject.reviewScore = 50;

      const comedyProject = createMockProject({ genre: 'Comedy' }); // Lighter genre -5
      comedyProject.reviewScore = 50;

      const neutralProject = createMockProject({ genre: 'Sci-Fi' }); // Neutral
      neutralProject.reviewScore = 50;

      const dramaHistory = StreamingViewershipTracker.initializeViewership(dramaProject, 'p1', platform, 1, rng);
      const comedyHistory = StreamingViewershipTracker.initializeViewership(comedyProject, 'p1', platform, 1, rng);
      const neutralHistory = StreamingViewershipTracker.initializeViewership(neutralProject, 'p1', platform, 1, rng);

      const dramaComp = dramaHistory.entries[0].completionRate;
      const comedyComp = comedyHistory.entries[0].completionRate;
      const neutralComp = neutralHistory.entries[0].completionRate;

      expect(dramaComp).toBeGreaterThan(neutralComp);
      expect(neutralComp).toBeGreaterThan(comedyComp);
    });
  });

  describe('updateViewership', () => {
    it('updates viewership correctly for binge release model', () => {
      const project = createMockProject();
      project.reviewScore = 50;
      project.buzz = 50;
      (project as any).releaseModel = 'binge';

      const platform = createMockBuyer();
      (platform as any).subscribers = 10_000_000;
      const rng = new RandomGenerator(42);

      // initial
      let history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);
      const initialViewers = history.entries[0].uniqueViewers; // 10M * 0.5 * 0.5 * 0.05 = 125,000

      // Week 2 (1 week since release, decay factor 0.5)
      history = StreamingViewershipTracker.updateViewership(history, 11, project, rng);
      expect(history.entries).toHaveLength(2);
      const week2Viewers = history.entries[1].uniqueViewers;
      expect(week2Viewers).toBe(Math.round(initialViewers * 0.5));
      expect(history.entries[1].dropoffRate).toBe(50); // 50% drop

      // Week 3 (2 weeks since release, decay factor 0.7)
      history = StreamingViewershipTracker.updateViewership(history, 12, project, rng);
      expect(history.entries).toHaveLength(3);
      expect(history.entries[2].uniqueViewers).toBe(Math.round(week2Viewers * 0.7));

      // Long tail test (decay factor 0.95 for > 4 weeks)
      let prevViewers = history.entries[2].uniqueViewers;
      for (let w = 13; w <= 16; w++) {
        history = StreamingViewershipTracker.updateViewership(history, w, project, rng);
        prevViewers = history.entries[history.entries.length - 1].uniqueViewers;
      }

      // Week 17 (> 4 weeks)
      history = StreamingViewershipTracker.updateViewership(history, 17, project, rng);
      const finalViewers = history.entries[history.entries.length - 1].uniqueViewers;

      // It should decay by 0.95, but never below 30% of previous week
      const expectedDecay = Math.max(Math.round(prevViewers * 0.95), Math.round(prevViewers * 0.3));
      expect(finalViewers).toBe(expectedDecay);
    });

    it('updates viewership correctly for weekly release model', () => {
      const project = createMockProject();
      project.reviewScore = 50;
      project.buzz = 50;
      // Not setting releaseModel makes it default/weekly
      const platform = createMockBuyer();
      (platform as any).subscribers = 10_000_000;
      const rng = new RandomGenerator(42);

      let history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);
      const initialViewers = history.entries[0].uniqueViewers;

      // Week 2 (decay factor 0.8)
      history = StreamingViewershipTracker.updateViewership(history, 11, project, rng);
      expect(history.entries[1].uniqueViewers).toBe(Math.round(initialViewers * 0.8));
      expect(history.entries[1].dropoffRate).toBe(20); // 20% drop
    });

    it('handles extremely low unique viewers correctly without NaN dropoff', () => {
      const project = createMockProject();
      project.reviewScore = 1;
      project.buzz = 1;
      const platform = createMockBuyer();
      (platform as any).subscribers = 100_000; // Small reach
      const rng = new RandomGenerator(42);

      let history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);
      // 100k * 0.01 * 0.01 * 0.05 = 0.5 -> 1
      const v = history.entries[0].uniqueViewers;

      // Force it to 0 for this specific test
      history.entries[0].uniqueViewers = 0;

      history = StreamingViewershipTracker.updateViewership(history, 11, project, rng);
      expect(history.entries[1].uniqueViewers).toBe(0);
      expect(history.entries[1].dropoffRate).toBe(0); // Should handle divide by zero safely
    });

    it('increases completion rate over time due to word of mouth', () => {
      const project = createMockProject();
      project.reviewScore = 80;
      project.buzz = 80;
      const platform = createMockBuyer();
      (platform as any).subscribers = 10_000_000;
      const rng = new RandomGenerator(42);

      let history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);
      const initialCompRate = history.entries[0].completionRate;

      // Week 1, 2 no change in comp rate
      history = StreamingViewershipTracker.updateViewership(history, 11, project, rng);
      history = StreamingViewershipTracker.updateViewership(history, 12, project, rng);
      expect(history.entries[2].completionRate).toBe(initialCompRate);

      // Week 3 (weeksSinceRelease = 3), should increase
      history = StreamingViewershipTracker.updateViewership(history, 13, project, rng);
      expect(history.entries[3].completionRate).toBeGreaterThan(initialCompRate);
    });

    it('updates aggregates correctly after multiple updates', () => {
      const project = createMockProject();
      project.reviewScore = 80;
      project.buzz = 80;
      const platform = createMockBuyer();
      (platform as any).subscribers = 10_000_000;
      const rng = new RandomGenerator(42);

      let history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);

      history = StreamingViewershipTracker.updateViewership(history, 11, project, rng);
      history = StreamingViewershipTracker.updateViewership(history, 12, project, rng);

      expect(history.entries).toHaveLength(3);
      expect(history.totalHoursWatched).toBe(
        history.entries[0].hoursWatched + history.entries[1].hoursWatched + history.entries[2].hoursWatched
      );

      expect(history.peakViewers).toBe(history.entries[0].uniqueViewers);
      expect(history.peakWeek).toBe(10);

      const avgComp = (history.entries[0].completionRate + history.entries[1].completionRate + history.entries[2].completionRate) / 3;
      expect(history.averageCompletionRate).toBe(Math.round(avgComp));
    });
  });
});
