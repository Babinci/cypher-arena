from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
from langchain_openai import ChatOpenAI
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

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GLM_API_KEY = os.getenv("GLM_API_KEY")
OPEN_ROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")

llm = ChatGoogleGenerativeAI(model="models/gemini-flash-lite-latest", google_api_key=GOOGLE_API_KEY)

print('Invoking Gemini LLM...')
result_gemini = time_llm_invoke(llm.invoke)("What is the capital of France? Answer in one word.")
print(result_gemini.content)



llm_glm = ChatOpenAI(
    model="glm-4.6",
    temperature=0,
    openai_api_key=GLM_API_KEY,        # any non-empty string
    openai_api_base="https://api.z.ai/api/coding/paas/v4"  # from WSL, try this first
)

print('Invoking GLM 4.6  LLM...')
result_glm = time_llm_invoke(llm_glm.invoke)("What is the capital of Italy? Answer in one word.")
print(result_glm.content)

llm_glm_air = ChatOpenAI(
    model="glm-4.5-air",
    temperature=0,
    openai_api_key=GLM_API_KEY,        # any non-empty string
    openai_api_base="https://api.z.ai/api/coding/paas/v4"  # from WSL, try this first
)


print('Invoking GLM air LLM...')
result_glm_air = time_llm_invoke(llm_glm_air.invoke)("What is the capital of Poland? Answer in one word.")
print(result_glm_air.content)

llm_openrouter=ChatOpenAI(
    model="meta-llama/llama-4-maverick:free",
    openai_api_key=OPEN_ROUTER_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1"
)

print('Invoking OpenRouter LLM...')
result_openrouter = time_llm_invoke(llm_openrouter.invoke)("What is the capital of Germany? Answer in one word.")
print(result_openrouter.content)

