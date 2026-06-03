jest.mock('../../src/config/database', () => ({
  getClient: jest.fn(),
}));

const { getClient } = require('../../src/config/database');
const { vectorRepository } = require('../../src/repositories/vector.repository');

describe('VectorRepository', () => {
  it('inserts embeddings in a transaction and releases client', async () => {
    const queries: Array<{ text: string; params?: any[] }> = [];
    const mockClient = {
      query: jest.fn(async (text: string, params?: any[]) => {
        queries.push({ text, params });
        if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK') return;
        return { rowCount: 1 };
      }),
      release: jest.fn(),
    };

    (getClient as jest.Mock).mockResolvedValue(mockClient);

    const vectors = [[0.1, 0.2], [0.3, 0.4]];
    await vectorRepository.insertEmbeddings('chunk-123', vectors);

    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
    // Expect BEGIN and COMMIT around inserts
    expect(queries[0].text).toBe('BEGIN');
    expect(queries[queries.length - 1].text).toBe('COMMIT');
  });
});
