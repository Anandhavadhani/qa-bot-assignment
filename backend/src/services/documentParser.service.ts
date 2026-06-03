import path from 'path';
import { getDatabase } from '../config/database';
import { documentRepository } from '../repositories/document.repository';
import { parsePdf } from '../parsers/pdf.parser';
import { parseDocx } from '../parsers/docx.parser';
import { parseCsv } from '../parsers/csv.parser';
import { parseTxt } from '../parsers/txt.parser';
import { chunkText, chunkTextByTokens } from '../utils/chunker';
import { logger } from '../utils/logger';

export class DocumentParserService {
  private db = getDatabase();

  async parseDocument(documentId: string, filePath: string, fileType?: string): Promise<void> {
    try {
      await documentRepository.updateStatus(documentId, 'processing');

      const ext = fileType || path.extname(filePath).replace('.', '').toLowerCase();

      let fullText = '';
      let pageCount: number | undefined = undefined;

      if (ext === 'pdf') {
        const res = await parsePdf(filePath);
        fullText = res.text;
        pageCount = res.pageCount;
      } else if (ext === 'docx') {
        const res = await parseDocx(filePath);
        fullText = res.text;
      } else if (ext === 'csv') {
        const res = await parseCsv(filePath);
        fullText = res.text;
      } else {
        const res = await parseTxt(filePath);
        fullText = res.text;
      }

      // Choose chunking strategy: token-based (default) or char-based
      const chunkMode = (process.env.CHUNK_MODE || 'token').toLowerCase();
      let chunks: string[] = [];
      if (chunkMode === 'chars') {
        const maxChars = parseInt(process.env.PARSE_CHUNK_CHARS || '1500', 10);
        chunks = chunkText(fullText, maxChars);
      } else {
        const maxTokens = parseInt(process.env.PARSE_CHUNK_TOKENS || '750', 10);
        chunks = chunkTextByTokens(fullText, maxTokens);
      }

      // Insert chunks into document_chunks table
      const client = await this.db.connect();
      try {
        await client.query('BEGIN');
        const insertText = `
          INSERT INTO document_chunks (id, document_id, chunk_index, chunk_text, page_number, section_name, created_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
        `;

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          await client.query(insertText, [documentId, i, chunk, null, null]);
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      await documentRepository.updateStatus(documentId, 'completed', pageCount, chunks.length);
      logger.info(`Parsing completed for document ${documentId}: ${chunks.length} chunks`);
    } catch (error) {
      logger.error('Error parsing document:', error);
      try {
        await documentRepository.updateStatus(documentId, 'failed');
      } catch (e) {
        logger.error('Failed to mark document as failed:', e);
      }
    }
  }
}

export const documentParserService = new DocumentParserService();
