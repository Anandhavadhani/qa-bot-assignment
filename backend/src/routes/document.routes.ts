import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { documentController, uploadMiddleware } from '../controllers/document.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/documents
 * Upload a new document
 * Requires: multipart/form-data with 'file' field
 * Response: Document object with status 'pending'
 */
router.post('/', uploadMiddleware, (req, res) => documentController.uploadDocument(req, res));

/**
 * GET /api/documents
 * Get all documents for current user
 * Query params: limit (default 50, max 100), offset (default 0)
 * Response: { documents: Document[], pagination: { limit, offset, total } }
 */
router.get('/', (req, res) => documentController.getDocuments(req, res));

/**
 * GET /api/documents/:id
 * Get a specific document by ID
 * Response: Document object
 */
router.get('/:id', (req, res) => documentController.getDocument(req, res));

/**
 * DELETE /api/documents/:id
 * Delete a document and its uploaded file
 * Response: { message: string }
 */
router.delete('/:id', (req, res) => documentController.deleteDocument(req, res));

/**
 * GET /api/documents/storage/info
 * Get storage usage information for current user
 * Response: { documentCount, usedStorage, maxStorage, percentageUsed }
 */
router.get('/storage/info', (req, res) => documentController.getStorageInfo(req, res));

export default router;
