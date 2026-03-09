interface DocSection {
  title: string
  content: string
}

const SECTIONS: DocSection[] = [
  {
    title: 'Getting Started',
    content: `
      <p>Welcome to Bitborough! Build and manage a thriving city.</p>
      <p><strong>Basic steps:</strong></p>
      <ol>
        <li>Place a <em>Coal Power Plant</em> (key 6) to generate electricity</li>
        <li>Run <em>Power Lines</em> (key 2) from the plant toward your city</li>
        <li>Build <em>Roads</em> (key 1) for access</li>
        <li>Zone <em>Residential</em> (3), <em>Commercial</em> (4), and <em>Industrial</em> (5) areas next to roads</li>
        <li>Wait for buildings to develop automatically</li>
      </ol>
      <p>Zones only develop when they are <strong>powered</strong> and <strong>adjacent to a road</strong>.</p>
    `,
  },
  {
    title: 'Controls',
    content: `
      <table>
        <tr><td><strong>W A S D / Arrows</strong></td><td>Pan camera</td></tr>
        <tr><td><strong>Q / E</strong></td><td>Zoom out / Zoom in</td></tr>
        <tr><td><strong>Scroll Wheel</strong></td><td>Zoom in/out</td></tr>
        <tr><td><strong>Right-click drag</strong></td><td>Pan camera</td></tr>
        <tr><td><strong>Left-click</strong></td><td>Use active tool</td></tr>
        <tr><td><strong>Left-click drag</strong></td><td>Paint with tool</td></tr>
        <tr><td><strong>[ / ]</strong></td><td>Decrease / Increase game speed</td></tr>
        <tr><td><strong>Space</strong></td><td>Toggle pause</td></tr>
        <tr><td><strong>Escape</strong></td><td>Close dialogs / Open menu</td></tr>
      </table>
    `,
  },
  {
    title: 'Tools & Shortcuts',
    content: `
      <table>
        <tr><td><strong>1</strong></td><td>Road ($10)</td></tr>
        <tr><td><strong>2</strong></td><td>Power Line ($5)</td></tr>
        <tr><td><strong>3</strong></td><td>Residential Zone</td></tr>
        <tr><td><strong>4</strong></td><td>Commercial Zone</td></tr>
        <tr><td><strong>5</strong></td><td>Industrial Zone</td></tr>
        <tr><td><strong>6</strong></td><td>Coal Power Plant ($3,000)</td></tr>
        <tr><td><strong>7</strong></td><td>Nuclear Power Plant ($5,000)</td></tr>
        <tr><td><strong>8</strong></td><td>Police Station ($500)</td></tr>
        <tr><td><strong>9</strong></td><td>Fire Station ($500)</td></tr>
        <tr><td><strong>0</strong></td><td>Park ($10)</td></tr>
        <tr><td><strong>-</strong></td><td>Bulldoze ($1)</td></tr>
        <tr><td><strong>=</strong></td><td>Query (inspect tile)</td></tr>
      </table>
    `,
  },
  {
    title: 'Overlays',
    content: `
      <p>Toggle data overlays to visualize city systems:</p>
      <table>
        <tr><td><strong>P</strong></td><td><em>Power</em> — Yellow = powered, gray = unpowered</td></tr>
        <tr><td><strong>V</strong></td><td><em>Land Value</em> — Blue (low) to red (high)</td></tr>
        <tr><td><strong>C</strong></td><td><em>Crime</em> — Red heatmap showing crime levels</td></tr>
        <tr><td><strong>F</strong></td><td><em>Fire</em> — Green (covered) to red (at risk), orange = active fire</td></tr>
        <tr><td><strong>T</strong></td><td><em>Traffic</em> — Green (light) to red (gridlock) on roads</td></tr>
        <tr><td><strong>G</strong></td><td><em>Grid</em> — Toggle tile grid lines</td></tr>
      </table>
      <p>Press the same key again to turn off the overlay.</p>
    `,
  },
  {
    title: 'Power',
    content: `
      <p>Buildings and zones need electricity to function. Power propagates from plants through adjacent powered tiles.</p>
      <p><strong>Coal Plant</strong> — $3,000, $120/mo maintenance, powers ~700 tiles, 4x4 footprint.</p>
      <p><strong>Nuclear Plant</strong> — $5,000, $250/mo maintenance, powers ~2,000 tiles, 4x4 footprint.</p>
      <p><strong>Power Lines</strong> — $5 each, $0.50/mo maintenance. Use them to bridge gaps between your plant and developed areas.</p>
      <p>Roads and zoned tiles also conduct power, so you often don't need power lines within a developed area.</p>
    `,
  },
  {
    title: 'Zones & Development',
    content: `
      <p>Zones are where your city grows. Place them and buildings will appear automatically when conditions are met.</p>
      <p><strong>Requirements for development:</strong></p>
      <ul>
        <li>Zone must be <em>powered</em></li>
        <li>Zone must be <em>adjacent to a road</em></li>
        <li>Positive <em>demand</em> for that zone type</li>
      </ul>
      <p><strong>Residential</strong> — Where people live. Always has base demand. Each building adds ~10 population.</p>
      <p><strong>Commercial</strong> — Shops and offices. Demand grows with population (needs customers).</p>
      <p><strong>Industrial</strong> — Factories and workshops. Steady base demand, less sensitive to taxes. Generates pollution.</p>
      <p>Watch the <strong>R/C/I demand bars</strong> in the top bar to know when to zone more.</p>
    `,
  },
  {
    title: 'Roads & Traffic',
    content: `
      <p>Roads ($10 each, $1/mo maintenance) connect your zones and enable development.</p>
      <p><strong>Traffic</strong> simulates commuters traveling from residential areas to commercial and industrial zones along roads.</p>
      <p>High traffic congestion (visible on the Traffic overlay) <strong>suppresses demand</strong> for all zone types. If average road congestion exceeds 80%, growth slows.</p>
      <p><strong>Tips:</strong></p>
      <ul>
        <li>Build parallel roads to distribute traffic</li>
        <li>Keep residential and work zones within ~30 tiles of each other</li>
        <li>Zones too far from roads won't generate traffic (or develop)</li>
      </ul>
    `,
  },
  {
    title: 'Budget & Taxes',
    content: `
      <p>Open the budget panel with <strong>B</strong>.</p>
      <p><strong>Income</strong> comes from property taxes on developed zones, influenced by land values and your tax rate.</p>
      <p><strong>Tax Rate</strong> — Default 7% (neutral). Lower taxes boost demand but reduce income. Higher taxes suppress growth. Range: 0-20%.</p>
      <p><strong>Expenses</strong> include maintenance costs for all infrastructure and service buildings.</p>
      <p><strong>Balance</strong> is calculated monthly but applied to your funds at the start of each year (January).</p>
      <p>If your funds run out, you can't build — but existing buildings continue to function.</p>
    `,
  },
  {
    title: 'Crime',
    content: `
      <p>Crime appears in zoned areas, especially where land values are low.</p>
      <p><strong>Police Stations</strong> ($500, $100/mo) reduce crime in a radius around them. Their effectiveness depends on funding level (adjustable in the Budget panel, 0-100%).</p>
      <p>High crime reduces land values, which in turn reduces tax income — a downward spiral if left unchecked.</p>
      <p>Use the <strong>Crime overlay (C)</strong> to identify problem areas.</p>
    `,
  },
  {
    title: 'Fire',
    content: `
      <p>Fires can ignite randomly in zoned areas that lack fire coverage. They spread to neighboring tiles and <strong>destroy zones</strong> when they burn out.</p>
      <p><strong>Fire Stations</strong> ($500, $100/mo) provide coverage that dramatically reduces fire risk (90% reduction) and slows fire spread. Effectiveness depends on funding level.</p>
      <p>Water, roads, and empty land act as natural firebreaks.</p>
      <p>Use the <strong>Fire overlay (F)</strong> to see coverage (green = safe) and active fires (orange).</p>
    `,
  },
  {
    title: 'Land Value',
    content: `
      <p>Land value affects tax income and zone development. Higher land values generate more revenue.</p>
      <p><strong>Increases with:</strong> Power coverage, proximity to parks and services.</p>
      <p><strong>Decreases with:</strong> Pollution (from industrial zones), high crime.</p>
      <p>Use the <strong>Land Value overlay (V)</strong> to visualize values across your city.</p>
    `,
  },
]

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
