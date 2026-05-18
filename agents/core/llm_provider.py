import os
from dotenv import load_dotenv

load_dotenv()

LLM_AVAILABLE = False
llm = None
openai_llm = None
gemini_flash = None
gemini_pro = None

# 1. Initialize Groq (Fallback/Default)
try:
    from langchain_groq import ChatGroq
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        llm = ChatGroq(
            model_name="llama-3.1-8b-instant",
            request_timeout=20.0,
            max_retries=2,
            groq_api_key=groq_key
        )
        LLM_AVAILABLE = True
        print("[LLMProvider] Groq initialized successfully.", flush=True)
    else:
        print("[LLMProvider] Warning: GROQ_API_KEY is not configured.", flush=True)
except Exception as e:
    print(f"[LLMProvider] Warning: Groq initialization failed: {e}", flush=True)

# 2. Initialize OpenAI (for Strategist and high-quality nodes)
try:
    from langchain_openai import ChatOpenAI
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        openai_llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0,
            api_key=openai_key,
            timeout=15.0
        )
        print("[LLMProvider] OpenAI initialized successfully.", flush=True)
except Exception as e:
    print(f"[LLMProvider] Warning: OpenAI initialization failed: {e}", flush=True)

# 3. Initialize Gemini (Flash & Pro)
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
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
        print("[LLMProvider] Gemini initialized successfully.", flush=True)
    else:
        print("[LLMProvider] Warning: GOOGLE_API_KEY / GEMINI_API_KEY is not configured.", flush=True)
except Exception as e:
    print(f"[LLMProvider] Warning: Gemini initialization failed: {e}", flush=True)

from contextvars import ContextVar

active_agent_context = ContextVar("active_agent_context", default="UnknownAgent")
customer_id_context = ContextVar("customer_id_context", default="UnknownCustomer")

