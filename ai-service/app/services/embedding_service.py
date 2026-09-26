"""
Multilingual embedding generation. Uses a single sentence-transformers model
that supports English, Telugu, and Hindi (and 40+ other languages), so a
Telugu query can retrieve semantically relevant English or Hindi chunks and
vice versa.

NOTE: the model weights are downloaded from Hugging Face on first run and
require outbound internet access. In network-restricted environments,
pre-download the model and point EMBEDDING_MODEL at the local path.
"""
from functools import lru_cache
from typing import List
import numpy as np

from app.config import settings


@lru_cache(maxsize=1)
def get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(settings.EMBEDDING_MODEL)


def embed_texts(texts: List[str]) -> np.ndarray:
    model = get_model()
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return np.asarray(embeddings, dtype="float32")


def embed_query(text: str) -> np.ndarray:
    return embed_texts([text])[0]
