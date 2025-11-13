import Link from 'next/link'

export default function LearnPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Learn About LLMs</h1>
      <p className="text-lg text-gray-600 mb-12">
        Explore how large language models work and how to run them on your own hardware.
      </p>

      {/* Understanding LLMs Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <span>📚</span>
          <span>Understanding LLMs</span>
        </h2>
        <p className="text-gray-600 mb-6">Learn the fundamentals of how large language models work</p>

        <div className="grid md:grid-cols-2 gap-6">
          <GuideCard
            title="How LLMs Work"
            description="Learn the fundamentals of large language models, from tokens to predictions."
            href="/learn/how-llms-work"
          />
          <GuideCard
            title="Architecture & Training"
            description="Deep dive into transformer architecture, attention mechanisms, and training."
            href="/learn/architecture"
          />
          <GuideCard
            title="Prompting & Best Practices"
            description="Master the art of prompting and get the best results from LLMs."
            href="/learn/prompting"
          />
          <GuideCard
            title="Limitations & Safety"
            description="Understand the limitations, biases, and safety considerations of LLMs."
            href="/learn/safety"
          />
        </div>
      </section>

      {/* Self-Hosting Section */}
      <section>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <span>🖥️</span>
          <span>Self-Hosting LLMs</span>
        </h2>
        <p className="text-gray-600 mb-6">Practical guides for running LLMs on your own hardware</p>

        <div className="grid md:grid-cols-2 gap-6">
          <GuideCard
            title="Getting Started"
            description="New to self-hosting? Start here to understand the basics."
            href="/learn/getting-started"
          />
          <GuideCard
            title="Hardware Requirements"
            description="Learn what hardware you need for different model sizes."
            href="/learn/hardware"
          />
          <GuideCard
            title="Understanding Quantization"
            description="Learn about Q4, Q5, Q8 and what they mean for performance."
            href="/learn/quantization"
          />
          <GuideCard
            title="Setup Tools"
            description="Step-by-step guides for Ollama, LM Studio, and more."
            href="/learn/tools"
          />
          <GuideCard
            title="Optimization & Troubleshooting"
            description="Tips for better performance and solving common issues."
            href="/learn/optimization"
          />
        </div>
      </section>
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
