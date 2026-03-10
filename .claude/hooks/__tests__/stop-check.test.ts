import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { describe, test, expect } from 'vitest'

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

  test('runs typecheck and test for affected package when checks pass', async () => {
    const fixture = await createTestFixture()
    try {
      const logFile = join(fixture.tmpDir, 'pnpm-calls.log')
      await fixture.createMockBin('pnpm', `echo "$@" >> "${logFile}"\nexit 0`)

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

      const calls = (await readFile(logFile, 'utf-8')).trim().split('\n')
      expect(calls).toContainEqual(expect.stringContaining('typecheck'))
      expect(calls.some(c => c.includes(' test'))).toBe(false)
    } finally {
      await fixture.cleanup()
    }
  })

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

      const calls = (await readFile(logFile, 'utf-8')).trim().split('\n')
      expect(calls).toContainEqual(expect.stringContaining('@bitborough/engine typecheck'))
      expect(calls).toContainEqual(expect.stringContaining('@bitborough/game typecheck'))
      expect(calls).toContainEqual(expect.stringContaining('@bitborough/engine test'))
      expect(calls).toContainEqual(expect.stringContaining('@bitborough/game test'))
    } finally {
      await fixture.cleanup()
    }
  })
})
