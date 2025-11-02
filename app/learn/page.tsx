import Link from 'next/link'

export default function LearnPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Learn About Self-Hosting LLMs</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <GuideCard
          title="Getting Started"
          description="New to self-hosting? Start here to understand the basics."
          href="/learn/getting-started"
        />
        <GuideCard
          title="Understanding Quantization"
          description="Learn about Q4, Q5, Q8 and what they mean for performance."
          href="/learn/quantization"
        />
        <GuideCard
          title="VRAM vs RAM"
          description="Understand memory requirements and how they affect model performance."
          href="/learn/memory"
        />
        <GuideCard
          title="Setup Guides"
          description="Step-by-step guides for Ollama, LM Studio, and more."
          href="/learn/tools"
        />
      </div>
    </main>
  )
}

function GuideCard({ title, description, href }: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-2 border-transparent hover:border-blue-400"
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  )
}
