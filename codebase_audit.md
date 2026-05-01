# Codebase Architecture Audit: Studio Boss

## Overview

The `Studio Boss` codebase is built with modern tools (React, Vite, Zustand, Tailwind). Overall, it has a solid foundation, especially concerning the separation of the engine simulation logic (`src/engine/`) from the UI components (`src/components/`). However, as the application has grown, several architectural bottlenecks have emerged regarding state management, file organization, and separation of concerns.

Below is an ordered list of recommendations to improve structure and maintainability, ranked from most critical to optional enhancements.

---

## 1. State Management Restructuring (Critical)

**Issue:** `src/store/gameStore.ts` is becoming a monolith.
- The file is currently over 560 lines long and handles everything from basic state initialization to complex game loop dispatches, derived state, and inline business logic.
- **Example:** The `pitchProject` action inside `gameStore.ts` contains inline logic for generating specific `headlines` based on the outcome of a pitch (e.g., `talent.name passes on first-look deal...`). This logic belongs in the engine domain, not the UI state store.

**Recommendation:**
- **Extract Engine Logic:** Move all inline string generation, array manipulation, and complex branching out of `gameStore.ts` and into pure functions within the appropriate `src/engine/systems/` files. The store actions should solely be responsible for calling these pure functions and setting the resulting state.
- **Implement Zustand Slices:** Break `gameStore.ts` into feature-specific slices (e.g., `createProjectSlice`, `createFinanceSlice`, `createWorldSlice`) using the Zustand slice pattern to improve maintainability and readability.

---

## 2. Separation of Concerns & Data Derivation (High)

**Issue:** UI Components are too coupled to raw state structures and are performing inline data derivation.
- Components are manually filtering arrays on every render or pulling deep nested objects from the store.
- **Example:** `src/components/layout/TopBar.tsx` manually filters `projects.filter(p => p.status === 'development' || p.status === 'production').length` on every render.
- **Example:** Components frequently use `useGameStore(s => s.gameState?.projects || [])` inline, which can lead to referential equality issues and unnecessary re-renders.

**Recommendation:**
- **Create Selectors:** Establish a dedicated file (e.g., `src/store/selectors.ts` or co-located in slices) for derived state. For instance, `selectActiveProjectsCount` or `selectOpportunities`.
- **Memoization:** Ensure fallback arrays (like `[]`) are handled correctly to preserve referential equality, preventing React from re-rendering child components unnecessarily when the state hasn't actually changed.

---

## 3. Directory Structure & File Consolidation (Medium)

**Issue:** Redundant or fragmented utility files.
- There are multiple utility files serving similar purposes across the codebase.
- **Example:** The repository contains both `src/hooks/use-toast.ts` and `src/components/ui/use-toast.ts`.

**Recommendation:**
- **Consolidate UI Utilities:** Standardize the location of UI-specific utilities and hooks. Remove duplicate `use-toast` implementations and ensure `src/lib/utils.ts` is strictly used for UI/Tailwind merging, while `src/engine/utils.ts` handles simulation math and array manipulation.
- **Feature-based Folder Structure:** Consider moving towards a feature-based structure for UI components (e.g., grouping `components/pipeline`, `store/pipelineSlice`, and `test/pipeline` together) as the application scales, rather than separating by technical concern.

---

## 4. Error Handling in Engine Systems (Medium)

**Issue:** Business logic constraints rely on throwing Errors, which risks crashing the UI if uncaught.
- **Example:** In `src/engine/systems/ratings.ts` (specifically `editForRating`), the function throws a hard `Error` if the director has final cut: `throw new Error("Director has final cut...")`.

**Recommendation:**
- **Use Result Objects:** Refactor engine system functions to return standardized Result objects (e.g., `{ success: boolean; data?: Project; error?: string }`) instead of throwing exceptions for predictable game rule violations. This allows the UI store to gracefully handle failures (e.g., showing a Toast notification) rather than crashing the React tree.

---

## 5. Performance Optimizations in Hot Loops (Optional / Preventative)

**Issue:** While the `advanceWeek` engine loop has seen some optimizations (e.g., using `for` loops instead of `.map().filter()`), there is still room for improvement in avoiding intermediate allocations during the game tick.

**Recommendation:**
- Continue auditing `src/engine/core/weekAdvance.ts` and its underlying systems to ensure that large arrays (like `projects` and `talentPool`) are not being shallow-copied unnecessarily or iterated over multiple times when a single pass would suffice.
