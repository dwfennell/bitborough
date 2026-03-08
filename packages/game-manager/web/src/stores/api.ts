import type { Asset, Generation, PromptTemplate } from '../types'

const API_BASE = '/api'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  return response.json()
}

export const api = {
  assets: {
    list: async (category?: string, search?: string): Promise<Asset[]> => {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      const res = await fetch(`${API_BASE}/assets?${params}`)
      return handleResponse(res)
    },

    get: async (id: string): Promise<Asset> => {
      const res = await fetch(`${API_BASE}/assets/${id}`)
      return handleResponse(res)
    },

    create: async (data: Partial<Asset>): Promise<Asset> => {
      const res = await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(res)
    },

    update: async (id: string, data: Partial<Asset>): Promise<Asset> => {
      const res = await fetch(`${API_BASE}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(res)
    },

    delete: async (id: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/assets/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
    },
  },

  generations: {
    list: async (): Promise<Generation[]> => {
      const res = await fetch(`${API_BASE}/generations`)
      return handleResponse(res)
    },

    get: async (id: string): Promise<Generation> => {
      const res = await fetch(`${API_BASE}/generations/${id}`)
      return handleResponse(res)
    },

    create: async (data: {
      prompt: string
      negativePrompt?: string
      width?: number
      height?: number
      seed?: number
      style?: string
      steps?: number
      guidance?: number
      referenceImage?: string
      strength?: number
    }): Promise<Generation> => {
      const res = await fetch(`${API_BASE}/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(res)
    },

    accept: async (
      id: string,
      name: string,
      category: string,
      tags: string
    ): Promise<Asset> => {
      const res = await fetch(`${API_BASE}/generations/${id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, tags }),
      })
      return handleResponse(res)
    },

    reject: async (id: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/generations/${id}/reject`, {
        method: 'POST',
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
    },
  },

  templates: {
    list: async (): Promise<PromptTemplate[]> => {
      const res = await fetch(`${API_BASE}/templates`)
      return handleResponse(res)
    },

    create: async (data: {
      name: string
      category?: string
      prompt: string
      negativePrompt?: string
      style?: string
      notes?: string
    }): Promise<PromptTemplate> => {
      const res = await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(res)
    },
  },
}
