// Mulberry32 — simple, fast, seeded 32-bit PRNG
export class PRNG {
  private state: number

  constructor(seed: number) {
    this.state = seed | 0
  }

  // Returns float in [0, 1)
  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  // Returns int in [min, max] inclusive
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }

  getSeed(): number {
    return this.state
  }
}
