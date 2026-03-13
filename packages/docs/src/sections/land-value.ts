import type { DocSection } from '../types.js'

export const landValue: DocSection = {
  id: 'land-value',
  title: 'Land Value',
  body: [
    'Land value is recalculated every month for every non-water tile. It directly affects tax income and influences crime. Higher land values mean more revenue and less crime.',
    '',
    '`Land Value = 10 + Water + Parks + Road − Pollution − Crime` — clamped 0–255',
    '',
    '**Bonuses:**',
    '',
    '- **Water adjacency:** +15 per adjacent water tile (cardinal directions only)',
    '- **Parks:** +10 at the park, fading by 2 per tile (up to 4 tiles away)',
    '- **Road access:** +10 if any road exists within 3 tiles',
    '',
    '**Penalties:**',
    '',
    '- **Pollution:** −0.5 per pollution level (from industrial zones and power plants)',
    '- **Crime:** −0.1 per crime level',
    '',
    'Use the **Land Value overlay (V)** to visualize values across your city (blue = low, red = high).',
  ].join('\n'),
}
