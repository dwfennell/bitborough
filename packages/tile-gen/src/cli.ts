#!/usr/bin/env node
import { Command } from 'commander'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { loadProfile, listProfiles } from './profiles.js'
import {
  assembleGenerationPrompt,
  assembleBlindJudgePrompt,
  assembleEvaluationPrompt,
} from './prompts.js'
import { rasterizeSvg } from './rasterize.js'
import {
  listRuns,
  readReport,
  promoteToGameAssets,
} from './staging.js'
import type { BlindJudgeResult } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROFILES_DIR = resolve(__dirname, '../profiles')
const OUTPUT_DIR = resolve(__dirname, '../output')
const GAME_TILES_DIR = resolve(__dirname, '../../game/assets/tiles')

const program = new Command()
  .name('tile-gen')
  .description('Tile generation harness — prompt assembly, evaluation, and staging')
  .version('0.0.1')

// prompt command
program
  .command('prompt <description>')
  .description('Assemble a generation prompt from a style profile')
  .option('-p, --profile <name>', 'style profile to use', 'default')
  .option('-i, --iterations <n>', 'max iterations', '5')
  .action((description: string, opts: { profile: string; iterations: string }) => {
    const profile = loadProfile(opts.profile, PROFILES_DIR)
    const prompt = assembleGenerationPrompt(profile, description, parseInt(opts.iterations))
    console.log(prompt)
  })

// blind-judge command
program
  .command('blind-judge <png-path>')
  .description('Assemble a blind judge prompt (PNG only, no context)')
  .action((pngPath: string) => {
    const prompt = assembleBlindJudgePrompt(pngPath)
    console.log(prompt)
  })

// evaluate command
program
  .command('evaluate <svg-path>')
  .description('Assemble an informed evaluation prompt')
  .option('-p, --profile <name>', 'style profile', 'default')
  .option('--prompt <text>', 'original generation prompt')
  .option('--png <path>', 'path to rasterized PNG (auto-generated if omitted)')
  .option('--blind-scores <json>', 'JSON array of blind judge results')
  .action((svgPath: string, opts: { profile: string; prompt?: string; png?: string; blindScores?: string }) => {
    const profile = loadProfile(opts.profile, PROFILES_DIR)
    let pngPath = opts.png
    if (!pngPath) {
      const svg = readFileSync(svgPath, 'utf-8')
      const png = rasterizeSvg(svg, profile.defaults.tileSize)
      pngPath = svgPath.replace(/\.svg$/, '.png')
      writeFileSync(pngPath, png)
    }
    const blindScores: BlindJudgeResult[] = opts.blindScores ? JSON.parse(opts.blindScores) : []
    const evalPrompt = assembleEvaluationPrompt(profile, svgPath, pngPath, opts.prompt ?? '(not provided)', blindScores)
    console.log(evalPrompt)
  })

// list command
program
  .command('list')
  .description('List all tiles in staging')
  .action(() => {
    const runs = listRuns(OUTPUT_DIR)
    if (runs.length === 0) {
      console.log('No staged tiles.')
      return
    }
    for (const run of runs) {
      let summary = `${run.profile}/${run.runId}`
      const reportPath = resolve(run.path, 'report.json')
      if (existsSync(reportPath)) {
        const report = readReport(run.path)
        const status = report.finalScores?.overall.pass ? 'PASS' : 'FAIL'
        summary += ` [${status}]`
      }
      console.log(summary)
    }
  })

// show command
program
  .command('show <tile-id>')
  .description('Show scores and feedback for a staged tile')
  .action((tileId: string) => {
    const [profile, runId] = tileId.split('/')
    if (!profile || !runId) {
      console.error('tile-id format: <profile>/<run-id>')
      process.exit(1)
    }
    const runDir = resolve(OUTPUT_DIR, profile, runId)
    if (!existsSync(runDir)) {
      console.error(`Run not found: ${runDir}`)
      process.exit(1)
    }
    const report = readReport(runDir)
    console.log(JSON.stringify(report, null, 2))
  })

// promote command
program
  .command('promote <tile-id>')
  .description('Copy a staged tile to game assets')
  .option('--to <subdirectory>', 'target subdirectory in game assets (e.g., buildings)')
  .option('--as <filename>', 'filename for the promoted tile (e.g., fire-station-small.svg)')
  .action((tileId: string, opts: { to?: string; as?: string }) => {
    const [profile, runId] = tileId.split('/')
    if (!profile || !runId) {
      console.error('tile-id format: <profile>/<run-id>')
      process.exit(1)
    }
    const runDir = resolve(OUTPUT_DIR, profile, runId)
    const targetDir = resolve(GAME_TILES_DIR, opts.to ?? 'buildings')
    const filename = opts.as ?? `${runId}.svg`
    promoteToGameAssets(runDir, targetDir, filename)
    console.log(`Promoted to ${resolve(targetDir, filename)}`)
  })

// profiles command
program
  .command('profiles')
  .description('List available style profiles')
  .action(() => {
    const profiles = listProfiles(PROFILES_DIR)
    for (const name of profiles) {
      const profile = loadProfile(name, PROFILES_DIR)
      console.log(`${name} — ${profile.description}`)
    }
  })

// profile-create command
program
  .command('profile-create <name>')
  .description('Scaffold a new style profile')
  .action((name: string) => {
    const dir = resolve(PROFILES_DIR, name)
    if (existsSync(dir)) {
      console.error(`Profile already exists: ${name}`)
      process.exit(1)
    }
    mkdirSync(resolve(dir, 'references'), { recursive: true })
    writeFileSync(
      resolve(dir, 'profile.yaml'),
      `name: ${name}
description: ""

defaults:
  iterations: 5
  viewBox: "0 0 128 128"
  tileSize: 128

criteria:
  palette:
    threshold: 7
    enabled: true
  structural_correctness:
    threshold: 7
    enabled: true
  scale_fidelity:
    threshold: 7
    enabled: true
  layer_ordering:
    threshold: 7
    enabled: true
  seamless_tiling:
    threshold: 7
    enabled: true
  style_consistency:
    threshold: 5
    enabled: true
  aesthetics:
    threshold: 7
    enabled: true
    guidance: ""
  prompt_fidelity:
    threshold: 7
    enabled: true

palette: {}
`,
    )
    writeFileSync(resolve(dir, 'style-guide.md'), `# ${name} Style Guide\n\nDescribe the visual style for this profile.\n`)
    console.log(`Created profile scaffold at ${dir}`)
  })

program.parse()
