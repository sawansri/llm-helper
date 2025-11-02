export interface GPUSpec {
  manufacturer: string
  model: string
  type: 'Discrete' | 'Integrated'
  vramGB: number | number[] | 'shared'
  isIntegrated: boolean
}

// Parse VRAM string from CSV
function parseVRAM(vramString: string): number | number[] | 'shared' {
  const cleaned = vramString.trim()

  // Check if it's shared memory (integrated GPU)
  if (cleaned.toLowerCase().includes('shared') || cleaned.toLowerCase().includes('dynamically')) {
    return 'shared'
  }

  // Handle cases like "8 GB / 16 GB" or "4 GB / 8 GB"
  if (cleaned.includes('/')) {
    const values = cleaned.split('/').map(v => {
      const match = v.match(/(\d+(?:\.\d+)?)\s*GB/i)
      return match ? parseFloat(match[1]) : 0
    }).filter(v => v > 0)

    return values.length > 0 ? values : 8 // Default to 8GB if parsing fails
  }

  // Handle single value like "24 GB"
  const match = cleaned.match(/(\d+(?:\.\d+)?)\s*GB/i)
  if (match) {
    return parseFloat(match[1])
  }

  // Default fallback
  return 8
}

// GPU database - will be loaded from JSON
let gpuDatabase: GPUSpec[] = []

export async function loadGPUDatabase(): Promise<GPUSpec[]> {
  if (gpuDatabase.length > 0) {
    return gpuDatabase
  }

  try {
    const response = await fetch('/data/gpu_database.json')
    if (response.ok) {
      gpuDatabase = await response.json()
      return gpuDatabase
    }
  } catch (error) {
    console.warn('Failed to load GPU database, using fallback patterns')
  }

  return []
}

// Fuzzy match GPU model name to database entry
export function findGPUSpec(detectedGPUName: string, systemRAM?: number): { vram: number; source: 'database' | 'estimated' } {
  const normalized = detectedGPUName.toLowerCase()

  // Try exact match first
  let match = gpuDatabase.find(gpu =>
    normalized.includes(gpu.model.toLowerCase()) &&
    normalized.includes(gpu.manufacturer.toLowerCase())
  )

  // Try partial match (just model name)
  if (!match) {
    match = gpuDatabase.find(gpu =>
      normalized.includes(gpu.model.toLowerCase())
    )
  }

  if (match) {
    // Handle integrated GPUs with shared memory
    if (match.type === 'Integrated' || match.vramGB === 'shared') {
      return {
        vram: estimateIntegratedGPUVRAM(detectedGPUName, systemRAM),
        source: 'database'
      }
    }

    // Handle discrete GPUs
    if (Array.isArray(match.vramGB)) {
      // If multiple VRAM options, use the highest
      return {
        vram: Math.max(...match.vramGB),
        source: 'database'
      }
    }

    return {
      vram: match.vramGB as number,
      source: 'database'
    }
  }

  // Fallback to pattern matching
  return {
    vram: estimateVRAMFromPattern(detectedGPUName, systemRAM),
    source: 'estimated'
  }
}

// Strategy for integrated GPUs: Use a percentage of system RAM
function estimateIntegratedGPUVRAM(gpuName: string, systemRAM?: number): number {
  if (!systemRAM) {
    return 4 // Conservative default
  }

  const lower = gpuName.toLowerCase()

  // High-end integrated GPUs (AMD 780M, 890M, Intel Iris Xe)
  if (lower.includes('780m') || lower.includes('890m') ||
      lower.includes('880m') || lower.includes('iris xe')) {
    // Can use up to 50% of system RAM for high-end iGPUs
    return Math.min(Math.floor(systemRAM * 0.5), 16)
  }

  // Mid-range integrated GPUs (AMD 680M, 760M, Vega)
  if (lower.includes('680m') || lower.includes('760m') ||
      lower.includes('660m') || lower.includes('vega')) {
    // Use up to 40% of system RAM
    return Math.min(Math.floor(systemRAM * 0.4), 12)
  }

  // Basic integrated GPUs (Intel UHD, HD)
  if (lower.includes('uhd') || lower.includes('intel hd')) {
    // Use up to 25% of system RAM
    return Math.min(Math.floor(systemRAM * 0.25), 8)
  }

  // Default for unknown integrated GPUs - conservative estimate
  return Math.min(Math.floor(systemRAM * 0.3), 8)
}

// Fallback pattern matching (same as before, but now a fallback)
function estimateVRAMFromPattern(gpuModel: string, systemRAM?: number): number {
  const vramPatterns = [
    // NVIDIA RTX 50 Series
    { pattern: /RTX\s*5090/i, vram: 32 },
    { pattern: /RTX\s*5080/i, vram: 16 },
    { pattern: /RTX\s*5070/i, vram: 12 },
    { pattern: /RTX\s*5060/i, vram: 8 },
    // NVIDIA RTX 40 Series
    { pattern: /RTX\s*4090/i, vram: 24 },
    { pattern: /RTX\s*4080/i, vram: 16 },
    { pattern: /RTX\s*4070\s*Ti/i, vram: 12 },
    { pattern: /RTX\s*4070/i, vram: 12 },
    { pattern: /RTX\s*4060\s*Ti/i, vram: 8 },
    { pattern: /RTX\s*4060/i, vram: 8 },
    // NVIDIA RTX 30 Series
    { pattern: /RTX\s*3090/i, vram: 24 },
    { pattern: /RTX\s*3080/i, vram: 10 },
    { pattern: /RTX\s*3070/i, vram: 8 },
    { pattern: /RTX\s*3060/i, vram: 12 },
    // AMD Discrete GPUs
    { pattern: /RX\s*7900\s*XTX/i, vram: 24 },
    { pattern: /RX\s*7900\s*XT/i, vram: 20 },
    { pattern: /RX\s*7800\s*XT/i, vram: 16 },
    { pattern: /RX\s*6900/i, vram: 16 },
    { pattern: /RX\s*6800/i, vram: 16 },
    // Apple Silicon
    { pattern: /M1\s*Max/i, vram: 32 },
    { pattern: /M2\s*Max/i, vram: 38 },
    { pattern: /M3\s*Max/i, vram: 48 },
    { pattern: /M4\s*Max/i, vram: 48 },
  ]

  for (const { pattern, vram } of vramPatterns) {
    if (pattern.test(gpuModel)) {
      return vram
    }
  }

  // Check if it's an integrated GPU
  if (gpuModel.toLowerCase().includes('integrated') ||
      gpuModel.toLowerCase().includes('intel') ||
      gpuModel.toLowerCase().includes('uhd') ||
      gpuModel.toLowerCase().includes('iris') ||
      gpuModel.toLowerCase().includes('radeon') && gpuModel.toLowerCase().includes('graphics') ||
      gpuModel.toLowerCase().includes('vega') ||
      gpuModel.toLowerCase().includes('angle')) {
    return estimateIntegratedGPUVRAM(gpuModel, systemRAM)
  }

  // Unknown discrete GPU - conservative estimate
  return 6
}

// Convert CSV to JSON (utility function for initial setup)
export function parseGPUCSV(csvContent: string): GPUSpec[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',')

  const gpus: GPUSpec[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    if (values.length < 4) continue

    const manufacturer = values[0]?.trim()
    const model = values[1]?.trim()
    const type = values[2]?.trim() as 'Discrete' | 'Integrated'
    const vramString = values[3]?.trim()

    if (!manufacturer || !model) continue

    gpus.push({
      manufacturer,
      model,
      type,
      vramGB: parseVRAM(vramString),
      isIntegrated: type === 'Integrated'
    })
  }

  return gpus
}
