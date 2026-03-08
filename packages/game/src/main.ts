import { Game } from './Game.js'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const uiOverlay = document.getElementById('ui-overlay') as HTMLElement

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const game = new Game(canvas, uiOverlay)
game.start()
