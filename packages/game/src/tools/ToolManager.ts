import type { Tool } from './Tool.js'

export class ToolManager {
  activeTool: Tool | null = null

  setTool(tool: Tool): void {
    this.activeTool = tool
  }

  clear(): void {
    this.activeTool = null
  }
}
