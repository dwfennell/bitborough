import type { DocSection } from '../types.js'

export const overlays: DocSection = {
  id: 'overlays',
  title: 'Overlays',
  body: `
Toggle data overlays to visualize city systems:

| Key | Overlay |
|---|---|
| **P** | *Power* — Yellow = powered, gray = unpowered |
| **V** | *Land Value* — Blue (low) to red (high) |
| **C** | *Crime* — Red heatmap showing crime levels |
| **F** | *Fire* — Green (covered) to red (at risk), orange = active fire |
| **T** | *Traffic* — Green (light) to red (gridlock) on roads |
| **G** | *Grid* — Toggle tile grid lines |

Press the same key again to turn off the overlay.
`.trim(),
}
