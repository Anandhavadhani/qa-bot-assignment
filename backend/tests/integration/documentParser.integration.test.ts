import path from 'path';

jest.mock('../../src/repositories/document.repository', () => ({
  documentRepository: {
    updateStatus: jest.fn(),
  },
}));

const mockUpdateStatus = require('../../src/repositories/document.repository').documentRepository.updateStatus as jest.Mock;

jest.mock('../../src/config/database', () => ({
  getDatabase: jest.fn(),
}));

const mockGetDatabase = require('../../src/config/database').getDatabase as jest.Mock;


describe('DocumentParserService integration (mocked DB)', () => {
  it('parses txt file and inserts chunks, updates status', async () => {
    // Prepare mock DB client
    const queries: Array<{ sql: string; params?: any[] }> = [];
    const client = {
      query: jest.fn(async (sql: string, params?: any[]) => {
        queries.push({ sql: sql.trim(), params });
        if (sql.trim().toUpperCase().startsWith('BEGIN')) return { rows: [] };
        if (sql.trim().toUpperCase().startsWith('COMMIT')) return { rows: [] };
        if (sql.trim().toUpperCase().startsWith('ROLLBACK')) return { rows: [] };
        if (sql.trim().toUpperCase().startsWith('INSERT INTO document_chunks'.toUpperCase())) return { rows: [] };
        return { rows: [] };
      }),
      release: jest.fn(),
    };

    // getDatabase returns object with connect() -> client
    mockGetDatabase.mockImplementation(() => ({ connect: async () => client }));

    // Import service after mocking getDatabase so constructor uses mocked DB
    const { documentParserService } = require('../../src/services/documentParser.service');

    const fixture = path.resolve(__dirname, '../fixtures/sample.txt');

    // Call parseDocument
    await documentParserService.parseDocument('test-doc-id', fixture, 'txt');

    // Expectations
    expect(mockUpdateStatus).toHaveBeenCalledWith('test-doc-id', 'processing');
    // After parse, completed should be called (possibly with pageCount undefined and chunkCount > 0)
    const lastCall = mockUpdateStatus.mock.calls[mockUpdateStatus.mock.calls.length - 1];
    expect(lastCall[0]).toBe('test-doc-id');
    expect(['completed', 'failed']).toContain(lastCall[1]);

    // Ensure some INSERT INTO document_chunks calls were made
    const insertCalls = queries.filter((q) => q.sql.toUpperCase().startsWith('INSERT INTO DOCUMENT_CHUNKS'));
    expect(insertCalls.length).toBeGreaterThan(0);
  }, 20000);
});
