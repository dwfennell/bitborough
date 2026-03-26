import { POWER } from '@bitborough/core'
import { BUILDING_DEFS } from '@bitborough/engine'
import type { BuildingRow } from './types.js'

const NAMES: Record<string, string> = {
  'res.low': 'Residential (Low)',
  'res.med': 'Residential (Med)',
  'res.med.b': 'Residential (Med B)',
  'res.high': 'Residential (High)',
  'com.low': 'Commercial (Low)',
  'com.med': 'Commercial (Med)',
  'com.med.b': 'Commercial (Med B)',
  'com.high': 'Commercial (High)',
  'com.high.b': 'Commercial (High B)',
  'ind.low': 'Industrial (Low)',
  'ind.med': 'Industrial (Med)',
  'ind.med.b': 'Industrial (Med B)',
  'ind.high': 'Industrial (High)',
  'ind.high.b': 'Industrial (High B)',
  'transit.stop': 'Transit Stop',
  'power.diesel': 'Diesel Generator',
  'power.coal': 'Coal Plant',
  'power.nuclear': 'Nuclear Plant',
  'service.police.small': 'Police Kiosk',
  'service.police': 'Police Station',
  'service.fire.small': 'Fire Substation',
  'service.fire': 'Fire Station',
  'service.school.small': 'Small School',
  'service.school': 'School',
  'special.park': 'Park',
}

const NOTES: Record<string, string> = {
  'res.low': 'Develops on R zones',
  'res.med': 'Needs paved road + 70% occupancy',
  'res.med.b': 'Needs paved road + 70% occupancy',
  'res.high': 'Needs transit stop + 85% occupancy',
  'com.low': 'Needs population',
  'com.med': 'Needs paved road + 70% occupancy',
  'com.med.b': 'Needs paved road + 70% occupancy',
  'com.high': 'Needs transit stop + 85% occupancy',
  'com.high.b': 'Needs transit stop + 85% occupancy',
  'ind.low': 'Steady demand',
  'ind.med': 'More tax, same jobs',
  'ind.med.b': 'More tax, same jobs',
  'ind.high': 'Automated: high tax, few jobs',
  'ind.high.b': 'Automated: high tax, few jobs',
  'transit.stop': 'Anchors high density in 10-tile radius',
  'power.diesel': 'Early game power',
  'power.coal': 'Mid-game power',
  'power.nuclear': 'Most efficient',
  'service.police.small': '6-tile radius; boosted to 9 near a station',
  'service.police': '15-tile crime radius; boosts nearby kiosks',
  'service.fire.small': '6-tile radius; boosted to 9 near a station',
  'service.fire': '15-tile fire radius; boosts nearby substations',
  'service.school.small': '5-tile radius; boosted to 7.5 near a school',
  'service.school': '12-tile education radius; boosts nearby small schools',
  'special.park': 'Boosts land value',
}

const POWER_CAPACITY: Record<string, number> = {
  'power.diesel': POWER.dieselCapacity,
  'power.coal': POWER.coalCapacity,
  'power.nuclear': POWER.nuclearCapacity,
}

export function getBuildingReference(): BuildingRow[] {
  return Object.entries(BUILDING_DEFS).map(([id, def]) => ({
    id,
    name: NAMES[id] ?? id,
    cost: def.cost,
    maintenanceCost: def.maintenanceCost,
    powerCapacity: POWER_CAPACITY[id],
    capacity: def.capacity > 0 ? def.capacity : undefined,
    jobs: def.jobs > 0 ? def.jobs : undefined,
    pollutionRadius: def.pollutionRadius > 0 ? def.pollutionRadius : undefined,
    pollutionAmount: def.pollutionAmount > 0 ? def.pollutionAmount : undefined,
    size: def.size,
    notes: NOTES[id] ?? '',
  }))
}
