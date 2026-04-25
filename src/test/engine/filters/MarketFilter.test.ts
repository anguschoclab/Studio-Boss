
import { describe, it, expect, beforeEach } from 'vitest';
import { MarketFilter } from '@/engine/services/filters/MarketFilter';
import { createMockGameState, createMockTickContext } from '../generators/mockFactory';

describe('MarketFilter', () => {
  let mockState: unknown;
  let mockContext: unknown;

  beforeEach(() => {
    mockState = createMockGameState();
    mockContext = createMockTickContext();
  });

  it('should have correct name', () => {
    expect(MarketFilter.name).toBe('MarketFilter');
  });

  it('should execute without errors', () => {
    expect(() => MarketFilter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should generate impacts', () => {
    MarketFilter.execute(mockState, mockContext);
    // MarketFilter currently pushes impacts for interest rates, etc.
    expect(mockContext.impacts.length).toBeGreaterThan(0);
  });

  it('should generate interest rate impact', () => {
      MarketFilter.execute(mockState, mockContext);
      const interestRateImpact = mockContext.impacts.find((i: unknown) => i.type === 'MARKET_EVENT_UPDATED');
      expect(interestRateImpact).toBeDefined();
  });

  it('should not modify context.week', () => {
    const weekBefore = mockContext.week;
    MarketFilter.execute(mockState, mockContext);
    expect(mockContext.week).toBe(weekBefore);
  });

  it('should not modify context.tickCount', () => {
    const tickCountBefore = mockContext.tickCount;
    MarketFilter.execute(mockState, mockContext);
    expect(mockContext.tickCount).toBe(tickCountBefore);
  });
});
