# Recommended `.gitignore` additions

The root `.gitignore` is locked from automated edits in the Lovable
sandbox, so the rules below must be pasted in manually (GitHub web UI,
your local editor, or a PR). They keep scratch files from AI loops,
test runs, and benchmarks out of the repo so the GitHub sync stays
clean.

## How to apply

1. Open `.gitignore` in your editor (or via GitHub → **Edit this file**).
2. Append the block below to the end of the file.
3. Commit. Future scratch files matching these patterns will be ignored
   automatically. Files that were already removed in this pass
   (`benchmark*.ts`, `*test_results*.txt`, `*.patch`, etc.) will not
   reappear in commits.

## Rules to append

```gitignore
# Test result dumps and scratch outputs
*test_results*.txt
test_output.txt
vitest_output.txt
full_test_results.txt
test_results.json
test-results.json

# Benchmark scratch scripts at repo root
/benchmark.ts
/benchmark[0-9].ts
/benchmark[0-9][0-9].ts
/test_benchmark.ts
/test_mock.ts
/test_style.js
/test_textcontent.html

# Ad-hoc patches and one-off scripts
*.patch
/extract_crises.js
/final_generator.cjs
/fix_type.js

# Working notes / audits (the docs/ folder stays tracked)
/codebase_audit.md
/plan.md

# Verification / agent scratch directories
/verification/
.Jules/
.jules/
.workspace/
.lovable/

# TypeScript incremental build info
*.tsbuildinfo

# Backup/orig files
*.orig
```

After pasting, you can delete this `docs/gitignore-additions.md` file.
