import type { DocSection } from './types.js'

export const controls: DocSection = {
  title: 'Controls',
  content: `
    <table>
      <tr><td><strong>W A S D / Arrows</strong></td><td>Pan camera</td></tr>
      <tr><td><strong>Q / E</strong></td><td>Zoom out / Zoom in</td></tr>
      <tr><td><strong>Scroll Wheel</strong></td><td>Zoom in/out</td></tr>
      <tr><td><strong>Right-click drag</strong></td><td>Pan camera</td></tr>
      <tr><td><strong>Left-click</strong></td><td>Use active tool</td></tr>
      <tr><td><strong>Left-click drag</strong></td><td>Paint with tool</td></tr>
      <tr><td><strong>[ / ]</strong></td><td>Decrease / Increase game speed</td></tr>
      <tr><td><strong>Space</strong></td><td>Toggle pause</td></tr>
      <tr><td><strong>Escape</strong></td><td>Close dialogs / Open menu</td></tr>
    </table>
  `,
}
