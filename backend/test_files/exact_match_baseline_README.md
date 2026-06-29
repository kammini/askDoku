# Exact-match retrieval baseline (M4)

A reusable test set proving where **vector-only** retrieval fails on exact
identifier lookups, so we can later prove **hybrid search** fixes it.

## Files
- `exact_match_fixture.json` — 12 exact-match Q/A cases across 4 documents.
- `test_exact_match_retrieval.py` — runs the fixture through `retrieve_context`
  (pure vector search) and logs the top-5 chunks per question.
- `exact_match_results_baseline.json` — captured baseline output.

## Corpus (must be ingested before running)
- `the-pragmatic-programmer.pdf`
- `Working-Effectively-with-Legacy-Code.pdf`
- `turn-left-at-orion.pdf`
- `Stellenanzeige_15597_1.pdf` — CeiliX working-student job posting; lives only
  in the DB (not in `test_docs/` on disk), so its cases were written from the
  ingested chunks rather than a local file.

## Run
```
cd backend
python -m test_files.test_exact_match_retrieval
```
A case **PASSes** when the expected string appears in the top-5 chunks,
**FAILs** otherwise. Every expected answer is verified to exist in its source
document, so a FAIL is always a retrieval miss — never a missing answer.

## Baseline result: 9 PASS / 3 FAIL

This is intentionally a *mixed* baseline. An all-fail set can't catch
regressions; a mixed one proves hybrid search fixes the misses **without**
breaking what already works.

The 3 failures are the most important finding:

| Case | Failure mode |
|------|--------------|
| `legacy_isbn` | Query retrieved **the-pragmatic-programmer.pdf** front matter instead of the Legacy Code book. |
| `legacy_corporate_sales_phone` | Same — wrong document entirely. |
| `legacy_publisher_address` | Same — wrong document entirely. |

All three Legacy Code front-matter questions retrieve **The Pragmatic
Programmer's** near-identical boilerplate ("ISBN…", "publisher…", "sales…").
The two books' front matter is semantically almost identical, so the embedding
can't tell them apart — it never even reaches the correct document
(`correct_source_retrieved: false`). The exact identifier (the digits of the
ISBN, the toll-free number) is precisely the signal vector search discards and
a keyword/BM25 component would key on.

The PASSes are explained by the absence of that competition: `turn-left-at-orion`
is the only astronomy book (unique front matter), `Stellenanzeige_15597_1.pdf`
is the only job posting (unique vocabulary), and Pragmatic Programmer "wins" the
front-matter similarity contest against Legacy Code, so its own identifiers are
retrievable.

## M4 success criterion
Re-run this fixture against hybrid retrieval. Target: the 3 FAIL cases become
PASS (and `correct_source_retrieved` becomes true for them) while the 9 current
PASS cases stay green.
