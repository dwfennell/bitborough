import { ZoneType, Infrastructure, COSTS } from '@bitborough/core'
import { BUILDING_DEFS } from '@bitborough/engine'
import { ToolManager } from '../tools/ToolManager.js'
import { InfrastructureTool } from '../tools/InfrastructureTool.js'
import { ZoneTool } from '../tools/ZoneTool.js'
import { BulldozeTool } from '../tools/BulldozeTool.js'
import { BuildingTool } from '../tools/BuildingTool.js'
import { QueryTool } from '../tools/QueryTool.js'
import { UpgradeRoadTool } from '../tools/UpgradeRoadTool.js'
import type { Tool } from '../tools/Tool.js'

function fmtCost(cost: number): string {
  return cost >= 1000 ? `$${cost / 1000}k` : `$${cost}`
}

interface ToolEntry {
  label: string
  key: string
  factory: () => Tool
}

const TOOL_ENTRIES: ToolEntry[] = [
  // Infrastructure
  {
    label: `Road ${fmtCost(COSTS.road)}`,
    key: '1',
    factory: () => new InfrastructureTool('Road', Infrastructure.Road, 'rgba(85,85,85,0.5)'),
  },
  { label: `Pave $${COSTS.pavedRoadUpgrade}`, key: '`', factory: () => new UpgradeRoadTool() },
  {
    label: `Power ${fmtCost(COSTS.powerLine)}`,
    key: '2',
    factory: () => new InfrastructureTool('Power Line', Infrastructure.PowerLine, 'rgba(255,193,7,0.5)'),
  },
  // Zones (free)
  { label: 'Zone R', key: '3', factory: () => new ZoneTool(ZoneType.Residential) },
  { label: 'Zone C', key: '4', factory: () => new ZoneTool(ZoneType.Commercial) },
  { label: 'Zone I', key: '5', factory: () => new ZoneTool(ZoneType.Industrial) },
  // Power
  {
    label: `Diesel ${fmtCost(BUILDING_DEFS['power.diesel']!.cost)}`,
    key: '6',
    factory: () => new BuildingTool('power.diesel'),
  },
  {
    label: `Coal ${fmtCost(BUILDING_DEFS['power.coal']!.cost)}`,
    key: '7',
    factory: () => new BuildingTool('power.coal'),
  },
  {
    label: `Nuclear ${fmtCost(BUILDING_DEFS['power.nuclear']!.cost)}`,
    key: '8',
    factory: () => new BuildingTool('power.nuclear'),
  },
  // Services
  {
    label: `Transit ${fmtCost(BUILDING_DEFS['transit.stop']!.cost)}`,
    key: 'y',
    factory: () => new BuildingTool('transit.stop'),
  },
  {
    label: `Kiosk ${fmtCost(BUILDING_DEFS['service.police.small']!.cost)}`,
    key: 'i',
    factory: () => new BuildingTool('service.police.small'),
  },
  {
    label: `Police ${fmtCost(BUILDING_DEFS['service.police']!.cost)}`,
    key: '9',
    factory: () => new BuildingTool('service.police'),
  },
  {
    label: `SubStn ${fmtCost(BUILDING_DEFS['service.fire.small']!.cost)}`,
    key: 'u',
    factory: () => new BuildingTool('service.fire.small'),
  },
  {
    label: `Fire ${fmtCost(BUILDING_DEFS['service.fire']!.cost)}`,
    key: '0',
    factory: () => new BuildingTool('service.fire'),
  },
  {
    label: `Park ${fmtCost(BUILDING_DEFS['special.park']!.cost)}`,
    key: 'n',
    factory: () => new BuildingTool('special.park'),
  },
  // Utility
  { label: `Bulldoze ${fmtCost(COSTS.bulldoze)}`, key: '-', factory: () => new BulldozeTool() },
  { label: 'Query', key: '=', factory: () => new QueryTool() },
]

export class Toolbar {
  private el: HTMLElement
  private buttons: HTMLButtonElement[] = []
  private boundKeyDown: (e: KeyboardEvent) => void

  constructor(
    container: HTMLElement,
    private toolManager: ToolManager,
  ) {
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

    this.boundKeyDown = (e: KeyboardEvent) => {
      const entry = TOOL_ENTRIES.find((t) => t.key === e.key)
      if (entry) {
        const btn = this.buttons.find((b) => b.dataset.key === e.key)!
        this.selectTool(entry, btn)
      }
    }
    window.addEventListener('keydown', this.boundKeyDown)
  }

  destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown)
  }

  private selectTool(entry: ToolEntry, btn: HTMLButtonElement): void {
    this.buttons.forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
    this.toolManager.setTool(entry.factory())
  }
}
