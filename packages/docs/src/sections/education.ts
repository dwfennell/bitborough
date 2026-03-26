import type { DocSection } from '../types.js'

export const education: DocSection = {
  id: 'education',
  title: 'Education',
  body: [
    'Citizens with children enroll at the nearest school, improving their satisfaction. Education is more important to wealthier residents.',
    '',
    '**Schools** ($500, $75/mo) are 3×3 buildings with capacity for 300 children. **Small Schools** ($80, $15/mo) are 1×1 with capacity for 50 children. Schools can accept up to 120% capacity, but quality degrades — overcrowded schools make residents less happy.',
    '',
    'School **quality** depends on two factors: funding level (set in the Budget panel) and occupancy. A school at 100% capacity with full funding has quality 1.0. At 120% capacity, quality drops to 0.5. Cutting funding reduces quality further.',
    '',
    'Resident satisfaction from education depends on both the school\'s quality and the commute distance. Build schools close to residential areas for the best effect.',
    '',
    'Use the **Education overlay (J)** to see enrollment status: green = good quality, yellow = moderate, red = poor, gray = children with no school access.',
  ].join('\n'),
}
