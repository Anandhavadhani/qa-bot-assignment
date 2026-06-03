// User model
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Document model
export interface Document {
  id: string;
  userId: string;
  filename: string;
  fileType: 'pdf' | 'docx' | 'csv' | 'txt';
  fileSize: number;
  storagePath: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  pageCount?: number;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

// Document chunk model
export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  chunkText: string;
  pageNumber?: number;
  sectionName?: string;
  createdAt: Date;
}

// Embedding model
export interface Embedding {
  id: string;
  chunkId: string;
  embeddingVector: number[];
  createdAt: Date;
}

// Conversation model
export interface Conversation {
  id: string;
  userId: string;
  documentId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message model
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  tokensUsed?: number;
  processingTimeMs?: number;
  createdAt: Date;
}

// API Response envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Auth DTOs
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    userId: string;
    username: string;
    email: string;
  };
}
