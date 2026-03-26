import type { DocSection } from '../types.js'

export const education: DocSection = {
  id: 'education',
  title: 'Education',
  body: [
    'Education coverage boosts residential desirability and neighborhood reputation, attracting higher-wealth residents.',
    '',
    '**Schools** ($500, $75/mo) are 3×3 buildings with a 12-tile education radius. **Small Schools** ($80, $15/mo) are 1×1 units with a 5-tile radius — affordable early-game coverage. Small schools within a school\'s coverage get a 1.5× range boost (5 → 7.5 tiles).',
    '',
    'Education is more important to wealthier citizens. Mid-wealth residents are moderately attracted (1.2×), while high-wealth residents are strongly attracted (1.5×). Low-wealth residents care less (0.6×).',
    '',
    'Use the **Education overlay (J)** to see coverage across your city (blue-purple gradient). Adjust the education funding slider in the Budget panel to control service spending.',
  ].join('\n'),
}
