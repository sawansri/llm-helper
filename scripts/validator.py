"""
Schema validation for LLM model data.

Validates model objects against the expected schema before adding to models.json.
"""

from typing import Dict, List, Optional, Any, Tuple
import re


# Required fields for each schema component
REQUIRED_FIELDS = {
    "model": ["id", "name", "description", "parameters", "provider", "license", "useCases", "tags", "variants", "links"],
    "variant": ["quantization", "vramRequired", "ramRequired", "fileSize", "contextWindow"],
    "qualityMetrics": ["overallRating"],
    "performanceProfile": ["inferenceSpeed", "qualityLevel"],
    "links": []  # At least one link should be present
}

OPTIONAL_FIELDS = {
    "model": ["qualityMetrics", "performanceProfile", "recommendedContexts"],
    "qualityMetrics": ["mmlu", "humanEval", "mt_bench"],
    "links": ["huggingFace", "ollama", "website"]
}

# Valid values for enum fields
VALID_VALUES = {
    "inferenceSpeed": ["fast", "medium", "slow"],
    "qualityLevel": ["high", "medium", "low"],
    "license": ["Apache 2.0", "MIT", "Llama 3 Community License", "Custom", "Research Only", "Commercial"]
}


def validate_model(model: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate a complete model object.

    Args:
        model: Model dictionary to validate

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check required fields
    for field in REQUIRED_FIELDS["model"]:
        if field not in model:
            errors.append(f"Missing required field: {field}")

    if errors:
        return False, errors

    # Validate ID format (lowercase, alphanumeric with hyphens and dots)
    # Allow dots for version numbers like "3.1" or parameter counts like "6.7b"
    if not re.match(r'^[a-z0-9.-]+$', model["id"]):
        errors.append(f"Invalid ID format: {model['id']}. Use lowercase alphanumeric with hyphens and dots.")

    # Validate parameters format (e.g., "7B", "13B", "70B")
    if not re.match(r'^\d+(\.\d+)?[BM]$', model["parameters"]):
        errors.append(f"Invalid parameters format: {model['parameters']}. Use format like '7B' or '13B'.")

    # Validate useCases (must be a non-empty list)
    if not isinstance(model["useCases"], list) or len(model["useCases"]) == 0:
        errors.append("useCases must be a non-empty list")

    # Validate tags (must be a list)
    if not isinstance(model["tags"], list):
        errors.append("tags must be a list")

    # Validate variants
    if not isinstance(model["variants"], list) or len(model["variants"]) == 0:
        errors.append("variants must be a non-empty list")
    else:
        for i, variant in enumerate(model["variants"]):
            variant_valid, variant_errors = validate_variant(variant)
            if not variant_valid:
                errors.extend([f"Variant {i}: {err}" for err in variant_errors])

    # Validate links
    links_valid, links_errors = validate_links(model["links"])
    if not links_valid:
        errors.extend(links_errors)

    # Validate optional fields if present
    if "qualityMetrics" in model:
        metrics_valid, metrics_errors = validate_quality_metrics(model["qualityMetrics"])
        if not metrics_valid:
            errors.extend(metrics_errors)

    if "performanceProfile" in model:
        profile_valid, profile_errors = validate_performance_profile(model["performanceProfile"])
        if not profile_valid:
            errors.extend(profile_errors)

    if "recommendedContexts" in model:
        contexts_valid, contexts_errors = validate_recommended_contexts(model["recommendedContexts"])
        if not contexts_valid:
            errors.extend(contexts_errors)

    return len(errors) == 0, errors


def validate_variant(variant: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate a model variant.

    Args:
        variant: Variant dictionary to validate

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check required fields
    for field in REQUIRED_FIELDS["variant"]:
        if field not in variant:
            errors.append(f"Missing required field: {field}")

    if errors:
        return False, errors

    # Validate quantization format
    # Common formats:
    # - GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0
    # - Standard: FP16, FP32, BF16, INT4, INT8
    # - AWQ: AWQ, W4A16, W8A8
    # - GPTQ: GPTQ, GPTQ-4bit, GPTQ-8bit
    # - GGML: Same as GGUF (older format)
    quantization_pattern = r'^(' \
        r'Q[2-8]_[0-1]|' \
        r'Q[2-8]_K(_[SML])?|' \
        r'FP(16|32)|BF16|' \
        r'INT[248]|' \
        r'(W[0-9]A[0-9]{1,2})|' \
        r'(AWQ|GPTQ)(-[0-9]+bit)?|' \
        r'[Ff]ull|' \
        r'[Nn]one' \
        r')$'

    if not re.match(quantization_pattern, variant["quantization"], re.IGNORECASE):
        errors.append(f"Invalid quantization format: {variant['quantization']}")

    # Validate numeric fields are positive
    numeric_fields = ["vramRequired", "ramRequired", "fileSize", "contextWindow"]
    for field in numeric_fields:
        value = variant.get(field)
        if not isinstance(value, (int, float)) or value <= 0:
            errors.append(f"{field} must be a positive number, got: {value}")

    # Sanity checks
    if variant.get("vramRequired", 0) > 200:
        errors.append(f"vramRequired seems too high: {variant['vramRequired']}GB")

    if variant.get("ramRequired", 0) > 500:
        errors.append(f"ramRequired seems too high: {variant['ramRequired']}GB")

    if variant.get("fileSize", 0) > 300:
        errors.append(f"fileSize seems too high: {variant['fileSize']}GB")

    # Context window should be reasonable (typically 2k - 200k tokens)
    context = variant.get("contextWindow", 0)
    if context < 1000 or context > 500000:
        errors.append(f"contextWindow seems unusual: {context} tokens")

    return len(errors) == 0, errors


def validate_quality_metrics(metrics: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate quality metrics.

    Args:
        metrics: Quality metrics dictionary

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check required field
    if "overallRating" not in metrics:
        errors.append("qualityMetrics missing required field: overallRating")
        return False, errors

    # Validate overallRating range (0-5)
    rating = metrics["overallRating"]
    if not isinstance(rating, (int, float)) or rating < 0 or rating > 5:
        errors.append(f"overallRating must be between 0 and 5, got: {rating}")

    # Validate benchmark scores if present
    if "mmlu" in metrics:
        if not isinstance(metrics["mmlu"], (int, float)) or metrics["mmlu"] < 0 or metrics["mmlu"] > 100:
            errors.append(f"mmlu must be between 0 and 100, got: {metrics['mmlu']}")

    if "humanEval" in metrics:
        if not isinstance(metrics["humanEval"], (int, float)) or metrics["humanEval"] < 0 or metrics["humanEval"] > 100:
            errors.append(f"humanEval must be between 0 and 100, got: {metrics['humanEval']}")

    if "mt_bench" in metrics:
        if not isinstance(metrics["mt_bench"], (int, float)) or metrics["mt_bench"] < 0 or metrics["mt_bench"] > 10:
            errors.append(f"mt_bench must be between 0 and 10, got: {metrics['mt_bench']}")

    return len(errors) == 0, errors


def validate_performance_profile(profile: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate performance profile.

    Args:
        profile: Performance profile dictionary

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check required fields
    for field in REQUIRED_FIELDS["performanceProfile"]:
        if field not in profile:
            errors.append(f"performanceProfile missing required field: {field}")

    if errors:
        return False, errors

    # Validate enum values
    if profile["inferenceSpeed"] not in VALID_VALUES["inferenceSpeed"]:
        errors.append(f"Invalid inferenceSpeed: {profile['inferenceSpeed']}")

    if profile["qualityLevel"] not in VALID_VALUES["qualityLevel"]:
        errors.append(f"Invalid qualityLevel: {profile['qualityLevel']}")

    return len(errors) == 0, errors


def validate_links(links: Dict[str, str]) -> Tuple[bool, List[str]]:
    """
    Validate links object.

    Args:
        links: Links dictionary

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Must have at least one link
    if not links or len(links) == 0:
        errors.append("links must contain at least one link")
        return False, errors

    # Validate URL format for each link
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)

    for key, value in links.items():
        if key == "ollama":
            # Ollama links are commands, not URLs
            if not value.startswith("ollama run "):
                errors.append(f"Ollama link should start with 'ollama run ', got: {value}")
        else:
            # Validate as URL
            if not isinstance(value, str) or not url_pattern.match(value):
                errors.append(f"Invalid URL for {key}: {value}")

    return len(errors) == 0, errors


def validate_recommended_contexts(contexts: Dict[str, int]) -> Tuple[bool, List[str]]:
    """
    Validate recommended contexts.

    Args:
        contexts: Recommended contexts dictionary

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    if not isinstance(contexts, dict):
        errors.append("recommendedContexts must be a dictionary")
        return False, errors

    # Validate each context value
    for use_case, context_size in contexts.items():
        if not isinstance(context_size, int) or context_size < 0:
            errors.append(f"Context size for {use_case} must be a positive integer, got: {context_size}")

    return len(errors) == 0, errors


def validate_model_list(models: List[Dict[str, Any]]) -> Tuple[bool, List[str]]:
    """
    Validate a list of models.

    Args:
        models: List of model dictionaries

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    all_errors = []

    if not isinstance(models, list):
        return False, ["Models must be a list"]

    # Check for duplicate IDs
    ids = [m.get("id") for m in models if "id" in m]
    duplicate_ids = set([id for id in ids if ids.count(id) > 1])
    if duplicate_ids:
        all_errors.append(f"Duplicate model IDs found: {', '.join(duplicate_ids)}")

    # Validate each model
    for i, model in enumerate(models):
        is_valid, errors = validate_model(model)
        if not is_valid:
            all_errors.extend([f"Model {i} ({model.get('id', 'unknown')}): {err}" for err in errors])

    return len(all_errors) == 0, all_errors


def print_validation_report(is_valid: bool, errors: List[str]) -> None:
    """
    Print a formatted validation report.

    Args:
        is_valid: Whether validation passed
        errors: List of validation errors
    """
    if is_valid:
        print("✓ Validation passed!")
    else:
        print("✗ Validation failed:")
        for error in errors:
            print(f"  - {error}")
