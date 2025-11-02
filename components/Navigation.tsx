import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            LLM Helper
          </Link>
          <div className="flex gap-6">
            <Link href="/hardware" className="hover:text-blue-400 transition">
              Hardware
            </Link>
            <Link href="/recommendations" className="hover:text-blue-400 transition">
              Recommendations
            </Link>
            <Link href="/learn" className="hover:text-blue-400 transition">
              Learn
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
