# QA Bot - API Documentation

## Base URL
```
Development:  http://localhost:3000/api
Production:   https://api.qabot.com/api
```

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

## Response Format
All API responses follow a standard envelope:

```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "error": null,
  "meta": {
    "timestamp": "2024-06-03T10:30:45.123Z",
    "requestId": "req-uuid-here",
    "version": "1.0"
  }
}
```

---

## Authentication Endpoints

### POST /auth/register

**Description:** Register a new user account

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-06-03T10:30:45.123Z"
  }
}
```

---

### POST /auth/login

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "userId": "uuid-here",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

---

### POST /auth/refresh-token

**Description:** Refresh expired access token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

## Document Management Endpoints

### POST /documents

**Description:** Upload a new document

**Request:** multipart/form-data
```
file: <binary file content>
```

**Supported Formats:** PDF, DOCX, CSV, TXT (Max sizes: 50MB, 25MB, 50MB, 50MB)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "documentId": "uuid-here",
    "filename": "report.pdf",
    "fileType": "pdf",
    "fileSize": 2048576,
    "processingStatus": "processing",
    "createdAt": "2024-06-03T10:30:45.123Z"
  }
}
```

---

### GET /documents

**Description:** List all documents uploaded by the user

**Query Parameters:**
```
page=1 (default: 1)
limit=20 (default: 20, max: 100)
sort=createdAt|filename|fileSize (default: createdAt)
order=asc|desc (default: desc)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "documentId": "uuid-1",
        "filename": "report.pdf",
        "fileType": "pdf",
        "fileSize": 2048576,
        "processingStatus": "completed",
        "createdAt": "2024-06-03T10:30:45.123Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

---

### DELETE /documents/:documentId

**Description:** Delete a document and its associated data

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Document deleted successfully",
    "documentId": "uuid-here"
  }
}
```

---

## Chat Endpoints

### POST /chat

**Description:** Submit a question about a document and receive an answer

**Request Body:**
```json
{
  "conversationId": "uuid-here",
  "question": "What are the main conclusions?",
  "contextChunks": 10
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "answer": "The main conclusions of the report are...",
    "citations": [
      {
        "chunkId": "chunk-12",
        "pageNumber": 8,
        "relevanceScore": 0.95
      }
    ],
    "tokensUsed": 450,
    "processingTimeMs": 1250
  }
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_INPUT | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | User not authorized for resource |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| SERVICE_ERROR | 500 | Internal server error |
