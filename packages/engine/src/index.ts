// @bitborough/engine — pure simulation engine
export { Engine, type TileInfo } from './Engine.js'
export { type EngineConfig } from './engine-state.js'
export { PRNG } from './prng.js'
export { BUILDING_DEFS } from './buildings-registry.js'
export { BuildingIndex } from './building-index.js'
export { computeDesirability } from './simulation/desirability.js'
export { neighbourhoodAvgOccupancy } from './simulation/density.js'
export { calculateEducationCoverage } from './simulation/services/education.js'
