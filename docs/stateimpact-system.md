# StateImpact System Guide

## Overview

The StateImpact system is the core architectural pattern used in Studio Boss for managing game state changes. It follows the **Collector-Resolver pattern**, where simulation passes return immutable `StateImpact` objects describing changes instead of mutating state directly.

## Core Concepts

### StateImpact Objects

A `StateImpact` is an immutable object that describes a change to the game state. It contains:

```typescript
export type StateImpact = BaseImpact & { 
  type?: ImpactType; 
  payload?: any;
};

export interface BaseImpact {
  cashChange?: number;
  prestigeChange?: number;
  projectUpdates?: ProjectUpdate[];
  talentUpdates?: TalentUpdate[];
  // ... other root-level fields
}
```

### Impact Types

Common impact types include:

- `FUNDS_CHANGED` - Changes studio cash
- `PROJECT_UPDATED` - Updates a project's state
- `TALENT_UPDATED` - Updates talent stats
- `SCANDAL_ADDED` - Adds a new scandal
- `FRANCHISE_UPDATED` - Updates franchise data
- `NEWS_ADDED` - Adds news headlines
- `RIVAL_UPDATED` - Updates rival studio data

## The Collector-Resolver Pattern

### Collector Phase (Simulation Passes)

Systems run simulation logic and **collect** StateImpact objects:

```typescript
export function tickFinance(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  // Calculate financial changes
  const cashChange = calculateWeeklyExpenses(state);
  
  impacts.push({
    type: 'FUNDS_CHANGED',
    payload: { amount: cashChange }
  });
  
  return impacts;
}
```

### Resolver Phase (State Application)

The `WeekCoordinator` collects all impacts from systems and applies them via the `impactReducer`:

```typescript
const context: TickContext = {
  week: state.week + 1,
  impacts: []
};

// Run all system filters
this.runFinanceFilter(state, context);
this.runProductionFilter(state, context);
// ... more filters

// Apply all impacts at once
const nextState = applyImpacts(state, context.impacts);
```

## Implementation Guide

### Creating a New System

When creating a new simulation system, follow this pattern:

#### 1. Return StateImpact[]

```typescript
export function tickMySystem(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  // Calculate changes
  const newValue = calculateSomething(state);
  
  // Describe the change as an impact
  impacts.push({
    type: 'ENTITY_UPDATED',
    payload: { entityId: 'id', update: { value: newValue } }
  });
  
  return impacts;
}
```

#### 2. Never Mutate State Directly

❌ **Incorrect:**
```typescript
export function tickMySystem(state: GameState): StateImpact[] {
  state.entities.projects['p1'].buzz += 10; // Direct mutation!
  return [];
}
```

✅ **Correct:**
```typescript
export function tickMySystem(state: GameState): StateImpact[] {
  return [{
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: 'p1',
      update: { buzz: state.entities.projects['p1'].buzz + 10 }
    }
  }];
}
```

#### 3. Use Pure Functions

All helper functions should be pure - they should not have side effects:

```typescript
// Pure function - returns new value
function calculateNewBuzz(currentBuzz: number, modifier: number): number {
  return Math.max(0, Math.min(100, currentBuzz + modifier));
}

// Impure function - modifies parameter (avoid)
function modifyBuzzInPlace(project: Project): void {
  project.buzz += 10; // Side effect!
}
```

## System Integration

### Adding Your System to WeekCoordinator

1. Create a filter method in `WeekCoordinator`:

```typescript
private runMySystemFilter(state: GameState, context: TickContext): void {
  const impacts = tickMySystem(state, context.rng);
  context.impacts.push(...impacts);
}
```

2. Call the filter in the `execute` method:

```typescript
static execute(state: GameState, rng: RandomGenerator): { newState: GameState; summary: WeekSummary; impacts: StateImpact[] } {
  const context: TickContext = {
    week: state.week + 1,
    impacts: [],
    rng
  };

  // Add your filter here
  this.runMySystemFilter(state, context);

  const nextState = applyImpacts(state, context.impacts);
  // ...
}
```

## Common Patterns

### Updating Multiple Entities

```typescript
export function tickMultipleEntities(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  Object.values(state.entities.projects).forEach(project => {
    const newBuzz = calculateBuzz(project);
    impacts.push({
      type: 'PROJECT_UPDATED',
      payload: {
        projectId: project.id,
        update: { buzz: newBuzz }
      }
    });
  });
  
  return impacts;
}
```

### Conditional Updates

```typescript
export function tickConditionalSystem(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  if (state.week % 4 === 0) { // Every 4 weeks
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        headline: 'Quarterly Report Released',
        category: 'business'
      }
    });
  }
  
  return impacts;
}
```

### Complex State Changes

For complex changes that affect multiple entities, return multiple impacts:

```typescript
export function tickComplexSystem(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  // Update project
  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: 'p1',
      update: { state: 'released', revenue: 1000000 }
    }
  });
  
  // Update talent
  impacts.push({
    type: 'TALENT_UPDATED',
    payload: {
      talentId: 't1',
      update: { prestige: 75 }
    }
  });
  
  // Add news
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      id: rng.uuid('NWS'),
      headline: 'Blockbuster Released!',
      category: 'entertainment'
    }
  });
  
  return impacts;
}
```

## Testing StateImpact Systems

### Unit Tests

Test that your system returns the correct impacts:

