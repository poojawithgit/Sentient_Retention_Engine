import os
import unittest
from unittest.mock import MagicMock, patch
from langchain_core.messages import HumanMessage
import sys
from pathlib import Path

# Add core path to sys.path to allow clean imports
sys.path.append(str(Path(__file__).parent))

from llm_provider import SafeLLM


class TestLLMFailover(unittest.TestCase):
    """
    Validation Suite for SafeLLM Gemini-to-Groq Failover Mechanism.
    Following AAA (Arrange, Act, Assert) Pattern.
    """

    def setUp(self):
        # AAA: Arrange
        self.mock_primary = MagicMock()
        self.mock_fallback = MagicMock()
        
        # Setup mock return values
        self.mock_primary.invoke.return_value = MagicMock(content="Response from Gemini (Primary)")
        self.mock_fallback.invoke.return_value = MagicMock(content="Response from Groq (Fallback)")

    def test_successful_primary_invocation(self):
        """
        Verify that primary LLM (Gemini) is used when healthy.
        """
        # Arrange
        safe_llm = SafeLLM(
            primary_llm=self.mock_primary,
            fallback_llm=self.mock_fallback,
            description="Test Gemini-to-Groq Wrapper"
        )
        messages = [HumanMessage(content="Hello world")]

        # Act
        response = safe_llm.invoke(messages)

        # Assert
        self.assertEqual(response.content, "Response from Gemini (Primary)")
        self.mock_primary.invoke.assert_called_once_with(messages)
        self.mock_fallback.invoke.assert_not_called()

    def test_instant_fallback_on_primary_failure(self):
        """
        Verify that on primary LLM failure (e.g. rate limit, expired key, timeout),
        the wrapper catches the exception and falls back to Groq instantly.
        """
        # Arrange: Make primary LLM raise an exception (like APIError)
        self.mock_primary.invoke.side_effect = Exception("API Key Expired or Quota Exceeded")
        
        safe_llm = SafeLLM(
            primary_llm=self.mock_primary,
            fallback_llm=self.mock_fallback,
            description="Test Gemini-to-Groq Wrapper"
        )
        messages = [HumanMessage(content="Evaluate strategy risk")]

        # Act: Execute call (should complete seamlessly without throwing)
        try:
            response = safe_llm.invoke(messages)
        except Exception as e:
            self.fail(f"SafeLLM broke execution instead of handling the fallback gracefully: {e}")

        # Assert: Check that fallback was used and primary was called
        self.assertEqual(response.content, "Response from Groq (Fallback)")
        self.mock_primary.invoke.assert_called_once_with(messages)
        self.mock_fallback.invoke.assert_called_once_with(messages)

    def test_fallback_when_primary_is_missing(self):
        """
        Verify that if primary LLM is None (e.g., failed to initialize due to empty key),
        it bypasses primary and routes straight to fallback (Groq).
        """
        # Arrange: primary_llm is None
        safe_llm = SafeLLM(
            primary_llm=None,
            fallback_llm=self.mock_fallback,
            description="Test Gemini-to-Groq Wrapper"
        )
        messages = [HumanMessage(content="Analyze user sentiment")]

        # Act
        response = safe_llm.invoke(messages)

        # Assert
        self.assertEqual(response.content, "Response from Groq (Fallback)")
        self.mock_primary.invoke.assert_not_called()
        self.mock_fallback.invoke.assert_called_once_with(messages)

if __name__ == "__main__":
    unittest.main()
