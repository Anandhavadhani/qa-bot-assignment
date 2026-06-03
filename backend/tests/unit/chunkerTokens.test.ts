import { chunkTextByTokens } from '../../src/utils/chunker';

describe('chunkTextByTokens', () => {
  it('returns empty array for empty input', () => {
    expect(chunkTextByTokens('', 100)).toEqual([]);
  });

  it('chunks short text into a single token chunk', () => {
    const text = 'one two three four five';
    const chunks = chunkTextByTokens(text, 10);
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toBe(text);
  });

  it('splits by token count correctly', () => {
    const tokens = Array.from({ length: 5000 }, (_, i) => `t${i}`);
    const text = tokens.join(' ');
    const chunks = chunkTextByTokens(text, 750);
    expect(chunks.length).toBeGreaterThanOrEqual(6);
    // Ensure no chunk exceeds token limit
    expect(chunks.every((c) => c.split(/\s+/).filter(Boolean).length <= 750)).toBe(true);
  });
});
