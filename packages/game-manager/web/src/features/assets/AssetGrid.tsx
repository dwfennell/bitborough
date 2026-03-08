import { useState } from 'preact/hooks'
import type { Asset } from '../../types'

interface Props {
  assets: Asset[]
  onDelete: (id: string) => void
  selectedAssetId?: string | null
  onSelectAsset?: (id: string | null) => void
}

export function AssetGrid({ assets, onDelete, selectedAssetId, onSelectAsset }: Props) {
  const selectedAsset = selectedAssetId ? assets.find(a => a.id === selectedAssetId) : null

  const handleSelect = (asset: Asset) => {
    if (onSelectAsset) {
      onSelectAsset(asset.id)
    }
  }

  const handleClose = () => {
    if (onSelectAsset) {
      onSelectAsset(null)
    }
  }

  if (assets.length === 0) {
    return (
      <div class="text-center py-12 text-gray-400">
        <p class="text-lg">No assets found</p>
        <p class="text-sm mt-2">Generate some tiles to get started</p>
      </div>
    )
  }

  return (
    <>
      <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
        {assets.map((asset) => (
          <div
            key={asset.id}
            class={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all ${
              selectedAssetId === asset.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleSelect(asset)}
          >
            <div class="aspect-square bg-gray-700">
              <img
                src={`/files/${asset.filename}`}
                alt={asset.name}
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="p-2">
              <p class="text-sm font-medium truncate">{asset.name}</p>
              <p class="text-xs text-gray-400">{asset.category}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedAsset && (
        <AssetModal
          asset={selectedAsset}
          onClose={handleClose}
          onDelete={() => {
            onDelete(selectedAsset.id)
          }}
        />
      )}
    </>
  )
}

interface ModalProps {
  asset: Asset
  onClose: () => void
  onDelete: () => void
}

function AssetModal({ asset, onClose, onDelete }: ModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div
      class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="aspect-square bg-gray-700">
          <img
            src={`/files/${asset.filename}`}
            alt={asset.name}
            class="w-full h-full object-contain"
          />
        </div>
        <div class="p-4">
          <h2 class="text-xl font-bold mb-2">{asset.name}</h2>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-400">Category:</span>{' '}
              <span class="capitalize">{asset.category}</span>
            </div>
            {asset.width && asset.height && (
              <div>
                <span class="text-gray-400">Size:</span>{' '}
                {asset.width}x{asset.height}
              </div>
            )}
            {asset.tags && asset.tags.length > 0 && (
              <div class="col-span-2">
                <span class="text-gray-400">Tags:</span>{' '}
                <span class="flex flex-wrap gap-1 mt-1">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      class="px-2 py-0.5 bg-gray-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </div>
            )}
            {asset.prompt && (
              <div class="col-span-2 mt-2">
                <span class="text-gray-400 block mb-1">Prompt:</span>
                <p class="text-xs bg-gray-700 p-2 rounded whitespace-pre-wrap">
                  {asset.prompt}
                </p>
              </div>
            )}
            {asset.seed && (
              <div>
                <span class="text-gray-400">Seed:</span> {asset.seed}
              </div>
            )}
            {asset.steps && (
              <div>
                <span class="text-gray-400">Steps:</span> {asset.steps}
              </div>
            )}
            {asset.guidance && (
              <div>
                <span class="text-gray-400">Guidance:</span> {asset.guidance}
              </div>
            )}
          </div>
          <div class="flex justify-between mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              class="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
            >
              Copy Link
            </button>
            <div class="flex gap-2">
              {!showDeleteConfirm ? (
                <>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    class="px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
                  >
                    Delete
                  </button>
                  <button
                    onClick={onClose}
                    class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <span class="text-sm text-gray-400 self-center">
                    Are you sure?
                  </span>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDelete}
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Confirm Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
