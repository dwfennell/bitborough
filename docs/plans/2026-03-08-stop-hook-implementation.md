# Stop Hook Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a tested bash script that runs as a Claude Code Stop hook, verifying typecheck/tests on affected packages and spawning `claude -p` to fix failures.

**Architecture:** Single command hook calls `.claude/hooks/stop-check.sh`. Script checks git diff for TS changes, maps to packages, runs checks, spawns `claude -p` on failure with retry loop. Tests use vitest with mocked binaries in temp git repos.

**Tech Stack:** Bash, vitest, child_process.execFile, temp git repos for test fixtures

---

### Task 1: Scaffold test infrastructure

**Files:**
- Create: `.claude/hooks/__tests__/stop-check.test.ts`
- Create: `.claude/hooks/__tests__/vitest.config.ts`

**Step 1: Create vitest config for hook tests**

Create `.claude/hooks/__tests__/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000,
  },
})
```

**Step 2: Create test file with helper utilities and first test**

Create `.claude/hooks/__tests__/stop-check.test.ts`:

```typescript
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { describe, test, expect, beforeEach, afterEach } from 'vitest'

const execFileAsync = promisify(execFile)

const SCRIPT_PATH = join(__dirname, '..', 'stop-check.sh')

interface RunResult {
  exitCode: number
  stdout: string
  stderr: string
}

async function runScript(env: Record<string, string> = {}): Promise<RunResult> {
  try {
    const { stdout, stderr } = await execFileAsync('bash', [SCRIPT_PATH], {
      env: { ...process.env, ...env },
      timeout: 15000,
    })
    return { exitCode: 0, stdout, stderr }
  } catch (err: any) {
    return {
      exitCode: err.code ?? 1,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
    }
  }
}

/**
 * Creates a temp directory with:
 * - A git repo with an initial commit
 * - A mock bin/ directory prepended to PATH
 * - Helper to create mock executables
 */
async function createTestFixture() {
  const tmpDir = await mkdtemp(join(tmpdir(), 'stop-check-'))
  const mockBinDir = join(tmpDir, 'mock-bin')
  await mkdir(mockBinDir)

  // Init git repo with initial commit
  await execFileAsync('git', ['init'], { cwd: tmpDir })
  await execFileAsync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@test.com', 'commit', '--allow-empty', '-m', 'initial'], { cwd: tmpDir })

  async function createMockBin(name: string, script: string) {
    const path = join(mockBinDir, name)
    await writeFile(path, `#!/bin/bash\n${script}`, { mode: 0o755 })
  }

  // Default mock: pnpm always succeeds
  await createMockBin('pnpm', 'exit 0')

  // Default mock: claude always succeeds
  await createMockBin('claude', 'exit 0')

  const env: Record<string, string> = {
    PATH: `${mockBinDir}:${process.env.PATH}`,
    GIT_DIR: join(tmpDir, '.git'),
    GIT_WORK_TREE: tmpDir,
    STOP_CHECK_PROJECT_ROOT: tmpDir,
  }

  return { tmpDir, mockBinDir, createMockBin, env, cleanup: () => rm(tmpDir, { recursive: true, force: true }) }
}

describe('stop-check.sh', () => {
  test('exits 0 when no files changed', async () => {
    const fixture = await createTestFixture()
    try {
      const result = await runScript(fixture.env)
      expect(result.exitCode).toBe(0)
    } finally {
      await fixture.cleanup()
    }
  })
})
```

**Step 3: Verify the test file is syntactically valid**

Run: `cd /Users/dustin/Documents/src/bitborough && npx vitest run --config .claude/hooks/__tests__/vitest.config.ts .claude/hooks/__tests__/stop-check.test.ts 2>&1 | tail -20`

Expected: Test fails because `stop-check.sh` doesn't exist yet — that's correct.

**Step 4: Commit**

```bash
git add .claude/hooks/__tests__/stop-check.test.ts .claude/hooks/__tests__/vitest.config.ts
git commit -m "test: scaffold stop-check hook test infrastructure"
```

---

### Task 2: Write the stop-check.sh script (minimal — exits 0 for no changes)

**Files:**
- Create: `.claude/hooks/stop-check.sh`

**Step 1: Write the first failing test (already written in Task 1)**

The test from Task 1 (`exits 0 when no files changed`) is our first test case.

**Step 2: Run test to verify it fails**

Run: `cd /Users/dustin/Documents/src/bitborough && npx vitest run --config .claude/hooks/__tests__/vitest.config.ts .claude/hooks/__tests__/stop-check.test.ts 2>&1 | tail -20`

Expected: FAIL — `stop-check.sh` not found

**Step 3: Create minimal stop-check.sh**

Create `.claude/hooks/stop-check.sh`:

```bash
#!/bin/bash
set -euo pipefail

