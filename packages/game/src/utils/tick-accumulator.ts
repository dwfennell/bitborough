import { SimSpeed } from '@bitborough/core'

export const TICK_INTERVALS: Record<SimSpeed, number> = {
  [SimSpeed.Paused]: 0,
  [SimSpeed.Slow]: 1000,
  [SimSpeed.Normal]: 250,
  [SimSpeed.Fast]: 100,
  [SimSpeed.Turbo]: 25,
}

export function advanceTicks(
  accumulator: number,
  delta: number,
  interval: number,
): { ticks: number; remainder: number } {
  if (interval <= 0) return { ticks: 0, remainder: accumulator }
  let acc = accumulator + delta
  let ticks = 0
  while (acc >= interval) {
    acc -= interval
    ticks++
  }
  return { ticks, remainder: acc }
}
