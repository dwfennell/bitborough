import { SimSpeed, type MapSize, MAP_SIZES, type GameState } from '@bitborough/core'
import { Engine } from '@bitborough/engine'
import { generateMap, type MapGenConfig } from '@bitborough/map-gen'
import { Camera } from './render/Camera.js'
import { Renderer } from './render/Renderer.js'
import { InputManager } from './input/InputManager.js'
import { ToolManager } from './tools/ToolManager.js'
import { QueryTool } from './tools/QueryTool.js'
import { InfoBar } from './ui/InfoBar.js'
import { Toolbar } from './ui/Toolbar.js'
import { SpeedControls } from './ui/SpeedControls.js'
import { BudgetPanel } from './ui/BudgetPanel.js'
import { QueryPanel } from './ui/QueryPanel.js'
import { MiniMap } from './ui/MiniMap.js'
import { EscapeMenu } from './ui/EscapeMenu.js'
import { DocsPanel } from './ui/DocsPanel.js'
import { AudioManager } from './audio/AudioManager.js'
import { SaveManager } from './storage/SaveManager.js'
import { TICK_INTERVALS, advanceTicks } from './utils/tick-accumulator.js'

const TILE_SIZE = 16

interface GameAction {
  label: string
  key?: string
  action: () => void
}

export class Game {
  private engine: Engine | null = null
  private ctx: CanvasRenderingContext2D
  private camera: Camera
  private renderer: Renderer
  private inputManager: InputManager
  private toolManager: ToolManager
  private infoBar: InfoBar
  private toolbar: Toolbar
  private speedControls: SpeedControls
  private budgetPanel: BudgetPanel
  private queryPanel: QueryPanel
  private miniMap: MiniMap
  private audioManager: AudioManager
  private saveManager: SaveManager
  private escapeMenu: EscapeMenu
  private docsPanel: DocsPanel

  private speed: SimSpeed = SimSpeed.Normal
  private simAccumulator = 0
  private lastFrameTime = 0
  private animationId = 0
  private ticksSinceSave = 0
  private frameCount = 0

  private actions: GameAction[]
  private pressedKeys = new Set<string>()

  constructor(
    private canvas: HTMLCanvasElement,
    private uiOverlay: HTMLElement,
  ) {
    this.ctx = canvas.getContext('2d')!

    this.camera = new Camera(canvas.width, canvas.height, TILE_SIZE)
    this.renderer = new Renderer(this.ctx, this.camera)
    this.toolManager = new ToolManager()
    this.inputManager = new InputManager(canvas, this.camera, this.toolManager, () => this.engine)
    this.saveManager = new SaveManager()
    this.audioManager = new AudioManager()

    this.infoBar = new InfoBar(uiOverlay)
    this.toolbar = new Toolbar(uiOverlay, this.toolManager)
    this.speedControls = new SpeedControls(uiOverlay, (s) => {
      this.speed = s
    })
    this.budgetPanel = new BudgetPanel(
      uiOverlay,
      (rate) => this.engine?.setTaxRate(rate),
      (service, level) => this.engine?.setFunding(service, level),
    )
    this.queryPanel = new QueryPanel(uiOverlay)
    this.miniMap = new MiniMap(uiOverlay)
    this.escapeMenu = new EscapeMenu(uiOverlay, {
      onResume: () => {},
      onSave: () => { this.autoSave(); this.saveManager.exportToFile() },
      onLoad: async () => {
        const save = await this.saveManager.importFromFile()
        if (save) {
          this.engine = Engine.restore(save)
          this.setMapSize(save.map.width, save.map.height)
        }
      },
      onNewGame: () => {
        cancelAnimationFrame(this.animationId)
        this.engine = null
        this.showNewGameScreen()
      },
    })
    this.docsPanel = new DocsPanel(uiOverlay)

    // Shared actions for menu bar and keyboard shortcuts
    this.actions = [
      { label: 'Budget (B)', key: 'b', action: () => this.budgetPanel.toggle() },
      { label: 'Guide (D)', key: 'd', action: () => this.docsPanel.toggle() },
      { label: 'Power (P)', key: 'p', action: () => this.renderer.toggleOverlay('power') },
      { label: 'Value (V)', key: 'v', action: () => this.renderer.toggleOverlay('landValue') },
      { label: 'Crime (C)', key: 'c', action: () => this.renderer.toggleOverlay('crime') },
      { label: 'Fire (F)', key: 'f', action: () => this.renderer.toggleOverlay('fire') },
      { label: 'Traffic (T)', key: 't', action: () => this.renderer.toggleOverlay('traffic') },
      { label: 'Grid (G)', key: 'g', action: () => this.renderer.toggleGridLines() },
      { label: 'Export', action: () => { this.autoSave(); this.saveManager.exportToFile() } },
    ]

    this.createMenuBar(uiOverlay)

    // Tool result callback for query panel + audio
    this.inputManager.setToolResultCallback((tool, x, y, result) => {
      if (tool instanceof QueryTool && tool.lastQuery && this.engine) {
        this.queryPanel.show(tool.lastQuery, x, y, this.engine.getState())
      }
      if (tool.category === 'query') return
      if (result.ok) {
        switch (tool.category) {
          case 'bulldoze': this.audioManager.playBulldoze(); break
          case 'zone': this.audioManager.playZone(); break
          default: this.audioManager.playPlace(); break
        }
      } else {
        this.audioManager.playError()
      }
    })

    this.bindKeyboard()
  }

