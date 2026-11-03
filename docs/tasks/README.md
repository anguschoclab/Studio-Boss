# Agent Tasks

Standalone agent task prompts migrated from Jules (which ran them on a recurring nightly schedule). Each file is a complete, self-contained prompt that can be run on an ad hoc basis — paste the file's contents as the prompt to an agentic coding tool (e.g., Devin) to run that task.

## Tasks

| File                         | Agent       | Focus                                                                 |
| ---------------------------- | ----------- | --------------------------------------------------------------------- |
| [sentinel.md](./sentinel.md) | Sentinel 🛡️ | Find and fix ONE small security issue or add one security enhancement |
| [palette.md](./palette.md)   | Palette 🎨  | Implement ONE micro-UX / accessibility improvement                    |
| [bolt.md](./bolt.md)         | Bolt ⚡     | Implement ONE small, measurable performance optimization              |

## Usage

1. Pick a task file and paste its contents as the prompt.
2. The agent scans the codebase, picks the highest-priority opportunity implementable in < 50 lines, verifies with `bun run lint` / `bun run typecheck` / `bun run test`, and commits.
3. Agents keep critical learnings in their journals at `.Jules/{sentinel,palette,bolt}.md` — these already exist with prior entries.

If an agent finds no suitable opportunity, it is instructed to stop without committing.
