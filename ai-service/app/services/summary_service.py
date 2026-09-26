"""
Summarization built on top of retrieval: pulls a representative spread of
chunks across the whole document (not just top-K for one query) and asks the
LLM to summarize strictly from that evidence, in the requested language and
style, always citing page numbers and never inventing missing facts.
"""
import json
from typing import Dict, List

from app.services.retrieval_service import _meta_path
from app.services.llm_service import generate

SUMMARY_INSTRUCTIONS = {
    "executive": "Write a concise executive summary (5-8 sentences) covering purpose, parties, and key terms.",
    "detailed": "Write a detailed, structured summary covering all major sections of the document.",
    "simple_language": "Rewrite the document's meaning in plain, simple language a non-lawyer can understand.",
    "key_clauses": "List and explain only the most important clauses.",
    "obligations": "List every obligation of each party found in the document.",
    "risk_review": "Identify clauses that carry risk, ambiguity, or unfavorable terms for either party.",
    "multilingual": "Write the summary in the requested target language, preserving legal meaning and terminology.",
}

LANGUAGE_NAMES = {"en": "English", "te": "Telugu", "hi": "Hindi"}


def _load_all_chunks(document_id: str) -> List[Dict]:
    try:
        with open(_meta_path(document_id), "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def generate_summary(document_id: str, summary_type: str, language: str, length: str) -> Dict:
    chunks = _load_all_chunks(document_id)
    if not chunks:
        return {
            "content": "This document has not been indexed yet, so no summary can be generated.",
            "sourceReferences": [],
        }

    # Use a bounded sample of chunks (evenly spread) to keep prompts a reasonable size
    # while still covering the whole document rather than just its start.
    max_chunks = 40
    step = max(1, len(chunks) // max_chunks)
    sample = chunks[::step][:max_chunks]

    evidence_block = "\n\n".join(
        f"[Page {c.get('pageNumber')}, Chunk {c.get('chunkIndex')}]\n{c['content']}" for c in sample
    )

    instruction = SUMMARY_INSTRUCTIONS.get(summary_type, SUMMARY_INSTRUCTIONS["executive"])
    lang_name = LANGUAGE_NAMES.get(language, "English")

    system = (
        "You are a careful legal document summarization assistant. "
        "You must ONLY use facts present in the provided evidence. "
        "If a party, date, amount, or clause is not stated in the evidence, explicitly say it is not specified "
        "in the document rather than guessing or inventing it. "
        "Always end with a 'Source references' line listing the page numbers you drew from."
    )
    prompt = (
        f"Task: {instruction}\n"
        f"Target output language: {lang_name}\n"
        f"Desired length: {length}\n\n"
        f"=== DOCUMENT EVIDENCE ===\n{evidence_block}\n=== END EVIDENCE ===\n\n"
        f"Write the summary now, in {lang_name}."
    )

    content = generate(prompt, system=system)
    source_refs = sorted({c.get("pageNumber") for c in sample if c.get("pageNumber") is not None})

    return {"content": content, "sourceReferences": [{"page": p} for p in source_refs]}
