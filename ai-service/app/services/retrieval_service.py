"""
Per-document FAISS vector store on local disk. Each document gets its own
index file, keyed by documentId, so there is never any cross-user or
cross-document leakage during retrieval — a query against document A
can only ever return chunks from document A.
"""
import os
import json
from typing import List, Dict

import numpy as np
import faiss

from app.config import settings
from app.services.embedding_service import embed_texts, embed_query

os.makedirs(settings.VECTOR_STORE_DIR, exist_ok=True)


def _index_path(document_id: str) -> str:
    return os.path.join(settings.VECTOR_STORE_DIR, f"{document_id}.faiss")


def _meta_path(document_id: str) -> str:
    return os.path.join(settings.VECTOR_STORE_DIR, f"{document_id}.meta.json")


def build_index(document_id: str, chunks: List[Dict]) -> None:
    """chunks: list of {chunkIndex, content, pageNumber, metadata}"""
    if not chunks:
        return
    texts = [c["content"] for c in chunks]
    vectors = embed_texts(texts)

    dim = vectors.shape[1]
    index = faiss.IndexFlatIP(dim)  # cosine similarity via normalized inner product
    index.add(vectors)

    faiss.write_index(index, _index_path(document_id))
    with open(_meta_path(document_id), "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False)


def has_index(document_id: str) -> bool:
    return os.path.exists(_index_path(document_id)) and os.path.exists(_meta_path(document_id))


def search(document_id: str, query: str, top_k: int = None) -> List[Dict]:
    top_k = top_k or settings.TOP_K
    if not has_index(document_id):
        return []

    index = faiss.read_index(_index_path(document_id))
    with open(_meta_path(document_id), "r", encoding="utf-8") as f:
        meta = json.load(f)

    q_vec = embed_query(query).reshape(1, -1)
    k = min(top_k, index.ntotal)
    if k == 0:
        return []
    scores, ids = index.search(q_vec, k)

    results = []
    for score, idx in zip(scores[0], ids[0]):
        if idx < 0 or idx >= len(meta):
            continue
        chunk = meta[idx]
        results.append({**chunk, "score": float(score)})
    return results
