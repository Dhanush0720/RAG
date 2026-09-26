# LexiRAG — Multilingual Legal Intelligence Platform

AI-powered multilingual legal document summarization, chat, and review, built
on Retrieval-Augmented Generation (RAG), with a multilingual benchmark and a
bias/fairness auditing module. Supports English, Telugu, and Hindi.

This is a **working full-stack application** — real auth, real MongoDB
persistence, a real RAG pipeline (extraction → chunking → multilingual
embeddings → FAISS retrieval → grounded LLM generation with citations) — not
a static UI mockup. See `docs/architecture.md` for exactly what's fully
implemented vs. scaffolded (the deeper research-experiment framework and
OCR are intentionally left as clearly-marked scaffolds — see that doc before
assuming a feature is complete).

## 1. Features

- JWT auth with role-based access (student / legal_professional / admin); no self-assigned admin
- Drag-and-drop upload (PDF/DOCX/TXT) with live status tracking (uploaded → processing → indexed → failed)
- Document-grounded AI chat with page-level citations and a confidence indicator
- 7 summary types × 3 languages, always with source-page references
- AI-assisted clause/finding review (never claims a clause is "invalid" — only "requires further review")
- Cross-language bias & fairness audit with explicit, displayed limitations
- Multilingual benchmark evaluation (local FLORES-*style* sample dataset)
- Admin dashboard (user list, usage stats)
- Light/dark mode, responsive layout, loading/empty/error states throughout

## 2. Technology stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, lucide-react
- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Multer, express-rate-limit, helmet
- **AI service**: Python, FastAPI, sentence-transformers (multilingual), FAISS, PyMuPDF, python-docx, langdetect
- **LLM**: Gemini by default, or any OpenAI-compatible endpoint (OpenAI, Groq, local vLLM, etc.) via `LLM_PROVIDER`

## 3. Architecture

```
React Frontend → Node/Express Backend → MongoDB
                        |
                        └→ Python FastAPI AI Service → FAISS (per-document) → LLM API
```

Full detail in `docs/architecture.md`. API reference in `docs/api.md`.
Evaluation methodology and honest limitations in `docs/evaluation.md`.

## 4. Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB (local install or a free MongoDB Atlas cluster)
- An API key for Gemini **or** an OpenAI-compatible provider (chat, summarization, review, and audits won't work without one — everything else will)
- Outbound internet access (to download the multilingual embedding model on first run, and to call the LLM API)

## 5. Installation

### 5.1 MongoDB

Local:
```bash
# macOS (Homebrew)
brew install mongodb-community && brew services start mongodb-community
# or run via Docker
docker run -d -p 27017:27017 --name lexirag-mongo mongo:7
```
Or create a free cluster at MongoDB Atlas and copy its connection string.

### 5.2 Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET (any long random string), AI_SERVICE_TOKEN (pick a secret, must match ai-service/.env's INTERNAL_TOKEN)
npm install
npm run dev        # http://localhost:5000
```

### 5.3 AI service

```bash
cd ai-service
cp .env.example .env
# Edit .env:
#   INTERNAL_TOKEN must match backend/.env's AI_SERVICE_TOKEN
#   LLM_PROVIDER=gemini (default) and GEMINI_API_KEY=...
#   or LLM_PROVIDER=openai_compatible with OPENAI_COMPATIBLE_API_KEY=...
python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # http://localhost:8000
```

The first request that touches embeddings will download the
`paraphrase-multilingual-MiniLM-L12-v2` model from Hugging Face (a few
hundred MB) — this requires outbound internet access. In a
network-restricted environment, pre-download the model elsewhere and point
`EMBEDDING_MODEL` in `.env` at a local path.

### 5.4 Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev        # http://localhost:5173
```

Open `http://localhost:5173`, register an account, and upload a document.

### 5.5 Creating an admin account

Registration only allows `student` or `legal_professional` (by design — see
Security). To make a user an admin, update it directly in MongoDB after
registering normally:

```js
// mongosh
use lexirag
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## 6. Running with Docker (optional)

```bash
cp backend/.env.example backend/.env       # fill in secrets
cp ai-service/.env.example ai-service/.env # fill in secrets, matching AI_SERVICE_TOKEN/INTERNAL_TOKEN
docker compose up --build
```

Services: Mongo (`27017`), backend (`5000`), ai-service (`8000`), frontend (`5173`).

## 7. Environment variables

See `backend/.env.example` and `ai-service/.env.example` for the full,
commented list. Nothing is hardcoded — every secret and URL is read from
environment variables at runtime, and `.env` files are git-ignored.

## 8. Testing

```bash
# Backend
cd backend && npm test

# AI service (pure-logic tests — chunking, JSON parsing, language detection, metric calc)
cd ai-service && python3 tests/test_services.py
```

Both suites are verified passing in this repository. They cover the core
pure-logic pieces; they are a starting scaffold, not exhaustive coverage of
every endpoint (see "What's fully implemented vs. scaffolded" in
`docs/architecture.md`).

## 9. Running the application (quick checklist)

1. MongoDB running and reachable at `MONGO_URI`
2. `ai-service` running on port 8000 with a valid LLM API key
3. `backend` running on port 5000, `AI_SERVICE_TOKEN` matching `ai-service`'s `INTERNAL_TOKEN`
4. `frontend` running on port 5173, `VITE_API_BASE_URL` pointing at the backend
5. Register a user, upload a PDF/DOCX/TXT, wait for status to reach "indexed," then chat/summarize/review

## 10. Research limitations (summary)

- The multilingual benchmark is a local, hand-written FLORES-*style* sample — not the official FLORES dataset.
- Automatic metrics (`token_overlap_f1`) are a lexical proxy, not ROUGE/BLEU/BERTScore.
- The bias/fairness audit is an LLM-assisted heuristic comparison across languages for a single document at a time — not a peer-reviewed fairness metric, and not proof of bias by itself.
- Experiments A, B, D, F are scaffolded with clear "not yet wired" responses, not fabricated numbers.
- OCR for scanned PDFs is not implemented; such pages are flagged, not silently guessed.

Full detail: `docs/evaluation.md`.

## 11. Future improvements

- Wire experiments A/B/D/F to live documents
- Swap in FLORES-200 and standard metrics (ROUGE/BLEU/BERTScore)
- Add OCR (e.g. Tesseract) for scanned PDFs
- Add human-evaluation collection UI to complement automatic metrics
- Add GridFS or S3-backed storage instead of local disk for uploaded files
- Expand automated test coverage to controllers/routes with a test MongoDB instance
