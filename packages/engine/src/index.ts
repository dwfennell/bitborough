// @bitborough/engine — pure simulation engine
export { Engine, type EngineConfig, type TileInfo } from './Engine.js'
export { PRNG } from './prng.js'
export { BUILDING_DEFS } from './buildings-registry.js'
export { BuildingIndex } from './building-index.js'
export { computeDesirability } from './simulation/desirability.js'
export { neighbourhoodAvgOccupancy } from './simulation/density.js'
