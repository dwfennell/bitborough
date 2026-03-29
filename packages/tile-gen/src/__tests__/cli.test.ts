import { describe, test, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLI = resolve(__dirname, '../cli.ts')

function run(args: string[]): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync('npx', ['tsx', CLI, ...args], {
    encoding: 'utf-8',
    timeout: 15000,
  })
  return {
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() ?? '',
    status: result.status,
  }
}

describe('tile-gen CLI', () => {
  test('--help shows usage', () => {
    const { stdout } = run(['--help'])
    expect(stdout).toContain('tile-gen')
  })

  test('profiles lists available profiles', () => {
    const { stdout } = run(['profiles'])
    expect(stdout).toContain('default')
  })

  test('prompt outputs generation prompt text', () => {
    const { stdout } = run(['prompt', 'fire station, small'])
    expect(stdout).toContain('fire station, small')
    expect(stdout).toContain('SVG Tile Generation')
    expect(stdout).toContain('grass-base')
  })

  test('prompt accepts --profile flag', () => {
    const { stdout } = run(['prompt', 'fire station', '--profile', 'default'])
    expect(stdout).toContain('fire station')
  })

  test('prompt accepts --iterations flag', () => {
    const { stdout } = run(['prompt', 'cafe', '--iterations', '3'])
    expect(stdout).toContain('3')
  })

  test('blind-judge outputs blind judge prompt', () => {
    const { stdout } = run(['blind-judge', '/tmp/fake-tile.png'])
    expect(stdout).toContain('Blind Tile Evaluation')
    expect(stdout).toContain('/tmp/fake-tile.png')
    expect(stdout).not.toContain('grass-base')
  })
})
