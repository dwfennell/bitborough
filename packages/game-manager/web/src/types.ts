export interface Asset {
  id: string
  name: string
  category: string
  filename: string
  width?: number
  height?: number
  tags?: string[]
  prompt?: string
  negativePrompt?: string
  seed?: number
  style?: string
  steps?: number
  guidance?: number
  generationId?: string
  createdAt: string
  updatedAt: string
}

export interface Generation {
  id: string
  assetId?: string
  templateId?: string
  prompt: string
  negativePrompt?: string
  seed?: number
  width?: number
  height?: number
  style?: string
  steps?: number
  guidance?: number
  referenceImage?: string
  strength?: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rejected'
  outputPath?: string
  error?: string
  autoApprove?: boolean
  autoName?: string
  autoCategory?: string
  autoTags?: string
  createdAt: string
  completedAt?: string
}

export interface PromptTemplate {
  id: string
  name: string
  category?: string
  prompt: string
  negativePrompt?: string
  style?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
