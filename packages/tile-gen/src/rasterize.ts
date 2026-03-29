import { Resvg } from '@resvg/resvg-js'

export function rasterizeSvg(svg: string, tileSize: number): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: tileSize },
  })
  const rendered = resvg.render()
  return Buffer.from(rendered.asPng())
}
