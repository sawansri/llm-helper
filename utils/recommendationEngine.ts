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
  const qualityEval = evaluateQuality(model, variant, preferences)
  reasons.push(qualityEval.reason)
  baseScore += qualityEval.scoreImpact

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

  // Clamp score to valid range (allow scores above 100 for better differentiation)
  baseScore = Math.max(0, baseScore)

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

// Evaluate VRAM utilization using formula-based approach
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
      scoreImpact: -20
    }
  }

  const utilization = variant.vramRequired / hardware.gpu.vram
  const percentUsed = Math.round(utilization * 100)

  // Formula-based penalty: exponential increase as utilization grows
  // 0-50%: 0 penalty, 50-70%: 0-5, 70-90%: 5-15, 90%+: 15-30
  let scoreImpact = 0
  if (utilization > 0.5) {
    scoreImpact = -Math.pow((utilization - 0.5) * 2, 1.8) * 30
  }

  const rating = utilization <= 0.7 ? 'positive' : utilization <= 0.9 ? 'neutral' : 'negative'
  const explanation = utilization <= 0.5 ? `Uses ${percentUsed}% of VRAM - excellent headroom` :
                      utilization <= 0.7 ? `Uses ${percentUsed}% of VRAM - good fit` :
                      utilization <= 0.9 ? `Uses ${percentUsed}% of VRAM - tight but workable` :
                                          `Uses ${percentUsed}% of VRAM - may be slow`

  return {
    reason: {
      factor: 'VRAM',
      rating,
      impact: 'high',
      explanation
    },
    scoreImpact: Math.round(scoreImpact)
  }
}

// Evaluate RAM utilization using formula-based approach
function evaluateRAM(hardware: HardwareSpecs, variant: ModelVariant): {
  reason: ExplainableReason
  scoreImpact: number
} {
  const utilization = variant.ramRequired / hardware.ram
  const percentUsed = Math.round(utilization * 100)

  // Formula-based penalty: exponential increase as utilization grows
  // 0-50%: 0 penalty, 50-70%: 0-3, 70-85%: 3-8, 85%+: 8-15
  let scoreImpact = 0
  if (utilization > 0.5) {
    scoreImpact = -Math.pow((utilization - 0.5) * 2, 1.8) * 15
  }

  const rating = utilization <= 0.7 ? 'positive' : utilization <= 0.85 ? 'neutral' : 'negative'
  const explanation = utilization <= 0.5 ? `Uses ${percentUsed}% of RAM - plenty available` :
                      utilization <= 0.7 ? `Uses ${percentUsed}% of RAM - good` :
                      utilization <= 0.85 ? `Uses ${percentUsed}% of RAM - close other apps` :
                                           `Uses ${percentUsed}% of RAM - may cause swapping`

  return {
    reason: {
      factor: 'RAM',
      rating,
      impact: 'medium',
      explanation
    },
    scoreImpact: Math.round(scoreImpact)
  }
}

// Evaluate model quality - prioritizes capability (parameter count) with benchmark bonus
function evaluateQuality(
  model: LLMModel,
  variant: ModelVariant,
  preferences: UserPreferences
): {
  reason: ExplainableReason
  scoreImpact: number
} {
  // Extract parameter count (primary factor for capability)
  const paramMatch = model.parameters.match(/(\d+(?:\.\d+)?)\s*B/i)
  const paramCount = paramMatch ? parseFloat(paramMatch[1]) : 0

  // Base capability score from parameter count (0-25 points)
  // Larger models = higher capability
  let capabilityScore = Math.min(25, paramCount * 1.5)

  // Benchmark bonus for models with verified performance (0-10 points)
  let benchmarkBonus = 0
  let explanation = ''

  if (model.qualityMetrics) {
    const metrics = model.qualityMetrics

    // Composite score from benchmarks
    const mmluNorm = (metrics.mmlu || 0) / 100
    const humanEvalNorm = (metrics.humanEval || 0) / 100
    const mtBenchNorm = (metrics.mt_bench || 0) / 10

    const scores = [mmluNorm, humanEvalNorm, mtBenchNorm].filter(s => s > 0)
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    // Convert to 0-10 point bonus
    benchmarkBonus = avgScore * 10

    explanation = `${model.parameters} - Benchmarks: MMLU ${metrics.mmlu?.toFixed(1)}%, HumanEval ${metrics.humanEval?.toFixed(1)}%, MT-Bench ${metrics.mt_bench?.toFixed(1)}`
  } else {
    // No benchmarks - use capability estimate
    const contextBonus = variant.contextWindow >= 128000 ? 3 :
                         variant.contextWindow >= 32000 ? 2 :
                         variant.contextWindow >= 16000 ? 1 : 0
    benchmarkBonus = contextBonus

    explanation = `${model.parameters} model with ${(variant.contextWindow / 1000).toFixed(0)}K context (capability estimated from size)`
  }

  const totalScore = capabilityScore + benchmarkBonus

  // Check if quality meets user preference
  const estimatedRating = (totalScore / 35) * 5 // Normalize to 0-5 scale
  const meetsPreference = preferences.acceptableQuality !== 'high' || estimatedRating >= 4.0

  const finalScore = meetsPreference ? totalScore : totalScore - 20

  return {
    reason: {
      factor: 'Model Capability',
      rating: totalScore >= 15 ? 'positive' : totalScore >= 8 ? 'neutral' : 'negative',
      impact: 'high',
      explanation
    },
    scoreImpact: finalScore
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
  sortBy: 'score' | 'vram' | 'size' | 'context' | 'efficiency'
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
    case 'efficiency':
      // Sort by performance per VRAM (higher is better)
      return sorted.sort((a, b) => {
        const efficiencyA = calculateEfficiency(a.model, a.defaultVariant)
        const efficiencyB = calculateEfficiency(b.model, b.defaultVariant)
        return efficiencyB - efficiencyA
      })
    default:
      return sorted
  }
}

// Calculate efficiency score: performance per VRAM GB
function calculateEfficiency(model: LLMModel, variant: ModelVariant): number {
  // Extract parameter count
  const paramMatch = model.parameters.match(/(\d+(?:\.\d+)?)\s*B/i)
  const paramCount = paramMatch ? parseFloat(paramMatch[1]) : 1

  // Get benchmark score if available, else estimate from params
  let performanceScore = paramCount

  if (model.qualityMetrics) {
    const metrics = model.qualityMetrics
    const mmluNorm = (metrics.mmlu || 0) / 100
    const humanEvalNorm = (metrics.humanEval || 0) / 100
    const mtBenchNorm = (metrics.mt_bench || 0) / 10

    const scores = [mmluNorm, humanEvalNorm, mtBenchNorm].filter(s => s > 0)
    if (scores.length > 0) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
      // Scale to be comparable with param count
      performanceScore = paramCount * (0.5 + avgScore * 1.5)
    }
  }

  // Efficiency = performance / resource cost
  return performanceScore / variant.vramRequired
}
