#!/usr/bin/env python3
"""
HuggingFace Model Discovery Tool

Interactive CLI for discovering and adding models from HuggingFace Hub
to your LLM Helper application.
"""

import json
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional

from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt, Confirm
from rich.panel import Panel
from rich.progress import Progress

from hf_search import search_models, format_number
from model_builder import (
    build_model_from_hf,
    build_variants,
    enrich_with_gguf_info
)
from validator import validate_model, validate_model_list, print_validation_report
from huggingface_hub import HfApi


console = Console()


def display_search_results(results: List[Dict]) -> None:
    """Display search results in a formatted table."""
    if not results:
        console.print("[yellow]No models found matching criteria[/yellow]")
        return

    table = Table(title="Search Results", show_header=True, header_style="bold magenta")
    table.add_column("#", style="dim", width=3)
    table.add_column("Model ID", style="cyan", width=40)
    table.add_column("Size", justify="right", width=8)
    table.add_column("Downloads", justify="right", width=10)
    table.add_column("Likes", justify="right", width=8)
    table.add_column("Tags", width=25)

    for i, result in enumerate(results, 1):
        params = f"{result['params']:.1f}B" if result['params'] else "?"
        downloads = format_number(result['downloads'])
        likes = format_number(result['likes'])
        tags = ", ".join(result['tags'][:3])

        table.add_row(
            str(i),
            result['modelId'],
            params,
            downloads,
            likes,
            tags
        )

    console.print(table)


def select_models_interactive(results: List[Dict]) -> List[int]:
    """
    Interactive model selection.

    Args:
        results: List of search results

    Returns:
        List of selected indices (1-based)
    """
    console.print("\n[bold]Select models to add:[/bold]")
    console.print("Enter model numbers separated by commas (e.g., 1,3,5)")
    console.print("Or enter 'all' to select all models")
    console.print("Or enter 'q' to quit")

    while True:
        selection = Prompt.ask("\nYour selection", default="q")

        if selection.lower() == 'q':
            return []

        if selection.lower() == 'all':
            return list(range(1, len(results) + 1))

        try:
            # Parse comma-separated numbers
            indices = [int(x.strip()) for x in selection.split(',')]

            # Validate range
            if all(1 <= i <= len(results) for i in indices):
                return indices
            else:
                console.print(f"[red]Invalid selection. Please enter numbers between 1 and {len(results)}[/red]")
        except ValueError:
            console.print("[red]Invalid input. Please enter comma-separated numbers or 'all'[/red]")


def preview_model(model: Dict[str, Any]) -> None:
    """Display a preview of the model data."""
    # Create a formatted preview
    preview = f"""
[bold cyan]{model['name']}[/bold cyan]
[dim]ID:[/dim] {model['id']}
[dim]Provider:[/dim] {model['provider']}
[dim]Parameters:[/dim] {model['parameters']}
[dim]License:[/dim] {model['license']}

[bold]Description:[/bold]
{model['description']}

[bold]Use Cases:[/bold] {', '.join(model['useCases'])}
[bold]Tags:[/bold] {', '.join(model['tags'])}

[bold]Variants:[/bold]
"""

    for variant in model['variants']:
        preview += f"  • {variant['quantization']}: {variant['fileSize']}GB file, {variant['vramRequired']}GB VRAM, {variant['ramRequired']}GB RAM\n"

    preview += f"\n[bold]Links:[/bold]\n"
    for key, value in model['links'].items():
        preview += f"  • {key}: {value}\n"

    console.print(Panel(preview, title="Model Preview", border_style="green"))


def edit_model_interactive(model: Dict[str, Any]) -> Dict[str, Any]:
    """
    Allow user to edit model fields interactively.

    Args:
        model: Model dictionary

    Returns:
        Edited model dictionary
    """
    console.print("\n[bold]Edit Model Fields[/bold]")
    console.print("Press Enter to keep current value\n")

    # Editable fields
    model['name'] = Prompt.ask("Name", default=model['name'])
    model['description'] = Prompt.ask("Description", default=model['description'])
    model['parameters'] = Prompt.ask("Parameters", default=model['parameters'])
    model['license'] = Prompt.ask("License", default=model['license'])

    # Use cases
    console.print(f"\nCurrent use cases: {', '.join(model['useCases'])}")
    use_cases_str = Prompt.ask(
        "Use cases (comma-separated)",
        default=','.join(model['useCases'])
    )
    model['useCases'] = [uc.strip() for uc in use_cases_str.split(',')]

    # Tags
    console.print(f"\nCurrent tags: {', '.join(model['tags'])}")
    tags_str = Prompt.ask(
        "Tags (comma-separated)",
        default=','.join(model['tags'])
    )
    model['tags'] = [tag.strip() for tag in tags_str.split(',')]

    return model


