export class EscapeMenu {
  private el: HTMLElement
  private visible = false

  constructor(
    container: HTMLElement,
    private callbacks: {
      onResume: () => void
      onSave: () => void
      onLoad: () => Promise<void>
      onNewGame: () => void
    },
  ) {
    this.el = document.createElement('div')
    this.el.id = 'escape-menu'
    this.el.classList.add('hidden')
    this.el.innerHTML = `
      <div class="escape-menu-backdrop"></div>
      <div class="escape-menu-panel">
        <h2>Bitborough</h2>
        <button data-action="resume">Resume</button>
        <button data-action="save">Save Game</button>
        <button data-action="load">Load Game</button>
        <button data-action="new">New Game</button>
      </div>
    `
    container.appendChild(this.el)

    this.el.querySelector('.escape-menu-backdrop')!.addEventListener('click', () => this.hide())
    this.el.querySelector('[data-action="resume"]')!.addEventListener('click', () => this.hide())
    this.el.querySelector('[data-action="save"]')!.addEventListener('click', () => {
      this.callbacks.onSave()
      this.hide()
    })
    this.el.querySelector('[data-action="load"]')!.addEventListener('click', async () => {
      await this.callbacks.onLoad()
      this.hide()
    })
    this.el.querySelector('[data-action="new"]')!.addEventListener('click', () => {
      this.callbacks.onNewGame()
      this.hide()
    })
  }

  show(): void {
    this.visible = true
    this.el.classList.remove('hidden')
  }

  hide(): void {
    this.visible = false
    this.el.classList.add('hidden')
  }

  get isVisible(): boolean {
    return this.visible
  }
}
