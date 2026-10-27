# Run the legacy scorer

The existing Python CLI extracts PDF or DOCX content and uses OpenAI to produce a diagnostic report. It remains available while the reusable skill is developed. It sends application content to the configured model service; the target skill's local helpers have a different contract and do not call model endpoints.

## Set up with uv

From the repository root in PowerShell:

```powershell
uv venv
uv pip install -r requirements.txt
Copy-Item .env.example .env
```

Copy the example only when `.env` does not already exist. Set `OPENAI_API_KEY` in the ignored `.env` file. The CLI supports `OPENAI_MODEL` and a `--model` override. Keep input documents and reports in ignored directories.

## Analyze a document

```powershell
uv run --no-project python main.py private/cv.docx
uv run --no-project python main.py private/cv.pdf --job-description private/job.txt --language en
uv run --no-project python main.py private/cv.pdf --language de --output outputs/report.txt
```

Create the output directory first if necessary. `--job-description` (alias `--jd`) accepts a text-file path or literal offer text. `--language` (alias `--lang`) accepts `en`, `de` or `auto`. `--json` selects JSON-formatted report content, but the current CLI also prints progress messages, so redirected stdout is not a clean JSON-only stream.

## Interpret the results

The report includes extracted content, category scores and recommendations. Treat these as heuristic diagnostics. The repository has not established that the scores reproduce any proprietary ATS, that every recommendation improves hiring outcomes, or that a model's assessment of parsing matches a real recruiting system.

Review recommendations against the actual evidence before editing an application. Keyword insertion, unexplained gap penalties and generic credential advice should not become defaults merely because the legacy scorer proposes them. The migration retains useful extraction and review ideas while requiring explicit evidence and transparent rubrics.

For the replacement workflow, read [From private facts to a targeted application](application-workflow.md).
