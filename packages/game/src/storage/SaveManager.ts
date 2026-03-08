import type { SaveFile } from '@bitborough/core'

const SAVE_KEY = 'bitborough-save'

export class SaveManager {
  constructor(private storage: Storage = localStorage) {}

  hasSave(): boolean {
    return this.storage.getItem(SAVE_KEY) !== null
  }

  save(data: SaveFile): void {
    this.storage.setItem(SAVE_KEY, JSON.stringify(data))
  }

  load(): SaveFile | null {
    const raw = this.storage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SaveFile
  }

  deleteSave(): void {
    this.storage.removeItem(SAVE_KEY)
  }
}
