     Example Usage Session

     python scripts/discover_models.py

     # Quick search
     python scripts/discover_models.py --size medium --category coding --limit 10

     # With filters
     python scripts/discover_models.py \
       --size small \
       --category chat \
       --min-downloads 500000 \
       --has-gguf \
       --limit 20

     # Load previous search
     python scripts/discover_models.py --load coding_models_search.json

     ---
     Files to Create

     1. scripts/discover_models.py (400 lines) - Main interactive script
     2. scripts/hf_search.py (200 lines) - HuggingFace search logic
     3. scripts/model_builder.py (300 lines) - Build model objects
     4. scripts/validator.py (100 lines) - Schema validation
     5. scripts/requirements.txt - Dependencies
     6. scripts/README.md - Documentation & examples

     ---
     Benefits

     ✅ Discoverable: Find models you didn't know existed
     ✅ Interactive: Select exactly what you want
     ✅ Flexible: Filter by size, category, popularity
     ✅ Safe: Review before adding, with edit mode
     ✅ Fast: Search HF's entire catalog in seconds
     ✅ Smart: Auto-detects quantizations and estimates requirements
