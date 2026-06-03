import path from 'path';
import { parseTxt } from '../../src/parsers/txt.parser';

describe('parseTxt', () => {
  it('reads text file content', async () => {
    const fixture = path.resolve(__dirname, '../fixtures/sample.txt');
    const res = await parseTxt(fixture);
    expect(res.text).toContain('This is a sample text file for testing.');
  });
});
