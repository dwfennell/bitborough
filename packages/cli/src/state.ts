import { readFileSync, writeFileSync, existsSync } from 'fs'
import { Engine } from '@bitborough/engine'
import { err } from './output.js'

export function loadEngine(file = 'game.json'): Engine {
  if (!existsSync(file)) {
    err(`No game file at ${file}. Run: bitt new`)
  }
  try {
    const save = JSON.parse(readFileSync(file, 'utf-8'))
    return Engine.restore(save)
  } catch (e) {
    err(`Failed to load game file: ${e instanceof Error ? e.message : String(e)}`)
  }
}

export function saveEngine(engine: Engine, file = 'game.json'): void {
  writeFileSync(file, JSON.stringify(engine.serialize(), null, 2))
}
