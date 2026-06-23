import { describe, it, expect } from 'vitest';
import { InvokeSchema, FileUploadSchema, PromptTypeEnum } from '../src/types';

describe('Types', () => {
  describe('InvokeSchema', () => {
    it('accepts valid requests with all fields', () => {
      const valid = {
        documentText: 'This is a document.',
        question: 'What is this?',
        promptType: 'default',
      };
      const result = InvokeSchema.parse(valid);
      expect(result.documentText).toBe('This is a document.');
      expect(result.question).toBe('What is this?');
      expect(result.promptType).toBe('default');
    });

    it('defaults promptType to "default" when omitted', () => {
      const valid = {
        documentText: 'This is a document.',
        question: 'What is this?',
      };
      const result = InvokeSchema.parse(valid);
      expect(result.promptType).toBe('default');
    });

    it('rejects missing documentText', () => {
      const invalid = {
        question: 'What is this?',
        promptType: 'default',
      };
      expect(() => InvokeSchema.parse(invalid)).toThrow();
    });

    it('rejects missing question', () => {
      const invalid = {
        documentText: 'This is a document.',
        promptType: 'default',
      };
      expect(() => InvokeSchema.parse(invalid)).toThrow();
    });

    it('rejects invalid promptType', () => {
      const invalid = {
        documentText: 'This is a document.',
        question: 'What is this?',
        promptType: 'invalid',
      };
      expect(() => InvokeSchema.parse(invalid)).toThrow();
    });

    it('rejects empty documentText', () => {
      const invalid = {
        documentText: '',
        question: 'What is this?',
      };
      expect(() => InvokeSchema.parse(invalid)).toThrow();
    });

    it('rejects empty question', () => {
      const invalid = {
        documentText: 'This is a document.',
        question: '',
      };
      expect(() => InvokeSchema.parse(invalid)).toThrow();
    });
  });

  describe('FileUploadSchema', () => {
    it('accepts valid requests with all fields', () => {
      const valid = {
        filePath: '/path/to/file.pdf',
        question: 'What is this?',
        promptType: 'detailed',
      };
      const result = FileUploadSchema.parse(valid);
      expect(result.filePath).toBe('/path/to/file.pdf');
      expect(result.question).toBe('What is this?');
      expect(result.promptType).toBe('detailed');
    });

    it('defaults promptType to "default" when omitted', () => {
      const valid = {
        filePath: '/path/to/file.pdf',
        question: 'What is this?',
      };
      const result = FileUploadSchema.parse(valid);
      expect(result.promptType).toBe('default');
    });

    it('rejects missing filePath', () => {
      const invalid = {
        question: 'What is this?',
      };
      expect(() => FileUploadSchema.parse(invalid)).toThrow();
    });

    it('rejects missing question', () => {
      const invalid = {
        filePath: '/path/to/file.pdf',
      };
      expect(() => FileUploadSchema.parse(invalid)).toThrow();
    });

    it('rejects invalid promptType', () => {
      const invalid = {
        filePath: '/path/to/file.pdf',
        question: 'What is this?',
        promptType: 'unknown',
      };
      expect(() => FileUploadSchema.parse(invalid)).toThrow();
    });
  });

  describe('PromptTypeEnum', () => {
    it('includes all four required values', () => {
      expect(() => PromptTypeEnum.parse('default')).not.toThrow();
      expect(() => PromptTypeEnum.parse('detailed')).not.toThrow();
      expect(() => PromptTypeEnum.parse('concise')).not.toThrow();
      expect(() => PromptTypeEnum.parse('technical')).not.toThrow();
    });

    it('rejects invalid prompt types', () => {
      expect(() => PromptTypeEnum.parse('invalid')).toThrow();
      expect(() => PromptTypeEnum.parse('quick')).toThrow();
      expect(() => PromptTypeEnum.parse('')).toThrow();
    });
  });
});
