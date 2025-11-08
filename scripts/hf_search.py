"""
HuggingFace Model Search Module

Searches HuggingFace Hub for models based on criteria like size, category, and popularity.
"""

from huggingface_hub import HfApi, ModelFilter
from typing import List, Dict, Optional, Tuple
import re

# Category mappings
CATEGORIES = {
    "chat": {
        "tags": ["conversational", "chat", "assistant", "instruct"],
        "keywords": ["chat", "assistant", "instruct", "dialogue"]
    },
    "coding": {
        "tags": ["code", "programming", "coding", "codegen"],
        "keywords": ["code", "coder", "coding", "program", "dev"]
    },
    "writing": {
        "tags": ["creative", "writing", "story", "content"],
        "keywords": ["write", "creative", "story", "author"]
    },
    "reasoning": {
        "tags": ["reasoning", "math", "logic", "thinking"],
        "keywords": ["reason", "math", "logic", "think", "analyz"]
    },
    "multilingual": {
        "tags": ["multilingual", "translation", "international"],
        "keywords": ["multilingual", "translate", "language"]
    },
    "general": {
        "tags": ["text-generation", "general-purpose"],
        "keywords": ["general", "versatile", "multi"]
    }
}

# Size ranges in billions of parameters
SIZE_RANGES = {
    "small": (0, 5),      # 0-5B
    "medium": (5, 15),    # 5-15B
    "large": (15, 40),    # 15-40B
    "xl": (40, 200),      # 40B+
    "any": (0, 1000)      # No limit
}


def extract_parameter_count(model_id: str, model_info: any) -> Optional[float]:
    """
    Extract parameter count in billions from model ID or metadata.

    Args:
        model_id: HuggingFace model ID
        model_info: Model info object from HF API

    Returns:
        Parameter count in billions, or None if not found
    """
    # Try to extract from model ID (e.g., "llama-7b", "mistral-7B-instruct")
    patterns = [
        r'(\d+(?:\.\d+)?)[bB]',  # Matches "7b", "7B", "3.8B"
        r'-(\d+)-',               # Matches "-7-", "-13-"
        r'_(\d+)_',               # Matches "_7_", "_13_"
    ]

    model_id_lower = model_id.lower()
    for pattern in patterns:
        match = re.search(pattern, model_id_lower)
        if match:
            return float(match.group(1))

    # Try to extract from model card or config
    if hasattr(model_info, 'cardData') and model_info.cardData:
        card_text = str(model_info.cardData).lower()
        match = re.search(r'(\d+(?:\.\d+)?)\s*billion', card_text)
        if match:
            return float(match.group(1))

        match = re.search(r'(\d+(?:\.\d+)?)[bB]\s*param', card_text)
        if match:
            return float(match.group(1))

    # If all else fails, estimate from model size (very rough)
    if hasattr(model_info, 'siblings') and model_info.siblings:
        # Find largest file size as proxy
        max_size = 0
        for sibling in model_info.siblings:
            if hasattr(sibling, 'size') and sibling.size:
                max_size = max(max_size, sibling.size)

        if max_size > 0:
            # Very rough estimate: 1B params ≈ 2GB in FP16
            return (max_size / (1024**3)) / 2

    return None


def filter_by_size(models: List[any], size_range: str) -> List[any]:
    """
    Filter models by parameter count range.

    Args:
        models: List of model info objects
        size_range: One of "small", "medium", "large", "xl", "any"

    Returns:
        Filtered list of models
    """
    min_size, max_size = SIZE_RANGES.get(size_range, SIZE_RANGES["any"])

    filtered = []
    for model in models:
        param_count = extract_parameter_count(model.modelId, model)
        if param_count and min_size <= param_count <= max_size:
            # Add parameter count to model object for later use
            model.params = param_count
            filtered.append(model)

    return filtered


