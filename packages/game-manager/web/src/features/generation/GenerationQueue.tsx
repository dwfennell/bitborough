import { useState } from 'preact/hooks'
import type { Generation } from '../../types'

interface Props {
  generations: Generation[]
  onAccept: (id: string, name: string, category: string, tags: string) => void
  onReject: (id: string) => void
}

const CATEGORIES = ['terrain', 'building', 'vehicle', 'prop', 'character']

export function GenerationQueue({ generations, onAccept, onReject }: Props) {
  const pending = generations.filter(
    (g) => g.status === 'pending' || g.status === 'running'
  )
  // Only show completed items that haven't been accepted yet (no assetId)
  const completed = generations.filter((g) => g.status === 'completed' && !g.assetId)
  const failed = generations.filter((g) => g.status === 'failed')

  return (
    <div class="bg-gray-800 rounded-lg p-6">
      <h2 class="text-lg font-bold mb-4">Generation Queue</h2>

      {pending.length > 0 && (
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-400 mb-2">
            In Progress ({pending.length})
          </h3>
          <div class="space-y-2">
            {pending.map((gen) => (
              <PendingItem key={gen.id} generation={gen} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-400 mb-2">
            Ready for Review ({completed.length})
          </h3>
          <div class="space-y-3">
            {completed.map((gen) => (
              <CompletedItem
                key={gen.id}
                generation={gen}
                onAccept={onAccept}
                onReject={onReject}
              />
            ))}
          </div>
        </div>
      )}

      {failed.length > 0 && (
        <div>
          <h3 class="text-sm font-medium text-gray-400 mb-2">
            Failed ({failed.length})
          </h3>
          <div class="space-y-2">
            {failed.map((gen) => (
              <FailedItem key={gen.id} generation={gen} onReject={onReject} />
            ))}
          </div>
        </div>
      )}

      {generations.length === 0 && (
        <p class="text-gray-400 text-center py-8">
          No generations yet. Create one using the form.
        </p>
      )}
    </div>
  )
}

function PendingItem({ generation }: { generation: Generation }) {
  return (
    <div class="bg-gray-700 rounded p-3">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
          <div class="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm truncate">{generation.prompt}</p>
          <p class="text-xs text-gray-400 capitalize">{generation.status}</p>
        </div>
      </div>
    </div>
  )
}

function CompletedItem({
  generation,
  onAccept,
  onReject,
}: {
  generation: Generation
  onAccept: (id: string, name: string, category: string, tags: string) => void
  onReject: (id: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [name, setName] = useState(generation.autoName || '')
  const [category, setCategory] = useState(generation.autoCategory || 'terrain')
  const [tags, setTags] = useState(generation.autoTags || '')

  const handleAccept = () => {
    if (!name.trim()) return
    onAccept(generation.id, name.trim(), category, tags.trim())
    setIsExpanded(false)
  }

  return (
    <div class="bg-gray-700 rounded overflow-hidden">
      <div
        class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-600/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div class="w-12 h-12 bg-gray-600 rounded overflow-hidden">
          {generation.outputPath && (
            <img
              src={`/files/${generation.outputPath}`}
              alt=""
              class="w-full h-full object-cover"
            />
          )}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm truncate">{generation.prompt}</p>
          <p class="text-xs text-green-400">Ready for review</p>
        </div>
        <span class="text-gray-400">{isExpanded ? '-' : '+'}</span>
      </div>

      {isExpanded && (
        <div class="p-3 pt-0 border-t border-gray-600">
          {generation.outputPath && (
            <div class="mb-3">
              <img
                src={`/files/${generation.outputPath}`}
                alt=""
                class="w-full max-w-xs mx-auto rounded"
              />
            </div>
          )}
          <div class="space-y-2">
            <input
              type="text"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="Asset name..."
              class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <select
              value={category}
              onChange={(e) =>
                setCategory((e.target as HTMLSelectElement).value)
              }
              class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={tags}
              onInput={(e) => setTags((e.target as HTMLInputElement).value)}
              placeholder="Tags (comma separated)..."
              class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <div class="flex gap-2">
              <button
                onClick={() => onReject(generation.id)}
                class="flex-1 py-2 bg-red-600/20 text-red-400 rounded text-sm hover:bg-red-600/30"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                disabled={!name.trim()}
                class="flex-1 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Accept to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FailedItem({
  generation,
  onReject,
}: {
  generation: Generation
  onReject: (id: string) => void
}) {
  const [showError, setShowError] = useState(false)

  return (
    <div class="bg-gray-700 rounded p-3">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-red-900/30 rounded flex items-center justify-center text-red-400">
          X
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm truncate">{generation.prompt}</p>
          <button
            onClick={() => setShowError(!showError)}
            class="text-xs text-red-400 hover:text-red-300"
          >
            {showError ? 'Hide error' : 'Show error'}
          </button>
        </div>
        <button
          onClick={() => onReject(generation.id)}
          class="px-3 py-1 text-xs bg-gray-600 rounded hover:bg-gray-500"
        >
          Dismiss
        </button>
      </div>
      {showError && generation.error && (
        <div class="mt-2 p-2 bg-red-900/20 rounded text-xs text-red-300 break-all">
          {generation.error}
        </div>
      )}
    </div>
  )
}
