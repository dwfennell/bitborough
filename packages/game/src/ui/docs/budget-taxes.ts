import type { DocSection } from './types.js'

export const budgetTaxes: DocSection = {
  title: 'Budget & Taxes',
  content: `
    <p>Open the budget panel with <strong>B</strong>.</p>
    <p><strong>Income</strong> comes from property taxes on developed zones. It's based on your population, the average land value across developed tiles, and your tax rate:</p>
    <p class="docs-formula"><code>Tax Income = Population × (Avg Land Value ÷ 20) × Tax Rate</code></p>

    <p><strong>Tax Rate</strong> — Default 7% (neutral). The demand system treats 7% as the baseline. Every 1% above or below shifts demand by ±5%:</p>
    <p class="docs-formula"><code>Tax Modifier = 1.0 − (Tax Rate − 7%) × 5</code></p>
    <p>Lower taxes boost demand but reduce income. Higher taxes suppress growth. Range: 0–20%.</p>

    <p><strong>Maintenance costs per month:</strong></p>
    <table>
      <tr><td>Roads</td><td>$1/tile</td></tr>
      <tr><td>Rail</td><td>$1.50/tile</td></tr>
      <tr><td>Power Lines</td><td>$0.50/tile</td></tr>
      <tr><td>Diesel Generator</td><td>$15</td></tr>
      <tr><td>Coal Plant</td><td>$60</td></tr>
      <tr><td>Nuclear Plant</td><td>$100</td></tr>
      <tr><td>Police/Fire Stations</td><td>$50 × (Funding ÷ 100)</td></tr>
    </table>

    <p><strong>Balance</strong> is calculated monthly but applied to your funds each January. If your funds run out, you can't build — but existing buildings continue to function.</p>
  `,
}
