import fs from 'fs/promises';

export async function parseTxt(filePath: string): Promise<{ text: string }> {
  const data = await fs.readFile(filePath, 'utf-8');
  return { text: data };
}
