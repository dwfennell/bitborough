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
})
