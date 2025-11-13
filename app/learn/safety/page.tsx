export default function SafetyPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Limitations & Safety</h1>
      <p className="text-lg text-gray-600 mb-8">
        Understand the limitations, biases, and safety considerations of LLMs.
      </p>

      {/* Key Considerations */}
      <section className="bg-amber-50 rounded-lg p-6 mb-8 border-l-4 border-amber-500">
        <h2 className="text-2xl font-bold mb-4">Key Considerations</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">⚠️ Hallucinations</h3>
            <p className="text-gray-700">[Placeholder: LLMs can generate false information confidently]</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">⚠️ Biases</h3>
            <p className="text-gray-700">[Placeholder: Training data biases reflected in outputs]</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">⚠️ Privacy</h3>
            <p className="text-gray-700">[Placeholder: Don&apos;t share sensitive information]</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">⚠️ Knowledge Cutoff</h3>
            <p className="text-gray-700">[Placeholder: Models have training data cutoff dates]</p>
          </div>
        </div>
      </section>

      {/* Curated Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Learn More</h2>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: AI Safety research]</p>
            <p className="text-sm text-gray-500">Understanding AI alignment and safety</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Bias in AI systems]</p>
            <p className="text-sm text-gray-500">How biases emerge and mitigation strategies</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Responsible AI usage]</p>
            <p className="text-sm text-gray-500">Best practices for using LLMs ethically</p>
          </div>
        </div>
      </section>

      {/* Self-Hosting Advantage */}
      <section className="bg-green-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Self-Hosting Advantage</h2>
        <p className="text-gray-700 mb-4">
          Running LLMs locally gives you more control over privacy and data security.
        </p>
        <div className="space-y-2">
          <p className="text-gray-700">
            → <a href="/learn/getting-started" className="text-blue-600 hover:underline">Learn about self-hosting</a>
          </p>
          <p className="text-gray-700">
            → <a href="/recommendations" className="text-blue-600 hover:underline">Find privacy-focused models</a>
          </p>
        </div>
      </section>
    </main>
  )
}
