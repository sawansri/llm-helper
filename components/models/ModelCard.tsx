'use client'

import { useState } from 'react'
import { RecommendedModel, VariantRecommendation } from '@/utils/recommendationEngine'

export default function ModelCard({ recommendation }: { recommendation: RecommendedModel }) {
  const { model, variants, defaultVariant } = recommendation

  // Find the default variant recommendation
  const defaultVariantRec = variants.find(v => v.variant === defaultVariant) || variants[0]
  const [selectedVariant, setSelectedVariant] = useState<VariantRecommendation>(defaultVariantRec)

  const { variant, score, fitReason, warnings } = selectedVariant

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-blue-400 transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold">{model.name}</h3>
          <p className="text-gray-600 text-sm">{model.provider} • {model.parameters} parameters</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          Score: {score}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4">{model.description}</p>

      {/* Fit Reason */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <p className="text-green-800 font-semibold text-sm">✓ {fitReason}</p>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          {warnings.map((warning, idx) => (
            <p key={idx} className="text-yellow-800 text-sm">⚠ {warning}</p>
          ))}
        </div>
      )}

      {/* Quantization Selector */}
      {variants.length > 1 && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">Quantization:</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variantRec) => (
              <button
                key={variantRec.variant.quantization}
                onClick={() => setSelectedVariant(variantRec)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
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
      )}

      {/* Variant Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        {variants.length === 1 && (
          <div>
            <span className="font-semibold">Quantization:</span> {variant.quantization}
          </div>
        )}
        <div>
          <span className="font-semibold">VRAM:</span> {variant.vramRequired} GB
        </div>
        <div>
          <span className="font-semibold">RAM:</span> {variant.ramRequired} GB
        </div>
        <div>
          <span className="font-semibold">File Size:</span> {variant.fileSize} GB
        </div>
        <div>
          <span className="font-semibold">Context:</span> {variant.contextWindow.toLocaleString()} tokens
        </div>
      </div>

      {/* Use Cases */}
      <div className="mb-4">
        <p className="text-sm font-semibold mb-2">Use Cases:</p>
        <div className="flex flex-wrap gap-2">
          {model.useCases.map(useCase => (
            <span
              key={useCase}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
            >
              {useCase}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-3">
        {model.links.huggingFace && (
          <a
            href={model.links.huggingFace}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            HuggingFace →
          </a>
        )}
        {model.links.ollama && (
          <span className="bg-gray-800 text-white px-3 py-1 rounded text-xs font-mono">
            {model.links.ollama}
          </span>
        )}
      </div>
    </div>
  )
}
