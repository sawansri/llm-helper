export default function PromptingPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Prompting & Best Practices</h1>
      <p className="text-lg text-gray-600 mb-8">
        Master the art of prompting and get the best results from LLMs.
      </p>

      {/* Quick Tips Section */}
      <section className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Tips</h2>
        <div className="space-y-3">
          <div className="bg-white rounded p-4">
            <p className="font-semibold">💡 Tip 1</p>
            <p className="text-gray-700">[Placeholder: Be specific and clear]</p>
          </div>
          <div className="bg-white rounded p-4">
            <p className="font-semibold">💡 Tip 2</p>
            <p className="text-gray-700">[Placeholder: Provide context and examples]</p>
          </div>
          <div className="bg-white rounded p-4">
            <p className="font-semibold">💡 Tip 3</p>
            <p className="text-gray-700">[Placeholder: Iterate and refine]</p>
          </div>
        </div>
      </section>

      {/* Curated Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Curated Resources</h2>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Prompt engineering guide]</p>
            <p className="text-sm text-gray-500">Comprehensive prompting techniques</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Few-shot learning examples]</p>
            <p className="text-sm text-gray-500">How to use examples effectively</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-medium text-gray-700">[Placeholder: Chain-of-thought prompting]</p>
            <p className="text-sm text-gray-500">Get better reasoning from models</p>
          </div>
        </div>
      </section>

      {/* Try It Section */}
      <section className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Try It Yourself</h2>
        <p className="text-gray-700 mb-4">
          Practice your prompting skills with models running on your own hardware.
        </p>
        <div className="space-y-2">
          <p className="text-gray-700">
            → <a href="/recommendations" className="text-blue-600 hover:underline">Find models to practice with</a>
          </p>
          <p className="text-gray-700">
            → <a href="/learn/tools" className="text-blue-600 hover:underline">Setup guides for local LLMs</a>
          </p>
        </div>
      </section>
    </main>
  )
}
