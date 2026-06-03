export function chunkText(text: string, maxChars = 1000): string[] {
  if (!text) return [];

  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length <= maxChars) {
      current = current ? current + '\n\n' + para : para;
    } else {
      if (current) {
        chunks.push(current);
      }
      if (para.length <= maxChars) {
        current = para;
      } else {
        // para itself too big, split by chars
        for (let i = 0; i < para.length; i += maxChars) {
          chunks.push(para.slice(i, i + maxChars));
        }
        current = '';
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export function chunkTextByTokens(text: string, maxTokens = 750): string[] {
  if (!text) return [];

  // Naive tokenization: split on whitespace
  const tokens = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let currentTokens: string[] = [];

  for (const tok of tokens) {
    if (currentTokens.length + 1 <= maxTokens) {
      currentTokens.push(tok);
    } else {
      chunks.push(currentTokens.join(' '));
      currentTokens = [tok];
    }
  }

  if (currentTokens.length) chunks.push(currentTokens.join(' '));
  return chunks;
}
