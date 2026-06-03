# QA Bot - AI-Powered Question & Answer System

Intelligent document upload and Q&A system powered by LLMs (OpenAI, Anthropic, Groq).

## Features

✅ Multi-format document upload (PDF, DOCX, CSV, TXT)
✅ AI-powered question answering with citations
✅ Conversation history and management
✅ Vector embeddings for semantic search
✅ Multi-LLM support with fallback
✅ User authentication & authorization
✅ Real-time processing feedback
✅ Mobile-responsive UI

## Quick Start

### With Docker (Recommended)
```bash
docker-compose up --build
```

### Without Docker
```bash
cd backend
npm install
npm run dev

# In another terminal
open frontend/index.html
```

Visit http://localhost:3000 (backend) and frontend/index.html in browser.

## Architecture

- **Backend**: Express.js + TypeScript
- **Frontend**: HTML5 + Vanilla JavaScript
- **Database**: PostgreSQL + pgvector
- **Cache**: Redis
- **LLM**: LangChain + OpenAI/Anthropic/Groq
- **Embeddings**: OpenAI Embeddings

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [Constraints & Compliance](docs/CONSTRAINTS.md)

## Implementation Phases

1. ✅ Project Setup & Infrastructure
2. ⏳ Backend Foundation & Auth
3. ⏳ Document Management
4. ⏳ Parser Module
5. ⏳ Chunking Module
6. ⏳ Embedding Generation
7. ⏳ Vector Store
8. ⏳ Retrieval Module
9. ⏳ LangChain Integration
10. ⏳ Chat Endpoints
11. ⏳ Frontend
12. ⏳ Testing & Deployment

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Add API keys:
   - OPENAI_API_KEY
   - ANTHROPIC_API_KEY (optional)
   - GROQ_API_KEY (optional)
3. Update database and Redis URLs

## Testing

```bash
npm test              # Run all tests
npm test:watch       # Watch mode
npm test:coverage    # With coverage report
```

## Requirements

- Node.js 18+
- PostgreSQL 13+
- Redis 7+
- OpenAI API key (or Anthropic/Groq)

## License

MIT

## Support

For issues and questions, check the documentation in `/docs` directory.
