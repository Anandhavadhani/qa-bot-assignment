import { getClient } from '../config/database';
import { logger } from '../utils/logger';

export class VectorRepository {
  // Insert embeddings for a chunk. Expects vectors as arrays of numbers.
  async insertEmbeddings(chunkId: string, vectors: number[][]): Promise<void> {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const insertText = `INSERT INTO embeddings (chunk_id, embedding_vector) VALUES ($1, $2)`;
      for (const vec of vectors) {
        // Represent vector as Postgres array-like string for pgvector
        const vecStr = '[' + vec.join(',') + ']';
        await client.query(insertText, [chunkId, vecStr]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Error inserting embeddings:', err);
      throw err;
    } finally {
      client.release();
    }
  }
}

export const vectorRepository = new VectorRepository();
