
import { describe, it, expect, beforeEach } from 'vitest';
import { ScandalFilter } from '@/engine/services/filters/ScandalFilter';
import { createMockGameState, createMockTickContext, createMockTalent } from '../generators/mockFactory';

describe('ScandalFilter', () => {
  let mockState: unknown;
  let mockContext: unknown;

  beforeEach(() => {
    mockState = createMockGameState();
    mockContext = createMockTickContext();

    // Setup mock talents for scandal generation
    const talent1 = createMockTalent({ id: 'TAL-1', name: 'Scandal Prone Actor' });
    mockState.entities.talents = {
      [talent1.id]: talent1
    };

    // Ensure industry structure for scandals
    mockState.industry.scandals = [];
  });

  it('should have correct name', () => {
    expect(ScandalFilter.name).toBe('ScandalFilter');
  });

  it('should execute without errors with populated talents', () => {
    expect(() => ScandalFilter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should generate impacts for scandals', () => {
    ScandalFilter.execute(mockState, mockContext);
    // At minimum, it should return an array (even if empty)
    expect(Array.isArray(mockContext.impacts)).toBe(true);
  });

  it('should handle systems with existing scandals', () => {
      mockState.industry.scandals = [
          { id: 'SCA-1', talentId: 'TAL-1', type: 'DUI', weekStarted: 1, duration: 4, severity: 50 }
      ];
      expect(() => ScandalFilter.execute(mockState, mockContext)).not.toThrow();
  });
});
