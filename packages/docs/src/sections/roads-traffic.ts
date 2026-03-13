import type { DocSection } from '../types.js'

export const roadsTraffic: DocSection = {
  id: 'roads-traffic',
  title: 'Roads & Traffic',
  body: [
    'Roads ($10 each, $1/mo maintenance) connect your zones and enable development.',
    '',
    '**Paved roads** ($25 upgrade) are required for density upgrades from Low → Medium. Pave roads in your core city districts to enable growth.',
    '',
    '**Traffic** simulates commuters traveling from residential areas to commercial and industrial zones. Each residential building generates trips along roads to the nearest workplace zones.',
    '',
    'Trips follow roads up to **30 tiles**. Each trip adds 50 traffic units to every road tile along the route. Road capacity is 100 units per tile — anything beyond that is heavy congestion.',
    '',
    'When average road congestion exceeds 80%, all zone demand is penalized:',
    '',
    '`Demand Penalty = 1.0 − (Avg Congestion − 0.8) × 0.4` — minimum 0.5×',
    '',
    '**Tips:**',
    '',
    '- Build parallel roads to distribute traffic',
    '- Keep residential and work zones within 30 tiles of each other',
    '- Use the **Traffic overlay (T)** to spot bottlenecks',
  ].join('\n'),
}
