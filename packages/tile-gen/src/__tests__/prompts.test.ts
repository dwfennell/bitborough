import { describe, test, expect } from 'vitest'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadProfile } from '../profiles.js'
import {
  assembleGenerationPrompt,
  assembleBlindJudgePrompt,
  assembleEvaluationPrompt,
} from '../prompts.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROFILES_DIR = resolve(__dirname, '../../profiles')

describe('assembleGenerationPrompt', () => {
  test('includes the tile description', () => {
    const profile = loadProfile('default', PROFILES_DIR)
    const prompt = assembleGenerationPrompt(profile, 'fire station, small', 5)
    expect(prompt).toContain('fire station, small')
  })

  test('includes the style guide', () => {
    const profile = loadProfile('default', PROFILES_DIR)
    const prompt = assembleGenerationPrompt(profile, 'fire station, small', 5)
    expect(prompt).toContain('ViewBox')
    expect(prompt).toContain('0 0 128 128')
  })

  test('includes the palette', () => {
    const profile = loadProfile('default', PROFILES_DIR)
    const prompt = assembleGenerationPrompt(profile, 'fire station, small', 5)
    expect(prompt).toContain('grass-base')
    expect(prompt).toContain('#8cc870')
  })

  test('includes reference SVGs', () => {
    const profile = loadProfile('default', PROFILES_DIR)
    const prompt = assembleGenerationPrompt(profile, 'fire station, small', 5)
    expect(prompt).toContain('grass.svg')
  })

  test('includes evaluation criteria', () => {
    const profile = loadProfile('default', PROFILES_DIR)
    const prompt = assembleGenerationPrompt(profile, 'fire station, small', 5)
    expect(prompt).toContain('palette')
    expect(prompt).toContain('threshold')
  })

  test('includes iteration count', () => {
    const profile = loadProfile('default', PROFILES_DIR)
    const prompt = assembleGenerationPrompt(profile, 'fire station, small', 3)
    expect(prompt).toContain('3')
  })
})

describe('assembleBlindJudgePrompt', () => {
  test('does not include profile or style guide content', () => {
    const prompt = assembleBlindJudgePrompt('/path/to/tile.png')
    expect(prompt).toContain('tile.png')
    expect(prompt).not.toContain('grass-base')
    expect(prompt).not.toContain('ViewBox')
  })

  test('asks for quality and identification', () => {
    const prompt = assembleBlindJudgePrompt('/path/to/tile.png')
    expect(prompt).toContain('quality')
    expect(prompt).toContain('identify')
  })
})

describe('assembleEvaluationPrompt', () => {
  test('includes SVG source path', () => {
    const profile = loadProfile('default', PROFILES_DIR)
    const prompt = assembleEvaluationPrompt(
      profile,
      '/path/to/tile.svg',
      '/path/to/tile.png',
      'fire station, small',
      [],
    )
    expect(prompt).toContain('tile.svg')
  })

  test('includes blind judge scores when provided', () => {
    const profile = loadProfile('default', PROFILES_DIR)
    const blindScores = [
      { quality: 7, identifiedAs: 'fire station', impression: 'warm and inviting' },
    ]
    const prompt = assembleEvaluationPrompt(
      profile,
      '/path/to/tile.svg',
      '/path/to/tile.png',
      'fire station, small',
      blindScores,
    )
    expect(prompt).toContain('fire station')
    expect(prompt).toContain('warm and inviting')
  })

  test('includes all enabled criteria with thresholds', () => {
    const profile = loadProfile('default', PROFILES_DIR)
    const prompt = assembleEvaluationPrompt(
      profile,
      '/path/to/tile.svg',
      '/path/to/tile.png',
      'fire station, small',
      [],
    )
    expect(prompt).toContain('palette')
    expect(prompt).toContain('structural_correctness')
    expect(prompt).toContain('aesthetics')
  })
})
