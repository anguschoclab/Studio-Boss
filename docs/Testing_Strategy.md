# Testing Strategy

## Environment
* **Runner:** Vitest
* **DOM:** JSDOM environment is used for components.

## Core Engine Systems
Core engine systems like the television simulation (platforms, ratings, renewals) are tested rigorously for pure logic behavior.

### Television Systems
* **Platform Engine (`src/test/engine/systems/television/platformEngine.test.ts`):** Validates subscriber growth, churn rates, and library quality factors.
* **Ratings Evaluator (`src/test/engine/systems/television/ratingsEvaluator.test.ts`):** Tests viewership decay modeling based on low review scores.
* **Renewal Engine (`src/test/engine/systems/television/renewalEngine.test.ts`):** Ensures that show cancellation and renewal decisions are properly based on average ratings against dynamically calculated thresholds, incorporating syndication milestones (e.g., 88+ and 100+ episodes).

## Best Practices
* Use JSDOM for UI component testing.
* Focus unit testing on the strict logic flow of core simulation files.
