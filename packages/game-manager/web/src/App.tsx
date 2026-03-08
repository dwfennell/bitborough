import { useState, useEffect, useCallback } from 'preact/hooks'
import { AssetGrid } from './features/assets/AssetGrid'
import { GenerateForm } from './features/generation/GenerateForm'
import { GenerationQueue } from './features/generation/GenerationQueue'
import { api } from './stores/api'
import type { Asset, Generation } from './types'

// Extensible route structure:
// /assets - asset library list
// /assets/:id - single asset detail
// /generate - tile generation
// /generate/queue - generation queue (future)
// /templates - prompt templates (future)
// /families - tile families (future)
// /settings - app settings (future)

interface Route {
  section: 'assets' | 'generate' | 'templates' | 'families' | 'settings'
  id?: string
  params: URLSearchParams
}

function parseRoute(): Route {
  const path = window.location.pathname
  const params = new URLSearchParams(window.location.search)
  const segments = path.split('/').filter(Boolean)

  // /assets or /assets/:id
  if (segments[0] === 'assets' || path === '/' || path === '/library') {
    return {
      section: 'assets',
      id: segments[1] || undefined,
      params
    }
  }

  // /generate
  if (segments[0] === 'generate') {
    return { section: 'generate', params }
  }

  // /templates (future)
  if (segments[0] === 'templates') {
    return { section: 'templates', id: segments[1], params }
  }

  // /families (future)
  if (segments[0] === 'families') {
    return { section: 'families', id: segments[1], params }
  }

  // /settings (future)
  if (segments[0] === 'settings') {
    return { section: 'settings', params }
  }

  // Default to assets
  return { section: 'assets', params }
}

function buildURL(section: string, id?: string | null, params?: Record<string, string>): string {
  let path = `/${section}`
  if (id) path += `/${id}`

  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) searchParams.set(k, v)
    })
  }

  return searchParams.toString() ? `${path}?${searchParams}` : path
}

function updateURL(section: string, id?: string | null, params?: Record<string, string>) {
  const url = buildURL(section, id, params)
  if (window.location.pathname + window.location.search !== url) {
    window.history.pushState({}, '', url)
  }
}

export function App() {
  const initialRoute = parseRoute()
  const [section, setSection] = useState<Route['section']>(initialRoute.section)
  const [assets, setAssets] = useState<Asset[]>([])
  const [generations, setGenerations] = useState<Generation[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(initialRoute.params.get('category') || '')
  const [searchQuery, setSearchQuery] = useState(initialRoute.params.get('search') || '')
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(initialRoute.id || null)
  const [isLoading, setIsLoading] = useState(true)

  // Sync URL when state changes
  useEffect(() => {
    const params: Record<string, string> = {}
    if (section === 'assets' && !selectedAssetId) {
      if (selectedCategory) params.category = selectedCategory
      if (searchQuery) params.search = searchQuery
    }
    updateURL(section, selectedAssetId, params)
  }, [section, selectedAssetId, selectedCategory, searchQuery])

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRoute()
      setSection(route.section)
      setSelectedAssetId(route.id || null)
      setSelectedCategory(route.params.get('category') || '')
      setSearchQuery(route.params.get('search') || '')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const fetchAssets = useCallback(async () => {
    try {
      const data = await api.assets.list(selectedCategory || undefined, searchQuery || undefined)
      setAssets(data)
    } catch (err) {
      console.error('Failed to fetch assets:', err)
    }
  }, [selectedCategory, searchQuery])

  const fetchGenerations = useCallback(async () => {
    try {
      const data = await api.generations.list()
      setGenerations(data)
    } catch (err) {
      console.error('Failed to fetch generations:', err)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchAssets(), fetchGenerations()])
      setIsLoading(false)
    }
    loadData()

    // Poll for generation updates
    const interval = setInterval(() => {
      fetchGenerations()
    }, 2000)

    return () => clearInterval(interval)
  }, [fetchAssets, fetchGenerations])

  const handleGenerate = async (request: {
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
  }) => {
    try {
      await api.generations.create(request)
      fetchGenerations()
      setSection('generate')
    } catch (err) {
      console.error('Failed to create generation:', err)
    }
  }

  const handleAccept = async (id: string, name: string, category: string, tags: string) => {
    try {
      await api.generations.accept(id, name, category, tags)
      await Promise.all([fetchAssets(), fetchGenerations()])
    } catch (err) {
      console.error('Failed to accept generation:', err)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await api.generations.reject(id)
      fetchGenerations()
    } catch (err) {
      console.error('Failed to reject generation:', err)
    }
  }

  const handleDeleteAsset = async (id: string) => {
    try {
      await api.assets.delete(id)
      setSelectedAssetId(null)
      fetchAssets()
    } catch (err) {
      console.error('Failed to delete asset:', err)
    }
  }

  const handleSelectAsset = (assetId: string | null) => {
    setSelectedAssetId(assetId)
  }

  const handleSectionChange = (newSection: Route['section']) => {
    setSection(newSection)
    setSelectedAssetId(null)
  }

  const categories = ['terrain', 'building', 'vehicle', 'prop', 'character', 'reference']

  // Get assets that can be used as references (reference category + any other assets)
  const referenceAssets = assets.filter(a => a.category === 'reference' || a.tags?.includes('reference'))

  const pendingCount = generations.filter(
    (g) => g.status === 'pending' || g.status === 'running'
  ).length
  // Only count completed items that need review (not auto-approved with assetId)
  const completedCount = generations.filter((g) => g.status === 'completed' && !g.assetId).length

  return (
    <div class="min-h-screen">
      <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold">Bitborough Game Manager</h1>
          <nav class="flex gap-2">
            <button
              onClick={() => handleSectionChange('assets')}
              class={`px-4 py-2 rounded ${
                section === 'assets'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Asset Library
              {assets.length > 0 && (
                <span class="ml-2 text-xs bg-gray-600 px-1.5 py-0.5 rounded">
                  {assets.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleSectionChange('generate')}
              class={`px-4 py-2 rounded ${
                section === 'generate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Generate
              {(pendingCount > 0 || completedCount > 0) && (
                <span class="ml-2">
                  {pendingCount > 0 && (
                    <span class="text-xs bg-yellow-600 px-1.5 py-0.5 rounded mr-1">
                      {pendingCount}
                    </span>
                  )}
                  {completedCount > 0 && (
                    <span class="text-xs bg-green-600 px-1.5 py-0.5 rounded">
                      {completedCount}
                    </span>
                  )}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main class="p-6">
        {isLoading ? (
          <div class="flex justify-center py-12">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {section === 'assets' && (
              <div>
                <div class="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                    class="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory((e.target as HTMLSelectElement).value)}
                    class="px-4 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <AssetGrid
                  assets={assets}
                  onDelete={handleDeleteAsset}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={handleSelectAsset}
                />
              </div>
            )}

            {section === 'generate' && (
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GenerateForm onGenerate={handleGenerate} referenceAssets={referenceAssets} />
                <GenerationQueue
                  generations={generations}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