```typescript
describe('MySystem', () => {
  it('should return PROJECT_UPDATED impact', () => {
    const state = createMockGameState();
    const impacts = tickMySystem(state, rng);
    
    expect(impacts.length).toBeGreaterThan(0);
    expect(impacts[0].type).toBe('PROJECT_UPDATED');
  });
  
  it('should not mutate state directly', () => {
    const state = createMockGameState();
    const originalBuzz = state.entities.projects['p1'].buzz;
    
    tickMySystem(state, rng);
    
    // State should be unchanged
    expect(state.entities.projects['p1'].buzz).toBe(originalBuzz);
  });
});
```

### Integration Tests

Test that impacts are correctly applied:

```typescript
describe('MySystem Integration', () => {
  it('should apply impacts correctly to state', () => {
    const state = createMockGameState();
    const impacts = tickMySystem(state, rng);
    
    const newState = applyImpacts(state, impacts);
    
    expect(newState.entities.projects['p1'].buzz).not.toBe(state.entities.projects['p1'].buzz);
  });
});
```

## Best Practices

### DO:

✅ Return `StateImpact[]` from all simulation functions
✅ Use pure functions for calculations
✅ Describe changes declaratively
✅ Batch related changes into single impacts when possible
✅ Use existing impact types before creating new ones
✅ Write tests for impact generation and application

### DON'T:

❌ Mutate state objects directly
❌ Return mutated objects alongside impacts
❌ Create side effects in helper functions
❌ Mix impact generation with state application
❌ Skip returning impacts for "no-op" cases (return empty array instead)

## Migration Guide

### Migrating Legacy Systems

If you encounter a legacy system that mutates state directly:

1. **Identify mutations** - Find all places where state is modified
2. **Convert to impacts** - Replace each mutation with an impact
3. **Update signature** - Change return type to `StateImpact[]`
4. **Update tests** - Rewrite tests to expect impacts
5. **Update callers** - Ensure callers handle the new return type

Example migration:

**Before:**
```typescript
export function advanceProject(project: Project): { project: Project } {
  project.buzz += 10;
  project.weeksInPhase += 1;
  return { project };
}
```

**After:**
```typescript
export function advanceProject(project: Project): StateImpact[] {
  return [{
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: project.id,
      update: {
        buzz: project.buzz + 10,
        weeksInPhase: project.weeksInPhase + 1
      }
    }
  }];
}
```

## Existing Impact Types

See `src/engine/types/state.types.ts` for the complete list of impact types. Common types include:

- `FUNDS_CHANGED`
- `PRESTIGE_CHANGED`
- `PROJECT_UPDATED`
- `PROJECT_REMOVED`
- `TALENT_UPDATED`
- `TALENT_ADDED`
- `SCANDAL_ADDED`
- `FRANCHISE_UPDATED`
- `FRANCHISE_ADDED`
- `NEWS_ADDED`
- `RIVAL_UPDATED`
- `BUYER_UPDATED`
- `VAULT_ASSET_UPDATED`
- `MODAL_TRIGGERED`
- `MERGER_RESOLVED`

## Adding New Impact Types

If you need a new impact type:

1. Add the type to `ImpactType` in `src/engine/types/state.types.ts`
2. Add a handler in `applySingleImpact` in `src/engine/core/impactReducer.ts`
3. Document the new type in this guide

Example:

```typescript
// In state.types.ts
export type ImpactType = 
  | 'FUNDS_CHANGED'
  | 'PROJECT_UPDATED'
  | 'MY_NEW_TYPE'  // Add here
  // ... other types

// In impactReducer.ts
case 'MY_NEW_TYPE': {
  const { entityId, update } = impact.payload;
  // Handle the impact
  break;
}
```

## Debugging

### Viewing Impacts

To debug what impacts a system generates:

```typescript
const impacts = tickMySystem(state, rng);
console.log('Generated impacts:', JSON.stringify(impacts, null, 2));
```

### Tracing Impact Application

To trace how impacts are applied:

```typescript
const newState = applyImpacts(state, impacts);
console.log('State before:', state);
console.log('State after:', newState);
```

## Performance Considerations

- **Batch impacts:** When updating multiple entities, batch them into a single impact if possible
- **Avoid unnecessary impacts:** Don't return impacts for no-op changes
- **Use root-level fields:** For simple numeric changes, use `cashChange`, `prestigeChange`, etc.
- **Impact merging:** The `mergeImpacts` utility can combine similar impacts

## Related Files

- `src/engine/types/state.types.ts` - StateImpact type definitions
- `src/engine/core/impactReducer.ts` - Impact application logic
- `src/engine/services/WeekCoordinator.ts` - Impact collection and orchestration
- `src/engine/utils/impactUtils.ts` - Impact utility functions

## Examples in Codebase

Good examples of StateImpact-compliant systems:

- `src/engine/systems/finance/financeTick.ts`
- `src/engine/systems/TalentSystem.ts`
- `src/engine/systems/productionEngine.ts`
- `src/engine/systems/television/televisionTick.ts`
- `src/engine/systems/awards.ts`

## Summary

The StateImpact system provides a clean, immutable way to manage game state changes. By following the Collector-Resolver pattern, we achieve:

- **Determinism:** Pure functions make simulation predictable
- **Debuggability:** State changes are traceable through impact logs
- **Testability:** Pure functions are easier to test
- **Maintainability:** Clear separation of concerns
- **Extensibility:** Easy to add new impact types and systems

When in doubt, remember: **Return impacts, don't mutate state.**
