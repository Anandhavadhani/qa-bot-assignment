# QA Bot

Minimal QA Bot scaffold (TypeScript + Express) that accepts document text or uploaded files and answers questions via a pluggable LLM provider.

Quick start

1. Install dependencies
```powershell
cd "d:\QA bot"
npm install
```
2. Copy `.env.example` to `.env` and fill API keys
3. Run dev server
```powershell
npm run dev
```
4. Open `http://localhost:3000` in your browser

Available endpoints
- `GET /` → serves the frontend
- `GET /health` → returns status and model info
- `POST /search/document` → JSON body `{ question, documentText?, documentPath?, promptType? }`
- `POST /search/upload` → multipart with `files` and `question`

Notes
- Uploads are saved to `uploads/` and deleted after processing unless `PRESERVE_UPLOADS=true`.
- Currently supported file loaders: `.txt`, `.csv`, `.pdf`, `.docx`.
- Model providers: `openai`, `anthropic` (configured via `MODEL_PROVIDER`).

Next steps
- Add LangChain prompt templates and chain caching (partially implemented).
- Add test suite for loaders and validation.