def load_existing_models(models_file: Path) -> List[Dict[str, Any]]:
    """Load existing models from JSON file."""
    if not models_file.exists():
        return []

    try:
        with open(models_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        console.print(f"[red]Error loading models file: {e}[/red]")
        return []


def save_models(models: List[Dict[str, Any]], models_file: Path) -> bool:
    """Save models to JSON file."""
    try:
        # Validate before saving
        is_valid, errors = validate_model_list(models)
        if not is_valid:
            console.print("[red]Validation failed! Models not saved.[/red]")
            print_validation_report(is_valid, errors)
            return False

        # Create backup if file exists
        if models_file.exists():
            backup_file = models_file.with_suffix('.json.backup')
            with open(models_file, 'r') as f:
                content = f.read()
            with open(backup_file, 'w') as f:
                f.write(content)
            console.print(f"[dim]Backup created: {backup_file}[/dim]")

        # Save with pretty formatting
        with open(models_file, 'w') as f:
            json.dump(models, f, indent=2, ensure_ascii=False)

        console.print(f"[green]✓ Models saved to {models_file}[/green]")
        return True

    except Exception as e:
        console.print(f"[red]Error saving models: {e}[/red]")
        return False


def save_search_results(results: List[Dict], filename: str) -> None:
    """Save search results for later use."""
    try:
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        console.print(f"[green]Search results saved to {filename}[/green]")
    except Exception as e:
        console.print(f"[red]Error saving search results: {e}[/red]")


def load_search_results(filename: str) -> List[Dict]:
    """Load previously saved search results."""
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except Exception as e:
        console.print(f"[red]Error loading search results: {e}[/red]")
        return []


def main():
    parser = argparse.ArgumentParser(
        description="Discover and add LLM models from HuggingFace Hub",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Quick search for medium coding models
  %(prog)s --size medium --category coding --limit 10

  # Search with filters
  %(prog)s --size small --category chat --min-downloads 500000 --has-gguf

  # Load previous search results
  %(prog)s --load search_results.json

  # Save search results for later
  %(prog)s --size large --save my_search.json

  # Non-interactive mode (auto-add all results)
  %(prog)s --size small --category chat --auto-add
        """
    )

    # Search parameters
    parser.add_argument('--size', choices=['small', 'medium', 'large', 'xl', 'any'],
                        default='any', help='Model size range')
    parser.add_argument('--category', choices=['chat', 'coding', 'writing', 'reasoning', 'multilingual', 'general', 'any'],
                        default='any', help='Model category')
    parser.add_argument('--limit', type=int, default=10, help='Maximum number of results')
    parser.add_argument('--min-downloads', type=int, help='Minimum download count')
    parser.add_argument('--min-likes', type=int, help='Minimum likes count')
    parser.add_argument('--has-gguf', action='store_true', help='Only show models with GGUF files')
    parser.add_argument('--language', help='Filter by language (e.g., en, zh)')

    # File operations
    parser.add_argument('--output', default='../public/data/models.json',
                        help='Output models file path')
    parser.add_argument('--save', help='Save search results to file')
    parser.add_argument('--load', help='Load search results from file')

    # Modes
    parser.add_argument('--auto-add', action='store_true',
                        help='Automatically add all results without confirmation')
    parser.add_argument('--validate-only', action='store_true',
                        help='Only validate existing models file')

    args = parser.parse_args()

    # Print header
    console.print(Panel.fit(
        "[bold cyan]HuggingFace Model Discovery Tool[/bold cyan]\n"
        "Find and add models to your LLM Helper",
        border_style="cyan"
    ))

    # Validate-only mode
    if args.validate_only:
        models_file = Path(args.output)
        if not models_file.exists():
            console.print(f"[red]Models file not found: {models_file}[/red]")
            sys.exit(1)

        models = load_existing_models(models_file)
        is_valid, errors = validate_model_list(models)
        print_validation_report(is_valid, errors)
        sys.exit(0 if is_valid else 1)

    # Load or search for models
    if args.load:
        console.print(f"[cyan]Loading search results from {args.load}...[/cyan]")
        results = load_search_results(args.load)
        if not results:
            sys.exit(1)
    else:
        # Perform search
        console.print("\n[cyan]Searching HuggingFace Hub...[/cyan]")
        with Progress() as progress:
            task = progress.add_task("[cyan]Searching...", total=None)
            results = search_models(
                size_range=args.size,
                category=args.category,
                limit=args.limit,
                min_downloads=args.min_downloads,
                min_likes=args.min_likes,
                has_gguf=args.has_gguf,
                language=args.language
            )
            progress.update(task, completed=100)

        if not results:
            console.print("[yellow]No models found matching criteria[/yellow]")
            sys.exit(0)

        console.print(f"[green]Found {len(results)} models[/green]")

        # Save search results if requested
        if args.save:
            save_search_results(results, args.save)

    # Display results
    display_search_results(results)

    # Select models
    if args.auto_add:
        selected_indices = list(range(1, len(results) + 1))
        console.print(f"[cyan]Auto-adding all {len(results)} models[/cyan]")
    else:
        selected_indices = select_models_interactive(results)

    if not selected_indices:
        console.print("[yellow]No models selected. Exiting.[/yellow]")
        sys.exit(0)

    # Build model objects
    console.print(f"\n[cyan]Building model objects for {len(selected_indices)} models...[/cyan]")
    api = HfApi()
    new_models = []

    for idx in selected_indices:
        result = results[idx - 1]
        model_id = result['modelId']

        console.print(f"\n[bold]Processing: {model_id}[/bold]")

        # Build model
        model = build_model_from_hf(
            model_id=model_id,
            hf_info=result['info'],
            category=args.category if args.category != 'any' else None,
            estimated_params=result['params']
        )

        # Build variants
        context_window = 8192  # Default, could be extracted from model card
        has_gguf = args.has_gguf
        model['variants'] = build_variants(
            model_id=model_id,
            params=result['params'] or 7.0,
            context_window=context_window,
            has_gguf=has_gguf
        )

        # Enrich with GGUF info if available
        if has_gguf:
            try:
                enrich_with_gguf_info(model, model_id, api)
            except:
                pass

        # Validate
        is_valid, errors = validate_model(model)
        if not is_valid:
            console.print("[red]Model validation failed:[/red]")
            print_validation_report(is_valid, errors)
            continue

        # Preview
        preview_model(model)

        # Ask for confirmation (unless auto-add)
        if not args.auto_add:
            if not Confirm.ask("Add this model?", default=True):
                console.print("[yellow]Skipped[/yellow]")
                continue

            # Ask if user wants to edit
            if Confirm.ask("Edit model before adding?", default=False):
                model = edit_model_interactive(model)

                # Re-validate after editing
                is_valid, errors = validate_model(model)
                if not is_valid:
                    console.print("[red]Model validation failed after editing:[/red]")
                    print_validation_report(is_valid, errors)
                    if not Confirm.ask("Add anyway?", default=False):
                        continue

        new_models.append(model)
        console.print(f"[green]✓ Added {model['name']}[/green]")

    if not new_models:
        console.print("[yellow]No models to add. Exiting.[/yellow]")
        sys.exit(0)

    # Load existing models and merge
    models_file = Path(args.output)
    existing_models = load_existing_models(models_file)

    console.print(f"\n[cyan]Merging with existing models...[/cyan]")
    console.print(f"Existing models: {len(existing_models)}")
    console.print(f"New models: {len(new_models)}")

    # Check for duplicates
    existing_ids = {m['id'] for m in existing_models}
    duplicates = [m for m in new_models if m['id'] in existing_ids]

    if duplicates:
        console.print(f"\n[yellow]Warning: {len(duplicates)} duplicate model(s) found:[/yellow]")
        for dup in duplicates:
            console.print(f"  • {dup['id']}")

        if not args.auto_add:
            if Confirm.ask("Replace existing models with new data?", default=False):
                # Remove duplicates from existing
                existing_models = [m for m in existing_models if m['id'] not in {d['id'] for d in duplicates}]
            else:
                # Remove duplicates from new
                new_models = [m for m in new_models if m['id'] not in existing_ids]

    # Merge
    all_models = existing_models + new_models

    console.print(f"\n[bold]Total models after merge: {len(all_models)}[/bold]")

    # Save
    if save_models(all_models, models_file):
        console.print("\n[bold green]✓ Success! Models added to your application.[/bold green]")
        console.print(f"Added {len(new_models)} new model(s)")
    else:
        console.print("\n[bold red]✗ Failed to save models[/bold red]")
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[yellow]Cancelled by user[/yellow]")
        sys.exit(0)
    except Exception as e:
        console.print(f"\n[red]Error: {e}[/red]")
        import traceback
        traceback.print_exc()
        sys.exit(1)
