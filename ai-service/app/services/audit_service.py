"""
Cross-language consistency audit: generates an equivalent-content summary in
each requested language for the same document, then asks the LLM to compare
them for factual consistency, omissions, and terminology, reporting metrics
per language plus explicit limitations. This is a heuristic, LLM-assisted
comparison, not a peer-reviewed fairness metric, and the output says so.
"""
from typing import Dict, List

from app.services.summary_service import generate_summary
from app.services.llm_service import generate

LANGUAGE_NAMES = {"en": "English", "te": "Telugu", "hi": "Hindi"}

LIMITATIONS = [
    "This audit uses LLM-assisted comparison of generated outputs, not a validated fairness metric from peer-reviewed literature.",
    "Differences between languages may stem from embedding quality, LLM training-data imbalance, or translation difficulty — not necessarily systemic bias.",
    "Results depend on the specific document and are not guaranteed to generalize across document types or languages not tested here.",
    "Sample size is a single document per run; conclusions should be validated across a larger benchmark before being treated as evidence of bias.",
]


def run_cross_language_audit(document_id: str, languages: List[str]) -> Dict:
    languages = [l for l in languages if l in LANGUAGE_NAMES] or ["en"]

    per_language_summaries = {}
    for lang in languages:
        result = generate_summary(document_id, "executive", lang, "medium")
        per_language_summaries[lang] = result["content"]

    comparison_block = "\n\n".join(
        f"--- {LANGUAGE_NAMES[l]} ({l}) ---\n{txt}" for l, txt in per_language_summaries.items()
    )

    system = (
        "You audit multilingual AI legal-document outputs for fairness. Compare the summaries below, "
        "which were generated from the SAME source document in different languages. For each language, "
        "estimate: factual_consistency_score (0-1, relative to the most complete summary), "
        "omitted_key_points (list of important points present in other languages but missing here), "
        "terminology_notes (any legal-terminology concerns). "
        "Do not claim proven bias — describe observed differences neutrally. "
        "Respond as strict JSON: {\"per_language\": {\"<lang>\": {\"factual_consistency_score\": float, "
        "\"omitted_key_points\": [str], \"terminology_notes\": str}}, \"overall_summary\": str}"
    )
    prompt = f"=== SUMMARIES TO COMPARE ===\n{comparison_block}\n=== END ==="

    try:
        raw = generate(prompt, system=system)
    except Exception as e:
        raw = None
        error = str(e)

    import json, re
    per_language_results = []
    overall = None
    if raw:
        cleaned = re.sub(r"^```(json)?|```$", "", raw.strip()).strip()
        try:
            parsed = json.loads(cleaned)
            overall = parsed.get("overall_summary")
            for lang in languages:
                entry = parsed.get("per_language", {}).get(lang, {})
                per_language_results.append({
                    "language": lang,
                    "findings": entry.get("omitted_key_points", []),
                    "metricValues": {
                        "factual_consistency_score": entry.get("factual_consistency_score"),
                        "terminology_notes": entry.get("terminology_notes"),
                        "summary_char_length": len(per_language_summaries[lang]),
                    },
                })
        except json.JSONDecodeError:
            overall = "Audit comparison could not be parsed as structured JSON; raw model output was retained in logs."
            for lang in languages:
                per_language_results.append({
                    "language": lang,
                    "findings": [],
                    "metricValues": {"summary_char_length": len(per_language_summaries[lang])},
                })
    else:
        overall = f"Audit could not run: {error}"
        for lang in languages:
            per_language_results.append({"language": lang, "findings": [], "metricValues": {}})

    return {"perLanguage": per_language_results, "summary": overall, "limitations": LIMITATIONS}
