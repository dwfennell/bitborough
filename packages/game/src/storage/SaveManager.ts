import type { SaveFile } from '@bitborough/core'

const SAVE_KEY = 'bitborough-save'

function isValidSave(data: unknown): data is SaveFile {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  if (typeof obj.version !== 'number') return false
  if (typeof obj.timestamp !== 'string') return false

  // Validate map
  const map = obj.map
  if (typeof map !== 'object' || map === null) return false
  const m = map as Record<string, unknown>
  if (typeof m.width !== 'number' || typeof m.height !== 'number') return false
  if (!Array.isArray(m.buildings)) return false

  // Validate state
  const state = obj.state
  if (typeof state !== 'object' || state === null) return false
  const s = state as Record<string, unknown>
  if (typeof s.funds !== 'number') return false
  if (typeof s.month !== 'number') return false
  if (typeof s.year !== 'number') return false

  return true
}

export class SaveManager {
  constructor(private storage: Storage = localStorage) {}

  hasSave(): boolean {
    return this.storage.getItem(SAVE_KEY) !== null
  }

  save(data: SaveFile): boolean {
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify(data))
      return true
    } catch {
      // localStorage quota exceeded or unavailable
      return false
    }
  }

  load(): SaveFile | null {
    const raw = this.storage.getItem(SAVE_KEY)
    if (!raw) return null
    try {
      const parsed: unknown = JSON.parse(raw)
      if (!isValidSave(parsed)) return null
      return parsed
    } catch {
      return null
    }
  }

  deleteSave(): void {
    this.storage.removeItem(SAVE_KEY)
  }

  exportToFile(): void {
    const data = this.storage.getItem(SAVE_KEY)
    if (!data) return
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bitborough-save-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  importFromFile(): Promise<SaveFile | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.addEventListener('change', () => {
        const file = input.files?.[0]
        if (!file) { resolve(null); return }
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const parsed: unknown = JSON.parse(reader.result as string)
            resolve(isValidSave(parsed) ? parsed : null)
          } catch {
            resolve(null)
          }
        }
        reader.readAsText(file)
      })
      input.addEventListener('cancel', () => resolve(null))
      input.click()
    })
  }
}
