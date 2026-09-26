# LexiRAG — Evaluation Methodology & Research Limitations

## Multilingual benchmark (Experiment C)

- Dataset: `ai-service/app/data/benchmark_dev.json` — 3 hand-written sample
  items (English legal sentences with Telugu/Hindi reference translations).
  **This is explicitly a local, FLORES-*style* dataset, not the official
  FLORES-200 benchmark.** It exists to demonstrate the evaluation pipeline
  end-to-end. For real research results, replace it with FLORES-200 (or a
  larger, properly licensed legal-domain multilingual corpus) and update
  `evaluation_service._load_benchmark()` accordingly.
- Metric: `token_overlap_f1` — a simple lexical F1 over whitespace-tokenized
  words. This is **not** ROUGE, BLEU, or BERTScore. It's included so the
  evaluation loop runs with zero extra heavy dependencies out of the box.
  To get standard metrics, install `rouge-score`, `sacrebleu`, and/or
  `bert-score` and swap the scoring function in
  `ai-service/app/services/evaluation_service.py`.

## Experiments A, B, D, F — scaffolded, not implemented

The spec calls for six experiments. Only C is wired end-to-end without
additional context, because it needs no live document. A/B/D/F need a live
indexed document (or, for F, a second embedding model) and are structured as
clear stubs in `evaluation_service.run_experiment()` rather than faked:

- **A — Baseline LLM vs RAG**: needs a direct (non-retrieval) LLM call
  alongside the existing `/rag/query` call, on the same question, then a
  comparison metric (e.g. citation presence, factual overlap with retrieved
  chunks).
- **B — Retrieval performance across languages**: needs the same question
  asked in each supported language against the same document, comparing
  `retrieval_service.search()` scores and chunk overlap.
- **D — Hallucination & factuality**: needs an automatic check of whether
  claims in the RAG answer are entailed by the cited chunks (e.g. an NLI
  model or a second LLM-as-judge call).
- **F — Embedding model comparison**: needs re-indexing the same document
  with a second `EMBEDDING_MODEL` and comparing retrieval quality.

## Bias & fairness audit

`ai-service/app/services/audit_service.py` generates an executive summary of
the same document in each requested language, then asks the LLM to compare
them for factual consistency, omissions, and terminology and to score each
language 0–1 on `factual_consistency_score`.

**This is an LLM-assisted heuristic comparison, not a validated fairness
metric from peer-reviewed literature.** Concretely:

- A single document is not a representative sample; run across many
  documents per language pair before drawing conclusions.
- Differences may come from embedding quality, LLM training-data imbalance
  for that language, or genuine translation/legal-terminology difficulty —
  not necessarily systemic bias against a language.
- The "judge" here is the same class of LLM being audited, which is a known
  source of self-preference bias in LLM-as-judge setups. For rigorous
  research, pair this with human evaluation.

These limitations are also surfaced directly in the `/api/audits/run`
response and rendered in the Bias & Fairness page of the frontend, rather
than only living in this document.

## Citation & factuality approach

Every RAG answer is generated from retrieved chunks only, with page and
chunk-index citations attached mechanically from the retrieval results (not
generated freeform by the LLM), so a citation can't point to a page that
wasn't actually retrieved. `confidence` (`high`/`medium`/`low`) is derived
from the mean FAISS similarity score of the retrieved chunks — it is a proxy
for retrieval relevance, not a calibrated probability of correctness.
