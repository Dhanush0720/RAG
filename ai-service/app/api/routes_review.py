from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import verify_internal_token
from app.services.review_service import generate_review
from app.services.llm_service import LLMNotConfiguredError, LLMRequestError

router = APIRouter(prefix="/review", tags=["review"], dependencies=[Depends(verify_internal_token)])


class ReviewRequest(BaseModel):
    documentId: str


@router.post("/generate")
def generate_review_route(req: ReviewRequest):
    try:
        result = generate_review(req.documentId)
    except LLMNotConfiguredError as e:
        raise HTTPException(status_code=424, detail=str(e))
    except LLMRequestError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return result
