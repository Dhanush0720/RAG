"""
Multilingual benchmark evaluation.

IMPORTANT (per project requirements): this uses a small LOCAL, FLORES-STYLE
dataset defined in app/data/benchmark_dev.json — it is NOT the official
FLORES dataset. It exists to demonstrate the evaluation workflow end-to-end;
for real research conclusions, swap in the official FLORES-200 (or a larger,
properly licensed legal-domain multilingual corpus).

Metrics implemented here are intentionally simple and clearly labeled:
- token_overlap_f1: a crude lexical-overlap proxy (NOT ROUGE/BLEU) so the
  evaluation runs with zero extra heavy dependencies out of the box.
- To get real ROUGE/BLEU/BERTScore, install `rouge-score`, `sacrebleu`, and
  `bert-score` and wire them in where marked below.
"""
import json
import os
from typing import Dict, List

from app.services.llm_service import generate

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "benchmark_dev.json")


def _load_benchmark() -> List[Dict]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _token_overlap_f1(a: str, b: str) -> float:
    ta, tb = set(a.lower().split()), set(b.lower().split())
    if not ta or not tb:
        return 0.0
    overlap = len(ta & tb)
    precision = overlap / len(tb)
    recall = overlap / len(ta)
    if precision + recall == 0:
        return 0.0
    return 2 * precision * recall / (precision + recall)


LANGUAGE_NAMES = {"en": "English", "te": "Telugu", "hi": "Hindi"}


def run_experiment(experiment_name: str, language: str = None, document_id: str = None) -> Dict:
    """
    Supports the six experiments from the spec at a working-scaffold level:
      A: baseline LLM vs RAG            -> B (needs a live document; see routes)
      B: retrieval performance x language -> requires an indexed document (routes layer)
      C: multilingual summary quality   -> uses benchmark translation task below
      D: hallucination/factuality       -> requires live document context (routes layer)
      E: output consistency / bias      -> delegates to audit_service
      F: embedding model comparison     -> requires re-indexing with alt model (not wired by default)

    This function implements C directly against the local benchmark, since it
    needs no document context. A/B/D/F are stubs that report a clear
    'not implemented in this scaffold' metric row rather than fabricating results.
    """
    if experiment_name == "C_multilingual_summary_quality":
        dataset = _load_benchmark()
        if language:
            dataset = [d for d in dataset if d["target_language"] == language]

        metrics = []
        for item in dataset:
            prompt = (
                f"Translate the following legal sentence into {LANGUAGE_NAMES.get(item['target_language'], item['target_language'])}, "
                f"preserving legal meaning precisely:\n\n{item['source_text']}"
            )
            try:
                model_output = generate(prompt, system="You are a precise legal translator.")
            except Exception as e:
                metrics.append({"name": f"error_{item['id']}", "value": 0.0, "method": str(e)})
                continue

            score = _token_overlap_f1(model_output, item["reference_translation"])
            metrics.append({
                "name": f"token_overlap_f1_{item['id']}",
                "value": round(score, 4),
                "method": "token_overlap_f1 (lexical proxy, not ROUGE/BLEU)",
            })

        if metrics:
            avg = sum(m["value"] for m in metrics) / len(metrics)
            metrics.append({"name": "average_token_overlap_f1", "value": round(avg, 4), "method": "mean of per-item scores"})
        return {"metrics": metrics}

    # A, B, D, F: scaffolded but not auto-runnable without a specific indexed
    # document + baseline-vs-RAG wiring. Report this honestly instead of faking numbers.
    return {
        "metrics": [{
            "name": f"{experiment_name}_status",
            "value": 0,
            "method": (
                "Not yet wired to a live experiment run in this scaffold. "
                "Extend app/services/evaluation_service.py to pull an indexed "
                "document via retrieval_service and compare against a baseline "
                "(no-RAG) LLM call for experiments A/B/D, or re-embed with an "
                "alternate model for F."
            ),
        }]
    }