def matches_category(model: any, category: str) -> bool:
    """
    Check if model matches the specified category.

    Args:
        model: Model info object
        category: Category name (chat, coding, writing, etc.)

    Returns:
        True if model matches category
    """
    if category == "any":
        return True

    category_def = CATEGORIES.get(category, {})
    category_tags = set(category_def.get("tags", []))
    category_keywords = category_def.get("keywords", [])

    # Check model tags
    if hasattr(model, 'tags') and model.tags:
        model_tags = set(tag.lower() for tag in model.tags)
        if model_tags & category_tags:  # Intersection
            return True

    # Check model ID and description
    model_text = model.modelId.lower()
    if hasattr(model, 'cardData') and model.cardData:
        model_text += " " + str(model.cardData).lower()

    for keyword in category_keywords:
        if keyword in model_text:
            return True

    return False


def search_models(
    size_range: str = "any",
    category: str = "any",
    limit: int = 10,
    min_downloads: Optional[int] = None,
    min_likes: Optional[int] = None,
    has_gguf: bool = False,
    language: Optional[str] = None
) -> List[Dict]:
    """
    Search HuggingFace Hub for models matching criteria.

    Args:
        size_range: Model size ("small", "medium", "large", "xl", "any")
        category: Model category ("chat", "coding", "writing", etc.)
        limit: Maximum number of results
        min_downloads: Minimum download count
        min_likes: Minimum likes count
        has_gguf: Only return models with GGUF files
        language: Filter by language (e.g., "en", "zh")

    Returns:
        List of model dictionaries with metadata
    """
    api = HfApi()

    # Build search filters
    model_filter = ModelFilter(
        task="text-generation",
        library="transformers"
    )

    # Add language filter if specified
    if language:
        model_filter.language = language

    # Fetch more models than needed (we'll filter by size and category)
    search_limit = limit * 10  # Fetch 10x more to account for filtering

    try:
        # Search models sorted by downloads (popularity)
        models = api.list_models(
            filter=model_filter,
            sort="downloads",
            direction=-1,
            limit=search_limit,
            full=True  # Get full model info
        )

        models_list = list(models)

        # Filter by size
        if size_range != "any":
            models_list = filter_by_size(models_list, size_range)
        else:
            # Still extract parameter counts
            for model in models_list:
                model.params = extract_parameter_count(model.modelId, model)

        # Filter by category
        if category != "any":
            models_list = [m for m in models_list if matches_category(m, category)]

        # Filter by downloads
        if min_downloads:
            models_list = [m for m in models_list if m.downloads >= min_downloads]

        # Filter by likes
        if min_likes:
            models_list = [m for m in models_list if m.likes >= min_likes]

        # Filter by GGUF availability (check if repo has .gguf files)
        if has_gguf:
            gguf_models = []
            for model in models_list:
                if has_gguf_files(model.modelId, api):
                    gguf_models.append(model)
            models_list = gguf_models

        # Limit results
        models_list = models_list[:limit]

        # Convert to dictionaries with relevant info
        results = []
        for model in models_list:
            results.append({
                "modelId": model.modelId,
                "params": getattr(model, 'params', None),
                "downloads": model.downloads,
                "likes": model.likes,
                "tags": model.tags[:5] if model.tags else [],
                "lastModified": model.lastModified,
                "info": model  # Keep full info for later use
            })

        return results

    except Exception as e:
        print(f"Error searching models: {e}")
        return []


def has_gguf_files(model_id: str, api: HfApi) -> bool:
    """
    Check if a model repository contains GGUF files.

    Args:
        model_id: HuggingFace model ID
        api: HfApi instance

    Returns:
        True if model has GGUF files
    """
    try:
        files = api.list_repo_files(model_id)
        return any(f.endswith('.gguf') for f in files)
    except:
        return False


def format_number(num: int) -> str:
    """Format large numbers with K/M suffix."""
    if num >= 1_000_000:
        return f"{num / 1_000_000:.1f}M"
    elif num >= 1_000:
        return f"{num / 1_000:.1f}K"
    else:
        return str(num)
