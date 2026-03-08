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
            const save = JSON.parse(reader.result as string) as SaveFile
            resolve(save)
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
