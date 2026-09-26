# LexiRAG — API Reference

Base URL: `http://localhost:5000/api`
Auth: `Authorization: Bearer <JWT>` on every route except `/auth/register` and `/auth/login`.

## Auth

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password, role?, preferredLanguage? }` | `role` limited to `student` \| `legal_professional`; admin cannot be self-assigned |
| POST | `/auth/login` | `{ email, password }` | Returns `{ token, user }` |
| GET | `/auth/me` | — | Current user |

## Documents

| Method | Path | Notes |
|---|---|---|
| POST | `/documents/upload` | `multipart/form-data`: `file`, `title?`, `language?`. Kicks off async ingestion. |
| GET | `/documents` | List the caller's documents |
| GET | `/documents/:id` | Single document |
| GET | `/documents/:id/status` | Poll while `status` is `uploaded`/`processing` |
| DELETE | `/documents/:id` | Deletes file, chunks, and record |

## Chat

| Method | Path | Body |
|---|---|---|
| POST | `/chat/conversations` | `{ documentId, language? }` — document must be `indexed` |
| GET | `/chat/conversations` | List the caller's conversations |
| GET | `/chat/conversations/:id/messages` | Message history |
| POST | `/chat/message` | `{ conversationId, content, language? }` |
| DELETE | `/chat/conversations/:id` | Deletes conversation + messages |

## Summaries

| Method | Path | Body |
|---|---|---|
| POST | `/summaries/generate` | `{ documentId, summaryType, language?, length? }` |
| GET | `/summaries/:documentId` | List summaries for a document |

`summaryType` ∈ `executive`, `detailed`, `simple_language`, `key_clauses`, `obligations`, `risk_review`, `multilingual`.

## Reviews

| Method | Path | Body |
|---|---|---|
| POST | `/reviews/generate` | `{ documentId }` |
| GET | `/reviews/:documentId` | List review reports for a document |

## Evaluation

| Method | Path | Body | Access |
|---|---|---|---|
| POST | `/evaluation/run` | `{ experimentName, language?, documentId? }` | admin, legal_professional |
| GET | `/evaluation/results?experimentName=&language=` | — | any authenticated user |
| GET | `/evaluation/results/:id` | — | any authenticated user |

`experimentName` ∈ `C_multilingual_summary_quality` (fully runnable), `A_baseline_vs_rag`, `B_retrieval_by_language`, `D_hallucination_factuality`, `F_embedding_model_comparison` (all scaffolded — see `docs/evaluation.md`).

## Audits (bias & fairness)

| Method | Path | Body |
|---|---|---|
| POST | `/audits/run` | `{ documentId, languages?, auditType? }` |
| GET | `/audits/results?documentId=` | — |
| GET | `/audits/:id` | — |

## Admin

| Method | Path | Access |
|---|---|---|
| GET | `/admin/users` | admin only |
| GET | `/admin/statistics` | admin only |

## AI service (internal only — never call directly from the frontend)

Base URL: `http://localhost:8000` — every request requires `X-Internal-Token: <AI_SERVICE_TOKEN>`.

| Method | Path |
|---|---|
| POST | `/rag/ingest` |
| POST | `/rag/query` |
| POST | `/summary/generate` |
| POST | `/review/generate` |
| POST | `/evaluation/run` |
| POST | `/evaluation/audit` |
| GET | `/health` (no auth) |
