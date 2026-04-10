# Bard Engine: Narrative Integration Context

The **Bard Engine** is a game-agnostic narrative middleware designed to decouple simulation logic from descriptive text. It allows the game engine to communicate "what happened" (numerical intensity, domain, and context) while leaving the "how it's described" (flavor, tone, and variance) to a data-driven archive.

## Core Strategy: Decoupling
In traditional game development, narrative strings are often hardcoded near the logic that triggers them. 
Bard replaces this with a **Resolution Request**:
- **Domain**: The high-level system (e.g., `Review`, `Greenlight`).
- **SubDomain**: The specific event within that system (e.g., `Professional`, `Tabloid`).
- **Intensity**: A normalized score (0-100) representing the quality or severity of the event.
- **Context**: A data payload of variables (e.g., `actor`, `project`, `amount`) for interpolation.

## Architecture: The Bard Resolver
The `BardResolver` (src/engine/systems/bardResolver.ts) is the central dispatcher. It performs a hierarchical lookup to find the most appropriate string template.

### Resolution Flow
1. **Tier Mapping**: Converts the `0-100 Intensity` into a semantic tier (e.g., `90` -> `Acclaimed`).
2. **Tonality Selection**: Filters by `Tone` (Trade, Tabloid, social) with automatic fallbacks.
3. **Template Picking**: Selects a random string from the resulting pool (supporting deterministic RNG).
4. **Interpolation**: Replaces `{{tags}}` with data from the `Context` or the global `Dictionary`.

---

## The Archive Data Structure
The `archive.json` is organized into a tiered hierarchy:

```json
{
  "Review": {
    "Standard": {
      "Trade": {
        "Acclaimed": ["Template A", "Template B"],
        "Mixed": ["..."],
        "Panned": ["..."]
      }
    }
  }
}
```

### Global Dictionary
Located at the root of the archive, the `Dictionary` domain allows for procedural generation within templates.
- **Templates**: `"The {{ADJECTIVE}} {{NOUN}} Protocol"`
- **Dictionary**: `{"ADJECTIVE": ["Dark", "Silent"], "NOUN": ["Shadow", "City"]}`

---

## Design & Implementation Audit

### ✅ Approved Patterns
*   **Resilient Fallbacks**: The resolver logic is highly defensive. If a specific tone or tier is missing, it cascades through fallbacks (Tone -> Trade -> Standard -> Any) to ensure the user never see a blank screen or a crash.
*   **Deterministic RNG**: By accepting an optional `RandomGenerator`, the engine ensures that a re-simulated week produces the exact same narrative results, which is vital for debugging and save-state integrity.
*   **Recursive Tagging**: The interpolation engine supports nested dictionary tags (e.g., a movie title tag that itself contains adjective/noun tags), allowing for deep procedural variety.

### ❌ Disapproved Patterns (Technical Debt)
*   **Hardcoded Tier Logic**: The `getTier` function contains domain-specific scores (e.g., `Review` has different thresholds than `Greenlight`). This creates a hard dependency between the resolver and the data schema.
    *   *Recommendation*: Move tier mappings into the `archive.json` metadata for full data-driven control.
*   **Type Safety Gaps**: Use of `archiveData as any` and `Record<string, any>` in the resolver bypasses TypeScript's strengths. While Zod validates the archive at runtime, the code lacks compile-time safety for context keys.
    *   *Recommendation*: Implement a code-generation step to create typed Context interfaces from the archive schema.
*   **Magic Number Recursion**: The interpolation limit is hardcoded at `5`. There is no logging or error reporting if this limit is reached, potentially leading to unresolved tags in the UI without developer notification.

---

## Implementation Details
- **Location**: [bardResolver.ts](file:///Users/amauricia/Documents/GitHub/Studio-Boss/src/engine/systems/bardResolver.ts)
- **Archive**: [archive.json](file:///Users/amauricia/Documents/GitHub/Studio-Boss/src/engine/data/narrative/archive.json)
- **Tests**: [bardIntegration.test.ts](file:///Users/amauricia/Documents/GitHub/Studio-Boss/src/test/engine/systems/bardIntegration.test.ts)
