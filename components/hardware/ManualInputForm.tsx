'use client'

import { useState, useEffect } from 'react'
import { HardwareSpecs } from '@/lib/types'

interface ManualInputFormProps {
  initialSpecs?: Partial<HardwareSpecs>
  onSubmit: (specs: HardwareSpecs) => void
}

export default function ManualInputForm({ initialSpecs, onSubmit }: ManualInputFormProps) {
  const [specs, setSpecs] = useState<HardwareSpecs>({
    gpu: initialSpecs?.gpu || { model: '', vram: 0, detected: false },
    ram: initialSpecs?.ram || 0,
    cpu: initialSpecs?.cpu || { cores: 0 },
    os: initialSpecs?.os || 'unknown',
  })

  useEffect(() => {
    if (initialSpecs) {
      setSpecs(prev => ({
        ...prev,
        ...initialSpecs,
        gpu: initialSpecs.gpu || prev.gpu,
      }))
    }
  }, [initialSpecs])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(specs)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-2xl font-bold">Hardware Specifications</h2>

      {/* GPU Section */}
      <div>
        <label className="block text-sm font-semibold mb-2">GPU Model</label>
        <input
          type="text"
          value={specs.gpu?.model || ''}
          onChange={(e) => setSpecs({
            ...specs,
            gpu: { ...specs.gpu!, model: e.target.value }
          })}
          placeholder="e.g., NVIDIA RTX 4090"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">VRAM (GB)</label>
        <input
          type="number"
          value={specs.gpu?.vram || ''}
          onChange={(e) => setSpecs({
            ...specs,
            gpu: { ...specs.gpu!, vram: parseFloat(e.target.value) || 0 }
          })}
          placeholder="e.g., 24"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* RAM Section */}
      <div>
        <label className="block text-sm font-semibold mb-2">System RAM (GB)</label>
        <input
          type="number"
          value={specs.ram || ''}
          onChange={(e) => setSpecs({ ...specs, ram: parseFloat(e.target.value) || 0 })}
          placeholder="e.g., 32"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* CPU Section */}
      <div>
        <label className="block text-sm font-semibold mb-2">CPU Cores</label>
        <input
          type="number"
          value={specs.cpu?.cores || ''}
          onChange={(e) => setSpecs({
            ...specs,
            cpu: { ...specs.cpu!, cores: parseInt(e.target.value) || 0 }
          })}
          placeholder="e.g., 16"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* OS Section */}
      <div>
        <label className="block text-sm font-semibold mb-2">Operating System</label>
        <select
          value={specs.os}
          onChange={(e) => setSpecs({ ...specs, os: e.target.value as HardwareSpecs['os'] })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="windows">Windows</option>
          <option value="macos">macOS</option>
          <option value="linux">Linux</option>
          <option value="unknown">Other</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
      >
        Get Recommendations
      </button>
    </form>
  )
}
