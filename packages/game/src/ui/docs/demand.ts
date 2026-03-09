import type { DocSection } from './types.js'

export const demand: DocSection = {
  title: 'Demand',
  content: `
    <p>The <strong>R/C/I demand bars</strong> in the top bar show how much each zone type wants to grow. Demand is recalculated every month and drives zone development.</p>

    <p><strong>Residential</strong> has a strong base demand of 0.7 — people always want to move in, modified by the tax rate.</p>
    <p class="docs-formula"><code>R Demand = 0.7 × Tax Modifier</code></p>

    <p><strong>Commercial</strong> demand scales with your population — shops need customers. It caps at 0.6:</p>
    <p class="docs-formula"><code>C Demand = min(Population ÷ 200, 0.6) × Tax Modifier</code></p>

    <p><strong>Industrial</strong> has a steady base of 0.4 and is only half as sensitive to taxes:</p>
    <p class="docs-formula"><code>I Demand = 0.4 × (Tax Modifier × 0.5 + 0.5)</code></p>

    <p>All demand values are clamped between −1 and 1. High traffic congestion (>80% average) penalizes all demand equally.</p>
  `,
}
