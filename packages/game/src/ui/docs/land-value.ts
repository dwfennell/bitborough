import type { DocSection } from './types.js'

export const landValue: DocSection = {
  title: 'Land Value',
  content: `
    <p>Land value is recalculated every month for every non-water tile. It directly affects tax income and influences crime. Higher land values mean more revenue and less crime.</p>
    <p class="docs-formula"><code>Land Value = 10 + Water + Parks + Road − Pollution − Crime</code> — clamped 0–255</p>
    <p><strong>Bonuses:</strong></p>
    <ul>
      <li><strong>Water adjacency:</strong> +15 per adjacent water tile (cardinal directions only)</li>
      <li><strong>Parks:</strong> +10 at the park, fading by 2 per tile (up to 4 tiles away)</li>
      <li><strong>Road access:</strong> +10 if any road exists within 3 tiles</li>
    </ul>
    <p><strong>Penalties:</strong></p>
    <ul>
      <li><strong>Pollution:</strong> −0.5 per pollution level (from industrial zones and power plants)</li>
      <li><strong>Crime:</strong> −0.1 per crime level</li>
    </ul>
    <p>Use the <strong>Land Value overlay (V)</strong> to visualize values across your city (blue = low, red = high).</p>
  `,
}
