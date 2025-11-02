'use client'

import { useState, useEffect } from 'react'
import { detectHardware } from '@/utils/hardwareDetection'
import { HardwareSpecs } from '@/lib/types'

export default function HardwareDetector({ onDetected }: {
  onDetected: (specs: Partial<HardwareSpecs>) => void
}) {
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState(false)

  const handleDetect = async () => {
    setDetecting(true)

    const result = await detectHardware()

    setDetecting(false)
    setDetected(true)
    onDetected(result.specs)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Auto-Detect Hardware</h2>
      <p className="text-gray-600 mb-4">
        We'll try to detect your system specifications automatically using browser APIs.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
        <p className="text-blue-800">
          <strong>Note:</strong> VRAM detection is estimated based on GPU model patterns.
          Please verify and manually adjust the values below if needed.
        </p>
      </div>

      <button
        onClick={handleDetect}
        disabled={detecting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
      >
        {detecting ? 'Detecting...' : detected ? 'Detect Again' : 'Detect Hardware'}
      </button>

      {detected && (
        <p className="mt-4 text-green-600 font-semibold">
          ✓ Detection complete! Review and adjust the values below.
        </p>
      )}
    </div>
  )
}
