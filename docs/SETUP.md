# QA Bot - Setup & Installation Guide

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 13+ ([Download](https://www.postgresql.org/))
- Redis 7+ ([Download](https://redis.io/)) or use Docker
- Docker & Docker Compose (Optional, for containerized setup)

## Quick Start with Docker

### 1. Clone Repository
```bash
cd d:\QA bot
```

### 2. Create .env file
```bash
cp backend\.env.example backend\.env
```

Edit `backend/.env` and add:
```
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here (optional)
GROQ_API_KEY=gsk-your-key-here (optional)
JWT_SECRET=your-super-secret-key-change-in-production
```

### 3. Start Services with Docker
```bash
docker-compose up --build
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Node.js backend on port 3000

### 4. Access the Application
- Backend API: http://localhost:3000/api
- Frontend: Open `frontend/index.html` in browser

---

## Manual Setup (Without Docker)

### 1. Setup PostgreSQL

#### Windows (Using PostgreSQL installer)
```powershell
# Ensure PostgreSQL service is running
# Default connection: postgresql://postgres:password@localhost:5432/qabot_db
```

#### Create Database
```bash
psql -U postgres -c "CREATE DATABASE qabot_db;"
psql -U postgres -d qabot_db -f scripts/init.sql
```

### 2. Setup Redis

#### Windows (Using Redis installer or WSL)
```bash
# If using WSL
wsl redis-server
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Create .env file
```bash
cp .env.example .env
```

Edit `.env` with your configuration (same as Docker setup above).

### 5. Start Backend
```bash
# Development mode (with hot reload)
npm run dev

# Or production build
npm run build
npm start
```

Backend will run on http://localhost:3000

### 6. Access Frontend
```bash
# Open in browser
frontend/index.html
```

Or use a simple HTTP server:
```bash
cd frontend
python -m http.server 8000
# Visit http://localhost:8000
```

---

## API Health Check

Test if backend is running:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-06-03T10:30:45.123Z",
    "uptime": 123.456
  }
}
```

---

## First-Time Setup Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running and accessible
- [ ] Redis running (or Docker container)
- [ ] `.env` file created with API keys
- [ ] Database initialized (`scripts/init.sql` executed)
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend starts without errors (`npm run dev`)
- [ ] Health check passes (`curl http://localhost:3000/api/health`)
- [ ] Frontend loads in browser (`frontend/index.html`)

---

## Testing

### Run Tests
```bash
# Unit tests
npm test

# With coverage
npm test:coverage

# Watch mode
npm test:watch
```

### Lint Code
```bash
# Check for errors
npm run lint

# Auto-fix
npm run lint:fix
```

### Format Code
```bash
npm run format
```

---

## Worker & Queue

The backend uses Redis lists as a lightweight job queue for parsing documents in the background. During development you can run the worker locally.

Run the worker (dev):
```bash
cd backend
npm run worker
```

Environment variables used by the worker:
- `REDIS_URL` — Redis connection string (default: `redis://localhost:6379`)
- `PARSE_WORKER_CONCURRENCY` — Number of worker loops to run (default: `2`)
- `PARSE_JOB_MAX_ATTEMPTS` — Retry count for failed parse jobs (default: `3`)

Enqueueing is automatic after file upload. To debug locally you can enqueue manually from a Node REPL:
```js
const { enqueueParseJob } = require('./backend/src/utils/queue');
enqueueParseJob({ documentId: 'your-id', path: '/path/to/file.pdf' });
```

## Integration Tests

Integration tests are located under `tests/integration/` and include:
- `documentParser.integration.test.ts` — parser service flow (DB mocked)
- `queue.integration.test.ts` — queue enqueue behavior (Redis mocked)

Run all tests including integration:
```bash
npm test
```


## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify database exists: `psql -l`

### Issue: "Redis connection failed"
**Solution:**
1. Start Redis: `redis-server` (or WSL)
2. Check `REDIS_URL` in `.env`
3. Test connection: `redis-cli ping`

### Issue: "OpenAI API key invalid"
**Solution:**
1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env`: `OPENAI_API_KEY=sk-...`
3. Restart backend

### Issue: "Port 3000 already in use"
**Solution:**
1. Kill process: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)
2. Or use different port: `PORT=3001 npm run dev`

### Issue: "Module not found" errors
**Solution:**
1. Delete `node_modules` and `package-lock.json`
2. Reinstall: `npm install`

---

## Development Workflow

### 1. Make Changes
- Edit TypeScript files in `backend/src/`
- Frontend changes in `frontend/`

### 2. Watch for Changes
```bash
# Backend auto-reloads with tsx watch
npm run dev
```

### 3. Test Changes
```bash
npm test
npm run lint
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Environment Variables Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NODE_ENV` | Yes | development | App environment |
| `PORT` | No | 3000 | Server port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection |
| `REDIS_URL` | Yes | - | Redis connection |
| `JWT_SECRET` | Yes | - | Token signing key |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | - | Anthropic fallback key |
| `CORS_ORIGIN` | No | http://localhost:3000 | CORS allowed origin |

---

## Next Steps

1. **Complete Phase 2**: Implement auth endpoints
2. **Test Manually**: Try registering and logging in
3. **Implement Phase 3**: Document upload functionality
4. **Continue Roadmap**: Follow the 12-phase implementation plan

---

## Support & Documentation

- API Documentation: [docs/API.md](API.md)
- Architecture Guide: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- Database Schema: [docs/DATABASE.md](DATABASE.md)
- Constraints: [docs/CONSTRAINTS.md](CONSTRAINTS.md)
