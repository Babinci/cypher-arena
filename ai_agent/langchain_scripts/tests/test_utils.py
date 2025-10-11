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
        print(
            f"[TIMING] {func.__name__ if hasattr(func, '__name__') else 'LLM invoke'} took {duration:.2f} seconds"
        )
        return result

    return wrapper


def country_prompt_generator():
    """Generator that yields country-specific prompts"""

    #this list in one line to avoid line break issues
    countries = [ "USA", "France", "Italy", "Poland", "Germany", "Spain", "Japan", "Brazil", "Canada", "Australia", "India", "China", "Russia", "Egypt", "South Africa", "Mexico", "Argentina", "Norway", "Sweden", "Finland", "Denmark", "Netherlands", "Belgium", "Switzerland", "Austria", "Portugal", "Greece", "Turkey", "Saudi Arabia", "UAE", "Israel", "South Korea", "New Zealand", "Ireland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Croatia", "Slovakia", "Slovenia", "Ukraine", "Belarus", "Lithuania", "Latvia", "Estonia", "Iceland", "Luxembourg", "Monaco", "Liechtenstein", "Malta", "Cyprus"] 


    for country in countries:
        yield f"What is the capital of {country}? Answer in one word."
