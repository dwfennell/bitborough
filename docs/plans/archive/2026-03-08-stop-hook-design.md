# Stop Hook: Automated Typecheck & Test Verification

> **Status:** DONE — Implemented and shipped.

## Overview

A Claude Code Stop hook that automatically verifies typecheck and tests pass for affected packages after every response. Uses a bash script for fast gating and spawns `claude -p` to fix failures.

## Architecture

Single command hook in `.claude/settings.json` pointing to `.claude/hooks/stop-check.sh`.

### Flow

```
Stop event fires
  → stop-check.sh runs
  → git diff --name-only HEAD
  → filter to .ts/.tsx files
  → no TS changes? → exit 0 (Claude stops)
  → map files to packages, deduplicate
  → run pnpm --filter <pkg> typecheck for each
  → run pnpm --filter <pkg> test for each
  → all pass? → exit 0 (Claude stops)
  → failures? → invoke claude -p with error context
  → re-run failing checks
  → pass? → exit 0
  → still failing? → retry (up to 2 attempts)
  → give up → exit 2 (stderr fed back to main Claude)
```

### Exit codes

- `0` — all checks pass (or no TS files changed), Claude stops normally
- `2` — checks still failing after retries, stderr contains errors fed back to main Claude

## Hook Config

`.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/stop-check.sh",
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

Timeout is 300s to allow for up to 2 `claude -p` fix attempts.

## Script: `.claude/hooks/stop-check.sh`

### Responsibilities

1. Run `git diff --name-only HEAD` to get changed files
2. Filter to `*.ts` and `*.tsx` only
3. Extract package names from paths matching `packages/<name>/...`
4. Deduplicate package names
5. Skip packages without relevant scripts (e.g., `core` has no test script)
6. Run `pnpm --filter @bitborough/<pkg> typecheck` for each affected package
7. Run `pnpm --filter @bitborough/<pkg> test` for each affected package
8. Collect failures (package name, command, output)
9. If failures exist, invoke `claude -p` with structured error context
10. Re-run only the previously failing checks
11. Retry up to `MAX_RETRIES=2` times
12. Exit 0 if all pass, exit 2 with stderr if still failing

### Package mapping

Files under `packages/<name>/` map to `@bitborough/<name>`. Only packages with a matching script in their `package.json` are checked (e.g., `core` has `typecheck` but no `test`).

### claude -p invocation

```bash
claude -p "The following typecheck/test failures were found. Fix them and verify by re-running the failing commands.

$collected_errors"
```

## Tests: `.claude/hooks/__tests__/stop-check.test.ts`

Tests use vitest + `child_process.execFile` against temp git repos.

### Test cases

1. **No changes** — empty git diff → exit 0, no commands run
2. **Non-TS changes only** — `.md`, `.json`, `.css` files changed → exit 0
3. **TS changes, all checks pass** — exit 0
4. **TS changes, typecheck fails** — exit 2, stderr contains typecheck errors
5. **TS changes, test fails** — exit 2, stderr contains test errors
6. **Package without test script** — `core` changes → runs typecheck only, skips test
7. **Multiple packages affected** — changes in engine + game → checks both
8. **claude -p invocation** — mock `claude` binary, verify called with failure context
9. **Agent fixes the issue** — mock successful re-run after agent → exit 0
10. **Agent fails to fix** — re-run still fails after MAX_RETRIES → exit 2
11. **Files outside packages/** — e.g., root config changes → no packages affected → exit 0

### Test strategy

- Create temp directories with mock git repos (`git init`, stage files, commit, then modify)
- Mock `claude` binary with a simple script that exits 0
- Override PATH to inject mocks
- Override `pnpm` with a mock that returns pass/fail based on test scenario
- Set working directory to temp repo for each test
