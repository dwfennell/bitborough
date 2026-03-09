import type { DocSection } from './types.js'

export const timeSimulation: DocSection = {
  title: 'Time & Simulation',
  content: `
    <p>The game runs in <strong>ticks</strong>. Every 4 ticks equals one month, and 12 months make a year (starting from January 1900).</p>
    <p>Each month the simulation recalculates:</p>
    <ul>
      <li>Zone demand (R/C/I)</li>
      <li>Land values</li>
      <li>Crime levels</li>
      <li>Fire coverage and active fires</li>
      <li>Zone development (new buildings)</li>
      <li>Traffic density</li>
      <li>Monthly budget balance</li>
    </ul>
    <p>Your budget balance accumulates monthly but is <strong>applied to your funds once per year in January</strong>.</p>
    <p>Control game speed with <strong>Space</strong> (pause), <strong>[</strong> (slower), and <strong>]</strong> (faster).</p>
  `,
}
