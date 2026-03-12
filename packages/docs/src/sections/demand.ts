import type { DocSection } from '../types.js'

export const demand: DocSection = {
  id: 'demand',
  title: 'Demand',
  body: [
    'The **R/C/I demand bars** in the top bar show how much each zone type wants to grow. Demand is recalculated every month and drives zone development.',
    '',
    '**Residential** has a strong base demand of 0.7 — people always want to move in, modified by the tax rate.',
    '',
    '`R Demand = 0.7 × Tax Modifier`',
    '',
    '**Commercial** demand scales with your population — shops need customers. It caps at 0.6:',
    '',
    '`C Demand = min(Population ÷ 200, 0.6) × Tax Modifier`',
    '',
    '**Industrial** has a steady base of 0.4 and is only half as sensitive to taxes:',
    '',
    '`I Demand = 0.4 × (Tax Modifier × 0.5 + 0.5)`',
    '',
    'All demand values are clamped between −1 and 1. High traffic congestion (>80% average) penalizes all demand equally.',
  ].join('\n'),
}
