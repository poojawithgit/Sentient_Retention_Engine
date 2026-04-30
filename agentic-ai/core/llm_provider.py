import os
from dotenv import load_dotenv

load_dotenv()

LLM_AVAILABLE = False
llm = None
openai_llm = None

try:
    from langchain_groq import ChatGroq
    from langchain_openai import ChatOpenAI
    
    # 1. Initialize Groq (Fallback/Default)
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        llm = ChatGroq(
            model_name="llama-3.1-8b-instant",
            request_timeout=20.0,  # Reduced from 30s
            max_retries=2,
            groq_api_key=groq_key
        )
        LLM_AVAILABLE = True
    
    # 2. Initialize OpenAI (for Strategist and high-quality nodes)
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        openai_llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0,
            api_key=openai_key,
            timeout=15.0  # Strict timeout for better user experience
        )
except Exception as e:
    print(f"Warning: LLM initialization failed: {e}")

def get_llm(provider="groq"):
    if provider == "openai" and openai_llm:
        return openai_llm, True
    return llm, LLM_AVAILABLE
