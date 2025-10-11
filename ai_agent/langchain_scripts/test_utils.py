import time
from functools import wraps

def time_llm_invoke(func):
    """Decorator to measure LLM invocation time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        duration = end_time - start_time
        print(f"[TIMING] {func.__name__ if hasattr(func, '__name__') else 'LLM invoke'} took {duration:.2f} seconds")
        return result
    return wrapper

def country_prompt_generator():
    """Generator that yields country-specific prompts"""
    countries = ["France", "Italy", "Poland", "Germany", "Spain", "Japan", "Brazil", "Canada"]

    for country in countries:
        yield f"What is the capital of {country}? Answer in one word."