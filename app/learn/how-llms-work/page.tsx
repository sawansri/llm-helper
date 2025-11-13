export default function HowLLMsWorkPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">How LLMs Work</h1>
      <p className="text-lg text-gray-600 mb-8">
        Learn the fundamentals of large language models, from tokens to predictions.
      </p>

      {/* Quick Summary Section */}
      <section className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Summary</h2>
        <p className="text-gray-700 mb-4">
          [Placeholder: Brief overview of how LLMs work - tokens, embeddings, attention, predictions]
        </p>
        <div className="bg-white rounded p-4">
          <p className="text-gray-500 italic">[Placeholder: Visual diagram or interactive demo]</p>
        </div>
      </section>

      {/* Curated Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Curated Learning Path</h2>

        {/* Beginner */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-green-700">🟢 Start Here (Beginner)</h3>
          <div className="space-y-2">
            <ResourceLink
              title="[Placeholder: Beginner-friendly video/article]"
              type="video"
              duration="15 min"
            />
            <ResourceLink
              title="[Placeholder: Another beginner resource]"
              type="article"
              duration="10 min"
            />
          </div>
        </div>

        {/* Intermediate */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-700">🟡 Go Deeper (Intermediate)</h3>
          <div className="space-y-2">
            <ResourceLink
              title="[Placeholder: Intermediate tutorial]"
              type="article"
              duration="30 min"
            />
            <ResourceLink
              title="[Placeholder: Technical explanation]"
              type="video"
              duration="45 min"
            />
          </div>
        </div>

        {/* Advanced */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-red-700">🔴 Master It (Advanced)</h3>
          <div className="space-y-2">
            <ResourceLink
              title="[Placeholder: Research paper or advanced course]"
              type="paper"
              duration="2-3 hours"
            />
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <section className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Try It Yourself</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            → <a href="/recommendations" className="text-blue-600 hover:underline">Get model recommendations for your hardware</a>
          </p>
          <p className="text-gray-700">
            → <a href="/hardware" className="text-blue-600 hover:underline">Check your hardware compatibility</a>
          </p>
        </div>
      </section>
    </main>
  )
}

function ResourceLink({ title, type, duration }: {
  title: string
  type: 'video' | 'article' | 'paper'
  duration: string
}) {
  const icon = type === 'video' ? '🎥' : type === 'paper' ? '📄' : '📄'
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 transition">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="font-medium text-gray-700">{title}</p>
          <p className="text-sm text-gray-500">{duration}</p>
        </div>
      </div>
    </div>
  )
}
