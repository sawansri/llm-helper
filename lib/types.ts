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
}
