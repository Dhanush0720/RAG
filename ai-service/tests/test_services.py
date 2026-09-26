import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.document_processor import clean_text, chunk_pages, detect_language
from app.services.review_service import _extract_json
from app.services.evaluation_service import _token_overlap_f1


def test_clean_text_collapses_whitespace():
    assert clean_text("a   b\n\n\n\nc") == "a b\n\nc"


def test_chunk_pages_respects_overlap():
    pages = [{"page_number": 1, "text": "x" * 1000, "likely_scanned": False}]
    chunks = chunk_pages(pages, chunk_size=100, overlap=20)
    assert len(chunks) > 1
    assert all(c["pageNumber"] == 1 for c in chunks)
    assert chunks[0]["chunkIndex"] == 0


def test_detect_language_english():
    lang = detect_language("This agreement is entered into by and between the parties on this date.")
    assert lang == "en"


def test_extract_json_handles_fenced_code_block():
    raw = '```json\n{"findings": [], "importantClauses": [], "potentialIssues": []}\n```'
    parsed = _extract_json(raw)
    assert parsed["findings"] == []


def test_extract_json_handles_malformed_gracefully():
    parsed = _extract_json("not json at all")
    assert parsed["parse_error"] is True


def test_token_overlap_f1_identical_strings():
    assert _token_overlap_f1("hello world", "hello world") == 1.0


def test_token_overlap_f1_no_overlap():
    assert _token_overlap_f1("hello world", "foo bar") == 0.0


if __name__ == "__main__":
    tests = [v for k, v in list(globals().items()) if k.startswith("test_")]
    failed = 0
    for t in tests:
        try:
            t()
            print(f"PASS: {t.__name__}")
        except AssertionError as e:
            failed += 1
            print(f"FAIL: {t.__name__}: {e}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
