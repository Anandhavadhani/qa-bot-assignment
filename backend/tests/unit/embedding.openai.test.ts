jest.setTimeout(10000);

describe('OpenAIEmbeddingService integration (mocked)', () => {
  it('uses OpenAI client when OPENAI_API_KEY is set', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    const mockEmbeddings = [[0.1, 0.2, 0.3]];

    jest.isolateModules(async () => {
      jest.doMock('openai', () => ({
        OpenAI: class {
          apiKey: string;
          constructor(opts: any) { this.apiKey = opts.apiKey; }
          embeddings = {
            create: async (_opts: any) => ({ data: _opts.input.map(() => ({ embedding: mockEmbeddings[0] })) }),
          };
        },
      }));

      const svcModule = require('../../src/services/embedding.service');
      const svc = svcModule.createEmbeddingService();
      const out = await svc.embedTexts(['x']);
      expect(out).toEqual([mockEmbeddings[0]]);
    });

    delete process.env.OPENAI_API_KEY;
  });
});
