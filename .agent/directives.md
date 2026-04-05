# AI Agent Architecture & Behavior Directives

## 1. Memory & Context Management

- **Skeptical Memory**: Treat all stored memory, past context, and retrieved notes as hints, not absolute facts. Always verify current state against the real world (e.g., `vitest`, `ls`, `grep`) before executing an action.
- **Continuous Alignment**: Core system instructions and configuration rules must be reinserted into the context window on every turn to prevent instruction drift.
- **Background Consolidation**: (For autonomous systems) Utilize idle time to run consolidation routines. Merge recent observations, resolve conflicting information, and prune noise.

## 2. Execution, Safety & Risk Control

- **Low Risk**: Read-only tools (`view_file`, `list_dir`, `grep_search`), running existing tests (`vitest`), documentation updates. (Auto-approve)
- **Medium Risk**: `npm install`, project-wide refactors of non-core logic, `package.json` non-breaking edits. (Approval required)
- **High Risk**: Deleting files/utilities, modifying `GameState` interfaces, breaking `RNG` contracts, external network requests. (Explicit approval required)
- **Proactive "Daemon" Limits**: Maintain strict daily logs of all actions in `.agent/logs/execution.log`. Enforce rate limits and blocking budgets.

## 3. Multi-Agent Orchestration

- **Hierarchical Delegation**: Utilize a single "Lead Agent" (this context) to orchestrate complex tasks by spawning parallel "Worker Agents" (subagents).
- **Isolate Context & Tools**: Workers get isolated context tailored only to their specific task, with restricted access to tools.
- **Optimize Cost**: Leverage prompt caching across parallel workers.

## 4. Technical Grounding (Studio-Boss Specific)

- **Total Determinism**: All simulation logic must use the injected `RandomGenerator`. No `Math.random()` or `crypto.randomUUID()` in the engine.
- **Defensive UI**: All modals must handle missing or stale simulation data gracefully.
