import { ZoneType } from '@bitborough/core'
import { ToolManager } from '../tools/ToolManager.js'
import { RoadTool } from '../tools/RoadTool.js'
import { PowerLineTool } from '../tools/PowerLineTool.js'
import { ZoneTool } from '../tools/ZoneTool.js'
import { BulldozeTool } from '../tools/BulldozeTool.js'
import { BuildingTool } from '../tools/BuildingTool.js'
import { QueryTool } from '../tools/QueryTool.js'
import type { Tool } from '../tools/Tool.js'

interface ToolEntry {
  label: string
  key: string
  factory: () => Tool
}

const TOOL_ENTRIES: ToolEntry[] = [
  { label: 'Road', key: '1', factory: () => new RoadTool() },
  { label: 'Power', key: '2', factory: () => new PowerLineTool() },
  { label: 'Zone R', key: '3', factory: () => new ZoneTool(ZoneType.Residential) },
  { label: 'Zone C', key: '4', factory: () => new ZoneTool(ZoneType.Commercial) },
  { label: 'Zone I', key: '5', factory: () => new ZoneTool(ZoneType.Industrial) },
  { label: 'Coal', key: '6', factory: () => new BuildingTool('power.coal') },
  { label: 'Bulldoze', key: '7', factory: () => new BulldozeTool() },
  { label: 'Query', key: '8', factory: () => new QueryTool() },
]

export class Toolbar {
  private el: HTMLElement
  private buttons: HTMLButtonElement[] = []

  constructor(container: HTMLElement, private toolManager: ToolManager) {
    this.el = document.createElement('div')
    this.el.id = 'toolbar'

    for (const entry of TOOL_ENTRIES) {
      const btn = document.createElement('button')
      btn.textContent = `${entry.key} ${entry.label}`
      btn.dataset.key = entry.key
      btn.addEventListener('click', () => this.selectTool(entry, btn))
      this.el.appendChild(btn)
      this.buttons.push(btn)
    }

    container.appendChild(this.el)

    window.addEventListener('keydown', (e) => {
      const entry = TOOL_ENTRIES.find(t => t.key === e.key)
      if (entry) {
        const btn = this.buttons.find(b => b.dataset.key === e.key)!
        this.selectTool(entry, btn)
      }
    })
  }

  private selectTool(entry: ToolEntry, btn: HTMLButtonElement): void {
    this.buttons.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    this.toolManager.setTool(entry.factory())
  }
}