# Resolve project root: use STOP_CHECK_PROJECT_ROOT if set (for testing),
# otherwise use the git working tree root
PROJECT_ROOT="${STOP_CHECK_PROJECT_ROOT:-$(git rev-parse --show-toplevel)}"

# Get changed files compared to last commit
CHANGED_FILES=$(git diff --name-only HEAD -- "$PROJECT_ROOT" 2>/dev/null || true)

# Filter to .ts/.tsx files only
TS_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(tsx?)$' || true)

# No TypeScript files changed — nothing to check
if [ -z "$TS_FILES" ]; then
  exit 0
fi
```

Make executable: `chmod +x .claude/hooks/stop-check.sh`

**Step 4: Run test to verify it passes**

Run: `cd /Users/dustin/Documents/src/bitborough && npx vitest run --config .claude/hooks/__tests__/vitest.config.ts .claude/hooks/__tests__/stop-check.test.ts 2>&1 | tail -20`

Expected: PASS

**Step 5: Commit**

```bash
git add .claude/hooks/stop-check.sh
git commit -m "feat: add stop-check.sh with no-change fast path"
```

---

### Task 3: Add test for non-TS changes and files-outside-packages

**Files:**
- Modify: `.claude/hooks/__tests__/stop-check.test.ts`

**Step 1: Write failing tests**

Add to the `describe` block in `stop-check.test.ts`:

```typescript
  test('exits 0 when only non-TS files changed', async () => {
    const fixture = await createTestFixture()
    try {
      // Create and commit a file, then modify it (so git diff HEAD shows changes)
      await writeFile(join(fixture.tmpDir, 'README.md'), 'hello')
      await execFileAsync('git', ['add', 'README.md'], { cwd: fixture.tmpDir })
      await execFileAsync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@test.com', 'commit', '-m', 'add readme'], { cwd: fixture.tmpDir })
      await writeFile(join(fixture.tmpDir, 'README.md'), 'changed')

      const result = await runScript(fixture.env)
      expect(result.exitCode).toBe(0)
    } finally {
      await fixture.cleanup()
    }
  })

  test('exits 0 when TS files changed outside packages/', async () => {
    const fixture = await createTestFixture()
    try {
      // Create a TS file at root (not in packages/)
      await writeFile(join(fixture.tmpDir, 'config.ts'), 'export const x = 1')
      await execFileAsync('git', ['add', 'config.ts'], { cwd: fixture.tmpDir })
      await execFileAsync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@test.com', 'commit', '-m', 'add config'], { cwd: fixture.tmpDir })
      await writeFile(join(fixture.tmpDir, 'config.ts'), 'export const x = 2')

      const result = await runScript(fixture.env)
      expect(result.exitCode).toBe(0)
    } finally {
      await fixture.cleanup()
    }
  })
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/dustin/Documents/src/bitborough && npx vitest run --config .claude/hooks/__tests__/vitest.config.ts .claude/hooks/__tests__/stop-check.test.ts 2>&1 | tail -20`

Expected: First test should PASS (no TS files = early exit). Second test will likely FAIL because the script currently doesn't distinguish packages/ vs non-packages/ paths.

**Step 3: Update stop-check.sh to extract and filter packages**

Replace the end of `.claude/hooks/stop-check.sh` (after the TS_FILES filter) with:

```bash
# Extract unique package names from paths like packages/<name>/...
PACKAGES=$(echo "$TS_FILES" | grep -oE '^packages/[^/]+' | sed 's|^packages/||' | sort -u || true)

