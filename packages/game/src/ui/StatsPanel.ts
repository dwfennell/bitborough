import type { GameState, MonthlySnapshot } from '@bitborough/core'

interface ChartDef {
  title: string
  getValue: (s: MonthlySnapshot) => number
  color: string | ((last: number) => string)
  yMin?: number   // fixed min (demand charts use -1)
  yMax?: number   // fixed max (demand charts use 1)
  secondSeries?: { getValue: (s: MonthlySnapshot) => number; color: string }
}

const CHARTS: ChartDef[] = [
  {
    title: 'Population',
    getValue: (s) => s.population,
    color: '#4fc3f7',
  },
  {
    title: 'Treasury',
    getValue: (s) => s.funds,
    color: (last) => (last >= 0 ? '#81c784' : '#e57373'),
  },
  {
    title: 'Monthly Cash Flow',
    getValue: (s) => s.taxIncome,
    color: '#81c784',
    secondSeries: { getValue: (s) => s.expenses, color: '#e57373' },
  },
  {
    title: 'Residential Demand',
    getValue: (s) => s.rDemand,
    color: '#ef9a9a',
    yMin: -1,
    yMax: 1,
  },
  {
    title: 'Commercial Demand',
    getValue: (s) => s.cDemand,
    color: '#80cbc4',
    yMin: -1,
    yMax: 1,
  },
  {
    title: 'Industrial Demand',
    getValue: (s) => s.iDemand,
    color: '#ffcc80',
    yMin: -1,
    yMax: 1,
  },
]

const PANEL_W = 480
const PANEL_H = 400
const COLS = 2
const ROWS = 3
const PAD = 8
const CHART_W = Math.floor((PANEL_W - PAD * (COLS + 1)) / COLS)  // ~220
const CHART_H = Math.floor((PANEL_H - 40 - PAD * (ROWS + 1)) / ROWS)  // ~100 (40px header)

export class StatsPanel {
  private el: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private visible = false

  constructor(container: HTMLElement) {
    this.el = document.createElement('div')
    this.el.id = 'stats-panel'
    this.el.className = 'panel hidden'
    this.el.style.cssText = 'position:fixed;top:60px;right:20px;width:480px;background:#1a1a1a;border:1px solid #333;border-radius:6px;z-index:100;'

    this.el.innerHTML = `
      <div class="panel-header">
        <h3>Statistics</h3>
        <button class="panel-close">&times;</button>
      </div>
    `

    this.canvas = document.createElement('canvas')
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = PANEL_W * dpr
    this.canvas.height = PANEL_H * dpr
    this.canvas.style.width = `${PANEL_W}px`
    this.canvas.style.height = `${PANEL_H}px`
    this.canvas.style.display = 'block'
    this.el.appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d')!
    this.ctx.scale(dpr, dpr)

    container.appendChild(this.el)
    this.el.querySelector('.panel-close')!.addEventListener('click', () => this.toggle())
  }

  toggle(): void {
    this.visible = !this.visible
    this.el.classList.toggle('hidden', !this.visible)
  }

  hide(): void {
    this.visible = false
    this.el.classList.add('hidden')
  }

  get isVisible(): boolean {
    return this.visible
  }

