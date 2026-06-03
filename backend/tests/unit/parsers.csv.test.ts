import path from 'path';
import { parseCsv } from '../../src/parsers/csv.parser';

describe('parseCsv', () => {
  it('parses CSV into readable lines', async () => {
    const fixture = path.resolve(__dirname, '../fixtures/sample.csv');
    const res = await parseCsv(fixture);
    expect(res.text).toContain('name: Alice');
    expect(res.text).toContain('age: 30');
  });
});