  start(): void {
    if (this.saveManager.hasSave()) {
      const save = this.saveManager.load()
      if (save) {
        this.engine = Engine.restore(save)
        this.setMapSize(save.map.width, save.map.height)
        this.startLoop()
        return
      }
    }

    this.showNewGameScreen()
  }

  private setMapSize(width: number, height: number): void {
    this.camera.setMapSize(width, height)
    this.inputManager.setMapSize(width, height)
  }

  private showNewGameScreen(): void {
    const sizeOptions = MAP_SIZES
      .filter(s => s >= 64 && s <= 256)
      .map(s => `<option value="${s}"${s === 128 ? ' selected' : ''}>${s}x${s}</option>`)
      .join('\n')

    const screen = document.createElement('div')
    screen.id = 'new-game-screen'
    screen.innerHTML = `
      <form id="new-game-form">
        <h1>Bitborough</h1>
        <label>
          Map Size
          <select id="map-size">${sizeOptions}</select>
        </label>
        <label>
          Preset
          <select id="map-preset">
            <option value="plains" selected>Plains</option>
            <option value="island">Island</option>
          </select>
        </label>
        <label>
          Seed
          <input type="number" id="map-seed" value="${Math.floor(Math.random() * 100000)}">
        </label>
        <div class="import-save-row">
          <button type="button" id="import-save-btn">Import Save</button>
        </div>
        <button type="submit">Start Game</button>
      </form>
    `
    this.uiOverlay.appendChild(screen)

    const form = screen.querySelector('form')!
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const size = parseInt((screen.querySelector('#map-size') as HTMLSelectElement).value, 10) as MapSize
      const preset = (screen.querySelector('#map-preset') as HTMLSelectElement).value as 'plains' | 'island'
      const seed = parseInt((screen.querySelector('#map-seed') as HTMLInputElement).value, 10)

      const config: MapGenConfig = { size, seed, preset }
      const map = generateMap(config)
      this.engine = Engine.create(map)
      this.setMapSize(size, size)
      screen.remove()
      this.startLoop()
    })

    screen.querySelector('#import-save-btn')!.addEventListener('click', async () => {
      const save = await this.saveManager.importFromFile()
      if (save) {
        this.engine = Engine.restore(save)
        this.setMapSize(save.map.width, save.map.height)
        screen.remove()
        this.startLoop()
      }
    })
  }

  private createMenuBar(container: HTMLElement): void {
    const bar = document.createElement('div')
    bar.id = 'menu-bar'

    for (const item of this.actions) {
      const btn = document.createElement('button')
      btn.textContent = item.label
      btn.addEventListener('click', item.action)
      bar.appendChild(btn)
    }

    container.appendChild(bar)
  }

  private bindKeyboard(): void {
    const keyMap = new Map<string, () => void>()
    for (const item of this.actions) {
      if (item.key) keyMap.set(item.key, item.action)
    }
    keyMap.set('Escape', () => {
      if (this.escapeMenu.isVisible) {
        this.escapeMenu.hide()
      } else if (this.docsPanel.isVisible || this.budgetPanel.isVisible || this.queryPanel.isVisible || this.toolManager.activeTool) {
        this.toolManager.clear()
        this.queryPanel.hide()
        this.budgetPanel.hide()
        this.docsPanel.hide()
      } else {
        this.escapeMenu.show()
      }
    })

    window.addEventListener('keydown', (e) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement
      if (e.key === 'Escape') {
        const action = keyMap.get('Escape')
        if (action) action()
        return
      }
      if (inInput) return
      this.pressedKeys.add(e.key)
      const action = keyMap.get(e.key)
      if (action) { e.preventDefault(); action() }
    })
    window.addEventListener('keyup', (e) => {
      this.pressedKeys.delete(e.key)
    })
  }

  private startLoop(): void {
    this.lastFrameTime = performance.now()
    this.loop(this.lastFrameTime)

    window.addEventListener('beforeunload', () => this.autoSave())
  }

  private loop(now: number): void {
    const delta = now - this.lastFrameTime
    this.lastFrameTime = now

    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
      this.camera.setViewport(this.canvas.width, this.canvas.height)
    }

    // Keyboard panning (arrow keys)
    const panSpeed = 12 / (this.camera.tileSize * this.camera.zoom) * (delta / 16)
    const k = this.pressedKeys
    if (k.has('ArrowLeft')) this.camera.pan(-panSpeed, 0)
    if (k.has('ArrowRight')) this.camera.pan(panSpeed, 0)
    if (k.has('ArrowUp')) this.camera.pan(0, -panSpeed)
    if (k.has('ArrowDown')) this.camera.pan(0, panSpeed)
    const zoomSpeed = 1.02 ** (delta / 16)
    if (k.has('q')) this.camera.zoom /= zoomSpeed
    if (k.has('w')) this.camera.zoom *= zoomSpeed
    if (k.has('q') || k.has('w')) this.camera.clampZoom()
    if (k.has('ArrowLeft') || k.has('ArrowRight') || k.has('ArrowUp') || k.has('ArrowDown') ||
        k.has('q') || k.has('w')) {
      this.camera.clamp()
    }

    const tickInterval = TICK_INTERVALS[this.speed]
    if (tickInterval > 0 && this.engine) {
      const result = advanceTicks(this.simAccumulator, delta, tickInterval)
      this.simAccumulator = result.remainder
      for (let i = 0; i < result.ticks; i++) {
        this.engine.tick()
        this.ticksSinceSave++

        if (this.ticksSinceSave >= 48) {
          this.autoSave()
          this.ticksSinceSave = 0
        }
      }
    }

    if (this.engine) {
      const state = this.engine.getState()
      this.renderer.render(state)
      this.infoBar.update(state)
      this.budgetPanel.update(state)
      this.drawToolPreview(state)

      // Minimap every 10 frames
      this.frameCount++
      if (this.frameCount % 10 === 0) {
        this.miniMap.render(state, this.camera)
      }
    }

    this.animationId = requestAnimationFrame((t) => this.loop(t))
  }

  private drawToolPreview(state: GameState): void {
    const hover = this.inputManager.getHoverTile()
    const tool = this.toolManager.activeTool
    if (!hover || !tool?.getPreviewColor) return
    if (hover.x < 0 || hover.y < 0 || hover.x >= state.map.width || hover.y >= state.map.height) return

    const screen = this.camera.tileToScreen(hover.x, hover.y)
    const tileSize = this.camera.tileSize * this.camera.zoom
    this.ctx.fillStyle = tool.getPreviewColor()
    this.ctx.fillRect(screen.x, screen.y, tileSize, tileSize)
  }

  private autoSave(): void {
    if (!this.engine) return
    this.saveManager.save(this.engine.serialize())
  }
}
