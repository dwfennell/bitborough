import { SimSpeed, type GameState } from '@bitborough/core'
import { Engine } from '@bitborough/engine'
import { generateMap, type MapGenConfig } from '@bitborough/map-gen'
import { Camera } from './render/Camera.js'
import { Renderer } from './render/Renderer.js'
import { InputManager } from './input/InputManager.js'
import { ToolManager } from './tools/ToolManager.js'
import { InfoBar } from './ui/InfoBar.js'
import { Toolbar } from './ui/Toolbar.js'
import { SpeedControls } from './ui/SpeedControls.js'
import { SaveManager } from './storage/SaveManager.js'

const TICK_INTERVALS: Record<SimSpeed, number> = {
  [SimSpeed.Paused]: 0,
  [SimSpeed.Slow]: 1000,
  [SimSpeed.Normal]: 250,
  [SimSpeed.Fast]: 100,
  [SimSpeed.Turbo]: 25,
}

const TILE_SIZE = 16

export class Game {
  private engine: Engine | null = null
  private camera: Camera
  private renderer: Renderer
  private inputManager: InputManager
  private toolManager: ToolManager
  private infoBar: InfoBar
  private toolbar: Toolbar
  private speedControls: SpeedControls
  private saveManager: SaveManager

  private speed: SimSpeed = SimSpeed.Normal
  private simAccumulator = 0
  private lastFrameTime = 0
  private animationId = 0
  private ticksSinceSave = 0

  constructor(
    private canvas: HTMLCanvasElement,
    private uiOverlay: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d')!

    this.camera = new Camera(canvas.width, canvas.height, TILE_SIZE)
    this.renderer = new Renderer(ctx, this.camera)
    this.toolManager = new ToolManager()
    this.inputManager = new InputManager(canvas, this.camera, this.toolManager, () => this.engine)
    this.saveManager = new SaveManager()

    this.infoBar = new InfoBar(uiOverlay)
    this.toolbar = new Toolbar(uiOverlay, this.toolManager)
    this.speedControls = new SpeedControls(uiOverlay, (s) => {
      this.speed = s
    })
  }

  start(): void {
    if (this.saveManager.hasSave()) {
      const save = this.saveManager.load()
      if (save) {
        this.engine = Engine.restore(save)
        this.camera.setMapSize(save.map.width, save.map.height)
        this.startLoop()
        return
      }
    }

    this.showNewGameScreen()
  }

  private showNewGameScreen(): void {
    const screen = document.createElement('div')
    screen.id = 'new-game-screen'
    screen.innerHTML = `
      <form id="new-game-form">
        <h1>Bitborough</h1>
        <label>
          Map Size
          <select id="map-size">
            <option value="64">64x64 (Small)</option>
            <option value="128" selected>128x128 (Medium)</option>
            <option value="256">256x256 (Large)</option>
          </select>
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
        <button type="submit">Start Game</button>
      </form>
    `
    this.uiOverlay.appendChild(screen)

    const form = screen.querySelector('form')!
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const size = parseInt((screen.querySelector('#map-size') as HTMLSelectElement).value, 10) as 64 | 128 | 256
      const preset = (screen.querySelector('#map-preset') as HTMLSelectElement).value as 'plains' | 'island'
      const seed = parseInt((screen.querySelector('#map-seed') as HTMLInputElement).value, 10)

      const config: MapGenConfig = { size, seed, preset }
      const map = generateMap(config)
      this.engine = Engine.create(map)
      this.camera.setMapSize(size, size)
      screen.remove()
      this.startLoop()
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

    const tickInterval = TICK_INTERVALS[this.speed]
    if (tickInterval > 0 && this.engine) {
      this.simAccumulator += delta
      while (this.simAccumulator >= tickInterval) {
        this.engine.tick()
        this.simAccumulator -= tickInterval
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
      this.drawToolPreview(state)
    }

    this.animationId = requestAnimationFrame((t) => this.loop(t))
  }

  private drawToolPreview(state: GameState): void {
    const hover = this.inputManager.getHoverTile()
    const tool = this.toolManager.activeTool
    if (!hover || !tool?.getPreviewColor) return
    if (hover.x < 0 || hover.y < 0 || hover.x >= state.map.width || hover.y >= state.map.height) return

    const ctx = this.canvas.getContext('2d')!
    const screen = this.camera.tileToScreen(hover.x, hover.y)
    const tileSize = this.camera.tileSize * this.camera.zoom
    ctx.fillStyle = tool.getPreviewColor()
    ctx.fillRect(screen.x, screen.y, tileSize, tileSize)
  }

  private autoSave(): void {
    if (!this.engine) return
    this.saveManager.save(this.engine.serialize())
  }
}
