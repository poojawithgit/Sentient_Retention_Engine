import os
from dotenv import load_dotenv

load_dotenv()

LLM_AVAILABLE = False
llm = None
openai_llm = None
gemini_flash = None
gemini_pro = None

try:
    from langchain_groq import ChatGroq
    from langchain_openai import ChatOpenAI
    from langchain_google_genai import ChatGoogleGenerativeAI
    
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
        
    # 3. Initialize Gemini (Flash & Pro)
    google_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if google_key:
        gemini_flash = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=google_key,
            temperature=0,
            timeout=15.0
        )
        gemini_pro = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            google_api_key=google_key,
            temperature=0,
            timeout=20.0
        )
except Exception as e:
    print(f"Warning: LLM initialization failed: {e}")

def get_llm(provider="gemini_flash"):
    """
    Retrieves the requested LLM provider with graceful fallbacks.
    """
    if provider == "gemini_flash":
        if gemini_flash:
            return gemini_flash, True
        if llm:
            return llm, True
    elif provider == "gemini_pro":
        if gemini_pro:
            return gemini_pro, True
        if openai_llm:
            return openai_llm, True
        if llm:
            return llm, True
    elif provider == "openai" and openai_llm:
        return openai_llm, True
    elif provider == "groq" and llm:
        return llm, True
    return llm, LLM_AVAILABLE

