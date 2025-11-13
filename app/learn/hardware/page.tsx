export default function HardwareRequirementsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Hardware Requirements</h1>
      <p className="text-lg text-gray-600 mb-8">
        Learn what hardware you need for different model sizes and configurations.
      </p>

      {/* Quick Reference */}
      <section className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Reference Guide</h2>
        <div className="space-y-4">
          <div className="bg-white rounded p-4">
            <h3 className="font-semibold text-lg">Small Models (3-7B parameters)</h3>
            <p className="text-gray-700">[Placeholder: 4-8GB VRAM recommended]</p>
            <p className="text-sm text-gray-500">Good for: General chat, simple tasks</p>
          </div>
          <div className="bg-white rounded p-4">
            <h3 className="font-semibold text-lg">Medium Models (13-14B parameters)</h3>
            <p className="text-gray-700">[Placeholder: 10-16GB VRAM recommended]</p>
            <p className="text-sm text-gray-500">Good for: Complex reasoning, coding</p>
          </div>
          <div className="bg-white rounded p-4">
            <h3 className="font-semibold text-lg">Large Models (30B+ parameters)</h3>
            <p className="text-gray-700">[Placeholder: 24GB+ VRAM or RAM fallback]</p>
            <p className="text-sm text-gray-500">Good for: Advanced tasks, best quality</p>
          </div>
        </div>
      </section>

      {/* VRAM vs RAM */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">VRAM vs RAM: What&apos;s the Difference?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
            <h3 className="font-semibold text-lg mb-2">🎮 VRAM (GPU Memory)</h3>
            <p className="text-gray-700 mb-2">[Placeholder: Much faster, limited capacity]</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>10-100x faster than RAM</li>
              <li>Best for inference speed</li>
              <li>Limited to GPU capacity</li>
            </ul>
          </div>
          <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-200">
            <h3 className="font-semibold text-lg mb-2">💾 RAM (System Memory)</h3>
            <p className="text-gray-700 mb-2">[Placeholder: Slower but more abundant]</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Much more capacity available</li>
              <li>Fallback for large models</li>
              <li>Slower inference times</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Calculator Placeholder */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Hardware Calculator</h2>
        <div className="bg-slate-100 rounded-lg p-8 text-center border-2 border-dashed border-slate-300">
          <p className="text-gray-600 mb-4">[Placeholder: Interactive calculator]</p>
          <p className="text-sm text-gray-500">Enter your specs to see what models you can run</p>
          <div className="mt-4">
            <a href="/hardware" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Use Hardware Detector
            </a>
          </div>
        </div>
      </section>

      {/* Curated Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Learn More</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: GPU architecture for ML]</p>
            <p className="text-sm text-gray-500">How GPUs accelerate inference</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Memory requirements explained]</p>
            <p className="text-sm text-gray-500">Calculating VRAM needs</p>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            → <a href="/learn/quantization" className="text-blue-600 hover:underline">Reduce memory with quantization</a>
          </p>
          <p className="text-gray-700">
            → <a href="/recommendations" className="text-blue-600 hover:underline">Get model recommendations</a>
          </p>
        </div>
      </section>
    </main>
  )
}
