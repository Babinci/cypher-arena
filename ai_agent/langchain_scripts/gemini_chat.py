from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
from langchain_openai import ChatOpenAI

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GLM_API_KEY = os.getenv("GLM_API_KEY")
OPEN_ROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")

llm = ChatGoogleGenerativeAI(model="models/gemini-flash-lite-latest", google_api_key=GOOGLE_API_KEY)

# print('Invoking Gemini LLM...')
# result_gemini = llm.invoke("What is the capital of France? Answer in one word.")
# print(result_gemini.content)



llm_glm = ChatOpenAI(
    model="glm-4.6",
    temperature=0,
    openai_api_key=GLM_API_KEY,        # any non-empty string
    openai_api_base="https://api.z.ai/api/coding/paas/v4"  # from WSL, try this first
)

# print('Invoking GLM LLM...')
# result_glm = llm_glm.invoke("What is the capital of Italy? Answer in one word.")
# print(result_glm.content)


llm_openrouter=ChatOpenAI(
    model="deepseek/deepseek-chat-v3.1:free",
    openai_api_key=OPEN_ROUTER_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1"
)

print('Invoking OpenRouter LLM...')
result_openrouter = llm_openrouter.invoke("What is the capital of Germany? Answer in one word.")
print(result_openrouter.content)

