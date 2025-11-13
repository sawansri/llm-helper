export default function GettingStartedPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Getting Started with Self-Hosting</h1>
      <p className="text-lg text-gray-600 mb-8">
        New to self-hosting? Start here to understand the basics of running LLMs on your own hardware.
      </p>

      {/* Why Self-Host Section */}
      <section className="bg-green-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Why Self-Host?</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-semibold">Privacy & Control</h3>
              <p className="text-gray-700">[Placeholder: Your data stays on your machine]</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h3 className="font-semibold">Cost Effective</h3>
              <p className="text-gray-700">[Placeholder: No API fees for heavy usage]</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h3 className="font-semibold">Offline Access</h3>
              <p className="text-gray-700">[Placeholder: Works without internet]</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h3 className="font-semibold">Customization</h3>
              <p className="text-gray-700">[Placeholder: Fine-tune for your needs]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Steps */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Start Steps</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border-l-4 border-blue-500 p-4">
            <h3 className="font-semibold text-lg mb-2">Step 1: Check Your Hardware</h3>
            <p className="text-gray-700 mb-2">[Placeholder: Make sure you have enough VRAM/RAM]</p>
            <a href="/hardware" className="text-blue-600 hover:underline">→ Use our hardware detector</a>
          </div>
          <div className="bg-white rounded-lg border-l-4 border-blue-500 p-4">
            <h3 className="font-semibold text-lg mb-2">Step 2: Choose a Model</h3>
            <p className="text-gray-700 mb-2">[Placeholder: Pick a model that fits your hardware]</p>
            <a href="/recommendations" className="text-blue-600 hover:underline">→ Get recommendations</a>
          </div>
          <div className="bg-white rounded-lg border-l-4 border-blue-500 p-4">
            <h3 className="font-semibold text-lg mb-2">Step 3: Install Tools</h3>
            <p className="text-gray-700 mb-2">[Placeholder: Setup Ollama or LM Studio]</p>
            <a href="/learn/tools" className="text-blue-600 hover:underline">→ See setup guides</a>
          </div>
          <div className="bg-white rounded-lg border-l-4 border-blue-500 p-4">
            <h3 className="font-semibold text-lg mb-2">Step 4: Run Your First Model</h3>
            <p className="text-gray-700">[Placeholder: Simple commands to get started]</p>
          </div>
        </div>
      </section>

      {/* Curated Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Learn More</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Introduction to local LLMs]</p>
            <p className="text-sm text-gray-500">Complete beginner guide</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Comparing cloud vs local]</p>
            <p className="text-sm text-gray-500">Pros and cons analysis</p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            → <a href="/learn/hardware" className="text-blue-600 hover:underline">Understand hardware requirements</a>
          </p>
          <p className="text-gray-700">
            → <a href="/learn/quantization" className="text-blue-600 hover:underline">Learn about quantization</a>
          </p>
          <p className="text-gray-700">
            → <a href="/learn/tools" className="text-blue-600 hover:underline">Setup tools guide</a>
          </p>
        </div>
      </section>
    </main>
  )
}
