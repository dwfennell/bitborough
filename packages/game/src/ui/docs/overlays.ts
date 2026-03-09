import type { DocSection } from './types.js'

export const overlays: DocSection = {
  title: 'Overlays',
  content: `
    <p>Toggle data overlays to visualize city systems:</p>
    <table>
      <tr><td><strong>P</strong></td><td><em>Power</em> — Yellow = powered, gray = unpowered</td></tr>
      <tr><td><strong>V</strong></td><td><em>Land Value</em> — Blue (low) to red (high)</td></tr>
      <tr><td><strong>C</strong></td><td><em>Crime</em> — Red heatmap showing crime levels</td></tr>
      <tr><td><strong>F</strong></td><td><em>Fire</em> — Green (covered) to red (at risk), orange = active fire</td></tr>
      <tr><td><strong>T</strong></td><td><em>Traffic</em> — Green (light) to red (gridlock) on roads</td></tr>
      <tr><td><strong>G</strong></td><td><em>Grid</em> — Toggle tile grid lines</td></tr>
    </table>
    <p>Press the same key again to turn off the overlay.</p>
  `,
}
