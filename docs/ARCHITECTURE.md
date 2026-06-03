# QA Bot - System Architecture & Design

## 1. High-Level System Overview

The QA Bot is a full-stack AI-powered application that enables users to upload documents and ask intelligent questions about their content. The system leverages Large Language Models (LLMs) to provide context-aware, accurate answers with source citations.

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                    HTML5 + Vanilla JavaScript                    │
│          (Authentication, UI, Chat Interface, Storage)           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/WebSocket
┌──────────────────────────▼──────────────────────────────────────┐
│                    API GATEWAY LAYER                             │
│                 Express.js + TypeScript                          │
│        (Routing, Middleware, Request Validation)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌──────▼──────┐ ┌────────▼─────────┐
│  Auth Service  │ │  File Store  │ │  Vector Database │
│   (JWT/Auth)   │ │  (Local/S3)  │ │  (Embeddings)    │
└────────────────┘ └──────────────┘ └────────┬─────────┘
                                              │
        ┌─────────────────────────────────────┼────────────────┐
        │                                     │                │
┌───────▼──────────┐ ┌──────────────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ Document Parser  │ │   Database   │ │ LLM Service │ │ Embeddings  │
│ (PDF/DOCX/CSV)   │ │ (PostgreSQL) │ │  (LangChain)│ │ (LangChain) │
└──────────────────┘ └──────────────┘ └─────────────┘ └─────────────┘
```

## 2. Component Architecture

### 2.1 Backend Layer (Node.js + Express + TypeScript)

#### Core Modules

**Authentication Module**
- User registration and login
- JWT token generation and validation
- Token refresh mechanism
- Logout and session management

**Document Management Module**
- File upload handling
- File validation (type, size)
- Metadata extraction
- Document listing and deletion
- Version control

**Parser Engine**
- Unified interface for multiple file types
- PDF text extraction
- DOCX XML parsing
- CSV structured data handling
- TXT direct processing

**Embedding & Indexing Service**
- Document chunking (semantic preservation)
- Vector embedding generation
- Vector store management
- Similarity search operations
- Cache management

**Q&A Engine (Core Logic)**
- Query processing and normalization
- Context retrieval from vector store
- Prompt engineering
- LLM orchestration via LangChain
- Response parsing and validation
- Citation extraction

**Chat History Service**
- Conversation persistence
- Message storage and retrieval
- Pagination support
- Deletion and archival

#### Request Processing Flow

```
1. HTTP Request arrives
2. Middleware Stack
   ├── CORS validation
   ├── Authentication (JWT)
   ├── Input validation
   └── Request logging
3. Router dispatches to Controller
4. Controller delegates to Service Layer
5. Service Layer accesses Repository Layer
6. Repository Layer queries Database/External APIs
7. Response formatted and returned
8. Response Middleware
   ├── Compression (gzip)
   ├── Error formatting
   └── Logging
```

### 2.2 Frontend Layer (HTML5 + Vanilla JavaScript)

#### Page Structure

**Authentication Pages**
- `login.html` - User login interface
- `signup.html` - User registration interface
- Token management in localStorage/sessionStorage

**Main Application**
- `dashboard.html` - Document management interface
  - Upload interface with drag-and-drop
  - Document list with metadata
  - Search and filter options
  - Delete and manage documents

- `chat.html` - Q&A interface
  - Document selector
  - Chat message display
  - Input field with send button
  - Citation display with source links
  - Conversation history sidebar

## 3. Technology Stack Rationale

| Technology | Reason |
|-----------|--------|
| **Express.js** | Mature, large ecosystem, excellent LangChain integration |
| **TypeScript** | Type safety, better IDE support, easier refactoring |
| **PostgreSQL** | ACID compliance, relational data modeling, pgvector extension |
| **LangChain** | Vendor-agnostic LLM abstraction, built-in chains |
| **Vanilla JS** | No build complexity, minimal dependencies, fast load times |
| **Redis** | Fast caching, session storage, rate limiting |

## 4. Key Design Patterns

- **Repository Pattern**: Data access abstraction layer
- **Service Layer**: Business logic isolation
- **Middleware Stack**: Cross-cutting concerns
- **Error Handling**: Centralized error middleware
- **Logging**: Structured logging via Pino
- **Caching**: Multi-layer caching strategy
- **Rate Limiting**: Token bucket algorithm

## 5. Future Enhancements

- Real-time collaboration (WebSockets)
- Document annotation
- Multi-document queries
- Fine-tuning on user data
- Mobile app (React Native)
- Advanced analytics dashboard
- Integration with external data sources
