import type { DocSection } from '../types.js'

export const crime: DocSection = {
  id: 'crime',
  title: 'Crime',
  body: [
    "Crime appears on zoned tiles and is driven by low land values. Every zoned tile starts with a base crime score of 30, reduced by the tile's land value. Police stations actively suppress crime within their radius.",
    '',
    '`Crime = 30 − (Land Value × 0.15) − (Police Influence × 40)` — minimum 0',
    '',
    '**Police Stations** ($300, $50/mo) project influence in a 15-tile radius. Influence is strongest at the station center (1.0) and fades linearly to zero at the edge. Reducing police funding shrinks the effective radius proportionally.',
    '',
    '`Effective Radius = 15 × (Funding ÷ 100)`',
    '',
    'High crime reduces land values, which in turn increases crime further — a downward spiral if left unchecked. Use the **Crime overlay (C)** to identify problem areas.',
  ].join('\n'),
}
