from ..config import llm, llm_glm, llm_glm_air, llm_openrouter
from .test_utils import time_llm_invoke, country_prompt_generator

if __name__ == "__main__":
    prompts = country_prompt_generator()

    print('Invoking Gemini LLM...')
    result_gemini = time_llm_invoke(llm.invoke)(next(prompts))
    print(result_gemini.content)

    print('Invoking GLM 4.6  LLM...')
    result_glm = time_llm_invoke(llm_glm.invoke)(next(prompts))
    print(result_glm.content)

    print('Invoking GLM air LLM...')
    result_glm_air = time_llm_invoke(llm_glm_air.invoke)(next(prompts))
    print(result_glm_air.content)

    print('Invoking OpenRouter LLM...')
    result_openrouter = time_llm_invoke(llm_openrouter.invoke)(next(prompts))
    print(result_openrouter.content)

