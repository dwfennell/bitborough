import { SimSpeed } from '@bitborough/core'

const SPEED_KEY = 'bitborough-speed'

function loadSpeed(): SimSpeed {
  const stored = localStorage.getItem(SPEED_KEY)
  if (stored !== null) {
    const val = Number(stored)
    if (val >= SimSpeed.Paused && val <= SimSpeed.Fast) return val as SimSpeed
  }
  return SimSpeed.Normal
}

export class SpeedControls {
  private el: HTMLElement
  private buttons: HTMLButtonElement[] = []
  private _speed: SimSpeed
  private onChange: (speed: SimSpeed) => void

  constructor(container: HTMLElement, onChange: (speed: SimSpeed) => void) {
    this.onChange = onChange
    this._speed = loadSpeed()
    this.el = document.createElement('div')
    this.el.id = 'speed-controls'

    const speeds: { label: string; speed: SimSpeed }[] = [
      { label: '\u23F8', speed: SimSpeed.Paused },
      { label: '\u25B6', speed: SimSpeed.Slow },
      { label: '\u25B6\u25B6', speed: SimSpeed.Normal },
      { label: '\u25B6\u25B6\u25B6', speed: SimSpeed.Fast },
    ]

    for (const s of speeds) {
      const btn = document.createElement('button')
      btn.textContent = s.label
      btn.addEventListener('click', () => this.setSpeed(s.speed, btn))
      this.el.appendChild(btn)
      this.buttons.push(btn)
      if (s.speed === this._speed) btn.classList.add('active')
    }

    // Notify the game of the restored speed
    onChange(this._speed)

    container.appendChild(this.el)

    const speedOrder = [SimSpeed.Paused, SimSpeed.Slow, SimSpeed.Normal, SimSpeed.Fast]

    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
      if (e.key === ' ') {
        e.preventDefault()
        if (this._speed === SimSpeed.Paused) {
          this.setSpeed(SimSpeed.Normal, this.buttons[2]!)
        } else {
          this.setSpeed(SimSpeed.Paused, this.buttons[0]!)
        }
      } else if (e.key === '[') {
        const idx = Math.max(0, speedOrder.indexOf(this._speed) - 1)
        this.setSpeed(speedOrder[idx]!, this.buttons[idx]!)
      } else if (e.key === ']') {
        const idx = Math.min(speedOrder.length - 1, speedOrder.indexOf(this._speed) + 1)
        this.setSpeed(speedOrder[idx]!, this.buttons[idx]!)
      }
    })
  }

  private setSpeed(speed: SimSpeed, btn: HTMLButtonElement): void {
    this._speed = speed
    localStorage.setItem(SPEED_KEY, String(speed))
    this.buttons.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    this.onChange(speed)
  }

  get speed(): SimSpeed {
    return this._speed
  }
}
