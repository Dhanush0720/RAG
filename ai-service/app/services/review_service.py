"""
Clause/finding extraction. Asks the LLM to return strict JSON matching the
ReviewReport schema so the Node backend can persist it directly. If the model
returns malformed JSON, we degrade gracefully rather than crash the request.
"""
import json
import re
from typing import Dict, List

from app.services.summary_service import _load_all_chunks
from app.services.llm_service import generate

CATEGORIES = [
    "Contract Parties", "Payment Terms", "Obligations", "Confidentiality",
    "Termination", "Liability", "Dispute Resolution", "Governing Law",
    "Important Dates", "Potentially Ambiguous Clauses",
]

REVIEW_SYSTEM = (
    "You are an AI-assisted legal document review tool, not a licensed attorney. "
    "You identify clauses and structure findings from the provided evidence ONLY. "
    "Never state that a clause is legally invalid. Use cautious language such as "
    "'Potentially unclear clause', 'Requires further review', 'The document states...'. "
    "If evidence for a category is absent, omit it rather than inventing content. "
    "Respond with STRICT JSON ONLY, no markdown fences, no commentary, matching this shape:\n"
    '{"findings": [{"title": str, "category": str (one of the allowed categories), '
    '"explanation": str, "sourcePage": int|null, "supportingText": str, '
    '"priority": "low"|"medium"|"high", "uncertain": bool}], '
    '"importantClauses": [str], "potentialIssues": [str]}'
)


def _extract_json(text: str) -> Dict:
    text = text.strip()
    text = re.sub(r"^```(json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
    return {"findings": [], "importantClauses": [], "potentialIssues": [], "parse_error": True}


def generate_review(document_id: str) -> Dict:
    chunks = _load_all_chunks(document_id)
    if not chunks:
        return {"findings": [], "importantClauses": [], "potentialIssues": [], "sourceReferences": []}

    max_chunks = 50
    step = max(1, len(chunks) // max_chunks)
    sample = chunks[::step][:max_chunks]

    evidence_block = "\n\n".join(
        f"[Page {c.get('pageNumber')}, Chunk {c.get('chunkIndex')}]\n{c['content']}" for c in sample
    )

    prompt = (
        f"Allowed categories: {', '.join(CATEGORIES)}\n\n"
        f"=== DOCUMENT EVIDENCE ===\n{evidence_block}\n=== END EVIDENCE ===\n\n"
        "Extract findings now as strict JSON per the schema in your system instructions."
    )

    raw = generate(prompt, system=REVIEW_SYSTEM)
    parsed = _extract_json(raw)

    findings = parsed.get("findings", [])
    # Defensive normalization in case the model deviates slightly from schema.
    clean_findings: List[Dict] = []
    for f in findings:
        if not isinstance(f, dict):
            continue
        category = f.get("category") if f.get("category") in CATEGORIES else "Potentially Ambiguous Clauses"
        clean_findings.append({
            "title": f.get("title", "Untitled finding"),
            "category": category,
            "explanation": f.get("explanation", ""),
            "sourcePage": f.get("sourcePage"),
            "supportingText": f.get("supportingText", ""),
            "priority": f.get("priority") if f.get("priority") in ("low", "medium", "high") else "medium",
            "uncertain": bool(f.get("uncertain", False)),
        })

    source_refs = sorted({c.get("pageNumber") for c in sample if c.get("pageNumber") is not None})

    return {
        "findings": clean_findings,
        "importantClauses": parsed.get("importantClauses", []),
        "potentialIssues": parsed.get("potentialIssues", []),
        "sourceReferences": [{"page": p} for p in source_refs],
    }