# No packages affected — nothing to check
if [ -z "$PACKAGES" ]; then
  exit 0
fi
```

**Step 4: Run tests to verify they pass**

Run: `cd /Users/dustin/Documents/src/bitborough && npx vitest run --config .claude/hooks/__tests__/vitest.config.ts .claude/hooks/__tests__/stop-check.test.ts 2>&1 | tail -20`

Expected: All PASS

**Step 5: Commit**

```bash
git add .claude/hooks/__tests__/stop-check.test.ts .claude/hooks/stop-check.sh
git commit -m "feat: filter to TS changes within packages/ only"
```

---

### Task 4: Add package check execution (typecheck + test)

**Files:**
- Modify: `.claude/hooks/__tests__/stop-check.test.ts`
- Modify: `.claude/hooks/stop-check.sh`

**Step 1: Write failing tests**

Add to `stop-check.test.ts`:

```typescript
  test('runs typecheck and test for affected package when checks pass', async () => {
    const fixture = await createTestFixture()
    try {
      // Track what pnpm was called with
      const logFile = join(fixture.tmpDir, 'pnpm-calls.log')
      await fixture.createMockBin('pnpm', `echo "$@" >> "${logFile}"\nexit 0`)

      // Create package structure with package.json that has both scripts
      await mkdir(join(fixture.tmpDir, 'packages', 'engine', 'src'), { recursive: true })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'package.json'), JSON.stringify({
        name: '@bitborough/engine',
        scripts: { typecheck: 'tsc --noEmit', test: 'vitest run' }
      }))
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x = 1')
      await execFileAsync('git', ['add', '.'], { cwd: fixture.tmpDir })
      await execFileAsync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@test.com', 'commit', '-m', 'add engine'], { cwd: fixture.tmpDir })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x = 2')

      const result = await runScript(fixture.env)
      expect(result.exitCode).toBe(0)

      const { readFile } = await import('node:fs/promises')
      const calls = (await readFile(logFile, 'utf-8')).trim().split('\n')
      expect(calls).toContainEqual(expect.stringContaining('--filter @bitborough/engine typecheck'))
      expect(calls).toContainEqual(expect.stringContaining('--filter @bitborough/engine test'))
    } finally {
      await fixture.cleanup()
    }
  })

  test('exits 2 when typecheck fails', async () => {
    const fixture = await createTestFixture()
    try {
      await fixture.createMockBin('pnpm', `
if echo "$@" | grep -q "typecheck"; then
  echo "error TS2322: Type 'string' is not assignable to type 'number'" >&2
  exit 1
fi
exit 0
`)

      await mkdir(join(fixture.tmpDir, 'packages', 'engine', 'src'), { recursive: true })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'package.json'), JSON.stringify({
        name: '@bitborough/engine',
        scripts: { typecheck: 'tsc --noEmit', test: 'vitest run' }
      }))
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x = 1')
      await execFileAsync('git', ['add', '.'], { cwd: fixture.tmpDir })
      await execFileAsync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@test.com', 'commit', '-m', 'add engine'], { cwd: fixture.tmpDir })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x: number = "bad"')

      const result = await runScript(fixture.env)
      expect(result.exitCode).toBe(2)
      expect(result.stderr).toContain('typecheck')
    } finally {
      await fixture.cleanup()
    }
  })

  test('exits 2 when test fails', async () => {
    const fixture = await createTestFixture()
    try {
      await fixture.createMockBin('pnpm', `
if echo "$@" | grep -q " test$"; then
  echo "FAIL src/__tests__/foo.test.ts" >&2
  exit 1
fi
exit 0
`)

      await mkdir(join(fixture.tmpDir, 'packages', 'engine', 'src'), { recursive: true })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'package.json'), JSON.stringify({
        name: '@bitborough/engine',
        scripts: { typecheck: 'tsc --noEmit', test: 'vitest run' }
      }))
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x = 1')
      await execFileAsync('git', ['add', '.'], { cwd: fixture.tmpDir })
      await execFileAsync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@test.com', 'commit', '-m', 'add engine'], { cwd: fixture.tmpDir })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x = 2')

      const result = await runScript(fixture.env)
      expect(result.exitCode).toBe(2)
      expect(result.stderr).toContain('test')
    } finally {
      await fixture.cleanup()
    }
  })

  test('skips test for package without test script', async () => {
    const fixture = await createTestFixture()
    try {
      const logFile = join(fixture.tmpDir, 'pnpm-calls.log')
      await fixture.createMockBin('pnpm', `echo "$@" >> "${logFile}"\nexit 0`)

      // core has typecheck but no test
      await mkdir(join(fixture.tmpDir, 'packages', 'core', 'src'), { recursive: true })
      await writeFile(join(fixture.tmpDir, 'packages', 'core', 'package.json'), JSON.stringify({
        name: '@bitborough/core',
        scripts: { typecheck: 'tsc --noEmit' }
      }))
      await writeFile(join(fixture.tmpDir, 'packages', 'core', 'src', 'types.ts'), 'export type X = number')
      await execFileAsync('git', ['add', '.'], { cwd: fixture.tmpDir })
      await execFileAsync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@test.com', 'commit', '-m', 'add core'], { cwd: fixture.tmpDir })
      await writeFile(join(fixture.tmpDir, 'packages', 'core', 'src', 'types.ts'), 'export type X = string')

      const result = await runScript(fixture.env)
      expect(result.exitCode).toBe(0)

      const { readFile } = await import('node:fs/promises')
      const calls = (await readFile(logFile, 'utf-8')).trim().split('\n')
      expect(calls).toContainEqual(expect.stringContaining('typecheck'))
      expect(calls.some(c => c.includes(' test'))).toBe(false)
    } finally {
      await fixture.cleanup()
    }
  })

  test('checks multiple affected packages', async () => {
    const fixture = await createTestFixture()
    try {
      const logFile = join(fixture.tmpDir, 'pnpm-calls.log')
      await fixture.createMockBin('pnpm', `echo "$@" >> "${logFile}"\nexit 0`)

      for (const pkg of ['engine', 'game']) {
        await mkdir(join(fixture.tmpDir, 'packages', pkg, 'src'), { recursive: true })
        await writeFile(join(fixture.tmpDir, 'packages', pkg, 'package.json'), JSON.stringify({
          name: `@bitborough/${pkg}`,
          scripts: { typecheck: 'tsc --noEmit', test: 'vitest run' }
        }))
        await writeFile(join(fixture.tmpDir, 'packages', pkg, 'src', 'index.ts'), 'export const x = 1')
      }
      await execFileAsync('git', ['add', '.'], { cwd: fixture.tmpDir })
      await execFileAsync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@test.com', 'commit', '-m', 'add packages'], { cwd: fixture.tmpDir })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x = 2')
      await writeFile(join(fixture.tmpDir, 'packages', 'game', 'src', 'index.ts'), 'export const x = 2')

      const result = await runScript(fixture.env)
      expect(result.exitCode).toBe(0)

      const { readFile } = await import('node:fs/promises')
      const calls = (await readFile(logFile, 'utf-8')).trim().split('\n')
      expect(calls).toContainEqual(expect.stringContaining('@bitborough/engine typecheck'))
      expect(calls).toContainEqual(expect.stringContaining('@bitborough/game typecheck'))
      expect(calls).toContainEqual(expect.stringContaining('@bitborough/engine test'))
      expect(calls).toContainEqual(expect.stringContaining('@bitborough/game test'))
    } finally {
      await fixture.cleanup()
    }
  })
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/dustin/Documents/src/bitborough && npx vitest run --config .claude/hooks/__tests__/vitest.config.ts .claude/hooks/__tests__/stop-check.test.ts 2>&1 | tail -30`

Expected: New tests FAIL — script doesn't run checks yet

**Step 3: Add check execution to stop-check.sh**

Append to `.claude/hooks/stop-check.sh` after the PACKAGES extraction:

```bash
MAX_RETRIES=2
FAILURES=""

