import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildChain, runChain } from '../src/chain';
import type { ChatOpenAI } from '@langchain/openai';
import type { ChatAnthropic } from '@langchain/anthropic';
import type { ChatGroq } from '@langchain/groq';

describe('QA Chain', () => {
  type LLMModel = ChatOpenAI | ChatAnthropic | ChatGroq;
  let mockModel: { invoke: (...args: unknown[]) => Promise<unknown> };

  beforeEach(() => {
    mockModel = {
      invoke: vi.fn(async () => ({ content: 'Mock response' })),
    };
  });

  describe('buildChain()', () => {
    it('builds chain for default prompt type', () => {
      const chain = buildChain(mockModel, 'default');
      expect(chain).toBeDefined();
    });

    it('builds chain for detailed prompt type', () => {
      const chain = buildChain(mockModel, 'detailed');
      expect(chain).toBeDefined();
    });

    it('builds chain for concise prompt type', () => {
      const chain = buildChain(mockModel, 'concise');
      expect(chain).toBeDefined();
    });

    it('builds chain for technical prompt type', () => {
      const chain = buildChain(mockModel, 'technical');
      expect(chain).toBeDefined();
    });

    it('returns all four prompt types without error', () => {
      const types = ['default', 'detailed', 'concise', 'technical'] as const;

      for (const type of types) {
        expect(() => buildChain(mockModel, type)).not.toThrow();
      }
    });

    it('caches chains by prompt type', () => {
      const chain1 = buildChain(mockModel, 'default');
      const chain2 = buildChain(mockModel, 'default');

      expect(chain1).toBe(chain2);
    });

    it('maintains separate caches for different prompt types', () => {
      const chain1 = buildChain(mockModel, 'default');
      const chain2 = buildChain(mockModel, 'detailed');

      expect(chain1).not.toBe(chain2);
    });
  });

  describe('runChain()', () => {
    it('invokes chain with document and question', async () => {
      const chain = buildChain(mockModel, 'default');
      const document = 'Test document';
      const question = 'Test question';

      await runChain(chain, document, question);

      expect(mockModel.invoke).toHaveBeenCalled();
    });

    it('returns string output', async () => {
      const mockStringModel = {
        invoke: vi.fn(async () => 'Test answer'),
      };

      const chain = buildChain(mockStringModel, 'default');
      const result = await runChain(chain, 'doc', 'q');

      expect(typeof result).toBe('string');
    });

    it('propagates errors from chain', async () => {
      const errorModel = {
        invoke: vi.fn(() => Promise.reject(new Error('Chain error'))),
      };

      const chain = buildChain(errorModel, 'default');

      await expect(runChain(chain, 'doc', 'q')).rejects.toThrow('Chain error');
    });

    it('handles different document contents', async () => {
      const chain = buildChain(mockModel, 'default');

      await runChain(chain, 'Short doc', 'Q1');
      await runChain(chain, 'Very long document with lots of content', 'Q2');

      expect(mockModel.invoke).toHaveBeenCalledTimes(2);
    });

    it('works with empty-like inputs', async () => {
      const chain = buildChain(mockModel, 'default');

      await expect(runChain(chain, '', '')).resolves.toBeDefined();
    });
  });

  describe('Chain prompts', () => {
    it('builds distinct chains with different system messages', () => {
      // Build all four types and verify they were created
      const defaultChain = buildChain(mockModel, 'default');
      const detailedChain = buildChain(mockModel, 'detailed');
      const conciseChain = buildChain(mockModel, 'concise');
      const technicalChain = buildChain(mockModel, 'technical');

      // Chains should exist and be distinct
      expect(defaultChain).toBeDefined();
      expect(detailedChain).toBeDefined();
      expect(conciseChain).toBeDefined();
      expect(technicalChain).toBeDefined();

      expect(defaultChain).not.toBe(detailedChain);
      expect(detailedChain).not.toBe(conciseChain);
      expect(conciseChain).not.toBe(technicalChain);
    });
  });
});
