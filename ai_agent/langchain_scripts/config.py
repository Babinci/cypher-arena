from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GLM_API_KEY = os.getenv("GLM_API_KEY")
OPEN_ROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")

# LLM Initializations
llm = ChatGoogleGenerativeAI(model="models/gemini-flash-lite-latest", google_api_key=GOOGLE_API_KEY)

llm_glm = ChatOpenAI(
    model="glm-4.6",
    temperature=0,
    openai_api_key=GLM_API_KEY,
    openai_api_base="https://api.z.ai/api/coding/paas/v4"
)

llm_glm_air = ChatOpenAI(
    model="glm-4.5-air",
    temperature=0,
    openai_api_key=GLM_API_KEY,
    openai_api_base="https://api.z.ai/api/coding/paas/v4"
)

llm_openrouter = ChatOpenAI(
    model="meta-llama/llama-4-maverick:free",
    openai_api_key=OPEN_ROUTER_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1"
)

# Dictionary of all LLMs for easy access
LLMS = {
    'gemini': llm,
    'glm': llm_glm,
    'glm_air': llm_glm_air,
    'openrouter': llm_openrouter
}