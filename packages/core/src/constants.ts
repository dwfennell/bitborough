export const DEFAULTS = {
  taxRate: 0.07,
  startYear: 1900,
  startMonth: 1,
  ticksPerMonth: 4,
  monthsPerYear: 12,
  startingFunds: {
    32: 5_000,
    64: 10_000,
    128: 20_000,
    256: 30_000,
    512: 50_000,
  } as Record<number, number>,
} as const

export const COSTS = {
  bulldoze: 1,
  road: 10,
  rail: 20,
  powerLine: 5,
  coalPlant: 3_000,
  nuclearPlant: 5_000,
  policeStation: 500,
  fireStation: 500,
  stadium: 3_000,
  seaport: 5_000,
  airport: 10_000,
  park: 10,
} as const

export const MAINTENANCE = {
  road: 1,
  rail: 1.5,
  powerLine: 0.5,
  coalPlant: 120,
  nuclearPlant: 250,
  policeStation: 100,
  fireStation: 100,
} as const

export const POWER = {
  coalCapacity: 700,
  nuclearCapacity: 2_000,
} as const
