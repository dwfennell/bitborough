import { type BuildingRow, SECTIONS, getBuildingReference } from '@bitborough/docs'
import { marked } from 'marked'

function formatCurrency(n: number): string {
  return n === 0 ? '—' : `$${n.toLocaleString()}`
}

function formatNum(n: number | undefined): string {
  return n == null || n === 0 ? '—' : String(n)
}

function buildReferenceTable(rows: BuildingRow[]): string {
  const headerRow = `<tr>
    <th>Building</th>
    <th>Cost</th>
    <th>Maint.</th>
    <th>Power Cap.</th>
    <th>Jobs</th>
    <th>Pop.</th>
    <th>Pollution R</th>
    <th>Pollution Amt</th>
    <th>Size</th>
    <th>Notes</th>
  </tr>`
  const dataRows = rows.map(r => `<tr>
    <td><strong>${r.name}</strong></td>
    <td>${formatCurrency(r.cost)}</td>
    <td>${formatCurrency(r.maintenanceCost)}</td>
    <td>${formatNum(r.powerCapacity)}</td>
    <td>${formatNum(r.jobs)}</td>
    <td>${formatNum(r.population)}</td>
    <td>${formatNum(r.pollutionRadius)}</td>
    <td>${formatNum(r.pollutionAmount)}</td>
    <td>${r.size.w}×${r.size.h}</td>
    <td>${r.notes}</td>
  </tr>`).join('')
  return `<table class="docs-ref-table">${headerRow}${dataRows}</table>`
}

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

    const buildingRefRows = getBuildingReference()

    for (const section of SECTIONS) {
      const bodyHtml = marked.parse(section.body) as string
      const sectionEl = document.createElement('div')
      sectionEl.className = 'docs-section'
      sectionEl.innerHTML = `<h4>${section.title}</h4>${bodyHtml}`
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
        text: bodyHtml.replace(/<[^>]*>/g, ' ').toLowerCase(),
      })
    }

    // Append Building Reference section
    const refHtml = buildReferenceTable(buildingRefRows)
    const refSectionEl = document.createElement('div')
    refSectionEl.className = 'docs-section'
    refSectionEl.innerHTML = `<h4>Building Reference</h4>${refHtml}`
    this.sectionsContainer.appendChild(refSectionEl)

    const refTocEl = document.createElement('li')
    refTocEl.className = 'docs-toc-item'
    refTocEl.textContent = 'Building Reference'
    refTocEl.addEventListener('click', () => {
      refSectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    this.tocList.appendChild(refTocEl)

    this.sectionEls.push({
      el: refSectionEl,
      tocEl: refTocEl,
      title: 'building reference',
      text: refHtml.replace(/<[^>]*>/g, ' ').toLowerCase(),
    })

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
