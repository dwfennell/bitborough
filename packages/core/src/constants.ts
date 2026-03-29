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
  dieselGenerator: 300,
  coalPlant: 2_000,
  nuclearPlant: 5_000,
  policeKiosk: 50,
  policeStation: 300,
  fireSubstation: 60,
  fireStation: 300,
  stadium: 3_000,
  seaport: 5_000,
  airport: 10_000,
  park: 10,
  pavedRoadUpgrade: 20, // cost to upgrade one dirt road tile to paved
  transitStop: 500,
  school: 500,
  schoolSmall: 80,
} as const

export const MAINTENANCE = {
  road: 0.5,
  rail: 1.5,
  powerLine: 0.5,
  dieselGenerator: 15,
  coalPlant: 60,
  nuclearPlant: 100,
  policeKiosk: 10,
  policeStation: 50,
  fireSubstation: 12,
  fireStation: 50,
  pavedRoadSurcharge: 0.5, // extra per paved road tile (total: road + surcharge = 1/mo)
  transitStop: 50,
  school: 75,
  schoolSmall: 15,
} as const

export const POWER = {
  dieselCapacity: 50,
  coalCapacity: 700,
  nuclearCapacity: 2_000,
} as const
