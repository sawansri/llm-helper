import { HardwareSpecs } from '@/lib/types'

const STORAGE_KEY = 'llm-helper-hardware'

export function saveHardwareSpecs(specs: HardwareSpecs): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(specs))
  } catch (error) {
    console.error('Failed to save hardware specs:', error)
  }
}

export function loadHardwareSpecs(): HardwareSpecs | null {
  if (typeof window === 'undefined') return null

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load hardware specs:', error)
    return null
  }
}

export function clearHardwareSpecs(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear hardware specs:', error)
  }
}