# Check if a package.json has a given script
has_script() {
  local pkg_dir="$PROJECT_ROOT/packages/$1"
  local script="$2"
  if [ -f "$pkg_dir/package.json" ]; then
    grep -q "\"$script\"" "$pkg_dir/package.json" 2>/dev/null
  else
    return 1
  fi
}

# Run checks for all affected packages, collect failures
run_checks() {
  local failures=""

  for pkg in $PACKAGES; do
    if has_script "$pkg" "typecheck"; then
      local output
      if ! output=$(pnpm --filter "@bitborough/$pkg" typecheck 2>&1); then
        failures="${failures}\n--- @bitborough/${pkg} typecheck FAILED ---\n${output}\n"
      fi
    fi

    if has_script "$pkg" "test"; then
      local output
      if ! output=$(pnpm --filter "@bitborough/$pkg" test 2>&1); then
        failures="${failures}\n--- @bitborough/${pkg} test FAILED ---\n${output}\n"
      fi
    fi
  done

  echo "$failures"
}

FAILURES=$(run_checks)

# All checks passed
if [ -z "$FAILURES" ]; then
  exit 0
fi

# Checks failed — report to stderr
echo -e "The following checks failed:\n$FAILURES" >&2
exit 2
```

**Step 4: Run tests to verify they pass**

Run: `cd /Users/dustin/Documents/src/bitborough && npx vitest run --config .claude/hooks/__tests__/vitest.config.ts .claude/hooks/__tests__/stop-check.test.ts 2>&1 | tail -30`

Expected: All PASS

**Step 5: Commit**

```bash
git add .claude/hooks/stop-check.sh .claude/hooks/__tests__/stop-check.test.ts
git commit -m "feat: run typecheck and test for affected packages"
```

---

### Task 5: Add claude -p retry loop

**Files:**
- Modify: `.claude/hooks/__tests__/stop-check.test.ts`
- Modify: `.claude/hooks/stop-check.sh`

**Step 1: Write failing tests**

Add to `stop-check.test.ts`:

```typescript
  test('invokes claude -p with failure context when checks fail', async () => {
    const fixture = await createTestFixture()
    try {
      const claudeLogFile = join(fixture.tmpDir, 'claude-calls.log')

      // pnpm typecheck fails on first call, succeeds after claude fixes
      const callCountFile = join(fixture.tmpDir, 'pnpm-call-count')
      await writeFile(callCountFile, '0')
      await fixture.createMockBin('pnpm', `
count=$(cat "${callCountFile}")
count=$((count + 1))
echo $count > "${callCountFile}"
if [ $count -le 2 ] && echo "$@" | grep -q "typecheck"; then
  echo "error TS2322: Type error" >&2
  exit 1
fi
exit 0
`)
      // claude mock: log the prompt, exit 0
      await fixture.createMockBin('claude', `echo "$@" >> "${claudeLogFile}"\nexit 0`)

      await mkdir(join(fixture.tmpDir, 'packages', 'engine', 'src'), { recursive: true })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'package.json'), JSON.stringify({
        name: '@bitborough/engine',
        scripts: { typecheck: 'tsc --noEmit', test: 'vitest run' }
      }))
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x = 1')
      await execFileAsync('git', ['add', '.'], { cwd: fixture.tmpDir })
      await execFileAsync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@test.com', 'commit', '-m', 'add engine'], { cwd: fixture.tmpDir })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x = 2')

      const result = await runScript(fixture.env)
      expect(result.exitCode).toBe(0)

      const { readFile } = await import('node:fs/promises')
      const claudeCalls = await readFile(claudeLogFile, 'utf-8')
      expect(claudeCalls).toContain('-p')
      expect(claudeCalls).toContain('typecheck')
    } finally {
      await fixture.cleanup()
    }
  })

  test('exits 2 after MAX_RETRIES when claude cannot fix', async () => {
    const fixture = await createTestFixture()
    try {
      // pnpm always fails
      await fixture.createMockBin('pnpm', `
if echo "$@" | grep -q "typecheck"; then
  echo "error TS2322: Unfixable error" >&2
  exit 1
fi
exit 0
`)
      await fixture.createMockBin('claude', 'exit 0')

      await mkdir(join(fixture.tmpDir, 'packages', 'engine', 'src'), { recursive: true })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'package.json'), JSON.stringify({
        name: '@bitborough/engine',
        scripts: { typecheck: 'tsc --noEmit', test: 'vitest run' }
      }))
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x = 1')
      await execFileAsync('git', ['add', '.'], { cwd: fixture.tmpDir })
      await execFileAsync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@test.com', 'commit', '-m', 'add engine'], { cwd: fixture.tmpDir })
      await writeFile(join(fixture.tmpDir, 'packages', 'engine', 'src', 'index.ts'), 'export const x = 2')

      const result = await runScript(fixture.env)
      expect(result.exitCode).toBe(2)
      expect(result.stderr).toContain('typecheck')
    } finally {
      await fixture.cleanup()
    }
  })
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/dustin/Documents/src/bitborough && npx vitest run --config .claude/hooks/__tests__/vitest.config.ts .claude/hooks/__tests__/stop-check.test.ts 2>&1 | tail -30`

Expected: New tests FAIL — script exits 2 immediately without retrying

**Step 3: Add retry loop with claude -p to stop-check.sh**

Replace the failure block at the end of `stop-check.sh` (everything after `run_checks` function) with:

```bash
FAILURES=$(run_checks)

