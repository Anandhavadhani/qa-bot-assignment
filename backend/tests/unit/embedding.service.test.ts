import { MockEmbeddingService } from '../../src/services/embedding.service';

describe('MockEmbeddingService', () => {
  it('generates deterministic vectors of configured dimension', async () => {
    const svc = new MockEmbeddingService(4);
    const texts = ['hello', 'world'];
    const vecs = await svc.embedTexts(texts);
    expect(vecs.length).toBe(2);
    expect(vecs[0].length).toBe(4);
    expect(vecs[1].length).toBe(4);
    // Deterministic: calling again should yield same result
    const vecs2 = await svc.embedTexts(texts);
    expect(vecs).toEqual(vecs2);
  });
});
