import { describe, test, expect } from 'vitest'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadProfile, listProfiles } from '../profiles.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROFILES_DIR = resolve(__dirname, '../../profiles')

describe('loadProfile', () => {
  test('loads default profile with all required fields', () => {
    const profile = loadProfile('default', PROFILES_DIR)
    expect(profile.name).toBe('default')
    expect(profile.description).toBeTypeOf('string')
    expect(profile.defaults.iterations).toBeTypeOf('number')
    expect(profile.defaults.viewBox).toBe('0 0 128 128')
    expect(profile.defaults.tileSize).toBe(128)
    expect(Object.keys(profile.palette).length).toBeGreaterThan(0)
    expect(profile.styleGuide.length).toBeGreaterThan(0)
    expect(profile.criteria.palette.threshold).toBeTypeOf('number')
    expect(profile.criteria.palette.enabled).toBe(true)
  })

  test('throws for nonexistent profile', () => {
    expect(() => loadProfile('nonexistent', PROFILES_DIR)).toThrow()
  })
})

describe('listProfiles', () => {
  test('includes default profile', () => {
    const profiles = listProfiles(PROFILES_DIR)
    expect(profiles).toContain('default')
  })
})
