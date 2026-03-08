/**
 * Loads SVG files as Image elements and caches them for canvas rendering.
 * Images are loaded once and drawn via ctx.drawImage() for best performance.
 */
export class SpriteCache {
  private cache = new Map<string, HTMLImageElement>()
  private loading = new Map<string, Promise<HTMLImageElement>>()

  get(path: string): HTMLImageElement | null {
    const cached = this.cache.get(path)
    if (cached) return cached

    // Start loading if not already in-flight
    if (!this.loading.has(path)) {
      const promise = this.load(path)
      this.loading.set(path, promise)
      promise.then((img) => {
        this.cache.set(path, img)
        this.loading.delete(path)
      })
    }

    return null
  }

  private load(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(img) // Still cache to avoid retry loops
      img.src = path
    })
  }
}
