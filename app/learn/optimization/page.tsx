export default function OptimizationPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Optimization & Troubleshooting</h1>
      <p className="text-lg text-gray-600 mb-8">
        Tips for better performance and solving common issues when self-hosting LLMs.
      </p>

      {/* Performance Tips */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🚀 Performance Optimization</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border-l-4 border-green-500 p-4">
            <h3 className="font-semibold text-lg mb-2">Use GPU Acceleration</h3>
            <p className="text-gray-700 mb-2">[Placeholder: Ensure your model is using GPU, not CPU]</p>
            <code className="block bg-slate-100 p-2 rounded text-sm mt-2">
              [Placeholder: Command to check GPU usage]
            </code>
          </div>

          <div className="bg-white rounded-lg border-l-4 border-green-500 p-4">
            <h3 className="font-semibold text-lg mb-2">Choose Right Quantization</h3>
            <p className="text-gray-700">[Placeholder: Lower quantization = faster inference]</p>
            <a href="/learn/quantization" className="text-blue-600 hover:underline text-sm">→ Learn about quantization</a>
          </div>

          <div className="bg-white rounded-lg border-l-4 border-green-500 p-4">
            <h3 className="font-semibold text-lg mb-2">Adjust Context Window</h3>
            <p className="text-gray-700">[Placeholder: Smaller context = less memory, faster speed]</p>
          </div>

          <div className="bg-white rounded-lg border-l-4 border-green-500 p-4">
            <h3 className="font-semibold text-lg mb-2">Batch Processing</h3>
            <p className="text-gray-700">[Placeholder: Process multiple prompts together for efficiency]</p>
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🔧 Common Issues & Solutions</h2>
        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <h3 className="font-semibold text-lg mb-2">❌ Out of Memory Error</h3>
            <p className="text-gray-700 mb-2"><strong>Problem:</strong> [Placeholder: Model too large for available VRAM/RAM]</p>
            <p className="text-gray-700"><strong>Solutions:</strong></p>
            <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
              <li>Try a lower quantization (Q4 instead of Q5)</li>
              <li>Use a smaller model variant</li>
              <li>Reduce context window size</li>
              <li>Close other applications</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <h3 className="font-semibold text-lg mb-2">⚠️ Very Slow Inference</h3>
            <p className="text-gray-700 mb-2"><strong>Problem:</strong> [Placeholder: Model running on CPU instead of GPU]</p>
            <p className="text-gray-700"><strong>Solutions:</strong></p>
            <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
              <li>Check GPU drivers are installed</li>
              <li>Verify CUDA/ROCm is configured</li>
              <li>Use smaller quantization</li>
              <li>Try a smaller model</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <h3 className="font-semibold text-lg mb-2">⚠️ Poor Quality Responses</h3>
            <p className="text-gray-700 mb-2"><strong>Problem:</strong> [Placeholder: Model giving low-quality outputs]</p>
            <p className="text-gray-700"><strong>Solutions:</strong></p>
            <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
              <li>Try higher quantization (Q5 or Q8)</li>
              <li>Use a larger model if you have VRAM</li>
              <li>Improve your prompts</li>
              <li>Adjust temperature settings</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="font-semibold text-lg mb-2">ℹ️ Model Download Failed</h3>
            <p className="text-gray-700 mb-2"><strong>Problem:</strong> [Placeholder: Download interrupted or failed]</p>
            <p className="text-gray-700"><strong>Solutions:</strong></p>
            <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
              <li>Check internet connection</li>
              <li>Retry the download</li>
              <li>Verify disk space</li>
              <li>Try a different mirror/source</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Advanced Tips */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">💡 Advanced Tips</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">Layer Offloading</h3>
            <p className="text-sm text-gray-600">[Placeholder: Manually control which layers run on GPU vs CPU]</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">Flash Attention</h3>
            <p className="text-sm text-gray-600">[Placeholder: Use optimized attention for faster inference]</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">Model Caching</h3>
            <p className="text-sm text-gray-600">[Placeholder: Keep model loaded in memory for faster subsequent runs]</p>
          </div>
        </div>
      </section>

      {/* Curated Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Learn More</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Optimization techniques guide]</p>
            <p className="text-sm text-gray-500">Advanced performance tuning</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Hardware troubleshooting]</p>
            <p className="text-sm text-gray-500">GPU and driver issues</p>
          </div>
        </div>
      </section>

      {/* Get Help */}
      <section className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Still Having Issues?</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            → <a href="/hardware" className="text-blue-600 hover:underline">Verify your hardware specs</a>
          </p>
          <p className="text-gray-700">
            → <a href="/recommendations" className="text-blue-600 hover:underline">Try recommended models for your setup</a>
          </p>
          <p className="text-gray-700">
            → <a href="/learn/tools" className="text-blue-600 hover:underline">Check tool-specific guides</a>
          </p>
        </div>
      </section>
    </main>
  )
}
