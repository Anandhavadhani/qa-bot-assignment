# QA Bot - Business Rules, Constraints & Compliance

## Functional Constraints

### Document Management

**File Upload Constraints:**
```
Maximum file sizes:
├── PDF:  50 MB
├── DOCX: 25 MB
├── CSV:  50 MB
└── TXT:  50 MB

Minimum file size: 1 KB
Processing timeout: 5 minutes per document
Maximum documents per user:
├── Free tier:       10 documents
├── Pro tier:       100 documents
└── Enterprise:   Unlimited
```

### Document Processing

**Chunking Strategy:**
```
Default chunk size:     500 tokens
Minimum chunk size:     50 tokens
Maximum chunk size:    2000 tokens
Chunk overlap:         150 tokens (30% of chunk size)
```

### Q&A Operations

**Query Constraints:**
```
Question length:    1-2000 characters
Minimum length:     5 characters
Maximum length:     2000 characters

Context chunks:     Default 5, Max 15 per query
Relevance threshold: 0.6 (cosine similarity)
Response length:    200-2000 characters
Processing timeout: 30 seconds per query
```

**Answer Generation Rules:**
```
Temperature setting: 0.3-0.5 (consistency focus)
Max tokens: 500-1000 per response
Citation requirements:
├─ Minimum citations: 1 (if sources found)
├─ Maximum citations: 10
└─ Citation accuracy: >= 90%
```

### Conversation Management

**Conversation Limits:**
```
Maximum conversations per user:
├── Free tier:       20 conversations
├── Pro tier:       500 conversations
└── Enterprise:  Unlimited

Maximum messages per conversation:
├── Free tier:       100 messages
├── Pro tier:       1000 messages
└── Enterprise:  Unlimited
```

---

## Technical Constraints

### API Constraints

**Rate Limiting:**
```
Free tier:
├─ 100 requests/hour (global)
├─ 10 uploads/day
├─ 50 Q&A questions/day
└─ 5 concurrent requests

Pro tier:
├─ 1000 requests/hour
├─ 100 uploads/day
├─ 500 Q&A questions/day
└─ 20 concurrent requests
```

**Response Time Targets:**
```
├─ Authentication: < 100ms
├─ Document list: < 200ms
├─ Q&A query: < 2s
└─ Vector search: < 500ms
```

### Storage Constraints

**Maximum Storage per User:**
```
├── Free tier:        100 MB total
├── Pro tier:        5 GB total
├── Enterprise:    500 GB+ (custom)
```

### LLM API Constraints

**Token Limits:**
```
Maximum tokens per request:
├─ Input: 4000 tokens (for GPT-4)
├─ Output: 1000 tokens
├─ Total context: 8000 tokens (GPT-3.5) / 128K (GPT-4)
└─ Safety margin: 500 tokens reserved
```

**Fallback Strategy:**
```
Primary LLM: OpenAI (GPT-4)
Fallback LLM 1: Anthropic (Claude 3)
Fallback LLM 2: Groq (Mixtral - free)

Fallback triggers:
├─ Primary unavailable (> 5 consecutive failures)
├─ Response time > 30 seconds
└─ API key invalid
```

---

## Security Constraints

### Authentication & Authorization

**Password Security:**
```
Password requirements:
├─ Minimum length: 8 characters
├─ Must contain: Uppercase, number, special character
├─ Check against: 100K common passwords (rejected)
└─ Hashing: bcrypt with salt rounds = 12

Session management:
├─ Access token expiry: 1 hour
├─ Refresh token expiry: 7 days
├─ Max concurrent sessions: 5 per user
```

### Data Protection

**Encryption:**
```
In transit:
├─ Protocol: TLS 1.3 (minimum)
├─ Cipher suites: AES-256-GCM
└─ Certificate: Let's Encrypt (auto-renewal)

At rest:
├─ Database: AES-256 for PII (optional)
├─ File storage: Server-side encryption
└─ Backups: AES-256 encrypted
```

### API Security

**HTTP Security Headers:**
```
├─ Strict-Transport-Security: max-age=31536000
├─ X-Content-Type-Options: nosniff
├─ X-Frame-Options: DENY
└─ Content-Security-Policy: default-src 'self'
```

**CORS Policy:**
```
Allowed origins:
├─ Development: http://localhost:3000
├─ Production: https://app.qabot.com
└─ Wildcard: NOT allowed

Allowed methods: GET, POST, DELETE, OPTIONS
```

---

## Compliance & Legal

### GDPR Compliance

**Data Subject Rights:**
```
Right to access:
├─ Data export available: User can download all data
├─ Format: JSON or CSV
└─ Timeframe: 48 hours

Right to deletion:
├─ Soft delete: Immediate
├─ Hard delete: 30 days
└─ Verification: Email confirmation required

Data retention:
├─ Active data: Indefinite
├─ Deleted data: 30 days (soft), then hard delete
└─ Backups: 1 year
```

### CCPA Compliance

**Consumer Rights:**
```
├─ Know what's collected
├─ Delete collected data
├─ Opt-out of sale (not applicable - no selling)
└─ Non-discrimination: Equal pricing/service
```

### Terms of Service

**Acceptable Use:**
Users must not:
```
├─ Violate any laws
├─ Upload copyrighted material without authorization
├─ Use for illegal activities
├─ Exploit or attack the system
├─ Reverse engineer the service
└─ Distribute malware
```

---

## Performance Constraints

### Response Time SLAs

| Endpoint | Target Time |
|----------|------------|
| Auth endpoints | 100ms |
| List documents | 200ms |
| Upload (< 10MB) | 1s |
| Submit question | 2s |
| Get chat history | 500ms |

### Uptime & Availability

**SLA Targets:**
```
├─ Free tier:      99.0% uptime
├─ Pro tier:       99.5% uptime
└─ Enterprise:     99.99% uptime
```

---

## Cost Constraints

### Monthly Cost Targets

```
Infrastructure (AWS):
├─ Compute: $500/month
├─ Database: $300/month
├─ Storage: $100/month
├─ Vector DB: $200/month
└─ Total: ~$1100/month

Third-party APIs:
└─ LLM API: ~$0.01 per user/month (average)
```

### Revenue Model

**Free Tier:**
- Monthly cost to serve: $0.05
- Conversion target: 5-10% to Pro

**Pro Tier ($9.99/month):**
- Monthly cost to serve: $1.00
- Gross margin: 90%
- Breakeven: 640 users minimum

**Enterprise (custom):**
- Minimum: $99/month
- Gross margin: 85%+

---

## Success Criteria (Overall)

✅ All 12 phases complete and independently testable
✅ Code coverage > 80% (backend services)
✅ API response time < 2 seconds for Q&A
✅ Vector search < 500ms for 100K chunks
✅ Zero security vulnerabilities
✅ Documentation complete and accurate
✅ Deployable to production
✅ All tests passing
✅ Performance benchmarks met
✅ User can upload doc → ask question → get cited answer
