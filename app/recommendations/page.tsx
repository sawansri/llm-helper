'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadHardwareSpecs } from '@/utils/localStorage'
import { recommendModels, RecommendedModel, sortModels } from '@/utils/recommendationEngine'
import { LLMModel, HardwareSpecs } from '@/lib/types'
import ModelCard from '@/components/models/ModelCard'

export default function RecommendationsPage() {
  const router = useRouter()
  const [hardware, setHardware] = useState<HardwareSpecs | null>(null)
  const [models, setModels] = useState<LLMModel[]>([])
  const [recommendations, setRecommendations] = useState<RecommendedModel[]>([])
  const [sortBy, setSortBy] = useState<'score' | 'vram' | 'size' | 'context'>('score')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load hardware specs
    const specs = loadHardwareSpecs()
    if (!specs) {
      router.push('/hardware')
      return
    }
    setHardware(specs)

    // Load models
    fetch('/data/models.json')
      .then(res => res.json())
      .then(data => {
        setModels(data)
        const recs = recommendModels(specs, data)
        setRecommendations(recs)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load models:', error)
        setLoading(false)
      })
  }, [router])

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort)
    setRecommendations(sortModels(recommendations, newSort))
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p>Loading recommendations...</p>
      </main>
    )
  }

  if (!hardware) {
    return null
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Recommended Models</h1>
      <p className="text-gray-600 mb-8">
        Based on your hardware: {hardware.gpu?.model || 'CPU only'} • {hardware.ram}GB RAM
      </p>

      {/* Sort Controls */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => handleSortChange('score')}
          className={`px-4 py-2 rounded ${sortBy === 'score' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Best Fit
        </button>
        <button
          onClick={() => handleSortChange('vram')}
          className={`px-4 py-2 rounded ${sortBy === 'vram' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          VRAM
        </button>
        <button
          onClick={() => handleSortChange('size')}
          className={`px-4 py-2 rounded ${sortBy === 'size' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          File Size
        </button>
        <button
          onClick={() => handleSortChange('context')}
          className={`px-4 py-2 rounded ${sortBy === 'context' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Context Window
        </button>
      </div>

      {/* Results */}
      {recommendations.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            No models found that fit your hardware specifications. Consider upgrading your hardware or trying different filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <ModelCard key={rec.model.id} recommendation={rec} />
          ))}
        </div>
      )}
    </main>
  )
}