  update(state: GameState): void {
    if (!this.visible) return
    const { ctx } = this
    const history = state.history

    ctx.clearRect(0, 0, PANEL_W, PANEL_H)

    if (history.length === 0) {
      ctx.fillStyle = '#666'
      ctx.font = '13px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      CHARTS.forEach((_, i) => {
        const col = i % COLS
        const row = Math.floor(i / COLS)
        const x = PAD + col * (CHART_W + PAD)
        const y = 40 + PAD + row * (CHART_H + PAD)
        ctx.fillStyle = '#222'
        ctx.fillRect(x, y, CHART_W, CHART_H)
        ctx.fillStyle = '#555'
        ctx.fillText('No data yet', x + CHART_W / 2, y + CHART_H / 2)
      })
      return
    }

    CHARTS.forEach((def, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const x = PAD + col * (CHART_W + PAD)
      const y = 40 + PAD + row * (CHART_H + PAD)
      this.drawChart(def, history, x, y)
    })
  }

  private drawChart(def: ChartDef, history: MonthlySnapshot[], x: number, y: number): void {
    const { ctx } = this
    const w = CHART_W
    const h = CHART_H

    // Background
    ctx.fillStyle = '#222'
    ctx.fillRect(x, y, w, h)

    // Visible window: last N months (1px per month, per spec)
    const maxPoints = w
    const slice = history.length > maxPoints ? history.slice(-maxPoints) : history

    const values = slice.map(def.getValue)
    const lastValue = values[values.length - 1] ?? 0

    // Y range
    let yMin = def.yMin ?? 0
    let yMax = def.yMax ?? 0

    if (def.yMin !== undefined && def.yMax !== undefined) {
      // Fixed range (demand charts)
      yMin = def.yMin
      yMax = def.yMax
    } else if (def.secondSeries) {
      // Income/expenses: 0 to max of both series * 1.1
      const secondValues = slice.map(def.secondSeries.getValue)
      const allVals = [...values, ...secondValues]
      yMax = Math.max(...allVals) * 1.1
      if (yMax === 0) yMax = 1
    } else {
      // Population, funds: show full range — funds can go negative
      const seriesMin = Math.min(...values)
      const seriesMax = Math.max(...values)
      yMin = Math.min(0, seriesMin)      // always include 0; extend down if negative
      yMax = seriesMax > 0 ? seriesMax * 1.1 : 1
    }

    // Prevent division by zero when all values equal
    if (yMax === yMin) {
      yMax = yMin + (def.yMin !== undefined ? 2 : 1)
    }

    const toScreenY = (v: number) => y + h - 1 - ((v - yMin) / (yMax - yMin)) * (h - 2)

    // Gridlines (3 lines at 25%, 50%, 75%)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 0.5
    for (let t = 1; t <= 3; t++) {
      const gy = y + (h * t) / 4
      ctx.beginPath()
      ctx.moveTo(x, gy)
      ctx.lineTo(x + w, gy)
      ctx.stroke()
    }

    // Zero line for demand charts
    if (def.yMin !== undefined) {
      const zy = toScreenY(0)
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, zy)
      ctx.lineTo(x + w, zy)
      ctx.stroke()
    }

    // Draw series line
    const drawLine = (vals: number[], color: string) => {
      if (vals.length === 0) return
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      vals.forEach((v, i) => {
        const sx = x + i
        const sy = toScreenY(v)
        if (i === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      })
      ctx.stroke()
    }

    const mainColor = typeof def.color === 'function' ? def.color(lastValue) : def.color
    drawLine(values, mainColor)

    if (def.secondSeries) {
      const secondValues = slice.map(def.secondSeries.getValue)
      drawLine(secondValues, def.secondSeries.color)

      // Legend dots + labels
      ctx.font = '9px system-ui'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = mainColor
      ctx.beginPath()
      ctx.arc(x + 6, y + 8, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillText('Income', x + 12, y + 8)
      ctx.fillStyle = def.secondSeries.color
      ctx.beginPath()
      ctx.arc(x + 6, y + 18, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillText('Expenses', x + 12, y + 18)
    }

    // Chart title
    ctx.fillStyle = '#e0e0e0'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(def.title, x + (def.secondSeries ? 16 : 4), y + 4)

    // Current value (top-right)
    ctx.textAlign = 'right'
    const displayVal = Math.round(lastValue).toLocaleString()
    ctx.fillText(displayVal, x + w - 4, y + 4)

    // Min/max labels (bottom corners)
    ctx.font = '9px system-ui'
    ctx.fillStyle = '#888'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText(Math.round(yMin).toLocaleString(), x + 4, y + h - 2)
    ctx.textAlign = 'right'
    ctx.fillText(Math.round(yMax).toLocaleString(), x + w - 4, y + h - 2)
  }
}
