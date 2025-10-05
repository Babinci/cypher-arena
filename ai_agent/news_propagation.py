#!/usr/bin/env python3
# News Propagation Script with Throttling Support

import time
import argparse
from datetime import date, timedelta
from typing import List, Dict
from api import is_created, create_news_send_to_api
from gemini_execution import list_all_categories

# Rate limiting configuration
GEMINI_FREE_TIER_LIMITS = {
    "requests_per_minute": 60,
    "requests_per_day": 1000
}

class RateLimiter:
    """Simple rate limiter to respect Gemini API free tier limits"""

    def __init__(self, requests_per_minute: int = 60, requests_per_day: int = 1000):
        self.requests_per_minute = requests_per_minute
        self.requests_per_day = requests_per_day
        self.minute_requests = []
        self.day_requests = []

    def wait_if_needed(self):
        """Wait if we're approaching rate limits"""
        current_time = time.time()

        # Clean old requests (older than 1 minute for minute counter, older than 1 day for day counter)
        self.minute_requests = [req_time for req_time in self.minute_requests
                               if current_time - req_time < 60]
        self.day_requests = [req_time for req_time in self.day_requests
                            if current_time - req_time < 86400]  # 24 hours in seconds

        # Check minute rate limit
        if len(self.minute_requests) >= self.requests_per_minute - 1:  # Leave 1 request buffer
            oldest_request = min(self.minute_requests)
            wait_time = 60 - (current_time - oldest_request) + 1  # Add 1 second buffer
            print(f"Approaching minute rate limit. Waiting {wait_time:.1f} seconds...")
            time.sleep(wait_time)

        # Check day rate limit
        if len(self.day_requests) >= self.requests_per_day - 1:  # Leave 1 request buffer
            print("Approaching daily rate limit. Cannot make more requests today.")
            return False

        # Record this request
        self.minute_requests.append(current_time)
        self.day_requests.append(current_time)
        return True

def generate_date_range(start_date: date, end_date: date) -> List[date]:
    """Generate list of dates from start_date to end_date (inclusive)"""
    delta = timedelta(days=1)
    current_date = start_date
    dates = []

    while current_date <= end_date:
        dates.append(current_date)
        current_date += delta

    return dates

def propagate_news_for_dates(start_date: date, end_date: date, categories: List[str] = None) -> Dict[str, int]:
    """
    Propagate news for given date range and categories

    Args:
        start_date: Start date for news propagation
        end_date: End date for news propagation
        categories: List of categories to propagate (uses all if None)

    Returns:
        Dictionary with statistics: {'total': int, 'created': int, 'skipped': int, 'failed': int}
    """
    if categories is None:
        categories = list_all_categories()

    dates = generate_date_range(start_date, end_date)
    rate_limiter = RateLimiter()

    stats = {
        'total': 0,
        'created': 0,
        'skipped': 0,
        'failed': 0
    }

    print(f"Starting news propagation for {len(dates)} dates and {len(categories)} categories")
    print(f"Date range: {start_date} to {end_date}")
    print(f"Categories: {', '.join(categories)}")
    print("-" * 60)

    total_combinations = len(dates) * len(categories)
    current_count = 0

    for news_date in dates:
        date_str = news_date.strftime('%Y-%m-%d')

        for category in categories:
            current_count += 1
            stats['total'] += 1

            print(f"[{current_count}/{total_combinations}] Processing {category} for {date_str}")

            # Check rate limits before making API call
            if not rate_limiter.wait_if_needed():
                print("Rate limit reached. Stopping propagation.")
                return stats

            # Check if news already exists
            if is_created(date_str, category):
                print(f"  -> Already exists, skipping")
                stats['skipped'] += 1
                continue

            # Create and send news
            print(f"  -> Creating new news entry...")
            success = create_news_send_to_api(date_str, category)

            if success:
                print(f"  ->  Successfully created")
                stats['created'] += 1
            else:
                print(f"  ->  Failed to create")
                stats['failed'] += 1

            # Small delay between requests to be safe
            time.sleep(0.5)

    return stats

def propagate_last_two_months() -> Dict[str, int]:
    """
    Propagate news for the last 2 months

    Returns:
        Dictionary with statistics
    """
    end_date = date.today()
    start_date = end_date - timedelta(days=60)  # Approximately 2 months

    return propagate_news_for_dates(start_date, end_date)

def main():
    """Main function with CLI argument parsing"""
    parser = argparse.ArgumentParser(description="Propagate news content with throttling support")
    parser.add_argument("--start-date", type=str, help="Start date in YYYY-MM-DD format")
    parser.add_argument("--end-date", type=str, help="End date in YYYY-MM-DD format")
    parser.add_argument("--categories", nargs='+', help="List of categories to process",
                       choices=list_all_categories())
    parser.add_argument("--last-two-months", action="store_true",
                       help="Propagate news for the last 2 months")

    args = parser.parse_args()

    # Validate dates if provided
    start_date = None
    end_date = None

    if args.start_date:
        try:
            start_date = date.fromisoformat(args.start_date)
        except ValueError:
            print("Error: Invalid start date format. Use YYYY-MM-DD")
            return

    if args.end_date:
        try:
            end_date = date.fromisoformat(args.end_date)
        except ValueError:
            print("Error: Invalid end date format. Use YYYY-MM-DD")
            return

    # Determine execution mode
    if args.last_two_months:
        print("Propagating news for the last 2 months...")
        stats = propagate_last_two_months()
    elif args.start_date and args.end_date:
        if start_date > end_date:
            print("Error: Start date cannot be after end date")
            return
        print(f"Propagating news from {args.start_date} to {args.end_date}...")
        stats = propagate_news_for_dates(start_date, end_date, args.categories)
    else:
        print("Error: Please specify either --last-two-months or both --start-date and --end-date")
        parser.print_help()
        return

    # Print summary
    print("\n" + "=" * 60)
    print("PROPAGATION SUMMARY")
    print("=" * 60)
    print(f"Total processed: {stats['total']}")
    print(f"Successfully created: {stats['created']}")
    print(f"Skipped (already exists): {stats['skipped']}")
    print(f"Failed: {stats['failed']}")

    if stats['created'] > 0:
        success_rate = (stats['created'] / stats['total']) * 100
        print(f"Success rate: {success_rate:.1f}%")

if __name__ == "__main__":
    main()