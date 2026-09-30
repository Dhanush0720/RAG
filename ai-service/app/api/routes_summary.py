from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict

from app.api.deps import verify_internal_token
from app.services.summary_service import generate_summary
from app.services.llm_service import LLMNotConfiguredError, LLMRequestError

router = APIRouter(prefix="/summary", tags=["summary"], dependencies=[Depends(verify_internal_token)])


class SummaryRequest(BaseModel):
    documentId: str
    summaryType: str = "executive"
    language: str = "en"
    length: str = "medium"
    chunks: Optional[List[Dict]] = None


@router.post("/generate")
def generate_summary_route(req: SummaryRequest):
    try:
        result = generate_summary(req.documentId, req.summaryType, req.language, req.length, chunks=req.chunks)
    except LLMNotConfiguredError as e:
        raise HTTPException(status_code=424, detail=str(e))
    except LLMRequestError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return result
