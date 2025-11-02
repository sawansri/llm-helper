#!/usr/bin/env python3
"""
CLI tool to update the LLM models database.

Usage:
    python update_models.py search "llama"
    python update_models.py popular --limit 10
    python update_models.py add meta-llama/Llama-3-8B
    python update_models.py interactive
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import List, Dict
from dataclasses import asdict

from huggingface_scraper import HuggingFaceScraper, LLMModel

# Path to models.json
MODELS_JSON_PATH = Path(__file__).parent.parent.parent / "public" / "data" / "models.json"


class ModelDatabase:
    """Manages the local models.json database."""

    def __init__(self, json_path: Path = MODELS_JSON_PATH):
        self.json_path = json_path
        self.models = self.load()

    def load(self) -> List[Dict]:
        """Load existing models from JSON."""
        if not self.json_path.exists():
            print(f"Warning: {self.json_path} not found. Creating new database.")
            return []

        try:
            with open(self.json_path, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error loading {self.json_path}: {e}")
            sys.exit(1)

    def save(self):
        """Save models back to JSON."""
        # Ensure directory exists
        self.json_path.parent.mkdir(parents=True, exist_ok=True)

        with open(self.json_path, 'w') as f:
            json.dump(self.models, f, indent=2)

        print(f"✓ Saved {len(self.models)} models to {self.json_path}")

    def add_model(self, model: LLMModel) -> bool:
        """
        Add a model to the database.

        Returns:
            True if model was added, False if it already exists
        """
        # Check if model already exists
        for existing in self.models:
            if existing['id'] == model.id:
                print(f"  Model '{model.id}' already exists. Skipping.")
                return False

        self.models.append(asdict(model))
        print(f"  ✓ Added '{model.name}' ({model.parameters})")
        return True

    def update_model(self, model: LLMModel) -> bool:
        """
        Update an existing model or add if doesn't exist.

        Returns:
            True if model was updated/added
        """
        for i, existing in enumerate(self.models):
            if existing['id'] == model.id:
                self.models[i] = asdict(model)
                print(f"  ✓ Updated '{model.name}' ({model.parameters})")
                return True

        # Model doesn't exist, add it
        return self.add_model(model)

    def list_models(self):
        """Print all models in the database."""
        if not self.models:
            print("No models in database.")
            return

        print(f"\n{len(self.models)} models in database:\n")
        for model in self.models:
            variants = len(model.get('variants', []))
            print(f"  {model['id']:<40} {model['parameters']:<8} ({variants} variants)")


def search_command(args):
    """Search for models on HuggingFace and optionally add them."""
    scraper = HuggingFaceScraper(api_token=args.token)
    db = ModelDatabase()

    print(f"Searching for: '{args.query}'")
    print(f"Task: {args.task}")
    print(f"Sort by: {args.sort}")
    print(f"Limit: {args.limit}\n")

    try:
        results = scraper.search_models(
            query=args.query,
            task=args.task,
            sort=args.sort,
            limit=args.limit
        )
    except Exception as e:
        print(f"Error searching: {e}")
        sys.exit(1)

    if not results:
        print("No results found.")
        return

    print(f"Found {len(results)} models:\n")

    parsed_models = []
    for i, model_data in enumerate(results, 1):
        model_id = model_data.get('id', 'unknown')
        downloads = model_data.get('downloads', 0)
        likes = model_data.get('likes', 0)

        print(f"{i}. {model_id}")
        print(f"   Downloads: {downloads:,} | Likes: {likes}")

        # Try to parse
        llm_model = scraper.parse_model_to_llm_format(model_data)
        if llm_model:
            print(f"   Parameters: {llm_model.parameters} | Variants: {len(llm_model.variants)}")
            parsed_models.append(llm_model)
        else:
            print(f"   ⚠ Could not parse model data")

        print()

    # Ask if user wants to add
    if args.add_all:
        add_choice = 'a'
    elif args.interactive:
        print(f"\nAdd models to database?")
        print("  a = Add all")
        print("  n = Add none")
        print("  1,2,3 = Add specific models (comma-separated)")
        add_choice = input("\nYour choice: ").strip().lower()
    else:
        add_choice = 'n'

    if add_choice == 'n':
        print("No models added.")
        return

    if add_choice == 'a':
        # Add all
        added = 0
        for model in parsed_models:
            if db.add_model(model):
                added += 1
        db.save()
        print(f"\n✓ Added {added} new models")

    elif add_choice.replace(',', '').replace(' ', '').isdigit():
        # Add specific models
        indices = [int(x.strip()) - 1 for x in add_choice.split(',')]
        added = 0
        for idx in indices:
            if 0 <= idx < len(parsed_models):
                if db.add_model(parsed_models[idx]):
                    added += 1
        db.save()
        print(f"\n✓ Added {added} new models")


def add_command(args):
    """Add a specific model by ID."""
    scraper = HuggingFaceScraper(api_token=args.token)
    db = ModelDatabase()

    print(f"Fetching model: {args.model_id}\n")

    try:
        model_data = scraper.get_model_info(args.model_id)
    except Exception as e:
        print(f"Error fetching model: {e}")
        sys.exit(1)

    llm_model = scraper.parse_model_to_llm_format(model_data)

    if not llm_model:
        print("Failed to parse model data.")
        sys.exit(1)

    print(f"Model: {llm_model.name}")
    print(f"Parameters: {llm_model.parameters}")
    print(f"Provider: {llm_model.provider}")
    print(f"Variants: {len(llm_model.variants)}")
    print(f"Use Cases: {', '.join(llm_model.useCases)}")
    print()

    if db.add_model(llm_model):
        db.save()
    else:
        # Model exists, ask if they want to update
        if input("Update existing model? (y/n): ").strip().lower() == 'y':
            db.update_model(llm_model)
            db.save()


def popular_command(args):
    """Get popular models."""
    scraper = HuggingFaceScraper(api_token=args.token)
    db = ModelDatabase()

    print(f"Fetching top {args.limit} popular models...\n")

    try:
        results = scraper.search_models(
            query="",
            task="text-generation",
            sort="downloads",
            limit=args.limit
        )
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

    print(f"Found {len(results)} models:\n")

    for i, model_data in enumerate(results, 1):
        model_id = model_data.get('id', 'unknown')
        downloads = model_data.get('downloads', 0)
        print(f"{i}. {model_id} ({downloads:,} downloads)")

    print()

    if input("Add all these models? (y/n): ").strip().lower() == 'y':
        added = 0
        for model_data in results:
            llm_model = scraper.parse_model_to_llm_format(model_data)
            if llm_model and db.add_model(llm_model):
                added += 1

        db.save()
        print(f"\n✓ Added {added} new models")


def list_command(args):
    """List all models in the database."""
    db = ModelDatabase()
    db.list_models()


def main():
    parser = argparse.ArgumentParser(description="Update LLM models database from HuggingFace")

    # Global options
    parser.add_argument('--token', help='HuggingFace API token (optional, for higher rate limits)')

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # Search command
    search_parser = subparsers.add_parser('search', help='Search for models')
    search_parser.add_argument('query', help='Search query')
    search_parser.add_argument('--task', default='text-generation', help='Model task')
    search_parser.add_argument('--sort', default='downloads', choices=['downloads', 'likes', 'trending', 'createdAt'])
    search_parser.add_argument('--limit', type=int, default=10, help='Number of results')
    search_parser.add_argument('--add-all', action='store_true', help='Add all results without asking')
    search_parser.add_argument('--interactive', action='store_true', help='Interactively choose which models to add')

    # Add specific model
    add_parser = subparsers.add_parser('add', help='Add a specific model by ID')
    add_parser.add_argument('model_id', help='Model ID (e.g., meta-llama/Llama-3-8B)')

    # Popular models
    popular_parser = subparsers.add_parser('popular', help='Get popular models')
    popular_parser.add_argument('--limit', type=int, default=20, help='Number of models')

    # List existing models
    list_parser = subparsers.add_parser('list', help='List models in database')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Route to appropriate command
    if args.command == 'search':
        search_command(args)
    elif args.command == 'add':
        add_command(args)
    elif args.command == 'popular':
        popular_command(args)
    elif args.command == 'list':
        list_command(args)


if __name__ == '__main__':
    main()
