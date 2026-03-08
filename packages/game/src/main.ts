const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

resize()
window.addEventListener('resize', resize)

// Placeholder: draw a test rectangle
ctx.fillStyle = '#4a8c3f'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#fff'
ctx.font = '24px system-ui'
ctx.fillText('Bitborough — canvas working', 20, 40)
