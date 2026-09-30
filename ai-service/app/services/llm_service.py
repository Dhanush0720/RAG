"""
Configurable LLM client. Supports Gemini and any OpenAI-compatible endpoint.

If no API key is configured, calls raise a clear, typed error rather than
silently returning fabricated text — callers (routes) turn this into a
529/424-style response so the frontend can show a real "AI not configured"
state instead of pretending the feature works.
"""
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings


class LLMNotConfiguredError(Exception):
    pass


class LLMRequestError(Exception):
    pass


@retry(stop=stop_after_attempt(4), wait=wait_exponential(multiplier=1.5, min=2, max=10), reraise=True)
def _call_gemini(prompt: str, system: str = "") -> str:
    if not settings.GEMINI_API_KEY:
        raise LLMNotConfiguredError(
            "GEMINI_API_KEY is not set. Add it to ai-service/.env to enable generation."
        )

    models_to_try = [settings.GEMINI_MODEL]
    for fallback in ["gemini-flash-latest", "gemini-3-flash-preview"]:
        if fallback not in models_to_try:
            models_to_try.append(fallback)

    last_error = None
    for model_name in models_to_try:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
        )
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        }
        if system:
            payload["systemInstruction"] = {"parts": [{"text": system}]}

        with httpx.Client(timeout=60) as client:
            resp = client.post(url, json=payload)

        if resp.status_code == 200:
            data = resp.json()
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                raise LLMRequestError("Unexpected Gemini response shape.")

        err_msg = ""
        try:
            err_data = resp.json().get("error", {})
            err_msg = err_data.get("message", "")
        except Exception:
            pass
        if not err_msg:
            err_msg = resp.text[:200]

        last_error = f"Gemini API ({resp.status_code}) on {model_name}: {err_msg}"
        if resp.status_code in (404, 429, 503):
            continue
        break

    raise LLMRequestError(last_error or "Failed to call Gemini API.")


@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1.5, min=2, max=12), reraise=True)
def _call_openai_compatible(prompt: str, system: str = "") -> str:
    if not settings.OPENAI_COMPATIBLE_API_KEY:
        raise LLMNotConfiguredError(
            "OPENAI_COMPATIBLE_API_KEY is not set. Add it to ai-service/.env to enable generation."
        )
    url = f"{settings.OPENAI_COMPATIBLE_BASE_URL}/chat/completions"
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    headers = {"Authorization": f"Bearer {settings.OPENAI_COMPATIBLE_API_KEY}"}
    payload = {"model": settings.OPENAI_COMPATIBLE_MODEL, "messages": messages, "temperature": 0.2}

    with httpx.Client(timeout=60) as client:
        resp = client.post(url, json=payload, headers=headers)
    if resp.status_code != 200:
        raise LLMRequestError(f"LLM API error {resp.status_code}: {resp.text[:300]}")
    data = resp.json()
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        raise LLMRequestError("Unexpected chat-completions response shape.")


def generate(prompt: str, system: str = "") -> str:
    if settings.LLM_PROVIDER == "gemini":
        return _call_gemini(prompt, system)
    if settings.LLM_PROVIDER == "openai_compatible":
        return _call_openai_compatible(prompt, system)
    raise LLMNotConfiguredError(f"Unknown LLM_PROVIDER: {settings.LLM_PROVIDER}")
