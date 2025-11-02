# LLM Model Scraper

Automatically fetch and update your LLM models database from HuggingFace.

## Setup

1. **Install dependencies:**
```bash
cd scripts/model_scraper
pip install -r requirements.txt
```

2. **(Optional) Get HuggingFace API token:**
   - Go to https://huggingface.co/settings/tokens
   - Create a read token
   - Use with `--token YOUR_TOKEN` for higher rate limits

## Usage

### 1. Search for Models

Search HuggingFace and interactively choose which models to add:

```bash
python update_models.py search "llama" --interactive
```

Search and automatically add all results:

```bash
python update_models.py search "mistral" --add-all --limit 5
```

Filter by tags and task:

```bash
python update_models.py search "code" --task text-generation --sort downloads --limit 10
```

### 2. Add a Specific Model

Add a model by its full HuggingFace ID:

```bash
python update_models.py add meta-llama/Llama-3-8B
python update_models.py add mistralai/Mistral-7B-v0.1
python update_models.py add microsoft/Phi-3-mini-4k-instruct
```

### 3. Get Popular Models

Fetch the most downloaded models:

```bash
python update_models.py popular --limit 20
```

### 4. List Current Models

See what's already in your database:

```bash
python update_models.py list
```

## What Gets Extracted

The scraper pulls real data from HuggingFace API:

✅ **Model Name** - From model card
✅ **Description** - From model card or README
✅ **Parameter Count** - Extracted from model ID/name (e.g., "7B", "13B")
✅ **Context Window** - From model config (`max_position_embeddings`)
✅ **License** - From model card
✅ **Provider** - Organization/author name
✅ **Use Cases** - Inferred from tags
✅ **Variants** - GGUF files with quantization info (Q4_K_M, Q5_K_M, etc.)
  - File sizes (actual from repository)
  - VRAM requirements (calculated from file size)
  - RAM requirements (calculated from VRAM)

## Example Workflow

```bash
# 1. Search for Llama models
python update_models.py search "llama-3" --interactive

# Output:
# Found 10 models:
#
# 1. meta-llama/Meta-Llama-3-8B
#    Downloads: 1,234,567 | Likes: 4,321
#    Parameters: 8B | Variants: 3
#
# 2. meta-llama/Meta-Llama-3-70B
#    Downloads: 987,654 | Likes: 3,210
#    Parameters: 70B | Variants: 2
#
# Add models to database?
#   a = Add all
#   n = Add none
#   1,2,3 = Add specific models (comma-separated)
#
# Your choice: 1,2
#
#   ✓ Added 'Meta Llama 3 8B' (8B)
#   ✓ Added 'Meta Llama 3 70B' (70B)
# ✓ Saved 7 models to public/data/models.json

# 2. Add a specific coding model
python update_models.py add deepseek-ai/deepseek-coder-6.7b-instruct

# 3. List what you have
python update_models.py list

# 4. Push to GitHub
git add public/data/models.json
git commit -m "Update models database with new LLMs"
git push
```

## Model Data Structure

Each model is saved in this format:

```json
{
  "id": "meta-llama-llama-3-8b",
  "name": "Llama 3 8B",
  "description": "Meta's latest general-purpose model...",
  "parameters": "8B",
  "variants": [
    {
      "quantization": "Q4_K_M",
      "vramRequired": 6,
      "ramRequired": 8,
      "fileSize": 4.7,
      "contextWindow": 8192
    }
  ],
  "useCases": ["chat", "general", "coding"],
  "provider": "meta-llama",
  "license": "Llama 3 Community License",
  "links": {
    "huggingFace": "https://huggingface.co/meta-llama/Meta-Llama-3-8B",
    "ollama": "ollama run llama3"
  },
  "tags": ["conversational", "text-generation"]
}
```

## Advanced Usage

### With API Token (Higher Rate Limits)

```bash
export HF_TOKEN="hf_your_token_here"
python update_models.py search "mistral" --token $HF_TOKEN
```

### Search by Specific Criteria

```bash
# Coding models
python update_models.py search "code" --task text-generation --sort downloads

# Small models (good for low-end hardware)
python update_models.py search "3b OR 7b" --limit 15

# Recently updated models
python update_models.py search "" --sort createdAt --limit 10
```

### Batch Update

Create a script to update multiple model categories:

```bash
#!/bin/bash
# update_all_models.sh

echo "Updating coding models..."
python update_models.py search "code llama OR deepseek coder" --add-all --limit 5

echo "Updating chat models..."
python update_models.py search "mistral OR llama-3" --add-all --limit 5

echo "Updating small models..."
python update_models.py search "phi-3 OR gemma" --add-all --limit 3

echo "Done! Committing changes..."
git add ../../public/data/models.json
git commit -m "Automated model database update"
```

## Troubleshooting

**Q: Getting rate limited?**
A: Use a HuggingFace API token with `--token` flag

**Q: Model has no variants?**
A: The model may not have GGUF files. The scraper will create a default Q4_K_M variant based on parameter count.

**Q: File sizes seem wrong?**
A: File sizes come directly from HuggingFace repository. VRAM/RAM are calculated with overhead (~25% for VRAM, ~20% more for RAM).

**Q: Want to exclude certain models?**
A: Use interactive mode (`--interactive`) to choose which models to add.

## API Reference

### HuggingFace API

The scraper uses:
- `/api/models` - Search and list models
- `/api/models/{model_id}` - Get model details
- `/api/models/{model_id}/tree/main` - List files in repository

Documentation: https://huggingface.co/docs/hub/api
