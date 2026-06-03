import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

export async function parsePdf(filePath: string): Promise<{ text: string; pageCount?: number }> {
  const data = await fs.readFile(filePath);
  const result = await pdfParse(data as Buffer);
  const text = result.text || '';
  const pageCount = (result.numpages as number) || undefined;
  return { text, pageCount };
}
