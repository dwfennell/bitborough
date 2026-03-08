import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, relative, basename, dirname } from 'node:path'

const TILE_SIZE = 128
const TILES_DIR = join(import.meta.dirname, '..', 'assets', 'tiles')
const SPRITES_DIR = join(import.meta.dirname, '..', 'assets', 'sprites')

interface ManifestEntry {
  id: string
  file: string
  category: string
  width: number
  height: number
}

function findSvgs(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findSvgs(full))
    } else if (entry.endsWith('.svg')) {
      results.push(full)
    }
  }
  return results
}

function rasterize(svgPath: string): Buffer {
  const svg = readFileSync(svgPath, 'utf-8')
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: TILE_SIZE },
  })
  const rendered = resvg.render()
  return Buffer.from(rendered.asPng())
}

function main() {
  mkdirSync(SPRITES_DIR, { recursive: true })

  const svgFiles = findSvgs(TILES_DIR)
  const manifest: ManifestEntry[] = []
  let count = 0

  for (const svgPath of svgFiles) {
    const rel = relative(TILES_DIR, svgPath)
    const category = dirname(rel).split('/')[0] ?? 'misc'
    const name = basename(rel, '.svg')
    const pngName = `${name}.png`
    const id = rel.replace(/\.svg$/, '').replaceAll('\\', '/')

    const png = rasterize(svgPath)
    writeFileSync(join(SPRITES_DIR, pngName), png)

    manifest.push({
      id,
      file: pngName,
      category,
      width: TILE_SIZE,
      height: TILE_SIZE,
    })
    count++
  }

  writeFileSync(
    join(SPRITES_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  )

  console.log(`Rasterized ${count} tiles to ${SPRITES_DIR}`)
  console.log(`Manifest written to ${join(SPRITES_DIR, 'manifest.json')}`)
}

main()
