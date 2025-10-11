from openai import api_key
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


def send_news_to_api(content: str, news_date: str, news_category: str, api_key: str = None) -> bool:
    """
    Send news content to the API

    Args:
        content: News content to send
        news_date: Date in YYYY-MM-DD format
        news_category: News category
        api_key: API key (uses environment variable if not provided)

    Returns:
        True if successful, False otherwise
    """
    if not api_key:
        api_key = AI_AGENT_SECRET_KEY

    if not api_key:
        print("Error: No API key provided")
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
        'X-AGENT-TOKEN': api_key
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


def is_created(news_date: str, news_source: str, api_key: str = None) -> bool:
    """
    Check if news source already exists for the given date and category

    Args:
        news_date: Date in YYYY-MM-DD format
        news_source: News category/source name
        api_key: API key (uses environment variable if not provided)

    Returns:
        True if exists, False otherwise
    """
    if not api_key:
        api_key = AI_AGENT_SECRET_KEY

    if not api_key:
        print("Error: No API key provided")
        return False

    # Set headers
    headers = {
        'Content-Type': 'application/json',
        'X-AGENT-TOKEN': api_key
    }

    # Send GET request to API
    url = f"{API_BASE_URL}words/gemini-agent/news-sources/"
    print(f"Sending GET request to: {url}")

    try:
        response = requests.get(url, headers=headers, params={
            'news_date': news_date,
            'news_source': news_source
        })
        response.raise_for_status()

        # Parse response to check if news source exists
        data = response.json()

        # Check if any items match the criteria
        if isinstance(data, list):
            return any(item.get('news_date') == news_date and
                      item.get('news_source') == news_source
                      for item in data)
        elif isinstance(data, dict) and 'results' in data:
            return any(item.get('news_date') == news_date and
                      item.get('news_source') == news_source
                      for item in data['results'])
        else:
            # If response is a simple boolean or exists indicator
            return bool(data)

    except requests.exceptions.RequestException as e:
        print(f"Error checking if news exists: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return False


def create_news_send_to_api(news_date: str, news_category: str) -> bool:
    """
    Execute Gemini CLI prompt and send the result to the API

    Args:
        news_date: Date in YYYY-MM-DD format
        news_category: News category from available categories

    Returns:
        True if successful, False otherwise
    """
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

    # Send to API
    return send_news_to_api(content, news_date, news_category)



def get_news(news_date: str, news_source: str) -> bool:
    """Get news from backend for llm agent

    Example use:
    # Date in YYYY-MM-DD format
    news = get_news("2025-08-11", "polish_rap")
    if news:
        return news

    Args:
        news_date: Date in YYYY-MM-DD format (e.g., "2025-08-11")
        news_source: News source/category (e.g., "polish_rap")

    Returns:
        JSON response with news data or False if error
    """
    url = f"{API_BASE_URL}words/gemini-agent/news-sources/"
    headers = {
        'Content-Type': 'application/json',
        'X-AGENT-TOKEN': AI_AGENT_SECRET_KEY
    }

    # Query parameters
    params = {
        "news_date": news_date,
        "news_source": news_source
    }

    try:
        # Use GET request with query parameters
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as e:
        print(f"Error fetching news: {e}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"Error fetching news: {e}")
        return False
