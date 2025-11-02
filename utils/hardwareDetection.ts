import { HardwareSpecs, DetectionResult } from '@/lib/types'

export async function detectHardware(): Promise<DetectionResult> {
  const errors: string[] = []
  const specs: Partial<HardwareSpecs> = {}

  try {
    // Detect GPU using WebGL
    const gpu = detectGPU()
    if (gpu) {
      specs.gpu = gpu
    }
  } catch (error) {
    errors.push('GPU detection failed')
  }

  try {
    // Detect RAM
    const ram = detectRAM()
    if (ram) {
      specs.ram = ram
    }
  } catch (error) {
    errors.push('RAM detection failed')
  }

  try {
    // Detect CPU
    const cpu = detectCPU()
    if (cpu) {
      specs.cpu = cpu
    }
  } catch (error) {
    errors.push('CPU detection failed')
  }

  try {
    // Detect OS
    specs.os = detectOS()
  } catch (error) {
    errors.push('OS detection failed')
  }

  return {
    success: errors.length === 0,
    specs,
    errors: errors.length > 0 ? errors : undefined
  }
}

function detectGPU() {
  if (typeof window === 'undefined') return null

  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

  if (!gl) return null

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  if (!debugInfo) return null

  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

  return {
    model: renderer || 'Unknown GPU',
    vram: estimateVRAM(renderer),
    detected: true
  }
}

function estimateVRAM(gpuModel: string): number {
  // Parse common GPU patterns
  const vramPatterns = [
    { pattern: /RTX\s*4090/i, vram: 24 },
    { pattern: /RTX\s*4080/i, vram: 16 },
    { pattern: /RTX\s*4070\s*Ti/i, vram: 12 },
    { pattern: /RTX\s*4070/i, vram: 12 },
    { pattern: /RTX\s*4060\s*Ti/i, vram: 8 },
    { pattern: /RTX\s*4060/i, vram: 8 },
    { pattern: /RTX\s*3090/i, vram: 24 },
    { pattern: /RTX\s*3080/i, vram: 10 },
    { pattern: /RTX\s*3070/i, vram: 8 },
    { pattern: /RTX\s*3060/i, vram: 12 },
    { pattern: /RX\s*7900\s*XTX/i, vram: 24 },
    { pattern: /RX\s*7900\s*XT/i, vram: 20 },
    { pattern: /RX\s*6900/i, vram: 16 },
    { pattern: /RX\s*6800/i, vram: 16 },
    { pattern: /M1\s*Max/i, vram: 32 },
    { pattern: /M2\s*Max/i, vram: 38 },
    { pattern: /M3\s*Max/i, vram: 48 },
  ]

  for (const { pattern, vram } of vramPatterns) {
    if (pattern.test(gpuModel)) {
      return vram
    }
  }

  return 0 // Unknown
}

function detectRAM(): number | null {
  if (typeof navigator === 'undefined') return null

  // @ts-ignore - deviceMemory is not in TypeScript types
  const deviceMemory = navigator.deviceMemory

  return deviceMemory || null
}

function detectCPU() {
  if (typeof navigator === 'undefined') return null

  return {
    cores: navigator.hardwareConcurrency || 0,
    model: undefined // Not detectable via web APIs
  }
}

function detectOS(): HardwareSpecs['os'] {
  if (typeof navigator === 'undefined') return 'unknown'

  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.includes('win')) return 'windows'
  if (userAgent.includes('mac')) return 'macos'
  if (userAgent.includes('linux')) return 'linux'

  return 'unknown'
}
