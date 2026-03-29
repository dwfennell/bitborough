import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
  statSync,
  copyFileSync,
} from 'node:fs'
import { join } from 'node:path'
import type { EvaluationScores, RunReport } from './types.js'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

export function createRun(
  profile: string,
  prompt: string,
  outputDir: string,
): string {
  const date = new Date().toISOString().slice(0, 10)
  const slug = slugify(prompt)
  const runDir = join(outputDir, profile, `${date}-${slug}`)
  mkdirSync(join(runDir, 'iterations'), { recursive: true })
  return runDir
}

export function writeIteration(
  runDir: string,
  iteration: number,
  svg: string,
  png: Buffer,
  scores: EvaluationScores | null,
): void {
  const iterDir = join(runDir, 'iterations')
  writeFileSync(join(iterDir, `${iteration}.svg`), svg)
  writeFileSync(join(iterDir, `${iteration}.png`), png)
  if (scores) {
    writeFileSync(
      join(iterDir, `${iteration}-scores.json`),
      JSON.stringify(scores, null, 2),
    )
  }
}

export function writeReport(runDir: string, report: RunReport): void {
  writeFileSync(join(runDir, 'report.json'), JSON.stringify(report, null, 2))
}

export function readReport(runDir: string): RunReport {
  const content = readFileSync(join(runDir, 'report.json'), 'utf-8')
  return JSON.parse(content) as RunReport
}

export function writeBestTile(
  runDir: string,
  svg: string,
  png: Buffer,
): void {
  writeFileSync(join(runDir, 'tile.svg'), svg)
  writeFileSync(join(runDir, 'tile.png'), png)
}

export function listRuns(outputDir: string): Array<{
  profile: string
  runId: string
  path: string
}> {
  if (!existsSync(outputDir)) return []
  const results: Array<{ profile: string; runId: string; path: string }> = []

  for (const profile of readdirSync(outputDir)) {
    const profileDir = join(outputDir, profile)
    if (!statSync(profileDir).isDirectory()) continue

    for (const runId of readdirSync(profileDir)) {
      const runDir = join(profileDir, runId)
      if (!statSync(runDir).isDirectory()) continue
      results.push({ profile, runId, path: runDir })
    }
  }

  return results
}

export function promoteToGameAssets(
  runDir: string,
  targetDir: string,
  filename: string,
): void {
  const svgSrc = join(runDir, 'tile.svg')
  if (!existsSync(svgSrc)) {
    throw new Error(`No best tile found in ${runDir}`)
  }
  mkdirSync(targetDir, { recursive: true })
  copyFileSync(svgSrc, join(targetDir, filename))
}
