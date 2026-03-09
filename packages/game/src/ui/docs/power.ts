import type { DocSection } from './types.js'

export const power: DocSection = {
  title: 'Power',
  content: `
    <p>Buildings and zones need electricity to function. Power propagates from plants through adjacent powered tiles — including roads and zoned tiles, so you often don't need power lines within a developed area.</p>

    <p><strong>Diesel Generator</strong> — $300, $15/mo, powers 50 tiles. Small and polluting, but great for getting started.</p>
    <p><strong>Coal Plant</strong> — $2,000, $60/mo, powers 700 tiles. Workhorse mid-game plant. Pollutes heavily.</p>
    <p><strong>Nuclear Plant</strong> — $5,000, $100/mo, powers 2,000 tiles. Most efficient per tile. No pollution.</p>
    <p><strong>Power Lines</strong> — $5 each, $0.50/mo maintenance. Bridge gaps between your plant and developed areas.</p>

    <p><strong>Efficiency comparison:</strong></p>
    <table>
      <tr><td></td><td><strong>Cost/tile</strong></td><td><strong>Maint./tile</strong></td><td><strong>Pollution</strong></td></tr>
      <tr><td>Diesel</td><td>$6.00</td><td>$0.30/mo</td><td>Radius 2</td></tr>
      <tr><td>Coal</td><td>$2.86</td><td>$0.09/mo</td><td>Radius 6</td></tr>
      <tr><td>Nuclear</td><td>$2.50</td><td>$0.05/mo</td><td>None</td></tr>
    </table>
  `,
}
