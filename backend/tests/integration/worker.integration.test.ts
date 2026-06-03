jest.setTimeout(10000);

describe('Parse Worker integration', () => {
  it('re-enqueues job on parse failure (attempts incremented)', async () => {
    const pushed: string[] = [];

    const mockClient = {
      on: jest.fn(),
      brPop: jest.fn(async () => ({ element: JSON.stringify({ documentId: 'w1', path: '/tmp/f1', fileType: 'txt', attempts: 0 }) })),
      lPush: jest.fn(async (_k: string, payload: string) => { pushed.push(payload); return 1; }),
      connect: jest.fn(async () => {}),
      disconnect: jest.fn(async () => {}),
    };

    jest.isolateModules(async () => {
      jest.doMock('redis', () => ({ createClient: () => mockClient }));

      const mockService = {
        parseDocument: jest.fn(async (_docId: string) => {
          // fail once to trigger retry
          throw new Error('parse failed');
        }),
      };

      jest.doMock('../../src/services/documentParser.service', () => ({ documentParserService: mockService }));

      const worker = require('../../src/workers/parseWorker');

      // Process one job
      await worker.processOneJob(1);

      // Should have re-enqueued with attempts = 1
      expect(mockClient.lPush).toHaveBeenCalled();
      const job = JSON.parse(pushed[0]);
      expect(job.documentId).toBe('w1');
      expect(job.attempts).toBe(1);

      jest.restoreAllMocks();
    });
  });

  it('processes multiple jobs concurrently when called multiple times', async () => {
    const calls: string[] = [];

    const mockClient = {
      on: jest.fn(),
      brPop: jest.fn()
        .mockResolvedValueOnce({ element: JSON.stringify({ documentId: 'c1', path: '/tmp/c1', fileType: 'txt' }) })
        .mockResolvedValueOnce({ element: JSON.stringify({ documentId: 'c2', path: '/tmp/c2', fileType: 'txt' }) }),
      lPush: jest.fn(async () => 1),
      connect: jest.fn(async () => {}),
      disconnect: jest.fn(async () => {}),
    };

    jest.isolateModules(async () => {
      jest.doMock('redis', () => ({ createClient: () => mockClient }));

      const mockService = {
        parseDocument: jest.fn(async (docId: string) => { calls.push(docId); return; }),
      };

      jest.doMock('../../src/services/documentParser.service', () => ({ documentParserService: mockService }));

      const worker = require('../../src/workers/parseWorker');

      // Simulate two workers processing one job each concurrently
      await Promise.all([worker.processOneJob(1), worker.processOneJob(2)]);

      expect(calls).toContain('c1');
      expect(calls).toContain('c2');

      jest.restoreAllMocks();
    });
  });
});
