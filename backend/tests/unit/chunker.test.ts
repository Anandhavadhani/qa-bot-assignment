import { chunkText } from '../../src/utils/chunker';

describe('chunkText', () => {
  it('returns empty array for empty input', () => {
    expect(chunkText('')).toEqual([]);
  });

  it('chunks short text into single chunk', () => {
    const text = 'Hello world. This is a short paragraph.';
    const chunks = chunkText(text, 1000);
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toContain('Hello world');
  });

  it('splits long paragraphs into multiple chunks', () => {
    const para = 'a'.repeat(5000);
    const chunks = chunkText(para, 1000);
    expect(chunks.length).toBeGreaterThanOrEqual(5);
    expect(chunks.every((c) => c.length <= 1000)).toBe(true);
  });
});
