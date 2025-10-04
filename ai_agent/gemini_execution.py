# Gemini Execution Script

# Mapping of news categories to their respective prompt files
CATEGORY_PROMPT_MAPPING = {
    "polish_rap": "prompts/polish-rap-news.md",
    "polish_showbiz_freakfights": "prompts/polish-showbiz-freakfights.md",
    "polish_general": "prompts/polish-general-news.md",
    "world_news": "prompts/world-news.md",
    "culture_subculture": "prompts/culture-subculture-news.md"
}

def get_prompt_file(category):
    """Get the prompt file path for a given category"""
    return CATEGORY_PROMPT_MAPPING.get(category)

def list_all_categories():
    """Return list of all available categories"""
    return list(CATEGORY_PROMPT_MAPPING.keys())


def execute_gemini_prompt(news_date, category):
    pass