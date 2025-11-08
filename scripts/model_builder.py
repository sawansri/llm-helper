"""
Model Builder - Build LLM model objects from HuggingFace data.

Converts HuggingFace search results into properly formatted model objects
that match the application schema.
"""

from typing import Dict, List, Optional, Any
from huggingface_hub import HfApi
import re


def build_model_from_hf(
    model_id: str,
    hf_info: Any,
    category: Optional[str] = None,
    estimated_params: Optional[float] = None
) -> Dict[str, Any]:
    """
    Build a model object from HuggingFace data.

    Args:
        model_id: HuggingFace model ID (e.g., "meta-llama/Meta-Llama-3-8B")
        hf_info: Model info object from HF API
        category: Primary category hint (chat, coding, etc.)
        estimated_params: Parameter count in billions if known

    Returns:
        Dictionary conforming to LLMModel schema
    """
    # Extract model name
    name = extract_model_name(model_id, hf_info)

    # Build base model structure
    model = {
        "id": generate_model_id(name),
        "name": name,
        "description": extract_description(hf_info),
        "parameters": format_parameters(estimated_params),
        "provider": extract_provider(model_id),
        "license": extract_license(hf_info),
        "useCases": infer_use_cases(hf_info, category),
        "tags": extract_tags(hf_info),
        "variants": [],  # Will be populated separately
        "links": {
            "huggingFace": f"https://huggingface.co/{model_id}"
        }
    }

    # Add optional fields
    quality_metrics = estimate_quality_metrics(hf_info)
    if quality_metrics:
        model["qualityMetrics"] = quality_metrics

    performance_profile = estimate_performance_profile(estimated_params)
    if performance_profile:
        model["performanceProfile"] = performance_profile

    recommended_contexts = estimate_recommended_contexts(model["useCases"], estimated_params)
    if recommended_contexts:
        model["recommendedContexts"] = recommended_contexts

    # Try to find Ollama command
    ollama_cmd = find_ollama_command(name, model_id)
    if ollama_cmd:
        model["links"]["ollama"] = ollama_cmd

    return model


def build_variants(
    model_id: str,
    params: float,
    context_window: int = 8192,
    has_gguf: bool = False
) -> List[Dict[str, Any]]:
    """
    Generate model variants with different quantization levels.

    Args:
        model_id: Model ID
        params: Parameter count in billions
        context_window: Context window size in tokens
        has_gguf: Whether GGUF files are available

    Returns:
        List of variant dictionaries
    """
    variants = []

    # Determine appropriate quantization levels based on model size
    if params < 3:
        # Small models (< 3B): fewer quantization options
        quantizations = ["Q4_K_M", "Q5_K_M", "Q8_0"]
    elif params < 10:
        # Medium models (3-10B): standard options
        quantizations = ["Q4_0", "Q4_K_M", "Q5_K_M", "Q8_0"]
    elif params < 20:
        # Large models (10-20B): include more aggressive quantization
        quantizations = ["Q3_K_M", "Q4_0", "Q4_K_M", "Q5_K_M", "Q6_K", "Q8_0"]
    elif params < 40:
        # Very large models (20-40B): add Q2_K for extreme compression
        quantizations = ["Q2_K", "Q3_K_M", "Q4_0", "Q4_K_M", "Q5_K_M", "Q6_K", "Q8_0"]
    else:
        # Extra large models (40B+): full range with S/M variants
        quantizations = ["Q2_K", "Q3_K_S", "Q3_K_M", "Q4_0", "Q4_K_S", "Q4_K_M", "Q5_K_S", "Q5_K_M", "Q6_K", "Q8_0"]

    for quant in quantizations:
        variant = estimate_variant_specs(params, quant, context_window)
        variants.append(variant)

    return variants


def estimate_variant_specs(
    params: float,
    quantization: str,
    context_window: int
) -> Dict[str, Any]:
    """
    Estimate resource requirements for a model variant.

    Args:
        params: Parameter count in billions
        quantization: Quantization type (Q4_K_M, Q5_K_M, Q8_0, etc.)
        context_window: Context window in tokens

    Returns:
        Variant dictionary with resource estimates
    """
    # Bits per parameter for different quantizations
    # Based on GGUF quantization specs and common formats
    bits_map = {
        # GGUF quantizations
        "Q2_K": 2.5,
        "Q3_K_S": 3.0,
        "Q3_K_M": 3.5,
        "Q3_K_L": 3.75,
        "Q4_0": 4.0,
        "Q4_1": 4.5,
        "Q4_K_S": 4.0,
        "Q4_K_M": 4.5,
        "Q5_0": 5.0,
        "Q5_1": 5.5,
        "Q5_K_S": 5.0,
        "Q5_K_M": 5.5,
        "Q6_K": 6.5,
        "Q8_0": 8.5,
        # Standard formats
        "FP16": 16,
        "FP32": 32,
        "BF16": 16,
        "INT4": 4,
        "INT8": 8,
        # AWQ/GPTQ (approximate)
        "AWQ": 4.0,
        "GPTQ": 4.0,
        "GPTQ-4bit": 4.0,
        "GPTQ-8bit": 8.0,
        "W4A16": 4.5,
        # Full precision
        "Full": 16,
        "full": 16,
        "None": 16,
        "none": 16
    }

    bits = bits_map.get(quantization, 4.5)  # Default to Q4_K_M equivalent

    # Calculate file size (GB)
    # Formula: (params_in_billions * bits_per_param) / 8 bits_per_byte / 1024^3
    file_size = round((params * bits) / 8, 1)

    # Estimate VRAM required (slightly higher than file size for overhead)
    vram_required = round(file_size * 1.2)

    # Estimate RAM required (for context + model overhead)
    # Base: ~1.5x model size, plus context window overhead
    context_overhead = (context_window * 2) / (1024 * 1024)  # Rough estimate in GB
    ram_required = round(file_size * 1.5 + context_overhead)

    return {
        "quantization": quantization,
        "vramRequired": max(1, vram_required),
        "ramRequired": max(2, ram_required),
        "fileSize": max(0.1, file_size),
        "contextWindow": context_window
    }


