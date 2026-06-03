import fs from 'fs/promises';
import mammoth from 'mammoth';

export async function parseDocx(filePath: string): Promise<{ text: string }> {
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value || '' };
}
