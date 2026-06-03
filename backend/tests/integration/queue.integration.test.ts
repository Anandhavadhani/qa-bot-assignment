const queue = require('../../src/utils/queue');

// Increase timeout for integration test
jest.setTimeout(10000);

// We'll spy on getRedisClient to return a mock client

describe('Queue integration', () => {
  it('enqueueParseJob calls lPush on redis client', async () => {
    const pushed: string[] = [];
    const mockClient = {
      on: jest.fn((_evt: string, _cb: (...args: any[]) => void) => {}),
      lPush: jest.fn(async (_key: string, payload: string) => {
        pushed.push(payload);
        return 1;
      }),
      connect: jest.fn(async () => {}),
      disconnect: jest.fn(async () => {}),
    };

    await new Promise<void>((resolve, reject) => {
      try {
        jest.isolateModules(async () => {
          jest.doMock('redis', () => ({ createClient: () => mockClient }));
          const q = require('../../src/utils/queue');
          await q.enqueueParseJob({ documentId: 'dq1', path: '/tmp/f.txt', fileType: 'txt' });
          expect(mockClient.lPush).toHaveBeenCalled();
          expect(pushed.length).toBe(1);
          const job = JSON.parse(pushed[0]);
          expect(job.documentId).toBe('dq1');
          await q.closeRedisClient();
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  });
});
