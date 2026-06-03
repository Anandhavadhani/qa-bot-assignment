import path from 'path';

jest.mock('mammoth', () => ({
  __esModule: true,
  default: {
    extractRawText: jest.fn(async () => ({ value: 'Mock DOCX content' })),
  },
}));

import { parseDocx } from '../../src/parsers/docx.parser';

describe('parseDocx', () => {
  it('parses docx file and returns text', async () => {
    const fixture = path.resolve(__dirname, '../fixtures/sample.docx');
    const res = await parseDocx(fixture);
    expect(res.text).toContain('Mock DOCX content');
  });
});
