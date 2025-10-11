from config import llm, llm_glm, llm_glm_air, llm_openrouter
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

if __name__ == "__main__":
    print('Invoking Gemini LLM...')
    result_gemini = time_llm_invoke(llm.invoke)("What is the capital of France? Answer in one word.")
    print(result_gemini.content)

    print('Invoking GLM 4.6  LLM...')
    result_glm = time_llm_invoke(llm_glm.invoke)("What is the capital of Italy? Answer in one word.")
    print(result_glm.content)

    print('Invoking GLM air LLM...')
    result_glm_air = time_llm_invoke(llm_glm_air.invoke)("What is the capital of Poland? Answer in one word.")
    print(result_glm_air.content)

    print('Invoking OpenRouter LLM...')
    result_openrouter = time_llm_invoke(llm_openrouter.invoke)("What is the capital of Germany? Answer in one word.")
    print(result_openrouter.content)