class SafeLLM:
    """
    A robust LLM wrapper that attempts to invoke the primary LLM (e.g. Gemini),
    and if it fails, falls back instantly to the fallback LLM (e.g. Groq) without
    raising any exception or breakpoint.
    """
    def __init__(self, primary_llm, fallback_llm, description="Gemini-to-Groq Failover Wrapper"):
        self.primary_llm = primary_llm
        self.fallback_llm = fallback_llm
        self.description = description

    def invoke(self, *args, **kwargs):
        if self.primary_llm:
            try:
                # Log the attempt to use the primary LLM
                print(f"[SafeLLM] Attempting invoke on primary LLM: {self.description}", flush=True)
                return self.primary_llm.invoke(*args, **kwargs)
            except Exception as primary_error:
                print(f"[SafeLLM] Primary LLM invoke failed: {primary_error}", flush=True)
                print(f"[SafeLLM] INSTANT FALLBACK TRIGGERED: Falling back to Groq instantly.", flush=True)
                
                # Capture failover in database audit log only
                try:
                    try:
                        from .database import create_governance_audit_log
                    except ImportError:
                        from database import create_governance_audit_log
                    agent_id = active_agent_context.get()
                    cust_id = customer_id_context.get()
                    
                    metadata = {
                        "primary_llm_description": self.description,
                        "primary_error": str(primary_error),
                        "customer_id": cust_id,
                        "fallback_triggered": True,
                        "fallback_llm": "Groq"
                    }
                    
                    create_governance_audit_log(
                        agent_id=agent_id,
                        action="LLM_PRIMARY_FAILOVER",
                        risk_score=0.0,
                        status="WARNING",
                        reason=f"Primary LLM ({self.description}) failed. Instant fallback to Groq triggered for customer {cust_id}.",
                        metadata=metadata
                    )
                except Exception as db_log_err:
                    print(f"[SafeLLM] Failed to write failover to audit log: {db_log_err}", flush=True)

                if self.fallback_llm:
                    try:
                        print(f"[SafeLLM] Attempting invoke on fallback LLM (Groq)...", flush=True)
                        return self.fallback_llm.invoke(*args, **kwargs)
                    except Exception as fallback_error:
                        print(f"[SafeLLM] Fallback LLM also failed: {fallback_error}", flush=True)
                        raise fallback_error
                else:
                    raise primary_error
        elif self.fallback_llm:
            print(f"[SafeLLM] Primary LLM not available. Using fallback LLM (Groq) directly.", flush=True)
            return self.fallback_llm.invoke(*args, **kwargs)
        else:
            raise ValueError("No LLM models are available in SafeLLM wrapper.")

    async def ainvoke(self, *args, **kwargs):
        if self.primary_llm:
            try:
                print(f"[SafeLLM] Attempting async invoke on primary LLM: {self.description}", flush=True)
                return await self.primary_llm.ainvoke(*args, **kwargs)
            except Exception as primary_error:
                print(f"[SafeLLM] Primary LLM async invoke failed: {primary_error}", flush=True)
                print(f"[SafeLLM] INSTANT FALLBACK TRIGGERED: Falling back to Groq instantly.", flush=True)
                
                # Capture failover in database audit log only
                try:
                    try:
                        from .database import create_governance_audit_log
                    except ImportError:
                        from database import create_governance_audit_log
                    agent_id = active_agent_context.get()
                    cust_id = customer_id_context.get()
                    
                    metadata = {
                        "primary_llm_description": self.description,
                        "primary_error": str(primary_error),
                        "customer_id": cust_id,
                        "fallback_triggered": True,
                        "fallback_llm": "Groq"
                    }
                    
                    create_governance_audit_log(
                        agent_id=agent_id,
                        action="LLM_PRIMARY_FAILOVER",
                        risk_score=0.0,
                        status="WARNING",
                        reason=f"Primary LLM ({self.description}) failed. Instant fallback to Groq triggered for customer {cust_id}.",
                        metadata=metadata
                    )
                except Exception as db_log_err:
                    print(f"[SafeLLM] Failed to write failover to audit log: {db_log_err}", flush=True)

                if self.fallback_llm:
                    try:
                        print(f"[SafeLLM] Attempting async invoke on fallback LLM (Groq)...", flush=True)
                        return await self.fallback_llm.ainvoke(*args, **kwargs)
                    except Exception as fallback_error:
                        print(f"[SafeLLM] Fallback LLM async invoke also failed: {fallback_error}", flush=True)
                        raise fallback_error
                else:
                    raise primary_error
        elif self.fallback_llm:
            print(f"[SafeLLM] Primary LLM not available. Using fallback LLM (Groq) directly.", flush=True)
            return await self.fallback_llm.ainvoke(*args, **kwargs)
        else:
            raise ValueError("No LLM models are available in SafeLLM wrapper.")

    def __getattr__(self, name):
        # Forward any other attributes to the primary LLM if possible, otherwise fallback
        if self.primary_llm and hasattr(self.primary_llm, name):
            return getattr(self.primary_llm, name)
        if self.fallback_llm and hasattr(self.fallback_llm, name):
            return getattr(self.fallback_llm, name)
        raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{name}'")


def get_llm(provider="gemini_flash"):
    """
    Retrieves the requested LLM provider with graceful runtime fallbacks.
    """
    if provider == "gemini_flash":
        if gemini_flash or llm:
            return SafeLLM(gemini_flash, llm, "Gemini Flash with Groq Fallback"), True
    elif provider == "gemini_pro":
        fallback = openai_llm if openai_llm else llm
        if gemini_pro or fallback:
            return SafeLLM(gemini_pro, fallback, "Gemini Pro with Fallback"), True
    elif provider == "openai" and openai_llm:
        return openai_llm, True
    elif provider == "groq" and llm:
        return llm, True
    
    # Global default fallback
    if gemini_flash or llm:
        return SafeLLM(gemini_flash, llm, "Global Default LLM"), (gemini_flash is not None or LLM_AVAILABLE)
    return None, False


