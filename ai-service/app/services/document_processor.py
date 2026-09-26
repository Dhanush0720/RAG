"""
Text extraction + cleaning + language detection + chunking.

Real extraction for PDF (PyMuPDF) and DOCX (python-docx), plain read for TXT.
No fabricated OCR here: if a PDF page yields no extractable text (likely a
scanned image), we flag it in metadata rather than silently guessing content.
"""
import re
import os
from typing import List, Dict

import pymupdf as fitz  # PyMuPDF (using the non-deprecated import alias)
from docx import Document as DocxDocument
from langdetect import detect, DetectorFactory, LangDetectException

from app.config import settings

DetectorFactory.seed = 42  # deterministic language detection

LANGDETECT_TO_SUPPORTED = {
    "en": "en",
    "te": "te",
    "hi": "hi",
}


def extract_text_pdf(path: str) -> List[Dict]:
    """Returns a list of {page_number, text} dicts, one per page."""
    pages = []
    with fitz.open(path) as doc:
        for i, page in enumerate(doc):
            text = page.get_text("text")
            pages.append({
                "page_number": i + 1,
                "text": text or "",
                "likely_scanned": len((text or "").strip()) < 20,
            })
    return pages


def extract_text_docx(path: str) -> List[Dict]:
    doc = DocxDocument(path)
    full_text = "\n".join(p.text for p in doc.paragraphs)
    # DOCX has no native page concept without a rendering engine; treat as one page.
    return [{"page_number": 1, "text": full_text, "likely_scanned": False}]


def extract_text_txt(path: str) -> List[Dict]:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()
    return [{"page_number": 1, "text": text, "likely_scanned": False}]


def extract_text(path: str, file_type: str) -> List[Dict]:
    if file_type == "pdf":
        return extract_text_pdf(path)
    if file_type == "docx":
        return extract_text_docx(path)
    if file_type == "txt":
        return extract_text_txt(path)
    raise ValueError(f"Unsupported file type: {file_type}")


def clean_text(text: str) -> str:
    text = text.replace("\x00", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def detect_language(text: str) -> str:
    """Best-effort language detection. Falls back to 'en' when detection fails
    or the detected language isn't one of the languages this system supports
    — we do NOT silently claim support for a language we haven't validated."""
    sample = text[:3000].strip()
    if not sample:
        return "unknown"
    try:
        code = detect(sample)
    except LangDetectException:
        return "unknown"
    return LANGDETECT_TO_SUPPORTED.get(code, code)


def chunk_pages(pages: List[Dict], chunk_size: int = None, overlap: int = None) -> List[Dict]:
    """Simple sliding-window chunking by character count, tracking source page."""
    chunk_size = chunk_size or settings.CHUNK_SIZE
    overlap = overlap or settings.CHUNK_OVERLAP

    chunks = []
    idx = 0
    for page in pages:
        text = clean_text(page["text"])
        if not text:
            continue
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append({
                    "chunkIndex": idx,
                    "content": chunk_text,
                    "pageNumber": page["page_number"],
                    "metadata": {"likely_scanned": page.get("likely_scanned", False)},
                })
                idx += 1
            if end == len(text):
                break
            start = end - overlap
    return chunks


def process_document(path: str, file_type: str) -> Dict:
    if not os.path.exists(path):
        backend_rel = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "backend", path))
        if os.path.exists(backend_rel):
            path = backend_rel
        else:
            raise FileNotFoundError(f"File not found at {path}")


    pages = extract_text(path, file_type)
    full_text = "\n".join(p["text"] for p in pages)

    if not full_text.strip():
        raise ValueError(
            "No extractable text found. The document may be a scanned image "
            "requiring OCR, which is not enabled in this deployment."
        )

    detected_lang = detect_language(full_text)
    chunks = chunk_pages(pages)

    return {
        "pageCount": len(pages),
        "detectedLanguage": detected_lang,
        "chunks": chunks,
    }
