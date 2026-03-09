import type { DocSection } from './types.js'

export const gettingStarted: DocSection = {
  title: 'Getting Started',
  content: `
    <p>Welcome to Bitborough! Build and manage a thriving city.</p>
    <p><strong>Basic steps:</strong></p>
    <ol>
      <li>Place a <em>Diesel Generator</em> (key 6) or <em>Coal Power Plant</em> (key 7) to generate electricity</li>
      <li>Run <em>Power Lines</em> (key 2) from the plant toward your city</li>
      <li>Build <em>Roads</em> (key 1) for access</li>
      <li>Zone <em>Residential</em> (3), <em>Commercial</em> (4), and <em>Industrial</em> (5) areas next to roads</li>
      <li>Wait for buildings to develop automatically</li>
    </ol>
    <p>Zones only develop when they are <strong>powered</strong> and <strong>adjacent to a road</strong>.</p>
  `,
}
