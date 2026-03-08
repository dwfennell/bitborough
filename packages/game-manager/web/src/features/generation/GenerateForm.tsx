import { useState } from 'preact/hooks'
import type { Asset } from '../../types'

interface Props {
  onGenerate: (request: GenerateRequest) => void
  referenceAssets: Asset[]
}

interface GenerateRequest {
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
}

const STYLES = [
  { value: '', label: 'Default' },
  { value: 'pixel-art', label: 'Pixel Art' },
  { value: 'flat', label: 'Flat / Vector' },
  { value: 'painterly', label: 'Painterly' },
  { value: 'realistic', label: 'Realistic' },
]

const SIZES = [
  { width: 64, height: 64, label: '64x64' },
  { width: 128, height: 128, label: '128x128' },
  { width: 256, height: 256, label: '256x256' },
  { width: 512, height: 512, label: '512x512' },
]

export function GenerateForm({ onGenerate, referenceAssets }: Props) {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [style, setStyle] = useState('')
  const [sizeIndex, setSizeIndex] = useState(1) // Default to 128x128
  const [steps, setSteps] = useState(20)
  const [guidance, setGuidance] = useState(7.5)
  const [seed, setSeed] = useState<number | ''>('')
  const [referenceImage, setReferenceImage] = useState('')
  const [strength, setStrength] = useState(0.7)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedReference = referenceAssets.find(a => a.filename === referenceImage)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    if (!prompt.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const size = SIZES[sizeIndex]
      await onGenerate({
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        width: size.width,
        height: size.height,
        style: style || undefined,
        steps,
        guidance,
        seed: seed || undefined,
        referenceImage: referenceImage || undefined,
        strength: referenceImage ? strength : undefined,
      })
      // Clear prompt on success, keep settings
      setPrompt('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 2147483647))
  }

  return (
    <form onSubmit={handleSubmit} class="bg-gray-800 rounded-lg p-6">
      <h2 class="text-lg font-bold mb-4">Generate Asset</h2>

      <div class="space-y-4">
        {/* Reference Image Selection */}
        <div>
          <label class="block text-sm text-gray-400 mb-1">
            Reference Image (img2img)
          </label>
          <select
            value={referenceImage}
            onChange={(e) => setReferenceImage((e.target as HTMLSelectElement).value)}
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="">None (generate from scratch)</option>
            {referenceAssets.map((asset) => (
              <option key={asset.id} value={asset.filename}>
                {asset.name}
              </option>
            ))}
          </select>
          {selectedReference && (
            <div class="mt-2 flex items-start gap-3">
              <img
                src={`/files/${selectedReference.filename}`}
                alt={selectedReference.name}
                class="w-20 h-20 object-cover rounded border border-gray-600"
              />
              <div class="flex-1">
                <label class="block text-sm text-gray-400 mb-1">
                  Strength: {strength.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={strength}
                  onInput={(e) =>
                    setStrength(parseFloat((e.target as HTMLInputElement).value))
                  }
                  class="w-full"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Higher = more influence from reference
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Prompt</label>
          <textarea
            value={prompt}
            onInput={(e) => setPrompt((e.target as HTMLTextAreaElement).value)}
            placeholder="A top-down view of a grass tile, pixel art style, seamless texture..."
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded resize-none h-24 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">
            Negative Prompt (optional)
          </label>
          <textarea
            value={negativePrompt}
            onInput={(e) =>
              setNegativePrompt((e.target as HTMLTextAreaElement).value)
            }
            placeholder="blurry, low quality, text, watermark..."
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded resize-none h-16 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle((e.target as HTMLSelectElement).value)}
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            >
              {STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Size</label>
            <select
              value={sizeIndex}
              onChange={(e) =>
                setSizeIndex(parseInt((e.target as HTMLSelectElement).value))
              }
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            >
              {SIZES.map((s, i) => (
                <option key={i} value={i}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          class="text-sm text-blue-400 hover:text-blue-300"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {showAdvanced && (
          <div class="space-y-4 pt-2 border-t border-gray-700">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-400 mb-1">
                  Steps: {steps}
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={steps}
                  onInput={(e) =>
                    setSteps(parseInt((e.target as HTMLInputElement).value))
                  }
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">
                  Guidance: {guidance.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={guidance}
                  onInput={(e) =>
                    setGuidance(parseFloat((e.target as HTMLInputElement).value))
                  }
                  class="w-full"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">
                Seed (optional)
              </label>
              <div class="flex gap-2">
                <input
                  type="number"
                  value={seed}
                  onInput={(e) => {
                    const val = (e.target as HTMLInputElement).value
                    setSeed(val ? parseInt(val) : '')
                  }}
                  placeholder="Random"
                  class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleRandomSeed}
                  class="px-3 py-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600"
                  title="Generate random seed"
                >
                  Dice
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!prompt.trim() || isSubmitting}
          class="w-full py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </form>
  )
}
