"""
HuggingFace model scraper - fetches real model data from HuggingFace API.
"""

import requests
import json
import re
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict


@dataclass
class ModelVariant:
    quantization: str
    vramRequired: int
    ramRequired: int
    fileSize: float
    contextWindow: int


@dataclass
class LLMModel:
    id: str
    name: str
    description: str
    parameters: str
    variants: List[Dict]
    useCases: List[str]
    provider: str
    license: str
    links: Dict[str, str]
    tags: List[str]


class HuggingFaceAPIError(Exception):
    pass


class HuggingFaceScraper:
    """
    Scrapes model data from HuggingFace API.

    API Docs: https://huggingface.co/docs/hub/api
    """

    def __init__(self, api_token: Optional[str] = None):
        self.base_url = "https://huggingface.co/api"
        self.headers = {}
        if api_token:
            self.headers["Authorization"] = f"Bearer {api_token}"

    def search_models(
        self,
        query: str = "",
        task: str = "text-generation",
        sort: str = "downloads",
        limit: int = 20,
        filter_tags: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Search for models on HuggingFace.

        Args:
            query: Search query string
            task: Model task (e.g., 'text-generation', 'text2text-generation')
            sort: Sort by 'downloads', 'likes', 'trending', 'createdAt'
            limit: Max number of results
            filter_tags: Additional tags to filter by (e.g., ['conversational', 'code'])

        Returns:
            List of model dictionaries
        """
        url = f"{self.base_url}/models"

        params = {
            "search": query,
            "filter": task,
            "sort": sort,
            "limit": limit,
            "full": "true"  # Get full model info
        }

        if filter_tags:
            params["tags"] = ",".join(filter_tags)

        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise HuggingFaceAPIError(f"Failed to search models: {e}")

    def get_model_info(self, model_id: str) -> Dict:
        """
        Get detailed information about a specific model.

        Args:
            model_id: Full model ID (e.g., 'meta-llama/Llama-3-8B')

        Returns:
            Model information dictionary
        """
        url = f"{self.base_url}/models/{model_id}"

        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise HuggingFaceAPIError(f"Failed to get model info for {model_id}: {e}")

    def get_model_files(self, model_id: str) -> List[Dict]:
        """
        Get list of files in a model repository.
        Useful for finding GGUF files with quantization info.

        Args:
            model_id: Full model ID

        Returns:
            List of file information dictionaries
        """
        url = f"https://huggingface.co/api/models/{model_id}/tree/main"

        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Warning: Could not fetch files for {model_id}: {e}")
            return []

    def extract_parameter_count(self, model_id: str, model_name: str, config: Dict) -> str:
        """
        Extract parameter count from model ID, name, or config.

        Returns: String like "7B", "13B", "70B"
        """
        # Try to extract from model name/ID
        patterns = [
            r'(\d+\.?\d*)B',  # "7B", "13B", "70B", "1.5B"
            r'(\d+)b',        # "7b", "13b"
        ]

        for text in [model_id, model_name]:
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    num = match.group(1)
                    return f"{num}B"

        # Try to get from config
        if config:
            # Some models have num_parameters in config
            if 'num_parameters' in config:
                params = config['num_parameters']
                if params >= 1e9:
                    return f"{params / 1e9:.1f}B"

        return "Unknown"

    def extract_context_window(self, config: Dict) -> int:
        """
        Extract context window size from model config.

        Common config keys:
        - max_position_embeddings
        - n_positions
        - max_seq_length
        """
        if not config:
            return 8192  # Default

        keys = ['max_position_embeddings', 'n_positions', 'max_seq_length', 'model_max_length']

        for key in keys:
            if key in config:
                return int(config[key])

        return 8192

    def parse_gguf_quantization(self, filename: str) -> Optional[str]:
        """
        Parse quantization type from GGUF filename.

        Examples:
            - "model-Q4_K_M.gguf" -> "Q4_K_M"
            - "llama-7b-q5_k_s.gguf" -> "Q5_K_S"
            - "mistral-7b-fp16.gguf" -> "FP16"
        """
        quant_patterns = [
            r'[_-](Q\d+_K_[MS])',  # Q4_K_M, Q5_K_S
            r'[_-](Q\d+_\d+)',     # Q4_0, Q5_1
            r'[_-](Q\d+)',         # Q4, Q5, Q8
            r'[_-](FP16|FP32)',    # FP16, FP32
        ]

        for pattern in quant_patterns:
            match = re.search(pattern, filename, re.IGNORECASE)
            if match:
                return match.group(1).upper()

        return None

    def extract_file_size_gb(self, size_bytes: int) -> float:
        """Convert bytes to GB rounded to 1 decimal."""
        return round(size_bytes / (1024 ** 3), 1)

    def parse_model_to_llm_format(self, model_data: Dict) -> Optional[LLMModel]:
        """
        Convert HuggingFace model data to our LLM format.

        Args:
            model_data: Raw model data from HuggingFace API

        Returns:
            LLMModel object or None if parsing fails
        """
        try:
            model_id = model_data.get('id', model_data.get('modelId', ''))
            model_name = model_data.get('cardData', {}).get('model_name', model_id.split('/')[-1])

            # Extract description
            description = model_data.get('cardData', {}).get('short_description', '')
            if not description:
                description = model_data.get('description', f"A language model from {model_id.split('/')[0]}")

            # Get config for technical details
            config = model_data.get('config', {})

            # Extract parameter count
            parameters = self.extract_parameter_count(model_id, model_name, config)

            # Extract context window
            context_window = self.extract_context_window(config)

            # Get provider (author/organization)
            provider = model_id.split('/')[0] if '/' in model_id else "Unknown"

            # Get license
            license_info = model_data.get('cardData', {}).get('license', 'Unknown')
            if not license_info or license_info == 'Unknown':
                license_info = model_data.get('gated', 'Unknown')

            # Extract tags and use cases
            tags = model_data.get('tags', [])
            use_cases = self._extract_use_cases(tags, model_name)

            # Get model files to find variants
            files = self.get_model_files(model_id)
            variants = self._extract_variants_from_files(files, context_window)

            # If no variants found from files, create default
            if not variants:
                variants = self._create_default_variants(parameters, context_window)

            # Build links
            links = {
                'huggingFace': f"https://huggingface.co/{model_id}"
            }

            # Try to find Ollama equivalent
            ollama_name = self._find_ollama_name(model_name, model_id)
            if ollama_name:
                links['ollama'] = f"ollama run {ollama_name}"

            # Clean ID for our database
            clean_id = model_id.replace('/', '-').lower()

            return LLMModel(
                id=clean_id,
                name=model_name,
                description=description[:200],  # Limit description length
                parameters=parameters,
                variants=[asdict(v) for v in variants],
                useCases=use_cases,
                provider=provider,
                license=license_info,
                links=links,
                tags=tags[:5]  # Limit tags
            )

        except Exception as e:
            print(f"Error parsing model {model_data.get('id', 'unknown')}: {e}")
            return None

    def _extract_variants_from_files(self, files: List[Dict], context_window: int) -> List[ModelVariant]:
        """Extract model variants from GGUF files."""
        variants = []

        for file in files:
            filename = file.get('path', '')

            # Only process GGUF files
            if not filename.endswith('.gguf'):
                continue

            quant = self.parse_gguf_quantization(filename)
            if not quant:
                continue

            size_bytes = file.get('size', 0)
            file_size_gb = self.extract_file_size_gb(size_bytes)

            # Estimate VRAM/RAM based on file size
            # Rule of thumb: VRAM ≈ file size * 1.2, RAM ≈ VRAM * 1.2
            vram = max(int(file_size_gb * 1.2), 1)
            ram = max(int(vram * 1.2), 2)

            variant = ModelVariant(
                quantization=quant,
                vramRequired=vram,
                ramRequired=ram,
                fileSize=file_size_gb,
                contextWindow=context_window
            )

            variants.append(variant)

        return variants

    def _create_default_variants(self, parameters: str, context_window: int) -> List[ModelVariant]:
        """Create default variants when no GGUF files found."""
        # Parse parameter count
        param_match = re.search(r'(\d+\.?\d*)', parameters)
        if not param_match:
            return []

        param_b = float(param_match.group(1))

        # Create Q4_K_M variant as default
        # Rough estimate: Q4 uses ~0.5 bytes per parameter
        file_size = round((param_b * 0.5), 1)
        vram = max(int(file_size * 1.3), 1)
        ram = max(int(vram * 1.2), 2)

        return [
            ModelVariant(
                quantization="Q4_K_M",
                vramRequired=vram,
                ramRequired=ram,
                fileSize=file_size,
                contextWindow=context_window
            )
        ]

    def _extract_use_cases(self, tags: List[str], model_name: str) -> List[str]:
        """Determine use cases from tags and model name."""
        use_cases = []

        tag_mapping = {
            'conversational': 'chat',
            'code': 'coding',
            'coding': 'coding',
            'text-generation': 'general',
            'question-answering': 'chat',
            'summarization': 'writing',
        }

        for tag in tags:
            if tag in tag_mapping:
                use_case = tag_mapping[tag]
                if use_case not in use_cases:
                    use_cases.append(use_case)

        # Check model name for clues
        name_lower = model_name.lower()
        if 'code' in name_lower and 'coding' not in use_cases:
            use_cases.append('coding')
        if 'chat' in name_lower and 'chat' not in use_cases:
            use_cases.append('chat')
        if 'instruct' in name_lower and 'general' not in use_cases:
            use_cases.append('general')

        return use_cases if use_cases else ['general']

    def _find_ollama_name(self, model_name: str, model_id: str) -> Optional[str]:
        """Try to determine Ollama model name."""
        name_lower = model_name.lower()

        # Common mappings
        if 'llama-3' in name_lower or 'llama3' in name_lower:
            return 'llama3'
        if 'llama-2' in name_lower or 'llama2' in name_lower:
            return 'llama2'
        if 'mistral' in name_lower:
            return 'mistral'
        if 'mixtral' in name_lower:
            return 'mixtral'
        if 'phi-3' in name_lower or 'phi3' in name_lower:
            return 'phi3'
        if 'gemma' in name_lower:
            return 'gemma'
        if 'qwen' in name_lower:
            return 'qwen'

        return None


# Example usage
if __name__ == '__main__':
    scraper = HuggingFaceScraper()

    print("Searching for popular text-generation models...")
    models = scraper.search_models(
        query="llama",
        task="text-generation",
        sort="downloads",
        limit=5
    )

    print(f"\nFound {len(models)} models\n")

    for model_data in models:
        print(f"Processing: {model_data.get('id', 'unknown')}")
        llm_model = scraper.parse_model_to_llm_format(model_data)

        if llm_model:
            print(f"  Name: {llm_model.name}")
            print(f"  Parameters: {llm_model.parameters}")
            print(f"  Variants: {len(llm_model.variants)}")
            print(f"  Use Cases: {', '.join(llm_model.useCases)}")
            print()
