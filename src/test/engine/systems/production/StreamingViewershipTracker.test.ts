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

      const platform = createMockBuyer();
      platform.marketShare = 0.5;

      const rng = new RandomGenerator(42);

      const history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);

      expect(history.platformId).toBe('platform-1');
      expect(history.startWeek).toBe(10);
      expect(history.entries).toHaveLength(1);

      const entry = history.entries[0];
      expect(entry.viewers).toBeGreaterThan(0);
      // Completion rate: 80 * 0.8 = 64. Genre is 'Drama' -> +10 = 74.
      expect(history.completionRate).toBe(74);
    });

    it('handles extremely low quality and buzz (0 viewers)', () => {
      const project = createMockProject();
      project.reviewScore = 1;
      project.buzz = 1;

      const platform = createMockBuyer();
      platform.marketShare = 0.01;
      const rng = new RandomGenerator(42);

      const history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);

      expect(history.peakViewers).toBeGreaterThan(0);
      const entry = history.entries[0];
      expect(entry.viewers).toBeGreaterThan(0);
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

      const dramaComp = dramaHistory.completionRate;
      const comedyComp = comedyHistory.completionRate;
      const neutralComp = neutralHistory.completionRate;

      expect(dramaComp).toBeGreaterThan(neutralComp);
      expect(neutralComp).toBeGreaterThan(comedyComp);
    });
  });

  describe('updateViewership', () => {
    it('updates viewership correctly for binge release model', () => {
      const project = createMockProject();
      project.reviewScore = 50;
      project.buzz = 50;
      project.type = 'SERIES';
      (project as unknown as any).releaseModel = 'binge';

      const platform = createMockBuyer();
      const rng = new RandomGenerator(42);

      // initial
      let history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);
      const initialViewers = history.entries[0].viewers;

      // Week 2 (1 week since release, decay factor 0.5 for binge)
      history = StreamingViewershipTracker.updateViewership(history, 11, project, rng);
      expect(history.entries).toHaveLength(2);
      const week2Viewers = history.entries[1].viewers;
      // logic: initial * factor (0.5) * quality (1.0) * rng(0.9-1.1)
      expect(week2Viewers).toBeCloseTo(initialViewers * 0.5, -4);
    });

    it('updates viewership correctly for weekly release model', () => {
      const project = createMockProject();
      project.reviewScore = 50;
      project.buzz = 50;
      project.type = 'SERIES';
      (project as unknown as any).releaseModel = 'weekly';
      const platform = createMockBuyer();
      const rng = new RandomGenerator(42);

      let history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);
      const initialViewers = history.entries[0].viewers;

      // Week 2 (decay factor 0.9 for weekly)
      history = StreamingViewershipTracker.updateViewership(history, 11, project, rng);
      expect(history.entries[1].viewers).toBeCloseTo(initialViewers * 0.9, -4);
    });

    it('handles extremely low unique viewers correctly without NaN dropoff', () => {
      const project = createMockProject();
      const platform = createMockBuyer();
      const rng = new RandomGenerator(42);

      let history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);
      history.entries[0].viewers = 0;

      history = StreamingViewershipTracker.updateViewership(history, 11, project, rng);
      expect(history.entries[1].viewers).toBe(0);
    });

    it('increases completion rate over time due to word of mouth', () => {
      const project = createMockProject();
      project.reviewScore = 80;
      project.buzz = 80;
      const platform = createMockBuyer();
      const rng = new RandomGenerator(42);

      let history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);
      const initialCompRate = history.completionRate;

      // Week 1, 2 no change in comp rate
      history = StreamingViewershipTracker.updateViewership(history, 11, project, rng);
      history = StreamingViewershipTracker.updateViewership(history, 12, project, rng);
      expect(history.completionRate).toBe(initialCompRate);

      // Week 3 (weeksSinceRelease = 3), should increase
      history = StreamingViewershipTracker.updateViewership(history, 13, project, rng);
      expect(history.completionRate).toBeGreaterThan(initialCompRate);
    });

    it('updates aggregates correctly after multiple updates', () => {
      const project = createMockProject();
      const platform = createMockBuyer();
      const rng = new RandomGenerator(42);

      let history = StreamingViewershipTracker.initializeViewership(project, 'platform-1', platform, 10, rng);

      history = StreamingViewershipTracker.updateViewership(history, 11, project, rng);
      history = StreamingViewershipTracker.updateViewership(history, 12, project, rng);

      expect(history.entries).toHaveLength(3);
      const calculatedTotal = history.entries.reduce((sum, entry) => sum + entry.hoursWatched, 0);
      expect(history.totalHoursWatched).toBe(calculatedTotal);

      expect(history.peakViewers).toBeGreaterThanOrEqual(history.entries[0].viewers);
    });
  });
});
