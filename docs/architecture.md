# LexiRAG — Architecture

## System overview

```
React Frontend (Vite, Tailwind)
        |
        | REST (JWT-authenticated)
        ▼
Node.js + Express Backend  ── MongoDB (users, documents, chat, summaries, reviews, evaluation, audits)
        |
        | REST (internal shared-secret header)
        ▼
Python FastAPI AI Service  ── FAISS vector store (per-document, on disk)
        |
        | HTTPS
        ▼
LLM Provider (Gemini or any OpenAI-compatible endpoint)
```

## Why this split

- **Node/Express** owns everything that's really a CRUD + auth problem: users,
  document metadata, chat history, generated summaries/reviews, and
  evaluation/audit result storage. It never talks to the LLM or the vector
  store directly.
- **Python/FastAPI** owns everything that's really an ML problem: text
  extraction, chunking, embeddings, retrieval, prompting the LLM, and
  parsing/validating model output. It is **not** reachable from the browser —
  every request must carry the `X-Internal-Token` header that only the Node
  backend knows (`AI_SERVICE_TOKEN` / `INTERNAL_TOKEN`).
- **MongoDB** stores chunk *text* (for display, audit trail, and re-indexing)
  while **FAISS** stores chunk *vectors*, keyed by `documentId`. This keeps a
  clean separation and means retrieval never has to round-trip through Mongo.

## Data isolation

Every document, conversation, summary, and review is scoped to `userId` at
the Mongo query level (`Document.findOne({ _id, userId })`), and each FAISS
index is a **separate file per document** (`vector_store/<documentId>.faiss`).
A query against document A can structurally never return chunks from
document B — there's no shared index to leak across.

## RAG pipeline (implemented)

```
Upload → Extract (PyMuPDF/python-docx) → Clean → Detect language (langdetect)
       → Chunk (sliding window, configurable size/overlap)
       → Embed (multilingual sentence-transformers model)
       → FAISS index (cosine similarity via normalized inner product)

Query → Embed query → FAISS search (top-K) → Build evidence block
      → LLM call with a grounding system prompt → Answer + citations + confidence
```

The system prompt for `/rag/query` explicitly instructs the model to
distinguish "in the document" vs "not in the document" vs "general
background," and to say so when evidence is insufficient — this is enforced
by prompt design, not a separate classifier, so treat it as a strong
mitigation rather than a guarantee against hallucination.

## What's fully implemented vs. scaffolded

| Feature | Status |
|---|---|
| Auth, RBAC, document CRUD | Fully implemented |
| Upload → extract → chunk → embed → index | Fully implemented |
| RAG chat with citations | Fully implemented |
| Summarization (7 types, 3 languages) | Fully implemented |
| Clause/finding review | Fully implemented |
| Cross-language bias/fairness audit | Fully implemented (LLM-assisted heuristic — see limitations in `docs/evaluation.md`) |
| Benchmark evaluation — Experiment C (multilingual quality) | Fully implemented against a small local sample dataset |
| Benchmark evaluation — Experiments A, B, D, F | **Scaffolded only** — endpoints exist and return a clear "not wired" status row rather than fabricated numbers. See `docs/evaluation.md` for what's needed to complete each. |
| OCR for scanned PDFs | Not implemented — flagged per-page as `likely_scanned` instead of silently returning empty text |
| Docker Compose | Provided for all four services (Mongo, backend, ai-service, frontend) |

## Database ER summary

See the Mongoose schemas in `backend/src/models/`. Relationships:

```
User 1───* Document
Document 1───* DocumentChunk
Document 1───* Conversation 1───* Message
Document 1───* Summary
Document 1───* ReviewReport
Document 1───* EvaluationResult (documentId optional — benchmark runs aren't always tied to a doc)
Document 1───* AuditResult
```
