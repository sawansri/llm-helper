import { HardwareSpecs, LLMModel, ModelVariant } from '@/lib/types'

export interface VariantRecommendation {
  variant: ModelVariant
  score: number
  fitReason: string
  warnings?: string[]
}

export interface RecommendedModel {
  model: LLMModel
  variants: VariantRecommendation[]
  defaultVariant: ModelVariant
  score: number // Score of the default/best variant
  fitReason: string
  warnings?: string[]
}

export interface RecommendationFilters {
  useCases?: string[]
  maxVRAM?: number
  maxRAM?: number
  minContextWindow?: number
}

export function recommendModels(
  hardware: HardwareSpecs,
  models: LLMModel[],
  filters?: RecommendationFilters
): RecommendedModel[] {
  const recommendations: RecommendedModel[] = []

  for (const model of models) {
    const compatibleVariants: VariantRecommendation[] = []

    for (const variant of model.variants) {
      // Filter by hardware constraints
      if (hardware.gpu && variant.vramRequired > hardware.gpu.vram) {
        continue // Skip if not enough VRAM
      }

      if (variant.ramRequired > hardware.ram) {
        continue // Skip if not enough RAM
      }

      // Apply additional filters
      if (filters?.maxVRAM && variant.vramRequired > filters.maxVRAM) {
        continue
      }

      if (filters?.maxRAM && variant.ramRequired > filters.maxRAM) {
        continue
      }

      if (filters?.minContextWindow && variant.contextWindow < filters.minContextWindow) {
        continue
      }

      if (filters?.useCases && filters.useCases.length > 0) {
        const hasMatchingUseCase = filters.useCases.some(uc =>
          model.useCases.includes(uc)
        )
        if (!hasMatchingUseCase) {
          continue
        }
      }

      // Calculate fit score for this variant
      const score = calculateFitScore(hardware, variant)
      const fitReason = getFitReason(hardware, variant)
      const warnings = getWarnings(hardware, variant)

      compatibleVariants.push({
        variant,
        score,
        fitReason,
        warnings: warnings.length > 0 ? warnings : undefined
      })
    }

    // Only add recommendation if at least one variant is compatible
    if (compatibleVariants.length > 0) {
      // Sort variants by score to find the best one
      compatibleVariants.sort((a, b) => b.score - a.score)
      const bestVariant = compatibleVariants[0]

      recommendations.push({
        model,
        variants: compatibleVariants,
        defaultVariant: bestVariant.variant,
        score: bestVariant.score,
        fitReason: bestVariant.fitReason,
        warnings: bestVariant.warnings
      })
    }
  }

  // Sort by score (descending)
  return recommendations.sort((a, b) => b.score - a.score)
}

function calculateFitScore(hardware: HardwareSpecs, variant: ModelVariant): number {
  let score = 100

  // Penalize if using close to max VRAM (might be slow)
  if (hardware.gpu) {
    const vramUtilization = variant.vramRequired / hardware.gpu.vram
    if (vramUtilization > 0.9) {
      score -= 20
    } else if (vramUtilization > 0.7) {
      score -= 10
    }
  }

  // Penalize if using close to max RAM
  const ramUtilization = variant.ramRequired / hardware.ram
  if (ramUtilization > 0.8) {
    score -= 15
  } else if (ramUtilization > 0.6) {
    score -= 5
  }

  // Bonus for efficient quantization
  if (variant.quantization.includes('Q4')) {
    score += 10
  } else if (variant.quantization.includes('Q5')) {
    score += 5
  }

  return Math.max(0, score)
}

function getFitReason(hardware: HardwareSpecs, variant: ModelVariant): string {
  if (!hardware.gpu) {
    return 'Compatible with your system RAM'
  }

  const vramUtilization = variant.vramRequired / hardware.gpu.vram

  if (vramUtilization <= 0.5) {
    return 'Excellent fit - plenty of headroom'
  } else if (vramUtilization <= 0.7) {
    return 'Good fit for your hardware'
  } else if (vramUtilization <= 0.9) {
    return 'Will work, but uses most of your VRAM'
  } else {
    return 'Tight fit - may be slower'
  }
}

function getWarnings(hardware: HardwareSpecs, variant: ModelVariant): string[] {
  const warnings: string[] = []

  if (hardware.gpu) {
    const vramUtilization = variant.vramRequired / hardware.gpu.vram
    if (vramUtilization > 0.9) {
      warnings.push('High VRAM usage - performance may be impacted')
    }
  }

  const ramUtilization = variant.ramRequired / hardware.ram
  if (ramUtilization > 0.8) {
    warnings.push('High RAM usage - close other applications')
  }

  if (hardware.cpu && hardware.cpu.cores < 4) {
    warnings.push('Low CPU core count may limit inference speed')
  }

  return warnings
}

export function filterByUseCase(models: LLMModel[], useCase: string): LLMModel[] {
  return models.filter(model => model.useCases.includes(useCase))
}

export function sortModels(
  recommendations: RecommendedModel[],
  sortBy: 'score' | 'vram' | 'size' | 'context'
): RecommendedModel[] {
  const sorted = [...recommendations]

  switch (sortBy) {
    case 'score':
      return sorted.sort((a, b) => b.score - a.score)
    case 'vram':
      return sorted.sort((a, b) => a.defaultVariant.vramRequired - b.defaultVariant.vramRequired)
    case 'size':
      return sorted.sort((a, b) => a.defaultVariant.fileSize - b.defaultVariant.fileSize)
    case 'context':
      return sorted.sort((a, b) => b.defaultVariant.contextWindow - a.defaultVariant.contextWindow)
    default:
      return sorted
  }
}
