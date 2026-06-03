import { Response } from 'express';
import multer from 'multer';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { documentRepository } from '../repositories/document.repository';
import { validateFile, saveUploadedFile, deleteUploadedFile } from '../utils/upload';
import { logger } from '../utils/logger';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export class DocumentController {
  async uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const file = (req as any).file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file uploaded',
          },
        });
        return;
      }

      // Validate file
      const validation = await validateFile(file.originalname, file.size);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE',
            message: validation.error,
          },
        });
        return;
      }

      // Save file
      const uploadedFile = await saveUploadedFile(file.buffer, file.originalname);

      // Create document record
      const document = await documentRepository.create(
        req.userId,
        uploadedFile.originalName,
        uploadedFile.fileType,
        uploadedFile.size,
        uploadedFile.path,
      );

      logger.info(`Document uploaded by user ${req.userId}: ${document.id}`);

      // Enqueue parsing job for worker
      try {
        const { enqueueParseJob } = await import('../utils/queue');
        enqueueParseJob({ documentId: document.id, path: document.storagePath, fileType: document.fileType }).catch((err) => {
          logger.error('Failed to enqueue parse job:', err);
        });
      } catch (e) {
        logger.error('Queue module load error:', e);
      }

      res.status(201).json({
        success: true,
        data: document,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: errorMessage,
        },
      });
    }
  }

  async getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const limit = Math.min(parseInt((req.query.limit as string) || '50'), 100);
      const offset = parseInt((req.query.offset as string) || '0');

      const documents = await documentRepository.findByUserId(req.userId, limit, offset);
      const count = await documentRepository.getDocumentCount(req.userId);

      res.json({
        success: true,
        data: {
          documents,
          pagination: {
            limit,
            offset,
            total: count,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error('Get documents error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch documents',
        },
      });
    }
  }

  async getDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const { id } = req.params;
      const document = await documentRepository.findById(id, req.userId);

      if (!document) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Document not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: document,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error('Get document error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch document',
        },
      });
    }
  }

  async deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const { id } = req.params;

      // Get document to verify ownership and get filepath
      const document = await documentRepository.findById(id, req.userId);
      if (!document) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Document not found',
          },
        });
        return;
      }

      // Delete file from storage
      await deleteUploadedFile(document.storagePath);

      // Delete document record
      await documentRepository.delete(id, req.userId);

      logger.info(`Document deleted by user ${req.userId}: ${id}`);

      res.json({
        success: true,
        data: { message: 'Document deleted successfully' },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error('Delete document error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete document',
        },
      });
    }
  }

  async getStorageInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const count = await documentRepository.getDocumentCount(req.userId);
      const usedStorage = await documentRepository.getTotalStorageUsed(req.userId);
      const maxStorage = 5 * 1024 * 1024 * 1024; // 5GB

      res.json({
        success: true,
        data: {
          documentCount: count,
          usedStorage,
          maxStorage,
          percentageUsed: Math.round((usedStorage / maxStorage) * 100),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error('Get storage info error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to get storage information',
        },
      });
    }
  }
}

export const documentController = new DocumentController();
export const uploadMiddleware = upload.single('file');
