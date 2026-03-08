import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './api'

describe('API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('assets', () => {
    it('should fetch assets list', async () => {
      const mockAssets = [
        { id: '1', name: 'Asset 1', category: 'terrain', filename: 'a.png' },
      ]

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAssets),
      })

      const assets = await api.assets.list()
      expect(assets).toEqual(mockAssets)
      expect(fetch).toHaveBeenCalledWith('/api/assets?')
    })

    it('should filter assets by category', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await api.assets.list('terrain')
      expect(fetch).toHaveBeenCalledWith('/api/assets?category=terrain')
    })

    it('should search assets', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await api.assets.list(undefined, 'grass')
      expect(fetch).toHaveBeenCalledWith('/api/assets?search=grass')
    })

    it('should create asset', async () => {
      const newAsset = { name: 'Test', category: 'terrain', filename: 't.png' }
      const createdAsset = { ...newAsset, id: '123' }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createdAsset),
      })

      const result = await api.assets.create(newAsset)
      expect(result).toEqual(createdAsset)
      expect(fetch).toHaveBeenCalledWith('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset),
      })
    })

    it('should handle errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      })

      await expect(api.assets.get('999')).rejects.toThrow('Not found')
    })
  })

  describe('generations', () => {
    it('should create generation', async () => {
      const request = { prompt: 'A grass tile', width: 512, height: 512 }
      const created = { ...request, id: '123', status: 'pending' }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(created),
      })

      const result = await api.generations.create(request)
      expect(result.status).toBe('pending')
      expect(result.prompt).toBe('A grass tile')
    })

    it('should accept generation', async () => {
      const asset = { id: 'asset-1', name: 'Grass', category: 'terrain' }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(asset),
      })

      const result = await api.generations.accept('gen-1', 'Grass', 'terrain', 'grass,green')
      expect(result.name).toBe('Grass')
      expect(fetch).toHaveBeenCalledWith('/api/generations/gen-1/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Grass', category: 'terrain', tags: 'grass,green' }),
      })
    })

    it('should reject generation', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true })

      await api.generations.reject('gen-1')
      expect(fetch).toHaveBeenCalledWith('/api/generations/gen-1/reject', {
        method: 'POST',
      })
    })
  })

  describe('templates', () => {
    it('should create template', async () => {
      const request = { name: 'Terrain', category: 'terrain', prompt: 'top-down tile' }
      const created = { ...request, id: '123' }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(created),
      })

      const result = await api.templates.create(request)
      expect(result.name).toBe('Terrain')
    })
  })
})
