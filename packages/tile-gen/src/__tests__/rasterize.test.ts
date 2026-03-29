import { describe, test, expect } from 'vitest'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { rasterizeSvg } from '../rasterize.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const GRASS_SVG = resolve(
  __dirname,
  '../../../game/assets/tiles/terrain/grass.svg',
)

describe('rasterizeSvg', () => {
  test('converts SVG string to PNG buffer', () => {
    const svg = readFileSync(GRASS_SVG, 'utf-8')
    const png = rasterizeSvg(svg, 128)
    expect(png).toBeInstanceOf(Buffer)
    // PNG magic bytes: 137 80 78 71
    expect(png[0]).toBe(137)
    expect(png[1]).toBe(80)
    expect(png[2]).toBe(78)
    expect(png[3]).toBe(71)
  })

  test('respects custom tile size', () => {
    const svg = readFileSync(GRASS_SVG, 'utf-8')
    const png = rasterizeSvg(svg, 64)
    expect(png).toBeInstanceOf(Buffer)
    expect(png.length).toBeGreaterThan(0)
  })
})
