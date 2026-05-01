import { describe, it, expect, beforeEach } from 'vitest';
import { FinanceFilter } from '@/engine/services/filters/FinanceFilter';
import { createMockGameState, createMockTickContext } from '../generators/mockFactory';

describe('FinanceFilter', () => {
  let mockState: any;
  let mockContext: any;

  beforeEach(() => {
    mockState = createMockGameState();
    mockContext = createMockTickContext();
  });

  it('should have correct name', () => {
    expect(FinanceFilter.name).toBe('FinanceFilter');
  });

  it('should execute without errors', () => {
    expect(() => FinanceFilter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should generate impacts for foundational finances', () => {
    FinanceFilter.execute(mockState, mockContext);
    // tickFinance usually generates LEDGER_UPDATED and FINANCES_SNAPSHOT_ADDED
    expect(mockContext.impacts.length).toBeGreaterThan(0);
  });

  it('should generate ledger and snapshot impacts', () => {
    FinanceFilter.execute(mockState, mockContext);
    const ledgerImpact = mockContext.impacts.find((i: any) => i.type === 'LEDGER_UPDATED');
    const snapshotImpact = mockContext.impacts.find((i: any) => i.type === 'FINANCE_SNAPSHOT_ADDED' || i.type === 'HISTORY_SNAPSHOT_ADDED');
    
    expect(ledgerImpact).toBeDefined();
    expect(snapshotImpact).toBeDefined();
  });

  it('should handle negative cash flow scenarios', () => {
    mockState.finance.cash = 100; // Small amount to trigger potential warnings or bankrupcy risk logic
    expect(() => FinanceFilter.execute(mockState, mockContext)).not.toThrow();
  });
});
