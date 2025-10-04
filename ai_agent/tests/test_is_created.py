#!/usr/bin/env python3
# Test file for is_created function

import os
from dotenv import load_dotenv
from api import is_created

# Load environment variables
load_dotenv()

def test_is_created():
    """Test the is_created function with sample data"""

    # Test data
    test_date = "2025-10-04"
    test_source = "polish_rap"
    test_api_key = os.getenv('AI_AGENT_SECRET_KEY')

    if not test_api_key:
        print("❌ Error: AI_AGENT_SECRET_KEY not found in .env file")
        return False

    print("Testing is_created function...")
    print(f"Date: {test_date}")
    print(f"Source: {test_source}")
    print(f"API Key: {test_api_key[:10]}... (hidden for security)")
    print("-" * 50)

    # Test the function
    exists = is_created(
        news_date=test_date,
        news_source=test_source,
        api_key=test_api_key
    )

    print(f"News exists: {exists}")
    return exists

if __name__ == "__main__":
    test_is_created()