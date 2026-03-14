export enum Infrastructure {
  None = 0,
  Road = 1 << 0,
  PowerLine = 1 << 1,
  Rail = 1 << 2,
  Pipe = 1 << 3,
  PavedRoad = 1 << 4, // upgrade from Road; tiles have Road | PavedRoad
}

// 4-bit mask: N=bit0, E=bit1, S=bit2, W=bit3
export type ConnectionMask = number
