from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.api.deps import verify_internal_token
from app.services.evaluation_service import run_experiment
from app.services.audit_service import run_cross_language_audit
from app.services.llm_service import LLMNotConfiguredError, LLMRequestError

router = APIRouter(prefix="/evaluation", tags=["evaluation"], dependencies=[Depends(verify_internal_token)])


class EvaluationRequest(BaseModel):
    experimentName: str
    language: Optional[str] = None
    documentId: Optional[str] = None


@router.post("/run")
def run_evaluation_route(req: EvaluationRequest):
    try:
        result = run_experiment(req.experimentName, req.language, req.documentId)
    except LLMNotConfiguredError as e:
        raise HTTPException(status_code=424, detail=str(e))
    except LLMRequestError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return result


class AuditRequest(BaseModel):
    documentId: str
    languages: List[str] = ["en", "te", "hi"]
    auditType: str = "cross_language_consistency"


@router.post("/audit")
def run_audit_route(req: AuditRequest):
    result = run_cross_language_audit(req.documentId, req.languages)
    return result
