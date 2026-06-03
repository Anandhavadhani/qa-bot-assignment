import { Pool } from 'pg';
import { Document } from '../models';
import { getDatabase } from '../config/database';
import { logger } from '../utils/logger';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export class DocumentRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabase();
  }

  async create(
    userId: string,
    filename: string,
    fileType: string,
    fileSize: number,
    storagePath: string,
  ): Promise<Document> {
    const query = `
      INSERT INTO documents (
        id, user_id, filename, file_type, file_size, 
        storage_path, processing_status
      )
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'pending')
      RETURNING id, user_id, filename, file_type, file_size, 
                storage_path, processing_status, page_count, chunk_count, 
                created_at, updated_at, processed_at
    `;

    try {
      const result = await this.pool.query(query, [
        userId,
        filename,
        fileType,
        fileSize,
        storagePath,
      ]);
      const doc = result.rows[0];
      logger.info(`Document created: ${doc.id}`);

      return {
        id: doc.id,
        userId: doc.user_id,
        filename: doc.filename,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        storagePath: doc.storage_path,
        processingStatus: doc.processing_status,
        pageCount: doc.page_count,
        chunkCount: doc.chunk_count || 0,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        processedAt: doc.processed_at,
      };
    } catch (error) {
      logger.error('Error creating document:', error);
      throw error;
    }
  }

  async findById(id: string, userId?: string): Promise<Document | null> {
    let query = `
      SELECT id, user_id, filename, file_type, file_size, 
             storage_path, processing_status, page_count, chunk_count,
             created_at, updated_at, processed_at
      FROM documents
      WHERE id = $1
    `;

    const params: unknown[] = [id];

    if (userId) {
      query += ` AND user_id = $2`;
      params.push(userId);
    }

    try {
      const result = await this.pool.query(query, params);
      if (result.rows.length === 0) return null;

      const doc = result.rows[0];
      return {
        id: doc.id,
        userId: doc.user_id,
        filename: doc.filename,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        storagePath: doc.storage_path,
        processingStatus: doc.processing_status,
        pageCount: doc.page_count,
        chunkCount: doc.chunk_count || 0,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        processedAt: doc.processed_at,
      };
    } catch (error) {
      logger.error('Error finding document:', error);
      throw error;
    }
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<Document[]> {
    const query = `
      SELECT id, user_id, filename, file_type, file_size, 
             storage_path, processing_status, page_count, chunk_count,
             created_at, updated_at, processed_at
      FROM documents
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await this.pool.query(query, [userId, limit, offset]);
      return result.rows.map((doc) => ({
        id: doc.id,
        userId: doc.user_id,
        filename: doc.filename,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        storagePath: doc.storage_path,
        processingStatus: doc.processing_status,
        pageCount: doc.page_count,
        chunkCount: doc.chunk_count || 0,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        processedAt: doc.processed_at,
      }));
    } catch (error) {
      logger.error('Error finding documents by user:', error);
      throw error;
    }
  }

  async updateStatus(
    documentId: string,
    status: ProcessingStatus,
    pageCount?: number,
    chunkCount?: number,
  ): Promise<Document | null> {
    let query = `
      UPDATE documents
      SET processing_status = $1
    `;

    const params: unknown[] = [status, documentId];
    let paramIndex = 3;

    if (pageCount !== undefined) {
      query += `, page_count = $${paramIndex}`;
      params.push(pageCount);
      paramIndex++;
    }

    if (chunkCount !== undefined) {
      query += `, chunk_count = $${paramIndex}`;
      params.push(chunkCount);
      paramIndex++;
    }

    if (status === 'completed' || status === 'failed') {
      query += `, processed_at = NOW()`;
    }

    query += `, updated_at = NOW()
      WHERE id = $2
      RETURNING id, user_id, filename, file_type, file_size,
                storage_path, processing_status, page_count, chunk_count,
                created_at, updated_at, processed_at
    `;

    try {
      const result = await this.pool.query(query, params);
      if (result.rows.length === 0) return null;

      const doc = result.rows[0];
      logger.info(`Document status updated: ${documentId} -> ${status}`);

      return {
        id: doc.id,
        userId: doc.user_id,
        filename: doc.filename,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        storagePath: doc.storage_path,
        processingStatus: doc.processing_status,
        pageCount: doc.page_count,
        chunkCount: doc.chunk_count || 0,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        processedAt: doc.processed_at,
      };
    } catch (error) {
      logger.error('Error updating document status:', error);
      throw error;
    }
  }

  async delete(documentId: string, userId: string): Promise<boolean> {
    const query = `
      DELETE FROM documents
      WHERE id = $1 AND user_id = $2
    `;

    try {
      const result = await this.pool.query(query, [documentId, userId]);
      logger.info(`Document deleted: ${documentId}`);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      logger.error('Error deleting document:', error);
      throw error;
    }
  }

  async getDocumentCount(userId: string): Promise<number> {
    const query = `SELECT COUNT(*) FROM documents WHERE user_id = $1`;

    try {
      const result = await this.pool.query(query, [userId]);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error('Error getting document count:', error);
      throw error;
    }
  }

  async getTotalStorageUsed(userId: string): Promise<number> {
    const query = `SELECT COALESCE(SUM(file_size), 0) as total FROM documents WHERE user_id = $1`;

    try {
      const result = await this.pool.query(query, [userId]);
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      logger.error('Error getting storage used:', error);
      throw error;
    }
  }
}

export const documentRepository = new DocumentRepository();
