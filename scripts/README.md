# HuggingFace Model Discovery Tool

Discover and add LLM models from HuggingFace Hub to your LLM Helper application.

## Features

✅ **Discoverable**: Find models you didn't know existed
✅ **Interactive**: Select exactly what you want
✅ **Flexible**: Filter by size, category, popularity
✅ **Safe**: Review before adding, with validation
✅ **Fast**: Search HF's entire catalog in seconds
✅ **Smart**: Auto-detects quantizations and estimates requirements

## Setup

### 1. Install Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

**Note:** Compatible with huggingface_hub v0.20.0+. The scripts use the modern API (v0.24.0+) without deprecated ModelFilter.

### 2. (Optional) Authenticate with HuggingFace

For better rate limits and access to gated models:

```bash
huggingface-cli login
# Or set environment variable
export HUGGINGFACE_HUB_TOKEN="your_token_here"
```

## Usage

### Basic Search

Search for models and add them interactively:

```bash
python discover_models.py
```

### Search with Filters

#### By Size
```bash
# Small models (0-5B parameters)
python discover_models.py --size small --limit 10

# Medium models (5-15B parameters)
python discover_models.py --size medium --limit 10

# Large models (15-40B parameters)
python discover_models.py --size large --limit 10

# Extra large models (40B+ parameters)
python discover_models.py --size xl --limit 5
```

#### By Category
```bash
# Coding models
python discover_models.py --category coding --limit 10

# Chat models
python discover_models.py --category chat --limit 10

# Writing models
python discover_models.py --category writing --limit 10

# Reasoning/Math models
python discover_models.py --category reasoning --limit 10

# Multilingual models
python discover_models.py --category multilingual --limit 10
```

#### Combined Filters
```bash
# Small coding models with GGUF files
python discover_models.py \
  --size small \
  --category coding \
  --has-gguf \
  --limit 10

# Popular chat models (500K+ downloads)
python discover_models.py \
  --category chat \
  --min-downloads 500000 \
  --limit 15

# High-quality models (100+ likes)
python discover_models.py \
  --size medium \
  --min-likes 100 \
  --limit 20
```

### Advanced Usage

#### Save Search Results
Save search results to review later:

```bash
python discover_models.py \
  --size medium \
  --category coding \
  --save coding_models_search.json
```

#### Load Previous Search
Load and continue from saved search results:

```bash
python discover_models.py --load coding_models_search.json
```

#### Auto-Add Mode
Automatically add all search results without interactive prompts:

```bash
python discover_models.py \
  --size small \
  --category chat \
  --limit 5 \
  --auto-add
```

#### Validate Existing Models
Validate your existing models.json file:

```bash
python discover_models.py --validate-only
```

#### Custom Output Path
Save to a different models file:

```bash
python discover_models.py \
  --size small \
  --output my_models.json
```

## Interactive Mode

When running interactively, the tool will:

1. **Display Search Results** - Show a table with model info
2. **Select Models** - Choose which models to add (e.g., `1,3,5` or `all`)
3. **Preview Each Model** - See detailed information before adding
4. **Edit (Optional)** - Modify model fields if needed
5. **Validate** - Check schema compliance
6. **Merge** - Add to existing models.json with duplicate checking

## File Structure

```
scripts/
├── discover_models.py      # Main interactive CLI
├── hf_search.py            # HuggingFace search logic
├── model_builder.py        # Build model objects from HF data
├── validator.py            # Schema validation
├── requirements.txt        # Python dependencies
├── README.md              # This file
└── QUANTIZATION_GUIDE.md  # Quantization formats reference
```

## Model Schema

Models are validated against this schema:

```json
{
  "id": "string (lowercase, alphanumeric with hyphens)",
  "name": "string",
  "description": "string",
  "parameters": "string (e.g., '7B', '13B')",
  "provider": "string",
  "license": "string",
  "useCases": ["string"],
  "tags": ["string"],
  "variants": [
    {
      "quantization": "string (e.g., 'Q4_K_M')",
      "vramRequired": "number (GB)",
      "ramRequired": "number (GB)",
      "fileSize": "number (GB)",
      "contextWindow": "number (tokens)"
    }
  ],
  "links": {
    "huggingFace": "string (URL)",
    "ollama": "string (optional)",
    "website": "string (optional)"
  },
  "qualityMetrics": {
    "overallRating": "number (0-5)",
    "mmlu": "number (optional, 0-100)",
    "humanEval": "number (optional, 0-100)",
    "mt_bench": "number (optional, 0-10)"
  },
  "performanceProfile": {
    "inferenceSpeed": "string ('fast' | 'medium' | 'slow')",
    "qualityLevel": "string ('high' | 'medium' | 'low')"
  },
  "recommendedContexts": {
    "useCase": "number (tokens)"
  }
}
```

## Examples

### Example 1: Find Small Chat Models with GGUF

```bash
python discover_models.py \
  --size small \
  --category chat \
  --has-gguf \
  --min-downloads 100000 \
  --limit 10
```

This will search for:
- Small models (0-5B parameters)
- Optimized for chat
- With GGUF quantization files available
- At least 100K downloads
- Show top 10 results

### Example 2: Discover Popular Coding Models

```bash
python discover_models.py \
  --category coding \
  --min-likes 200 \
  --limit 15
```

This finds:
- Models tagged for coding/programming
- At least 200 likes on HuggingFace
- Top 15 most popular

### Example 3: Save and Review Later

```bash
# Save search results
python discover_models.py \
  --size medium \
  --category general \
  --save review_later.json

# Review and add later
python discover_models.py --load review_later.json
```

### Example 4: Batch Add Models

```bash
# Auto-add small, popular models
python discover_models.py \
  --size small \
  --min-downloads 500000 \
  --limit 5 \
  --auto-add
```

## Troubleshooting

### Rate Limits
If you hit HuggingFace rate limits:
```bash
# Authenticate to get higher limits
huggingface-cli login
```

### Validation Errors
If models fail validation:
```bash
# Check existing models
python discover_models.py --validate-only

# View detailed error messages
```

### Missing Dependencies
```bash
# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

## Tips

- **Start small**: Use `--limit 5` to test before adding many models
- **Filter wisely**: Combine `--min-downloads` and `--has-gguf` for quality results
- **Save searches**: Use `--save` for expensive searches to review later
- **Validate often**: Run `--validate-only` after manual edits to models.json
- **Backup exists**: The tool automatically creates `.backup` files before saving

## Quantization Formats

The tool supports a wide range of quantization formats including:
- **GGUF formats**: Q2_K through Q8_0 with K variants (S/M/L)
- **Standard formats**: FP16, FP32, BF16, INT4, INT8
- **Advanced formats**: AWQ, GPTQ with variants

See [QUANTIZATION_GUIDE.md](QUANTIZATION_GUIDE.md) for detailed information on:
- All supported formats and their specifications
- Size and quality trade-offs
- Recommendations by model size
- VRAM requirements table
- Quick selection guide

## Support

For issues or questions:
- Check validation errors with `--validate-only`
- Review the model schema above
- Consult [QUANTIZATION_GUIDE.md](QUANTIZATION_GUIDE.md) for quantization info
- Inspect saved search results (JSON files)
- Check HuggingFace model cards for accurate information
