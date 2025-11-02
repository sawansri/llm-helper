'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import HardwareDetector from '@/components/hardware/HardwareDetector'
import ManualInputForm from '@/components/hardware/ManualInputForm'
import { HardwareSpecs } from '@/lib/types'
import { saveHardwareSpecs } from '@/utils/localStorage'

export default function HardwarePage() {
  const router = useRouter()
  const [detectedSpecs, setDetectedSpecs] = useState<Partial<HardwareSpecs>>()

  const handleDetected = (specs: Partial<HardwareSpecs>) => {
    setDetectedSpecs(specs)
  }

  const handleSubmit = (specs: HardwareSpecs) => {
    saveHardwareSpecs(specs)
    router.push('/recommendations')
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Hardware Detection</h1>
      <p className="text-gray-600 mb-8">
        Detect or manually enter your hardware specifications to get personalized recommendations.
      </p>

      <div className="max-w-2xl mx-auto space-y-8">
        <HardwareDetector onDetected={handleDetected} />
        <ManualInputForm initialSpecs={detectedSpecs} onSubmit={handleSubmit} />
      </div>
    </main>
  )
}
