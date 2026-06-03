import path from 'path';

jest.mock('pdf-parse', () => ({
  __esModule: true,
  default: jest.fn(async (_buffer: Buffer) => ({ text: 'Mock PDF content', numpages: 2 })),
}));

import { parsePdf } from '../../src/parsers/pdf.parser';

describe('parsePdf', () => {
  it('parses pdf file and returns text and pageCount', async () => {
    const fixture = path.resolve(__dirname, '../fixtures/sample.pdf');
    const res = await parsePdf(fixture);
    expect(res.text).toContain('Mock PDF content');
    expect(res.pageCount).toBe(2);
  });
});
