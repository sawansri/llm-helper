# LLM Helper

A Next.js web application that helps users find the best Large Language Models (LLMs) for their specific hardware capabilities. The app detects system specs, recommends compatible models with appropriate quantizations, and provides detailed resource requirements.

**Live Site:** [llm.sawansri.com](https://llm.sawansri.com)

## Features

### 🖥️ Hardware Detection
- Automatic detection of GPU (model and VRAM), RAM, CPU, and OS
- Local GPU database with 1000+ GPU specifications
- Manual hardware input fallback for unsupported systems

### 🤖 Smart Model Recommendations
- Curated database of popular LLM models (Llama, Mistral, Phi, DeepSeek, etc.)
- Intelligent scoring system that considers:
  - VRAM/RAM utilization and headroom
  - Quantization efficiency (Q4_K_M, Q5_K_M, Q8_0, FP16)
  - Hardware compatibility
- Real-time filtering by use case, resource limits, and context window

### 🎛️ Quantization Selector (v2.0)
**New Feature:** Models with multiple quantizations are now grouped into single cards with an interactive selector.

**Before:** Each quantization variant appeared as a separate card, creating visual clutter:
- Llama 3 8B (Q4_K_M) - 100 score
- Llama 3 8B (Q5_K_M) - 95 score
- Llama 3 8B (Q8_0) - 90 score

**After:** One card per model with clickable quantization options:
- Users can toggle between Q4_K_M, Q5_K_M, Q8_0
- Specs update in real-time (VRAM, RAM, file size, scores)
- Best-fit quantization pre-selected by default
- Clearly shows the quality/resource tradeoff

**Benefits:**
- ~60% reduction in page clutter (5 model cards instead of 15+ entries)
- Educational: Users understand quantization tradeoffs
- Better UX: Easier to compare and make informed decisions

### 📊 Detailed Model Cards
Each recommendation shows:
- Model name, provider, and parameter count
- Compatibility score and fit reason
- Resource requirements (VRAM, RAM, file size, context window)
- Performance warnings (if applicable)
- Use cases and tags
- Direct links to HuggingFace and Ollama commands

### 🎓 Educational Resources
- Learn page with guides on:
  - What are LLMs and how they work
  - Understanding quantization (Q4 vs Q5 vs Q8 vs FP16)
  - Hardware requirements for different model sizes
  - How to run models locally with Ollama

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** GitHub Pages → Custom Domain (llm.sawansri.com)
- **Build:** Static export optimized for GitHub Pages hosting

## Project Structure

```
llm-helper/
├── app/                      # Next.js app router pages
│   ├── page.tsx             # Home/landing page
│   ├── hardware/            # Hardware detection page
│   ├── recommendations/     # Model recommendations page
│   └── learn/               # Educational content page
├── components/
│   ├── hardware/            # Hardware detection components
│   └── models/
│       └── ModelCard.tsx    # Model card with quantization selector
├── lib/
│   └── types.ts             # TypeScript interfaces
├── utils/
│   ├── recommendationEngine.ts  # Core recommendation logic
│   └── hardwareDetection.ts     # GPU/system detection
├── public/
│   └── data/
│       ├── models.json      # Curated LLM model database
│       └── gpu_database.json  # GPU specifications (1000+)
└── CNAME                    # Custom domain configuration
```

## Key Implementation Details

### Recommendation Engine (`utils/recommendationEngine.ts`)

**Interfaces:**
```typescript
interface VariantRecommendation {
  variant: ModelVariant
  score: number
  fitReason: string
  warnings?: string[]
}

interface RecommendedModel {
  model: LLMModel
  variants: VariantRecommendation[]  // All compatible quantizations
  defaultVariant: ModelVariant        // Best-fit quantization
  score: number
  fitReason: string
  warnings?: string[]
}
```

**Scoring Algorithm:**
1. Starts at 100 points
2. Penalizes high VRAM utilization (>90%: -20, >70%: -10)
3. Penalizes high RAM utilization (>80%: -15, >60%: -5)
4. Bonuses for efficient quantization (Q4: +10, Q5: +5)
5. Groups all compatible variants per model
6. Selects best-scoring variant as default

### Model Card Component (`components/models/ModelCard.tsx`)

- Client component with React state for quantization selection
- Automatically shows/hides selector based on variant count
- Real-time UI updates when switching quantizations
- Responsive design with Tailwind CSS

### Data Management

**Model Data (`public/data/models.json`):**
- 5 curated models with multiple variants each
- Includes metadata: provider, license, use cases, tags, links
- Variants specify: quantization, VRAM, RAM, file size, context window

**GPU Database (`public/data/gpu_database.json`):**
- 1000+ GPU specifications scraped from various sources
- Includes VRAM amounts for accurate hardware detection

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# The app will be available at http://localhost:3000
```

### Deployment

This project is configured for static export to GitHub Pages with a custom domain:

1. **Build:** `npm run build` generates static files in `out/`
2. **CNAME:** File specifies custom domain `llm.sawansri.com`
3. **GitHub Pages:** Configured to serve from `gh-pages` branch
4. **DNS:** CNAME record points to GitHub Pages servers

**Configuration (`next.config.ts`):**
```typescript
const nextConfig: NextConfig = {
  output: 'export',  // Static export for GitHub Pages
  images: {
    unoptimized: true  // Required for static export
  }
}
```

## Roadmap

### Completed
- ✅ Hardware detection system
- ✅ Model recommendation engine
- ✅ Quantization selector (v2.0)
- ✅ Custom domain hosting
- ✅ Educational resources

### Planned
- [ ] Add more models (Qwen, Gemma, Code Llama)
- [ ] Support for alternative quantization formats (GGUF, AWQ, GPTQ)
- [ ] Model performance benchmarks
- [ ] Save hardware profiles to localStorage
- [ ] Comparison view for multiple models
- [ ] Dark mode support

## Contributing

Contributions are welcome! Areas for improvement:
- Adding more models to the database
- Improving GPU detection accuracy
- Enhancing educational content
- UI/UX improvements

## License

MIT License - feel free to use for your own projects

## Acknowledgments

- Model data sourced from HuggingFace and Ollama
- GPU specifications compiled from manufacturer databases
- Built with Next.js and Tailwind CSS
