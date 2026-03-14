import { PRNG } from './prng.js'

const GRAD2: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
]

const F2 = 0.5 * (Math.sqrt(3) - 1)
const G2 = (3 - Math.sqrt(3)) / 6

export function createNoise2D(prng: PRNG): (x: number, y: number) => number {
  const perm = new Uint8Array(256)
  for (let i = 0; i < 256; i++) perm[i] = i
  for (let i = 255; i > 0; i--) {
    const j = prng.nextInt(0, i)
    const tmp = perm[i]!
    perm[i] = perm[j]!
    perm[j] = tmp
  }

  function hash(i: number): number {
    return perm[i & 255]!
  }

  return function noise2D(x: number, y: number): number {
    const s = (x + y) * F2
    const i = Math.floor(x + s)
    const j = Math.floor(y + s)

    const t = (i + j) * G2
    const X0 = i - t
    const Y0 = j - t
    const x0 = x - X0
    const y0 = y - Y0

    const i1 = x0 > y0 ? 1 : 0
    const j1 = x0 > y0 ? 0 : 1

    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1.0 + 2.0 * G2
    const y2 = y0 - 1.0 + 2.0 * G2

    const gi0 = hash(i + hash(j)) % 8
    const gi1 = hash(i + i1 + hash(j + j1)) % 8
    const gi2 = hash(i + 1 + hash(j + 1)) % 8

    let n0 = 0,
      n1 = 0,
      n2 = 0

    let t0 = 0.5 - x0 * x0 - y0 * y0
    if (t0 >= 0) {
      t0 *= t0
      const g = GRAD2[gi0]!
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0)
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1
    if (t1 >= 0) {
      t1 *= t1
      const g = GRAD2[gi1]!
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1)
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2
    if (t2 >= 0) {
      t2 *= t2
      const g = GRAD2[gi2]!
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2)
    }

    return 70.0 * (n0 + n1 + n2)
  }
}

export function layeredNoise(
  noise: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves: number,
  frequency: number,
  persistence: number,
): number {
  let value = 0
  let amplitude = 1
  let maxAmplitude = 0
  let freq = frequency

  for (let i = 0; i < octaves; i++) {
    value += noise(x * freq, y * freq) * amplitude
    maxAmplitude += amplitude
    amplitude *= persistence
    freq *= 2
  }

  return value / maxAmplitude
}
