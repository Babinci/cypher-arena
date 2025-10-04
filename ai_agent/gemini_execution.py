#!/usr/bin/env python3
# Gemini Execution Script

import subprocess
import sys
import argparse
from datetime import date
from typing import Optional, Dict, List

# Mapping of news categories to their respective prompt files
CATEGORY_PROMPT_MAPPING: Dict[str, str] = {
    "polish_rap": "prompts/polish-rap-news.md",
    "polish_showbiz_freakfights": "prompts/polish-showbiz-freakfights.md",
    "polish_general": "prompts/polish-general-news.md",
    "world_news": "prompts/world-news.md",
    "culture_subculture": "prompts/culture-subculture-news.md"
}

def get_prompt_file(category: str) -> Optional[str]:
    """Get the prompt file path for a given category"""
    return CATEGORY_PROMPT_MAPPING.get(category)

def list_all_categories() -> List[str]:
    """Return list of all available categories"""
    return list(CATEGORY_PROMPT_MAPPING.keys())

def execute_gemini_prompt(category: str, news_date: str) -> bool:
    """
    Execute Gemini CLI with prompt for specified category and date

    Args:
        category: News category key from CATEGORY_PROMPT_MAPPING
        news_date: Date in YYYY-MM-DD format

    Returns:
        True if execution successful, False otherwise
    """
    prompt_file = get_prompt_file(category)
    if not prompt_file:
        print(f"Error: Category '{category}' not found")
        return False

    try:
        # Read the prompt template
        with open(prompt_file, 'r', encoding='utf-8') as f:
            prompt_content = f.read()

        # Read general rules
        with open('prompts/general_rules', 'r', encoding='utf-8') as f:
            general_rules = f.read()

        # Replace the date variable and append general rules
        prompt = prompt_content.replace("{{news_date}}", news_date) + "\n\n" + general_rules

        # Execute gemini CLI
        print(f"Executing Gemini CLI for category: {category}, date: {news_date}")
        print("-" * 50)

        result = subprocess.run(
            ["gemini", "-p", prompt],
            capture_output=True,
            text=True,
            encoding='utf-8'
        )

        if result.returncode == 0:
            print("Gemini CLI Output:")
            print(result.stdout)
            return True
        else:
            print(f"Error executing Gemini CLI: {result.stderr}")
            return False

    except FileNotFoundError:
        print("Error: Gemini CLI not found. Make sure 'gemini' command is available.")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Main function with CLI argument parsing"""
    parser = argparse.ArgumentParser(description="Execute Gemini CLI for news gathering")
    parser.add_argument("category", help="News category", choices=list_all_categories())
    parser.add_argument("date", help="Date in YYYY-MM-DD format")
    parser.add_argument("--list-categories", action="store_true", help="List all available categories")

    args = parser.parse_args()

    if args.list_categories:
        print("Available categories:")
        for cat in list_all_categories():
            print(f"  - {cat}")
        return

    # Validate date format
    try:
        date.fromisoformat(args.date)
    except ValueError:
        print("Error: Invalid date format. Use YYYY-MM-DD")
        sys.exit(1)

    success = execute_gemini_prompt(args.category, args.date)
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()


