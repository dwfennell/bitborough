import { readFileSync, writeFileSync, existsSync } from 'fs'
import { Engine } from '@bitborough/engine'

export function loadEngine(file = 'game.json'): Engine {
  if (!existsSync(file)) {
    console.error(JSON.stringify({ ok: false, error: `No game file at ${file}. Run: bitt new` }))
    process.exit(1)
  }
  const save = JSON.parse(readFileSync(file, 'utf-8'))
  return Engine.restore(save)
}

export function saveEngine(engine: Engine, file = 'game.json'): void {
  writeFileSync(file, JSON.stringify(engine.serialize(), null, 2))
}
