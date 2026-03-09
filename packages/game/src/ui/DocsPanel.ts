import { type DocSection, SECTIONS } from './docs/index.js'

export class DocsPanel {
  private el: HTMLElement
  private visible = false
  private searchInput: HTMLInputElement
  private sectionsContainer: HTMLElement
  private tocList: HTMLElement
  private sectionEls: { el: HTMLElement; tocEl: HTMLElement; title: string; text: string }[] = []

  constructor(container: HTMLElement) {
    this.el = document.createElement('div')
    this.el.id = 'docs-panel'
    this.el.classList.add('hidden')
    this.el.innerHTML = `
      <div class="docs-header">
        <h3>Game Guide</h3>
        <input type="text" id="docs-search" placeholder="Search..." autocomplete="off">
        <button class="panel-close">&times;</button>
      </div>
      <div class="docs-body">
        <nav class="docs-toc"><ul class="docs-toc-list"></ul></nav>
        <div class="docs-sections"></div>
      </div>
    `
    container.appendChild(this.el)

    this.searchInput = this.el.querySelector('#docs-search')!
    this.sectionsContainer = this.el.querySelector('.docs-sections')!
    this.tocList = this.el.querySelector('.docs-toc-list')!

    for (const section of SECTIONS) {
      const sectionEl = document.createElement('div')
      sectionEl.className = 'docs-section'
      sectionEl.innerHTML = `<h4>${section.title}</h4>${section.content}`
      this.sectionsContainer.appendChild(sectionEl)

      const tocEl = document.createElement('li')
      tocEl.className = 'docs-toc-item'
      tocEl.textContent = section.title
      tocEl.addEventListener('click', () => {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      this.tocList.appendChild(tocEl)

      this.sectionEls.push({
        el: sectionEl,
        tocEl,
        title: section.title.toLowerCase(),
        text: section.content.replace(/<[^>]*>/g, ' ').toLowerCase(),
      })
    }

    this.sectionsContainer.addEventListener('scroll', () => this.updateActiveToc())
    this.searchInput.addEventListener('input', () => this.filter())
    this.el.querySelector('.panel-close')!.addEventListener('click', () => this.hide())
  }

  private filter(): void {
    const query = this.searchInput.value.toLowerCase().trim()
    for (const s of this.sectionEls) {
      const match = !query || s.title.includes(query) || s.text.includes(query)
      s.el.classList.toggle('hidden', !match)
      s.tocEl.classList.toggle('hidden', !match)
    }
    this.updateActiveToc()
  }

  private updateActiveToc(): void {
    const containerTop = this.sectionsContainer.scrollTop
    let activeIdx = 0
    for (let i = 0; i < this.sectionEls.length; i++) {
      const s = this.sectionEls[i]!
      if (s.el.classList.contains('hidden')) continue
      if (s.el.offsetTop - this.sectionsContainer.offsetTop <= containerTop + 4) {
        activeIdx = i
      }
    }
    for (let i = 0; i < this.sectionEls.length; i++) {
      this.sectionEls[i]!.tocEl.classList.toggle('active', i === activeIdx)
    }
  }

  toggle(): void {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }

  show(): void {
    this.visible = true
    this.el.classList.remove('hidden')
    this.searchInput.value = ''
    this.filter()
    this.sectionsContainer.scrollTop = 0
    this.updateActiveToc()
    this.searchInput.focus()
  }

  hide(): void {
    this.visible = false
    this.el.classList.add('hidden')
  }

  get isVisible(): boolean {
    return this.visible
  }
}
