#!/usr/bin/env python3
# Test file for API functionality

from api import send_news_to_api

def test_send_news_to_api():
    """Test the send_news_to_api function with sample data"""

    # Test data
    test_content = """
    Przykładowa treść wiadomości testowej.
    To jest przykładowy esej o polskim rapie z dnia 2025-10-04.
    Zawiera informacje o najnowszych wydarzeniach ze sceny hip-hopowej w Polsce.
    """

    test_date = "2025-10-04"
    test_category = "polish_rap"
    test_api_key = "test_api_key_12345"

    print("Testing send_news_to_api function...")
    print(f"Content: {test_content[:50]}...")
    print(f"Date: {test_date}")
    print(f"Category: {test_category}")
    print(f"API Key: {test_api_key[:10]}...")
    print("-" * 50)

    # Test the function
    success = send_news_to_api(
        content=test_content,
        news_date=test_date,
        news_category=test_category,
        api_key=test_api_key
    )

    if success:
        print("✅ Test successful!")
    else:
        print("❌ Test failed!")

    return success

if __name__ == "__main__":
    test_send_news_to_api()