def extract_model_name(model_id: str, hf_info: Any) -> str:
    """Extract a clean model name from HuggingFace ID."""
    # Try to get from card data first
    if hasattr(hf_info, 'cardData') and hf_info.cardData:
        card_data = hf_info.cardData
        if hasattr(card_data, 'get') and card_data.get('model_name'):
            return card_data['model_name']

    # Fall back to parsing the model_id
    # e.g., "meta-llama/Meta-Llama-3-8B" -> "Llama 3 8B"
    parts = model_id.split('/')
    name = parts[-1] if len(parts) > 1 else model_id

    # Clean up the name
    name = re.sub(r'-instruct|-chat|-base', '', name, flags=re.IGNORECASE)
    name = name.replace('-', ' ').replace('_', ' ')

    return name.strip()


def generate_model_id(name: str) -> str:
    """Generate a clean model ID from name."""
    # Convert to lowercase, replace spaces with hyphens
    model_id = name.lower()
    model_id = re.sub(r'[^a-z0-9\s-]', '', model_id)
    model_id = re.sub(r'\s+', '-', model_id)
    model_id = re.sub(r'-+', '-', model_id)
    return model_id.strip('-')


def extract_description(hf_info: Any) -> str:
    """Extract or generate model description."""
    # Try to get from card data
    if hasattr(hf_info, 'cardData') and hf_info.cardData:
        if hasattr(hf_info.cardData, 'get'):
            desc = hf_info.cardData.get('description') or hf_info.cardData.get('base_model')
            if desc:
                return desc[:200]  # Limit length

    # Generate generic description
    return "Large language model for text generation tasks"


def extract_provider(model_id: str) -> str:
    """Extract provider from model ID."""
    providers_map = {
        "meta-llama": "Meta",
        "mistralai": "Mistral AI",
        "google": "Google",
        "microsoft": "Microsoft",
        "tiiuae": "TII UAE",
        "01-ai": "01.AI",
        "qwen": "Alibaba",
        "deepseek": "DeepSeek",
        "anthropic": "Anthropic",
        "openai": "OpenAI"
    }

    org = model_id.split('/')[0].lower()

    for key, value in providers_map.items():
        if key in org:
            return value

    # Capitalize first letter of org name
    return org.replace('-', ' ').title()


def extract_license(hf_info: Any) -> str:
    """Extract license information."""
    # Try to get from card data
    if hasattr(hf_info, 'cardData') and hf_info.cardData:
        if hasattr(hf_info.cardData, 'get'):
            license_info = hf_info.cardData.get('license')
            if license_info:
                # Map common licenses
                license_map = {
                    "apache-2.0": "Apache 2.0",
                    "mit": "MIT",
                    "llama3": "Llama 3 Community License",
                    "llama2": "Llama 2 Community License",
                    "gpl": "GPL",
                    "cc-by-nc-4.0": "Research Only"
                }
                normalized = license_info.lower().replace(' ', '-')
                for key, value in license_map.items():
                    if key in normalized:
                        return value

                return license_info

    return "Custom"


def infer_use_cases(hf_info: Any, category_hint: Optional[str] = None) -> List[str]:
    """Infer use cases from model info and tags."""
    use_cases = set()

    # Add category hint if provided
    if category_hint and category_hint != "any":
        use_cases.add(category_hint)

    # Check tags
    if hasattr(hf_info, 'tags') and hf_info.tags:
        tag_str = ' '.join(hf_info.tags).lower()

        if any(kw in tag_str for kw in ['chat', 'conversational', 'assistant', 'instruct']):
            use_cases.add('chat')
        if any(kw in tag_str for kw in ['code', 'coding', 'programming']):
            use_cases.add('coding')
        if any(kw in tag_str for kw in ['creative', 'writing', 'story']):
            use_cases.add('writing')
        if any(kw in tag_str for kw in ['math', 'reasoning', 'logic']):
            use_cases.add('reasoning')
        if any(kw in tag_str for kw in ['multilingual', 'translation']):
            use_cases.add('multilingual')

    # Default to general if no specific use cases found
    if not use_cases:
        use_cases.add('general')

    # Always add 'general' for versatile models
    if len(use_cases) > 2:
        use_cases.add('general')

    return sorted(list(use_cases))


