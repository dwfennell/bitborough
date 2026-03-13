import type { DocSection } from '../types.js'

export const controls: DocSection = {
  id: 'controls',
  title: 'Controls',
  body: `
| Key / Input | Action |
|---|---|
| **W A S D / Arrows** | Pan camera |
| **Q / E** | Zoom out / Zoom in |
| **Scroll Wheel** | Zoom in/out |
| **Right-click drag** | Pan camera |
| **Left-click** | Use active tool |
| **Left-click drag** | Paint with tool |
| **[ / ]** | Decrease / Increase game speed |
| **Space** | Toggle pause |
| **Escape** | Close dialogs / Open menu |
`.trim(),
}
