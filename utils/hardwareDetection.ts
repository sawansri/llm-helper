import { HardwareSpecs, DetectionResult } from '@/lib/types'
import { loadGPUDatabase, findGPUSpec } from './gpuDatabase'

export async function detectHardware(): Promise<DetectionResult> {
  const errors: string[] = []
  const specs: Partial<HardwareSpecs> = {}

  // Load GPU database first
  await loadGPUDatabase()

  try {
    // Detect RAM first (needed for integrated GPU VRAM calculation)
    const ram = detectRAM()
    if (ram) {
      specs.ram = ram
    }
  } catch (error) {
    errors.push('RAM detection failed')
  }

  try {
    // Detect GPU using WebGL/WebGPU
    const gpu = await detectGPU(specs.ram)
    if (gpu) {
      specs.gpu = gpu
    }
  } catch (error) {
    errors.push('GPU detection failed')
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

async function detectGPU(systemRAM?: number) {
  if (typeof window === 'undefined') return null

  let gpuModel = ''

  // Try WebGPU first (more modern, better info)
  if ('gpu' in navigator) {
    try {
      const gpu = (navigator as any).gpu
      const adapter = await gpu.requestAdapter()
      if (adapter) {
        const info = await adapter.requestAdapterInfo()
        gpuModel = info.description || info.device || 'Unknown GPU'
      }
    } catch (error) {
      console.log('WebGPU detection failed, falling back to WebGL')
    }
  }

  // Fallback to WebGL if WebGPU didn't work
  if (!gpuModel) {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null ||
                canvas.getContext('experimental-webgl') as WebGLRenderingContext | null

    if (!gl) return null

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return null

    gpuModel = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown GPU'
  }

  // Use database to find GPU specs
  const gpuSpec = findGPUSpec(gpuModel, systemRAM)

  return {
    model: gpuModel,
    vram: gpuSpec.vram,
    detected: true
  }
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
