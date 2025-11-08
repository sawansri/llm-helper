'use client'

import { useState } from 'react'
import { RecommendedModel, VariantRecommendation } from '@/utils/recommendationEngine'
import { FitnessCategory } from '@/lib/types'

export default function ModelCard({ recommendation }: { recommendation: RecommendedModel }) {
  const { model, variants, defaultVariant } = recommendation

  // Find the default variant recommendation
  const defaultVariantRec = variants.find(v => v.variant === defaultVariant) || variants[0]
  const [selectedVariant, setSelectedVariant] = useState<VariantRecommendation>(defaultVariantRec)

  const { variant, assessment } = selectedVariant
  const { category, score, reasons, warnings, recommendations: suggestions } = assessment

  // Helper function to get category badge styling
  const getCategoryBadge = (category: FitnessCategory) => {
    const styles = {
      excellent: 'bg-green-100 text-green-800 border-green-300',
      good: 'bg-blue-100 text-blue-800 border-blue-300',
      fair: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      poor: 'bg-orange-100 text-orange-800 border-orange-300',
      incompatible: 'bg-red-100 text-red-800 border-red-300'
    }
    return styles[category] || styles.good
  }

  // Helper function to get reason icon
  const getReasonIcon = (rating: 'positive' | 'neutral' | 'negative') => {
    if (rating === 'positive') return '✓'
    if (rating === 'negative') return '✗'
    return '•'
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:border-blue-400 transition p-3">
      {/* Header with Category Badge */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base font-bold">{model.name}</h3>
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getCategoryBadge(category)}`}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
        <span className="text-gray-400 text-xs">({score})</span>
        <span className="text-gray-500 text-xs ml-auto">{model.provider} • {model.parameters}</span>
      </div>

      {/* Explainable Reasons */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-600 mb-1">Why this fits:</p>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {reasons.map((reason, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                reason.rating === 'positive'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : reason.rating === 'negative'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
              title={reason.explanation}
            >
              <span>{getReasonIcon(reason.rating)}</span>
              <span className="font-medium">{reason.factor}:</span>
              <span>{reason.explanation.split(' - ')[1] || reason.explanation}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Warnings & Suggestions */}
      {(warnings.length > 0 || suggestions.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-2 text-xs">
          {warnings.map((warning, idx) => (
            <span key={idx} className="inline-flex items-center bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200">
              ⚠ {warning}
            </span>
          ))}
          {suggestions.map((suggestion, idx) => (
            <span key={idx} className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              💡 {suggestion}
            </span>
          ))}
        </div>
      )}

      {/* Combined Row: Quantization + Specs */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2 text-xs pb-2 border-b border-gray-100">
        {/* Quantization Selector */}
        {variants.length > 1 ? (
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 font-semibold">Quantization:</span>
            <div className="flex gap-1">
              {variants.map((variantRec) => (
                <button
                  key={variantRec.variant.quantization}
                  onClick={() => setSelectedVariant(variantRec)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
                    selectedVariant.variant.quantization === variantRec.variant.quantization
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {variantRec.variant.quantization}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-gray-600">
            <span className="font-semibold">Quantization:</span> {variant.quantization}
          </div>
        )}

        {/* Specs inline */}
        <div className="text-gray-600">
          <span className="text-gray-500">VRAM:</span>
          <span className="ml-1 font-semibold text-gray-900">{variant.vramRequired}GB</span>
        </div>
        <div className="text-gray-600">
          <span className="text-gray-500">RAM:</span>
          <span className="ml-1 font-semibold text-gray-900">{variant.ramRequired}GB</span>
        </div>
        <div className="text-gray-600">
          <span className="text-gray-500">Size:</span>
          <span className="ml-1 font-semibold text-gray-900">{variant.fileSize}GB</span>
        </div>
        <div className="text-gray-600">
          <span className="text-gray-500">Context:</span>
          <span className="ml-1 font-semibold text-gray-900">{(variant.contextWindow / 1000).toFixed(0)}K</span>
        </div>
      </div>

      {/* Bottom Row: Use Cases and Links */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {model.useCases.slice(0, 4).map(useCase => (
            <span
              key={useCase}
              className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
            >
              {useCase}
            </span>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          {model.links.huggingFace && (
            <a
              href={model.links.huggingFace}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
            >
              HF →
            </a>
          )}
          {model.links.ollama && (
            <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-xs font-mono">
              {model.links.ollama}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
