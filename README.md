# AI QA Bot

## Overview

A full-stack AI-powered QA Bot application built with Node.js, Express.js, and TypeScript on the backend, with a responsive single-file HTML frontend. Users can upload documents (PDF, DOCX, CSV, TXT) and ask questions about them using LangChain integrated with OpenAI, Anthropic, or Groq AI models.

## Architecture

### File Tree

```
├── src/
│   ├── types.ts              # Zod schemas and TypeScript types
│   ├── model.ts              # Model factory (getModel function)
│   ├── loaders.ts            # Document loaders with caching
│   ├── chain.ts              # QA chain build and run logic
│   ├── server.ts             # Express server and endpoints
│   ├── types.test.ts         # Zod schema tests
│   ├── model.test.ts         # Model factory tests
│   ├── loaders.test.ts       # Document loader tests
│   ├── chain.test.ts         # QA chain tests
│   └── server.test.ts        # Integration tests
├── index.html                # Single-file frontend
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vitest.config.ts          # Vitest configuration
└── README.md                 # This file
```

### Key Architecture Decisions

- **Single HTML Frontend**: All styles and scripts are inlined (no external dependencies)
- **TypeScript Strict Mode**: Enforce type safety across all modules
- **Dynamic Module Caching**: Loaders are imported on-demand and cached to optimize memory
- **Chain Caching by Prompt Type**: Each prompt type builds its chain only once
- **Centralized Environment Variables**: All env var reads are in `model.ts` and `server.ts`
- **Multer File Storage**: Uploads saved with timestamp + random suffix for uniqueness

## Setup Steps

### Prerequisites

- Node.js 16+ and npm

### Installation

1. **Clone or download the project:**
   ```bash
   cd qa-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory:

   ```bash
   # Choose ONE provider: openai, anthropic, or groq
   MODEL_PROVIDER=openai

   # API Keys (required for chosen provider)
   OPENAI_API_KEY=sk-...
   # OR
   ANTHROPIC_API_KEY=sk-ant-...
   # OR CLAUDE_API_KEY=sk-ant-...
   # OR
   GROQ_API_KEY=gsk-...

   # Optional: Set temperature (0-2, default 0.7)
   TEMPERATURE=0.7

   # Optional: Override default port
   PORT=3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## API Reference

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/` | GET | Serve HTML frontend | - | HTML page |
| `/health` | GET | Health check | - | `{ status, model, timestamp }` |
| `/search/document` | POST | Ask question over document text | `{ documentText, question, promptType? }` | `{ answer, model, responseTime, promptType }` |
| `/search/upload` | POST | Upload file and ask question | FormData: `files`, `question`, `promptType?` | `{ answer, model, responseTime, promptType }` |

### Request/Response Examples

**POST /search/document**
```json
{
  "documentText": "The Earth orbits the Sun...",
  "question": "How many planets are in our solar system?",
  "promptType": "concise"
}
```

Response:
```json
{
  "answer": "There are 8 planets in our solar system.",
  "model": "gpt-4-turbo",
  "responseTime": 1250,
  "promptType": "concise"
}
```

**POST /search/upload**
```
multipart/form-data:
- files: document.pdf
- question: What is the main topic?
- promptType: detailed
```

Response: Same as `/search/document`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MODEL_PROVIDER` | No | `openai` | Model provider: `openai`, `anthropic`, or `groq` |
| `OPENAI_API_KEY` | When provider=openai | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | When provider=anthropic | - | Anthropic API key |
| `CLAUDE_API_KEY` | When provider=anthropic | - | Alternative for Anthropic (fallback) |
| `GROQ_API_KEY` | When provider=groq | - | Groq API key |
| `TEMPERATURE` | No | `0.7` | Model temperature (0-2, float) |
| `PORT` | No | `3000` | Server port |

## How to Run Tests

### Run all tests
```bash
npm test
```

### Run tests once (CI mode)
```bash
npm run test:run
```

### Test Coverage

The test suite covers:
- **types.test.ts**: Zod schema validation for all endpoints
- **model.test.ts**: Model factory, API key validation, temperature bounds
- **loaders.test.ts**: File type detection, dynamic loader caching
- **chain.test.ts**: Chain building, caching per prompt type, error propagation
- **server.test.ts**: Endpoint validation, error handling (400, 413, 415, 500)

## Supported File Types

| Type | Extension | Parser | Max Size |
|------|-----------|--------|----------|
| PDF | `.pdf` | LangChain PDFLoader | 10MB |
| Word | `.docx`, `.doc` | LangChain DocxLoader | 10MB |
| CSV | `.csv` | LangChain CSVLoader | 10MB |
| Plain Text | `.txt` | fs/promises | 10MB |

## Prompt Types

| Type | Description | Use Case |
|------|-------------|----------|
| `default` | Accurate answers with citations | General questions, need sources |
| `detailed` | Comprehensive analysis with context | Complex topics, need nuance |
| `concise` | Brief direct answers | Quick facts, executive summary |
| `technical` | Depth and domain terminology | Technical documentation, deep dives |

## Optional Bonus Features

### Future Enhancements

1. **Chat History**: Store conversation history per session
2. **Rate Limiting**: Add rate limiting middleware for API endpoints
3. **User Authentication**: JWT-based user management
4. **Custom Models**: Support for local LLMs (Ollama, LlamaCPP)
5. **Document Embedding**: Vector store for semantic search over documents
6. **Web UI Enhancements**: 
   - Dark mode toggle
   - Code syntax highlighting in answers
   - Export results as PDF
7. **Batch Processing**: Upload multiple files and process them sequentially
8. **Model Comparison**: Run same question on multiple providers, compare responses
9. **Webhooks**: Async processing with webhook callbacks for long-running queries
10. **Docker Deployment**: Containerize with Docker for easy deployment

## Development

### Type Checking
```bash
npm run typecheck
```

### Build
```bash
npm run build
```

### Production Start
```bash
npm run start
```

## Error Handling

- **400 Bad Request**: Invalid request body, missing required fields, validation failed
- **413 Payload Too Large**: File exceeds 10MB limit
- **415 Unsupported Media Type**: File type not supported
- **500 Internal Server Error**: Server error or model processing error

All errors include a `requestId` for debugging and logging.

## Logging

Every request logs:
- Unique request ID (8-byte hex)
- ISO timestamp
- Question text
- Processing duration in milliseconds

Example:
```
[2024-06-23T10:15:30.123Z] [a1b2c3d4] Q: How many planets? (1250ms)
```

## Notes

- JSON request body limit: 50MB
- Upload directory auto-created at startup
- File uploads saved with timestamp + random suffix for uniqueness
- All 4 prompt types must be supported (default, detailed, concise, technical)
- No external stylesheets or scripts in frontend
- Zod validation on all API inputs
