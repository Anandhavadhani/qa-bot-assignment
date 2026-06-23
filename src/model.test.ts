import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getModel } from '../src/model';

describe('Model Factory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getModel()', () => {
    it('returns ChatOpenAI instance for openai provider', () => {
      process.env.MODEL_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.TEMPERATURE = '0.7';

      const model = getModel();
      expect(model.constructor.name).toBe('ChatOpenAI');
    });

    it('returns ChatAnthropic instance for anthropic provider', () => {
      process.env.MODEL_PROVIDER = 'anthropic';
      process.env.ANTHROPIC_API_KEY = 'test-key';
      process.env.TEMPERATURE = '0.7';

      const model = getModel();
      expect(model.constructor.name).toBe('ChatAnthropic');
    });

    it('returns ChatAnthropic with CLAUDE_API_KEY fallback', () => {
      process.env.MODEL_PROVIDER = 'anthropic';
      process.env.CLAUDE_API_KEY = 'test-key';
      process.env.TEMPERATURE = '0.7';

      const model = getModel();
      expect(model.constructor.name).toBe('ChatAnthropic');
    });

    it('returns ChatGroq instance for groq provider', () => {
      process.env.MODEL_PROVIDER = 'groq';
      process.env.GROQ_API_KEY = 'test-key';
      process.env.TEMPERATURE = '0.7';

      const model = getModel();
      expect(model.constructor.name).toBe('ChatGroq');
    });

    it('defaults to openai when MODEL_PROVIDER is not set', () => {
      delete process.env.MODEL_PROVIDER;
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.TEMPERATURE = '0.7';

      const model = getModel();
      expect(model.constructor.name).toBe('ChatOpenAI');
    });

    it('throws when OPENAI_API_KEY is missing', () => {
      process.env.MODEL_PROVIDER = 'openai';
      delete process.env.OPENAI_API_KEY;

      expect(() => getModel()).toThrow('OPENAI_API_KEY environment variable is required');
    });

    it('throws when ANTHROPIC_API_KEY and CLAUDE_API_KEY are missing', () => {
      process.env.MODEL_PROVIDER = 'anthropic';
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.CLAUDE_API_KEY;

      expect(() => getModel()).toThrow('ANTHROPIC_API_KEY or CLAUDE_API_KEY environment variable is required');
    });

    it('throws when GROQ_API_KEY is missing', () => {
      process.env.MODEL_PROVIDER = 'groq';
      delete process.env.GROQ_API_KEY;

      expect(() => getModel()).toThrow('GROQ_API_KEY environment variable is required');
    });

    it('throws when temperature is below 0', () => {
      process.env.MODEL_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.TEMPERATURE = '-0.1';

      expect(() => getModel()).toThrow('TEMPERATURE must be between 0 and 2');
    });

    it('throws when temperature is above 2', () => {
      process.env.MODEL_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.TEMPERATURE = '2.1';

      expect(() => getModel()).toThrow('TEMPERATURE must be between 0 and 2');
    });

    it('throws when temperature is not a valid number', () => {
      process.env.MODEL_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.TEMPERATURE = 'invalid';

      expect(() => getModel()).toThrow('TEMPERATURE');
    });

    it('accepts temperature at boundary 0', () => {
      process.env.MODEL_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.TEMPERATURE = '0';

      const model = getModel();
      expect(model).toBeDefined();
    });

    it('accepts temperature at boundary 2', () => {
      process.env.MODEL_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.TEMPERATURE = '2';

      const model = getModel();
      expect(model).toBeDefined();
    });

    it('defaults to temperature 0.7 when not set', () => {
      process.env.MODEL_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-key';
      delete process.env.TEMPERATURE;

      const model = getModel();
      expect(model).toBeDefined();
    });

    it('throws for unknown provider', () => {
      process.env.MODEL_PROVIDER = 'unknown';
      process.env.OPENAI_API_KEY = 'test-key';

      expect(() => getModel()).toThrow('Unknown MODEL_PROVIDER');
    });
  });
});
