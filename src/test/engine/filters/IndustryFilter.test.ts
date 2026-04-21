import { describe, it, expect, beforeEach } from 'vitest';
import { IndustryFilter } from '@/engine/services/filters/IndustryFilter';
import { createMockGameState, createMockTickContext, createMockRival } from '../generators/mockFactory';

describe('IndustryFilter', () => {
  let mockState: any;
  let mockContext: any;

  beforeEach(() => {
    mockState = createMockGameState();
    mockContext = createMockTickContext();

    // Setup mock rivals
    const rival1 = createMockRival({ id: 'RIV-1', name: 'Rival Studios' });
    mockState.entities.rivals = {
      [rival1.id]: rival1
    };

    // Ensure industry structure is correct
    mockState.industry = {
      agencies: [],
      festivalSubmissions: [],
      newsHistory: [],
      awards: []
    };
  });

  it('should have correct name', () => {
    expect(IndustryFilter.name).toBe('IndustryFilter');
  });

  it('should execute without errors', () => {
    expect(() => IndustryFilter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should generate impacts for foundational industry dynamics', () => {
    IndustryFilter.execute(mockState, mockContext);
    // Even with minimal mock state, it should return at least rival impacts (even if empty update)
    expect(mockContext.impacts).toBeDefined();
  });

  it('should handle week 20 upfronts and awards', () => {
      mockContext.week = 20;
      mockState.week = 20;
      expect(() => IndustryFilter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should handle annual milestone weeks', () => {
      // Test week 52 for year-end logic
      mockContext.week = 52;
      mockState.week = 52;
      expect(() => IndustryFilter.execute(mockState, mockContext)).not.toThrow();
  });
});
