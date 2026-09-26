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


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never leak internals (stack traces, file paths, API keys) to the client.
    return JSONResponse(status_code=500, content={"detail": "Internal AI service error."})
