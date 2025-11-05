import {
  HardwareSpecs,
  LLMModel,
  ModelVariant,
  FitnessCategory,
  FitnessAssessment,
  ExplainableReason,
  UserPreferences
} from '@/lib/types'

export interface VariantRecommendation {
  variant: ModelVariant
  assessment: FitnessAssessment
}

export interface RecommendedModel {
  model: LLMModel
  variants: VariantRecommendation[]
  defaultVariant: ModelVariant
  assessment: FitnessAssessment
}

export interface RecommendationFilters {
  useCases?: string[]
  maxVRAM?: number
  maxRAM?: number
  minContextWindow?: number
}

// Main recommendation function with multi-factor evaluation
export function recommendModels(
  hardware: HardwareSpecs,
  models: LLMModel[],
  filters?: RecommendationFilters
): RecommendedModel[] {
  const recommendations: RecommendedModel[] = []
  const preferences = hardware.preferences || { priority: 'balanced', acceptableQuality: 'any' }

  for (const model of models) {
    const compatibleVariants: VariantRecommendation[] = []

    for (const variant of model.variants) {
      // Hard filters - skip incompatible variants
      if (hardware.gpu && variant.vramRequired > hardware.gpu.vram) {
        continue
      }

      if (variant.ramRequired > hardware.ram) {
        continue
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

      // Multi-factor evaluation
      const assessment = evaluateModel(model, variant, hardware, preferences)

      compatibleVariants.push({
        variant,
        assessment
      })
    }

    // Only add recommendation if at least one variant is compatible
    if (compatibleVariants.length > 0) {
      // Sort variants by score to find the best one
      compatibleVariants.sort((a, b) => b.assessment.score - a.assessment.score)
      const bestVariant = compatibleVariants[0]

      recommendations.push({
        model,
        variants: compatibleVariants,
        defaultVariant: bestVariant.variant,
        assessment: bestVariant.assessment
      })
    }
  }

  // Sort by score (descending)
  return recommendations.sort((a, b) => b.assessment.score - a.assessment.score)
}

// Multi-factor evaluation with explainable reasons
function evaluateModel(
  model: LLMModel,
  variant: ModelVariant,
  hardware: HardwareSpecs,
  preferences: UserPreferences
): FitnessAssessment {
  const reasons: ExplainableReason[] = []
  let baseScore = 100

  // Factor 1: Hardware Compatibility (40% weight)
  const vramEval = evaluateVRAM(hardware, variant)
  reasons.push(vramEval.reason)
  baseScore += vramEval.scoreImpact

  const ramEval = evaluateRAM(hardware, variant)
  reasons.push(ramEval.reason)
  baseScore += ramEval.scoreImpact

  // Factor 2: Model Quality (30% weight)
  if (model.qualityMetrics) {
    const qualityEval = evaluateQuality(model, preferences)
    reasons.push(qualityEval.reason)
    baseScore += qualityEval.scoreImpact
  }

  // Factor 3: Context Window Match (15% weight)
  const useCase = preferences.selectedUseCases?.[0] || model.useCases[0]
  const contextEval = evaluateContext(model, variant, useCase)
  reasons.push(contextEval.reason)
  baseScore += contextEval.scoreImpact

  // Factor 4: Performance Profile Match (15% weight)
  if (model.performanceProfile) {
    const perfEval = evaluatePerformanceProfile(model, preferences)
    reasons.push(perfEval.reason)
    baseScore += perfEval.scoreImpact
  }

  // Quantization bonus (small factor)
  if (variant.quantization.includes('Q4')) {
    baseScore += 5
  } else if (variant.quantization.includes('Q5')) {
    baseScore += 3
  }

  // Clamp score to valid range
  baseScore = Math.max(0, Math.min(100, baseScore))

  // Convert to category
  const category = scoreToCategory(baseScore)

  // Generate warnings
  const warnings = getWarnings(hardware, variant)

  // Generate recommendations
  const recommendations = generateRecommendations(category, reasons, variant)

  return {
    category,
    score: baseScore,
    reasons,
    warnings,
    recommendations
  }
}

// Evaluate VRAM utilization
function evaluateVRAM(hardware: HardwareSpecs, variant: ModelVariant): {
  reason: ExplainableReason
  scoreImpact: number
} {
  if (!hardware.gpu) {
    return {
      reason: {
        factor: 'VRAM',
        rating: 'neutral',
        impact: 'high',
        explanation: 'No GPU detected - using CPU/RAM'
      },
      scoreImpact: -20 // Penalty for no GPU
    }
  }

  const utilization = variant.vramRequired / hardware.gpu.vram
  const percentUsed = Math.round(utilization * 100)

  if (utilization <= 0.5) {
    return {
      reason: {
        factor: 'VRAM',
        rating: 'positive',
        impact: 'high',
        explanation: `Uses ${percentUsed}% of VRAM - excellent headroom`
      },
      scoreImpact: 0 // No penalty
    }
  } else if (utilization <= 0.7) {
    return {
      reason: {
        factor: 'VRAM',
        rating: 'positive',
        impact: 'high',
        explanation: `Uses ${percentUsed}% of VRAM - good fit`
      },
      scoreImpact: -5
    }
  } else if (utilization <= 0.9) {
    return {
      reason: {
        factor: 'VRAM',
        rating: 'neutral',
        impact: 'high',
        explanation: `Uses ${percentUsed}% of VRAM - tight but workable`
      },
      scoreImpact: -15
    }
  } else {
    return {
      reason: {
        factor: 'VRAM',
        rating: 'negative',
        impact: 'high',
        explanation: `Uses ${percentUsed}% of VRAM - may be slow`
      },
      scoreImpact: -30
    }
  }
}

// Evaluate RAM utilization
function evaluateRAM(hardware: HardwareSpecs, variant: ModelVariant): {
  reason: ExplainableReason
  scoreImpact: number
} {
  const utilization = variant.ramRequired / hardware.ram
  const percentUsed = Math.round(utilization * 100)

  if (utilization <= 0.5) {
    return {
      reason: {
        factor: 'RAM',
        rating: 'positive',
        impact: 'medium',
        explanation: `Uses ${percentUsed}% of RAM - plenty available`
      },
      scoreImpact: 0
    }
  } else if (utilization <= 0.7) {
    return {
      reason: {
        factor: 'RAM',
        rating: 'positive',
        impact: 'medium',
        explanation: `Uses ${percentUsed}% of RAM - good`
      },
      scoreImpact: -3
    }
  } else if (utilization <= 0.85) {
    return {
      reason: {
        factor: 'RAM',
        rating: 'neutral',
        impact: 'medium',
        explanation: `Uses ${percentUsed}% of RAM - close other apps`
      },
      scoreImpact: -8
    }
  } else {
    return {
      reason: {
        factor: 'RAM',
        rating: 'negative',
        impact: 'medium',
        explanation: `Uses ${percentUsed}% of RAM - may cause swapping`
      },
      scoreImpact: -15
    }
  }
}

// Evaluate model quality
function evaluateQuality(model: LLMModel, preferences: UserPreferences): {
  reason: ExplainableReason
  scoreImpact: number
} {
  const rating = model.qualityMetrics!.overallRating

  // Check if quality meets user preference
  if (preferences.acceptableQuality === 'high' && rating < 4.0) {
    return {
      reason: {
        factor: 'Quality',
        rating: 'negative',
        impact: 'high',
        explanation: `${rating}/5 rating - below your quality preference`
      },
      scoreImpact: -20
    }
  }

  if (rating >= 4.5) {
    return {
      reason: {
        factor: 'Quality',
        rating: 'positive',
        impact: 'high',
        explanation: `${rating}/5 rating - excellent model quality`
      },
      scoreImpact: 15
    }
  } else if (rating >= 4.0) {
    return {
      reason: {
        factor: 'Quality',
        rating: 'positive',
        impact: 'high',
        explanation: `${rating}/5 rating - high quality`
      },
      scoreImpact: 10
    }
  } else if (rating >= 3.5) {
    return {
      reason: {
        factor: 'Quality',
        rating: 'neutral',
        impact: 'medium',
        explanation: `${rating}/5 rating - good quality`
      },
      scoreImpact: 5
    }
  } else {
    return {
      reason: {
        factor: 'Quality',
        rating: 'neutral',
        impact: 'medium',
        explanation: `${rating}/5 rating - adequate for basic tasks`
      },
      scoreImpact: 0
    }
  }
}

// Evaluate context window match
function evaluateContext(model: LLMModel, variant: ModelVariant, useCase: string): {
  reason: ExplainableReason
  scoreImpact: number
} {
  const recommended = model.recommendedContexts?.[useCase]

  if (!recommended) {
    return {
      reason: {
        factor: 'Context Window',
        rating: 'neutral',
        impact: 'low',
        explanation: `${(variant.contextWindow / 1000).toFixed(0)}K tokens available`
      },
      scoreImpact: 0
    }
  }

  const ratio = variant.contextWindow / recommended

  if (ratio >= 2) {
    return {
      reason: {
        factor: 'Context Window',
        rating: 'positive',
        impact: 'medium',
        explanation: `${(variant.contextWindow / 1000).toFixed(0)}K tokens - excellent for ${useCase}`
      },
      scoreImpact: 8
    }
  } else if (ratio >= 1) {
    return {
      reason: {
        factor: 'Context Window',
        rating: 'positive',
        impact: 'medium',
        explanation: `${(variant.contextWindow / 1000).toFixed(0)}K tokens - good for ${useCase}`
      },
      scoreImpact: 5
    }
  } else if (ratio >= 0.5) {
    return {
      reason: {
        factor: 'Context Window',
        rating: 'neutral',
        impact: 'medium',
        explanation: `${(variant.contextWindow / 1000).toFixed(0)}K tokens - adequate for ${useCase}`
      },
      scoreImpact: 0
    }
  } else {
    return {
      reason: {
        factor: 'Context Window',
        rating: 'negative',
        impact: 'medium',
        explanation: `${(variant.contextWindow / 1000).toFixed(0)}K tokens - limited for ${useCase}`
      },
      scoreImpact: -5
    }
  }
}

// Evaluate performance profile
function evaluatePerformanceProfile(model: LLMModel, preferences: UserPreferences): {
  reason: ExplainableReason
  scoreImpact: number
} {
  const profile = model.performanceProfile!

  if (preferences.priority === 'speed') {
    if (profile.inferenceSpeed === 'fast') {
      return {
        reason: {
          factor: 'Speed',
          rating: 'positive',
          impact: 'high',
          explanation: 'Fast inference - matches your priority'
        },
        scoreImpact: 10
      }
    } else if (profile.inferenceSpeed === 'medium') {
      return {
        reason: {
          factor: 'Speed',
          rating: 'neutral',
          impact: 'medium',
          explanation: 'Medium speed - acceptable'
        },
        scoreImpact: 0
      }
    } else {
      return {
        reason: {
          factor: 'Speed',
          rating: 'negative',
          impact: 'high',
          explanation: 'Slow inference - not ideal for speed priority'
        },
        scoreImpact: -15
      }
    }
  } else if (preferences.priority === 'quality') {
    if (profile.qualityLevel === 'high') {
      return {
        reason: {
          factor: 'Quality Level',
          rating: 'positive',
          impact: 'high',
          explanation: 'High quality output - matches your priority'
        },
        scoreImpact: 10
      }
    } else {
      return {
        reason: {
          factor: 'Quality Level',
          rating: 'neutral',
          impact: 'medium',
          explanation: 'Medium quality - adequate'
        },
        scoreImpact: 0
      }
    }
  } else {
    // Balanced preference
    return {
      reason: {
        factor: 'Performance',
        rating: 'neutral',
        impact: 'low',
        explanation: `${profile.inferenceSpeed} speed, ${profile.qualityLevel} quality`
      },
      scoreImpact: 0
    }
  }
}

// Convert numeric score to category
function scoreToCategory(score: number): FitnessCategory {
  if (score >= 90) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  if (score >= 30) return 'poor'
  return 'incompatible'
}

// Generate warnings
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

// Generate actionable recommendations
function generateRecommendations(
  category: FitnessCategory,
  reasons: ExplainableReason[],
  variant: ModelVariant
): string[] {
  const recommendations: string[] = []

  if (category === 'poor' || category === 'incompatible') {
    recommendations.push('Consider a smaller model or upgrading your hardware')
  }

  // Check for negative reasons and suggest improvements
  const negativeReasons = reasons.filter(r => r.rating === 'negative')

  if (negativeReasons.some(r => r.factor === 'VRAM')) {
    recommendations.push('Try a more aggressive quantization (Q4 instead of Q8)')
  }

  if (negativeReasons.some(r => r.factor === 'Quality')) {
    recommendations.push('Consider a larger model if hardware permits')
  }

  if (negativeReasons.some(r => r.factor.includes('Speed'))) {
    recommendations.push('For faster inference, choose a smaller model')
  }

  return recommendations
}

// Helper functions for filtering and sorting
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
      return sorted.sort((a, b) => b.assessment.score - a.assessment.score)
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
