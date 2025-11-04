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
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:border-blue-400 transition p-3">
      {/* Header with Score */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base font-bold">{model.name}</h3>
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
          {score}
        </span>
        <span className="text-gray-500 text-xs ml-auto">{model.provider} • {model.parameters}</span>
      </div>

      {/* Status Bar - Fit Reason & Warnings */}
      <div className="flex flex-wrap gap-1.5 mb-2 text-xs">
        <span className="inline-flex items-center bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
          ✓ {fitReason}
        </span>
        {warnings && warnings.map((warning, idx) => (
          <span key={idx} className="inline-flex items-center bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200">
            ⚠ {warning}
          </span>
        ))}
      </div>

      {/* Combined Row: Quantization + Specs */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2 text-xs pb-2 border-b border-gray-100">
        {/* Quantization Selector */}
        {variants.length > 1 ? (
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 font-semibold">Quant:</span>
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
            <span className="font-semibold">Quant:</span> {variant.quantization}
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
