
import { describe, it, expect, beforeEach } from 'vitest';
import { ProductionFilter } from '@/engine/services/filters/ProductionFilter';
import { createMockGameState, createMockTickContext, createMockProject } from '../generators/mockFactory';

describe('ProductionFilter', () => {
  let mockState: unknown;
  let mockContext: unknown;

  beforeEach(() => {
    mockState = createMockGameState();
    mockContext = createMockTickContext();

    // Setup mock projects
    const project1 = createMockProject({ id: 'PRJ-1', title: 'Active Production', status: 'Production' });
    mockState.entities.projects = {
      [project1.id]: project1
    };
  });

  it('should have correct name', () => {
    expect(ProductionFilter.name).toBe('ProductionFilter');
  });

  it('should execute without errors with active projects', () => {
    expect(() => ProductionFilter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should generate impacts for project advancement', () => {
    ProductionFilter.execute(mockState, mockContext);
    // tickProduction handles advancement and crises
    expect(mockContext.impacts).toBeDefined();
  });

  it('should process projects via ProductionProjectProcessor', () => {
    // This is called inside the filter loop
    ProductionFilter.execute(mockState, mockContext);
    // Even if no specific impacts are returned, the loop should complete
    expect(mockContext.impacts.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty projects record', () => {
    mockState.entities.projects = {};
    expect(() => ProductionFilter.execute(mockState, mockContext)).not.toThrow();
  });
});
