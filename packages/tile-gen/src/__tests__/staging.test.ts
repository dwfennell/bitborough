import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  createRun,
  writeIteration,
  writeReport,
  readReport,
  listRuns,
} from '../staging.js'
import type { RunReport, EvaluationScores } from '../types.js'

let outputDir: string

beforeEach(() => {
  outputDir = mkdtempSync(join(tmpdir(), 'tile-gen-test-'))
})

afterEach(() => {
  rmSync(outputDir, { recursive: true, force: true })
})

function makeDummyScores(): EvaluationScores {
  const criterion = { score: 8, feedback: 'good' }
  return {
    palette: criterion,
    structural_correctness: criterion,
    scale_fidelity: criterion,
    layer_ordering: criterion,
    seamless_tiling: criterion,
    style_consistency: criterion,
    aesthetics: criterion,
    prompt_fidelity: criterion,
    blindJudges: [],
    overall: { pass: true, feedback: 'Looks great' },
  }
}

describe('staging', () => {
  test('createRun returns a run directory that exists', () => {
    const runDir = createRun('default', 'fire station', outputDir)
    expect(runDir).toContain('default')
  })

  test('writeIteration saves SVG and PNG files', () => {
    const runDir = createRun('default', 'fire station', outputDir)
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect fill="red" width="128" height="128"/></svg>'
    const pngBuffer = Buffer.from('fake-png')

    writeIteration(runDir, 1, svgContent, pngBuffer, null)

    const savedSvg = readFileSync(join(runDir, 'iterations', '1.svg'), 'utf-8')
    expect(savedSvg).toBe(svgContent)
    const savedPng = readFileSync(join(runDir, 'iterations', '1.png'))
    expect(savedPng.toString()).toBe('fake-png')
  })

  test('writeIteration saves scores when provided', () => {
    const runDir = createRun('default', 'fire station', outputDir)
    const scores = makeDummyScores()
    writeIteration(runDir, 1, '<svg/>', Buffer.from('png'), scores)

    const saved = JSON.parse(
      readFileSync(join(runDir, 'iterations', '1-scores.json'), 'utf-8'),
    )
    expect(saved.palette.score).toBe(8)
  })

  test('writeReport and readReport roundtrip', () => {
    const runDir = createRun('default', 'fire station', outputDir)
    const report: RunReport = {
      runId: 'test-run',
      profile: 'default',
      prompt: 'fire station',
      iterations: [],
      bestIteration: 1,
      finalScores: makeDummyScores(),
      createdAt: new Date().toISOString(),
    }
    writeReport(runDir, report)
    const loaded = readReport(runDir)
    expect(loaded.prompt).toBe('fire station')
    expect(loaded.finalScores?.overall.pass).toBe(true)
  })

  test('listRuns returns run directories', () => {
    createRun('default', 'fire station', outputDir)
    createRun('default', 'police station', outputDir)
    const runs = listRuns(outputDir)
    expect(runs.length).toBe(2)
  })
})
