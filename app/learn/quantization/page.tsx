export default function QuantizationPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Understanding Quantization</h1>
      <p className="text-lg text-gray-600 mb-8">
        Learn about Q4, Q5, Q8 and what they mean for performance and quality.
      </p>

      {/* Quick Summary */}
      <section className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">What is Quantization?</h2>
        <p className="text-gray-700 mb-4">
          [Placeholder: Quantization reduces model size by using fewer bits to represent weights]
        </p>
        <div className="bg-white rounded p-4">
          <p className="text-gray-600 italic">[Placeholder: Visual comparison of bit representations]</p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quantization Formats Compared</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border-2 border-red-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">FP16 (Full Precision)</h3>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm">Largest</span>
            </div>
            <p className="text-gray-700 mb-2">[Placeholder: Original model size, best quality]</p>
            <div className="text-sm text-gray-600">
              <p>✓ Highest quality</p>
              <p>✗ Requires most memory</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-orange-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">Q8_0 (8-bit)</h3>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm">~50% size</span>
            </div>
            <p className="text-gray-700 mb-2">[Placeholder: Minimal quality loss, half the size]</p>
            <div className="text-sm text-gray-600">
              <p>✓ Near-original quality</p>
              <p>✓ 50% memory reduction</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-yellow-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">Q5_K_M (5-bit)</h3>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">~40% size</span>
            </div>
            <p className="text-gray-700 mb-2">[Placeholder: Good balance of quality and size]</p>
            <div className="text-sm text-gray-600">
              <p>✓ Excellent quality/size ratio</p>
              <p>✓ Most recommended</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-green-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">Q4_K_M (4-bit)</h3>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">~25% size</span>
            </div>
            <p className="text-gray-700 mb-2">[Placeholder: Smallest practical size, slight quality drop]</p>
            <div className="text-sm text-gray-600">
              <p>✓ 75% memory reduction</p>
              <p>✓ Still good quality</p>
              <p>~ Best for limited VRAM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator Placeholder */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Which Quantization for Your Hardware?</h2>
        <div className="bg-slate-100 rounded-lg p-8 text-center border-2 border-dashed border-slate-300">
          <p className="text-gray-600 mb-4">[Placeholder: Interactive calculator]</p>
          <p className="text-sm text-gray-500 mb-4">
            Enter your VRAM to see which quantizations fit for different models
          </p>
          <div className="mt-4">
            <a href="/recommendations" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Get Recommendations
            </a>
          </div>
        </div>
      </section>

      {/* Curated Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Learn More</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Quantization techniques explained]</p>
            <p className="text-sm text-gray-500">Technical deep dive</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: GGUF format guide]</p>
            <p className="text-sm text-gray-500">Understanding quantization formats</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Quality benchmarks]</p>
            <p className="text-sm text-gray-500">Comparing quantization quality</p>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            → <a href="/learn/hardware" className="text-blue-600 hover:underline">Hardware requirements</a>
          </p>
          <p className="text-gray-700">
            → <a href="/recommendations" className="text-blue-600 hover:underline">See quantization options for your hardware</a>
          </p>
        </div>
      </section>
    </main>
  )
}
