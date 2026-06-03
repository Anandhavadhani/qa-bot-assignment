import crypto from 'crypto';

export interface EmbeddingService {
  embedTexts(texts: string[]): Promise<number[][]>;
}

const DEFAULT_DIM = parseInt(process.env.EMBEDDING_DIM || '8', 10);

// Simple deterministic mock embedding generator (used when no external provider configured)
export class MockEmbeddingService implements EmbeddingService {
  dim: number;

  constructor(dim = DEFAULT_DIM) {
    this.dim = dim;
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.textToVector(t));
  }

  private textToVector(text: string): number[] {
    const hash = crypto.createHash('sha256').update(text).digest();
    const vec: number[] = [];
    for (let i = 0; i < this.dim; i++) {
      vec.push(hash[i % hash.length] / 255);
    }
    return vec;
  }
}

// OpenAI-backed embedding provider (uses dynamic require so tests without dependency still run)
export class OpenAIEmbeddingService implements EmbeddingService {
  client: any;
  model: string;

  constructor(apiKey: string, model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small') {
    this.model = model;
    // dynamic require to avoid hard dependency in test/dev where not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const OpenAI = require('openai').OpenAI || require('openai');
    this.client = new OpenAI({ apiKey });
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    // OpenAI embeddings API accepts single or batched inputs
    const res = await this.client.embeddings.create({ model: this.model, input: texts });
    // response shape: { data: [{ embedding: number[] }, ...] }
    return res.data.map((d: any) => d.embedding as number[]);
  }
}

// Factory: choose provider based on environment
export function createEmbeddingService(): EmbeddingService {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      return new OpenAIEmbeddingService(apiKey);
    } catch (err) {
      // If openai package not available or instantiation failed, fall back to mock
      // eslint-disable-next-line no-console
      console.warn('OpenAI client not available, falling back to MockEmbeddingService:', err);
      return new MockEmbeddingService();
    }
  }
  return new MockEmbeddingService();
}

export const embeddingService = createEmbeddingService();
