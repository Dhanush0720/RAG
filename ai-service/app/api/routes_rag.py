from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict

from app.api.deps import verify_internal_token
from app.services.document_processor import process_document
from app.services.retrieval_service import build_index, search
from app.services.llm_service import generate, LLMNotConfiguredError, LLMRequestError

router = APIRouter(prefix="/rag", tags=["rag"], dependencies=[Depends(verify_internal_token)])


class IngestRequest(BaseModel):
    documentId: str
    filePath: str
    fileType: str
    language: Optional[str] = "auto"


@router.post("/ingest")
def ingest(req: IngestRequest):
    try:
        result = process_document(req.filePath, req.fileType)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    build_index(req.documentId, result["chunks"])

    return {
        "pageCount": result["pageCount"],
        "detectedLanguage": result["detectedLanguage"],
        "chunks": result["chunks"],
    }


class HistoryTurn(BaseModel):
    role: str
    content: str


class QueryRequest(BaseModel):
    documentId: str
    question: str
    language: Optional[str] = "en"
    history: Optional[List[HistoryTurn]] = []


LANGUAGE_NAMES = {"en": "English", "te": "Telugu", "hi": "Hindi"}

RAG_SYSTEM = (
    "You are a careful legal-document assistant. You must answer using ONLY the "
    "'Retrieved evidence' provided below. Clearly distinguish: (1) information found "
    "in the document, (2) information NOT found in the document — say so explicitly, "
    "do not guess, and (3) general background knowledge — label it as such and keep it brief. "
    "Never invent citations. Structure your answer as:\n"
    "Answer:\n<direct response>\n\nSupporting Evidence:\n<cite page numbers you actually used>\n\n"
    "Limitations:\n<state clearly if evidence was insufficient or absent>"
)


@router.post("/query")
def query(req: QueryRequest):
    results = search(req.documentId, req.question)

    if not results:
        return {
            "answer": (
                "Answer:\nI could not find relevant information in this document to answer that question.\n\n"
                "Supporting Evidence:\nNone retrieved.\n\n"
                "Limitations:\nEither the document has not finished indexing, or it does not contain "
                "content related to this question."
            ),
            "citations": [],
            "confidence": "unsupported",
        }

    evidence_block = "\n\n".join(
        f"[Page {r.get('pageNumber')}, Chunk {r.get('chunkIndex')}] (relevance {r['score']:.2f})\n{r['content']}"
        for r in results
    )
    lang_name = LANGUAGE_NAMES.get(req.language, "English")

    history_block = ""
    if req.history:
        history_block = "\n".join(f"{h.role}: {h.content}" for h in req.history[-6:])

    prompt = (
        f"Conversation so far:\n{history_block}\n\n"
        f"Retrieved evidence:\n{evidence_block}\n\n"
        f"User question ({lang_name}): {req.question}\n\n"
        f"Respond in {lang_name}."
    )

    try:
        answer = generate(prompt, system=RAG_SYSTEM)
    except LLMNotConfiguredError as e:
        raise HTTPException(status_code=424, detail=str(e))
    except LLMRequestError as e:
        raise HTTPException(status_code=502, detail=str(e))

    citations = [
        {
            "documentName": None,
            "page": r.get("pageNumber"),
            "chunkIndex": r.get("chunkIndex"),
            "excerpt": r["content"][:220],
        }
        for r in results
    ]
    avg_score = sum(r["score"] for r in results) / len(results)
    confidence = "high" if avg_score > 0.6 else "medium" if avg_score > 0.35 else "low"

    return {"answer": answer, "citations": citations, "confidence": confidence}
