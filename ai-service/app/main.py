from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api import routes_rag, routes_summary, routes_review, routes_evaluation

app = FastAPI(
    title="LexiRAG AI Service",
    description="Multilingual legal RAG, summarization, review, and fairness auditing service.",
    version="1.0.0",
)

app.include_router(routes_rag.router)
app.include_router(routes_summary.router)
app.include_router(routes_review.router)
app.include_router(routes_evaluation.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "lexirag-ai-service"}


from app.services.llm_service import LLMRequestError, LLMNotConfiguredError


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, (LLMRequestError, LLMNotConfiguredError)):
        return JSONResponse(status_code=502, content={"detail": str(exc)})
    # Clean, safe error message without leaking sensitive credentials
    msg = str(exc) if str(exc) and not any(k in str(exc).lower() for k in ["api_key", "token", "secret"]) else "Internal AI service error."
    return JSONResponse(status_code=500, content={"detail": msg})

