export default function ToolsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Setup Tools</h1>
      <p className="text-lg text-gray-600 mb-8">
        Step-by-step guides for Ollama, LM Studio, and other tools to run LLMs locally.
      </p>

      {/* Tool Comparison */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Choose Your Tool</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ollama */}
          <div className="bg-white rounded-lg border-2 border-blue-200 p-6">
            <h3 className="text-xl font-bold mb-3">🦙 Ollama</h3>
            <p className="text-gray-700 mb-4">[Placeholder: Command-line tool, simple and powerful]</p>
            <div className="space-y-2 text-sm">
              <p className="text-green-700">✓ Easy installation</p>
              <p className="text-green-700">✓ Great for developers</p>
              <p className="text-green-700">✓ Mac, Linux, Windows</p>
              <p className="text-amber-600">~ Command-line interface</p>
            </div>
            <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              [Placeholder: View Ollama Guide]
            </button>
          </div>

          {/* LM Studio */}
          <div className="bg-white rounded-lg border-2 border-purple-200 p-6">
            <h3 className="text-xl font-bold mb-3">🎨 LM Studio</h3>
            <p className="text-gray-700 mb-4">[Placeholder: GUI application, beginner-friendly]</p>
            <div className="space-y-2 text-sm">
              <p className="text-green-700">✓ User-friendly GUI</p>
              <p className="text-green-700">✓ Model browser built-in</p>
              <p className="text-green-700">✓ Mac and Windows</p>
              <p className="text-amber-600">~ Larger download</p>
            </div>
            <button className="mt-4 w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
              [Placeholder: View LM Studio Guide]
            </button>
          </div>
        </div>
      </section>

      {/* Quick Setup - Ollama */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Setup: Ollama</h2>
        <div className="bg-slate-900 text-white rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 mb-2">1. Install Ollama:</p>
              <code className="block bg-slate-800 p-3 rounded">
                [Placeholder: curl install command]
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-2">2. Run your first model:</p>
              <code className="block bg-slate-800 p-3 rounded">
                [Placeholder: ollama run llama2]
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-2">3. See available models:</p>
              <code className="block bg-slate-800 p-3 rounded">
                [Placeholder: ollama list]
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Setup - LM Studio */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Setup: LM Studio</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-gray-700">[Placeholder: Download from lmstudio.ai]</li>
            <li className="text-gray-700">[Placeholder: Install and open the app]</li>
            <li className="text-gray-700">[Placeholder: Browse and download a model]</li>
            <li className="text-gray-700">[Placeholder: Start chatting!]</li>
          </ol>
        </div>
      </section>

      {/* Other Tools */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Other Tools</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">llama.cpp</h3>
            <p className="text-sm text-gray-600">[Placeholder: C++ implementation, maximum control]</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">text-generation-webui</h3>
            <p className="text-sm text-gray-600">[Placeholder: Web UI with many features]</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">GPT4All</h3>
            <p className="text-sm text-gray-600">[Placeholder: Easy desktop app for beginners]</p>
          </div>
        </div>
      </section>

      {/* Curated Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">External Resources</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Ollama official docs]</p>
            <p className="text-sm text-gray-500">Complete documentation</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: LM Studio tutorials]</p>
            <p className="text-sm text-gray-500">Video guides and tips</p>
          </div>
        </div>
      </section>

      {/* Try It */}
      <section className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            → <a href="/hardware" className="text-blue-600 hover:underline">Check your hardware first</a>
          </p>
          <p className="text-gray-700">
            → <a href="/recommendations" className="text-blue-600 hover:underline">Get model recommendations</a>
          </p>
        </div>
      </section>
    </main>
  )
}
