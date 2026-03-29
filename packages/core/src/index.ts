// @bitborough/core — shared types, constants, formats
export { TileType } from './tiles.js'
export { ZoneType } from './zones.js'
export { Infrastructure, type ConnectionMask } from './infrastructure.js'
export { BuildingCategory, DensityLevel, type BuildingState, type BuildingDef, type Building } from './buildings.js'
export { type MapMeta, type GameMap, MAP_SIZES, type MapSize, createEmptyMap } from './map.js'
export {
  SimSpeed,
  FailReason,
  type Result,
  type DemandInfo,
  type BudgetInfo,
  type GameState,
  type SaveFile,
  type Loan,
  type GameEvent,
  type MonthlySnapshot,
  type CitizenSummary,
  type WealthTier,
  type AttractivenessFactors,
  type TileInfo,
  calcMonthlyPayment,
} from './state.js'
export { DEFAULTS, COSTS, MAINTENANCE, POWER } from './constants.js'