def extract_tags(hf_info: Any) -> List[str]:
    """Extract relevant tags from HuggingFace model."""
    tags = []

    # Add common tags based on downloads/likes
    if hasattr(hf_info, 'downloads') and hf_info.downloads > 100000:
        tags.append('popular')

    if hasattr(hf_info, 'likes') and hf_info.likes > 100:
        tags.append('popular')

    # Check for open-source indicators
    if hasattr(hf_info, 'tags') and hf_info.tags:
        tag_str = ' '.join(hf_info.tags).lower()
        if any(kw in tag_str for kw in ['apache', 'mit', 'open']):
            tags.append('open-source')
        if 'efficient' in tag_str or 'fast' in tag_str:
            tags.append('efficient')

    # Deduplicate
    return list(set(tags))


def estimate_quality_metrics(hf_info: Any) -> Optional[Dict[str, Any]]:
    """
    Estimate quality metrics (ideally from model card benchmarks).

    Args:
        hf_info: HuggingFace model info

    Returns:
        Quality metrics dict or None
    """
    # This would ideally parse benchmark results from model card
    # For now, return None (user can manually add later)
    return None


def estimate_performance_profile(params: Optional[float]) -> Optional[Dict[str, str]]:
    """
    Estimate performance profile based on model size.

    Args:
        params: Parameter count in billions

    Returns:
        Performance profile dict or None
    """
    if not params:
        return None

    # Rough heuristics
    if params < 7:
        return {
            "inferenceSpeed": "fast",
            "qualityLevel": "medium"
        }
    elif params < 15:
        return {
            "inferenceSpeed": "fast",
            "qualityLevel": "high"
        }
    elif params < 40:
        return {
            "inferenceSpeed": "medium",
            "qualityLevel": "high"
        }
    else:
        return {
            "inferenceSpeed": "slow",
            "qualityLevel": "high"
        }


def estimate_recommended_contexts(use_cases: List[str], params: Optional[float]) -> Dict[str, int]:
    """
    Estimate recommended context windows for different use cases.

    Args:
        use_cases: List of use cases
        params: Parameter count in billions

    Returns:
        Dictionary of use case to recommended context size
    """
    # Base context recommendations
    base_contexts = {
        "chat": 4096,
        "coding": 8192,
        "writing": 8192,
        "reasoning": 4096,
        "multilingual": 4096,
        "general": 4096
    }

    contexts = {}
    for use_case in use_cases:
        contexts[use_case] = base_contexts.get(use_case, 4096)

    return contexts


def format_parameters(params: Optional[float]) -> str:
    """
    Format parameter count for display.

    Args:
        params: Parameter count in billions

    Returns:
        Formatted string (e.g., "7B", "13B", "1.5B")
    """
    if not params:
        return "Unknown"

    if params >= 1:
        # Round to nearest 0.1
        return f"{params:.1f}B".replace('.0B', 'B')
    else:
        # Convert to millions
        millions = params * 1000
        return f"{int(millions)}M"


def find_ollama_command(name: str, model_id: str) -> Optional[str]:
    """
    Try to find corresponding Ollama command.

    Args:
        name: Model name
        model_id: HuggingFace model ID

    Returns:
        Ollama command string or None
    """
    # Common Ollama model mappings
    ollama_map = {
        "llama": "llama3",
        "mistral": "mistral",
        "phi": "phi",
        "gemma": "gemma",
        "qwen": "qwen",
        "codellama": "codellama",
        "deepseek": "deepseek-coder"
    }

    name_lower = name.lower()
    for key, ollama_name in ollama_map.items():
        if key in name_lower or key in model_id.lower():
            return f"ollama run {ollama_name}"

    return None


def enrich_with_gguf_info(model: Dict[str, Any], model_id: str, api: HfApi) -> None:
    """
    Enrich model with GGUF file information if available.

    Args:
        model: Model dictionary to enrich
        model_id: HuggingFace model ID
        api: HfApi instance
    """
    try:
        files = api.list_repo_files(model_id)
        gguf_files = [f for f in files if f.endswith('.gguf')]

        if gguf_files:
            # Extract quantization types from filenames
            quantizations = set()
            for gguf_file in gguf_files:
                # Try to extract quantization type (e.g., Q4_K_M, Q5_K_S)
                match = re.search(r'(Q[0-9]_[KML]_[SML]|FP16)', gguf_file, re.IGNORECASE)
                if match:
                    quantizations.add(match.group(1).upper())

            # Update variants to only include available quantizations
            if quantizations and model.get('variants'):
                available_variants = [
                    v for v in model['variants']
                    if v['quantization'] in quantizations
                ]
                if available_variants:
                    model['variants'] = available_variants

    except Exception as e:
        # Silently fail - we'll use estimated variants
        pass
