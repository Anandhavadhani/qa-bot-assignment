import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

export async function parseCsv(filePath: string): Promise<{ text: string }> {
  const data = await fs.readFile(filePath, 'utf-8');
  const records = parse(data, { columns: true, skip_empty_lines: true });
  // Convert rows to a readable text representation
  const lines = (records as any[]).map((row) => {
    return Object.entries(row)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
  });
  return { text: lines.join('\n') };
}
