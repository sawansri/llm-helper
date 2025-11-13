export default function ArchitecturePage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Architecture & Training</h1>
      <p className="text-lg text-gray-600 mb-8">
        Deep dive into transformer architecture, attention mechanisms, and training processes.
      </p>

      {/* Quick Summary Section */}
      <section className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Key Concepts</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">Transformer Architecture</h3>
            <p className="text-gray-700">[Placeholder: Brief explanation of transformers]</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Attention Mechanism</h3>
            <p className="text-gray-700">[Placeholder: How attention works]</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Training Process</h3>
            <p className="text-gray-700">[Placeholder: Overview of pre-training and fine-tuning]</p>
          </div>
        </div>
      </section>

      {/* Curated Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Curated Learning Path</h2>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-green-700">🟢 Start Here (Beginner)</h3>
          <div className="space-y-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-700">[Placeholder: Visual explanation of transformers]</p>
              <p className="text-sm text-gray-500">15-20 min</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-700">🟡 Go Deeper (Intermediate)</h3>
          <div className="space-y-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-700">[Placeholder: Attention mechanism explained]</p>
              <p className="text-sm text-gray-500">30-45 min</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-red-700">🔴 Master It (Advanced)</h3>
          <div className="space-y-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-700">[Placeholder: &quot;Attention Is All You Need&quot; paper]</p>
              <p className="text-sm text-gray-500">2-3 hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            → <a href="/learn/how-llms-work" className="text-blue-600 hover:underline">How LLMs Work</a>
          </p>
          <p className="text-gray-700">
            → <a href="/learn/prompting" className="text-blue-600 hover:underline">Prompting & Best Practices</a>
          </p>
        </div>
      </section>
    </main>
  )
}
