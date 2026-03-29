import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import type { Profile, ProfileCriteria, CriterionConfig } from './types.js'

const DEFAULT_CRITERION: CriterionConfig = {
  threshold: 7,
  enabled: true,
}

function defaultCriteria(): ProfileCriteria {
  return {
    palette: { ...DEFAULT_CRITERION },
    structural_correctness: { ...DEFAULT_CRITERION, threshold: 8 },
    scale_fidelity: { ...DEFAULT_CRITERION },
    layer_ordering: { ...DEFAULT_CRITERION },
    seamless_tiling: { ...DEFAULT_CRITERION },
    style_consistency: { ...DEFAULT_CRITERION },
    aesthetics: { ...DEFAULT_CRITERION },
    prompt_fidelity: { ...DEFAULT_CRITERION },
  }
}

export function loadProfile(name: string, profilesDir: string): Profile {
  const dir = join(profilesDir, name)
  if (!existsSync(dir)) {
    throw new Error(`Profile not found: ${name} (looked in ${dir})`)
  }

  const yamlPath = join(dir, 'profile.yaml')
  const raw = existsSync(yamlPath)
    ? parseYaml(readFileSync(yamlPath, 'utf-8'))
    : {}

  const styleGuidePath = join(dir, 'style-guide.md')
  const styleGuide = existsSync(styleGuidePath)
    ? readFileSync(styleGuidePath, 'utf-8')
    : ''

  const refsDir = join(dir, 'references')
  const referenceSvgs: Array<{ name: string; content: string }> = []
  if (existsSync(refsDir)) {
    for (const file of readdirSync(refsDir)) {
      if (file.endsWith('.svg')) {
        referenceSvgs.push({
          name: file,
          content: readFileSync(join(refsDir, file), 'utf-8'),
        })
      }
    }
  }

  const criteria = defaultCriteria()
  if (raw.criteria) {
    for (const [key, val] of Object.entries(raw.criteria)) {
      if (key in criteria) {
        const k = key as keyof ProfileCriteria
        const v = val as Partial<CriterionConfig>
        criteria[k] = { ...criteria[k], ...v }
      }
    }
  }

  return {
    name: raw.name ?? name,
    description: raw.description ?? '',
    defaults: {
      iterations: raw.defaults?.iterations ?? 5,
      viewBox: raw.defaults?.viewBox ?? '0 0 128 128',
      tileSize: raw.defaults?.tileSize ?? 128,
    },
    criteria,
    palette: raw.palette ?? {},
    styleGuide,
    referenceSvgs,
  }
}

export function listProfiles(profilesDir: string): string[] {
  if (!existsSync(profilesDir)) return []
  return readdirSync(profilesDir).filter((entry) =>
    statSync(join(profilesDir, entry)).isDirectory(),
  )
}