# All checks passed
if [ -z "$FAILURES" ]; then
  exit 0
fi

# Retry loop: invoke claude -p to fix, then re-check
for attempt in $(seq 1 $MAX_RETRIES); do
  claude -p "The following typecheck/test failures were found in this project. Fix them and verify your fix by re-running the failing commands.

$FAILURES" 2>/dev/null

  FAILURES=$(run_checks)

  if [ -z "$FAILURES" ]; then
    exit 0
  fi
done

# Still failing after retries — report to main Claude via stderr
echo -e "Checks still failing after $MAX_RETRIES fix attempts:\n$FAILURES" >&2
exit 2
```

**Step 4: Run tests to verify they pass**

Run: `cd /Users/dustin/Documents/src/bitborough && npx vitest run --config .claude/hooks/__tests__/vitest.config.ts .claude/hooks/__tests__/stop-check.test.ts 2>&1 | tail -30`

Expected: All PASS

**Step 5: Commit**

```bash
git add .claude/hooks/stop-check.sh .claude/hooks/__tests__/stop-check.test.ts
git commit -m "feat: add claude -p retry loop for auto-fixing failures"
```

---

### Task 6: Update hook config and gitignore

**Files:**
- Modify: `.claude/settings.json`
- Modify: `.gitignore`

**Step 1: Update `.claude/settings.json` to use the command hook**

Replace entire contents of `.claude/settings.json`:

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

**Step 2: Update `.gitignore` to allow hooks directory**

The current `.gitignore` has:

```
.claude/**
!.claude/settings.json
```

Update to also allow the hooks directory:

```
.claude/**
!.claude/settings.json
!.claude/hooks/
!.claude/hooks/**
```

**Step 3: Verify gitignore works**

Run: `git status` — should show `.claude/hooks/` files as trackable.

**Step 4: Commit**

```bash
git add .gitignore .claude/settings.json .claude/hooks/stop-check.sh .claude/hooks/__tests__/stop-check.test.ts .claude/hooks/__tests__/vitest.config.ts
git commit -m "feat: wire up stop-check command hook with gitignore exceptions"
```

---

### Task 7: Final verification

**Step 1: Run the full test suite**

Run: `cd /Users/dustin/Documents/src/bitborough && npx vitest run --config .claude/hooks/__tests__/vitest.config.ts .claude/hooks/__tests__/stop-check.test.ts`

Expected: All 9 tests pass.

**Step 2: Run the script manually to verify it works in the real repo**

Run: `cd /Users/dustin/Documents/src/bitborough && bash .claude/hooks/stop-check.sh; echo "Exit code: $?"`

Expected: Exit code 0 (no uncommitted TS changes).

**Step 3: Verify the existing project tests still pass**

Run: `cd /Users/dustin/Documents/src/bitborough && pnpm -r test`

Expected: All existing tests pass.
