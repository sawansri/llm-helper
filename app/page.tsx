import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find the Perfect LLM for Your Hardware
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Get personalized model recommendations based on your GPU, RAM, and use case.
            Start self-hosting LLMs today.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/hardware"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
            >
              Get Started
            </Link>
            <Link
              href="/learn"
              className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-lg font-semibold transition"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            title="Hardware Detection"
            description="Automatically detect or manually enter your system specs"
          />
          <FeatureCard
            title="Smart Recommendations"
            description="Get models that will actually run on your hardware"
          />
          <FeatureCard
            title="Educational Resources"
            description="Learn about quantization, VRAM, and self-hosting"
          />
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
