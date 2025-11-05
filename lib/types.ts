export interface HardwareSpecs {
  gpu?: {
    model: string
    vram: number // in GB
    detected: boolean
  }
  ram: number // in GB
  cpu?: {
    cores: number
    model?: string
  }
  os?: 'windows' | 'macos' | 'linux' | 'unknown'
  storage?: number // in GB
  preferences?: UserPreferences
}

export interface UserPreferences {
  priority: 'quality' | 'speed' | 'balanced'
  minContextForUseCase?: number
  acceptableQuality?: 'high' | 'medium' | 'any'
  selectedUseCases?: string[]
}

export interface DetectionResult {
  success: boolean
  specs: Partial<HardwareSpecs>
  errors?: string[]
}

export interface ModelVariant {
  quantization: string // e.g., "Q4_K_M", "Q5_K_M", "FP16"
  vramRequired: number // in GB
  ramRequired: number // in GB
  fileSize: number // in GB
  contextWindow: number // tokens
}

export interface QualityMetrics {
  mmlu?: number // Benchmark score (0-100)
  humanEval?: number // Coding benchmark (0-100)
  mt_bench?: number // Chat quality (0-10)
  overallRating: number // Simplified 0-5 rating
}

export interface PerformanceProfile {
  inferenceSpeed: 'fast' | 'medium' | 'slow'
  qualityLevel: 'high' | 'medium' | 'low'
}

export interface RecommendedContexts {
  [useCase: string]: number // Min context tokens per use case
}

export interface LLMModel {
  id: string
  name: string
  description: string
  parameters: string // e.g., "7B", "13B", "70B"
  variants: ModelVariant[]
  useCases: string[] // e.g., ["chat", "coding", "writing"]
  provider: string // e.g., "Meta", "Mistral AI"
  license: string
  links: {
    huggingFace?: string
    ollama?: string
    website?: string
  }
  tags: string[]
  qualityMetrics?: QualityMetrics
  performanceProfile?: PerformanceProfile
  recommendedContexts?: RecommendedContexts
}

// Fitness Assessment Types
export type FitnessCategory = 'excellent' | 'good' | 'fair' | 'poor' | 'incompatible'

export interface ExplainableReason {
  factor: string // "VRAM Utilization" | "Model Quality" | "Context Match" | etc.
  rating: 'positive' | 'neutral' | 'negative'
  impact: 'high' | 'medium' | 'low'
  explanation: string // Human-readable explanation
}

export interface FitnessAssessment {
  category: FitnessCategory
  score: number // Sub-score within category
  reasons: ExplainableReason[]
  warnings: string[]
  recommendations: string[]
}
