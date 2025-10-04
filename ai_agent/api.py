import requests
import re
import os
from dotenv import load_dotenv
from typing import Optional
from gemini_execution import execute_gemini_prompt

# Load environment variables
load_dotenv()

API_BASE_URL = "https://backend.cypher-arena.com/"
AI_AGENT_SECRET_KEY = os.getenv('AI_AGENT_SECRET_KEY')

example_payload = {
  "news_sources": [
    {
      "content": "string",
      "news_date": "2025-10-04",
      "news_source": "news_category",
      "ai_agent": "gemini_cli"
    }
  ]
}


def extract_content_from_esej_tags(response: str) -> Optional[str]:
    """Extract content from <esej></esej> tags"""
    match = re.search(r'<esej>(.*?)</esej>', response, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None


def create_news_send_to_api(news_date: str, news_category: str) -> bool:
    """
    Execute Gemini CLI prompt and send the result to the API

    Args:
        news_date: Date in YYYY-MM-DD format
        news_category: News category from available categories

    Returns:
        True if successful, False otherwise
    """
    if not AI_AGENT_SECRET_KEY:
        print("Error: AI_AGENT_SECRET_KEY not found in environment variables")
        return False

    # Execute Gemini CLI prompt
    print(f"Getting news for category: {news_category}, date: {news_date}")
    gemini_response = execute_gemini_prompt(news_category, news_date)

    if not gemini_response:
        print("Error: Failed to get response from Gemini CLI")
        return False

    # Extract content from <esej> tags
    content = extract_content_from_esej_tags(gemini_response)
    if not content:
        print("Error: No content found in <esej> tags")
        return False

    # Prepare API payload
    payload = {
        "news_sources": [
            {
                "content": content,
                "news_date": news_date,
                "news_source": news_category,
                "ai_agent": "gemini_cli"
            }
        ]
    }

    # Set headers
    headers = {
        'Content-Type': 'application/json',
        'HTTP_X_AGENT_TOKEN': AI_AGENT_SECRET_KEY
    }

    # Send POST request to API
    url = f"{API_BASE_URL}words/gemini-agent/news-sources/"
    print(f"Sending POST request to: {url}")

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        print(f"Successfully sent news to API. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error sending request to API: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return False